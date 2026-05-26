'use client'

import { ImageWithFallback } from '@/components/ImageWithFallback'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/store'
import { ArrowRight, Minus, Plus, ShoppingBag, Store, Tag, Trash2, X } from 'lucide-react'
import Link from 'next/link'

export default function CartPage() {
  const { items, removeItem, updateQuantity, getSubtotal, clearCart } = useCartStore()
  const subtotal = getSubtotal()
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0)

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50/60 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-28 h-28 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-14 w-14 text-purple-300" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Your cart is empty</h1>
          <p className="text-gray-500 mb-8 text-sm sm:text-base leading-relaxed">
            Looks like you haven't added any sweets yet.<br />Explore our collection and treat yourself!
          </p>
          <Link href="/products">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 h-12 rounded-xl font-semibold shadow-lg shadow-purple-200">
              Browse Sweets
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50/40 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="pointer-events-none select-none absolute -top-24 -left-24 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl" />
      <div className="pointer-events-none select-none absolute top-1/3 -right-20 w-64 h-64 bg-pink-200/20 rounded-full blur-3xl" />
      <div className="pointer-events-none select-none absolute bottom-0 left-1/4 w-96 h-48 bg-purple-100/30 rounded-full blur-3xl" />
      <div className="container mx-auto px-3 sm:px-4 py-5 sm:py-8 max-w-6xl relative z-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Cart</h1>
            <p className="text-xs text-gray-400 mt-0.5">{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
          </div>
          <button
            onClick={clearCart}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-all font-medium"
          >
            <Trash2 className="h-3 w-3" />
            Clear all
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">

          {/* ── Cart Items ── */}
          <div className="lg:col-span-2 space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-100 p-2.5 sm:p-3.5 flex gap-3 group hover:border-purple-100 hover:shadow-sm transition-all"
              >
                {/* Image */}
                <Link href={`/products/${item.productId}`} className="relative w-16 h-16 sm:w-18 sm:h-18 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50 self-center">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between gap-1.5">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <Link href={`/products/${item.productId}`}>
                        <h3 className="font-semibold text-gray-900 text-sm truncate hover:text-purple-600 transition-colors leading-tight">
                          {item.name}
                        </h3>
                      </Link>
                      {item.variantType !== 'Default' && (
                        <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-medium text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-full">
                          <Tag className="h-2 w-2" />
                          {item.variantValue} {item.variantType}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.productId, item.variantType, item.variantValue)}
                      className="p-1 rounded-md text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all flex-shrink-0 -mt-0.5"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Stepper */}
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden h-7">
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantType, item.variantValue, item.quantity - 1)}
                        className="h-full w-7 flex items-center justify-center text-gray-500 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-7 text-center text-xs font-bold text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantType, item.variantValue, Math.min(item.quantity + 1, item.maxStock))}
                        className="h-full w-7 flex items-center justify-center text-gray-500 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400">₹{item.price} × {item.quantity}</p>
                      <p className="text-sm font-bold text-purple-600">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue shopping */}
            <Link href="/products" className="flex items-center gap-2 text-xs text-purple-600 font-semibold hover:gap-3 transition-all w-fit pt-1 pb-1">
              <ArrowRight className="h-3.5 w-3.5 rotate-180" />
              Continue Shopping
            </Link>
          </div>

          {/* ── Order Summary ── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 sticky top-20">

              <h2 className="text-base font-bold text-gray-900 mb-4">Order Summary</h2>

              {/* Items breakdown */}
              <div className="space-y-1.5 mb-3 max-h-36 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs text-gray-500">
                    <span className="truncate mr-2">{item.name} <span className="text-gray-400">×{item.quantity}</span></span>
                    <span className="flex-shrink-0 font-medium text-gray-700">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-gray-100 mb-3" />

              {/* Pickup banner */}
              <div className="flex items-center gap-2.5 bg-purple-50 rounded-xl p-2.5 mb-3">
                <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Store className="h-3.5 w-3.5 text-purple-600" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-purple-700">Store Pickup — FREE</p>
                  <p className="text-[10px] text-purple-500 mt-0.5">Ready within 30 minutes</p>
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-1.5 mb-4">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-700">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Pickup charge</span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>
                <div className="flex justify-between items-center pt-2.5 border-t border-gray-100">
                  <span className="font-bold text-gray-900 text-sm">Total</span>
                  <span className="text-lg font-bold text-purple-600">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <Link href="/checkout" className="block">
                <Button className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-200 text-sm flex items-center justify-center gap-2 transition-all hover:gap-3">
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <p className="text-[10px] text-gray-400 text-center mt-2.5">
                🔒 Secure checkout · 100% authentic sweets
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
