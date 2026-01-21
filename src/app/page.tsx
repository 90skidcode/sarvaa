'use client'

import { CartBadge } from '@/components/CartBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Award, Cake, ChevronRight, Clock, Heart, Search, Sparkles, Star, Truck, User } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const featuredProducts = [
    {
      id: 1,
      name: 'Mysore Pak Premium',
      description: 'Ghee-rich Mysore Pak with gram flour - melts in mouth',
      price: 649,
      originalPrice: 799,
      image: 'https://images.unsplash.com/photo-1606858265218-4e4b7927c668?w=500&q=80',
      rating: 4.9,
      reviews: 856,
      badge: 'Bestseller'
    },
    {
      id: 2,
      name: 'Tirunelveli Halwa',
      description: 'Authentic wheat halwa with pure ghee & dry fruits',
      price: 799,
      originalPrice: 949,
      image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&q=80',
      rating: 4.8,
      reviews: 689,
      badge: 'Temple Special'
    },
    {
      id: 3,
      name: 'Adhirasam',
      description: 'Traditional jaggery sweet perfect for Pongal',
      price: 449,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1571696905784-f0a4e4e9b39a?w=500&q=80',
      rating: 4.9,
      reviews: 742,
      badge: 'Pongal Hit'
    },
    {
      id: 4,
      name: 'Palgova (Srivilliputhur)',
      description: 'Soft milk peda from the temple town',
      price: 599,
      originalPrice: 699,
      image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=500&q=80',
      rating: 5.0,
      reviews: 978,
      badge: 'Premium'
    },
    {
      id: 5,
      name: 'Kovilpatti Kadalai Mittai',
      description: 'Famous peanut candy with jaggery coating',
      price: 349,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500&q=80',
      rating: 4.7,
      reviews: 567,
      badge: 'Chettinad'
    },
    {
      id: 6,
      name: 'Jangiri (Tamil Style)',
      slug: 'jangiri-jilebi',
      description: 'Crispy sweet jangiri soaked in sugar syrup',
      price: 499,
      originalPrice: 599,
      image: 'https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=500&q=80',
      rating: 4.6,
      reviews: 423,
      badge: 'Fresh Daily'
    }
  ]

  const categories = [
    { name: 'TN Traditional Sweets', image: 'https://images.unsplash.com/photo-1606858265218-4e4b7927c668?w=400&q=80', count: 45 },
    { name: 'Temple Prasadam', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80', count: 32 },
    { name: 'Chettinad Specials', image: 'https://images.unsplash.com/photo-1571696905784-f0a4e4e9b39a?w=400&q=80', count: 38 },
    { name: 'Festival Sweets', image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400&q=80', count: 24 },
    { name: 'Gift Boxes', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&q=80', count: 28 },
    { name: 'Pongal Special', image: 'https://images.unsplash.com/photo-1606858265279-aa9271e08fd4?w=400&q=80', count: 19 }
  ]

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
              <div className="w-14 h-14 bg-gradient-to-br from-[#743181] to-[#5a2a6e] rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Cake className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#743181] tracking-tight">Sarvaa Sweets</h1>
                <p className="text-xs text-gray-500 tracking-widest uppercase">Premium Confectionery</p>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              <Link href="/" className="text-gray-700 hover:text-[#743181] font-medium transition-colors relative group">
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#743181] transition-all group-hover:w-full"></span>
              </Link>
              <Link href="/products" className="text-gray-700 hover:text-[#743181] font-medium transition-colors relative group">
                Shop Sweets
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#743181] transition-all group-hover:w-full"></span>
              </Link>
              <Link href="/products?category=traditional-tn" className="text-gray-700 hover:text-[#743181] font-medium transition-colors relative group">
                TN Traditional
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#743181] transition-all group-hover:w-full"></span>
              </Link>
              <Link href="/products?category=temple-prasadam" className="text-gray-700 hover:text-[#743181] font-medium transition-colors relative group">
                Temple Prasadam
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#743181] transition-all group-hover:w-full"></span>
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-[#743181] font-medium transition-colors relative group">
                Contact
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#743181] transition-all group-hover:w-full"></span>
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for sweets..."
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-full w-64 focus:outline-none focus:ring-2 focus:ring-[#743181] text-sm"
                  />
                </div>
              </div>

              <Link href="/wishlist">
                <Button variant="ghost" size="icon" className="relative">
                  <Heart className="h-5 w-5 text-gray-600" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#743181] text-white text-xs rounded-full flex items-center justify-center">0</span>
                </Button>
              </Link>

              <CartBadge />

              <Link href="/login">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5 text-gray-600" />
                </Button>
              </Link>

              <Link href="/admin">
                <Button className="bg-gradient-to-r from-[#743181] to-[#5a2a6e] hover:from-[#5a2a6e] hover:to-[#743181]">
                  Admin
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
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button size="lg" variant="outline" className="border-2 border-[#743181] text-[#743181] hover:bg-[#743181] hover:text-white px-8 py-6 text-lg">
                      Our Story
                    </Button>
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap gap-8 pt-8 border-t">
                  <div className="flex items-center gap-2">
                    <Award className="h-6 w-6 text-[#743181]" />
                    <div>
                      <p className="font-semibold text-gray-900">50,000+</p>
                      <p className="text-sm text-gray-500">Happy Customers</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                    <div>
                      <p className="font-semibold text-gray-900">4.9/5</p>
                      <p className="text-sm text-gray-500">Customer Rating</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-6 w-6 text-[#743181]" />
                    <div>
                      <p className="font-semibold text-gray-900">Same Day</p>
                      <p className="text-sm text-gray-500">Delivery</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="relative z-10">
                  <img
                    src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80"
                    alt="Premium Cake"
                    className="w-full h-[600px] object-cover rounded-3xl shadow-2xl"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 z-20 bg-white rounded-2xl shadow-xl p-6 max-w-xs">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#743181] to-[#5a2a6e] rounded-full flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Premium Quality</p>
                      <p className="text-sm text-gray-500">100% Pure Ingredients</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-purple-100 text-[#743181]">Our Collections</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Explore by Category</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our curated collections of authentic Tamil Nadu sweets for every celebration and occasion
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                href="/products"
                className="group relative overflow-hidden rounded-2xl aspect-square shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold text-lg mb-1">{category.name}</h3>
                  <p className="text-white/80 text-sm">{category.count} items</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <div>
              <Badge className="mb-4 bg-[#743181] text-white">Bestsellers</Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">Our Signature Tamil Sweets</h2>
              <p className="text-lg text-gray-600">Handpicked favorites loved by thousands across Tamil Nadu</p>
            </div>
            <Link href="/products">
              <Button size="lg" variant="outline" className="border-2 border-[#743181] text-[#743181] hover:bg-[#743181] hover:text-white">
                View All Products
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
                <div className="relative aspect-square overflow-hidden">
                  {product.badge && (
                    <Badge className="absolute top-4 left-4 z-10 bg-gradient-to-r from-[#743181] to-[#5a2a6e] text-white">
                      {product.badge}
                    </Badge>
                  )}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <Button className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-[#743181] hover:bg-[#743181] hover:text-white">
                      Quick View
                    </Button>
                  </div>
                  <Link href="/wishlist" className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="secondary" className="bg-white hover:bg-white/90">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#743181] transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-600">{product.rating}</span>
                    <span className="text-sm text-gray-400">({product.reviews})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-[#743181]">₹{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-lg text-gray-400 line-through">₹{product.originalPrice}</span>
                      )}
                    </div>
                    <Button size="sm" className="bg-gradient-to-r from-[#743181] to-[#5a2a6e] hover:from-[#5a2a6e] hover:to-[#743181]">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
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
      <footer className="bg-gray-900 text-white py-16 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[#743181] to-[#5a2a6e] rounded-full flex items-center justify-center">
                  <Cake className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Sarvaa Sweets</h3>
                  <p className="text-xs text-gray-400 tracking-widest uppercase">Premium Confectionery</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6">
                Tamil Nadu's premier destination for premium traditional sweets and handcrafted Tamil mithai. Creating memories one sweet at a time.
              </p>
              <div className="flex gap-3">
                {['Facebook', 'Instagram', 'Twitter', 'YouTube'].map((social) => (
                  <div key={social} className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#743181] transition-colors cursor-pointer">
                    <span className="text-xs font-semibold">{social[0]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-6">Quick Links</h3>
              <ul className="space-y-3">
                {['Home', 'Shop Sweets', 'TN Traditional', 'Temple Prasadam', 'About Us', 'Contact'].map((link) => (
                  <li key={link}>
                    <Link href={link === 'Home' ? '/' : `/${link.toLowerCase().replace(' ', '-')}`} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-6">Customer Service</h3>
              <ul className="space-y-3">
                {['My Orders', 'Track Order', 'Wishlist', 'Returns Policy', 'FAQ', 'Size Guide'].map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-6">Contact Info</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#743181] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm">📍</span>
                  </div>
                  <div>
                    <p className="text-gray-400">123, T. Nagar Main Road, Chennai 600017</p>
                    <p className="text-gray-400">Tamil Nadu, India</p>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#743181] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">📞</span>
                  </div>
                  <p className="text-gray-400">1800-123-4567</p>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#743181] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">✉️</span>
                  </div>
                  <p className="text-gray-400">hello@sarvaasweets.com</p>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-center md:text-left">
                © 2024 Sarvaa Sweets. All rights reserved. Crafted with ❤️ in India
              </p>
              <div className="flex items-center gap-4">
                <img src="https://img.icons8.com/color/48/google-pay-india.png" alt="GPay" className="h-8" />
                <img src="https://img.icons8.com/color/48/paytm.png" alt="Paytm" className="h-8" />
                <img src="https://img.icons8.com/color/48/phonepe.png" alt="PhonePe" className="h-8" />
                <div className="text-white bg-gradient-to-r from-green-600 to-green-700 px-3 py-1 rounded text-sm font-bold">UPI</div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
