'use client'

import { ImageWithFallback } from '@/components/ImageWithFallback'
import { Input } from '@/components/ui/input'
import { getCurrentUser } from '@/lib/api-client'
import { useCartStore } from '@/lib/store'
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  MapPin,
  Phone,
  Shield,
  ShieldCheck,
  Store,
  Tag,
  User,
  X,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface StoreLocation {
  id: string
  name: string
  address: string
  phone: string | null
  isActive: boolean
}

function PhonePeLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="white" fillOpacity="0.2" />
      <text x="11" y="28" fontFamily="Arial" fontSize="22" fontWeight="900" fill="white">P</text>
    </svg>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getSubtotal } = useCartStore()

  const [loading, setLoading] = useState(false)
  const [stores, setStores] = useState<StoreLocation[]>([])
  const [loadingStores, setLoadingStores] = useState(true)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', selectedStore: '' })

  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState<string | null>(null)

  const subtotal = getSubtotal()
  const grandTotal = subtotal - discountAmount
  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0)

  useEffect(() => {
    if (items.length === 0) { router.push('/cart'); return }
    const u = getCurrentUser()
    if (u) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || u.name || '',
        email: prev.email || u.email || '',
        phone: prev.phone || u.phoneNumber?.replace('+91', '') || u.phone?.replace('+91', '') || '',
      }))
    }
    fetch('/api/stores?activeOnly=true&limit=100')
      .then(r => r.json())
      .then(d => setStores(d.stores || []))
      .catch(() => toast.error('Failed to load stores'))
      .finally(() => setLoadingStores(false))
  }, [items, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))

  async function applyCoupon() {
    const code = couponCode.trim()
    if (!code) return
    setCouponLoading(true)
    setCouponError(null)
    try {
      const u = getCurrentUser()
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          userId: u?.id || null,
          items: items.map(i => ({ productId: i.productId, price: i.price, quantity: i.quantity })),
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setAppliedCoupon(data.coupon)
        setDiscountAmount(data.discountAmount)
        setCouponCode('')
        toast.success(`"${data.coupon.code}" applied — you saved ₹${data.discountAmount}!`)
      } else {
        setCouponError(data.error || 'Invalid coupon')
      }
    } catch {
      setCouponError('Could not validate coupon. Try again.')
    } finally {
      setCouponLoading(false)
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null)
    setDiscountAmount(0)
    setCouponCode('')
    setCouponError(null)
  }

  async function handlePayNow() {
    if (!formData.name.trim()) { toast.error('Please enter your name'); return }
    if (!formData.phone.trim() || formData.phone.length < 10) { toast.error('Please enter a valid 10-digit phone number'); return }
    if (!formData.selectedStore) { toast.error('Please select a pickup store'); return }

    setLoading(true)
    try {
      const u = getCurrentUser()
      const selectedStoreData = stores.find(s => s.id === formData.selectedStore)
      const orderData = {
        userId: u?.id || null,
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
          weight: item.variantValue,
        })),
      }

      const response = await fetch('/api/phonepe/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        const data = await response.json()
        toast.info('Redirecting to PhonePe...', { description: `Order ${data.orderNumber} initiated` })
        globalThis.location.href = data.phonePeRedirectUrl
      } else {
        const errorData = await response.json()
        toast.error(`Payment failed: ${errorData.error || 'Please check your details'}`)
      }
    } catch {
      toast.error('Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50/40 relative overflow-hidden">
      {/* Subtle decorative blobs */}
      <div className="pointer-events-none select-none absolute -top-24 -left-24 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl" />
      <div className="pointer-events-none select-none absolute top-1/2 -right-20 w-72 h-72 bg-pink-200/20 rounded-full blur-3xl" />
      <div className="pointer-events-none select-none absolute bottom-0 left-1/3 w-96 h-48 bg-purple-100/25 rounded-full blur-3xl" />
      <div className="container mx-auto px-3 sm:px-4 py-5 sm:py-8 max-w-5xl relative z-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <div>
            <Link href="/cart" className="inline-flex items-center gap-1.5 text-xs text-purple-600 font-semibold hover:text-purple-700 mb-1.5">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Cart
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Checkout</h1>
            <p className="text-xs text-gray-400 mt-0.5">{totalItems} {totalItems === 1 ? 'item' : 'items'} · Free Store Pickup</p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-semibold">
            <ShieldCheck className="h-3.5 w-3.5" />
            100% Secure
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 items-start">

          {/* ── Left: Form ── */}
          <div className="lg:col-span-3 space-y-4">

            {/* Store Selection */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-50">
                <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Store className="h-3.5 w-3.5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Pickup Store <span className="text-red-400">*</span></p>
                  <p className="text-[10px] text-gray-400">Choose a store near you</p>
                </div>
              </div>
              <div className="p-3 sm:p-4">
                {loadingStores ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="animate-spin h-6 w-6 rounded-full border-2 border-purple-200 border-t-purple-600" />
                  </div>
                ) : stores.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-6">No stores available</p>
                ) : (
                  <div className="space-y-2">
                    {stores.map(store => (
                      <label key={store.id} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
                        ${formData.selectedStore === store.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-100 hover:border-purple-200 bg-gray-50/50'}`}>
                        <input
                          type="radio"
                          name="selectedStore"
                          value={store.id}
                          checked={formData.selectedStore === store.id}
                          onChange={handleChange}
                          className="mt-0.5 accent-purple-600"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900">{store.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5 flex items-start gap-1">
                            <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5 text-gray-400" />
                            {store.address}
                          </p>
                          {store.phone && (
                            <p className="text-[10px] text-purple-600 font-semibold mt-1 flex items-center gap-1">
                              <Phone className="h-2.5 w-2.5" />{store.phone}
                            </p>
                          )}
                        </div>
                        {formData.selectedStore === store.id && (
                          <CheckCircle2 className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-50">
                <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Your Details</p>
                  <p className="text-[10px] text-gray-400">For pickup confirmation & updates</p>
                </div>
              </div>
              <div className="p-3 sm:p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1 block">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Ramesh Kumar"
                      className="h-10 rounded-xl border-gray-200 text-sm focus-visible:ring-purple-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1 block">
                      Email <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@email.com"
                      className="h-10 rounded-xl border-gray-200 text-sm focus-visible:ring-purple-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1 block">
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="flex items-center justify-center bg-gray-50 border border-gray-200 rounded-xl px-3 text-sm font-bold text-gray-500 h-10">
                      +91
                    </div>
                    <Input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      maxLength={10}
                      className="flex-1 h-10 rounded-xl border-gray-200 text-sm focus-visible:ring-purple-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment method info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-[#5f259f] to-[#823fb0] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <PhonePeLogo size={26} />
                  <div>
                    <p className="text-white font-bold text-sm">Pay with PhonePe</p>
                    <p className="text-purple-200 text-[10px]">UPI · Cards · Net Banking · Wallets</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5">
                  <Lock className="h-2.5 w-2.5 text-white" />
                  <span className="text-[10px] text-white font-semibold">Secure</span>
                </div>
              </div>
              <div className="px-4 py-3 grid grid-cols-3 gap-2">
                {[
                  { icon: Shield, label: '256-bit SSL', sub: 'Encryption' },
                  { icon: ShieldCheck, label: 'RBI Regulated', sub: 'Platform' },
                  { icon: Zap, label: 'Instant', sub: 'Confirmation' },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex flex-col items-center gap-1 bg-gray-50 rounded-xl p-2">
                    <Icon className="h-4 w-4 text-purple-600" />
                    <p className="text-[10px] font-bold text-gray-700 text-center leading-tight">{label}</p>
                    <p className="text-[9px] text-gray-400 text-center">{sub}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ── Right: Order Summary ── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm sticky top-20 overflow-hidden">

              <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-3">
                <p className="text-white font-bold text-sm">Order Summary</p>
                <p className="text-purple-200 text-[10px] mt-0.5">{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
              </div>

              {/* Items */}
              <div className="max-h-48 overflow-y-auto divide-y divide-gray-50">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-2.5 px-3 py-2.5">
                    <div className="relative w-10 h-10 flex-shrink-0">
                      <div className="w-full h-full rounded-lg overflow-hidden bg-gray-50">
                        <ImageWithFallback src={item.image} alt={item.name} className="object-cover" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 text-white text-[8px] font-bold rounded-full flex items-center justify-center z-10">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate leading-tight">{item.name}</p>
                      {item.variantType !== 'Default' && (
                        <p className="text-[10px] text-gray-400 flex items-center gap-0.5">
                          <Tag className="h-2 w-2" />{item.variantValue} {item.variantType}
                        </p>
                      )}
                    </div>
                    <p className="text-xs font-bold text-gray-800 flex-shrink-0">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>

              <div className="p-3 sm:p-4 space-y-3 border-t border-gray-50">

                {/* Coupon */}
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-emerald-700">{appliedCoupon.code}</p>
                        <p className="text-[10px] text-emerald-600">−₹{discountAmount.toLocaleString('en-IN')} saved</p>
                      </div>
                    </div>
                    <button onClick={removeCoupon} className="text-gray-300 hover:text-red-400 p-1 transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(null) }}
                        onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                        placeholder="Coupon code"
                        className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100 uppercase placeholder:normal-case placeholder:text-gray-400"
                      />
                      <button
                        onClick={applyCoupon}
                        disabled={!couponCode.trim() || couponLoading}
                        className="text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
                      >
                        {couponLoading ? '...' : 'Apply'}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                        <X className="h-2.5 w-2.5 flex-shrink-0" />{couponError}
                      </p>
                    )}
                  </div>
                )}

                {/* Totals */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-700">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-xs text-emerald-600">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span className="font-bold">−₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Pickup</span>
                    <span className="font-bold text-emerald-600">FREE</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-2.5 flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-purple-600">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>

                {/* Pay button */}
                <button
                  onClick={handlePayNow}
                  disabled={loading}
                  className="w-full h-13 bg-gradient-to-r from-[#5f259f] to-[#823fb0] hover:from-[#4e1d87] hover:to-[#6e2f99] text-white font-bold rounded-xl flex items-center justify-center gap-2.5 text-sm transition-all shadow-lg shadow-purple-300/40 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] py-3.5"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin h-4 w-4 rounded-full border-2 border-white/30 border-t-white" />
                      Redirecting to PhonePe...
                    </>
                  ) : (
                    <>
                      <PhonePeLogo size={20} />
                      Pay ₹{grandTotal.toLocaleString('en-IN')} with PhonePe
                    </>
                  )}
                </button>

                {/* Trust strip */}
                <div className="flex items-center justify-center gap-3">
                  <div className="flex items-center gap-1 text-gray-400">
                    <Lock className="h-3 w-3" />
                    <span className="text-[10px] font-medium">SSL Encrypted</span>
                  </div>
                  <div className="w-px h-3 bg-gray-200" />
                  <div className="flex items-center gap-1 text-gray-400">
                    <ShieldCheck className="h-3 w-3" />
                    <span className="text-[10px] font-medium">PCI DSS</span>
                  </div>
                  <div className="w-px h-3 bg-gray-200" />
                  <div className="flex items-center gap-1 text-gray-400">
                    <Zap className="h-3 w-3" />
                    <span className="text-[10px] font-medium">PhonePe</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
