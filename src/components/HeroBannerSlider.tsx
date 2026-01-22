'use client'

import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

interface Banner {
  id: string
  title: string
  desktopImage: string
  mobileImage: string | null
  link: string | null
  isActive: boolean
  displayOrder: number
}

// Fallback banners when no banners in database
const fallbackBanners: Banner[] = [
  {
    id: 'fallback-1',
    title: 'South Indian Sweets',
    desktopImage: '/banners/south-indian-sweets.png',
    mobileImage: null,
    link: '/products?category=traditional-tn',
    isActive: true,
    displayOrder: 0,
  },
  {
    id: 'fallback-2',
    title: 'Festive Plum Cake',
    desktopImage: '/banners/festive-plum-cake.png',
    mobileImage: null,
    link: '/products?category=festival-specials',
    isActive: true,
    displayOrder: 1,
  },
]

export function HeroBannerSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)
  const [banners, setBanners] = useState<Banner[]>(fallbackBanners)
  const [isMobile, setIsMobile] = useState(false)

  // Fetch banners from API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch('/api/banners')
        const data = await response.json()
        if (data.banners && data.banners.length > 0) {
          setBanners(data.banners)
        }
      } catch (error) {
        console.error('Error fetching banners:', error)
        // Keep fallback banners on error
      }
    }
    fetchBanners()
  }, [])

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
  }, [emblaApi, onSelect])

  // Auto-play
  useEffect(() => {
    if (!emblaApi) return
    const autoplay = setInterval(() => {
      emblaApi.scrollNext()
    }, 5000)
    return () => clearInterval(autoplay)
  }, [emblaApi])

  // Don't render if no banners
  if (banners.length === 0) return null

  return (
    <section className="relative w-full overflow-hidden">
      {/* Carousel Container */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {banners.map((banner) => {
            // Use mobile image if available and on mobile viewport
            const imageSrc = isMobile && banner.mobileImage 
              ? banner.mobileImage 
              : banner.desktopImage

            const BannerContent = (
              <div
                className="flex-[0_0_100%] min-w-0 relative"
              >
                {/* Full-width Banner Image */}
                <div className="relative w-full" style={{ aspectRatio: isMobile ? '1.5/1' : '2.5/1' }}>
                  <img
                    src={imageSrc}
                    alt={banner.title}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              </div>
            )

            return banner.link ? (
              <Link 
                key={banner.id} 
                href={banner.link} 
                className="flex-[0_0_100%] min-w-0 cursor-pointer"
              >
                {BannerContent}
              </Link>
            ) : (
              <div key={banner.id} className="flex-[0_0_100%] min-w-0">
                {BannerContent}
              </div>
            )
          })}
        </div>
      </div>

      {/* Navigation Arrows - Only show if more than 1 banner */}
      {banners.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white transition-all disabled:opacity-50"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 text-[#743181]" />
          </button>
          <button
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white transition-all disabled:opacity-50"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-[#743181]" />
          </button>
        </>
      )}

      {/* Dots Indicator - Only show if more than 1 banner */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {banners.map((banner, index) => (
            <button
              key={`dot-${banner.id}`}
              onClick={() => scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${
                index === selectedIndex
                  ? 'bg-[#743181] w-6 md:w-8'
                  : 'bg-white/60 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
