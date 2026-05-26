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
import { ChevronLeft, ChevronRight, Edit, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  isActive: boolean
  _count?: {
    products: number
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [pagination.page])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/categories?page=${pagination.page}&limit=${pagination.limit}`)
      const data = await response.json()
      setCategories(data.categories || [])
      if (data.pagination) {
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Category deleted successfully')
        fetchCategories()
      } else {
        toast.error('Failed to delete category')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Failed to delete category')
    }
  }

  const goToPage = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Categories</h2>
          <p className="text-gray-600">
            Manage your sweet categories • {pagination.total} total
          </p>
        </div>
        <Link href="/admin/categories/new">
          <Button className="bg-gradient-to-r from-[#743181] to-[#5a2a6e] text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </Link>
      </div>

      {/* Categories Table */}
      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#743181] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg italic">No categories found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-bold">Name</TableHead>
                    <TableHead className="font-bold">Slug</TableHead>
                    <TableHead className="font-bold text-center">Status</TableHead>
                    <TableHead className="font-bold text-center">Products</TableHead>
                    <TableHead className="text-right font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id} className="hover:bg-gray-50/50">
                      <TableCell className="font-semibold text-gray-900">
                        {category.name}
                        {category.description && (
                          <p className="text-xs text-gray-500 font-normal mt-1 line-clamp-1">
                            {category.description}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-600 font-mono text-xs">{category.slug}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={category.isActive ? "default" : "secondary"} className={category.isActive ? "bg-green-100 text-green-700 hover:bg-green-100 border-none" : "bg-gray-100 text-gray-600 border-none"}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="font-bold border-[#743181] text-[#743181]">
                          {category._count?.products || 0} items
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/categories/${category.id}`}>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-[#743181] text-[#743181] hover:bg-purple-50">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(category.id)}
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
