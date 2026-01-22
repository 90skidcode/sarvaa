'use client'

import { QuantityControl } from '@/components/QuantityControl'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { WeightOption, WeightSelector } from '@/components/WeightSelector'
import { useCartStore } from '@/lib/store'
import { ShoppingCart } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
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

  return (
    <Card className="group overflow-hidden rounded-[2rem] border-none bg-white shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col h-full py-0">
      <CardContent className="p-0 flex flex-col h-full">
        {/* Image Section */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
          
          {badge && (
            <div className="absolute top-4 left-4 z-10">
              <span className="bg-[#743181] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                {badge}
              </span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="px-6 pb-6 pt-2 flex flex-col flex-grow space-y-4">
          {/* Header: Name & Description */}
          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-[#1a1a1a] tracking-tight group-hover:text-[#743181] transition-colors line-clamp-1">
              {name}
            </h3>
            <p className="text-sm font-medium text-gray-500 line-clamp-2 leading-relaxed h-10">
              {description}
            </p>
          </div>

          <div className="pt-2 space-y-4 mt-auto">
            {/* Action Bar: Weight & Price */}
            <div className="space-y-4">
              {weightOptions.length > 0 && (
                <WeightSelector
                  weights={weightOptions}
                  selectedWeight={selectedWeight}
                  onWeightChange={setSelectedWeight}
                  className="w-full"
                />
              )}

              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-[#743181]">
                      ₹{variantData.price}
                    </span>
                    {weightOptions.length === 0 && (
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">/ pack</span>
                    )}
                  </div>
                </div>
                
                <QuantityControl
                  quantity={quantity}
                  onQuantityChange={setQuantity}
                  max={Math.min(stock, 99)}
                />
              </div>
            </div>

            {/* CTA Button */}
            <Button
              onClick={handleAddToCart}
              disabled={stock === 0}
              className="w-full h-14 rounded-2xl bg-[#743181] hover:bg-[#5a2a6e] text-white font-bold text-base shadow-lg shadow-purple-100 transition-all hover:-translate-y-1 active:scale-[0.98] group/btn"
            >
              <ShoppingCart className="h-5 w-5 mr-2 transition-transform group-hover/btn:-rotate-12" />
              {stock === 0 ? 'Fresh out!' : 'Add to Cart'}
            </Button>

            {stock > 0 && stock <= 5 && (
              <div className="flex items-center justify-center gap-1.5 animate-pulse">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">
                  Rare Find: Only {stock} left
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
