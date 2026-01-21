'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export interface WeightOption {
  weight: string
  price: number
}

interface WeightSelectorProps {
  weights: WeightOption[]
  selectedWeight: string
  onWeightChange: (weight: string) => void
  className?: string
}

export function WeightSelector({ weights, selectedWeight, onWeightChange, className }: WeightSelectorProps) {
  if (!weights || weights.length === 0) {
    return null
  }

  return (
    <Select value={selectedWeight} onValueChange={onWeightChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Select weight" />
      </SelectTrigger>
      <SelectContent>
        {weights.map((option) => (
          <SelectItem key={option.weight} value={option.weight}>
            {option.weight} - ₹{option.price}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
