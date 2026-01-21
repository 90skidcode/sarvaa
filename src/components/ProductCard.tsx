'use client'

import { QuantityControl } from '@/components/QuantityControl'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { WeightOption, WeightSelector } from '@/components/WeightSelector'
import { useCartStore } from '@/lib/store'
import { ShoppingCart, Star } from 'lucide-react'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

interface ProductCardProps {
  id: string
  name: string
  description: string
  price: number
  image: string
  stock: number
  weights?: string | null
  badge?: string
  rating?: number
  reviews?: number
}

export function ProductCard({
  id,
  name,
  description,
  price,
  image,
  stock,
  weights,
  badge,
  rating = 4.8,
  reviews = 0
}: ProductCardProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedWeight, setSelectedWeight] = useState<string>('')
  const addItem = useCartStore((state) => state.addItem)

  // Parse weights from JSON string
  const weightOptions: WeightOption[] = useMemo(() => {
    if (!weights) return []
    try {
      return JSON.parse(weights) as WeightOption[]
    } catch {
      return []
    }
  }, [weights])

  // Initialize selected weight with first option or use base price
  useMemo(() => {
    if (weightOptions.length > 0 && !selectedWeight) {
      setSelectedWeight(weightOptions[0].weight)
    } else if (!selectedWeight) {
      setSelectedWeight('default')
    }
  }, [weightOptions, selectedWeight])

  // Get current price based on selected weight
  const currentPrice = useMemo(() => {
    if (weightOptions.length === 0) return price
    
    const selectedOption = weightOptions.find((w) => w.weight === selectedWeight)
    return selectedOption?.price || price
  }, [selectedWeight, weightOptions, price])

  const handleAddToCart = () => {
    addItem({
      productId: id,
      name,
      image,
      price: currentPrice,
      quantity,
      weight: selectedWeight,
      maxStock: stock
    })
    
    toast.success(`Added ${quantity}x ${name} (${selectedWeight}) to cart!`, {
      description: `₹${(currentPrice * quantity).toFixed(2)}`
    })
    
    // Reset quantity after adding
    setQuantity(1)
  }

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300">
      <CardContent className="p-0">
        {/* Image */}
        <div className="relative h-64 overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
          {badge && (
            <Badge className="absolute top-4 left-4 bg-[#743181] text-white">
              {badge}
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Title & Rating */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{name}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
            {reviews > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium ml-1">{rating}</span>
                </div>
                <span className="text-xs text-gray-500">({reviews} reviews)</span>
              </div>
            )}
          </div>

          {/* Weight Selector */}
          {weightOptions.length > 0 && (
            <WeightSelector
              weights={weightOptions}
              selectedWeight={selectedWeight}
              onWeightChange={setSelectedWeight}
              className="w-full"
            />
          )}

          {/* Price & Quantity */}
          <div className="flex items-center justify-between">
<div>
              <span className="text-2xl font-bold text-[#743181]">
                ₹{currentPrice}
              </span>
              {weightOptions.length === 0 && (
                <span className="text-sm text-gray-500 ml-2">/ pack</span>
              )}
            </div>
            <QuantityControl
              quantity={quantity}
              onQuantityChange={setQuantity}
              max={Math.min(stock, 99)}
            />
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={stock === 0}
            className="w-full bg-gradient-to-r from-[#743181] to-[#5a2a6e] hover:from-[#5a2a6e] hover:to-[#743181] text-white"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>

          {stock > 0 && stock <= 5 && (
            <p className="text-xs text-orange-600 text-center">
              Only {stock} left in stock!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
