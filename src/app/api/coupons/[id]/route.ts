import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { id: params.id },
      include: {
        applicableProducts: true,
        applicableCategories: true,
        eligibleUsers: true,
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    // Get more detailed usage info if needed
    const usageDetails = await prisma.order.findMany({
      where: { couponId: params.id },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        discountAmount: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      coupon,
      usageDetails,
    });
  } catch (error) {
    console.error("Error fetching coupon details:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupon details" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
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

    const data: any = {};
    if (code) data.code = code.toUpperCase();
    if (discountType) data.discountType = discountType;
    if (discountValue !== undefined)
      data.discountValue = Number.parseFloat(discountValue);
    if (minCartValue !== undefined)
      data.minCartValue = Number.parseFloat(minCartValue);
    if (maxDiscountCap !== undefined)
      data.maxDiscountCap = maxDiscountCap
        ? Number.parseFloat(maxDiscountCap)
        : null;
    if (startDate) data.startDate = new Date(startDate);
    if (expiryDate) data.expiryDate = new Date(expiryDate);
    if (usageLimit !== undefined)
      data.usageLimit = usageLimit ? Number.parseInt(usageLimit) : null;
    if (userLimit !== undefined) data.userLimit = Number.parseInt(userLimit);
    if (isActive !== undefined) data.isActive = isActive;

    // Handle relations
    if (applicableProductIds) {
      data.applicableProducts = {
        set: applicableProductIds.map((id: string) => ({ id })),
      };
    }
    if (applicableCategoryIds) {
      data.applicableCategories = {
        set: applicableCategoryIds.map((id: string) => ({ id })),
      };
    }
    if (eligibleUserIds) {
      data.eligibleUsers = {
        set: eligibleUserIds.map((id: string) => ({ id })),
      };
    }

    const coupon = await prisma.coupon.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ coupon });
  } catch (error: any) {
    console.error("Error updating coupon:", error);
    return NextResponse.json(
      {
        error: "Failed to update coupon",
        message: error.message,
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await prisma.coupon.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return NextResponse.json(
      { error: "Failed to delete coupon" },
      { status: 500 },
    );
  }
}
