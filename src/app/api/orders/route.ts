import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = getParam(searchParams, "userId");
    const emailInput = getParam(searchParams, "email");
    const status = searchParams.get("status");
    const storeId = searchParams.get("storeId");
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limitInput = searchParams.get("limit");
    const limit = limitInput ? Number.parseInt(limitInput) : null;
    const skip = limit ? (page - 1) * limit : undefined;

    const where = await buildOrderWhereClause(
      userId,
      emailInput,
      status,
      storeId,
    );

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        skip,
        take: limit || undefined,
        include: {
          items: { include: { product: true } },
          user: true,
          store: true,
          statusHistory: { orderBy: { createdAt: "asc" } },
        },
        orderBy: { createdAt: "desc" },
      }),
      db.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit: limit || total,
        total,
        totalPages: limit ? Math.ceil(total / limit) : 1,
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}

function getParam(params: URLSearchParams, key: string) {
  const val = params.get(key);
  if (val === "null" || val === "undefined" || !val) return null;
  return val;
}

async function buildOrderWhereClause(
  userId: string | null,
  emailInput: string | null,
  status: string | null,
  storeId: string | null,
) {
  const where: any = {};

  if (userId) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    const conditions: any[] = [{ userId }];
    if (user?.email) conditions.push({ email: user.email });
    if (emailInput && emailInput !== user?.email)
      conditions.push({ email: emailInput });

    where.OR = conditions;
  } else if (emailInput) {
    where.email = emailInput;
  }

  if (status && status !== "all") where.status = status;
  if (storeId && storeId !== "all") where.storeId = storeId;

  return where;
}

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
        { status: 400 },
      );

    const subtotal = items.reduce(
      (sum: number, item: any) =>
        sum + (item.price || 0) * (item.quantity || 0),
      0,
    );

    // Calculate Discount
    const { discountAmount, appliedCoupon } = await calculateOrderDiscount(
      couponId,
      items,
      subtotal,
    );
    const finalTotal = subtotal - discountAmount;

    // Generate identity
    const orderCount = await db.order.count();
    const orderNumber = `ORD-${String(orderCount + 1).padStart(6, "0")}`;

    // Create Order with Transaction
    const order = await db.$transaction(
      async (tx) => {
        const newOrder = await tx.order.create({
          data: {
            orderNumber,
            total: finalTotal,
            discountAmount,
            couponCode: appliedCoupon?.code || null,
            phone,
            email,
            name,
            address,
            notes,
            ...(appliedCoupon
              ? { coupon: { connect: { id: appliedCoupon.id } } }
              : {}),
            ...(storeId ? { store: { connect: { id: storeId } } } : {}),
            ...(userId ? { user: { connect: { id: userId } } } : {}),
            items: {
              create: items.map((item: any) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
              })),
            },
            statusHistory: {
              create: { status: "pending", notes: "Order placed successfully" },
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
      },
    );

    // Clear cart (best effort, don't block order)
    if (userId)
      db.cartItem.deleteMany({ where: { userId } }).catch(console.error);

    return NextResponse.json({ order }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      {
        error: "Failed to create order",
        message: error.message || "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}

async function calculateOrderDiscount(
  couponId: string | null,
  items: any[],
  subtotal: number,
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
