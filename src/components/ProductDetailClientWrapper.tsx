'use client'

import { ProductDetailClient } from '@/components/ProductDetailClient'
import { AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ProductDetailClientWrapperProps {
  slug: string
}

export function ProductDetailClientWrapper({ slug }: ProductDetailClientWrapperProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [product, setProduct] = useState<any>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/products/${slug}`)
        const data = await response.json()

        if (response.ok && data.product) {
          // Parse images if needed (similar to server-side logic)
          let images: string[] = [data.product.image]
          if (data.product.images) {
            try {
              const additionalImages = JSON.parse(data.product.images)
              if (Array.isArray(additionalImages)) {
                images = [data.product.image, ...additionalImages]
              }
            } catch (e) {
              console.error('Error parsing product images:', e)
            }
          }

          setProduct({
            ...data.product,
            images,
            category: data.product.category
          })
        } else {
          setError(data.error || 'Product not found')
        }
      } catch (err) {
        console.error('Error fetching product:', err)
        setError('Failed to load product details')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchProduct()
    }
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
          <p className="text-gray-500 font-medium animate-pulse">Loading product details...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Product</h1>
            <p className="text-gray-500 mb-8">{error || "We couldn't find the product you're looking for."}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ProductDetailClient product={product} />
  )
}
