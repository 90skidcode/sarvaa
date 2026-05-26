import { db } from "@/lib/db";
import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const firebaseUid = request.headers.get("x-firebase-uid");

    if (!firebaseUid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user in User table by Firebase UID
    const user = await db.user.findUnique({
      where: { firebaseUid },
      select: { id: true, email: true, name: true, phone: true, phoneNumber: true, address: true }
    });

    // Also find user profile by Firebase UID
    const profile = await db.userProfile.findUnique({
      where: { firebaseUid },
    });

    if (!user && !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Merge data from both tables, preferring User table
    const mergedProfile = {
      id: user?.id,
      firebaseUid,
      name: user?.name || profile?.name || '',
      email: user?.email || profile?.email || '',
      phone: user?.phone || profile?.phone || '',
      phoneNumber: user?.phoneNumber || profile?.phoneNumber || '',
      address: user?.address || profile?.address || '',
    };

    return NextResponse.json({ profile: mergedProfile, user: mergedProfile });
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

      // SYNC: Ensure a record also exists in the User table
      await db.user.upsert({
        where: { firebaseUid },
        update: {
          name,
          email,
          phone: phoneNumber.replace("+91", ""),
          phoneNumber,
        },
        create: {
          firebaseUid,
          email: email || `${firebaseUid}@firebase.com`,
          name: name || "User",
          password: await hash(Math.random().toString(36), 10), // Dummy password
          phoneNumber,
          phone: phoneNumber.replace("+91", ""),
          role: "customer",
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

      // SYNC: Create a corresponding record in the User table
      await db.user.create({
        data: {
          firebaseUid,
          email: email || `${firebaseUid}@firebase.com`,
          name: name || "User",
          password: await hash(Math.random().toString(36), 10), // Dummy password
          phoneNumber,
          phone: phoneNumber.replace("+91", ""),
          role: "customer",
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
