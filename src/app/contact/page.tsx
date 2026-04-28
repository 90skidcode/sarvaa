'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Clock, Mail, MapPin, MessageCircle, Phone, Star, Loader } from 'lucide-react'
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

export default function ContactPage() {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await fetch('/api/contact-info')
        const data = await response.json()
        setContactInfo(data)
      } catch (error) {
        console.error('Error fetching contact info:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchContactInfo()
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

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#743181] to-[#5a2a6e] text-white py-20">
        <div className="container mx-auto px-4">
          <Link href="/" className="inline-flex items-center text-white/80 hover:text-white font-medium mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-6xl font-bold mb-6">Get in Touch</h1>
          <p className="text-xl text-white/90 max-w-3xl leading-relaxed">
            We're here to help with any questions about our traditional Indian sweets. Reach out through your preferred channel and we'll respond promptly.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-20">
        {/* Contact Methods Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {/* Phone */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-8">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-purple-100 rounded-full">
                  <Phone className="h-8 w-8 text-[#743181]" />
                </div>
              </div>
              <h3 className="font-bold text-xl text-gray-900 text-center mb-2">Call Us</h3>
              <p className="text-gray-600 text-center text-sm mb-4">
                Speak with our team directly
              </p>
              <a
                href={`tel:${contactInfo.phoneNumber}`}
                className="block text-[#743181] hover:text-[#5a2a6e] font-bold text-center text-lg mb-3"
              >
                {contactInfo.phoneNumber}
              </a>
              <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 text-center space-y-1">
                <p className="font-medium">Mon-Sat: {contactInfo.hoursMonSat}</p>
                <p>Sunday: {contactInfo.hoursSunday}</p>
              </div>
            </CardContent>
          </Card>

          {/* Email */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-8">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-purple-100 rounded-full">
                  <Mail className="h-8 w-8 text-[#743181]" />
                </div>
              </div>
              <h3 className="font-bold text-xl text-gray-900 text-center mb-2">Email Us</h3>
              <p className="text-gray-600 text-center text-sm mb-4">
                Send us your queries
              </p>
              <a
                href={`mailto:${contactInfo.email}`}
                className="block text-[#743181] hover:text-[#5a2a6e] font-bold text-center text-base mb-3 break-all"
              >
                {contactInfo.email}
              </a>
              <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 text-center">
                <p>We'll respond within {contactInfo.responseTime}</p>
              </div>
            </CardContent>
          </Card>

          {/* WhatsApp */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-8">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-green-100 rounded-full">
                  <MessageCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h3 className="font-bold text-xl text-gray-900 text-center mb-2">WhatsApp</h3>
              <p className="text-gray-600 text-center text-sm mb-4">
                Quick chat support
              </p>
              <a
                href={`https://wa.me/${contactInfo.whatsappNumber?.replaceAll(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat Now
                </Button>
              </a>
            </CardContent>
          </Card>

          {/* Visit Store */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-8">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-purple-100 rounded-full">
                  <MapPin className="h-8 w-8 text-[#743181]" />
                </div>
              </div>
              <h3 className="font-bold text-xl text-gray-900 text-center mb-2">Visit Us</h3>
              <p className="text-gray-600 text-center text-sm mb-4">
                Experience our store
              </p>
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 text-center space-y-1">
                <p className="font-medium">{contactInfo.address}</p>
                <p>{contactInfo.city} {contactInfo.postalCode}</p>
                <p>{contactInfo.state}, {contactInfo.country}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <Clock className="h-12 w-12 text-[#743181]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Fast Response</h3>
            <p className="text-gray-600">We respond to all inquiries within 24 hours</p>
          </div>

          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <Phone className="h-12 w-12 text-[#743181]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Multiple Channels</h3>
            <p className="text-gray-600">Reach us via phone, email, WhatsApp or visit in person</p>
          </div>

          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <Star className="h-12 w-12 text-[#743181]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Expert Support</h3>
            <p className="text-gray-600">Our team is knowledgeable about all our products</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-[#743181] to-[#5a2a6e] rounded-2xl p-12 text-white text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Connect?</h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Choose your preferred way to reach us. We're available across multiple channels to serve you better.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href={`tel:${contactInfo.phoneNumber}`}>
              <Button className="bg-white text-[#743181] hover:bg-gray-100 font-bold px-8">
                <Phone className="h-4 w-4 mr-2" />
                Call Now
              </Button>
            </a>
            <a href={`https://wa.me/${contactInfo.whatsappNumber?.replaceAll(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
              <Button className="bg-green-500 hover:bg-green-600 text-white font-bold px-8">
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
