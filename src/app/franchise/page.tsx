'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Building2, Mail, Phone, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

export default function Franchise() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    message: '',
    businessType: 'retail'
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/franchise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Failed to submit')

      toast.success('Franchise inquiry submitted! We will contact you soon.')
      setFormData({
        name: '',
        email: '',
        phone: '',
        city: '',
        state: '',
        message: '',
        businessType: 'retail'
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit inquiry')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <Link href="/" className="inline-flex items-center text-[#743181] hover:text-[#5a2a6e] mb-8 font-medium">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-[#743181]">Business Opportunity</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Franchise Opportunities</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Partner with us to spread the sweetness of authentic Tamil traditions across India!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Side - Info Cards */}
          <div className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Building2 className="h-6 w-6 text-[#743181]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Why Franchise with Us?</h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>✓ Proven business model</li>
                      <li>✓ Authentic recipes & support</li>
                      <li>✓ Complete training program</li>
                      <li>✓ Ongoing marketing assistance</li>
                      <li>✓ Premium brand reputation</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Mail className="h-6 w-6 text-[#743181]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Contact</h3>
                    <p className="text-sm text-gray-600">franchise@sarvaasweets.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Phone className="h-6 w-6 text-[#743181]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Hotline</h3>
                    <p className="text-sm text-gray-600">+91-9876543210</p>
                    <p className="text-xs text-gray-500 mt-1">Mon-Sat: 10 AM - 6 PM</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Form */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Express Your Interest</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Fill out the form below and our team will contact you shortly</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91-XXXXXXXXXX"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <Input
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="City"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <Input
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="State"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-1">Business Type (Optional)</label>
                  <select
                    id="businessType"
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#743181]"
                  >
                    <option value="retail">Retail Shop</option>
                    <option value="wholesale">Wholesale</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your business background..."
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#743181] to-[#5a2a6e] hover:from-[#5a2a6e] hover:to-[#743181]"
                >
                  {loading ? 'Submitting...' : 'Submit Inquiry'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
