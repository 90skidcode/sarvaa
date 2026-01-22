'use client'

import { CustomCakeSection } from '@/components/CustomCakeSection'
import { HeroBannerSlider } from '@/components/HeroBannerSlider'
import { ProductCard } from '@/components/ProductCard'
import { Badge } from '@/components/ui/badge'
import { Award, ChevronRight, Clock, Star, Truck } from 'lucide-react'
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
          fetch('/api/categories?limit=6')
        ])

        const productsData = await productsRes.json()
        const categoriesData = await categoriesRes.json()

        // Fallback or random values for rating/reviews as they aren't in schema yet
        const enrichedProducts = (productsData.products || productsData || []).slice(0, 6).map((p: any) => ({
          ...p,
          rating: 4.5 + Math.random() * 0.5,
          reviews: Math.floor(Math.random() * 1000) + 100,
          badge: p.featured ? 'Featured' : null
        }))

        setFeaturedProducts(enrichedProducts)
        setCategories(categoriesData.categories || categoriesData || [])
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

      {/* Transition to Featured Categories: Smooth Curve */}
      <div className="w-full overflow-hidden leading-[0] bg-white -mt-1">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="relative block w-full h-[30px] md:h-[50px] fill-gray-50" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,32 C480,64 960,64 1440,32 L1440,60 L0,60 Z" />
        </svg>
      </div>

      {/* Featured Categories */}
      <section className="py-20 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-100 text-[#743181]">Special Collections</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Sweet Collections</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore the rich variety of Tamil sweets, from crispy treats to ghee-soaked delights
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {loading && Array.from({ length: 6 }).map((_, i) => (
              <div key={`category-skeleton-${i+1}`} className="animate-pulse bg-purple-50 rounded-2xl p-4 h-48"></div>
            ))}
            
            {!loading && categories.length === 0 && (
              <p className="col-span-full text-center text-gray-500 font-medium">No specialized collections found today</p>
            )}
            
            {!loading && categories.length > 0 && categories.map((category) => (
                <Link key={category.id} href={`/products?category=${category.slug}`} className="group relative block transition-all hover:-translate-y-2">
                  <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg shadow-purple-200">
                    <img
                      src={category.image || 'https://images.unsplash.com/photo-1606858265218-4e4b7927c668?w=400&q=80'}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-white font-bold text-lg leading-tight group-hover:text-purple-200 transition-colors">
                        {category.name}
                      </p>
                      <p className="text-purple-200 text-xs mt-1">
                        {category._count?.products || 0} Specialities
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            }
          </div>
        </div>

        {/* Transition to Featured Products: Scalloped Edge */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] translate-y-[1px]">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="relative block w-full h-[40px] md:h-[60px] fill-gray-50" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,0 Q60,80 120,0 Q180,80 240,0 Q300,80 360,0 Q420,80 480,0 Q540,80 600,0 Q660,80 720,0 Q780,80 840,0 Q900,80 960,0 Q1020,80 1080,0 Q1140,80 1200,0 Q1260,80 1320,0 Q1380,80 1440,0 V80 H0 Z" />
          </svg>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-gray-50 relative">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div>
              <Badge className="mb-4 bg-pink-100 text-pink-700">Daily Specials</Badge>
              <h2 className="text-4xl font-bold text-gray-900">Featured Delights</h2>
            </div>
            <Link href="/products" className="group flex items-center text-[#743181] font-bold hover:text-[#5a2a6e] transition-colors mt-4 md:mt-0">
              View All Products
              <ChevronRight className="ml-1 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading && Array.from({ length: 3 }).map((_, i) => (
              <div key={`product-skeleton-${i+1}`} className="animate-pulse bg-purple-50 rounded-2xl h-[450px]"></div>
            ))}
            
            {!loading && featuredProducts.length === 0 && (
              <p className="col-span-full text-center text-gray-500 font-medium">No featured products found</p>
            )}
            
            {!loading && featuredProducts.length > 0 && featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  description={product.description}
                  price={product.price}
                  image={product.image}
                  stock={product.stock}
                  weights={product.weights}
                  badge={product.badge}
                  rating={product.rating}
                  reviews={product.reviews}
                />
              ))
            }
          </div>
        </div>

        {/* Transition to Why Choose Us: Diagonal Tilt */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
          <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="relative block w-full h-[60px] md:h-[100px] fill-white" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,100 L1440,0 L1440,100 L0,100 Z" />
          </svg>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
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
                icon: <Truck className="h-8 w-8" />,
                title: 'Express Delivery',
                description: 'Same-day delivery across major Indian cities'
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
        
        {/* Transition to Custom Cake: Multi-Point Wave */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] translate-y-[1px]">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="relative block w-full h-[60px] md:h-[80px] fill-[#743181]/5" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,32L60,42.7C120,53,240,75,360,74.7C480,75,600,53,720,48C840,43,960,53,1080,58.7C1200,64,1320,64,1380,64L1440,64L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z" />
          </svg>
        </div>
      </section>

      {/* Custom Cake Section */}
      <CustomCakeSection />
    </div>
  )
}
