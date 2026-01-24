import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET all customers from UserProfile
export async function GET() {
  try {
    const customers = await db.userProfile.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 },
    );
  }
}

// POST create a new customer profile (Admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, address, firebaseUid, phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number with country code is required" },
        { status: 400 },
      );
    }

    // Check if profile already exists
    const existingProfile = await db.userProfile.findFirst({
      where: {
        OR: [
          { phoneNumber },
          firebaseUid ? { firebaseUid } : { firebaseUid: "NEVER_MATCH" },
        ],
      },
    });

    if (existingProfile) {
      return NextResponse.json(
        { error: "Customer profile already exists" },
        { status: 409 },
      );
    }

    const newProfile = await db.userProfile.create({
      data: {
        name,
        email,
        phone: phone || phoneNumber.replace("+91", ""),
        phoneNumber,
        address,
        firebaseUid:
          firebaseUid || `admin-gen-${Math.random().toString(36).substring(7)}`,
      },
    });

    return NextResponse.json(newProfile, { status: 201 });
  } catch (error) {
    console.error("Error creating customer profile:", error);
    return NextResponse.json(
      { error: "Failed to create customer profile" },
      { status: 500 },
    );
  }
}
