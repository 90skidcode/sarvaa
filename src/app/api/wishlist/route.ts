import { db } from "@/lib/db";
import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET wishlist for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "UserId is required" },
        { status: 400 },
      );
    }

    // Resolve user first (might be id or firebaseUid)
    let user = await db.user.findFirst({
      where: {
        OR: [{ id: userId }, { firebaseUid: userId }],
      },
    });

    // SELF-HEALING: If no User record exists but it might be an OTP user
    if (!user && userId.length > 20) {
      // Try to find in UserProfile
      const profile = await db.userProfile.findUnique({
        where: { firebaseUid: userId },
      });

      if (profile) {
        // Create User record on-the-fly
        user = await db.user.create({
          data: {
            firebaseUid: userId,
            email: profile.email || `${userId}@firebase.com`,
            name: profile.name || "User",
            password: await hash(Math.random().toString(36), 10),
            phoneNumber: profile.phoneNumber,
            phone: profile.phone,
          },
        });
      }
    }

    if (!user) {
      return NextResponse.json({ wishlist: [] }); // No user, no wishlist
    }

    const wishlist = await db.wishlistItem.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ wishlist });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 },
    );
  }
}

// POST - Toggle wishlist status (add/remove)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, productId } = body;
    console.log(`[Wishlist Toggle] Body:`, { userId, productId });
    console.log(
      `[Wishlist API] Toggle request: userId=${userId}, productId=${productId}`,
    );

    if (!userId || !productId) {
      return NextResponse.json(
        { error: "UserId and ProductId are required" },
        { status: 400 },
      );
    }

    // Resolve user first
    let userRecord = await db.user.findFirst({
      where: {
        OR: [{ id: userId }, { firebaseUid: userId }],
      },
    });

    // SELF-HEALING: If still not found, try to create from profile
    if (!userRecord && userId.length > 20) {
      const profile = await db.userProfile.findUnique({
        where: { firebaseUid: userId },
      });

      if (profile) {
        userRecord = await db.user.create({
          data: {
            firebaseUid: userId,
            email: profile.email || `${userId}@firebase.com`,
            name: profile.name || "User",
            password: await hash(Math.random().toString(36), 10),
            phoneNumber: profile.phoneNumber,
            phone: profile.phone,
          },
        });
      }
    }

    if (!userRecord) {
      return NextResponse.json(
        {
          error: "User not found",
          details: `User with ID/UID ${userId} does not exist in the database.`,
        },
        { status: 404 },
      );
    }

    const resolvedUserId = userRecord.id;

    // Check if product exists
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if item already in wishlist
    const existing = await db.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: resolvedUserId,
          productId,
        },
      },
    });

    if (existing) {
      // Remove from wishlist
      await db.wishlistItem.delete({
        where: {
          id: existing.id,
        },
      });
      console.log(`[Wishlist API] Removed item for user ${resolvedUserId}`);
      return NextResponse.json({
        message: "Removed from wishlist",
        status: "removed",
      });
    } else {
      const item = await db.wishlistItem.create({
        data: {
          userId: resolvedUserId,
          productId,
        },
        include: {
          product: true,
        },
      });
      console.log(`[Wishlist API] Added item for user ${resolvedUserId}`);
      return NextResponse.json(
        {
          message: "Added to wishlist",
          status: "added",
          item,
        },
        { status: 201 },
      );
    }
  } catch (error: any) {
    console.error("Error toggling wishlist:", error);
    return NextResponse.json(
      {
        error: "Failed to update wishlist",
        details: error.message,
        stack: error.stack,
      },
      { status: 500 },
    );
  }
}
