'use client'

import { QuantityControl } from '@/components/QuantityControl'
import { ImageWithFallback } from '@/components/ImageWithFallback'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCartStore } from '@/lib/store'
import { ShoppingBag, Store, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function CartPage() {
  const { items, removeItem, updateQuantity, getSubtotal, clearCart } = useCartStore()
  const subtotal = getSubtotal()

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="max-w-2xl mx-auto text-center">
            <ShoppingBag className="h-16 sm:h-24 w-16 sm:w-24 text-gray-300 mx-auto mb-4 sm:mb-6" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
              Looks like you haven't added any Tamil sweets yet. Start shopping to fill your cart!
            </p>
            <Link href="/products">
              <Button size="lg" className="bg-gradient-to-r from-[#743181] to-[#5a2a6e] hover:from-[#5a2a6e] hover:to-[#743181]">
                Browse Sweets
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-3 sm:px-4">

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-3 sm:p-6">
                  <div className="flex gap-3 sm:gap-4">
                    <div className="relative w-16 sm:w-24 h-16 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start gap-2 mb-1.5 sm:mb-2">
                        <div>
                          <h3 className="text-sm sm:text-lg font-bold text-gray-900">{item.name}</h3>
                          <p className="text-xs sm:text-sm text-gray-500">
                             {item.variantValue} {item.variantType === 'Default' ? '' : item.variantType}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId, item.variantType, item.variantValue)}
                          className="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors flex-shrink-0"
                        >
                          <Trash2 className="h-4 sm:h-5 w-4 sm:w-5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-2 sm:mt-4 gap-2">
                        <QuantityControl
                          quantity={item.quantity}
                          onQuantityChange={(qty) => updateQuantity(item.productId, item.variantType, item.variantValue, qty)}
                          max={item.maxStock}
                        />
                        <div className="text-right">
                          <div className="text-xs sm:text-sm text-gray-500">₹{item.price} each</div>
                          <div className="text-base sm:text-xl font-bold text-[#743181]">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-between items-center pt-2 sm:pt-4">
              <Button
                variant="outline"
                onClick={clearCart}
                className="text-red-500 border-red-300 hover:bg-red-50 px-3 sm:px-6 text-xs sm:text-sm h-9 sm:h-10"
              >
                <Trash2 className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Clear Cart</span>
                <span className="sm:hidden">Clear</span>
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 border-none shadow-lg">
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Order Summary</h2>

                {/* Pickup Info */}
                <div className="bg-purple-50 border border-purple-100 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 sm:gap-3 text-[#743181]">
                    <Store className="h-4 sm:h-5 w-4 sm:w-5 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-xs sm:text-sm">Store Pickup Only</p>
                      <p className="text-[8px] sm:text-xs text-purple-600/70">Free pickup from our stores</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  <div className="flex justify-between text-xs sm:text-base text-gray-600">
                    <span>Subtotal ({items.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-base text-gray-600">
                    <span>Pickup</span>
                    <span className="text-emerald-600 font-bold">FREE</span>
                  </div>
                  <div className="border-t pt-2 sm:pt-3 mt-2 sm:mt-4">
                    <div className="flex justify-between text-base sm:text-xl font-bold text-gray-900">
                      <span>Total</span>
                      <span className="text-[#743181]">
                        ₹{subtotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <Link href="/checkout" className="w-full block">
                  <Button className="w-full bg-gradient-to-r from-[#743181] to-[#5a2a6e] hover:from-[#5a2a6e] hover:to-[#743181] py-4 sm:py-8 text-sm sm:text-lg font-bold shadow-lg shadow-purple-200">
                    Proceed to Checkout
                  </Button>
                </Link>

                <p className="text-[8px] sm:text-xs text-gray-400 text-center mt-3 sm:mt-6">
                  Secure Checkout • Premium Quality Guaranteed
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
