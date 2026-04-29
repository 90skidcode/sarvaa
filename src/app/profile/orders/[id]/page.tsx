"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { generateInvoice } from "@/lib/invoice";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Package,
  Phone,
  Store,
  User,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  weight: string | null;
  product: {
    id: string;
    name: string;
    image: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  name: string | null;
  email: string | null;
  phone: string;
  address: string | null;
  total: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  statusHistory: {
    status: string;
    createdAt: string;
  }[];
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  preparing: "bg-purple-100 text-purple-800 border-purple-200",
  ready: "bg-green-100 text-green-800 border-green-200",
  delivered: "bg-gray-100 text-gray-800 border-gray-200",
  completed: "bg-gray-100 text-gray-800 border-gray-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        const data = await response.json();
        if (response.ok && data.order) {
          setOrder(data.order);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-[#743181]"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center py-16">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Order Not Found
            </h1>
            <p className="text-gray-500 mb-6">
              We couldn't find the order you're looking for.
            </p>
            <Link href="/profile/orders">
              <Button className="bg-[#743181] hover:bg-[#5a2a6e]">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-start gap-2 sm:gap-4 mb-2 sm:mb-8">
            <Link href="/profile/orders">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
              >
                <ArrowLeft className="h-4 sm:h-5 w-4 sm:w-5" />
              </Button>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                  {order.orderNumber}
                </h1>
                <Badge
                  className={`${statusColors[order.status]} border text-xs sm:text-sm px-2 py-1 whitespace-nowrap`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
              

             
            </div>
            <Button
                variant="outline"
                size="sm"
                className="ml-auto text-[#743181] border-[#743181] hover:bg-purple-50 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                onClick={() => generateInvoice(order)}
              >
                <Download className="h-3 sm:h-4 w-3 sm:w-4 mr-1" />{" "}
                <span className="hidden sm:inline">Download Invoice</span>
                <span className="sm:hidden">Invoice</span>
              </Button>
            
          </div>
 <p className="text-gray-500 text-xs sm:text-sm mb-1 pb-2 text-center">
                Order placed on {formatDate(order.createdAt)}
              </p>
          {/* New Tracking Timeline Card */}
          <Card className="mb-4 sm:mb-8 border-none shadow-lg overflow-hidden bg-white">
            <CardContent className="p-3 sm:p-8">
              <div className="relative">
                {/* Connecting Line Background - Horizontal on desktop, Vertical on mobile */}
                <div className="hidden sm:block absolute top-5 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2"></div>
                <div className="sm:hidden absolute top-0 left-5 w-0.5 h-full bg-gray-100 -translate-x-1/2"></div>

                {/* Active Progress Line - Horizontal on desktop, Vertical on mobile */}
                <div
                  className="hidden sm:block absolute top-5 left-0 h-0.5 bg-[#743181] -translate-y-1/2 transition-all duration-700 ease-in-out"
                  style={{
                    width: (() => {
                      const percentages: Record<string, string> = {
                        pending: "0%",
                        confirmed: "25%",
                        preparing: "50%",
                        ready: "75%",
                        delivered: "100%",
                      };
                      return percentages[order.status] || "0%";
                    })(),
                  }}
                ></div>

                {/* Vertical progress line for mobile */}
                <div
                  className="sm:hidden absolute top-0 left-5 w-0.5 bg-[#743181] transition-all duration-700 ease-in-out"
                  style={{
                    height: (() => {
                      const percentages: Record<string, string> = {
                        pending: "0%",
                        confirmed: "25%",
                        preparing: "50%",
                        ready: "75%",
                        delivered: "100%",
                      };
                      return percentages[order.status] || "0%";
                    })(),
                  }}
                ></div>

                <div className="flex sm:flex-row flex-col gap-2 sm:justify-between relative z-10">
                  {(() => {
                    const steps = [
                      { id: "pending", label: "Ordered", icon: Clock },
                      {
                        id: "confirmed",
                        label: "Confirmed",
                        icon: CheckCircle2,
                      },
                      { id: "preparing", label: "Preparing", icon: Package },
                      { id: "ready", label: "Ready", icon: CheckCircle2 },
                      {
                        id: "delivered",
                        label: "Delivered",
                        icon: CheckCircle2,
                      },
                    ];

                    const currentIdx = steps.findIndex(
                      (s) => s.id === order.status,
                    );

                    return steps.map((step, idx) => {
                      const isCompleted = currentIdx >= idx;
                      const isCurrent = currentIdx === idx;
                      const logTime =
                        step.id === "pending"
                          ? order.createdAt
                          : order.statusHistory?.find(
                              (h) => h.status === step.id,
                            )?.createdAt;

                      return (
                        <div
                          key={step.id}
                          className="flex sm:flex-col flex-row items-center sm:items-center gap-2 sm:gap-0"
                        >
                          <div
                            className={`
                            w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 flex-shrink-0
                            ${isCompleted ? "bg-[#743181] border-[#743181] text-white shadow-lg" : "bg-white border-gray-200 text-gray-300"}
                            ${isCurrent ? "ring-4 ring-purple-100 scale-110" : ""}
                          `}
                          >
                            <step.icon
                              className={`h-4 sm:h-5 w-4 sm:w-5 ${isCurrent ? "animate-pulse" : ""}`}
                            />
                          </div>
                          <div className="sm:mt-3 flex flex-col items-start sm:items-center">
                            <span
                              className={`
                              text-xs sm:text-sm font-bold transition-colors duration-500 whitespace-nowrap
                              ${isCompleted ? "text-[#743181]" : "text-gray-400"}
                              ${isCurrent ? "text-gray-900" : ""}
                            `}
                            >
                              {step.label}
                            </span>
                            {logTime && (
                              <span className="text-[8px] sm:text-[10px] text-gray-500 whitespace-nowrap sm:mt-1 sm:text-center font-medium">
                                <span className="hidden sm:block">
                                  {new Date(logTime).toLocaleTimeString(
                                    "en-IN",
                                    { hour: "2-digit", minute: "2-digit" },
                                  )}
                                </span>
                                <span className="hidden sm:block">
                                  {new Date(logTime).toLocaleDateString(
                                    "en-IN",
                                    { day: "2-digit", month: "short" },
                                  )}
                                </span>
                                <span className="sm:hidden">
                                  {new Date(logTime).toLocaleTimeString(
                                    "en-IN",
                                    { hour: "2-digit", minute: "2-digit" },
                                  )}{" "}
                                  •{" "}
                                  {new Date(logTime).toLocaleDateString(
                                    "en-IN",
                                    { day: "2-digit", month: "short" },
                                  )}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Order Items */}
            <Card className="md:col-span-2 border-none shadow-lg">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-[#743181] text-lg sm:text-xl">
                  <Package className="h-4 sm:h-5 w-4 sm:w-5" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                {order.items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl"
                  >
                    <div className="w-16 sm:w-20 h-16 sm:h-20 relative rounded-lg overflow-hidden flex-shrink-0 bg-white">
                      <ImageWithFallback
                        src={item.product?.image}
                        alt={item.product?.name}
                        className="object-cover"
                        fallbackClassName="bg-white"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 leading-tight mb-0.5 sm:mb-1 text-sm sm:text-base truncate">
                        {item.product?.name}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-500">
                        {item.weight && <span>{item.weight} • </span>}
                        Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-[#743181] text-sm sm:text-base">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Total */}
                <div className="border-t pt-3 sm:pt-4 mt-3 sm:mt-4">
                  <div className="flex justify-between items-center text-xs sm:text-base">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">
                      ₹{order.total.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1.5 sm:mt-2 text-xs sm:text-base">
                    <span className="text-gray-600">Pickup</span>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>
                  <div className="flex justify-between items-center mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                    <span className="font-bold text-gray-900 text-sm sm:text-lg">
                      Total
                    </span>
                    <span className="font-bold text-[#743181] text-lg sm:text-2xl">
                      ₹{order.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Info */}
            <div className="space-y-3 sm:space-y-4">
              {/* Pickup Info */}
              <Card className="border-none shadow-lg">
                <CardHeader className="pb-2 p-4 sm:p-6">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Store className="h-3 sm:h-4 w-3 sm:w-4" />
                    Pickup Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <p className="font-semibold text-gray-900 text-sm">
                    Store Pickup
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">
                    {order.address || "Sarvaa Sweets Main"}
                  </p>
                </CardContent>
              </Card>

              {/* Customer Info */}
              <Card className="border-none shadow-lg">
                <CardHeader className="pb-2 p-4 sm:p-6">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-2">
                    <User className="h-3 sm:h-4 w-3 sm:w-4" />
                    Customer Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5 p-4 sm:p-6 pt-0">
                  <p className="font-semibold text-gray-900 text-sm">
                    {order.name || "Guest User"}
                  </p>
                  {order.email && (
                    <p className="text-xs sm:text-sm text-gray-500 truncate">
                      {order.email}
                    </p>
                  )}
                  {order.phone && (
                    <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                      <Phone className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">+91 {order.phone}</span>
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Payment Info */}
              <Card className="border-none shadow-lg">
                <CardHeader className="pb-2 p-4 sm:p-6">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-2">
                    <CreditCard className="h-3 sm:h-4 w-3 sm:w-4" />
                    Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <p className="font-semibold text-gray-900 uppercase text-sm">
                    {order.paymentMethod}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Pay at pickup
                  </p>
                </CardContent>
              </Card>

              {/* Order Date */}
              <Card className="border-none shadow-lg">
                <CardHeader className="pb-2 p-4 sm:p-6">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Calendar className="h-3 sm:h-4 w-3 sm:w-4" />
                    Order Date
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <p className="font-semibold text-gray-900 text-sm">
                    {formatDate(order.createdAt)}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Help Section */}
          <Card className="mt-6 border-none shadow-lg bg-purple-50">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">
                  Need help with your order?
                </p>
                <p className="text-sm text-gray-600">
                  Contact our support team for assistance
                </p>
              </div>
              <Link href="/contact">
                <Button
                  variant="outline"
                  className="border-[#743181] text-[#743181] hover:bg-purple-100"
                >
                  Contact Us
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
