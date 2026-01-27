'use client'

import { Button } from '@/components/ui/button'
import { getCurrentUser, isAuthenticated, logout } from '@/lib/api-client'
import { ClipboardList, LogOut, Menu, User, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface MobileMenuProps {
  readonly className?: string
}

export function MobileMenu({ className }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
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

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  const menuItems = [
    { label: 'Home', href: '/' },
    { label: 'Shop Sweets', href: '/products' },
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ]

  return (
    <div className={className}>
      {/* Hamburger Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-gray-700" />
        ) : (
          <Menu className="h-6 w-6 text-gray-700" />
        )}
      </Button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Panel */}
          <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 lg:hidden">
            <div className="p-6">
              {/* Menu Header with Logo */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-8 rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                    <img src="/sarvaa-logo-full.jpg" alt="Sarvaa Logo" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-gray-900 font-bold text-sm">Sarvaa</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-6 w-6 text-gray-700" />
                </Button>
              </div>

              {/* Menu Items */}
              <nav className="space-y-4">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="block py-3 px-4 text-gray-700 hover:bg-purple-50 hover:text-[#743181] rounded-lg font-medium transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              {/* Divider */}
              <div className="my-6 border-t border-gray-200" />

              {/* Additional Links */}
              <div className="space-y-2">
                {isLoggedIn ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-2 mb-2 bg-purple-50 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#743181] to-[#5a2a6e] rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-gray-700 font-medium text-sm truncate">
                        {userName}
                      </span>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 py-2 px-4 text-sm text-gray-600 hover:text-[#743181]"
                    >
                      <User className="h-4 w-4" />
                      My Profile
                    </Link>
                    <Link
                      href="/profile/orders"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 py-2 px-4 text-sm text-gray-600 hover:text-[#743181]"
                    >
                      <ClipboardList className="h-4 w-4" />
                      My Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full py-2 px-4 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="block py-2 px-4 text-sm text-gray-600 hover:text-[#743181]"
                  >
                    Login / Sign Up
                  </Link>
                )}
              </div>

              {/* Branding */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  தமிழ்நாட்டின் #1 இனிப்பு கடை
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
