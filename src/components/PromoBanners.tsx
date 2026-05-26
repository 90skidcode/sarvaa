'use client'

import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface PromoBanner {
  id: string
  title: string
  desktopImage: string
  mobileImage: string | null
  link: string | null
  ctaLabel: string | null
  linkType: 'URL' | 'PRODUCT' | 'CATEGORY'
  linkProductSlug: string | null
  linkCategorySlug: string | null
}

function resolveHref(banner: PromoBanner): string {
  if (banner.linkType === 'PRODUCT' && banner.linkProductSlug) {
    return `/products/${banner.linkProductSlug}`
  }
  if (banner.linkType === 'CATEGORY' && banner.linkCategorySlug) {
    return `/products?category=${banner.linkCategorySlug}`
  }
  return banner.link || '#'
}

const gridColsByCount: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2',
}

export function PromoBanners() {
  const [banners, setBanners] = useState<PromoBanner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const res = await fetch('/api/banners?type=PROMO')
        const data = await res.json()
        setBanners((data.banners || []).slice(0, 4))
      } catch (error) {
        console.error('Error fetching promo banners:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPromos()
  }, [])

  if (loading || banners.length === 0) return null

  const gridCols = gridColsByCount[banners.length] || gridColsByCount[4]

  return (
    <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className={`grid ${gridCols} gap-2 sm:gap-4 md:gap-6`}>
        {banners.map((banner) => {
          const href = resolveHref(banner)
          return (
            <Link
              key={banner.id}
              href={href}
              className="group relative block overflow-hidden rounded-xl sm:rounded-2xl bg-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 aspect-[3/2] sm:aspect-[2/1]"
            >
              <Image
                src={banner.desktopImage}
                alt={banner.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {banner.ctaLabel && (
                <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#743181] text-white text-sm font-semibold shadow-lg group-hover:bg-[#5a2a6e] group-hover:translate-x-1 transition-all">
                  {banner.ctaLabel}
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
