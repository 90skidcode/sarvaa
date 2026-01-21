'use client'

import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/store'
import { ShoppingCart } from 'lucide-react'
import Link from 'next/link'

export function CartBadge() {
  const itemCount = useCartStore((state) => state.getItemCount())

  return (
    <Link href="/cart">
      <Button variant="ghost" size="icon" className="relative">
        <ShoppingCart className="h-5 w-5 text-gray-600" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#743181] text-white text-xs rounded-full flex items-center justify-center font-medium">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </Button>
    </Link>
  )
}
