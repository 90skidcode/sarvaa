'use client'

import { CartBadge } from '@/components/CartBadge'
import { MobileMenu } from '@/components/MobileMenu'
import { ProductCard } from '@/components/ProductCard'
import { SearchBar } from '@/components/SearchBar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Award, ChevronRight, Clock, Heart, Sparkles, Star, Truck, User } from 'lucide-react'
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
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-[#5a2a6e] to-[#743181] text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1">
                <Truck className="h-4 w-4" />
                Free Delivery on orders above ₹999
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Same Day Delivery Available
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span>📞 1800-123-4567</span>
              <span>📍 India's Premium Sweet Shop</span>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-14 h-14 rounded-full overflow-hidden shadow-lg group-hover:scale-105 transition-transform">
                <img
                  src="/images/sarvaa-logo-icon.jpg"
                  alt="Sarvaa Sweets Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#743181] tracking-tight">Sarvaa Sweets</h1>
                <p className="text-xs text-gray-500 tracking-widest uppercase">Premium Confectionery</p>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              <Link href="/" className="text-gray-700 hover:text-[#743181] font-medium transition-colors relative group">
                Home<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#743181] transition-all group-hover:w-full"></span>
              </Link>
              <Link href="/products" className="text-gray-700 hover:text-[#743181] font-medium transition-colors relative group">
                Shop Sweets<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#743181] transition-all group-hover:w-full"></span>
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-[#743181] font-medium transition-colors relative group">
                Contact<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#743181] transition-all group-hover:w-full"></span>
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <SearchBar />

              <Link href="/wishlist">
                <Button variant="ghost" size="icon" className="relative">
                  <Heart className="h-5 w-5 text-gray-600" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#743181] text-white text-xs rounded-full flex items-center justify-center">0</span>
                </Button>
              </Link>

              <CartBadge />

              <MobileMenu />

              <Link href="/login" className="hidden lg:inline-block">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5 text-gray-600" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-[#743181] rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-400 rounded-full filter blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <Badge className="bg-gradient-to-r from-[#743181] to-[#5a2a6e] text-white px-4 py-1">
                  <Sparkles className="h-3 w-3 mr-1" />
                  தமிழ்நாட்டின் #1 இனிப்பு கடை (Tamil Nadu's #1 Sweet Shop)
                </Badge>
                <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight">
                  Crafted with
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#743181] to-[#5a2a6e]">
                    Thamizh Parampara
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                  Experience the authentic taste of Tamil Nadu's traditional sweets. Every creation at Sarvaa Sweets is a masterpiece, handcrafted with pure ghee following centuries-old Tamil recipes for your most cherished moments.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/products">
                    <Button size="lg" className="bg-gradient-to-r from-[#743181] to-[#5a2a6e] hover:from-[#5a2a6e] hover:to-[#743181] px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all">
                      Order Now
                    </Button>
                  </Link>
                  <Link href="/products">
                    <Button size="lg" variant="outline" className="border-2 border-[#743181] text-[#743181] hover:bg-purple-50 px-8 py-6 text-lg">
                      Explore Catalog
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#743181] to-[#5a2a6e] rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1606858265218-4e4b7927c668?w=800&q=80"
                    alt="Authentic Tamil Nadu Sweets"
                    className="w-full object-cover transform hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex items-center gap-4 text-white">
                      <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                        <Award className="h-8 w-8 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold italic">Pure Ghee Classics</p>
                        <p className="text-sm opacity-80 uppercase tracking-widest">Handcrafted Excellence</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-20 bg-white">
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
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gray-50">
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
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
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
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#743181] to-[#5a2a6e]"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center text-white">
            <Sparkles className="h-12 w-12 mx-auto mb-6 opacity-80" />
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to Taste Authentic Mithai?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of satisfied customers who trust Sarvaa Sweets for their celebrations and special moments
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/products">
                <Button size="lg" className="bg-white text-[#743181] hover:bg-gray-100 px-8 py-6 text-lg shadow-xl">
                  Order Now
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-white rounded-lg">
                  <img src="/images/sarvaa-logo-icon.jpg" alt="Sarvaa Logo" className="w-8 h-8" />
                </div>
                <span className="text-white text-xl font-bold tracking-tight">Sarvaa Sweets</span>
              </div>
              <p className="mb-6 leading-relaxed">
                Authentic Tamil Nadu sweets made with pure ghee and centuries-old recipes. Preserving tradition, one sweet at a time.
              </p>
              <div className="flex gap-4">
                {['facebook', 'instagram', 'twitter', 'youtube'].map((social) => (
                  <Link key={social} href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#743181] transition-colors">
                    <span className="sr-only">{social}</span>
                    <div className="w-5 h-5 bg-current opacity-70"></div>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold text-lg mb-6">Quick Links</h4>
              <ul className="space-y-4">
                <li><Link href="/products" className="hover:text-white transition-colors">Our Products</Link></li>
                <li><Link href="/wishlist" className="hover:text-white transition-colors">Wishlist</Link></li>
                <li><Link href="/cart" className="hover:text-white transition-colors">My Cart</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-lg mb-6">Collections</h4>
              <ul className="space-y-4">
                 {categories.slice(0, 4).map(cat => (
                   <li key={cat.id}><Link href={`/products?category=${cat.slug}`} className="hover:text-white transition-colors">{cat.name}</Link></li>
                 ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-lg mb-6">Newsletter</h4>
              <p className="mb-4">Get sweet updates and festive offers!</p>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your Email"
                  className="bg-white/10 rounded-lg px-4 py-2 flex-1 focus:ring-2 focus:ring-[#743181] outline-none"
                />
                <Button className="bg-[#743181] hover:bg-[#5a2a6e]">Join</Button>
              </form>
            </div>
          </div>
          <div className="border-t border-white/10 mt-16 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Sarvaa Sweets. Dedicated to Tamil Traditions.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
