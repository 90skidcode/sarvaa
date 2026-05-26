'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { ChevronLeft, ChevronRight, Edit, Mail, Phone, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface Store {
  id: string
  name: string
  address: string
  phone: string | null
  email: string | null
  isActive: boolean
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AdminStoresPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStores()
  }, [pagination.page])

  const fetchStores = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/stores?page=${pagination.page}&limit=${pagination.limit}`)
      const data = await response.json()
      setStores(data.stores || [])
      if (data.pagination) {
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching stores:', error)
      toast.error('Failed to load stores')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this store?')) return

    try {
      const response = await fetch(`/api/stores/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Store deleted successfully')
        fetchStores()
      } else {
        toast.error('Failed to delete store')
      }
    } catch (error) {
      console.error('Error deleting store:', error)
      toast.error('Failed to delete store')
    }
  }

  const goToPage = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Store Locations</h2>
          <p className="text-gray-600">
            Manage your physical pickup points • {pagination.total} total
          </p>
        </div>
        <Link href="/admin/stores/new">
          <Button className="bg-gradient-to-r from-[#743181] to-[#5a2a6e] text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Store
          </Button>
        </Link>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#743181] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading stores...</p>
            </div>
          ) : stores.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg italic">No stores found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-bold">Store Details</TableHead>
                    <TableHead className="font-bold">Contact Info</TableHead>
                    <TableHead className="text-center font-bold">Status</TableHead>
                    <TableHead className="text-right font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stores.map((store) => (
                    <TableRow key={store.id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell>
                        <div className="font-semibold text-gray-900">{store.name}</div>
                        <div className="text-xs text-gray-500 max-w-xs line-clamp-2 mt-1">{store.address}</div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {store.phone && (
                            <div className="flex items-center text-xs text-gray-600">
                              <Phone className="h-3 w-3 mr-1 text-[#743181]" />
                              {store.phone}
                            </div>
                          )}
                          {store.email && (
                            <div className="flex items-center text-xs text-gray-600">
                              <Mail className="h-3 w-3 mr-1 text-[#743181]" />
                              {store.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={store.isActive ? "default" : "secondary"} className={store.isActive ? "bg-green-100 text-green-700 hover:bg-green-100 border-none" : "bg-gray-100 text-gray-600 border-none"}>
                          {store.isActive ? 'Active' : 'Hidden'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/stores/${store.id}`}>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-[#743181] text-[#743181] hover:bg-purple-50">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(store.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 border-red-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-t">
                  <p className="text-sm text-gray-600">
                    Showing page {pagination.page} of {pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
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
