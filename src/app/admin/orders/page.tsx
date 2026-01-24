'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, ClipboardList, Search } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface Order {
  id: string
  orderNumber: string
  status: string
  total: number
  phone: string
  address: string
  name: string | null
  email: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
  } | null
  items: {
    id: string
    quantity: number
    price: number
    product: {
      id: string
      name: string
      image: string
    }
  }[]
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchOrders()
  }, [statusFilter])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      let url = '/api/orders'
      if (statusFilter !== 'all') {
        url += `?status=${statusFilter}`
      }

      const response = await fetch(url)
      const data = await response.json()
      // Handle response format from API { orders: [...] }
      setOrders(Array.isArray(data.orders) ? data.orders : [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        toast.success(`Order ${status} updated`)
        fetchOrders()
      } else {
        toast.error('Failed to update status')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Something went wrong')
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      ready: 'bg-green-100 text-green-800',
      delivered: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const filteredOrders = orders.filter(order =>
    order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (order.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (order.user?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (order.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (order.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/admin" className="text-gray-600 hover:text-pink-600">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Orders Management</h1>
                <p className="text-sm text-gray-600">Manage customer orders</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  View Site
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filters Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                >
                  All ({statusCounts.all})
                </Button>
                <Button
                  variant={statusFilter === 'pending' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('pending')}
                >
                  Pending ({statusCounts.pending})
                </Button>
                <Button
                  variant={statusFilter === 'confirmed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('confirmed')}
                >
                  Confirmed ({statusCounts.confirmed})
                </Button>
                <Button
                  variant={statusFilter === 'preparing' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('preparing')}
                >
                  Preparing ({statusCounts.preparing})
                </Button>
                <Button
                  variant={statusFilter === 'ready' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('ready')}
                >
                  Ready ({statusCounts.ready})
                </Button>
                <Button
                  variant={statusFilter === 'delivered' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('delivered')}
                >
                  Delivered ({statusCounts.delivered})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ClipboardList className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No orders found</h2>
              <p className="text-gray-500">
                {statusFilter === 'all'
                  ? 'No orders have been placed yet'
                  : `No ${statusFilter} orders found`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold">{order.orderNumber}</h3>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </div>
                          <p className="text-gray-600">
                            <span className="font-medium">{order.user?.name || order.name || 'Guest'}</span> ({order.user?.email || order.email || 'N/A'})
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-[#743181]">₹{order.total.toFixed(2)}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Phone</p>
                            <p className="text-gray-600">{order.phone}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Address</p>
                            <p className="text-gray-600">{order.address}</p>
                          </div>
                        </div>
                        {order.notes && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">Notes</p>
                            <p className="text-gray-600">{order.notes}</p>
                          </div>
                        )}
                      </div>

                      {/* Order Items */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
                        <div className="space-y-3">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div className="flex-1">
                                <p className="font-semibold">{item.product.name}</p>
                                <p className="text-sm text-gray-600">Qty: {item.quantity} × ₹{item.price.toFixed(2)}</p>
                              </div>
                              <p className="font-bold">₹{(item.quantity * item.price).toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="lg:w-64 space-y-2">
                      <p className="text-sm font-medium text-gray-700 mb-2">Update Status</p>
                      <Select
                        value={order.status}
                        onValueChange={(value) => updateOrderStatus(order.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="preparing">Preparing</SelectItem>
                          <SelectItem value="ready">Ready</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-gray-600 mb-2">Quick Actions</p>
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => updateOrderStatus(order.id, 'confirmed')}
                            disabled={order.status === 'cancelled'}
                          >
                            Mark Confirmed
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => updateOrderStatus(order.id, 'ready')}
                            disabled={order.status === 'cancelled' || order.status === 'delivered'}
                          >
                            Mark Ready
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-green-600 hover:text-green-700"
                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                            disabled={order.status === 'cancelled' || order.status === 'delivered'}
                          >
                            Mark Delivered
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
