'use client'

import { ProductCard } from '@/components/ProductCard'
import { ProductFilters } from '@/components/ProductFilters'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronRight, LayoutGrid, List, Search, SlidersHorizontal, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

interface Category {
  id: string
  name: string
  slug: string
  image?: string | null
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
  category: { id: string; name: string; slug: string }
}

export function ProductsContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const categoryParam = searchParams.get('category') || 'all'
  const searchQuery = searchParams.get('search') || ''
  const minPriceParam = Number(searchParams.get('minPrice')) || 0
  const maxPriceParam = Number(searchParams.get('maxPrice')) || 5000
  const sortByParam = searchParams.get('sortBy') || 'newest'

  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [categoryPage, setCategoryPage] = useState(1)
  const [categoryTotalPages, setCategoryTotalPages] = useState(1)
  const [loadingMoreCategories, setLoadingMoreCategories] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const chipsRef = useRef<HTMLDivElement>(null)

  const fetchCategoriesPage = useCallback(async (p: number) => {
    try {
      p === 1 ? setLoadingMoreCategories(false) : setLoadingMoreCategories(true)
      const res = await fetch(`/api/categories?activeOnly=true&page=${p}&limit=20`)
      const data = await res.json()
      if (data.categories) {
        setCategories((prev) => (p === 1 ? data.categories : [...prev, ...data.categories]))
        setCategoryPage(p)
        setCategoryTotalPages(data.pagination?.totalPages || 1)
      }
    } catch (e) {
      console.error('Error fetching categories:', e)
    } finally {
      setLoadingMoreCategories(false)
    }
  }, [])

  useEffect(() => {
    fetchCategoriesPage(1)
  }, [fetchCategoriesPage])

  const fetchProducts = useCallback(
    async (pageNum: number, replace: boolean) => {
      try {
        replace ? setLoading(true) : setLoadingMore(true)
        const params = new URLSearchParams()
        if (categoryParam !== 'all') params.set('category', categoryParam)
        if (searchQuery) params.set('search', searchQuery)
        if (minPriceParam > 0) params.set('minPrice', minPriceParam.toString())
        if (maxPriceParam < 5000) params.set('maxPrice', maxPriceParam.toString())
        params.set('sortBy', sortByParam)
        params.set('page', pageNum.toString())
        params.set('limit', '12')

        const res = await fetch(`/api/products?${params}`)
        const data = await res.json()
        const incoming = Array.isArray(data.products) ? data.products : []
        setProducts((prev) => (replace ? incoming : [...prev, ...incoming]))
        setTotalPages(data.pagination?.totalPages || 1)
        setTotalCount(data.pagination?.total || incoming.length)
      } catch (e) {
        console.error('Error fetching products:', e)
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [categoryParam, searchQuery, minPriceParam, maxPriceParam, sortByParam],
  )

  useEffect(() => {
    setPage(1)
    fetchProducts(1, true)
  }, [fetchProducts])

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (
        value === null ||
        value === 'all' ||
        (key === 'minPrice' && value === '0') ||
        (key === 'maxPrice' && value === '5000')
      ) {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })
    router.push(`${pathname}?${params.toString()}`)
  }

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    fetchProducts(next, false)
  }

  const hasActiveFilters =
    categoryParam !== 'all' || minPriceParam > 0 || maxPriceParam < 5000 || searchQuery

  const activeCategory = categories.find((c) => c.slug === categoryParam)
  const pageTitle = searchQuery
    ? `Results for "${searchQuery}"`
    : categoryParam !== 'all' && activeCategory
    ? activeCategory.name
    : 'All Sweets'

  return (
    <div className="min-h-screen bg-white">
      {/* Page header */}
      <div className="bg-gradient-to-b from-purple-50/60 to-white border-b border-gray-100/80 pt-6 pb-5">
        <div className="container mx-auto px-4 sm:px-6 max-w-[1400px]">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-3" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[#743181] transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/products" className="hover:text-[#743181] transition-colors">Shop Sweets</Link>
            {categoryParam !== 'all' && activeCategory && (
              <>
                <ChevronRight className="h-3 w-3" />
                <span className="text-gray-900 font-medium">{activeCategory.name}</span>
              </>
            )}
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                {pageTitle}
              </h1>
              {!loading && (
                <p className="text-sm text-gray-500 mt-1">
                  {totalCount} {totalCount === 1 ? 'product' : 'products'} found
                </p>
              )}
            </div>

            {/* Sort + view — desktop */}
            <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center bg-white rounded-xl p-1 border border-gray-200 gap-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#743181] text-white shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#743181] text-white shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
              <Select value={sortByParam} onValueChange={(v) => updateParams({ sortBy: v })}>
                <SelectTrigger className="w-[170px] bg-white border-gray-200 rounded-xl h-10 text-sm shadow-none focus:ring-[#743181]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="popularity">Popularity</SelectItem>
                  <SelectItem value="price_asc">Price: Low → High</SelectItem>
                  <SelectItem value="price_desc">Price: High → Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile category chips */}
      <div className="lg:hidden border-b border-gray-100 bg-white">
        <div
          ref={chipsRef}
          className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide"
        >
          <button
            onClick={() => updateParams({ category: 'all' })}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-all flex-shrink-0 ${
              categoryParam === 'all'
                ? 'bg-[#743181] text-white border-[#743181] shadow-sm'
                : 'bg-white text-gray-700 border-gray-200 hover:border-[#743181]/50'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => updateParams({ category: cat.slug })}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-all flex-shrink-0 ${
                categoryParam === cat.slug
                  ? 'bg-[#743181] text-white border-[#743181] shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-[#743181]/50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="container mx-auto px-4 sm:px-6 max-w-[1400px] py-6 sm:py-8">
        <div className="flex gap-6 lg:gap-8">

          {/* Sidebar — desktop */}
          <aside className="hidden lg:block w-64 xl:w-72 shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)] overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 text-base">Filters</h2>
                {hasActiveFilters && (
                  <button
                    onClick={() => router.push(pathname)}
                    className="text-xs font-medium text-[#743181] hover:underline"
                  >
                    Reset all
                  </button>
                )}
              </div>
              <div className="p-5">
                <ProductFilters
                  categories={categories}
                  activeCategory={categoryParam}
                  onCategoryChange={(slug) => updateParams({ category: slug })}
                  priceRange={[minPriceParam, maxPriceParam]}
                  onPriceChange={(range) =>
                    updateParams({ minPrice: range[0].toString(), maxPrice: range[1].toString() })
                  }
                  minMaxPrice={[0, 5000]}
                  canLoadMoreCategories={categoryPage < categoryTotalPages}
                  onLoadMoreCategories={() => fetchCategoriesPage(categoryPage + 1)}
                  loadingMoreCategories={loadingMoreCategories}
                />
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">

            {/* Mobile toolbar */}
            <div className="flex sm:hidden items-center justify-between mb-4 gap-2">
              <Select value={sortByParam} onValueChange={(v) => updateParams({ sortBy: v })}>
                <SelectTrigger className="flex-1 bg-white border-gray-200 rounded-xl h-9 text-sm">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="popularity">Popular</SelectItem>
                  <SelectItem value="price_asc">Price ↑</SelectItem>
                  <SelectItem value="price_desc">Price ↓</SelectItem>
                </SelectContent>
              </Select>
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="flex items-center gap-1.5 px-4 h-9 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:border-[#743181]/50 transition-all flex-shrink-0"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-1 w-5 h-5 bg-[#743181] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {[categoryParam !== 'all', minPriceParam > 0 || maxPriceParam < 5000, !!searchQuery].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>

            {/* Active filter chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-5">
                {categoryParam !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-[#743181] border border-purple-100 text-xs font-medium">
                    {activeCategory?.name || categoryParam}
                    <button onClick={() => updateParams({ category: 'all' })} className="hover:text-red-500 transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {(minPriceParam > 0 || maxPriceParam < 5000) && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-xs font-medium">
                    ₹{minPriceParam} – ₹{maxPriceParam}
                    <button onClick={() => updateParams({ minPrice: null, maxPrice: null })} className="hover:text-red-500 transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-xs font-medium">
                    "{searchQuery}"
                    <button onClick={() => updateParams({ search: null })} className="hover:text-red-500 transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={() => router.push(pathname)}
                  className="text-xs font-medium text-gray-500 hover:text-red-500 transition-colors underline underline-offset-2"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Products */}
            {loading ? (
              <div className={viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5'
                : 'flex flex-col gap-4'
              }>
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
                    <div className="h-52 bg-gray-100" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-100 rounded-full w-3/4" />
                      <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                      <div className="h-9 bg-gray-100 rounded-xl mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 rounded-2xl bg-purple-50 flex items-center justify-center mb-5">
                  <Search className="h-9 w-9 text-[#743181]/40" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No sweets found</h3>
                <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                  Try adjusting your filters or search terms to find something delicious.
                </p>
                <Button
                  onClick={() => router.push(pathname)}
                  className="mt-6 rounded-full bg-[#743181] hover:bg-[#5a2a6e] px-6"
                >
                  Reset filters
                </Button>
              </div>
            ) : (
              <>
                <div className={viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5'
                  : 'flex flex-col gap-4'
                }>
                  {products.map((product) => {
                    let additionalImages: string[] = []
                    if (product.images) {
                      try { additionalImages = JSON.parse(product.images) } catch { /* ignore */ }
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

                {/* Load more */}
                {page < totalPages && (
                  <div className="flex justify-center mt-10">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="px-8 py-3 rounded-full border-2 border-[#743181] text-[#743181] text-sm font-semibold hover:bg-[#743181] hover:text-white transition-all disabled:opacity-50"
                    >
                      {loadingMore ? 'Loading…' : `Load more (${totalCount - products.length} remaining)`}
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile filter bottom sheet */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="font-bold text-gray-900 text-lg">Filters</h2>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-5">
              <ProductFilters
                categories={categories}
                activeCategory={categoryParam}
                onCategoryChange={(slug) => {
                  updateParams({ category: slug })
                  setMobileFilterOpen(false)
                }}
                priceRange={[minPriceParam, maxPriceParam]}
                onPriceChange={(range) => {
                  updateParams({ minPrice: range[0].toString(), maxPrice: range[1].toString() })
                }}
                minMaxPrice={[0, 5000]}
                canLoadMoreCategories={categoryPage < categoryTotalPages}
                onLoadMoreCategories={() => fetchCategoriesPage(categoryPage + 1)}
                loadingMoreCategories={loadingMoreCategories}
              />
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
              <button
                onClick={() => { router.push(pathname); setMobileFilterOpen(false) }}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-3 rounded-xl bg-[#743181] text-white text-sm font-semibold hover:bg-[#5a2a6e] transition-all shadow-md"
              >
                Show {totalCount} results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
