'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { Calendar, ChevronLeft, ChevronRight, Edit, Plus, Search, Ticket, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface Coupon {
  id: string
  code: string
  discountType: string
  discountValue: number
  minCartValue: number
  startDate: string
  expiryDate: string
  usageLimit: number | null
  usedCount: number
  isActive: boolean
  createdAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchCoupons()
  }, [pagination.page])

  const fetchCoupons = async () => {
    setLoading(true)
    try {
      const url = `/api/coupons?page=${pagination.page}&limit=${pagination.limit}`
      const response = await fetch(url)
      const data = await response.json()
      
      setCoupons(data.coupons || [])
      if (data.pagination) {
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching coupons:', error)
      toast.error('Failed to load coupons')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return

    try {
      const response = await fetch(`/api/coupons/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Coupon deleted successfully')
        fetchCoupons()
      } else {
        toast.error('Failed to delete coupon')
      }
    } catch (error) {
      console.error('Error deleting coupon:', error)
      toast.error('Failed to delete coupon')
    }
  }

  const goToPage = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }

  const filteredCoupons = searchQuery
    ? coupons.filter(coupon =>
        coupon.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : coupons

  const isExpired = (date: string) => new Date(date) < new Date()

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Coupons</h2>
          <p className="text-gray-600">
            Manage your promotional discounts • {pagination.total} total
          </p>
        </div>
        <Link href="/admin/coupons/new">
          <Button className="bg-gradient-to-r from-[#743181] to-[#5a2a6e] text-white shadow-lg shadow-purple-100">
            <Plus className="h-4 w-4 mr-2" />
            Create Coupon
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by coupon code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/80 border-purple-50 focus:border-purple-200 transition-all"
            />
          </div>
        </CardContent>
      </Card>

      {/* Coupons Table */}
      <Card className="border-none shadow-sm overflow-hidden bg-white/70 backdrop-blur-md">
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#743181] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading coupons...</p>
            </div>
          ) : filteredCoupons.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="h-12 w-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No coupons found</p>
              <p className="text-gray-400 text-sm">Get started by creating your first promotional code.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-purple-50/50">
                    <TableRow>
                      <TableHead className="min-w-[150px]">Code</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Min Order</TableHead>
                      <TableHead>Validity</TableHead>
                      <TableHead className="text-center">Usage</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCoupons.map((coupon) => {
                      const expired = isExpired(coupon.expiryDate)
                      return (
                        <TableRow key={coupon.id} className="hover:bg-purple-50/20 transition-colors">
                          <TableCell>
                            <div className="font-black text-gray-900 tracking-tight flex items-center gap-2 font-mono bg-purple-50 inline-block px-3 py-1 rounded-lg border border-purple-100">
                                {coupon.code}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-bold text-[#743181]">
                                {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                            </div>
                            <div className="text-[10px] text-gray-400 uppercase font-black">{coupon.discountType}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium text-gray-600">₹{coupon.minCartValue}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                    <Calendar className="h-3 w-3 text-green-500" />
                                    {format(new Date(coupon.startDate), 'MMM dd, yyyy')}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                    <Calendar className="h-3 w-3 text-red-500" />
                                    {format(new Date(coupon.expiryDate), 'MMM dd, yyyy')}
                                </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center">
                                <div className="text-sm font-bold text-gray-700">{coupon.usedCount}</div>
                                <div className="text-[10px] text-gray-400 uppercase font-black">
                                    {coupon.usageLimit ? `LIMIT: ${coupon.usageLimit}` : 'UNLIMITED'}
                                </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col gap-1 items-center">
                                {expired ? (
                                    <Badge variant="outline" className="bg-red-50 text-red-700 border-none px-2 py-0">
                                        Expired
                                    </Badge>
                                ) : (
                                    <Badge variant={coupon.isActive ? "default" : "secondary"} className={coupon.isActive ? "bg-green-100 text-green-700 border-none px-2 py-0" : "bg-gray-100 text-gray-600 border-none px-2 py-0"}>
                                        {coupon.isActive ? 'Active' : 'Disabled'}
                                    </Badge>
                                )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Link href={`/admin/coupons/${coupon.id}`}>
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-[#743181] text-[#743181] hover:bg-purple-50 rounded-lg">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(coupon.id)}
                                className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 border-red-100 rounded-lg"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 bg-purple-50/30 border-t border-purple-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Page {pagination.page} / {pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="rounded-xl border-purple-100 hover:bg-white"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                      className="rounded-xl border-purple-100 hover:bg-white"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
