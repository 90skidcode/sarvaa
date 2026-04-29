'use client'

import { BottomNavigation } from "@/components/BottomNavigation"
import { Footer } from "@/components/Footer"
import { Header } from "@/components/Header"
import { usePathname } from 'next/navigation'

export function ConditionalLayout({ children }: { readonly children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')

  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <>
      <Header />
      <div className="pb-2 sm:pb-0">
        {children}
      </div>
      <Footer />
      <BottomNavigation />
    </>
  )
}
