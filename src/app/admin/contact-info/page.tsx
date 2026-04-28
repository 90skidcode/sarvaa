'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Phone, MapPin, Clock, Save, Loader } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

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
  latitude?: string
  longitude?: string
  hoursMonSat: string
  hoursSunday: string
  responseTime: string
}

export default function ContactInfoPage() {
  const [formData, setFormData] = useState<ContactInfo>({
    phoneNumber: '',
    whatsappNumber: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    state: '',
    country: '',
    hoursMonSat: '',
    hoursSunday: '',
    responseTime: ''
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchContactInfo()
  }, [])

  const fetchContactInfo = async () => {
    try {
      const response = await fetch('/api/contact-info')
      const data = await response.json()
      setFormData(data)
    } catch (error) {
      console.error('Error fetching contact info:', error)
      toast.error('Failed to load contact information')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/contact-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to save')

      toast.success('Contact information updated successfully!')
    } catch (error) {
      console.error('Error saving contact info:', error)
      toast.error('Failed to save contact information')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-[#743181]" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Contact Information</h2>
        <p className="text-gray-600">Manage your business contact details displayed on the website</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Details */}
        <Card className="border-none shadow-sm">
          <CardHeader className="border-b bg-gray-50/50">
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-[#743181]" />
              <CardTitle>Contact Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <Input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+91-9876543210"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Number (Optional)
                </label>
                <Input
                  type="tel"
                  name="whatsappNumber"
                  value={formData.whatsappNumber || ''}
                  onChange={handleChange}
                  placeholder="+91-9876543210"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@sarvaasweets.com"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Address Details */}
        <Card className="border-none shadow-sm">
          <CardHeader className="border-b bg-gray-50/50">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#743181]" />
              <CardTitle>Address</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address *
              </label>
              <Textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123, T. Nagar Main Road"
                rows={2}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <Input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Chennai"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postal Code *
                </label>
                <Input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="600017"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <Input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Tamil Nadu"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <Input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="India"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude (Optional)
                </label>
                <Input
                  type="text"
                  name="latitude"
                  value={formData.latitude || ''}
                  onChange={handleChange}
                  placeholder="13.0033"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude (Optional)
                </label>
                <Input
                  type="text"
                  name="longitude"
                  value={formData.longitude || ''}
                  onChange={handleChange}
                  placeholder="80.2797"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Hours */}
        <Card className="border-none shadow-sm">
          <CardHeader className="border-b bg-gray-50/50">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#743181]" />
              <CardTitle>Business Hours</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monday - Saturday Hours
                </label>
                <Input
                  type="text"
                  name="hoursMonSat"
                  value={formData.hoursMonSat}
                  onChange={handleChange}
                  placeholder="9:00 AM - 8:00 PM"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sunday Hours
                </label>
                <Input
                  type="text"
                  name="hoursSunday"
                  value={formData.hoursSunday}
                  onChange={handleChange}
                  placeholder="10:00 AM - 6:00 PM"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Response Time
              </label>
              <Input
                type="text"
                name="responseTime"
                value={formData.responseTime}
                onChange={handleChange}
                placeholder="24 hours"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={fetchContactInfo}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-[#743181] to-[#5a2a6e] hover:from-[#5a2a6e] hover:to-[#743181]"
          >
            {saving ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
