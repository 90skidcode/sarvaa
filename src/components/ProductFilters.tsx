'use client'

import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { ChevronDown, Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Category {
  id: string
  name: string
  slug: string
}

interface ProductFiltersProps {
  categories: Category[]
  activeCategory: string
  onCategoryChange: (slug: string) => void
  priceRange: [number, number]
  onPriceChange: (range: [number, number]) => void
  minMaxPrice: [number, number]
  canLoadMoreCategories?: boolean
  onLoadMoreCategories?: () => void
  loadingMoreCategories?: boolean
}

export function ProductFilters({
  categories,
  activeCategory,
  onCategoryChange,
  priceRange,
  onPriceChange,
  minMaxPrice,
  canLoadMoreCategories,
  onLoadMoreCategories,
  loadingMoreCategories,
}: ProductFiltersProps) {
  const [catSearch, setCatSearch] = useState('')
  const [localPrice, setLocalPrice] = useState<number[]>(priceRange)

  useEffect(() => {
    setLocalPrice(priceRange)
  }, [priceRange])

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(catSearch.toLowerCase()),
  )

  return (
    <div className="space-y-7">
      {/* Categories */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Categories</h3>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search…"
            value={catSearch}
            onChange={(e) => setCatSearch(e.target.value)}
            className="w-full pl-8 pr-8 py-2 text-sm bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-[#743181]/30 focus:outline-none placeholder:text-gray-400"
          />
          {catSearch && (
            <button
              onClick={() => setCatSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
          <button
            onClick={() => onCategoryChange('all')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeCategory === 'all'
                ? 'bg-[#743181] text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            All Categories
          </button>
          {filtered.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.slug)}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeCategory === cat.slug
                  ? 'bg-[#743181] text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {canLoadMoreCategories && onLoadMoreCategories && (
          <button
            onClick={onLoadMoreCategories}
            disabled={loadingMoreCategories}
            className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-[#743181] hover:bg-purple-50 rounded-xl transition-all disabled:opacity-50"
          >
            <ChevronDown className="h-3.5 w-3.5" />
            {loadingMoreCategories ? 'Loading…' : 'Load more'}
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Price range */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">Price Range</h3>
        <Slider
          value={localPrice}
          min={minMaxPrice[0]}
          max={minMaxPrice[1]}
          step={50}
          onValueChange={(v) => setLocalPrice(v)}
          onValueCommit={(v) => onPriceChange([v[0], v[1]])}
          className="mb-6"
        />
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Min</p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">₹</span>
              <Input
                type="number"
                value={localPrice[0]}
                onChange={(e) => setLocalPrice([Number(e.target.value), localPrice[1]])}
                onBlur={() => onPriceChange([localPrice[0], localPrice[1]])}
                className="pl-6 h-9 text-sm font-semibold rounded-xl bg-gray-50 border-0 focus-visible:ring-2 focus-visible:ring-[#743181]/30"
              />
            </div>
          </div>
          <div className="w-4 h-[1px] bg-gray-300 mt-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Max</p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">₹</span>
              <Input
                type="number"
                value={localPrice[1]}
                onChange={(e) => setLocalPrice([localPrice[0], Number(e.target.value)])}
                onBlur={() => onPriceChange([localPrice[0], localPrice[1]])}
                className="pl-6 h-9 text-sm font-semibold rounded-xl bg-gray-50 border-0 focus-visible:ring-2 focus-visible:ring-[#743181]/30"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
