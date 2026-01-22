'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export interface WeightOption {
  type: string
  value: string
  price: number
}

interface WeightSelectorProps {
  weights: WeightOption[]
  selectedWeight: string // format "type:value"
  onWeightChange: (weight: string) => void
  className?: string
}

export function WeightSelector({ weights, selectedWeight, onWeightChange, className }: WeightSelectorProps) {
  if (!weights || weights.length === 0) {
    return null
  }

  return (
    <Select value={selectedWeight} onValueChange={onWeightChange}>
      <SelectTrigger className={`bg-gray-50/50 border-gray-100 rounded-xl h-11 focus:ring-[#743181]/20 ${className}`}>
        <SelectValue placeholder="Select variant" />
      </SelectTrigger>
      <SelectContent>
        {weights.map((option) => {
          const key = `${option.type}:${option.value}`;
          // Display format: "250 Grams" or "1 Pieces"
          const label = `${option.value} ${option.type}`;
          return (
            <SelectItem key={key} value={key}>
              {label} - ₹{option.price}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  )
}
