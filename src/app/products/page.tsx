'use client'

import { ProductCard } from '@/components/ProductCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Filter } from 'lucide-react'
import Link from 'next/link'
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
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    fetchProducts()
  }, [activeFilter])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const url = activeFilter === 'all' 
        ? '/api/products'
        : `/api/products?category=${activeFilter}`
      
      const response = await fetch(url)
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-[#743181] hover:text-[#5a2a6e] font-medium mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Tamil Sweets Collection</h1>
          <p className="text-lg text-gray-600">
            Discover our authentic Tamil Nadu sweets, handcrafted with pure ghee and traditional recipes
          </p>
        </div>

        {/* Category Filters */}
        <div className="mb-8 bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filter by Category</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {FILTER_CATEGORIES.map((category) => (
              <Button
                key={category.value}
                variant={activeFilter === category.value ? 'default' : 'outline'}
                onClick={() => setActiveFilter(category.value)}
                className={
                  activeFilter === category.value
                    ? 'bg-gradient-to-r from-[#743181] to-[#5a2a6e] text-white'
                    : 'border-gray-300 text-gray-700 hover:border-[#743181] hover:text-[#743181]'
                }
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg h-96 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600">No products found in this category.</p>
          </div>
        ) : (
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
