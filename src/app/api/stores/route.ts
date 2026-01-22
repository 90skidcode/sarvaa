import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const activeOnly = searchParams.get("activeOnly") === "true";

    const skip = (page - 1) * limit;

    const where = activeOnly ? { isActive: true } : {};

    const [stores, total] = await Promise.all([
      db.store.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.store.count({ where }),
    ]);

    return NextResponse.json({
      stores,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching stores:", error);
    return NextResponse.json(
      { error: "Failed to fetch stores" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, address, phone, email, isActive } = body;

    const store = await db.store.create({
      data: {
        name,
        address,
        phone,
        email,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({ store }, { status: 201 });
  } catch (error) {
    console.error("Error creating store:", error);
    return NextResponse.json(
      { error: "Failed to create store" },
      { status: 500 },
    );
  }
}
