import { db } from "@/lib/db";
import { getPhonePeOrderStatus } from "@/lib/phonepe";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ merchantOrderId: string }> }
) {
  try {
    const { merchantOrderId } = await params;

    if (!merchantOrderId) {
      return NextResponse.json(
        { error: "Missing merchantOrderId" },
        { status: 400 }
      );
    }

    // Check if order exists
    const order = await db.order.findUnique({
      where: { merchantTransactionId: merchantOrderId },
      include: {
        items: { include: { product: true } },
        user: true,
        statusHistory: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Get payment status from PhonePe
    const phonePeStatus = await getPhonePeOrderStatus(merchantOrderId);

    // Update order based on PhonePe status
    let updatedOrder = order;
    if (phonePeStatus.state === "COMPLETED") {
      updatedOrder = await db.$transaction(async (tx) => {
        // Update order status
        const updated = await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: "SUCCESS",
            status: "confirmed",
          },
          include: {
            items: { include: { product: true } },
            user: true,
            statusHistory: { orderBy: { createdAt: "asc" } },
          },
        });

        // Add status log
        await tx.orderStatusLog.create({
          data: {
            orderId: order.id,
            status: "confirmed",
            notes: `Payment confirmed via PhonePe (${merchantOrderId})`,
          },
        });

        return updated;
      });
    } else if (
      phonePeStatus.state === "FAILED" ||
      phonePeStatus.state === "CANCELLED"
    ) {
      updatedOrder = await db.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "FAILED",
        },
        include: {
          items: { include: { product: true } },
          user: true,
          statusHistory: { orderBy: { createdAt: "asc" } },
        },
      });
    }

    return NextResponse.json({
      state: phonePeStatus.state,
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error("Error checking PhonePe status:", error);
    return NextResponse.json(
      {
        error: "Failed to check payment status",
        message: error.message || "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
