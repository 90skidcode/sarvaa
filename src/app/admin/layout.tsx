'use client'

import { Button } from '@/components/ui/button'
import { Cake, ClipboardList, ImageIcon, LayoutDashboard, LogOut, Package, Store, Tag, Users } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(path)
  }

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'Banners', href: '/admin/banners', icon: <ImageIcon className="h-5 w-5" /> },
    { label: 'Products', href: '/admin/products', icon: <Package className="h-5 w-5" /> },
    { label: 'Categories', href: '/admin/categories', icon: <Tag className="h-5 w-5" /> },
    { label: 'Orders', href: '/admin/orders', icon: <ClipboardList className="h-5 w-5" /> },
    { label: 'Users', href: '/admin/users', icon: <Users className="h-5 w-5" /> },
    { label: 'Stores', href: '/admin/stores', icon: <Store className="h-5 w-5" /> },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-[#743181] text-white p-2 rounded-lg shadow-lg">
                <Cake className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 leading-none">Sarvaa Sweets</h1>
                <p className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wider">Admin Panel</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <Cake className="h-4 w-4 mr-2" />
                  View Site
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <nav className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-2 sticky top-24">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-purple-50 text-[#743181] font-bold shadow-sm ring-1 ring-purple-100'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-[#743181]'
                  }`}
                >
                  <div className={`p-2 rounded-lg transition-colors ${
                    isActive(item.href) ? 'bg-white shadow-sm' : 'bg-transparent'
                  }`}>
                    {item.icon}
                  </div>
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
