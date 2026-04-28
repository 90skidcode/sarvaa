'use client'

import { Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useRef, useState } from 'react'

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  // Debounced search handler
  useEffect(() => {
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    // Only trigger search if query has text
    if (searchQuery.trim()) {
      debounceTimer.current = setTimeout(() => {
        router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      }, 300) // 300ms debounce
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [searchQuery, router])

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault()
    // Clear the debounce timer and immediately navigate
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleClear = () => {
    setSearchQuery('')
  }

  return (
    <form onSubmit={handleFormSubmit} className="hidden md:flex items-center gap-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for sweets..."
          className="pl-10 pr-10 py-2 border border-gray-200 rounded-full w-64 focus:outline-none focus:ring-2 focus:ring-[#743181] text-sm"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  )
}
