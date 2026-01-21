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
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={handleDecrease}
        disabled={quantity <= min}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="w-12 text-center font-medium">{quantity}</span>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={handleIncrease}
        disabled={quantity >= max}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
