'use client'

import { Badge } from '@/components/ui/badge'
import { Clock, Loader2, Mail, MapPin, Phone } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Store {
  id: string
  name: string
  address: string
  phone: string | null
  email: string | null
  isActive: boolean
}

export default function StoreLocator() {
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStores() {
      try {
        const response = await fetch('/api/stores?activeOnly=true')
        if (!response.ok) {
          throw new Error('Failed to fetch stores')
        }
        const data = await response.json()
        setStores(data.stores)
      } catch (err) {
        console.error('Error fetching stores:', err)
        setError('Unable to load store locations. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchStores()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-[#743181]">Our Outlets</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-serif">Store Locator</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find a Sarvaa Sweets shop near you and experience the authentic taste of Tamil Nadu's traditions.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 text-[#743181] animate-spin mb-4" />
            <p className="text-gray-500">Finding nearest stores...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-lg text-center max-w-md mx-auto">
            <p>{error}</p>
          </div>
        ) : stores.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center max-w-2xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center">
                <MapPin className="h-10 w-10 text-[#743181]" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon to Your City!</h2>
            <p className="text-gray-600 mb-8">
              We are currently expanding our reach. Our flagship store is located in Erode, and we'll be opening more outlets soon.
            </p>
            <div className="inline-block bg-pink-50 p-6 rounded-lg border border-pink-100 text-left">
              <h3 className="font-bold text-gray-900 mb-2">Flagship Store:</h3>
              <p className="text-gray-600">
                GROUND FLOOR, H-25, ERODE TOWN,<br />
                EVN ROAD, Erode Periyar Nagar,<br />
                Erode, India
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => (
              <div key={store.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="bg-[#743181] p-4 text-white flex items-center justify-between">
                  <h3 className="font-bold text-lg leading-tight">{store.name}</h3>
                  <Badge variant="secondary" className="bg-white/20 text-white border-none">Open</Badge>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex gap-3 text-gray-600">
                    <MapPin className="h-5 w-5 text-[#743181] shrink-0 mt-1" />
                    <p className="text-sm leading-relaxed">{store.address}</p>
                  </div>
                  
                  {store.phone && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <Phone className="h-5 w-5 text-[#743181] shrink-0" />
                      <a href={`tel:${store.phone}`} className="text-sm hover:text-[#743181]">{store.phone}</a>
                    </div>
                  )}

                  {store.email && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <Mail className="h-5 w-5 text-[#743181] shrink-0" />
                      <a href={`mailto:${store.email}`} className="text-sm hover:text-[#743181] truncate">{store.email}</a>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-50 flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span>8:00 AM - 10:00 PM</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-20 bg-gradient-to-r from-[#743181] to-[#5a2a6e] rounded-2xl p-8 md:p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-4 italic">Want to bring Sarvaa Sweets to your city?</h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
                Discover franchise opportunities and partner with us to spread the traditional sweetness of Tamil Nadu.
            </p>
            <a href="/franchise" className="inline-flex items-center justify-center px-8 py-3 bg-white text-[#743181] rounded-full font-bold hover:bg-pink-50 transition-colors shadow-lg">
                Franchise Enquiries
            </a>
        </div>
      </div>
    </div>
  )
}
