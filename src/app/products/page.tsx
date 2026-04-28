'use client'

import { ProductCard } from '@/components/ProductCard'
import { ProductFilters } from '@/components/ProductFilters'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LayoutGrid, List, Search, SlidersHorizontal } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useState } from 'react'

interface Category {
  id: string
  name: string
  slug: string
}

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  image: string
  images?: string | null
  stock: number
  weights?: string | null
  featured: boolean
  category: {
    id: string
    name: string
    slug: string
  }
}

function ProductsContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // URL Params
  const categoryParam = searchParams.get('category') || 'all'
  const searchQuery = searchParams.get('search') || ''
  const minPriceParam = Number(searchParams.get('minPrice')) || 0
  const maxPriceParam = Number(searchParams.get('maxPrice')) || 5000
  const sortByParam = searchParams.get('sortBy') || 'newest'
  
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [categoryPage, setCategoryPage] = useState(1)
  const [categoryTotalPages, setCategoryTotalPages] = useState(1)
  const [loadingMoreCategories, setLoadingMoreCategories] = useState(false)

  // Fetch categories with pagination
  const fetchCategoriesPage = useCallback(async (page: number) => {
    try {
      if (page === 1) setLoadingMoreCategories(false)
      else setLoadingMoreCategories(true)

      const response = await fetch(`/api/categories?activeOnly=true&page=${page}&limit=10`)
      const data = await response.json()

      if (data.categories) {
        if (page === 1) {
          setCategories(data.categories)
        } else {
          setCategories(prev => [...prev, ...data.categories])
        }
        setCategoryPage(page)
        setCategoryTotalPages(data.pagination?.totalPages || 1)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoadingMoreCategories(false)
    }
  }, [])

  // Fetch categories on mount
  useEffect(() => {
    fetchCategoriesPage(1)
  }, [fetchCategoriesPage])

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (categoryParam !== 'all') params.set('category', categoryParam)
      if (searchQuery) params.set('search', searchQuery)
      if (minPriceParam > 0) params.set('minPrice', minPriceParam.toString())
      if (maxPriceParam < 5000) params.set('maxPrice', maxPriceParam.toString())
      params.set('sortBy', sortByParam)
      
      const response = await fetch(`/api/products?${params.toString()}`)
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }, [categoryParam, searchQuery, minPriceParam, maxPriceParam, sortByParam])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === 'all' || (key === 'minPrice' && value === '0') || (key === 'maxPrice' && value === '5000')) {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-4 sm:py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
          <Link href="/" className="hover:text-[#743181] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Products</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-[280px] shrink-0">
            <div className="sticky top-24 bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <ProductFilters
                categories={categories}
                activeCategory={categoryParam}
                onCategoryChange={(slug) => updateParams({ category: slug })}
                priceRange={[minPriceParam, maxPriceParam]}
                onPriceChange={(range) => updateParams({ minPrice: range[0].toString(), maxPrice: range[1].toString() })}
                minMaxPrice={[0, 5000]}
                canLoadMoreCategories={categoryPage < categoryTotalPages}
                onLoadMoreCategories={() => fetchCategoriesPage(categoryPage + 1)}
                loadingMoreCategories={loadingMoreCategories}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Header / Active Filters */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                    {products.length} result{products.length !== 1 ? 's' : ''} for {categoryParam === 'all' ? 'All Sweets' : categoryParam}
                  </h1>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                  {/* View Switcher */}
                  <div className="hidden sm:flex items-center bg-white rounded-lg p-1 border border-gray-100 shadow-sm">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setViewMode('grid')}
                      className={`h-8 w-8 rounded-md ${viewMode === 'grid' ? 'bg-gray-100 text-[#743181]' : 'text-gray-400'}`}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setViewMode('list')}
                      className={`h-8 w-8 rounded-md ${viewMode === 'list' ? 'bg-gray-100 text-[#743181]' : 'text-gray-400'}`}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Sort Dropdown */}
                  <div className="flex-1 sm:flex-none flex items-center gap-2">
                    <span className="hidden sm:inline text-sm text-gray-500">Sort by:</span>
                    <Select value={sortByParam} onValueChange={(val) => updateParams({ sortBy: val })}>
                      <SelectTrigger className="w-full sm:w-[160px] bg-white border-gray-100 shadow-sm focus:ring-[#743181]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="popularity">Popularity</SelectItem>
                        <SelectItem value="price_asc">Price: Low to High</SelectItem>
                        <SelectItem value="price_desc">Price: High to Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Mobile Filters Toggle */}
                  <Button variant="outline" className="lg:hidden h-10 border-gray-100 shadow-sm gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </Button>
                </div>
              </div>

              {/* Active Filter Badges */}
              {(categoryParam !== 'all' || minPriceParam > 0 || maxPriceParam < 5000 || searchQuery) && (
                <div className="flex flex-wrap gap-2 items-center mb-6">
                  <span className="text-sm font-medium text-gray-500 mr-2">Active filters:</span>
                  {categoryParam !== 'all' && (
                    <Badge variant="secondary" className="bg-purple-50 text-[#743181] border-purple-100 hover:bg-purple-100 px-3 py-1 gap-1">
                      Category: {categories.find(c => c.slug === categoryParam)?.name}
                      <button onClick={() => updateParams({ category: 'all' })} className="ml-1 hover:text-red-500">×</button>
                    </Badge>
                  )}
                  {(minPriceParam > 0 || maxPriceParam < 5000) && (
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100 px-3 py-1 gap-1">
                      Price: ₹{minPriceParam} - ₹{maxPriceParam}
                      <button onClick={() => updateParams({ minPrice: null, maxPrice: null })} className="ml-1 hover:text-red-500">×</button>
                    </Badge>
                  )}
                  {searchQuery && (
                    <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-100 hover:bg-orange-100 px-3 py-1 gap-1">
                      Search: "{searchQuery}"
                      <button onClick={() => updateParams({ search: null })} className="ml-1 hover:text-red-500">×</button>
                    </Badge>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => router.push(pathname)}
                    className="text-gray-500 hover:text-red-500 h-8 px-2 text-xs font-semibold uppercase tracking-wider"
                  >
                    Clear All
                  </Button>
                </div>
              )}
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={`product-skeleton-${i+1}`} className="bg-white rounded-2xl h-[420px] animate-pulse shadow-sm border border-gray-50" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No products found</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  Try adjusting your filters or search criteria to find what you're looking for.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => router.push(pathname)}
                  className="mt-6 border-gray-200"
                >
                  Reset all filters
                </Button>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8" 
                : "flex flex-col gap-6"
              }>
                {products.map((product) => {
                  let additionalImages: string[] = []
                  if (product.images) {
                    try {
                      additionalImages = JSON.parse(product.images)
                    } catch (e) {
                      console.error('Error parsing product images:', e)
                    }
                  }

                  return (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      slug={product.slug}
                      name={product.name}
                      description={product.description}
                      price={product.price}
                      image={product.image}
                      images={additionalImages}
                      stock={product.stock}
                      weights={product.weights}
                      badge={product.featured ? 'New Arrival' : undefined}
                      rating={4.8}
                      reviews={Math.floor(Math.random() * 500) + 100}
                      viewMode={viewMode}
                    />
                  )
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#743181]"></div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  )
}
