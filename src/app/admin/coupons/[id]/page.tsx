'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import { ArrowLeft, BarChart3, Calendar, CheckCircle2, Info, RefreshCw, Ticket, TrendingUp, Users } from 'lucide-react'
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

interface UsageDetail {
  id: string
  orderNumber: string
  total: number
  discountAmount: number
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  } | null
}

export default function EditCouponPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [usageDetails, setUsageDetails] = useState<UsageDetail[]>([])
  
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minCartValue: '0',
    maxDiscountCap: '',
    startDate: '',
    expiryDate: '',
    usageLimit: '',
    userLimit: '1',
    isActive: true,
    applicableProductIds: [] as string[],
    applicableCategoryIds: [] as string[],
  })

  useEffect(() => {
    fetchInitialData()
  }, [params.id])

  const fetchInitialData = async () => {
    setFetching(true)
    try {
      await Promise.all([
        fetchCategories(),
        fetchProducts(),
        fetchCouponDetails()
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setFetching(false)
    }
  }

  const fetchCategories = async () => {
    const res = await fetch('/api/categories?limit=100')
    const data = await res.json()
    setCategories(data.categories || [])
  }

  const fetchProducts = async () => {
    const res = await fetch('/api/products?limit=100')
    const data = await res.json()
    setProducts(data.products || [])
  }

  const fetchCouponDetails = async () => {
    try {
      const response = await fetch(`/api/coupons/${params.id}`)
      const data = await response.json()
      
      if (response.ok) {
        const coupon = data.coupon
        setFormData({
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue.toString(),
          minCartValue: coupon.minCartValue.toString(),
          maxDiscountCap: coupon.maxDiscountCap ? coupon.maxDiscountCap.toString() : '',
          startDate: format(new Date(coupon.startDate), 'yyyy-MM-dd'),
          expiryDate: format(new Date(coupon.expiryDate), 'yyyy-MM-dd'),
          usageLimit: coupon.usageLimit ? coupon.usageLimit.toString() : '',
          userLimit: coupon.userLimit.toString(),
          isActive: coupon.isActive,
          applicableProductIds: coupon.applicableProducts.map((p: any) => p.id),
          applicableCategoryIds: coupon.applicableCategories.map((c: any) => c.id),
        })
        setUsageDetails(data.usageDetails || [])
      } else {
        toast.error('Coupon not found')
        router.push('/admin/coupons')
      }
    } catch (error) {
      console.error('Error fetching coupon:', error)
      toast.error('Failed to load coupon details')
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
      const response = await fetch(`/api/coupons/${params.id}`, {
        method: 'PATCH',
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

      if (response.ok) {
        toast.success('Coupon updated successfully')
        router.push('/admin/coupons')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to update coupon')
      }
    } catch (error) {
      console.error('Error updating coupon:', error)
      toast.error('Failed to update coupon')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#743181]"></div>
      </div>
    )
  }

  const totalDiscountGiven = usageDetails.reduce((sum, item) => sum + item.discountAmount, 0)

  return (
    <div className="min-h-screen bg-[#f5f0f7]/30 py-8 font-outfit">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <Link href="/admin/coupons" className="inline-flex items-center text-[#743181] hover:text-[#5a2a6e] font-bold mb-4 group">
                <div className="p-1.5 rounded-lg bg-white shadow-sm border border-purple-100 mr-2 group-hover:scale-110 transition-transform">
                    <ArrowLeft className="h-4 w-4" />
                </div>
                Back to Coupons
            </Link>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Edit Coupon</h1>
            <p className="text-gray-500 mt-2 font-medium">Update settings for <span className="text-[#743181] font-bold">{formData.code}</span></p>
          </div>
          
          <div className="flex gap-3">
             <Card className="border-none shadow-sm bg-white/80 p-3 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-50 text-[#743181]">
                    <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Total Usage</p>
                    <p className="text-xl font-black text-gray-800 tracking-tight">{usageDetails.length}</p>
                </div>
             </Card>
             <Card className="border-none shadow-sm bg-white/80 p-3 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-green-50 text-green-600">
                    <Ticket className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Saved Customers</p>
                    <p className="text-xl font-black text-gray-800 tracking-tight">₹{totalDiscountGiven.toFixed(2)}</p>
                </div>
             </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Code and Basic Info */}
              <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b border-purple-100/50">
                  <CardTitle className="text-[#743181] flex items-center gap-2 text-lg">
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
                          className="rounded-2xl border-purple-100 bg-white focus:ring-purple-500 font-mono font-bold"
                          required
                        />
                        <Button 
                          type="button" 
                          onClick={generateCode}
                          variant="outline"
                          className="rounded-2xl border-purple-100 text-[#743181] hover:bg-purple-50"
                        >
                          <RefreshCw className="h-4 w-4" />
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
                          className="rounded-2xl border-purple-100 pr-10"
                          disabled={formData.discountType !== 'percentage'}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Applicability */}
              <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100/50">
                  <CardTitle className="text-blue-700 flex items-center gap-2 text-lg">
                    <div className="p-2 rounded-xl bg-white shadow-sm">
                        <Info className="h-5 w-5" />
                    </div>
                    Applicability Restrictions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                  <div className="space-y-4">
                    <Label className="text-gray-700 font-black uppercase tracking-widest text-[10px]">Applicable Categories</Label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => toggleCategory(category.id)}
                          className={`
                            px-4 py-2 rounded-2xl text-sm font-bold transition-all border
                            ${formData.applicableCategoryIds.includes(category.id)
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
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
                    <div className="max-h-48 overflow-y-auto p-4 rounded-3xl bg-gray-50/50 border border-gray-100 space-y-2">
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

              {/* Validity and Limits */}
              <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-white border-b border-orange-100/50">
                  <CardTitle className="text-orange-700 flex items-center gap-2 text-lg">
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
                  
                  <div className="pt-4 border-t border-orange-100 mt-4">
                    <label htmlFor="active-toggle" className="flex items-center gap-3 p-4 rounded-2xl border border-orange-100 hover:bg-orange-50/30 transition-colors cursor-pointer group">
                        <input
                        id="active-toggle"
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-5 h-5 rounded-lg border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        <div>
                            <span className="block font-bold text-gray-900 group-hover:text-orange-700">ACTIVE STATUS</span>
                            <span className="text-xs text-gray-500 font-medium">Temporarily disable this coupon without deleting it</span>
                        </div>
                    </label>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-[#743181] to-[#B86E9F] text-white py-8 rounded-[2rem] shadow-xl text-lg font-black tracking-tight"
                >
                  {loading ? 'SAVING CHANGES...' : 'UPDATE COUPON'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/coupons')}
                  className="px-8 py-8 rounded-[2rem] border-2 border-gray-200 text-gray-400 font-black"
                >
                  CANCEL
                </Button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
             <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-purple-100/30">
                  <CardTitle className="text-gray-800 flex items-center gap-2 text-lg">
                    <BarChart3 className="h-5 w-5 text-[#743181]" />
                    Usage Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                   <div className="max-h-[70vh] overflow-y-auto">
                      {usageDetails.length === 0 ? (
                        <div className="p-12 text-center">
                            <Users className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest text-[10px]">No usage yet</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100/50">
                           {usageDetails.map((usage) => (
                             <div key={usage.id} className="p-4 hover:bg-purple-50/20 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="text-[10px] font-black tracking-widest text-[#743181] uppercase">{usage.orderNumber}</p>
                                        <p className="text-[13px] font-bold text-gray-800">{usage.user?.name || 'Guest'}</p>
                                        <p className="text-[11px] text-gray-400">{usage.user?.email || 'No email'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[13px] font-black text-green-600">-₹{usage.discountAmount.toFixed(2)}</p>
                                        <p className="text-[10px] text-gray-400 font-bold">{format(new Date(usage.createdAt), 'MMM dd')}</p>
                                    </div>
                                </div>
                             </div>
                           ))}
                        </div>
                      )}
                   </div>
                </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
