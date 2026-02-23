'use client'

import { QuantityControl } from '@/components/QuantityControl'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { WeightOption, WeightSelector } from '@/components/WeightSelector'
import { getCurrentUser, isAuthenticated } from '@/lib/api-client'
import { useCartStore } from '@/lib/store'
import { Heart, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

interface ProductCardProps {
  readonly id: string
  readonly slug: string
  readonly name: string
  readonly description: string
  readonly price: number
  readonly image: string
  readonly images?: string[]
  readonly stock: number
  readonly weights?: string | null
  readonly badge?: string
  readonly rating?: number
  readonly reviews?: number
}

export function ProductCard({
  id,
  slug,
  name,
  description,
  price,
  image,
  images = [],
  stock,
  weights,
  badge,
  rating = 4.8,
  reviews = 0
}: ProductCardProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedWeight, setSelectedWeight] = useState<string>('')
  const [isHovered, setIsHovered] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const addItem = useCartStore((state) => state.addItem)

  // Combine primary image with additional images
  const allImages = useMemo(() => {
    const combined = [image]
    if (images && images.length > 0) {
      combined.push(...images)
    }
    return combined
  }, [image, images])

  // Parse weights from JSON string
  const weightOptions: WeightOption[] = useMemo(() => {
    if (!weights) return []
    try {
      const parsed = JSON.parse(weights);
      // Support both old and new format for backward compatibility
      return parsed.map((w: any) => ({
        type: w.type || 'Weight',
        value: (w.value || w.weight || '').toString(),
        price: Number(w.price)
      })) as WeightOption[]
    } catch {
      return []
    }
  }, [weights])

  // Check wishlist status on mount
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!isAuthenticated()) return
      const user = getCurrentUser()
      if (!user?.id) return

      try {
        const res = await fetch(`/api/wishlist?userId=${user.id}`)
        const data = await res.json()
        const found = data.wishlist?.some((item: any) => item.productId === id)
        setIsInWishlist(!!found)
      } catch (error) {
        console.error('Error checking wishlist status:', error)
      }
    }
    checkWishlistStatus()
  }, [id])

  // Initialize selected weight
  useEffect(() => {
    if (weightOptions.length > 0 && !selectedWeight) {
      const first = weightOptions[0];
      setSelectedWeight(`${first.type}:${first.value}`);
    } else if (weightOptions.length === 0 && !selectedWeight) {
      setSelectedWeight('Default:Pack');
    }
  }, [weightOptions, selectedWeight])

  // Get current price and display label based on selected weight
  const variantData = useMemo(() => {
    if (weightOptions.length === 0) return { price, type: 'Default', value: 'Pack' }
    
    const [type, value] = selectedWeight.split(':');
    const selectedOption = weightOptions.find((w) => w.type === type && w.value === value)
    
    return {
      price: selectedOption?.price || price,
      type: selectedOption?.type || type,
      value: selectedOption?.value || value
    }
  }, [selectedWeight, weightOptions, price])

  const handleAddToCart = () => {
    addItem({
      productId: id,
      name,
      image,
      price: variantData.price,
      quantity,
      variantType: variantData.type,
      variantValue: variantData.value,
      maxStock: stock
    })
    
    const label = variantData.type === 'Default' ? '' : ` (${variantData.value} ${variantData.type})`
    toast.success(`Added ${quantity}x ${name}${label} to cart!`, {
      description: `₹${(variantData.price * quantity).toFixed(2)}`
    })
    
    setQuantity(1)
  }

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated()) {
      toast.error('Please login to add items to your wishlist')
      return
    }

    const user = getCurrentUser()
    if (!user?.id) return

    setWishlistLoading(true)
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, productId: id })
      })
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.details || data.error || 'Failed to update wishlist')
      }
      
      if (data.status === 'added') {
        setIsInWishlist(true)
        toast.success('Added to wishlist')
      } else if (data.status === 'removed') {
        setIsInWishlist(false)
        console.log('Successfully removed from wishlist');
        toast.success('Removed from wishlist')
      }
      
      // Notify header to update count
      globalThis.dispatchEvent(new Event('wishlistUpdated'))
    } catch (error: any) {
      toast.error(error.message || 'Failed to update wishlist')
    } finally {
      setWishlistLoading(false)
    }
  }

  // Auto-rotate images on hover
  useEffect(() => {
    if (!isHovered || allImages.length <= 1) {
      setCurrentImageIndex(0)
      return
    }

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
    }, 800) // Rotate every 800ms

    return () => clearInterval(interval)
  }, [isHovered, allImages.length])

  return (
    <Card className="group overflow-hidden rounded-3xl border-none bg-white shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full p-0 gap-0">
      <CardContent className="p-0 flex flex-col h-full">
        {/* Image Section */}
        <Link 
          href={`/products/${slug}`} 
          className="relative aspect-square overflow-hidden rounded-t-3xl block"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Image
            src={allImages[currentImageIndex]}
            alt={name}
            fill
            className="object-cover transition-all duration-300 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
            <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleWishlist}
                disabled={wishlistLoading}
                className={`h-9 w-9 rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:bg-white transition-all ${isInWishlist ? 'text-red-500' : 'text-gray-400'}`}
              >
                {wishlistLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Heart 
                    className="h-5 w-5" 
                    fill={isInWishlist ? "currentColor" : "none"} 
                  />
                )}
              </Button>
              {badge && (
                <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg uppercase tracking-wider">
                  {badge}
                </span>
              )}
            </div>

          {/* Image Dots Indicator */}
          {allImages.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
              {allImages.map((_, index) => (
                <div
                  key={`dot-${id}-${index}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentImageIndex 
                      ? 'w-6 bg-white' 
                      : 'w-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </Link>

        {/* Content Section */}
        <div className="p-5 flex flex-col flex-grow space-y-3">
          {/* Product Name */}
          <Link href={`/products/${slug}`}>
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1 hover:text-purple-600 transition cursor-pointer">
              {name}
            </h3>
          </Link>
          
          {/* Description */}
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
            {description}
          </p>

          <div className="mt-auto space-y-3">
            {/* Price and Weight Selector Row */}
            <div className="flex items-center justify-between gap-3">
              {/* Price */}
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-gray-900">
                  ₹{variantData.price}
                </span>
              </div>
              
              {/* Weight Selector */}
              {weightOptions.length > 0 && (
                <WeightSelector
                  weights={weightOptions}
                  selectedWeight={selectedWeight}
                  onWeightChange={setSelectedWeight}
                  className="flex-shrink-0"
                />
              )}
            </div>

            {/* Quantity Control and Add to Cart Row */}
            <div className="flex items-center gap-3">
              {/* Quantity Control */}
              <QuantityControl
                quantity={quantity}
                onQuantityChange={setQuantity}
                max={Math.min(stock, 99)}
              />
              
              {/* Add to Cart Button */}
              <Button
                onClick={handleAddToCart}
                disabled={stock === 0}
                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold shadow-md transition-all hover:shadow-lg active:scale-95"
              >
                Add to Cart
              </Button>
            </div>

            {/* Low Stock Warning */}
            {stock > 0 && stock <= 5 && (
              <div className="flex items-center justify-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                <p className="text-xs font-medium text-orange-600">
                  Only {stock} left in stock
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
