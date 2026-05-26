'use client'

import { CustomCakeSection } from '@/components/CustomCakeSection'
import { HeroBannerSlider } from '@/components/HeroBannerSlider'
import { ImageWithFallback } from '@/components/ImageWithFallback'
import { ProductCard } from '@/components/ProductCard'
import { PromoBanners } from '@/components/PromoBanners'
import { Badge } from '@/components/ui/badge'
import { Award, ChevronRight, Clock, Star } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  image: string
  images?: string | null
  stock: number
  featured: boolean
  categoryId: string
  weights?: string | null
  rating?: number
  reviews?: number
  badge?: string
}

interface Category {
  id: string
  name: string
  slug: string
  image: string | null
  _count?: {
    products: number
  }
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/products?featured=true'),
          fetch('/api/categories?activeOnly=true&limit=50')
        ])

        const productsData = await productsRes.json()
        const categoriesData = await categoriesRes.json()

        // Fallback or random values for rating/reviews as they aren't in schema yet
        const rawProducts = Array.isArray(productsData.products)
          ? productsData.products
          : Array.isArray(productsData)
          ? productsData
          : []
        const enrichedProducts = rawProducts.slice(0, 8).map((p: any) => ({
          ...p,
          rating: 4.5 + Math.random() * 0.5,
          reviews: Math.floor(Math.random() * 1000) + 100,
          badge: p.featured ? 'Featured' : null
        }))

        setFeaturedProducts(enrichedProducts)
        const rawCategories = Array.isArray(categoriesData.categories)
          ? categoriesData.categories
          : Array.isArray(categoriesData)
          ? categoriesData
          : []
        setCategories(rawCategories)
      } catch (error) {
        console.error('Error fetching home data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])


  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* Hero Banner Slider */}
      <HeroBannerSlider />

      {/* Promotional Banners */}
      <PromoBanners />

      {/* Featured Categories */}
      <section className="pb-8 sm:pb-12 bg-white relative">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-5 sm:mb-8">
            <Badge className="mb-2 bg-purple-100 text-[#743181]">Special Collections</Badge>
            <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Our Sweet Collections</h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
              Explore the rich variety of Tamil sweets, from crispy treats to ghee-soaked delights
            </p>
          </div>

          {/* Horizontal scroll row */}
          <div className="relative">
            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory">
              {loading && Array.from({ length: 8 }).map((_, i) => (
                <div key={`category-skeleton-${i+1}`} className="animate-pulse bg-purple-50 rounded-2xl flex-shrink-0 w-36 sm:w-48 md:w-[210px] h-36 sm:h-48 md:h-[210px]" />
              ))}

              {!loading && categories.length === 0 && (
                <p className="text-gray-500 font-medium">No collections found</p>
              )}

              {!loading && categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  className="group relative flex-shrink-0 w-36 sm:w-48 md:w-[210px] snap-start"
                >
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-md shadow-purple-100">
                    <ImageWithFallback
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      fallbackClassName="w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-white font-semibold text-xs sm:text-sm leading-tight group-hover:text-purple-200 transition-colors line-clamp-2">
                        {category.name}
                      </p>
                      <p className="text-purple-300 text-[10px] sm:text-xs mt-0.5">
                        {category._count?.products || 0} items
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Transition to Featured Products */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] translate-y-[1px]">
          <svg viewBox="0 0 1440 40" preserveAspectRatio="none" className="relative block w-full h-[12px] sm:h-[20px] fill-gray-50" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,0 Q60,40 120,0 Q180,40 240,0 Q300,40 360,0 Q420,40 480,0 Q540,40 600,0 Q660,40 720,0 Q780,40 840,0 Q900,40 960,0 Q1020,40 1080,0 Q1140,40 1200,0 Q1260,40 1320,0 Q1380,40 1440,0 V40 H0 Z" />
          </svg>
        </div>
      </section>

      {/* Featured Products */}
      <section className="pb-8 sm:pb-14 bg-gray-50 relative">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-5 sm:mb-8">
            <div>
              <Badge className="mb-4 bg-pink-100 text-pink-700">Daily Specials</Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Featured Delights</h2>
            </div>
            <Link href="/products" className="group flex items-center text-[#743181] font-bold hover:text-[#5a2a6e] transition-colors mt-4 md:mt-0 text-sm sm:text-base">
              View All Products
              <ChevronRight className="ml-1 h-4 w-4 sm:h-5 sm:w-5 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {loading && Array.from({ length: 4 }).map((_, i) => (
              <div key={`product-skeleton-${i+1}`} className="animate-pulse bg-purple-50 rounded-2xl h-64 sm:h-[450px]"></div>
            ))}
            
            {!loading && featuredProducts.length === 0 && (
              <p className="col-span-full text-center text-gray-500 font-medium">No featured products found</p>
            )}
            
            {!loading && featuredProducts.length > 0 && featuredProducts.map((product) => {
              // Parse additional images
              let additionalImages: string[] = []
              if (product.images) {
                try {
                  additionalImages = JSON.parse(product.images)
                } catch (e) {
                  // Ignore parsing errors
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
                  badge={product.badge}
                  rating={product.rating}
                  reviews={product.reviews}
                />
              )
            })}
          </div>
        </div>

        {/* Transition to Why Choose Us */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
          <svg viewBox="0 0 1440 40" preserveAspectRatio="none" className="relative block w-full h-[16px] sm:h-[28px] fill-white" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,40 L1440,0 L1440,40 L0,40 Z" />
          </svg>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-8 sm:py-14 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-purple-100 text-[#743181]">Our Promise</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Sarvaa Sweets?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're committed to delivering excellence in every bite, every time
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Award className="h-8 w-8" />,
                title: 'Premium Quality',
                description: 'Only the finest desi ghee and pure ingredients for authentic taste'
              },
              {
                icon: <Clock className="h-8 w-8" />,
                title: 'Fresh & Handcrafted',
                description: 'Every sweet is made fresh daily following traditional recipes'
              },
              {
                icon: <Award className="h-8 w-8" />,
                title: 'Store Pickup',
                description: 'Quick pickup from our store locations across Tamil Nadu'
              },
              {
                icon: <Star className="h-8 w-8" />,
                title: '5-Star Rated',
                description: 'Trusted by over 50,000 happy customers across India'
              }
            ].map((feature, index) => (
              <div key={index} className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-gradient-to-br from-[#743181] to-[#5a2a6e] rounded-2xl flex items-center justify-center mx-auto mb-6 text-white">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Transition to Custom Cake */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] translate-y-[1px]">
          <svg viewBox="0 0 1440 40" preserveAspectRatio="none" className="relative block w-full h-[16px] sm:h-[24px] fill-[#743181]/5" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,20L60,24C120,28,240,36,360,36C480,36,600,28,720,24C840,20,960,24,1080,28C1200,32,1320,32,1380,32L1440,32L1440,40L0,40Z" />
          </svg>
        </div>
      </section>

      {/* Custom Cake Section */}
      <CustomCakeSection />
    </div>
  )
}
