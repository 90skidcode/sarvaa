'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Plus, Trash2, Upload, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
}

interface Unit {
  id: string
  name: string
  abbreviation: string
}

interface ProductVariant {
  type: string
  value: string
  price: string
}

export default function NewProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    stock: '',
    featured: false,
    isActive: true,
    categoryId: ''
  })

  const [variants, setVariants] = useState<ProductVariant[]>([
    { type: 'Grams', value: '250', price: '' },
    { type: 'Grams', value: '500', price: '' },
    { type: 'Kilograms', value: '1', price: '' }
  ])

  useEffect(() => {
    fetchCategories()
    fetchUnits()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories?limit=100')
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to load categories')
    }
  }

  const fetchUnits = async () => {
    try {
      const response = await fetch('/api/units')
      const data = await response.json()
      setUnits(data.units || [])
    } catch (error) {
      console.error('Error fetching units:', error)
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
    setImagePreview('')
  }

  const addVariant = () => {
    setVariants([...variants, { type: units[0]?.name || 'Grams', value: '', price: '' }])
  }

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  const updateVariant = (index: number, field: keyof ProductVariant, value: string) => {
    const newVariants = [...variants]
    newVariants[index][field] = value
    setVariants(newVariants)
    
    // Auto-update base price if the first variant price is filled
    if (index === 0 && field === 'price' && value) {
        setFormData(prev => ({ ...prev, price: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!imageFile) {
      toast.error('Please select an image')
      return
    }

    // Filter out empty variants
    const filteredVariants = variants.filter(v => v.value && v.price)

    setLoading(true)

    try {
      // First upload the image
      const formDataImage = new FormData()
      formDataImage.append('file', imageFile)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formDataImage
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image')
      }

      const { url: imageUrl } = await uploadResponse.json()

      // Then create the product
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          price: Number.parseFloat(formData.price),
          stock: Number.parseInt(formData.stock),
          image: imageUrl,
          isActive: formData.isActive,
          weights: filteredVariants.length > 0 ? filteredVariants.map(v => ({ 
            type: v.type, 
            value: v.value, 
            price: Number.parseFloat(v.price) 
          })) : null
        })
      })

      if (response.ok) {
        toast.success('Product created successfully')
        router.push('/admin/products')
      } else {
        toast.error('Failed to create product')
      }
    } catch (error) {
      console.error('Error creating product:', error)
      toast.error('Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/products" className="inline-flex items-center text-[#743181] hover:text-[#5a2a6e] font-medium mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-600 mt-2">Fill in the details for your multi-unit sweet product</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="border-none shadow-sm">
            <CardHeader className="bg-purple-50/50">
              <CardTitle className="text-[#743181]">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="image">Product Image *</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center bg-gray-50/50 transition-colors hover:bg-gray-50">
                  {imagePreview ? (
                    <div className="relative inline-block group">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-w-xs max-h-64 rounded-xl shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg transform transition-transform group-hover:scale-110"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto shadow-sm">
                        <Upload className="h-8 w-8 text-[#743181]" />
                      </div>
                      <div className="text-sm text-gray-600">
                        <label htmlFor="image" className="cursor-pointer text-[#743181] hover:text-[#5a2a6e] font-bold underline underline-offset-4">
                          Click to upload
                        </label>
                        {' '}or drag and drop
                      </div>
                      <p className="text-xs text-gray-400 font-medium">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    required
                  />
                </div>
              </div>

              {/* Name and Slug */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700 font-semibold">Product Name *</Label>
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
                    placeholder="e.g., Premium Ghee Mysore Pak"
                    className="rounded-xl border-gray-200 focus:ring-purple-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-gray-700 font-semibold">URL Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="mysore-pak"
                    className="rounded-xl border-gray-200 bg-gray-50"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-700 font-semibold">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Tell customers about the taste, texture, and ingredients..."
                  className="rounded-xl border-gray-200 focus:ring-purple-500"
                  required
                />
              </div>

              {/* Stock and Category */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="stock" className="text-gray-700 font-semibold">Stock Quantity *</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="0"
                    className="rounded-xl border-gray-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-gray-700 font-semibold">Category *</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                  >
                    <SelectTrigger className="rounded-xl border-gray-200">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Variants */}
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-orange-50/50 flex flex-row items-center justify-between py-6">
              <div>
                <CardTitle className="text-orange-700">Product Variants</CardTitle>
                <p className="text-xs text-orange-600/70 mt-1 uppercase font-bold tracking-wider">Define types, quantities, and pricing</p>
              </div>
              <Button 
                type="button" 
                onClick={addVariant}
                variant="outline"
                size="sm"
                className="border-orange-200 text-orange-700 hover:bg-orange-100 rounded-lg"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Variant
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {variants.map((v, index) => (
                  <div key={`variant-${index}`} className="grid grid-cols-12 gap-4 items-end animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="col-span-4 space-y-2">
                      <Label className="text-xs font-bold text-gray-500 uppercase">Type (from setup)</Label>
                      <Select
                        value={v.type}
                        onValueChange={(value) => updateVariant(index, 'type', value)}
                      >
                        <SelectTrigger className="rounded-xl border-gray-100 bg-white">
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit.id} value={unit.name}>
                              {unit.name} ({unit.abbreviation})
                            </SelectItem>
                          ))}
                          {units.length === 0 && (
                            <>
                              <SelectItem value="Grams">Grams (g)</SelectItem>
                              <SelectItem value="Kilograms">Kilograms (kg)</SelectItem>
                              <SelectItem value="Pieces">Pieces (pcs)</SelectItem>
                              <SelectItem value="Milliliters">Milliliters (ml)</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3 space-y-2">
                      <Label className="text-xs font-bold text-gray-500 uppercase">Variant Value</Label>
                      <Input
                        value={v.value}
                        onChange={(e) => updateVariant(index, 'value', e.target.value)}
                        placeholder="e.g. 250"
                        className="rounded-xl border-gray-100 bg-white"
                      />
                    </div>
                    <div className="col-span-4 space-y-2">
                      <Label className="text-xs font-bold text-gray-500 uppercase">Price (₹)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={v.price}
                        onChange={(e) => updateVariant(index, 'price', e.target.value)}
                        placeholder="0.00"
                        className="rounded-xl border-gray-100 bg-white"
                      />
                    </div>
                    <div className="col-span-1 py-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeVariant(index)}
                        className="text-gray-400 hover:text-red-500 h-10 w-10 rounded-xl"
                        disabled={variants.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-center">
                    <div>
                        <Label className="text-gray-700 font-bold">Base Price (₹)</Label>
                        <p className="text-xs text-gray-500">Auto-filled from first variant</p>
                    </div>
                    <Input
                      type="number"
                      value={formData.price}
                      readOnly
                      className="w-32 bg-white font-bold text-center text-[#743181] rounded-xl border-none shadow-inner"
                    />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visibility & Settings */}
          <Card className="border-none shadow-sm">
            <CardHeader className="bg-gray-50/50">
              <CardTitle className="text-gray-700">Visibility & Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <label htmlFor="featured-toggle" className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:bg-purple-50/30 transition-colors cursor-pointer group">
                <input
                  id="featured-toggle"
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-5 h-5 rounded-lg border-gray-300 text-[#743181] focus:ring-[#743181]"
                />
                <div>
                    <span className="block font-bold text-gray-900 group-hover:text-[#743181]">Featured Product</span>
                    <span className="text-xs text-gray-500">Highlight this product on the home page</span>
                </div>
              </label>

              <label htmlFor="active-toggle" className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:bg-purple-50/30 transition-colors cursor-pointer group">
                <input
                  id="active-toggle"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 rounded-lg border-gray-300 text-[#743181] focus:ring-[#743181]"
                />
                <div>
                    <span className="block font-bold text-gray-900 group-hover:text-[#743181]">Active & Visible</span>
                    <span className="text-xs text-gray-500">Make this product live for customers to purchase</span>
                </div>
              </label>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4 pb-12">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-[#743181] to-[#5a2a6e] hover:from-[#5a2a6e] hover:to-[#743181] text-white py-6 rounded-2xl shadow-lg transform transition-all hover:scale-[1.01] active:scale-[0.99] text-lg font-bold"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/50 border-t-white"></div>
                  Creating Product...
                </div>
              ) : 'Publish Product'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/products')}
              disabled={loading}
              className="px-8 py-6 rounded-2xl border-2 text-gray-600 font-bold"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
