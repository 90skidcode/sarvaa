const PHONEPE_CLIENT_ID = process.env.PHONEPE_CLIENT_ID;
const PHONEPE_CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET;
const PHONEPE_ENV = process.env.PHONEPE_ENV || "UAT";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

interface PhonePeConfig {
  baseUrl: string;
  tokenUrl: string;
}

const getPhonePeConfig = (): PhonePeConfig => {
  if (PHONEPE_ENV === "PRODUCTION") {
    return {
      baseUrl: "https://api.phonepe.com/apis/pg",
      tokenUrl: "https://api.phonepe.com/apis/pg/v1/oauth/token",
    };
  }
  return {
    baseUrl: "https://api-preprod.phonepe.com/apis/pg-sandbox",
    tokenUrl: "https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token",
  };
};

interface CachedToken {
  token: string;
  expiresAt: number;
}

let cachedToken: CachedToken | null = null;

export async function getPhonePeAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const config = getPhonePeConfig();

  // PhonePe OAuth 2.0 token request
  const params = new URLSearchParams({
    client_id: PHONEPE_CLIENT_ID || "",
    client_secret: PHONEPE_CLIENT_SECRET || "",
    grant_type: "client_credentials",
    client_version: "1.0",
  });

  console.log(`Fetching PhonePe token from: ${config.tokenUrl}`);

  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`PhonePe token error (${response.status}): ${error}`);
    throw new Error(`Failed to get PhonePe access token: ${error}`);
  }

  const data = await response.json();
  const token = data.access_token;
  const expiresIn = data.expires_in || 1800; // Default 30 minutes

  // Cache token with 5-minute buffer before expiry
  cachedToken = {
    token,
    expiresAt: Date.now() + (expiresIn - 300) * 1000,
  };

  console.log(`PhonePe token obtained, expires in ${expiresIn}s`);
  return token;
}

export async function initiatePhonePePayment(
  merchantOrderId: string,
  amountInPaise: number,
  redirectUrl: string
): Promise<string> {
  const token = await getPhonePeAccessToken();
  const config = getPhonePeConfig();

  const payload = {
    merchantOrderId,
    amount: amountInPaise,
    expireAfter: 1200, // 20 minutes
    paymentFlow: {
      type: "PG_CHECKOUT",
      message: `Payment for Sarvaa order ${merchantOrderId}`,
      merchantUrls: {
        redirectUrl,
      },
    },
    disablePaymentRetry: false,
  };

  console.log(`Initiating payment to: ${config.baseUrl}/checkout/v2/pay`);

  const response = await fetch(`${config.baseUrl}/checkout/v2/pay`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `O-Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`PhonePe payment error (${response.status}): ${error}`);
    throw new Error(`Failed to initiate PhonePe payment: ${error}`);
  }

  const data = await response.json();

  if (!data.success || !data.data?.redirectUrl) {
    console.error(`PhonePe response:`, data);
    throw new Error(
      `PhonePe payment initiation failed: ${data.message || "Unknown error"}`
    );
  }

  return data.data.redirectUrl;
}

interface PhonePeOrderStatus {
  state: string;
  amount: number;
  paymentDetails?: Record<string, unknown>;
}

export async function getPhonePeOrderStatus(
  merchantOrderId: string
): Promise<PhonePeOrderStatus> {
  const token = await getPhonePeAccessToken();
  const config = getPhonePeConfig();

  const response = await fetch(
    `${config.baseUrl}/checkout/v2/status/${merchantOrderId}`,
    {
      method: "GET",
      headers: {
        Authorization: `O-Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error(`PhonePe status error (${response.status}): ${error}`);
    throw new Error(`Failed to get PhonePe order status: ${error}`);
  }

  const data = await response.json();

  if (!data.success) {
    console.error(`PhonePe status response:`, data);
    throw new Error(
      `PhonePe status check failed: ${data.message || "Unknown error"}`
    );
  }

  return {
    state: data.data?.state || "PENDING",
    amount: data.data?.amount || 0,
    paymentDetails: data.data?.paymentDetails,
  };
}
