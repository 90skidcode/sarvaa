// Utility for making authenticated API calls

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // Get auth token from localStorage
  const authToken = localStorage.getItem("authToken");

  if (!authToken) {
    throw new Error("No authentication token found. Please login.");
  }

  // Add authorization header
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${authToken}`,
    "Content-Type": "application/json",
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized
  if (response.status === 401) {
    // Clear local storage and redirect to login
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    window.location.href = "/login";
    throw new Error("Session expired. Please login again.");
  }

  return response;
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;

  const authToken = localStorage.getItem("authToken");
  const user = localStorage.getItem("user");

  return !!(authToken && user);
}

// Get current user from localStorage
export function getCurrentUser() {
  if (typeof window === "undefined") return null;

  const userStr = localStorage.getItem("user");
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

// Logout user
export function logout() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("user");
  localStorage.removeItem("authToken");
  window.location.href = "/login";
}
