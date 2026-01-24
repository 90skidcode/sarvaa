'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { getCurrentUser } from '@/lib/api-client'
import { ArrowLeft, ChevronRight, ClipboardList, Package, Store } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
  total: number
  paymentMethod: string
  status: string
  createdAt: string
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  ready: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function OrdersPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push('/login')
      return
    }

    const fetchUserOrders = async () => {
      try {
        const response = await fetch(`/api/orders?userId=${user.id}&email=${user.email}`)
        const data = await response.json()
        if (response.ok) {
          setOrders(data.orders || [])
        }
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserOrders()
  }, [router])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/profile">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600 mt-1">Track and manage your orders</p>
            </div>
          </div>

          {orders.length === 0 ? (
            <Card className="border-none shadow-lg">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <ClipboardList className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600">No orders yet</h3>
                <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
                <Link href="/products">
                  <Button className="bg-[#743181] hover:bg-[#5a2a6e]">
                    Browse Sweets
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order, index) => (
                <Card key={order.id || `order-${index}`} className="border-none shadow-lg overflow-hidden">
                  <CardHeader className="bg-gray-50 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <Package className="h-5 w-5 text-[#743181]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-[#743181]">{order.orderNumber || `#${index + 1}`}</p>
                          </div>
                          <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                        </div>
                      </div>
                      <Badge className={statusColors[order.status] || statusColors.pending}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {/* Items */}
                    <div className="space-y-4 mb-4">
                      {order.items.map((item, itemIndex) => (
                        <div key={`item-${index}-${itemIndex}`} className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 relative rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                              <img
                                src={item.product?.image}
                                alt={item.product?.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900 leading-tight mb-1">{item.product?.name}</p>
                              <p className="text-xs text-gray-500">
                                {item.weight && <span>{item.weight} • </span>}
                                Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-[#743181]">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Order Details */}
                    <div className="border-t pt-4 mt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Store className="h-4 w-4" />
                          <span className="text-sm">Store Pickup</span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Total Amount</p>
                          <p className="text-xl font-bold text-[#743181]">₹{order.total.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-4 border-t flex justify-between items-center">
                      <p className="text-sm text-gray-500">
                        Payment: <span className="font-medium text-gray-700 uppercase">{order.paymentMethod}</span>
                      </p>
                      <Link href={`/profile/orders/${order.orderNumber || order.id}`}>
                        <Button variant="ghost" size="sm" className="text-[#743181] hover:bg-purple-50">
                          View Details <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
