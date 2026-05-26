'use client'

import { useState } from 'react'

interface ImageWithFallbackProps {
  src: string | null | undefined
  alt: string
  className?: string
  fallbackClassName?: string
}

export function ImageWithFallback({
  src,
  alt,
  className = '',
  fallbackClassName = ''
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false)

  // Use fallback if no src
  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-white absolute inset-0 ${fallbackClassName || className}`}>
        <img
          src="/sarvaa-logo-full.jpg"
          alt="Sarvaa Logo Placeholder"
          className="h-16 w-16 object-contain opacity-40"
        />
      </div>
    )
  }

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={`absolute inset-0 w-full h-full ${className}`}
        onError={() => setHasError(true)}
        loading="lazy"
      />
      {hasError && (
        <div className={`flex items-center justify-center bg-white absolute inset-0 ${fallbackClassName || className}`}>
          <img
            src="/sarvaa-logo-full.jpg"
            alt="Sarvaa Logo Placeholder"
            className="h-16 w-16 object-contain opacity-40"
          />
        </div>
      )}
    </>
  )
}
