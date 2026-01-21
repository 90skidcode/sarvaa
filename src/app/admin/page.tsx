'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingBag, Package, TrendingUp, DollarSign, Users, Cake, LogOut, LayoutDashboard, Tag, ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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

      const totalRevenue = ordersData.orders?.reduce((sum: number, order: any) => sum + order.total, 0) || 0

      setStats({
        totalOrders: ordersData.orders?.length || 0,
        totalRevenue,
        totalProducts: productsData.products?.length || 0,
        totalUsers: usersData.users?.length || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchRecentOrders = async () => {
    try {
      const response = await fetch('/api/orders?limit=5')
      const data = await response.json()
      setRecentOrders(data.orders?.slice(0, 5) || [])
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
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-pink-600 text-white p-2 rounded-lg">
                <Cake className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Sweet Delights Cake Shop</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <Cake className="h-4 w-4 mr-2" />
                  View Site
                </Button>
              </Link>
              <Button variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <nav className="bg-white rounded-lg shadow-sm p-4 space-y-2 sticky top-24">
              <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-pink-50 text-pink-700 font-semibold">
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
              </Link>
              <Link href="/admin/products" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors">
                <Package className="h-5 w-5" />
                Products
              </Link>
              <Link href="/admin/categories" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors">
                <Tag className="h-5 w-5" />
                Categories
              </Link>
              <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors">
                <ClipboardList className="h-5 w-5" />
                Orders
              </Link>
              <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors">
                <Users className="h-5 w-5" />
                Users
              </Link>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
                  <ShoppingBag className="h-5 w-5 text-pink-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalOrders}</div>
                  <p className="text-xs text-gray-500 mt-1">All time orders</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                  <DollarSign className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-gray-500 mt-1">All time revenue</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Products</CardTitle>
                  <Package className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalProducts}</div>
                  <p className="text-xs text-gray-500 mt-1">Active products</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Users</CardTitle>
                  <Users className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-gray-500 mt-1">Registered users</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {recentOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No orders yet</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-semibold text-gray-600">Order #</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-600">Customer</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-600">Total</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-600">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order) => (
                          <tr key={order.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <Link href={`/admin/orders/${order.id}`} className="text-pink-600 hover:underline">
                                {order.orderNumber}
                              </Link>
                            </td>
                            <td className="py-3 px-4">{order.user?.name || 'Unknown'}</td>
                            <td className="py-3 px-4 font-semibold">${order.total.toFixed(2)}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="mt-4">
                  <Link href="/admin/orders">
                    <Button variant="outline" className="w-full">
                      View All Orders
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link href="/admin/products/new">
                    <Button variant="outline" className="w-full h-full py-6 flex flex-col gap-2">
                      <Package className="h-8 w-8" />
                      <span>Add New Product</span>
                    </Button>
                  </Link>
                  <Link href="/admin/categories/new">
                    <Button variant="outline" className="w-full h-full py-6 flex flex-col gap-2">
                      <Tag className="h-8 w-8" />
                      <span>Add New Category</span>
                    </Button>
                  </Link>
                  <Link href="/admin/orders">
                    <Button variant="outline" className="w-full h-full py-6 flex flex-col gap-2">
                      <ClipboardList className="h-8 w-8" />
                      <span>Manage Orders</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  )
}
