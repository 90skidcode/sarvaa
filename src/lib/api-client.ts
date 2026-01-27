// Utility for making authenticated API calls

const AUTH_KEYS = {
  admin: {
    user: "adminUser",
    token: "adminToken",
  },
  customer: {
    user: "user",
    token: "authToken",
  },
};

function getStorageKeys() {
  if (typeof window === "undefined") return AUTH_KEYS.customer;

  // If we are in the admin portal, use admin keys
  if (window.location.pathname.startsWith("/admin")) {
    return AUTH_KEYS.admin;
  }

  return AUTH_KEYS.customer;
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const keys = getStorageKeys();
  const authToken = localStorage.getItem(keys.token);

  if (!authToken) {
    throw new Error("No authentication token found. Please login.");
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${authToken}`,
    "Content-Type": "application/json",
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem(keys.user);
    localStorage.removeItem(keys.token);

    // Redirect based on current context
    if (window.location.pathname.startsWith("/admin")) {
      window.location.href = "/admin/login";
    } else {
      window.location.href = "/login";
    }
    throw new Error("Session expired. Please login again.");
  }

  return response;
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;

  const keys = getStorageKeys();
  const authToken = localStorage.getItem(keys.token);
  const user = localStorage.getItem(keys.user);

  return !!(authToken && user);
}

export function getCurrentUser() {
  if (typeof window === "undefined") return null;

  const keys = getStorageKeys();
  const userStr = localStorage.getItem(keys.user);
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function logout() {
  if (typeof window === "undefined") return;

  const keys = getStorageKeys();
  localStorage.removeItem(keys.user);
  localStorage.removeItem(keys.token);

  if (window.location.pathname.startsWith("/admin")) {
    window.location.href = "/admin/login";
  } else {
    window.location.href = "/login";
  }
}
