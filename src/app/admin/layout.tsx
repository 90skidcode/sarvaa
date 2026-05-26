'use client'

import { Button } from '@/components/ui/button'
import { getCurrentUser } from '@/lib/api-client'
import {
  Cake,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  ImageIcon,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  Package,
  Phone,
  Store,
  Tag,
  Users,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface AdminLayoutProps {
  readonly children: React.ReactNode
}

const sections = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Management',
    items: [
      { label: 'Products', href: '/admin/products', icon: Package },
      { label: 'Categories', href: '/admin/categories', icon: Tag },
      { label: 'Orders', href: '/admin/orders', icon: ClipboardList },
      { label: 'Coupons', href: '/admin/coupons', icon: Tag },
      { label: 'Customers', href: '/admin/customers', icon: Users },
      { label: 'Banners', href: '/admin/banners', icon: ImageIcon },
    ],
  },
  {
    title: 'Configuration',
    items: [
      { label: 'Contact Info', href: '/admin/contact-info', icon: Phone },
      { label: 'Staff Access', href: '/admin/users', icon: Lock },
      { label: 'Stores', href: '/admin/stores', icon: Store },
    ],
  },
]

const pageTitleMap: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/products': 'Products',
  '/admin/categories': 'Categories',
  '/admin/orders': 'Orders',
  '/admin/coupons': 'Coupons',
  '/admin/customers': 'Customers',
  '/admin/banners': 'Banners',
  '/admin/contact-info': 'Contact Information',
  '/admin/users': 'Staff Access',
  '/admin/stores': 'Stores',
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userName, setUserName] = useState('Admin')

  useEffect(() => {
    const saved = localStorage.getItem('admin-sidebar-collapsed')
    if (saved !== null) setCollapsed(saved === 'true')
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (pathname === '/admin/login') { setIsAdmin(true); return }
    const user = getCurrentUser()
    if (user?.role !== 'admin') {
      setIsAdmin(false)
      router.push('/admin/login')
    } else {
      setIsAdmin(true)
      setUserName(user?.name || user?.email?.split('@')[0] || 'Admin')
    }
  }, [pathname, router])

  const toggleCollapsed = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('admin-sidebar-collapsed', String(next))
  }

  const handleLogout = () => {
    localStorage.removeItem('adminUser')
    localStorage.removeItem('adminToken')
    localStorage.removeItem('cart-storage')
    localStorage.removeItem('cart_session_id')
    toast.success('Signed out successfully')
    router.push('/admin/login')
  }

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  const pageTitle = Object.entries(pageTitleMap).find(
    ([path]) => path === '/admin' ? pathname === '/admin' : pathname.startsWith(path),
  )?.[1] || 'Admin'

  if (isAdmin === null && pathname !== '/admin/login') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-[#743181] border-t-transparent animate-spin" />
          <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Verifying access…</p>
        </div>
      </div>
    )
  }

  if (pathname === '/admin/login') return <>{children}</>

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className={`flex items-center h-16 border-b border-gray-100 flex-shrink-0 ${collapsed ? 'justify-center px-0' : 'px-5 gap-3'}`}>
        <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
          <img src="/sarvaa-logo-full.jpg" alt="Sarvaa" className="w-full h-full object-contain" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 tracking-tight">Sarvaa Sweets</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest truncate">Administrator</p>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 space-y-1">
        {sections.map((section) => (
          <div key={section.title} className="mb-2">
            {!collapsed && (
              <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {section.title}
              </p>
            )}
            {collapsed && <div className="my-3 border-t border-gray-100" />}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center rounded-lg transition-all duration-150 group relative
                      ${collapsed ? 'justify-center w-10 h-10 mx-auto' : 'gap-3 px-3 py-2.5 w-full'}
                      ${active
                        ? 'bg-[#743181] text-white shadow-md shadow-[#743181]/20'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                  >
                    <item.icon className={`flex-shrink-0 transition-none ${collapsed ? 'h-[18px] w-[18px]' : 'h-4 w-4'}`} />
                    {!collapsed && (
                      <span className="text-sm font-medium truncate">{item.label}</span>
                    )}
                    {active && !collapsed && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70 flex-shrink-0" />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 p-2 flex-shrink-0 space-y-1">
        {/* Collapse toggle — desktop only */}
        <button
          onClick={toggleCollapsed}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`hidden lg:flex items-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all
            ${collapsed ? 'justify-center w-10 h-10 mx-auto' : 'gap-3 px-3 py-2.5 w-full'}`}
        >
          {collapsed
            ? <ChevronRight className="h-4 w-4" />
            : <><ChevronLeft className="h-4 w-4" /><span className="text-sm font-medium">Collapse</span></>
          }
        </button>

        {/* User */}
        <div className={`flex items-center rounded-lg ${collapsed ? 'justify-center py-2' : 'gap-3 px-3 py-2.5'}`}>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#743181] to-[#B86E9F] flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white text-xs font-bold">{userName.charAt(0).toUpperCase()}</span>
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
              <p className="text-[11px] text-gray-400 truncate">Admin</p>
            </div>
          )}
        </div>

        {/* Sign out */}
        <button
          onClick={handleLogout}
          title={collapsed ? 'Sign out' : undefined}
          className={`flex items-center rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all w-full
            ${collapsed ? 'justify-center w-10 h-10 mx-auto' : 'gap-3 px-3 py-2.5'}`}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Sign out</span>}
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex font-outfit">

      {/* ── Desktop sidebar ── */}
      <aside
        className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-40 bg-white border-r border-gray-100 transition-all duration-300 ${
          collapsed ? 'w-[60px]' : 'w-[220px]'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile sidebar overlay ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 w-[220px] bg-white flex flex-col h-full shadow-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Main area ── */}
      <div className={`flex flex-col flex-1 min-h-screen transition-all duration-300 ${collapsed ? 'lg:ml-[60px]' : 'lg:ml-[220px]'}`}>

        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-base font-semibold text-gray-900">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/" target="_blank">
              <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2 text-gray-600 hover:text-[#743181] hover:bg-purple-50 rounded-lg text-sm h-8">
                <Cake className="h-3.5 w-3.5" />
                Live Portal
              </Button>
            </Link>
            <div className="hidden sm:flex items-center gap-2 bg-purple-50 text-[#743181] px-3 py-1.5 rounded-lg text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {userName}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
