'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Plus, Trash2, Upload, X } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
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

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  image: string
  stock: number
  featured: boolean
  isActive: boolean
  weights: string | null
  category: {
    id: string
    name: string
  }
  images: string | null
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params?.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([])
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([])
  
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

  const [variants, setVariants] = useState<ProductVariant[]>([])

  useEffect(() => {
    if (productId) {
      fetchProduct()
      fetchCategories()
      fetchUnits()
    }
  }, [productId])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${productId}`)
      if (response.ok) {
        const data = await response.json()
        const productData = data.product || data
        
        setProduct(productData)
        setFormData({
          name: productData.name,
          slug: productData.slug,
          description: productData.description,
          price: productData.price.toString(),
          stock: productData.stock.toString(),
          featured: productData.featured,
          isActive: productData.isActive,
          categoryId: productData.category.id
        })
        setImagePreview(productData.image)

        // Load existing additional images
        if (productData.images) {
          try {
            const existingImages = JSON.parse(productData.images)
            if (Array.isArray(existingImages)) {
              setAdditionalImagePreviews(existingImages)
              setAdditionalImageFiles(new Array(existingImages.length).fill(null))
            }
          } catch (e) {
            console.error('Error parsing images:', e)
          }
        }

        // Handle variants
        if (productData.weights) {
            try {
                const parsedVariants = typeof productData.weights === 'string' ? JSON.parse(productData.weights) : productData.weights
                setVariants(parsedVariants.map((v: any) => ({
                    type: v.type || 'Grams',
                    value: (v.value || v.weight || '').toString(),
                    price: v.price.toString()
                })))
            } catch (e) {
                console.error('Error parsing variants:', e)
            }
        }
      } else {
        toast.error('Product not found')
        router.push('/admin/products')
      }
    } catch (error) {
      console.error('Fetch error:', error)
      toast.error('Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories?limit=100')
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
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
    setImagePreview(product?.image || '')
  }

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const maxAdditional = 5
    
    if (additionalImagePreviews.length + files.length > maxAdditional) {
      toast.error(`Maximum ${maxAdditional} additional images allowed`)
      return
    }

    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAdditionalImagePreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
    
    setAdditionalImageFiles(prev => [...prev, ...files])
  }

  const removeAdditionalImage = (index: number) => {
    setAdditionalImageFiles(prev => prev.filter((_, i) => i !== index))
    setAdditionalImagePreviews(prev => prev.filter((_, i) => i !== index))
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
    setSaving(true)

    // Filter out empty variants
    const filteredVariants = variants.filter(v => v.value && v.price)

    try {
      const { url: finalImageUrl } = imageFile ? await (async () => {
        const formDataImage = new FormData()
        formDataImage.append('file', imageFile)
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formDataImage
        })
        if (!uploadResponse.ok) throw new Error('Failed to upload primary image')
        return await uploadResponse.json()
      })() : { url: product?.image || '' }

      // Upload ONLY new additional images and maintain order
      const finalAdditionalUrls: string[] = []
      for (let i = 0; i < additionalImagePreviews.length; i++) {
        const file = additionalImageFiles[i]
        const preview = additionalImagePreviews[i]

        if (file) {
          // It's a new file, upload it
          const additionalFormData = new FormData()
          additionalFormData.append('file', file)
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: additionalFormData
          })
          if (uploadRes.ok) {
            const { url } = await uploadRes.json()
            finalAdditionalUrls.push(url)
          }
        } else if (preview.startsWith('http') || preview.startsWith('/')) {
          // It's an existing URL, keep it
          finalAdditionalUrls.push(preview)
        }
      }

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          price: Number.parseFloat(formData.price),
          stock: Number.parseInt(formData.stock),
          image: finalImageUrl,
          images: finalAdditionalUrls.length > 0 ? JSON.stringify(finalAdditionalUrls) : null,
          isActive: formData.isActive,
          weights: filteredVariants.length > 0 ? filteredVariants.map(v => ({ 
            type: v.type, 
            value: v.value, 
            price: Number.parseFloat(v.price) 
          })) : null
        })
      })

      if (response.ok) {
        toast.success('Product updated successfully')
        router.push('/admin/products')
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || errorData.error || 'Failed to update product')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error('Failed to update product')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#743181] mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading product details...</p>
        </div>
      </div>
    )
  }

  if (!product) return null

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-8">
          <Link href="/admin/products" className="inline-flex items-center text-[#743181] hover:text-[#5a2a6e] font-medium mb-4 group">
            <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Products
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Edit Product</h1>
          <p className="text-gray-500 mt-2 font-medium">Modify variant options and pricing for <span className="text-[#743181]">{product.name}</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Visual Excellence: Product Header Preview Card */}
          <Card className="border-none shadow-premium bg-gradient-to-br from-[#743181] to-[#5a2a6e] text-white overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
             <CardContent className="p-8 relative">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="relative group">
                        <img 
                            src={imagePreview} 
                            alt={formData.name} 
                            className="w-40 h-40 object-cover rounded-2xl border-4 border-white/20 shadow-2xl"
                        />
                        <label htmlFor="image" className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl cursor-pointer">
                            <Upload className="h-8 w-8 text-white" />
                        </label>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-3xl font-bold mb-2">{formData.name || 'Product Name'}</h2>
                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                             <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{product.category.name}</span>
                             <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Starts from ₹{formData.price}</span>
                             {formData.isActive ? (
                                <span className="bg-emerald-400 text-emerald-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Active</span>
                             ) : (
                                <span className="bg-amber-400 text-amber-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Hidden</span>
                             )}
                        </div>
                    </div>
                </div>
             </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="border-b bg-gray-50/50">
              <CardTitle className="text-gray-800">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-600 font-bold ml-1">Product Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value
                      setFormData({
                        ...formData,
                        name,
                        slug: name.toLowerCase().replaceAll(/\s+/g, '-').replaceAll(/[^a-z0-9-]/g, '')
                      })
                    }}
                    className="rounded-xl border-gray-100"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-600 font-bold ml-1">URL Slug</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="rounded-xl border-gray-100 bg-gray-50"
                    required
                  />
                </div>
              </div>

              {/* Additional Images Gallery */}
              <div className="space-y-2">
                <Label className="text-gray-600 font-bold ml-1">Additional Images (Optional)</Label>
                <p className="text-xs text-gray-400 ml-1">Add up to 5 more images for your product gallery</p>
                
                {additionalImagePreviews.length > 0 && (
                  <div className="grid grid-cols-5 gap-3 mb-4 mt-2">
                    {additionalImagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Additional ${index + 1}`}
                          className="w-full aspect-square object-cover rounded-xl shadow-md border border-gray-100"
                        />
                        <button
                          type="button"
                          onClick={() => removeAdditionalImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {additionalImagePreviews.length < 5 && (
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center bg-gray-50/30 hover:bg-gray-50 transition-colors">
                    <label htmlFor="additional-images" className="cursor-pointer">
                      <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-600">
                        Add More Images ({additionalImagePreviews.length}/5)
                      </p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB each</p>
                    </label>
                    <input
                      id="additional-images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleAdditionalImagesChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-gray-600 font-bold ml-1">Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="rounded-xl border-gray-100"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-600 font-bold ml-1">Stock Quantity</Label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="rounded-xl border-gray-100"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-600 font-bold ml-1">Category</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                  >
                    <SelectTrigger className="rounded-xl border-gray-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
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
              
              <div className="mt-8 flex items-center justify-between p-6 bg-orange-900/5 rounded-3xl border border-orange-100">
                <div className="space-y-1">
                    <Label className="text-orange-900 font-bold block">Base Price (₹)</Label>
                    <p className="text-xs text-orange-600 font-medium opacity-80">Syncs with the first variant for catalog display</p>
                </div>
                <div className="text-3xl font-black text-orange-900">
                    <span className="text-xl mr-1 opacity-40">₹</span>
                    {formData.price || '0'}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
             <CardContent className="p-6 grid grid-cols-2 gap-4">
                <label className="flex items-center gap-4 p-5 rounded-3xl border-2 border-gray-50 hover:border-purple-100 hover:bg-purple-50/50 cursor-pointer transition-all group">
                    <input 
                        type="checkbox" 
                        checked={formData.featured}
                        onChange={e => setFormData({...formData, featured: e.target.checked})}
                        className="w-6 h-6 rounded-lg border-2 border-purple-200 text-[#743181] focus:ring-[#743181]"
                    />
                    <div>
                        <span className="font-bold text-gray-800 block group-hover:text-[#743181]">Featured</span>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Homepage Display</span>
                    </div>
                </label>
                <label className="flex items-center gap-4 p-5 rounded-3xl border-2 border-gray-50 hover:border-emerald-100 hover:bg-emerald-50/50 cursor-pointer transition-all group">
                    <input 
                        type="checkbox" 
                        checked={formData.isActive}
                        onChange={e => setFormData({...formData, isActive: e.target.checked})}
                        className="w-6 h-6 rounded-lg border-2 border-emerald-200 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                        <span className="font-bold text-gray-800 block group-hover:text-emerald-600">Active Status</span>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Publicly Visible</span>
                    </div>
                </label>
             </CardContent>
          </Card>

          <div className="flex gap-4 pt-4 pb-20">
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-[#743181] to-purple-600 hover:to-[#5a2a6e] text-white py-8 rounded-3xl shadow-xl shadow-purple-900/10 text-xl font-black tracking-tight transform transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {saving ? 'Saving Changes...' : 'Save Product Changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/products')}
              className="px-10 py-8 rounded-3xl border-2 font-bold text-gray-500 hover:bg-gray-50"
            >
              Discard
            </Button>
          </div>
        </form>
        <input id="image" type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
      </div>
    </div>
  )
}
