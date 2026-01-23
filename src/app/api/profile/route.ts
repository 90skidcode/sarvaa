import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const firebaseUid = request.headers.get("x-firebase-uid");

    if (!firebaseUid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user profile by Firebase UID
    const profile = await db.userProfile.findUnique({
      where: { firebaseUid },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const firebaseUid = request.headers.get("x-firebase-uid");
    const phoneNumber = request.headers.get("x-phone-number");

    if (!firebaseUid || !phoneNumber) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, address } = body;

    // Find or create user profile
    let profile = await db.userProfile.findUnique({
      where: { firebaseUid },
    });

    if (profile) {
      // Update existing profile
      profile = await db.userProfile.update({
        where: { firebaseUid },
        data: {
          name,
          email,
          address,
        },
      });
    } else {
      // Create new profile for Firebase user
      profile = await db.userProfile.create({
        data: {
          firebaseUid,
          phoneNumber,
          phone: phoneNumber.replace("+91", ""),
          name,
          email,
          address,
        },
      });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
