'use client'

import { QuantityControl } from '@/components/QuantityControl'
import { Button } from '@/components/ui/button'
import { WeightOption, WeightSelector } from '@/components/WeightSelector'
import { useCartStore } from '@/lib/store'
import { ChevronLeft, ChevronRight, Heart, Share2, ShoppingCart, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

interface ProductDetailClientProps {
  product: {
    id: string
    name: string
    description: string
    price: number
    images: string[]
    stock: number
    weights?: string | null
    category: {
      id: string
      name: string
      slug: string
    }
  }
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedWeight, setSelectedWeight] = useState<string>('')
  const [isFavorited, setIsFavorited] = useState(false)
  const addItem = useCartStore((state) => state.addItem)

  // Parse weights from JSON string
  const weightOptions: WeightOption[] = useMemo(() => {
    if (!product.weights) return []
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
  }, [product.weights])

  // Initialize selected weight
  useEffect(() => {
    if (weightOptions.length > 0 && !selectedWeight) {
      const first = weightOptions[0]
      setSelectedWeight(`${first.type}:${first.value}`)
    } else if (weightOptions.length === 0 && !selectedWeight) {
      setSelectedWeight('Default:Pack')
    }
  }, [weightOptions, selectedWeight])

  // Get current price based on selected weight
  const variantData = useMemo(() => {
    if (weightOptions.length === 0) return { price: product.price, type: 'Default', value: 'Pack' }
    
    const [type, value] = selectedWeight.split(':')
    const selectedOption = weightOptions.find((w) => w.type === type && w.value === value)
    
    return {
      price: selectedOption?.price || product.price,
      type: selectedOption?.type || type,
      value: selectedOption?.value || value
    }
  }, [selectedWeight, weightOptions, product.price])

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      image: product.images[0],
      price: variantData.price,
      quantity,
      variantType: variantData.type,
      variantValue: variantData.value,
      maxStock: product.stock
    })
    
    const label = variantData.type === 'Default' ? '' : ` (${variantData.value} ${variantData.type})`
    toast.success(`Added ${quantity}x ${product.name}${label} to cart!`, {
      description: `₹${(variantData.price * quantity).toFixed(2)}`
    })
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length)
  }

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href
        })
      } catch (err) {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-purple-600 transition">
            Home
          </Link>
          <span>/</span>
          <Link href={`/?category=${product.category.slug}`} className="hover:text-purple-600 transition">
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Section */}
          <div className="space-y-4">
            {/* Main Image with Slider */}
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-white shadow-lg group">
              <Image
                src={product.images[currentImageIndex]}
                alt={`${product.name} - Image ${currentImageIndex + 1}`}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              
              {/* Navigation Arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={previousImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-800" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-800" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              {product.images.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                  {currentImageIndex + 1} / {product.images.length}
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-square rounded-xl overflow-hidden transition-all duration-300 ${
                      currentImageIndex === index
                        ? 'ring-4 ring-purple-600 scale-105'
                        : 'ring-2 ring-gray-200 hover:ring-purple-300'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="150px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <Link
                    href={`/?category=${product.category.slug}`}
                    className="text-sm font-semibold text-purple-600 hover:text-purple-700 transition"
                  >
                    {product.category.name}
                  </Link>
                  <h1 className="text-4xl font-bold text-gray-900 mt-1">
                    {product.name}
                  </h1>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsFavorited(!isFavorited)}
                    className="p-3 rounded-full hover:bg-purple-50 transition"
                    aria-label="Add to favorites"
                  >
                    <Heart
                      className={`w-6 h-6 transition ${
                        isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400'
                      }`}
                    />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-3 rounded-full hover:bg-purple-50 transition"
                    aria-label="Share product"
                  >
                    <Share2 className="w-6 h-6 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-600">
                  4.8 (156 reviews)
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-lg leading-relaxed">
              {product.description}
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-gray-900">
                ₹{variantData.price}
              </span>
              {weightOptions.length === 0 && (
                <span className="text-lg text-gray-500">/ pack</span>
              )}
            </div>

            {/* Weight Selector */}
            {weightOptions.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Select Size
                </label>
                <WeightSelector
                  weights={weightOptions}
                  selectedWeight={selectedWeight}
                  onWeightChange={setSelectedWeight}
                  className="w-full"
                />
              </div>
            )}

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Quantity
              </label>
              <QuantityControl
                quantity={quantity}
                onQuantityChange={setQuantity}
                max={Math.min(product.stock, 99)}
              />
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-orange-500 animate-pulse' : 'bg-red-500'}`} />
              <span className={`text-sm font-medium ${product.stock > 10 ? 'text-green-700' : product.stock > 0 ? 'text-orange-700' : 'text-red-700'}`}>
                {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left!` : 'Out of Stock'}
              </span>
            </div>

            {/* Add to Cart Button */}
            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
                <div className="text-2xl mb-1">🎁</div>
                <p className="text-xs font-medium text-gray-600">Gift Packaging</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">🚚</div>
                <p className="text-xs font-medium text-gray-600">Free Delivery</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">✨</div>
                <p className="text-xs font-medium text-gray-600">Fresh Daily</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
