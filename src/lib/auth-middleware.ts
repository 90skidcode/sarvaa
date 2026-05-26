import { adminAuth } from "@/lib/firebase-admin";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export interface AuthUser {
  uid: string;
  phoneNumber: string | null;
  dbUserId: string | null;
  role: string;
}

/**
 * Verify Firebase ID token from the Authorization header.
 * Returns the decoded user info or null if invalid/missing.
 */
export async function verifyAuthToken(
  request: NextRequest
): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const idToken = authHeader.split("Bearer ")[1];
    if (!idToken) return null;

    // Verify the Firebase ID token server-side
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // Look up the database user by Firebase UID
    const dbUser = await db.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
      select: { id: true, role: true },
    });

    return {
      uid: decodedToken.uid,
      phoneNumber: decodedToken.phone_number || null,
      dbUserId: dbUser?.id || null,
      role: dbUser?.role || "customer",
    };
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

/**
 * Middleware wrapper that requires a valid Firebase token.
 */
export function requireAuth(
  handler: (request: NextRequest, user: AuthUser) => Promise<Response>
) {
  return async (request: NextRequest) => {
    const user = await verifyAuthToken(request);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Please login to continue" },
        { status: 401 }
      );
    }

    return handler(request, user);
  };
}

/**
 * Middleware wrapper that requires admin role.
 */
export function requireAdmin(
  handler: (request: NextRequest, user: AuthUser) => Promise<Response>
) {
  return async (request: NextRequest) => {
    const user = await verifyAuthToken(request);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Please login to continue" },
        { status: 401 }
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden", message: "Admin access required" },
        { status: 403 }
      );
    }

    return handler(request, user);
  };
}
