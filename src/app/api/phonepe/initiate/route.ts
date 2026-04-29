import { db } from "@/lib/db";
import { initiatePhonePePayment } from "@/lib/phonepe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      items,
      phone,
      address,
      name,
      email,
      notes,
      storeId,
      couponId,
    } = body;

    // Basic validation
    if (!items || items.length === 0)
      return NextResponse.json({ error: "Missing items" }, { status: 400 });
    if (!phone)
      return NextResponse.json({ error: "Missing phone" }, { status: 400 });
    if (!address)
      return NextResponse.json({ error: "Missing address" }, { status: 400 });
    if (!userId && !name)
      return NextResponse.json(
        { error: "Name is required for guest orders" },
        { status: 400 }
      );

    const normalizedEmail = email?.trim() || null;
    const normalizedName = name?.trim() || null;

    const subtotal = items.reduce(
      (sum: number, item: any) =>
        sum + (item.price || 0) * (item.quantity || 0),
      0
    );

    // Calculate discount using same logic as orders
    const { discountAmount, appliedCoupon } = await calculateOrderDiscount(
      couponId,
      items,
      subtotal
    );
    const finalTotal = subtotal - discountAmount;

    // Generate order number
    const orderCount = await db.order.count();
    const orderNumber = `ORD-${String(orderCount + 1).padStart(6, "0")}`;
    const merchantTransactionId = `PP-${orderNumber}`;

    // Verify user exists
    let userToConnect: string | null = null;
    if (userId) {
      const existingUser = await db.user.findFirst({
        where: {
          OR: [{ id: userId }, { email: normalizedEmail || undefined }],
        },
      });
      if (existingUser) {
        userToConnect = existingUser.id;
      }
    }

    // Create order in "initiated" state
    const order = await db.$transaction(
      async (tx) => {
        const newOrder = await tx.order.create({
          data: {
            orderNumber,
            total: finalTotal,
            discountAmount,
            couponCode: appliedCoupon?.code || null,
            phone,
            email: normalizedEmail,
            name: normalizedName,
            address,
            notes,
            paymentMethod: "phonepe",
            paymentStatus: "initiated",
            merchantTransactionId,
            ...(appliedCoupon
              ? { coupon: { connect: { id: appliedCoupon.id } } }
              : {}),
            ...(storeId ? { store: { connect: { id: storeId } } } : {}),
            ...(userToConnect
              ? { user: { connect: { id: userToConnect } } }
              : {}),
            items: {
              create: items.map((item: any) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                weight: item.weight || null,
              })),
            },
            statusHistory: {
              create: {
                status: "pending",
                notes: "Awaiting payment confirmation via PhonePe",
              },
            },
          },
          include: {
            items: { include: { product: true } },
            user: true,
            statusHistory: { orderBy: { createdAt: "asc" } },
          },
        });

        if (appliedCoupon) {
          await tx.coupon.update({
            where: { id: appliedCoupon.id },
            data: { usedCount: { increment: 1 } },
          });
        }

        return newOrder;
      },
      {
        maxWait: 5000,
        timeout: 10000,
      }
    );

    // Initiate PhonePe payment
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const redirectUrl = `${baseUrl}/payment/return?merchantOrderId=${merchantTransactionId}`;

    const phonePeRedirectUrl = await initiatePhonePePayment(
      merchantTransactionId,
      Math.round(finalTotal * 100), // Convert to paise
      redirectUrl
    );

    return NextResponse.json(
      {
        orderId: order.id,
        orderNumber: order.orderNumber,
        merchantTransactionId,
        phonePeRedirectUrl,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error initiating PhonePe payment:", error);
    return NextResponse.json(
      {
        error: "Failed to initiate payment",
        message: error.message || "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

async function calculateOrderDiscount(
  couponId: string | null,
  items: any[],
  subtotal: number
) {
  if (!couponId) return { discountAmount: 0, appliedCoupon: null };

  const coupon = await db.coupon.findUnique({
    where: { id: couponId },
    include: {
      applicableProducts: { select: { id: true } },
      applicableCategories: { select: { id: true } },
    },
  });

  if (!coupon || !coupon.isActive)
    return { discountAmount: 0, appliedCoupon: null };

  let applicableTotal = 0;
  const hasRestrictions =
    coupon.applicableProducts.length > 0 ||
    coupon.applicableCategories.length > 0;

  if (hasRestrictions) {
    const productIds = items.map((item: any) => item.productId);
    const cartProducts = await db.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, categoryId: true },
    });

    items.forEach((item: any) => {
      const pInfo = cartProducts.find((p) => p.id === item.productId);
      const isProductApplicable =
        coupon.applicableProducts.length === 0 ||
        coupon.applicableProducts.some((p) => p.id === item.productId);
      const isCategoryApplicable =
        coupon.applicableCategories.length === 0 ||
        coupon.applicableCategories.some((c) => c.id === pInfo?.categoryId);

      if (isProductApplicable && isCategoryApplicable) {
        applicableTotal += (item.price || 0) * (item.quantity || 0);
      }
    });
  } else {
    applicableTotal = subtotal;
  }

  if (applicableTotal < coupon.minCartValue)
    return { discountAmount: 0, appliedCoupon: null };

  let discountAmount = 0;
  if (coupon.discountType === "percentage") {
    discountAmount = (applicableTotal * coupon.discountValue) / 100;
    if (coupon.maxDiscountCap && discountAmount > coupon.maxDiscountCap) {
      discountAmount = coupon.maxDiscountCap;
    }
  } else {
    discountAmount = Math.min(coupon.discountValue, applicableTotal);
  }

  return { discountAmount, appliedCoupon: coupon };
}
