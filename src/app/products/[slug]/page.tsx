import { ProductDetailClient } from '@/components/ProductDetailClient'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

// Generate static params for all products
export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true }
  })

  return products.map((product) => ({
    slug: product.slug
  }))
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true }
  })

  if (!product) {
    return {
      title: 'Product Not Found'
    }
  }

  return {
    title: `${product.name} - Sarvaa Sweets`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.image }]
    }
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      }
    }
  })

  if (!product || !product.isActive) {
    notFound()
  }

  // Parse images array
  let images: string[] = [product.image]
  if (product.images) {
    try {
      const additionalImages = JSON.parse(product.images)
      if (Array.isArray(additionalImages)) {
        images = [product.image, ...additionalImages]
      }
    } catch (e) {
      // Keep just the main image if parsing fails
    }
  }

  return (
    <ProductDetailClient
      product={{
        ...product,
        images,
        category: product.category
      }}
    />
  )
}
