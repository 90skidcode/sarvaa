'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ImageWithFallback } from '@/components/ImageWithFallback'
import { WeightOption, WeightSelector } from '@/components/WeightSelector'
import { getCurrentUser, isAuthenticated } from '@/lib/api-client'
import { useCartStore } from '@/lib/store'
import { ArrowLeft, Heart, ShoppingBag, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

interface WishlistItem {
  id: string
  product: {
    id: string
    name: string
    slug: string
    description: string
    price: number
    image: string
    images?: string | null
    stock: number
    weights?: string | null
    featured: boolean
    category: {
      name: string
    }
  }
}

export default function WishlistPage() {
  const router = useRouter()
  const addItem = useCartStore((state) => state.addItem)
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [selectedWeights, setSelectedWeights] = useState<Record<string, string>>({})

  useEffect(() => {
    setMounted(true)

    if (!isAuthenticated()) {
      setLoading(false)
      router.push('/login?redirect=/wishlist')
      return
    }

    fetchWishlist()

    const handleWishlistUpdate = () => {
      fetchWishlist()
    }

    globalThis.addEventListener('wishlistUpdated', handleWishlistUpdate)

    return () => {
      globalThis.removeEventListener('wishlistUpdated', handleWishlistUpdate)
    }
  }, [router])

  const fetchWishlist = async () => {
    if (!isAuthenticated()) return
    const user = getCurrentUser()
    if (!user?.id) return

    try {
      const res = await fetch(`/api/wishlist?userId=${user.id}`)
      if (!res.ok) throw new Error('Failed to fetch wishlist')
      const data = await res.json()
      setItems(data.wishlist || [])
    } catch (error) {
      console.error('Error fetching wishlist:', error)
      toast.error('Failed to load wishlist')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFromWishlist = async (itemId: string) => {
    setRemoving(itemId)
    try {
      const res = await fetch(`/api/wishlist/${itemId}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Failed to remove')

      setItems(items.filter(item => item.id !== itemId))
      toast.success('Removed from wishlist')
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      toast.error('Failed to remove from wishlist')
    } finally {
      setRemoving(null)
    }
  }

  const handleAddToCart = (product: WishlistItem['product']) => {
    const weightStr = selectedWeights[product.id]
    let variantType = 'Default'
    let variantValue = 'Pack'
    let variantPrice = product.price

    if (weightStr && product.weights) {
      try {
        const weights = JSON.parse(product.weights)
        const [type, value] = weightStr.split(':')
        const selected = weights.find((w: any) => w.type === type && (w.value || w.weight) === value)
        if (selected) {
          variantType = selected.type || type
          variantValue = (selected.value || selected.weight || value).toString()
          variantPrice = selected.price || product.price
        }
      } catch (error) {
        console.error('Error parsing weights:', error)
        // Keep defaults
      }
    }

    addItem({
      productId: product.id,
      name: product.name,
      image: product.image,
      price: variantPrice,
      quantity: 1,
      variantType,
      variantValue,
      maxStock: product.stock
    })

    const label = variantType === 'Default' ? '' : ` (${variantValue} ${variantType})`
    toast.success(`${product.name}${label} added to cart`)
  }

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#743181]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header with Back Button */}
        <div className="mb-10">
          <Link href="/products" className="inline-flex items-center text-[#743181] hover:text-[#5a2a6e] mb-6 font-medium">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <Badge className="mb-2 bg-purple-100 text-[#743181]">My Saved Sweets</Badge>
              <h1 className="text-4xl font-bold text-gray-900">Your Wishlist</h1>
              <p className="text-gray-600 mt-1">{items.length} item{items.length !== 1 ? 's' : ''} saved</p>
            </div>
            <Link href="/products">
              <Button className="bg-gradient-to-r from-[#743181] to-[#5a2a6e] text-white">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>

        {items.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12">
              <div className="text-center">
                <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="h-10 w-10 text-gray-300" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Add your favorite sweets to your wishlist to keep track of them and buy them later.
                </p>
                <Link href="/products">
                  <Button className="bg-gradient-to-r from-[#743181] to-[#5a2a6e] text-white px-8 py-6 rounded-xl text-lg font-bold">
                    Explore Our Sweets
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => {
              const { product } = item

              return (
                <Card key={item.id} className="border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full">
                  {/* Product Image */}
                  <Link href={`/products/${product.slug}`} className="relative aspect-square overflow-hidden bg-gray-50 group">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.featured && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                          Bestseller
                        </Badge>
                      </div>
                    )}
                  </Link>

                  {/* Content */}
                  <CardContent className="p-4 flex flex-col flex-grow">
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="font-bold text-gray-900 line-clamp-2 hover:text-[#743181] transition-colors mb-1">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-gray-500 mb-3">{product.category.name}</p>

                    <p className="text-gray-600 text-xs line-clamp-2 mb-3 flex-grow">{product.description}</p>

                    <div className="mb-3">
                      {product.stock > 0 ? (
                        <span className="text-xs text-green-600 font-semibold">In Stock</span>
                      ) : (
                        <span className="text-xs text-red-600 font-semibold">Out of Stock</span>
                      )}
                    </div>

                    <p className="text-xl font-bold text-[#743181] mb-4">₹{product.price}</p>

                    {/* Weight Selector */}
                    {(() => {
                      const weights = product.weights ? (() => {
                        try {
                          const parsed = JSON.parse(product.weights)
                          return parsed.map((w: any) => ({
                            type: w.type || 'Weight',
                            value: (w.value || w.weight || '').toString(),
                            price: Number(w.price)
                          })) as WeightOption[]
                        } catch {
                          return []
                        }
                      })() : []

                      if (weights.length === 0) return null

                      const selectedWeight = selectedWeights[product.id] || `${weights[0].type}:${weights[0].value}`

                      return (
                        <div className="mb-4">
                          <label className="text-xs font-semibold text-gray-700 block mb-2">Select Size</label>
                          <WeightSelector
                            weights={weights}
                            selectedWeight={selectedWeight}
                            onWeightChange={(weight) => setSelectedWeights({ ...selectedWeights, [product.id]: weight })}
                            className="w-full"
                          />
                        </div>
                      )
                    })()}

                    {/* Actions */}
                    <div className="flex flex-col gap-2 mt-auto">
                      <Button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className="bg-gradient-to-r from-[#743181] to-[#5a2a6e] text-white h-10 text-sm font-semibold rounded-lg"
                      >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                      <Button
                        onClick={() => handleRemoveFromWishlist(item.id)}
                        disabled={removing === item.id}
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50 h-10 text-sm font-semibold rounded-lg"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {removing === item.id ? 'Removing...' : 'Remove'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
