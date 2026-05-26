'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  ArrowLeft,
  ArrowUpRight,
  Clock,
  Loader,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
  Store as StoreIcon,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface ContactInfo {
  id?: string
  phoneNumber: string
  whatsappNumber?: string
  email: string
  address: string
  city: string
  postalCode: string
  state: string
  country: string
  hoursMonSat: string
  hoursSunday: string
  responseTime: string
}

interface Store {
  id: string
  name: string
  address: string
  phone?: string | null
  email?: string | null
  isActive: boolean
}

export default function ContactPage() {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null)
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contactRes, storesRes] = await Promise.all([
          fetch('/api/contact-info'),
          fetch('/api/stores?activeOnly=true&limit=100'),
        ])
        const contactData = await contactRes.json()
        const storesData = await storesRes.json()
        setContactInfo(contactData)
        setStores(storesData.stores || [])
      } catch (error) {
        console.error('Error fetching contact page data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Loader className="h-8 w-8 animate-spin text-[#743181]" />
      </div>
    )
  }

  if (!contactInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="text-gray-600">Failed to load contact information</p>
      </div>
    )
  }

  const waLink = `https://wa.me/${contactInfo.whatsappNumber?.replaceAll(/\D/g, '') || ''}`
  const headquarters = stores.find((s) => /erode/i.test(s.name)) ?? null
  const isHeadquarters = (store: Store) => headquarters?.id === store.id
  const orderedStores = headquarters
    ? [headquarters, ...stores.filter((s) => s.id !== headquarters.id)]
    : stores

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-purple-50/40 via-white to-amber-50/30 overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-purple-200/40 blur-3xl" />
        <div className="absolute -top-20 right-0 h-80 w-80 rounded-full bg-amber-200/30 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 pt-8 pb-24">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#743181] font-medium mb-10 group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to Home
        </Link>

        {/* Hero */}
        <section className="max-w-4xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-purple-100 text-[#743181] text-xs font-medium mb-6 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            We'd love to hear from you
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-[1.05] mb-6">
            Let's talk
            <span className="block text-[#743181]">sweets.</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl leading-relaxed">
            Questions about an order, bulk gifting, or custom cakes? Reach us your way  we respond within{' '}
            <span className="font-semibold text-gray-900">{contactInfo.responseTime}</span>.
          </p>

          {/* Quick action pills */}
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={`tel:${contactInfo.phoneNumber}`}>
              <Button className="bg-[#743181] hover:bg-[#5a2a6e] text-white rounded-full px-6 h-12 shadow-md hover:shadow-lg transition-all">
                <Phone className="h-4 w-4 mr-2" />
                Call {contactInfo.phoneNumber}
              </Button>
            </a>
            <a href={waLink} target="_blank" rel="noopener noreferrer">
              <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 h-12 shadow-md hover:shadow-lg transition-all">
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
            </a>
            <a href={`mailto:${contactInfo.email}`}>
              <Button
                variant="outline"
                className="rounded-full px-6 h-12 border-gray-200 bg-white/70 backdrop-blur hover:bg-white hover:border-[#743181]/30 text-gray-800"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email us
              </Button>
            </a>
          </div>
        </section>

        {/* Stats strip */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          <div className="rounded-2xl bg-white/70 backdrop-blur border border-gray-100 p-5 shadow-sm">
            <Clock className="h-5 w-5 text-[#743181] mb-3" />
            <p className="text-xs text-gray-500 mb-1">Mon – Sat</p>
            <p className="font-semibold text-gray-900 text-sm">{contactInfo.hoursMonSat}</p>
          </div>
          <div className="rounded-2xl bg-white/70 backdrop-blur border border-gray-100 p-5 shadow-sm">
            <Clock className="h-5 w-5 text-[#743181] mb-3" />
            <p className="text-xs text-gray-500 mb-1">Sunday</p>
            <p className="font-semibold text-gray-900 text-sm">{contactInfo.hoursSunday}</p>
          </div>
          <div className="rounded-2xl bg-white/70 backdrop-blur border border-gray-100 p-5 shadow-sm">
            <StoreIcon className="h-5 w-5 text-[#743181] mb-3" />
            <p className="text-xs text-gray-500 mb-1">Stores</p>
            <p className="font-semibold text-gray-900 text-sm">
              {stores.length} {stores.length === 1 ? 'location' : 'locations'}
            </p>
          </div>
          <div className="rounded-2xl bg-white/70 backdrop-blur border border-gray-100 p-5 shadow-sm">
            <Mail className="h-5 w-5 text-[#743181] mb-3" />
            <p className="text-xs text-gray-500 mb-1">Response time</p>
            <p className="font-semibold text-gray-900 text-sm">Within {contactInfo.responseTime}</p>
          </div>
        </section>

        {/* Our Stores */}
        {stores.length > 0 && (
          <section className="mb-20">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100/60 text-[#743181] text-xs font-medium mb-3">
                  <MapPin className="h-3.5 w-3.5" />
                  Our locations
                </div>
                <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
                  Visit our stores
                </h2>
              </div>
              <p className="text-gray-600 max-w-md md:text-right">
                Drop by any outlet to taste fresh sweets, place custom orders, or pick up a gift box.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {orderedStores.map((store, index) => {
                const hq = isHeadquarters(store)
                return (
                <Card
                  key={store.id}
                  className={`group relative overflow-hidden border-0 backdrop-blur shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 rounded-2xl ${
                    hq ? 'bg-white ring-2 ring-[#743181]/20' : 'bg-white/80'
                  }`}
                >
                  {/* Top accent: always visible for HQ, hover-only for others */}
                  <div
                    className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#743181] via-purple-400 to-amber-300 transition-opacity ${
                      hq ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  />

                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-5 gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative flex-shrink-0">
                          <div className="absolute inset-0 bg-[#743181]/20 rounded-2xl blur-md group-hover:blur-lg transition-all" />
                          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[#743181] to-[#5a2a6e] flex items-center justify-center shadow-md">
                            <StoreIcon className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                            {hq ? 'Headquarters' : `Store ${String(index + 1).padStart(2, '0')}`}
                          </p>
                          <h3 className="font-bold text-gray-900 leading-tight truncate">{store.name}</h3>
                        </div>
                      </div>
                      {hq && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#743181] text-white text-[10px] font-bold tracking-wider uppercase shadow-sm flex-shrink-0">
                          HQ
                        </span>
                      )}
                    </div>

                    <div className="space-y-3 text-sm mb-5">
                      <div className="flex items-start gap-2.5 text-gray-700">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="leading-relaxed">{store.address}</span>
                      </div>
                      {store.phone && (
                        <a
                          href={`tel:${store.phone}`}
                          className="flex items-center gap-2.5 text-gray-700 hover:text-[#743181] transition-colors"
                        >
                          <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="font-medium">{store.phone}</span>
                        </a>
                      )}
                      {store.email && (
                        <a
                          href={`mailto:${store.email}`}
                          className="flex items-center gap-2.5 text-gray-700 hover:text-[#743181] transition-colors"
                        >
                          <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{store.email}</span>
                        </a>
                      )}
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${store.name} ${store.address}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-between text-gray-700 hover:text-[#743181] hover:bg-[#743181]/8 rounded-xl"
                        >
                          Directions
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </a>
                      {store.phone && (
                        <a href={`tel:${store.phone}`}>
                          <Button
                            size="sm"
                            className="bg-[#743181] hover:bg-[#5a2a6e] text-white rounded-xl px-4"
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
                )
              })}
            </div>
          </section>
        )}

        {/* Bottom info card */}
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#743181] via-[#5a2a6e] to-[#3d1c4d] p-10 sm:p-14 shadow-xl">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-10 -right-10 h-60 w-60 rounded-full bg-white blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-60 w-60 rounded-full bg-amber-300 blur-3xl" />
          </div>

          <div className="relative grid md:grid-cols-2 gap-10 items-center">
            <div className="text-white">
              <h2 className="text-3xl sm:text-4xl font-bold mb-3 leading-tight">
                Prefer the old-school way?
              </h2>
              <p className="text-white/80 leading-relaxed">
                Send us a letter, fax, or just walk in. We're a family business  we still answer every message personally.
              </p>
            </div>

            <div className="space-y-3 text-white">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/10 backdrop-blur border border-white/10">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-white/60">Phone</p>
                  <a
                    href={`tel:${headquarters?.phone || contactInfo.phoneNumber}`}
                    className="font-semibold hover:underline"
                  >
                    {headquarters?.phone || contactInfo.phoneNumber}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/10 backdrop-blur border border-white/10">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-white/60">Email</p>
                  <a
                    href={`mailto:${headquarters?.email || contactInfo.email}`}
                    className="font-semibold hover:underline break-all"
                  >
                    {headquarters?.email || contactInfo.email}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/10 backdrop-blur border border-white/10">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-white/60">
                    Head office{headquarters ? ` · ${headquarters.name}` : ''}
                  </p>
                  <p className="font-semibold leading-snug">
                    {headquarters
                      ? headquarters.address
                      : `${contactInfo.address}, ${contactInfo.city} ${contactInfo.postalCode}, ${contactInfo.state}, ${contactInfo.country}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
