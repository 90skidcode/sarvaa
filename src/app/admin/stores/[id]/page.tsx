'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface Store {
  id: string
  name: string
  address: string
  phone: string | null
  email: string | null
  isActive: boolean
}

export default function EditStorePage() {
  const router = useRouter()
  const params = useParams()
  const storeId = params?.id as string

  const [store, setStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    isActive: true
  })

  useEffect(() => {
    if (storeId) {
      fetchStore()
    }
  }, [storeId])

  const fetchStore = async () => {
    try {
      const response = await fetch(`/api/stores/${storeId}`)
      
      if (response.ok) {
        const data = await response.json()
        const storeData = data.store || data
        
        setStore(storeData)
        setFormData({
          name: storeData.name,
          address: storeData.address,
          phone: storeData.phone || '',
          email: storeData.email || '',
          isActive: storeData.isActive
        })
      } else {
        toast.error('Store not found')
        router.push('/admin/stores')
      }
    } catch (error) {
      console.error('Fetch error:', error)
      toast.error('Failed to load store')
      router.push('/admin/stores')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setSaving(true)

    try {
      const response = await fetch(`/api/stores/${storeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Store updated successfully')
        router.push('/admin/stores')
      } else {
        toast.error('Failed to update store')
      }
    } catch (error) {
      console.error('Error updating store:', error)
      toast.error('Failed to update store')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#743181] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading store...</p>
        </div>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Store not found</p>
          <Link href="/admin/stores">
            <Button className="mt-4">Back to Stores</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-8">
          <Link href="/admin/stores" className="inline-flex items-center text-[#743181] hover:text-[#5a2a6e] font-medium mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Stores
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Edit Store</h1>
          <p className="text-gray-600 mt-2">Update store information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Store Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Main Branch"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  placeholder="Enter full address"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 1234567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="store@example.com"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-[#743181] focus:ring-[#743181]"
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Store is Active
                </Label>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-gradient-to-r from-[#743181] to-[#5a2a6e] text-white"
                >
                  {saving ? 'Saving...' : 'Update Store'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/stores')}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
