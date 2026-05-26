'use client'

import { Progress } from '@/components/ui/progress'
import { useCartStore, useSettingsStore } from '@/lib/store'
import { Truck } from 'lucide-react'

export function FreeShippingProgress() {
  const subtotal = useCartStore((state) => state.getSubtotal())
  const threshold = useSettingsStore((state) => state.freeShippingThreshold)

  const progress = Math.min((subtotal / threshold) * 100, 100)
  const remaining = Math.max(threshold - subtotal, 0)

  if (subtotal >= threshold) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 text-green-700">
          <Truck className="h-5 w-5" />
          <span className="font-medium">🎉 You qualify for FREE shipping!</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 text-gray-700 mb-2">
        <Truck className="h-5 w-5 text-[#743181]" />
        <span className="text-sm">
          Add <span className="font-bold text-[#743181]">₹{remaining.toFixed(2)}</span> more for FREE shipping
        </span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  )
}
