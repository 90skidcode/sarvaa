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
  Download,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  email?: string;
  phone?: string;
  address?: string;
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

function downloadReceipt(order: Order) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;

  // Header
  doc.setFontSize(20);
  doc.setTextColor(116, 49, 129); // Sarvaa purple
  doc.text("Sarvaa Sweets", margin, 20);

  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text("Payment Receipt", margin, 28);

  // Order number and date
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(`Order #${order.orderNumber}`, margin, 40);
  doc.text(`Date: ${orderDate}`, margin, 47);

  // Line separator
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, 52, pageWidth - margin, 52);

  // Order details table
  autoTable(doc, {
    startY: 58,
    margin: margin,
    head: [['Item', 'Qty', 'Price', 'Total']],
    body: order.items.map(item => [
      item.product.name,
      item.quantity.toString(),
      `₹${item.price.toFixed(2)}`,
      `₹${(item.price * item.quantity).toFixed(2)}`
    ]),
    headStyles: { fillColor: [116, 49, 129], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    bodyStyles: { textColor: 50 },
    columnStyles: { 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' } }
  });

  // Total section
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setTextColor(50, 50, 50);
  doc.setFont(undefined, 'bold');
  doc.text('Total Amount:', margin, finalY);
  doc.text(`₹${order.total.toFixed(2)}`, pageWidth - margin, finalY, { align: 'right' });

  // Payment confirmation
  doc.setFontSize(10);
  doc.setTextColor(34, 197, 94); // Green
  doc.setFont(undefined, 'normal');
  doc.text('✓ Payment Successful via PhonePe', margin, finalY + 12);

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text('Thank you for your order!', margin, finalY + 25);
  doc.text('For support, contact us at support@sarvaasweets.com', margin, finalY + 32);

  // Download
  doc.save(`${order.orderNumber}-receipt.pdf`);
  toast.success('Receipt downloaded successfully!');
}

function PaymentReturnContent() {
  const searchParams = useSearchParams();
  const clearCart = useCartStore((state) => state.clearCart);

  const merchantOrderId = searchParams.get("merchantOrderId");

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [retrying, setRetrying] = useState(false);

  const checkPaymentStatus = async (isRetry = false) => {
    if (isRetry) setRetrying(true);

    try {
      const response = await fetch(
        `/api/phonepe/status/${merchantOrderId}`
      );
      const data = await response.json();

      if (response.ok && data.order) {
        setOrder(data.order);
        setPaymentStatus(data.state);
        setError("");

        if (data.state === "COMPLETED") {
          clearCart();
          toast.success("Payment successful! Order confirmed.");
        } else if (data.state === "FAILED" || data.state === "CANCELLED") {
          toast.error("Payment failed. Please try again.");
        } else {
          toast.info("Payment is being processed...");
        }
      } else {
        setError(data.message || data.error || "Failed to check payment status");
        setOrder(data.order || null);
      }
    } catch (err) {
      console.error("Error checking payment status:", err);
      setError(
        err instanceof Error ? err.message : "Failed to check payment status. Please try again."
      );
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };

  useEffect(() => {
    if (!merchantOrderId) {
      setError("Invalid payment return link");
      setLoading(false);
      return;
    }

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

  if (error || (!loading && !order)) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="border-none shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className="inline-flex h-20 w-20 rounded-full bg-red-100 items-center justify-center">
                    <X className="h-10 w-10 text-red-600" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Payment Error
                </h1>
                <p className="text-gray-600 mb-2">
                  {error || "Could not process your payment"}
                </p>
                {order && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg text-left">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Order ID:</span> {order.orderNumber}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-semibold">Amount:</span> ₹{order.total.toFixed(2)}
                    </p>
                  </div>
                )}
                <div className="space-y-3 mt-6">
                  <Button
                    onClick={() => checkPaymentStatus(true)}
                    disabled={retrying}
                    className="w-full bg-[#743181] hover:bg-[#5a2a6e]"
                  >
                    {retrying ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></div>
                        Retrying...
                      </>
                    ) : (
                      "Retry Payment"
                    )}
                  </Button>
                  <Link href="/checkout" className="block">
                    <Button variant="outline" className="w-full">
                      Try Again
                    </Button>
                  </Link>
                  <Link href="/cart" className="block">
                    <Button variant="ghost" className="w-full">
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
    <div className="min-h-screen bg-[#f5f7fa] py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Status Card - Only show for non-success states */}
          {!isSuccess && (
          <Card className={`border-none shadow-lg mb-8 overflow-hidden ${
            isFailed ? "bg-gradient-to-br from-red-50 to-white" :
            "bg-gradient-to-br from-yellow-50 to-white"
          }`}>
            <CardContent className="p-8 text-center">
              <div className="mb-6 flex justify-center">
                {isSuccess ? (
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-200 rounded-full animate-pulse opacity-50"></div>
                    <div className="relative inline-flex h-20 w-20 rounded-full bg-green-100 items-center justify-center animate-bounce">
                      <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                  </div>
                ) : isFailed ? (
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-200 rounded-full animate-pulse opacity-50"></div>
                    <div className="relative inline-flex h-20 w-20 rounded-full bg-red-100 items-center justify-center">
                      <X className="h-10 w-10 text-red-600" />
                    </div>
                  </div>
                ) : (
                  <div className="inline-flex h-20 w-20 rounded-full bg-yellow-100 items-center justify-center">
                    <Clock className="h-10 w-10 text-yellow-600 animate-spin" />
                  </div>
                )}
              </div>

              <h1 className={`text-3xl sm:text-4xl font-black mb-2 ${
                isSuccess ? "text-green-600" :
                isFailed ? "text-red-600" :
                "text-yellow-600"
              }`}>
                {isSuccess
                  ? "Payment Successful! ✓"
                  : isFailed
                    ? "Payment Failed"
                    : "Processing Payment"}
              </h1>

              {isSuccess && order && (
                <>
                  <p className="text-gray-600 mb-4 text-lg">
                    Thank you for your order!
                  </p>
                  <div className="inline-block bg-green-100/50 px-4 py-2 rounded-full mb-6 border border-green-200">
                    <p className="text-green-700 font-bold">Order {order.orderNumber} confirmed</p>
                  </div>
                </>
              )}

              {isFailed && (
                <p className="text-gray-600 mb-6">
                  Your payment was not completed. Please try again.
                </p>
              )}

              {isPending && (
                <p className="text-gray-600 mb-6">
                  Your payment is being processed. This usually takes a few seconds.
                </p>
              )}
            </CardContent>
          </Card>
          )}

          {isSuccess && order && (
            <div className="mt-8">
              {/* Redesigned Success Card */}
              <Card className="border-none shadow-xl rounded-2xl max-w-[480px] mx-auto">
                <CardContent className="p-8 text-center">
                  {/* Green Checkmark Icon */}
                  <div className="mb-6 flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8 text-green-600" strokeWidth={1.5} />
                    </div>
                  </div>

                  {/* Title */}
                  <h1 className="text-3xl font-bold text-green-600 mb-2">
                    Payment Successful!
                  </h1>

                  {/* Subtitle */}
                  <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                    Your payment has been processed successfully. You will receive a confirmation email shortly.
                  </p>

                  {/* Details Section */}
                  <div className="bg-gray-50 rounded-xl p-5 mb-6 text-left space-y-4">
                    {/* Amount Row */}
                    <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Amount</span>
                      <span className="text-2xl font-bold text-gray-900">₹{order.total.toFixed(2)}</span>
                    </div>

                    {/* Transaction ID Row */}
                    <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Transaction ID</span>
                      <span className="inline-block bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">
                        {order.orderNumber}
                      </span>
                    </div>

                    {/* Payment Method Row */}
                    <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Payment Method</span>
                      <span className="text-gray-900 font-medium">PhonePe</span>
                    </div>

                    {/* Date Row */}
                    <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Date</span>
                      <span className="text-gray-900 font-medium">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    {/* Merchant Row */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Merchant</span>
                      <span className="text-gray-900 font-medium">Sarvaa Sweets</span>
                    </div>
                  </div>

                  {/* Email Confirmation Pill */}
                  {order.email && (
                    <div className="bg-blue-50 rounded-xl p-4 mb-6 flex items-center gap-3 justify-center border border-blue-100">
                      <Mail className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <span className="text-sm text-blue-700 font-medium">
                        Receipt sent to {order.email}
                      </span>
                    </div>
                  )}

                  {/* Download Receipt Button */}
                  <Button
                    onClick={() => downloadReceipt(order)}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-lg mb-3 flex items-center justify-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Receipt
                  </Button>

                  {/* Return to Store Button */}
                  <Link href="/" className="block">
                    <Button
                      variant="outline"
                      className="w-full font-bold py-3 rounded-lg border-2 border-gray-200 hover:bg-gray-50"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Return to Store
                    </Button>
                  </Link>

                  {/* Support Text */}
                  <p className="text-xs text-gray-500 mt-6">
                    Need help? Contact our support team at <br/>
                    <a href="mailto:support@sarvaasweets.com" className="text-purple-600 font-medium hover:underline">
                      support@sarvaasweets.com
                    </a>
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {isFailed && (
            <Card className="border-none shadow-lg mb-8 bg-red-50/50">
              <CardContent className="p-6">
                <p className="text-gray-700 font-semibold mb-4">
                  Your payment could not be processed. Possible reasons:
                </p>
                <ul className="space-y-2">
                  {[
                    "Insufficient funds in your account",
                    "Network timeout or connection issue",
                    "Incorrect card or payment details",
                    "Transaction declined by your bank",
                    "Payment gateway service unavailable",
                  ].map((reason, idx) => (
                    <li key={idx} className="flex gap-2 text-gray-600">
                      <span className="text-red-600 font-bold">•</span>
                      {reason}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons - Only for failed/pending states */}
          {!isSuccess && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            {isFailed ? (
              <>
                <Link href="/checkout">
                  <Button className="w-full sm:w-auto bg-[#743181] hover:bg-[#5a2a6e]">
                    Retry Payment
                  </Button>
                </Link>
                <Link href="/cart">
                  <Button variant="outline" className="w-full sm:w-auto">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Cart
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Button className="w-full sm:w-auto bg-[#743181] hover:bg-[#5a2a6e]" disabled>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Waiting for Payment...
                </Button>
              </>
            )}
          </div>
          )}
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
