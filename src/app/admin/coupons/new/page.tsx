'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import { ArrowLeft, Calendar, CheckCircle2, Info, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
}

export default function NewCouponPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minCartValue: '0',
    maxDiscountCap: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    expiryDate: format(new Date(new Date().setMonth(new Date().getMonth() + 1)), 'yyyy-MM-dd'),
    usageLimit: '',
    userLimit: '1',
    isActive: true,
    applicableProductIds: [] as string[],
    applicableCategoryIds: [] as string[],
  })

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories?limit=100')
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=100')
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData({ ...formData, code })
  }

  const toggleCategory = (id: string) => {
    setFormData(prev => ({
      ...prev,
      applicableCategoryIds: prev.applicableCategoryIds.includes(id)
        ? prev.applicableCategoryIds.filter(cid => cid !== id)
        : [...prev.applicableCategoryIds, id]
    }))
  }

  const toggleProduct = (id: string) => {
    setFormData(prev => ({
      ...prev,
      applicableProductIds: prev.applicableProductIds.includes(id)
        ? prev.applicableProductIds.filter(pid => pid !== id)
        : [...prev.applicableProductIds, id]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          discountValue: Number.parseFloat(formData.discountValue),
          minCartValue: Number.parseFloat(formData.minCartValue),
          maxDiscountCap: formData.maxDiscountCap ? Number.parseFloat(formData.maxDiscountCap) : null,
          usageLimit: formData.usageLimit ? Number.parseInt(formData.usageLimit) : null,
          userLimit: Number.parseInt(formData.userLimit),
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Coupon created successfully')
        router.push('/admin/coupons')
      } else {
        toast.error(data.error || 'Failed to create coupon')
      }
    } catch (error) {
      console.error('Error creating coupon:', error)
      toast.error('Failed to create coupon')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f0f7]/30 py-8 font-outfit">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Link href="/admin/coupons" className="inline-flex items-center text-[#743181] hover:text-[#5a2a6e] font-bold mb-4 group">
            <div className="p-1.5 rounded-lg bg-white shadow-sm border border-purple-100 mr-2 group-hover:scale-110 transition-transform">
                <ArrowLeft className="h-4 w-4" />
            </div>
            Back to Coupons
          </Link>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Create New Coupon</h1>
          <p className="text-gray-500 mt-2 font-medium">Design a promotion to boost your sales</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Code and Basic Info */}
          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b border-purple-100/50">
              <CardTitle className="text-[#743181] flex items-center gap-2">
                <div className="p-2 rounded-xl bg-white shadow-sm">
                    <CheckCircle2 className="h-5 w-5" />
                </div>
                General Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="code" className="text-gray-700 font-black uppercase tracking-widest text-[10px]">Coupon Code *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="E.G. WELCOME10"
                      className="rounded-2xl border-purple-100 bg-white focus:ring-purple-500 font-mono font-bold"
                      required
                    />
                    <Button 
                      type="button" 
                      onClick={generateCode}
                      variant="outline"
                      className="rounded-2xl border-purple-100 text-[#743181] hover:bg-purple-50 font-bold"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Generate
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="discountType" className="text-gray-700 font-black uppercase tracking-widest text-[10px]">Discount Type *</Label>
                  <Select
                    value={formData.discountType}
                    onValueChange={(value) => setFormData({ ...formData, discountType: value })}
                  >
                    <SelectTrigger className="rounded-2xl border-purple-100 bg-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="discountValue" className="text-gray-700 font-black uppercase tracking-widest text-[10px]">Discount Value *</Label>
                  <div className="relative">
                    <Input
                      id="discountValue"
                      type="number"
                      step="0.01"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                      placeholder="0.00"
                      className="rounded-2xl border-purple-100 pr-10"
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                        {formData.discountType === 'percentage' ? '%' : '₹'}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="minCartValue" className="text-gray-700 font-black uppercase tracking-widest text-[10px]">Min Cart Value</Label>
                  <div className="relative">
                    <Input
                      id="minCartValue"
                      type="number"
                      step="0.01"
                      value={formData.minCartValue}
                      onChange={(e) => setFormData({ ...formData, minCartValue: e.target.value })}
                      placeholder="0.00"
                      className="rounded-2xl border-purple-100 pr-10"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="maxDiscountCap" className="text-gray-700 font-black uppercase tracking-widest text-[10px]">Max Discount Cap</Label>
                  <div className="relative">
                    <Input
                      id="maxDiscountCap"
                      type="number"
                      step="0.01"
                      value={formData.maxDiscountCap}
                      onChange={(e) => setFormData({ ...formData, maxDiscountCap: e.target.value })}
                      placeholder="Optional"
                      className="rounded-2xl border-purple-100 pr-10"
                      disabled={formData.discountType !== 'percentage'}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Validity and Limits */}
          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-white border-b border-orange-100/50">
              <CardTitle className="text-orange-700 flex items-center gap-2">
                <div className="p-2 rounded-xl bg-white shadow-sm">
                    <Calendar className="h-5 w-5" />
                </div>
                Validity & Limits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="startDate" className="text-gray-700 font-black uppercase tracking-widest text-[10px]">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="rounded-2xl border-orange-100 bg-white"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="expiryDate" className="text-gray-700 font-black uppercase tracking-widest text-[10px]">Expiry Date *</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="rounded-2xl border-orange-100 bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="usageLimit" className="text-gray-700 font-black uppercase tracking-widest text-[10px]">Total Usage Limit</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    placeholder="Unlimited"
                    className="rounded-2xl border-orange-100 bg-white"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="userLimit" className="text-gray-700 font-black uppercase tracking-widest text-[10px]">Per User Limit *</Label>
                  <Input
                    id="userLimit"
                    type="number"
                    value={formData.userLimit}
                    onChange={(e) => setFormData({ ...formData, userLimit: e.target.value })}
                    className="rounded-2xl border-orange-100 bg-white"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Applicability */}
          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100/50">
              <CardTitle className="text-blue-700 flex items-center gap-2">
                <div className="p-2 rounded-xl bg-white shadow-sm">
                    <Info className="h-5 w-5" />
                </div>
                Applicability Restrictions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
              <div className="space-y-4">
                <Label className="text-gray-700 font-black uppercase tracking-widest text-[10px]">Applicable Categories</Label>
                <p className="text-xs text-gray-400 font-medium italic -mt-2">Leave unselected to apply to all categories</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => toggleCategory(category.id)}
                      className={`
                        px-4 py-2 rounded-2xl text-sm font-bold transition-all border
                        ${formData.applicableCategoryIds.includes(category.id)
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                          : 'bg-white text-gray-500 border-gray-100 hover:border-blue-200'}
                      `}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-gray-700 font-black uppercase tracking-widest text-[10px]">Applicable Products</Label>
                <p className="text-xs text-gray-400 font-medium italic -mt-2">Leave unselected to apply to all products</p>
                <div className="max-h-60 overflow-y-auto p-4 rounded-3xl bg-gray-50/50 border border-gray-100 space-y-2">
                  {products.map((product) => (
                    <label key={product.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-transparent hover:border-blue-100 transition-all cursor-pointer group shadow-sm">
                      <input
                        type="checkbox"
                        checked={formData.applicableProductIds.includes(product.id)}
                        onChange={() => toggleProduct(product.id)}
                        className="w-5 h-5 rounded-lg border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className={`text-[13px] font-bold ${formData.applicableProductIds.includes(product.id) ? 'text-blue-600' : 'text-gray-600'}`}>
                        {product.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="pt-4 flex items-center gap-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-[#743181] to-[#B86E9F] hover:from-[#5a2a6e] hover:to-[#743181] text-white py-8 rounded-[2rem] shadow-2xl shadow-purple-200 transform transition-all hover:scale-[1.02] active:scale-[0.98] text-lg font-black tracking-tight uppercase"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/50 border-t-white"></div>
                  SAVING TERMINAL...
                </div>
              ) : 'ACTIVATE COUPON'}
            </Button>
            <Button
               type="button"
               variant="outline"
               onClick={() => router.push('/admin/coupons')}
               className="px-10 py-8 rounded-[2rem] border-2 border-gray-200 text-gray-400 font-black tracking-tight hover:bg-white hover:text-red-500 hover:border-red-100 transition-all uppercase"
            >
                Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
