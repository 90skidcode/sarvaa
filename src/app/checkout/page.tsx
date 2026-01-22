'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getCurrentUser } from '@/lib/api-client'
import { useCartStore, useSettingsStore } from '@/lib/store'
import { ArrowLeft, CheckCircle2, Package, Store, Truck, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
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
  const { freeShippingThreshold } = useSettingsStore()
  
  const [loading, setLoading] = useState(false)
  const [orderType, setOrderType] = useState<'takeaway' | 'delivery'>('takeaway')
  const [stores, setStores] = useState<StoreLocation[]>([])
  const [loadingStores, setLoadingStores] = useState(true)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'Tamil Nadu',
    pincode: '',
    paymentMethod: 'phonepe',
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
        phone: currentUser.phoneNumber?.replace('+91', '') || ''
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

  const cartTotal = getSubtotal()
  
  const shipping = useMemo(() => {
    if (orderType !== 'delivery') return 0;
    return cartTotal >= freeShippingThreshold ? 0 : 50;
  }, [orderType, cartTotal, freeShippingThreshold]);

  const grandTotal = cartTotal + shipping

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

      if (orderType === 'takeaway' && !formData.selectedStore) {
        toast.error('Please select a store for pickup')
        setLoading(false)
        return
      }

      // Simulate order creation
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Create order object
      const order = {
        items: items.map(item => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          variantType: item.variantType,
          variantValue: item.variantValue,
          price: item.price
        })),
        customer: formData,
        orderType: orderType,
        storeId: orderType === 'takeaway' ? formData.selectedStore : null,
        total: grandTotal,
        shipping: shipping,
        paymentMethod: orderType === 'takeaway' ? 'cod' : formData.paymentMethod,
        status: 'pending',
        createdAt: new Date().toISOString()
      }

      // Store order in localStorage for now (in production, POST to API)
      const orders = JSON.parse(localStorage.getItem('orders') || '[]')
      orders.push(order)
      localStorage.setItem('orders', JSON.stringify(orders))

      // Clear cart
      clearCart()

      // Show success
      let successMessage = 'Order placed successfully!'
      if (orderType === 'takeaway') {
        const storeName = stores.find(s => s.id === formData.selectedStore)?.name
        successMessage = `Takeaway order confirmed! Pick up from ${storeName}`
      }
      
      toast.success(successMessage, {
        description: `Order total: ₹${grandTotal}. We'll contact you shortly.`
      })

      // Redirect to success page
      setTimeout(() => {
        router.push('/?order=success')
      }, 1500)

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
          <p className="text-gray-600 mt-2">Complete your order</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Type Selection */}
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-purple-50/50">
                <CardTitle>How would you like to receive your order?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <label
                    htmlFor="order-takeaway"
                    className={`flex items-center gap-4 p-5 border-2 rounded-2xl cursor-pointer transition-all ${
                      orderType === 'takeaway'
                        ? 'border-[#743181] bg-purple-50 shadow-inner'
                        : 'border-gray-100 bg-white hover:border-purple-200'
                    }`}
                  >
                    <input
                      id="order-takeaway"
                      type="radio"
                      name="orderType"
                      value="takeaway"
                      checked={orderType === 'takeaway'}
                      onChange={(e) => setOrderType(e.target.value as 'takeaway')}
                      className="w-5 h-5 text-[#743181] focus:ring-[#743181]"
                    />
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-full ${orderType === 'takeaway' ? 'bg-[#743181] text-white' : 'bg-gray-100 text-gray-400'}`}>
                            <Store className="h-6 w-6" />
                        </div>
                        <div>
                        <p className="font-bold text-gray-900">Self Pickup</p>
                        <p className="text-xs text-gray-500">From our nearest store</p>
                        </div>
                    </div>
                  </label>

                  <label
                    htmlFor="order-delivery"
                    className={`flex items-center gap-4 p-5 border-2 rounded-2xl cursor-pointer transition-all ${
                      orderType === 'delivery'
                        ? 'border-[#743181] bg-purple-50 shadow-inner'
                        : 'border-gray-100 bg-white hover:border-purple-200'
                    }`}
                  >
                    <input
                      id="order-delivery"
                      type="radio"
                      name="orderType"
                      value="delivery"
                      checked={orderType === 'delivery'}
                      onChange={(e) => setOrderType(e.target.value as 'delivery')}
                      className="w-5 h-5 text-[#743181] focus:ring-[#743181]"
                    />
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-full ${orderType === 'delivery' ? 'bg-[#743181] text-white' : 'bg-gray-100 text-gray-400'}`}>
                            <Truck className="h-6 w-6" />
                        </div>
                        <div>
                        <p className="font-bold text-gray-900">Home Delivery</p>
                        <p className="text-xs text-gray-500">Delivered to your door</p>
                        </div>
                    </div>
                  </label>
                </div>

                {/* Delivery Not Available Message */}
                {orderType === 'delivery' && (
                  <div className="mt-4 p-5 bg-amber-50 border-2 border-amber-100 rounded-2xl animate-in fade-in slide-in-from-top-2">
                    <div className="flex gap-4">
                        <div className="bg-amber-100 p-2 rounded-full h-fit mt-1">
                            <Package className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-amber-900 font-bold">Delivery Currently Limited</p>
                            <p className="text-sm text-amber-800/80 mt-1 leading-relaxed">
                            We're sorry, but home delivery service is selectively available. 
                            If you're in Coimbatore, please call us to check. Otherwise, 
                            please select <strong>Takeaway</strong> for store pickup.
                            </p>
                        </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Store Selection (Only for Takeaway) */}
            {orderType === 'takeaway' && (
              <Card className="border-none shadow-sm animate-in fade-in slide-in-from-left-4">
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
                        <p className="mt-4 text-gray-500 font-medium">Loading premium stores...</p>
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
            )}

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

                <div className="pt-6 border-t border-dashed border-gray-200 space-y-3">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-gray-500">Items Subtotal</span>
                    <span className="text-gray-900">₹{cartTotal.toFixed(2)}</span>
                  </div>
                  
                  {orderType === 'delivery' && (
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Truck className="h-4 w-4 opacity-50" />
                        Shipping Fee
                      </span>
                      <span className={shipping === 0 ? 'text-emerald-600 font-black' : 'text-gray-900'}>
                        {shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}
                      </span>
                    </div>
                  )}
                  
                  {orderType === 'takeaway' && (
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Store className="h-4 w-4 opacity-50" />
                        Pickup Discount
                      </span>
                      <span className="text-emerald-600 font-black tracking-wider uppercase text-[10px]">Free Pickup</span>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t-2 border-gray-100">
                  <div className="flex justify-between items-end">
                    <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px] pb-1">Total Amount</span>
                    <span className="text-3xl font-black text-[#743181]">₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={loading || (orderType === 'delivery')}
                  className="w-full bg-gradient-to-r from-[#743181] to-purple-600 hover:to-[#5a2a6e] text-white py-10 rounded-3xl shadow-xl shadow-purple-900/10 text-xl font-black tracking-tight transform transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                        Processing...
                    </div>
                  ) : orderType === 'delivery' ? (
                    'Call for Delivery'
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
