'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getCurrentUser } from '@/lib/api-client'
import { useCartStore } from '@/lib/store'
import { ArrowLeft, CheckCircle2, Store, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface StoreLocation {
  id: string
  name: string
  address: string
  phone: string | null
  email: string | null
  isActive: boolean
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getSubtotal, clearCart } = useCartStore()
  
  const [loading, setLoading] = useState(false)
  const [stores, setStores] = useState<StoreLocation[]>([])
  const [loadingStores, setLoadingStores] = useState(true)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    selectedStore: ''
  })

  useEffect(() => {
    // Check if cart is empty
    if (items.length === 0) {
      router.push('/cart')
      return
    }

    // Get user info
    const currentUser = getCurrentUser()
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || currentUser.name || '',
        email: prev.email || currentUser.email || '',
        phone: prev.phone || currentUser.phoneNumber?.replace('+91', '') || currentUser.phone?.replace('+91', '') || ''
      }))
    }

    // Fetch active stores
    fetchStores()
  }, [items, router])

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/stores?activeOnly=true&limit=100')
      const data = await response.json()
      setStores(data.stores || [])
    } catch (error) {
      console.error('Error fetching stores:', error)
      toast.error('Failed to load stores')
    } finally {
      setLoadingStores(false)
    }
  }

  // Coupon state
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)

  const cartTotal = getSubtotal()
  const grandTotal = cartTotal - discountAmount

  const handleApplyCoupon = async () => {
    if (!couponCode) return
    setIsApplyingCoupon(true)
    
    try {
      const currentUser = getCurrentUser()
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode,
          userId: currentUser?.id || null,
          items: items.map(item => ({
            productId: item.productId,
            price: item.price,
            quantity: item.quantity
          }))
        })
      })

      const data = await response.json()
      if (response.ok) {
        setAppliedCoupon(data.coupon)
        setDiscountAmount(data.discountAmount)
        toast.success(`Coupon "${data.coupon.code}" applied!`, {
          description: `You saved ₹${data.discountAmount.toFixed(2)}`
        })
      } else {
        toast.error(data.error || 'Invalid coupon code')
      }
    } catch (error) {
      console.error('Error applying coupon:', error)
      toast.error('Failed to apply coupon')
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setDiscountAmount(0)
    setCouponCode('')
    toast.info('Coupon removed')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate form
      if (!formData.name || !formData.phone) {
        toast.error('Please fill all required fields')
        setLoading(false)
        return
      }

      if (!formData.selectedStore) {
        toast.error('Please select a store for pickup')
        setLoading(false)
        return
      }

      // Simulate order creation delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000))

      const currentUser = getCurrentUser()
      const selectedStoreData = stores.find(s => s.id === formData.selectedStore)
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id || null, // null for guest
          phone: formData.phone,
          email: formData.email,
          name: formData.name,
          address: selectedStoreData ? `${selectedStoreData.name}, ${selectedStoreData.address}` : 'Store Pickup',
          notes: formData.selectedStore ? `Store Pickup ID: ${formData.selectedStore}` : '',
          storeId: formData.selectedStore || null,
          couponId: appliedCoupon?.id || null,
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            weight: item.variantValue
          }))
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        const order = data.order

        // Also store order in localStorage for user's order history fallback
        const localOrders = JSON.parse(localStorage.getItem('orders') || '[]')
        localOrders.push({
          id: order.id,
          orderNumber: order.orderNumber,
          items: items,
          total: order.total,
          status: order.status,
          createdAt: order.createdAt
        })
        localStorage.setItem('orders', JSON.stringify(localOrders))

        // Clear cart
        clearCart()

        // Show success
        const storeName = stores.find(s => s.id === formData.selectedStore)?.name
        toast.success(`Order ${order.orderNumber} confirmed!`, {
          description: `Pick up from ${storeName}. Total: ₹${order.total}`
        })

        // Redirect to success page
        setTimeout(() => {
          router.push('/?order=success')
        }, 1500)
      } else {
        const errorData = await response.json()
        console.error('API order save failed:', errorData)
        toast.error(`Order failed: ${errorData.error || 'Please check your details'}`)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Failed to place order', {
        description: 'Please try again'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/cart" className="inline-flex items-center text-[#743181] hover:text-[#5a2a6e] font-medium mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your order for store pickup</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Store Selection */}
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#743181]">
                  <Store className="h-5 w-5" />
                  Select Store for Pickup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingStores ? (
                  <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-200 border-t-purple-600 mx-auto"></div>
                      <p className="mt-4 text-gray-500 font-medium">Loading stores...</p>
                  </div>
                ) : stores.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                      <Store className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No stores available for selection</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                      {stores.map((store) => (
                          <label
                          key={store.id}
                          className={`flex gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                              formData.selectedStore === store.id
                              ? 'border-[#743181] bg-purple-50 shadow-md transform scale-[1.02]'
                              : 'border-gray-50 bg-white hover:border-purple-200'
                          }`}
                          >
                          <input
                              type="radio"
                              name="selectedStore"
                              value={store.id}
                              checked={formData.selectedStore === store.id}
                              onChange={handleChange}
                              className="w-5 h-5 mt-1 text-[#743181]"
                          />
                          <div className="flex-1">
                              <p className="font-bold text-gray-900">{store.name}</p>
                              <p className="text-sm text-gray-500 mt-1 leading-snug">{store.address}</p>
                              {store.phone && (
                              <p className="text-xs text-[#743181] font-bold mt-2 flex items-center gap-1">
                                  <span className="opacity-50">Call:</span> {store.phone}
                              </p>
                              )}
                          </div>
                          </label>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#743181]">
                  <User className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="customer-name" className="block text-sm font-bold text-gray-700 ml-1">
                      Full Name *
                    </label>
                    <Input
                      id="customer-name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Ramesh Kumar"
                      className="rounded-xl border-gray-100 p-6"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="customer-email" className="block text-sm font-bold text-gray-700 ml-1">
                      Email Address
                    </label>
                    <Input
                      id="customer-email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@email.com"
                      className="rounded-xl border-gray-100 p-6"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="customer-phone" className="block text-sm font-bold text-gray-700 ml-1">
                    Phone Number *
                  </label>
                  <div className="flex gap-3">
                    <div className="flex items-center justify-center bg-gray-50 border border-gray-100 rounded-xl px-4 font-bold text-gray-500">
                        +91
                    </div>
                    <Input
                      id="customer-phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      maxLength={10}
                      className="flex-1 rounded-xl border-gray-100 p-6"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider ml-1 mt-2">Used for order confirmation & pickup updates</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 border-none shadow-premium overflow-hidden">
              <CardHeader className="bg-gray-50/80">
                <CardTitle className="text-gray-900 font-black">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Items */}
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 group">
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute top-0 right-0 bg-[#743181] text-white text-[10px] font-bold px-2 py-1 rounded-bl-xl shadow-lg">
                            {item.quantity}x
                          </div>
                      </div>
                      <div className="flex-1 py-1">
                        <p className="font-bold text-gray-900 text-sm leading-tight mb-1">{item.name}</p>
                        <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2">
                            {item.variantValue} {item.variantType === 'Default' ? '' : item.variantType}
                        </p>
                        <p className="text-sm text-[#743181] font-black">
                          ₹{(item.quantity * item.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon Section */}
                <div className="pt-6 border-t border-dashed border-gray-200 space-y-4">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Promotional Code</p>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-emerald-50 p-3 rounded-2xl border border-emerald-100 group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-sm">
                            <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-emerald-700">{appliedCoupon.code}</p>
                          <p className="text-[10px] text-emerald-600 font-bold">₹{discountAmount.toFixed(2)} saved</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleRemoveCoupon}
                        className="text-emerald-700 hover:text-red-500 hover:bg-transparent -mr-2"
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                        <Input
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Enter code"
                          className="rounded-xl border-gray-100 bg-gray-50/50"
                        />
                        <Button 
                          variant="outline"
                          onClick={handleApplyCoupon}
                          disabled={isApplyingCoupon || !couponCode}
                          className="rounded-xl border-purple-100 text-[#743181] hover:bg-purple-50 font-bold transition-all px-6"
                        >
                          {isApplyingCoupon ? '...' : 'Apply'}
                        </Button>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-dashed border-gray-200 space-y-3">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-gray-500">Items Subtotal</span>
                    <span className="text-gray-900">₹{cartTotal.toFixed(2)}</span>
                  </div>
                  
                  {appliedCoupon && (
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-emerald-600 font-bold">Coupon Discount</span>
                      <span className="text-emerald-600 font-black">-₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Store className="h-4 w-4 opacity-50" />
                      Pickup
                    </span>
                    <span className="text-emerald-600 font-black tracking-wider uppercase text-[10px]">Free</span>
                  </div>
                </div>

                <div className="pt-6 border-t-2 border-gray-100">
                  <div className="flex justify-between items-end">
                    <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px] pb-1">Total Amount</span>
                    <span className="text-3xl font-black text-[#743181]">₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#743181] to-purple-600 hover:to-[#5a2a6e] text-white py-10 rounded-3xl shadow-xl shadow-purple-900/10 text-xl font-black tracking-tight transform transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                        Processing...
                    </div>
                  ) : (
                    <>
                      <CheckCircle2 className="h-6 w-6 mr-2" />
                      Place Order
                    </>
                  )}
                </Button>

                <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Secure Premium Checkout</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
