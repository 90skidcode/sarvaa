import { ProductDetailClientWrapper } from '@/components/ProductDetailClientWrapper'
import { prisma } from '@/lib/prisma'

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

  return (
    <ProductDetailClientWrapper slug={slug} />
  )
}
