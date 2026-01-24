'use client'

import { Button } from '@/components/ui/button'
import { Cake, ClipboardList, ImageIcon, LayoutDashboard, LogOut, Package, Store, Tag, Users } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface AdminLayoutProps {
  readonly children: React.ReactNode
}

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(path)
  }

  const sections = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      ]
    },
    {
      title: 'Management',
      items: [
        { label: 'Products', href: '/admin/products', icon: Package },
        { label: 'Categories', href: '/admin/categories', icon: Tag },
        { label: 'Orders', href: '/admin/orders', icon: ClipboardList },
        { label: 'Banners', href: '/admin/banners', icon: ImageIcon },
      ]
    },
    {
      title: 'Configuration',
      items: [
        { label: 'Users', href: '/admin/users', icon: Users },
        { label: 'Stores', href: '/admin/stores', icon: Store },
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-[#f5f0f7] relative overflow-hidden">
      {/* Background Accent Gradients */}
      <div className="fixed -top-24 -right-24 w-96 h-96 bg-[#743181]/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="fixed -bottom-24 -left-24 w-96 h-96 bg-[#B86E9F]/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Admin Header */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-white/60 sticky top-0 z-50 shadow-[0_1px_15px_rgba(0,0,0,0.02)]">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-10 rounded-lg overflow-hidden transition-transform hover:scale-105 duration-300">
                <img
                  src="/sarvaa-logo-full.jpg"
                  alt="Sarvaa Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-black text-gray-800 tracking-tighter">SARVAA<span className="text-[#B86E9F]">.</span></h1>
                <div className="flex items-center gap-2">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </div>
                  <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-[0.3em]">Administrator</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm" className="hidden sm:flex text-gray-500 hover:text-[#B86E9F] hover:bg-white rounded-full border border-transparent hover:border-gray-100 shadow-sm transition-all">
                  <Cake className="h-4 w-4 mr-2" />
                  Live Portal
                </Button>
              </Link>
              <div className="h-6 w-[1px] bg-gray-200 mx-2 hidden sm:block"></div>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full font-bold transition-colors">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-2 py-2 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* Sidebar */}
          <aside className="lg:col-span-2">
            <nav className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/80 p-4 space-y-6 sticky top-24 shadow-[0_20px_50px_rgba(0,0,0,0.03)] ring-1 ring-black/5">
              {sections.map((section) => (
                <div key={section.title} className="space-y-4">
                  <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">
                    {section.title}
                  </h3>
                  <div className="space-y-1.5">
                    {section.items.map((item) => {
                      const active = isActive(item.href)
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`
                            group flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden
                            ${active 
                              ? 'bg-white text-[#743181] font-bold shadow-[0_8px_20px_rgba(184,110,159,0.12)] border border-purple-50' 
                              : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'}
                          `}
                        >
                          <div className={`
                            p-2 rounded-xl transition-all duration-300
                            ${active 
                              ? 'bg-gradient-to-br from-[#B86E9F] to-[#743181] text-white shadow-md shadow-purple-200' 
                              : 'bg-gray-50 text-gray-400 group-hover:bg-white group-hover:text-[#B86E9F] group-hover:shadow-sm'}
                          `}>
                            <item.icon className="h-4 w-4" />
                          </div>
                          <span className="text-[13px] tracking-tight">{item.label}</span>
                          
                          {active && (
                            <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-[#B86E9F]" />
                          )}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}

              <div className="mt-10 pt-10 border-t border-gray-100/80">
                <div className="bg-gradient-to-br from-[#743181] via-[#B86E9F] to-[#662525] rounded-[2rem] p-6 text-white shadow-2xl shadow-purple-200/50 relative overflow-hidden group">
                  <div className="relative z-10">
                    <p className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] mb-1">Sarvaa OS</p>
                    <p className="text-[13px] font-semibold mb-4 leading-snug">Everything is running smoothly today.</p>
                    <Button size="sm" className="w-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white text-[11px] font-black rounded-xl transition-all">
                      GET ASSISTANCE
                    </Button>
                  </div>
                  <div className="absolute -bottom-8 -right-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                    <Cake className="h-32 w-32 rotate-12" />
                  </div>
                </div>
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-10">
            <div className="bg-white/30 backdrop-blur-md rounded-2xl border border-white/90 p-3 min-h-[90vh] shadow-[0_30px_60px_rgba(0,0,0,0.02)] ring-1 ring-black/[0.02]">
                 {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
