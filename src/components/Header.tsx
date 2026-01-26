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
  
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated()
      setIsLoggedIn(authenticated)
      if (authenticated) {
        const user = getCurrentUser()
        setUserName(user?.name || user?.email || 'User')
      }
    }
    checkAuth()

    // Listen for storage changes (login/logout from other tabs)
    globalThis.addEventListener('storage', checkAuth)
    
    // Listen for custom user update event (profile changes in same tab)
    globalThis.addEventListener('userUpdated', checkAuth)
    
    return () => {
      globalThis.removeEventListener('storage', checkAuth)
      globalThis.removeEventListener('userUpdated', checkAuth)
    }
  }, [])
  
  // Hide header on checkout page and admin pages
  if (pathname === '/checkout' || pathname.startsWith('/admin')) {
    return null
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-16 h-12 rounded-xl overflow-hidden shadow-sm group-hover:scale-105 transition-transform border border-gray-100">
              <img
                src="/sarvaa-logo-full.jpg"
                alt="Sarvaa Sweets Logo"
                className="w-full h-full object-contain"
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
