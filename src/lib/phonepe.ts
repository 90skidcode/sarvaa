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
      tokenUrl: "https://api.phonepe.com/apis/identity-manager/v1/oauth/token",
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
    console.log("Using cached PhonePe token");
    return cachedToken.token;
  }

  const config = getPhonePeConfig();

  // PhonePe OAuth 2.0 token request (tested and working in Postman)
  const params = new URLSearchParams({
    client_id: PHONEPE_CLIENT_ID || "",
    client_secret: PHONEPE_CLIENT_SECRET || "",
    grant_type: "client_credentials",
    client_version: "1",
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
  const expiresIn = data.expires_in || 3600;

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
): Promise<{ redirectUrl: string; orderId: string }> {
  const token = await getPhonePeAccessToken();
  const config = getPhonePeConfig();

  const payload = {
    merchantOrderId,
    amount: amountInPaise,
    expireAfter: 1200,
    paymentFlow: {
      type: "PG_CHECKOUT",
      message: `Payment for Sarvaa order ${merchantOrderId}`,
      merchantUrls: {
        redirectUrl,
      },
    },
    disablePaymentRetry: false,
  };

  console.log(`Initiating PhonePe payment to: ${config.baseUrl}/checkout/v2/pay`);

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

  if (!data.redirectUrl) {
    console.error(`PhonePe response:`, data);
    throw new Error(
      `PhonePe payment initiation failed: ${data.message || "No redirect URL received"}`
    );
  }

  console.log(`PhonePe redirect URL obtained, orderId: ${data.orderId}`);
  return {
    redirectUrl: data.redirectUrl,
    orderId: data.orderId,
  };
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

  console.log(`Checking PhonePe order status for merchantOrderId: ${merchantOrderId}`);

  // PhonePe correct endpoint: /checkout/v2/order/{merchantOrderId}/status
  const statusUrl = `${config.baseUrl}/checkout/v2/order/${encodeURIComponent(merchantOrderId)}/status?details=false&errorContext=true`;
  console.log(`Fetching status from: ${statusUrl}`);

  const response = await fetch(statusUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `O-Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`PhonePe status error (${response.status}): ${error}`);
    throw new Error(`Failed to get PhonePe order status: ${error}`);
  }

  const data = await response.json();

  console.log(`PhonePe status response:`, data);

  // Handle nested data structure or flat structure
  const statusData = data.data || data;
  const state = statusData.state || data.state || "PENDING";

  if (!state) {
    console.error(`PhonePe status response - no state found:`, data);
    throw new Error(
      `PhonePe status check failed: ${data.message || "No state in response"}`
    );
  }

  return {
    state,
    amount: statusData.amount || data.amount || 0,
    paymentDetails: statusData.paymentDetails || data.paymentDetails,
  };
}
