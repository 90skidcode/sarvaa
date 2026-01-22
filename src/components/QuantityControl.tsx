'use client'

import { Button } from '@/components/ui/button'
import { Minus, Plus } from 'lucide-react'

interface QuantityControlProps {
  quantity: number
  onQuantityChange: (quantity: number) => void
  min?: number
  max?: number
  className?: string
}

export function QuantityControl({ 
  quantity, 
  onQuantityChange, 
  min = 1, 
  max = 99,
  className 
}: QuantityControlProps) {
  const handleDecrease = () => {
    if (quantity > min) {
      onQuantityChange(quantity - 1)
    }
  }

  const handleIncrease = () => {
    if (quantity < max) {
      onQuantityChange(quantity + 1)
    }
  }

  return (
    <div className={`flex items-center gap-3 bg-gray-50/50 rounded-full p-1 border border-gray-100 ${className}`}>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full bg-white border border-gray-100 shadow-sm hover:bg-gray-50 transition-all text-[#743181]"
        onClick={handleDecrease}
        disabled={quantity <= min}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="w-6 text-center font-bold text-gray-900">{quantity}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full bg-white border border-gray-100 shadow-sm hover:bg-gray-50 transition-all text-[#743181]"
        onClick={handleIncrease}
        disabled={quantity >= max}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
