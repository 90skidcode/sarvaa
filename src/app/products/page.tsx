import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ProductsContent } from './_components/ProductsContent'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sarvaasweets.com'

type Props = {
  searchParams: Promise<{
    category?: string
    search?: string
    sortBy?: string
    minPrice?: string
    maxPrice?: string
  }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams
  const category = params.category
  const search = params.search

  let title = 'Shop Traditional Sweets | Sarvaa Sweets'
  let description =
    'Browse authentic Tamil Nadu traditional sweets. Mysore Pak, Tirunelveli Halwa, Palgova, Laddu and more — handcrafted with pure ghee and traditional recipes.'
  let canonical = `${SITE_URL}/products`

  if (search) {
    title = `"${search}" — Search Results | Sarvaa Sweets`
    description = `Find "${search}" among our authentic handcrafted Tamil Nadu sweets. Fresh, pure, traditional.`
    canonical = `${SITE_URL}/products?search=${encodeURIComponent(search)}`
  } else if (category && category !== 'all') {
    try {
      const cat = await prisma.category.findUnique({
        where: { slug: category },
        select: { name: true, description: true },
      })
      if (cat) {
        title = `${cat.name} — Traditional Tamil Nadu Sweets | Sarvaa Sweets`
        description =
          cat.description ||
          `Explore our ${cat.name} collection. Handcrafted Tamil Nadu sweets made with pure ghee and traditional recipes. Order fresh online.`
      } else {
        const label = category.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        title = `${label} | Traditional Tamil Nadu Sweets | Sarvaa Sweets`
      }
    } catch {
      // DB unreachable during build — use slug-based fallback
      const label = category.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      title = `${label} | Traditional Tamil Nadu Sweets | Sarvaa Sweets`
    }
    canonical = `${SITE_URL}/products?category=${category}`
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonical,
      siteName: 'Sarvaa Sweets',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: { canonical },
    robots: { index: true, follow: true },
  }
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Shop Sweets', item: `${SITE_URL}/products` },
      ...(params.category && params.category !== 'all'
        ? [
            {
              '@type': 'ListItem',
              position: 3,
              name: params.category.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
              item: `${SITE_URL}/products?category=${params.category}`,
            },
          ]
        : []),
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Suspense
        fallback={
          <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="h-10 w-10 rounded-full border-2 border-[#743181] border-t-transparent animate-spin" />
          </div>
        }
      >
        <ProductsContent />
      </Suspense>
    </>
  )
}
