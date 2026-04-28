'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Search, X, Plus } from 'lucide-react'
import Link from 'next/link'
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
  loadingMoreCategories
}: ProductFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [localPrice, setLocalPrice] = useState<number[]>(priceRange)

  useEffect(() => {
    setLocalPrice(priceRange)
  }, [priceRange])

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 w-full max-w-[280px]">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Filter</h2>
        <Button variant="link" className="text-[#00B5B5] p-0 h-auto font-medium" onClick={() => {
          onCategoryChange('all')
          onPriceChange(minMaxPrice)
        }}>
          Reset All
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={['categories', 'price']} className="w-full">
        {/* Categories Section */}
        <AccordionItem value="categories" className="border-b">
          <AccordionTrigger className="text-base font-semibold hover:no-underline">
            <div className="flex items-center justify-between w-full">
              <span>Categories</span>
              <Link href="/admin/categories/new" className="no-underline">
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-purple-50" title="Add new category">
                  <Plus className="h-3 w-3 text-[#743181]" />
                </Button>
              </Link>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9 bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-[#743181]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar mb-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cat-all"
                  checked={activeCategory === 'all'}
                  onCheckedChange={() => onCategoryChange('all')}
                />
                <label
                  htmlFor="cat-all"
                  className={`text-sm font-medium leading-none cursor-pointer ${activeCategory === 'all' ? 'text-gray-900' : 'text-gray-600'}`}
                >
                  All Categories
                </label>
              </div>
              {filteredCategories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cat-${category.slug}`}
                    checked={activeCategory === category.slug}
                    onCheckedChange={() => onCategoryChange(category.slug)}
                  />
                  <label
                    htmlFor={`cat-${category.slug}`}
                    className={`text-sm font-medium leading-none cursor-pointer ${activeCategory === category.slug ? 'text-gray-900' : 'text-gray-600'}`}
                  >
                    {category.name}
                  </label>
                </div>
              ))}
            </div>
            {canLoadMoreCategories && onLoadMoreCategories && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLoadMoreCategories}
                disabled={loadingMoreCategories}
                className="w-full text-[#743181] hover:bg-purple-50"
              >
                {loadingMoreCategories ? 'Loading...' : 'Load More Categories'}
              </Button>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Price Range Section */}
        <AccordionItem value="price" className="border-b">
          <AccordionTrigger className="text-base font-semibold hover:no-underline">
            Price
          </AccordionTrigger>
          <AccordionContent className="pt-6 pb-4 px-1">
            <Slider
              defaultValue={localPrice}
              value={localPrice}
              min={minMaxPrice[0]}
              max={minMaxPrice[1]}
              step={10}
              onValueChange={(val) => setLocalPrice(val)}
              onValueCommit={(val) => onPriceChange([val[0], val[1]])}
              className="mb-8"
            />
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Min Price</span>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">₹</span>
                  <Input 
                    type="number" 
                    value={localPrice[0]} 
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      setLocalPrice([val, localPrice[1]])
                    }}
                    onBlur={() => onPriceChange([localPrice[0], localPrice[1]])}
                    className="pl-5 h-9 text-xs font-semibold"
                  />
                </div>
              </div>
              <div className="flex-1">
                <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Max Price</span>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">₹</span>
                  <Input 
                    type="number" 
                    value={localPrice[1]} 
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      setLocalPrice([localPrice[0], val])
                    }}
                    onBlur={() => onPriceChange([localPrice[0], localPrice[1]])}
                    className="pl-5 h-9 text-xs font-semibold"
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
