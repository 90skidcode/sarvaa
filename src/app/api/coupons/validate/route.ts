import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, userId, items } = body;

    if (!code) {
      return NextResponse.json(
        { error: "Coupon code is required" },
        { status: 400 },
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Cart items are required for validation" },
        { status: 400 },
      );
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        applicableProducts: { select: { id: true } },
        applicableCategories: { select: { id: true } },
        eligibleUsers: { select: { id: true } },
      },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: "Invalid coupon code" },
        { status: 404 },
      );
    }

    // Basic status and validity checks
    const statusError = checkCouponStatus(coupon);
    if (statusError) {
      return NextResponse.json({ error: statusError }, { status: 400 });
    }

    // Per-user limit check
    if (userId) {
      const userUsageCount = await prisma.order.count({
        where: {
          userId,
          couponId: coupon.id,
          status: { not: "cancelled" },
        },
      });

      if (userUsageCount >= coupon.userLimit) {
        return NextResponse.json(
          { error: "You have already used this coupon" },
          { status: 400 },
        );
      }
    }

    // User eligibility
    if (
      coupon.eligibleUsers.length > 0 &&
      (!userId || !coupon.eligibleUsers.some((u) => u.id === userId))
    ) {
      return NextResponse.json(
        { error: "You are not eligible for this coupon" },
        { status: 400 },
      );
    }

    // Calculate applicable total
    const { applicableTotal, error: appError } = await calculateApplicableTotal(
      coupon,
      items,
    );
    if (appError) {
      return NextResponse.json({ error: appError }, { status: 400 });
    }

    // Minimum cart value
    if (applicableTotal < coupon.minCartValue) {
      return NextResponse.json(
        {
          error: `Minimum order value for this coupon is ₹${coupon.minCartValue}`,
        },
        { status: 400 },
      );
    }

    // Calculate discount
    const discountAmount = calculateDiscount(coupon, applicableTotal);

    return NextResponse.json({
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      discountAmount,
      applicableTotal,
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    return NextResponse.json(
      { error: "Failed to validate coupon" },
      { status: 500 },
    );
  }
}

function checkCouponStatus(coupon: any) {
  if (!coupon.isActive) return "This coupon is currently inactive";

  const now = new Date();
  if (now < new Date(coupon.startDate)) return "This coupon is not yet valid";
  if (now > new Date(coupon.expiryDate)) return "This coupon has expired";

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return "This coupon has reached its usage limit";
  }

  return null;
}

async function calculateApplicableTotal(coupon: any, items: any[]) {
  const productIds = items.map((item) => item.productId);
  const cartProducts = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, categoryId: true },
  });

  const hasRestrictions =
    coupon.applicableProducts.length > 0 ||
    coupon.applicableCategories.length > 0;

  if (!hasRestrictions) {
    return {
      applicableTotal: items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      ),
    };
  }

  let applicableTotal = 0;
  items.forEach((item) => {
    const pInfo = cartProducts.find((p) => p.id === item.productId);
    const isProductApplicable =
      coupon.applicableProducts.length === 0 ||
      coupon.applicableProducts.some((p: any) => p.id === item.productId);
    const isCategoryApplicable =
      coupon.applicableCategories.length === 0 ||
      coupon.applicableCategories.some((c: any) => c.id === pInfo?.categoryId);

    if (isProductApplicable && isCategoryApplicable) {
      applicableTotal += item.price * item.quantity;
    }
  });

  if (applicableTotal === 0) {
    return {
      applicableTotal: 0,
      error: "This coupon is not applicable to the items in your cart",
    };
  }

  return { applicableTotal };
}

function calculateDiscount(coupon: any, applicableTotal: number) {
  let discountAmount = 0;
  if (coupon.discountType === "percentage") {
    discountAmount = (applicableTotal * coupon.discountValue) / 100;
    if (coupon.maxDiscountCap && discountAmount > coupon.maxDiscountCap) {
      discountAmount = coupon.maxDiscountCap;
    }
  } else {
    discountAmount = Math.min(coupon.discountValue, applicableTotal);
  }
  return discountAmount;
}
