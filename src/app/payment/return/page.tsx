"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCartStore } from "@/lib/store";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  X,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    weight: string | null;
    product: {
      id: string;
      name: string;
      image: string;
    };
  }>;
}

function PaymentReturnContent() {
  const searchParams = useSearchParams();
  const clearCart = useCartStore((state) => state.clearCart);

  const merchantOrderId = searchParams.get("merchantOrderId");

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!merchantOrderId) {
      setError("Invalid payment return link");
      setLoading(false);
      return;
    }

    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(
          `/api/phonepe/status/${merchantOrderId}`
        );
        const data = await response.json();

        if (response.ok && data.order) {
          setOrder(data.order);
          setPaymentStatus(data.state);

          if (data.state === "COMPLETED") {
            clearCart();
            toast.success("Payment successful! Order confirmed.");
          } else if (data.state === "FAILED" || data.state === "CANCELLED") {
            toast.error("Payment failed. Please try again.");
          } else {
            toast.info("Payment is being processed...");
          }
        } else {
          setError(data.error || "Failed to check payment status");
        }
      } catch (err) {
        console.error("Error checking payment status:", err);
        setError("Failed to check payment status. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [merchantOrderId, clearCart]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-6">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-[#743181]"></div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verifying Payment
            </h1>
            <p className="text-gray-500">Please wait while we confirm your payment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="border-none shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  <div className="inline-flex h-16 w-16 rounded-full bg-red-100 items-center justify-center">
                    <X className="h-8 w-8 text-red-600" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Payment Error
                </h1>
                <p className="text-gray-600 mb-6">
                  {error || "Could not process your payment"}
                </p>
                <div className="space-y-3">
                  <Link href="/checkout" className="block">
                    <Button className="w-full bg-[#743181] hover:bg-[#5a2a6e]">
                      Try Again
                    </Button>
                  </Link>
                  <Link href="/cart" className="block">
                    <Button variant="outline" className="w-full">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Cart
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const isSuccess = paymentStatus === "COMPLETED";
  const isFailed = paymentStatus === "FAILED" || paymentStatus === "CANCELLED";
  const isPending = paymentStatus === "PENDING";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Status Card */}
          <Card className="border-none shadow-lg mb-8">
            <CardContent className="p-8 text-center">
              <div className="mb-6 flex justify-center">
                {isSuccess ? (
                  <div className="inline-flex h-20 w-20 rounded-full bg-green-100 items-center justify-center animate-bounce">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                  </div>
                ) : isFailed ? (
                  <div className="inline-flex h-20 w-20 rounded-full bg-red-100 items-center justify-center">
                    <X className="h-10 w-10 text-red-600" />
                  </div>
                ) : (
                  <div className="inline-flex h-20 w-20 rounded-full bg-yellow-100 items-center justify-center">
                    <Clock className="h-10 w-10 text-yellow-600 animate-spin" />
                  </div>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {isSuccess
                  ? "Payment Successful!"
                  : isFailed
                    ? "Payment Failed"
                    : "Payment Pending"}
              </h1>

              {isSuccess && (
                <>
                  <p className="text-gray-600 mb-2">
                    Thank you for your order!
                  </p>
                  <p className="text-lg font-semibold text-[#743181] mb-6">
                    Order {order.orderNumber} confirmed
                  </p>
                </>
              )}

              {isFailed && (
                <p className="text-gray-600 mb-6">
                  Your payment was not completed. Please try again.
                </p>
              )}

              {isPending && (
                <p className="text-gray-600 mb-6">
                  Your payment is still being processed. This usually takes a few seconds.
                </p>
              )}
            </CardContent>
          </Card>

          {isSuccess && order && (
            <>
              {/* Order Summary */}
              <Card className="border-none shadow-lg mb-8">
                <CardHeader className="bg-gray-50/80 p-6">
                  <CardTitle className="text-gray-900">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.productId} className="flex justify-between">
                        <span className="text-gray-600">
                          {item.product.name} × {item.quantity}
                        </span>
                        <span className="font-semibold text-gray-900">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-900">
                        Total Amount Paid
                      </span>
                      <span className="font-bold text-[#743181] text-xl">
                        ₹{order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-900">
                        Payment Confirmed
                      </p>
                      <p className="text-sm text-green-700">
                        Transaction ID: {order.id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card className="border-none shadow-lg mb-8">
                <CardHeader className="bg-gray-50/80 p-6">
                  <CardTitle className="text-gray-900">What's Next?</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ol className="space-y-4">
                    <li className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#743181] text-white flex items-center justify-center font-bold">
                        1
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Order Confirmation
                        </p>
                        <p className="text-sm text-gray-600">
                          You'll receive a confirmation email shortly with your order details
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#743181] text-white flex items-center justify-center font-bold">
                        2
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Order Preparation
                        </p>
                        <p className="text-sm text-gray-600">
                          Our team will start preparing your order for pickup
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#743181] text-white flex items-center justify-center font-bold">
                        3
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Pickup Ready</p>
                        <p className="text-sm text-gray-600">
                          We'll notify you when your order is ready for pickup
                        </p>
                      </div>
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </>
          )}

          {isFailed && (
            <Card className="border-none shadow-lg mb-8">
              <CardContent className="p-6">
                <p className="text-gray-600 mb-6">
                  Your payment could not be processed. This could be due to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                  <li>Insufficient funds</li>
                  <li>Network timeout</li>
                  <li>Incorrect card details</li>
                  <li>Transaction declined by bank</li>
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isSuccess ? (
              <>
                <Link href={`/profile/orders/${order.id}`}>
                  <Button className="bg-[#743181] hover:bg-[#5a2a6e]">
                    <CreditCard className="h-4 w-4 mr-2" />
                    View Order Details
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/checkout">
                  <Button className="bg-[#743181] hover:bg-[#5a2a6e]">
                    Try Again
                  </Button>
                </Link>
                <Link href="/cart">
                  <Button variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Cart
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto text-center">
              <div className="mb-6">
                <div className="inline-block">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-[#743181]"></div>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Loading...
              </h1>
            </div>
          </div>
        </div>
      }
    >
      <PaymentReturnContent />
    </Suspense>
  );
}
