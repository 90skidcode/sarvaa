'use client'

import { CartBadge } from '@/components/CartBadge'
import { MobileMenu } from '@/components/MobileMenu'
import { SearchBar } from '@/components/SearchBar'
import { Button } from '@/components/ui/button'
import { Heart, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Header() {
  const pathname = usePathname()
  
  // Hide header on checkout page and admin pages
  if (pathname === '/checkout' || pathname.startsWith('/admin')) {
    return null
  }

  return (
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
  )
}
