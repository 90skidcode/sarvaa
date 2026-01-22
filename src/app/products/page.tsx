'use client'

import { ProductCard } from '@/components/ProductCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Filter, Search } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  image: string
  stock: number
  weights?: string | null
  featured: boolean
  category: {
    id: string
    name: string
    slug: string
  }
}

const FILTER_CATEGORIES = [
  { label: 'All', value: 'all' },
  { label: 'Traditional', value: 'traditional-tn' },
  { label: 'Temple Prasadam', value: 'temple-prasadam' },
  { label: 'Chettinad', value: 'chettinad-specials' },
  { label: 'Festival', value: 'festival-specials' },
  { label: 'Gift Boxes', value: 'gift-boxes' }
]

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('search')
  
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    fetchProducts()
  }, [activeFilter])

  useEffect(() => {
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const filtered = allProducts.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.name.toLowerCase().includes(query)
      )
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts(allProducts)
    }
  }, [searchQuery, allProducts])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const url = activeFilter === 'all' 
        ? '/api/products'
        : `/api/products?category=${activeFilter}`
      
      const response = await fetch(url)
      const data = await response.json()
      setAllProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const products = filteredProducts

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">

          <h1 className="text-4xl font-bold text-gray-900 mb-2">Tamil Sweets Collection</h1>
          <p className="text-lg text-gray-600">
            Discover our authentic Tamil Nadu sweets, handcrafted with pure ghee and traditional recipes
          </p>
        </div>

        {/* Search and Filters Combined */}
        <div className="mb-8 bg-white rounded-lg p-6 shadow-sm">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Search Box - Left Side */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Search className="h-5 w-5 text-[#743181]" />
                <h2 className="text-lg font-semibold text-gray-900">Search Products</h2>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery || ''}
                  onChange={(e) => {
                    const query = e.target.value
                    if (query) {
                      globalThis.history.pushState({}, '', `/products?search=${encodeURIComponent(query)}`)
                    } else {
                      globalThis.history.pushState({}, '', '/products')
                    }
                    globalThis.dispatchEvent(new PopStateEvent('popstate'))
                  }}
                  placeholder="Search by name, description..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#743181] focus:border-transparent text-base"
                />
              </div>
            </div>

            {/* Category Filters - Right Side */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Filter className="h-5 w-5 text-[#743181]" />
                <h2 className="text-lg font-semibold text-gray-900">Filter by Category</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {FILTER_CATEGORIES.map((category) => {
                  const isactive = activeFilter === category.value
                  return (
                    <Button
                      key={`filter-${category.value}`}
                      variant={isactive ? 'default' : 'outline'}
                      onClick={() => setActiveFilter(category.value)}
                      size="sm"
                      className={
                        isactive
                          ? 'bg-gradient-to-r from-[#743181] to-[#5a2a6e] text-white'
                          : 'border-gray-300 text-gray-700 hover:border-[#743181] hover:text-[#743181]'
                      }
                    >
                      {category.label}
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Search Results Banner */}
        {searchQuery && (
          <div className="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-[#743181]" />
                <p className="text-gray-900">
                  Search results for: <span className="font-semibold text-[#743181]">"{searchQuery}"</span>
                </p>
              </div>
              <button
                onClick={() => {
                  globalThis.history.pushState({}, '', '/products')
                  globalThis.dispatchEvent(new PopStateEvent('popstate'))
                }}
                className="text-sm text-gray-600 hover:text-[#743181] underline"
              >
                Clear search
              </button>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={`product-skeleton-${i+1}`} className="bg-white rounded-lg h-96 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600">No products found in this category.</p>
          </div>
        )}

        {!loading && products.length > 0 && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-gray-600">
                Showing <span className="font-semibold">{products.length}</span> products
              </p>
              {activeFilter !== 'all' && (
                <Badge variant="outline" className="text-[#743181] border-[#743181]">
                  {FILTER_CATEGORIES.find((c) => c.value === activeFilter)?.label}
                </Badge>
              )}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  description={product.description}
                  price={product.price}
                  image={product.image}
                  stock={product.stock}
                  weights={product.weights}
                  badge={product.featured ? 'Bestseller' : undefined}
                  rating={4.8}
                  reviews={Math.floor(Math.random() * 500) + 100}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
