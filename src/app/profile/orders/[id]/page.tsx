'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Calendar, CreditCard, Package, Phone, Store, User } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface OrderItem {
  productId: string
  quantity: number
  price: number
  weight: string | null
  product: {
    id: string
    name: string
    image: string
  }
}

interface Order {
  id: string
  orderNumber: string
  items: OrderItem[]
  name: string | null
  email: string | null
  phone: string
  address: string | null
  total: number
  paymentMethod: string
  status: string
  createdAt: string
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  preparing: 'bg-purple-100 text-purple-800 border-purple-200',
  ready: 'bg-green-100 text-green-800 border-green-200',
  delivered: 'bg-gray-100 text-gray-800 border-gray-200',
  completed: 'bg-gray-100 text-gray-800 border-gray-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
}

export default function OrderDetailsPage() {
  const params = useParams()
  const orderId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`)
        const data = await response.json()
        if (response.ok && data.order) {
          setOrder(data.order)
        }
      } catch (error) {
        console.error('Error fetching order:', error)
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-[#743181]"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center py-16">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
            <p className="text-gray-500 mb-6">We couldn't find the order you're looking for.</p>
            <Link href="/profile/orders">
              <Button className="bg-[#743181] hover:bg-[#5a2a6e]">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/profile/orders">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{order.orderNumber}</h1>
                <Badge className={`${statusColors[order.status]} border`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
              <p className="text-gray-500 text-sm mt-1">Order placed on {formatDate(order.createdAt)}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Order Items */}
            <Card className="md:col-span-2 border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#743181]">
                  <Package className="h-5 w-5" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-20 h-20 relative rounded-lg overflow-hidden flex-shrink-0 bg-white">
                      <img
                        src={item.product?.image}
                        alt={item.product?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 leading-tight mb-1">{item.product?.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.weight && <span>{item.weight} • </span>}
                        Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#743181]">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}

                {/* Total */}
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">₹{order.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-600">Pickup</span>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-[#743181]">₹{order.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Info */}
            <div className="space-y-4">
              {/* Pickup Info */}
              <Card className="border-none shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Store className="h-4 w-4" />
                    Pickup Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold text-gray-900">Store Pickup</p>
                  <p className="text-sm text-gray-500 line-clamp-2">{order.address || 'Sarvaa Sweets Main'}</p>
                </CardContent>
              </Card>

              {/* Customer Info */}
              <Card className="border-none shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Customer Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="font-semibold text-gray-900">{order.name || 'Guest User'}</p>
                  {order.email && (
                    <p className="text-sm text-gray-500">{order.email}</p>
                  )}
                  {order.phone && (
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      +91 {order.phone}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Payment Info */}
              <Card className="border-none shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Payment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold text-gray-900 uppercase">{order.paymentMethod}</p>
                  <p className="text-sm text-gray-500">Pay at pickup</p>
                </CardContent>
              </Card>

              {/* Order Date */}
              <Card className="border-none shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Order Date
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold text-gray-900">{formatDate(order.createdAt)}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Help Section */}
          <Card className="mt-6 border-none shadow-lg bg-purple-50">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">Need help with your order?</p>
                <p className="text-sm text-gray-600">Contact our support team for assistance</p>
              </div>
              <Link href="/contact">
                <Button variant="outline" className="border-[#743181] text-[#743181] hover:bg-purple-100">
                  Contact Us
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
