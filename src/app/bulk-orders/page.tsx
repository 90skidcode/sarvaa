'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ShoppingBag, Truck, Percent, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

export default function BulkOrders() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    quantity: 100,
    description: '',
    deliveryLocation: '',
    estimatedDeliveryDate: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? Number.parseInt(value) || 100 : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/bulk-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Failed to submit')

      toast.success('Bulk order inquiry submitted! We will contact you with a quote shortly.')
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        quantity: 100,
        description: '',
        deliveryLocation: '',
        estimatedDeliveryDate: '',
        notes: ''
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
          <Badge className="mb-4 bg-[#743181]">Special Orders</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Bulk Orders</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Planning a celebration, corporate event, or need large quantities? Get special pricing and customized solutions!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Side - Info Cards */}
          <div className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <ShoppingBag className="h-6 w-6 text-[#743181]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Minimum Order</h3>
                    <p className="text-sm text-gray-600">Bulk orders start from 100+ pieces with special discounts</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Percent className="h-6 w-6 text-[#743181]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Volume Discounts</h3>
                    <p className="text-sm text-gray-600">
                      • 100-500 pcs: 10% off<br />
                      • 500+ pcs: 15% off<br />
                      • 1000+ pcs: Custom pricing
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Truck className="h-6 w-6 text-[#743181]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Delivery</h3>
                    <p className="text-sm text-gray-600">Pan-India delivery available. Customized delivery dates possible.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Form */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Request a Quote</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Fill out your bulk order details and we'll provide a customized quote</p>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company/Organization (Optional)</label>
                  <Input
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Required *</label>
                  <Input
                    name="quantity"
                    type="number"
                    min="100"
                    max="100000"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="Minimum 100 pieces"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Details *</label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Which sweets? Any special requirements?"
                    rows={2}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Location *</label>
                  <Input
                    name="deliveryLocation"
                    value={formData.deliveryLocation}
                    onChange={handleChange}
                    placeholder="City or complete address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Delivery Date (Optional)</label>
                  <Input
                    name="estimatedDeliveryDate"
                    type="date"
                    value={formData.estimatedDeliveryDate}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes (Optional)</label>
                  <Textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Any special requests or questions..."
                    rows={2}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#743181] to-[#5a2a6e] hover:from-[#5a2a6e] hover:to-[#743181]"
                >
                  {loading ? 'Submitting...' : 'Request Quote'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
