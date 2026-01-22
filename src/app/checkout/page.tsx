'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getCurrentUser } from '@/lib/api-client'
import { useCartStore, useSettingsStore } from '@/lib/store'
import { ArrowLeft, CheckCircle2, Package, Store, Truck, User } from 'lucide-react'
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
  const { freeShippingThreshold } = useSettingsStore()
  
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
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
      setUser(currentUser)
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
  const shipping = orderType === 'takeaway' ? 0 : (cartTotal >= freeShippingThreshold ? 0 : 50)
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
          weight: item.weight,
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
      const successMessage = orderType === 'takeaway' 
        ? `Takeaway order confirmed! Pick up from ${stores.find(s => s.id === formData.selectedStore)?.name}`
        : 'Order placed successfully!'
      
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
            <Card>
              <CardHeader>
                <CardTitle>Order Type</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid md:grid-cols-2 gap-4">
                  <label
                    className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      orderType === 'takeaway'
                        ? 'border-[#743181] bg-purple-50'
                        : 'border-gray-200 hover:border-purple-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="orderType"
                      value="takeaway"
                      checked={orderType === 'takeaway'}
                      onChange={(e) => setOrderType(e.target.value as 'takeaway')}
                      className="w-4 h-4 text-[#743181]"
                    />
                    <Store className="h-6 w-6 text-[#743181]" />
                    <div>
                      <p className="font-semibold">Takeaway</p>
                      <p className="text-xs text-gray-500">Pick up from store</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      orderType === 'delivery'
                        ? 'border-[#743181] bg-purple-50'
                        : 'border-gray-200 hover:border-purple-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="orderType"
                      value="delivery"
                      checked={orderType === 'delivery'}
                      onChange={(e) => setOrderType(e.target.value as 'delivery')}
                      className="w-4 h-4 text-[#743181]"
                    />
                    <Truck className="h-6 w-6 text-[#743181]" />
                    <div>
                      <p className="font-semibold">Delivery</p>
                      <p className="text-xs text-gray-500">Home delivery</p>
                    </div>
                  </label>
                </div>

                {/* Delivery Not Available Message */}
                {orderType === 'delivery' && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 font-semibold flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Delivery Currently Not Available
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      We're sorry, but home delivery service is not available at the moment. 
                      Please select Takeaway to pick up your order from one of our stores.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Store Selection (Only for Takeaway) */}
            {orderType === 'takeaway' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5 text-[#743181]" />
                    Select Store for Pickup
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loadingStores ? (
                    <div className="text-center py-8 text-gray-600">Loading stores...</div>
                  ) : stores.length === 0 ? (
                    <div className="text-center py-8 text-gray-600">No stores available</div>
                  ) : stores.map((store) => (
                    <label
                      key={store.id}
                      className={`flex gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.selectedStore === store.id
                          ? 'border-[#743181] bg-purple-50'
                          : 'border-gray-200 hover:border-purple-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="selectedStore"
                        value={store.id}
                        checked={formData.selectedStore === store.id}
                        onChange={handleChange}
                        className="w-4 h-4 mt-1 text-[#743181]"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{store.name}</p>
                        <p className="text-sm text-gray-600 mt-1">{store.address}</p>
                        {store.phone && (
                          <p className="text-xs text-gray-500 mt-1">Phone: {store.phone}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-[#743181]" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value="+91"
                      readOnly
                      className="w-16 bg-gray-100"
                    />
                    <Input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      maxLength={10}
                      required
                      className="flex-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.weight}`} className="flex gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.weight}</p>
                        <p className="text-sm text-[#743181] font-semibold">
                          {item.quantity} × ₹{item.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{cartTotal.toFixed(2)}</span>
                  </div>
                  
                  {orderType === 'delivery' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Truck className="h-4 w-4" />
                        Shipping
                      </span>
                      <span className={shipping === 0 ? 'text-green-600 font-semibold' : 'font-medium'}>
                        {shipping === 0 ? 'FREE' : `₹${shipping}`}
                      </span>
                    </div>
                  )}
                  
                  {orderType === 'takeaway' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Store className="h-4 w-4" />
                        Pickup
                      </span>
                      <span className="text-green-600 font-semibold">FREE</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-bold text-[#743181]">₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={loading || (orderType === 'delivery')}
                  className="w-full bg-gradient-to-r from-[#743181] to-[#5a2a6e] hover:from-[#5a2a6e] hover:to-[#743181] text-white py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    'Processing...'
                  ) : orderType === 'delivery' ? (
                    'Delivery Not Available'
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      Place Order
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-gray-500">
                  {orderType === 'takeaway' 
                    ? 'Pay at store when you pick up your order'
                    : 'By placing your order, you agree to our Terms & Conditions'
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
