'use client'

import { ProductCard } from '@/components/ProductCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getCurrentUser, isAuthenticated } from '@/lib/api-client'
import { Heart } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

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
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login?redirect=/wishlist')
      return
    }

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
      } finally {
        setLoading(false)
      }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#743181]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <div>
            <Badge className="mb-2 bg-purple-100 text-[#743181]">My Saved Sweets</Badge>
            <h1 className="text-4xl font-bold text-gray-900">Your Wishlist</h1>
          </div>
          <Link href="/products">
            <Button variant="outline" className="mt-4 md:mt-0 border-[#743181] text-[#743181] hover:bg-purple-50">
              Continue Shopping
            </Button>
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
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
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => {
              const { product } = item
              // Parse additional images
              let additionalImages: string[] = []
              if (product.images) {
                try {
                  additionalImages = JSON.parse(product.images)
                } catch (e) {
                  // Ignore
                }
              }

              return (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  slug={product.slug}
                  name={product.name}
                  description={product.description}
                  price={product.price}
                  image={product.image}
                  images={additionalImages}
                  stock={product.stock}
                  weights={product.weights}
                  badge={product.featured ? 'Bestseller' : undefined}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
