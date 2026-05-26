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
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(globalThis.scrollY > 8)
    onScroll()
    globalThis.addEventListener('scroll', onScroll, { passive: true })
    return () => globalThis.removeEventListener('scroll', onScroll)
  }, [])

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

  const navLinkClass =
    'px-3 lg:px-4 py-1.5 rounded-full text-sm lg:text-[15px] font-medium text-gray-700 hover:text-[#743181] hover:bg-[#743181]/8 transition-colors'

  return (
    <header className="hidden sm:block sticky top-0 z-50 px-3 sm:px-6 pb-2">
      <div
        className={`mx-auto max-w-7xl rounded-2xl border border-white/50 bg-white/70 backdrop-blur-xl transition-all duration-300 ${
          scrolled
            ? 'shadow-[0_12px_40px_-12px_rgba(116,49,129,0.22)] bg-white/80'
            : 'shadow-[0_4px_20px_-8px_rgba(116,49,129,0.12)]'
        }`}
      >
        <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 gap-3">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all border border-gray-100/80 bg-white">
              <img
                src="/sarvaa-logo-full.jpg"
                alt="Sarvaa Sweets Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base sm:text-lg lg:text-xl font-bold text-[#743181] tracking-tight">
                Sarvaa Sweets
              </h1>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            <Link href="/" className={navLinkClass}>
              Home
            </Link>
            <Link href="/products" className={navLinkClass}>
              Shop Sweets
            </Link>
            <Link href="/contact" className={navLinkClass}>
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-1 sm:gap-2 ml-auto">
            <div className="hidden sm:block">
              <SearchBar />
            </div>

            <Link href="/wishlist">
              <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-[#743181]/8">
                <Heart className="h-5 w-5 text-gray-600" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 bg-[#743181] text-white text-[11px] font-semibold rounded-full flex items-center justify-center shadow-sm">
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
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 pl-1 pr-3 rounded-full hover:bg-[#743181]/8"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-[#743181] to-[#5a2a6e] rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-white text-sm font-bold">
                          {userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-gray-700 font-medium max-w-[100px] truncate text-sm">
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
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-[#743181]/8">
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
