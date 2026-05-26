import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly");
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: any = {};

    if (activeOnly === "true") {
      where.isActive = true;
      where.expiryDate = {
        gt: new Date(),
      };
    }

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.coupon.count({ where }),
    ]);

    return NextResponse.json({
      coupons,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupons" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      code,
      discountType,
      discountValue,
      minCartValue,
      maxDiscountCap,
      startDate,
      expiryDate,
      usageLimit,
      userLimit,
      isActive,
      applicableProductIds,
      applicableCategoryIds,
      eligibleUserIds,
    } = body;

    if (
      !code ||
      !discountType ||
      discountValue === undefined ||
      !startDate ||
      !expiryDate
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check for duplicate coupon code
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existingCoupon) {
      return NextResponse.json(
        { error: "Coupon code already exists" },
        { status: 400 },
      );
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        discountValue: Number.parseFloat(discountValue),
        minCartValue: Number.parseFloat(minCartValue || 0),
        maxDiscountCap: maxDiscountCap
          ? Number.parseFloat(maxDiscountCap)
          : null,
        startDate: new Date(startDate),
        expiryDate: new Date(expiryDate),
        usageLimit: usageLimit ? Number.parseInt(usageLimit) : null,
        userLimit: Number.parseInt(userLimit || 1),
        isActive: typeof isActive === "boolean" ? isActive : true,
        applicableProducts: applicableProductIds
          ? {
              connect: applicableProductIds.map((id: string) => ({ id })),
            }
          : undefined,
        applicableCategories: applicableCategoryIds
          ? {
              connect: applicableCategoryIds.map((id: string) => ({ id })),
            }
          : undefined,
        eligibleUsers: eligibleUserIds
          ? {
              connect: eligibleUserIds.map((id: string) => ({ id })),
            }
          : undefined,
      },
    });

    return NextResponse.json({ coupon }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating coupon:", error);
    return NextResponse.json(
      {
        error: "Failed to create coupon",
        message: error.message,
      },
      { status: 500 },
    );
  }
}
