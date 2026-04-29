import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { merchantOrderId, state } = body;

    if (!merchantOrderId) {
      return NextResponse.json(
        { error: "Missing merchantOrderId" },
        { status: 400 }
      );
    }

    // Find order
    const order = await db.order.findUnique({
      where: { merchantTransactionId: merchantOrderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update order based on PhonePe callback
    if (state === "COMPLETED") {
      await db.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: "SUCCESS",
            status: "confirmed",
          },
        });

        await tx.orderStatusLog.create({
          data: {
            orderId: order.id,
            status: "confirmed",
            notes: `Payment confirmed via PhonePe callback (${merchantOrderId})`,
          },
        });
      });
    } else if (state === "FAILED" || state === "CANCELLED") {
      await db.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "FAILED",
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error processing PhonePe callback:", error);
    return NextResponse.json(
      {
        error: "Failed to process callback",
        message: error.message || "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
