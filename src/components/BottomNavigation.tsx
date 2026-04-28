'use client'

import { CartBadge } from '@/components/CartBadge'
import { Button } from '@/components/ui/button'
import { getCurrentUser, isAuthenticated } from '@/lib/api-client'
import { Heart, Home, Menu, ShoppingBag, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export function BottomNavigation() {
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [wishlistCount, setWishlistCount] = useState(0)

  // Hide on pages where bottom nav shouldn't appear
  if (pathname === '/checkout' || pathname === '/login' || pathname.startsWith('/admin')) {
    return null
  }

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(isAuthenticated())
    }
    const fetchWishlistCount = async () => {
      const user = getCurrentUser()
      if (user?.id) {
        try {
          const res = await fetch(`/api/wishlist?userId=${user.id}`)
          const data = await res.json()
          setWishlistCount(data.wishlist?.length || 0)
        } catch (error) {
          console.error('Error fetching wishlist count:', error)
        }
      }
    }

    checkAuth()
    if (isAuthenticated()) fetchWishlistCount()

    globalThis.addEventListener('storage', () => {
      checkAuth()
      fetchWishlistCount()
    })
    globalThis.addEventListener('userUpdated', () => {
      checkAuth()
      fetchWishlistCount()
    })
    globalThis.addEventListener('wishlistUpdated', fetchWishlistCount)

    return () => {
      globalThis.removeEventListener('storage', checkAuth)
      globalThis.removeEventListener('userUpdated', checkAuth)
      globalThis.removeEventListener('wishlistUpdated', fetchWishlistCount)
    }
  }, [])

  const isActive = (path: string) => {
    return pathname === path ? 'text-[#743181]' : 'text-gray-600'
  }

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {/* Home */}
        <Link href="/" className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg transition-all ${isActive('/') ? 'bg-purple-50' : ''}`}>
          <Home className={`h-6 w-6 ${isActive('/')}`} />
          <span className="text-[10px] mt-0.5">Home</span>
        </Link>

        {/* Shop */}
        <Link href="/products" className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg transition-all ${isActive('/products') ? 'bg-purple-50' : ''}`}>
          <ShoppingBag className={`h-6 w-6 ${isActive('/products')}`} />
          <span className="text-[10px] mt-0.5">Shop</span>
        </Link>

        {/* Wishlist */}
        <Link href="/wishlist" className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg relative transition-all ${isActive('/wishlist') ? 'bg-purple-50' : ''}`}>
          <Heart className={`h-6 w-6 ${isActive('/wishlist')}`} />
          {wishlistCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#743181] text-white text-[10px] rounded-full flex items-center justify-center">
              {wishlistCount}
            </span>
          )}
          <span className="text-[10px] mt-0.5">Wishlist</span>
        </Link>

        {/* Profile / Login */}
        <Link href={isLoggedIn ? '/profile' : '/login'} className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg transition-all ${isActive('/profile') ? 'bg-purple-50' : ''}`}>
          <User className={`h-6 w-6 ${isActive('/profile')}`} />
          <span className="text-[10px] mt-0.5">{isLoggedIn ? 'Profile' : 'Login'}</span>
        </Link>

        {/* Menu */}
        <Link href="/contact" className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg transition-all ${isActive('/contact') ? 'bg-purple-50' : ''}`}>
          <Menu className={`h-6 w-6 ${isActive('/contact')}`} />
          <span className="text-[10px] mt-0.5">More</span>
        </Link>
      </div>
    </nav>
  )
}
