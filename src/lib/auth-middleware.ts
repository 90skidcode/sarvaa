import { getApps } from "firebase-admin/app";
import { NextRequest, NextResponse } from "next/server";

// Initialize Firebase Admin (server-side)
if (getApps().length === 0) {
  // In production, use environment variables for service account
  // For now, we'll verify tokens using the client SDK
}

export async function verifyAuthToken(
  request: NextRequest,
): Promise<{ uid: string; phoneNumber: string } | null> {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split("Bearer ")[1];

    // In a real app, verify with Firebase Admin SDK
    // For now, we'll trust the token from localStorage
    // You should implement proper server-side verification

    return {
      uid: "verified-user",
      phoneNumber: "+91XXXXXXXXXX",
    };
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

export function requireAuth(
  handler: (request: NextRequest, user: any) => Promise<Response>,
) {
  return async (request: NextRequest) => {
    const user = await verifyAuthToken(request);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Please login to continue" },
        { status: 401 },
      );
    }

    return handler(request, user);
  };
}
