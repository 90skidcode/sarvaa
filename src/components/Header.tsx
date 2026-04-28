'use client'

import { CartBadge } from '@/components/CartBadge'
import { MobileMenu } from '@/components/MobileMenu'
import { SearchBar } from '@/components/SearchBar'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getCurrentUser, isAuthenticated, logout } from '@/lib/api-client'
import { ClipboardList, Heart, LogOut, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export function Header() {
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')
  const [wishlistCount, setWishlistCount] = useState(0)
  
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated()
      setIsLoggedIn(authenticated)
      if (authenticated) {
        const user = getCurrentUser()
        setUserName(user?.name || user?.email || 'User')
      }
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

    // Listen for storage changes (login/logout from other tabs)
    globalThis.addEventListener('storage', () => {
      checkAuth()
      fetchWishlistCount()
    })
    
    // Listen for custom user update event (profile changes in same tab)
    globalThis.addEventListener('userUpdated', () => {
      checkAuth()
      fetchWishlistCount()
    })

    // Listen for wishlist updates
    globalThis.addEventListener('wishlistUpdated', fetchWishlistCount)
    
    return () => {
      globalThis.removeEventListener('storage', checkAuth)
      globalThis.removeEventListener('userUpdated', checkAuth)
      globalThis.removeEventListener('wishlistUpdated', fetchWishlistCount)
    }
  }, [])
  
  // Hide header on checkout, login pages and admin pages
  if (pathname === '/checkout' || pathname === '/login' || pathname.startsWith('/admin')) {
    return null
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="hidden sm:block sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between py-2 sm:py-4 gap-2">
          <Link href="/" className="flex items-center gap-1 sm:gap-3 group flex-shrink-0">
            <div className="relative w-12 h-10 sm:w-16 sm:h-12 rounded-lg sm:rounded-xl overflow-hidden shadow-sm group-hover:scale-105 transition-transform border border-gray-100">
              <img
                src="/sarvaa-logo-full.jpg"
                alt="Sarvaa Sweets Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-2xl font-bold text-[#743181] tracking-tight">Sarvaa Sweets</h1>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-4 lg:gap-8">
            <Link href="/" className="text-gray-700 hover:text-[#743181] font-medium transition-colors relative group text-sm lg:text-base">
              Home<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#743181] transition-all group-hover:w-full"></span>
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-[#743181] font-medium transition-colors relative group text-sm lg:text-base">
              Shop Sweets<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#743181] transition-all group-hover:w-full"></span>
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-[#743181] font-medium transition-colors relative group text-sm lg:text-base">
              Contact<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#743181] transition-all group-hover:w-full"></span>
            </Link>
          </nav>

          <div className="flex items-center gap-1 sm:gap-4 ml-auto">
            <div className="hidden sm:block">
              <SearchBar />
            </div>

            <Link href="/wishlist">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5 text-gray-600" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#743181] text-white text-xs rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Button>
            </Link>

            <CartBadge />

            <MobileMenu />

            {/* User Menu - Desktop */}
            <div className="hidden lg:block">
              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 px-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#743181] to-[#5a2a6e] rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-gray-700 font-medium max-w-[100px] truncate">
                        {userName.split(' ')[0]}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                        <User className="h-4 w-4" />
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile/orders" className="flex items-center gap-2 cursor-pointer">
                        <ClipboardList className="h-4 w-4" />
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="flex items-center gap-2 text-red-600 cursor-pointer focus:text-red-600"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5 text-gray-600" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
