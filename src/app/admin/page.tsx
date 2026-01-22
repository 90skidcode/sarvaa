'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Package, ShoppingBag, Users } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])

  useEffect(() => {
    fetchStats()
    fetchRecentOrders()
  }, [])

  const fetchStats = async () => {
    try {
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/products'),
        fetch('/api/users')
      ])

      const ordersData = await ordersRes.json()
      const productsData = await productsRes.json()
      const usersData = await usersRes.json()

      const orders = ordersData.orders || (Array.isArray(ordersData) ? ordersData : [])
      const productsTotal = productsData.pagination?.total || (Array.isArray(productsData) ? productsData.length : 0)
      const usersTotal = usersData.total || (Array.isArray(usersData) ? usersData.length : 0)
      const ordersTotal = ordersData.pagination?.total || orders.length

      const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0)

      setStats({
        totalOrders: ordersTotal,
        totalRevenue,
        totalProducts: productsTotal,
        totalUsers: usersTotal
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchRecentOrders = async () => {
    try {
      const response = await fetch('/api/orders?limit=5')
      const data = await response.json()
      const orders = data.orders || (Array.isArray(data) ? data : [])
      setRecentOrders(orders.slice(0, 5))
    } catch (error) {
      console.error('Error fetching recent orders:', error)
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

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-600">Quick glimpse of your sweet shop performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm bg-gradient-to-br from-white to-purple-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-green-600 mt-1 font-medium">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-white to-green-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg text-green-600">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-green-600 mt-1 font-medium">+8% from last month</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-white to-blue-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Products</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Package className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-gray-500 mt-1">In your catalog</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-white to-pink-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
            <div className="p-2 bg-pink-100 rounded-lg text-pink-600">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-gray-500 mt-1">Registered accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="border-none shadow-sm">
        <CardHeader className="border-b bg-gray-50/50">
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500 italic">No orders yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
                    <th className="py-4 px-6 font-semibold">Order #</th>
                    <th className="py-4 px-6 font-semibold">Customer</th>
                    <th className="py-4 px-6 font-semibold">Total</th>
                    <th className="py-4 px-6 font-semibold">Status</th>
                    <th className="py-4 px-6 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 font-medium text-gray-900">{order.orderNumber}</td>
                      <td className="py-4 px-6">
                        <div className="text-sm font-medium text-gray-900">{order.userName || order.name || 'Guest'}</div>
                        <div className="text-xs text-gray-500">{order.userEmail || order.email}</div>
                      </td>
                      <td className="py-4 px-6 font-bold text-[#743181]">₹{order.total}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)} uppercase tracking-wide shadow-sm`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
