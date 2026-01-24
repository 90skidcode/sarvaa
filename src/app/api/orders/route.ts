import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const emailInput = searchParams.get("email");
    const status = searchParams.get("status");
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limitInput = searchParams.get("limit");
    const limit = limitInput ? Number.parseInt(limitInput) : null;
    const skip = limit ? (page - 1) * limit : undefined;

    console.log("FETCH ORDERS REQUEST:", {
      userId,
      emailInput,
      status,
      page,
      limit,
    });

    const where: any = {};

    // Build the query to find orders by ID OR by Email
    if (userId) {
      // Find the user's registered email to also fetch their "guest" orders
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      const conditions: any[] = [{ userId: userId }];
      if (user?.email) {
        conditions.push({ email: user.email });
      }
      if (emailInput && emailInput !== user?.email) {
        conditions.push({ email: emailInput });
      }

      where.OR = conditions;
    } else if (emailInput) {
      where.email = emailInput;
    }

    if (status && status !== "all") {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        skip,
        take: limit || undefined,
        include: {
          items: {
            include: {
              product: true,
            },
          },
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("CREATE ORDER BODY:", JSON.stringify(body, null, 2));
    const { userId, items, phone, address, name, email, notes } = body;

    // items, phone and address are always required
    if (!items || items.length === 0)
      return NextResponse.json({ error: "Missing items" }, { status: 400 });
    if (!phone)
      return NextResponse.json({ error: "Missing phone" }, { status: 400 });
    if (!address)
      return NextResponse.json({ error: "Missing address" }, { status: 400 });

    // userId is optional for guests, but then name is highly recommended
    if (!userId && !name)
      return NextResponse.json(
        { error: "Name is required for guest orders" },
        { status: 400 },
      );

    // Calculate total
    const total = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0,
    );

    // Generate order number
    const orderCount = await db.order.count();
    const orderNumber = `ORD-${String(orderCount + 1).padStart(6, "0")}`;

    // Validate userId exists in DB
    let validatedUserId = userId;
    if (userId) {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });
      if (!user) {
        console.warn(
          `ORDER CREATE: userId ${userId} not found in DB. Falling back to guest/null.`,
        );
        validatedUserId = null;
      }
    }

    // Create order
    const order = await db.order.create({
      data: {
        orderNumber,
        total,
        userId: validatedUserId,
        phone,
        email,
        name,
        address,
        notes,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    });

    // Clear cart
    await db.cartItem.deleteMany({
      where: { userId },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      {
        error: "Failed to create order",
        message: error.message || "Unknown error occurred",
        code: error.code,
        meta: error.meta,
      },
      { status: 500 },
    );
  }
}
