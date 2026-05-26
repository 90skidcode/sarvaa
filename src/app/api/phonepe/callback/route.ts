import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getPhonePeOrderStatus } from "@/lib/phonepe";

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

    // SECURITY: Don't trust the callback payload blindly.
    // Verify payment status directly with PhonePe API (server-to-server).
    let verifiedState: string;
    try {
      const statusResponse = await getPhonePeOrderStatus(merchantOrderId);
      verifiedState = statusResponse.state;
    } catch (verifyError) {
      console.error("PhonePe status verification failed:", verifyError);
      // If we can't verify, don't update the order  fail safe
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 502 }
      );
    }

    // Update order based on VERIFIED status (not the callback payload)
    if (verifiedState === "COMPLETED") {
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
            notes: `Payment verified via PhonePe (${merchantOrderId})`,
          },
        });
      });
    } else if (verifiedState === "FAILED" || verifiedState === "CANCELLED") {
      await db.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "FAILED",
        },
      });
    }
    // If state is PENDING or other, do nothing  wait for next callback

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
