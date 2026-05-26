'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Upload, X } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  isActive: boolean
}

export default function EditCategoryPage() {
  const router = useRouter()
  const params = useParams()
  const categoryId = params?.id as string

  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    isActive: true
  })

  useEffect(() => {
    if (categoryId) {
      fetchCategory()
    }
  }, [categoryId])

  const fetchCategory = async () => {
    try {
      console.log('Fetching category ID:', categoryId)
      const response = await fetch(`/api/categories/${categoryId}`)
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('API Response:', data)
        
        const categoryData = data.category || data
        
        if (!categoryData || !categoryData.id) {
          console.error('Invalid category data received')
          toast.error('Invalid category data')
          router.push('/admin/categories')
          return
        }
        
        setCategory(categoryData)
        setFormData({
          name: categoryData.name,
          slug: categoryData.slug,
          description: categoryData.description || '',
          isActive: categoryData.isActive
        })
        setImagePreview(categoryData.image || '')
      } else {
        const errorText = await response.text()
        console.error('API Error:', response.status, errorText)
        toast.error('Category not found')
        router.push('/admin/categories')
      }
    } catch (error) {
      console.error('Fetch error:', error)
      toast.error('Failed to load category')
      router.push('/admin/categories')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(category?.image || '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setSaving(true)

    try {
      let imageUrl = category?.image || null

      if (imageFile) {
        const formDataImage = new FormData()
        formDataImage.append('file', imageFile)

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formDataImage
        })

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image')
        }

        const { url } = await uploadResponse.json()
        imageUrl = url
      }

      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          image: imageUrl,
          isActive: formData.isActive
        })
      })

      if (response.ok) {
        toast.success('Category updated successfully')
        router.push('/admin/categories')
      } else {
        toast.error('Failed to update category')
      }
    } catch (error) {
      console.error('Error updating category:', error)
      toast.error('Failed to update category')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#743181] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading category...</p>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Category not found</p>
          <Link href="/admin/categories">
            <Button className="mt-4">Back to Categories</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Link href="/admin/categories" className="inline-flex items-center text-[#743181] hover:text-[#5a2a6e] font-medium mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Edit Category</h1>
          <p className="text-gray-600 mt-2">Update category information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Category Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload - FIXED */}
              <div className="space-y-2">
                <Label htmlFor="image">Category Image</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {imagePreview ? (
                    <div className="space-y-4">
                      <div className="relative inline-block">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-w-xs max-h-64 rounded-lg"
                        />
                        {imageFile && (
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <label htmlFor="image" className="inline-block cursor-pointer">
                        <span className="text-[#743181] hover:text-[#5a2a6e] font-medium text-sm underline">
                          Change Image
                        </span>
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                      <div className="text-sm text-gray-600">
                        <label htmlFor="image" className="cursor-pointer text-[#743181] hover:text-[#5a2a6e] font-medium">
                          Click to upload
                        </label>
                        {' '}or drag and drop
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  )}
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-gray-500">Leave unchanged to keep current image</p>
              </div>

              {/* Name and Slug */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value
                      setFormData({
                        ...formData,
                        name,
                        slug: name.toLowerCase().replaceAll(/\s+/g, '-').replaceAll(/[^a-z0-9-]/g, '')
                      })
                    }}
                    placeholder="e.g., Traditional Sweets"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="traditional-sweets"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Describe the category..."
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-[#743181] focus:ring-[#743181]"
                />
                <Label htmlFor="isActive" className="cursor-pointer text-gray-700 font-medium">
                  Visibility: Category is Active & Visible to Customers
                </Label>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-gradient-to-r from-[#743181] to-[#5a2a6e] text-white"
                >
                  {saving ? 'Saving...' : 'Update Category'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/categories')}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
