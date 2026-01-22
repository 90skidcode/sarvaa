'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    AlertCircle,
    ArrowDown,
    ArrowUp,
    Edit,
    Eye,
    EyeOff,
    ImageIcon,
    Monitor,
    Plus,
    Smartphone,
    Trash2,
    Upload,
    X,
} from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface Banner {
  id: string
  title: string
  desktopImage: string
  mobileImage: string | null
  link: string | null
  isActive: boolean
  displayOrder: number
  createdAt: string
}

const DESKTOP_DIMENSIONS = { width: 1920, height: 768 }
const MOBILE_DIMENSIONS = { width: 768, height: 512 }

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [link, setLink] = useState('')
  const [desktopImage, setDesktopImage] = useState<File | null>(null)
  const [mobileImage, setMobileImage] = useState<File | null>(null)
  const [desktopPreview, setDesktopPreview] = useState<string | null>(null)
  const [mobilePreview, setMobilePreview] = useState<string | null>(null)

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/banners')
      const data = await response.json()
      setBanners(data.banners || [])
    } catch (error) {
      console.error('Error fetching banners:', error)
      toast.error('Failed to load banners')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setTitle('')
    setLink('')
    setDesktopImage(null)
    setMobileImage(null)
    setDesktopPreview(null)
    setMobilePreview(null)
    setEditingBanner(null)
    setShowForm(false)
  }

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner)
    setTitle(banner.title)
    setLink(banner.link || '')
    setDesktopPreview(banner.desktopImage)
    setMobilePreview(banner.mobileImage)
    setShowForm(true)
  }

  const handleDesktopImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setDesktopImage(file)
      setDesktopPreview(URL.createObjectURL(file))
    }
  }

  const handleMobileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setMobileImage(file)
      setMobilePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }

    if (!editingBanner && !desktopImage) {
      toast.error('Desktop image is required')
      return
    }

    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('link', link)
      formData.append('displayOrder', String(banners.length))
      
      if (editingBanner) {
        formData.append('isActive', String(editingBanner.isActive))
      }

      if (desktopImage) {
        formData.append('desktopImage', desktopImage)
      }

      if (mobileImage) {
        formData.append('mobileImage', mobileImage)
      }

      const url = editingBanner ? `/api/banners/${editingBanner.id}` : '/api/banners'
      const method = editingBanner ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to save banner')
      }

      toast.success(editingBanner ? 'Banner updated successfully' : 'Banner created successfully')
      resetForm()
      fetchBanners()
    } catch (error) {
      console.error('Error saving banner:', error)
      toast.error('Failed to save banner')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return

    try {
      const response = await fetch(`/api/banners/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete')
      toast.success('Banner deleted successfully')
      fetchBanners()
    } catch (error) {
      console.error('Error deleting banner:', error)
      toast.error('Failed to delete banner')
    }
  }

  const handleToggleActive = async (banner: Banner) => {
    try {
      const formData = new FormData()
      formData.append('title', banner.title)
      formData.append('link', banner.link || '')
      formData.append('displayOrder', String(banner.displayOrder))
      formData.append('isActive', String(!banner.isActive))

      const response = await fetch(`/api/banners/${banner.id}`, {
        method: 'PUT',
        body: formData,
      })

      if (!response.ok) throw new Error('Failed to update')
      toast.success(`Banner ${!banner.isActive ? 'activated' : 'deactivated'}`)
      fetchBanners()
    } catch (error) {
      console.error('Error toggling banner:', error)
      toast.error('Failed to update banner')
    }
  }

  const handleReorder = async (banner: Banner, direction: 'up' | 'down') => {
    const currentIndex = banners.findIndex(b => b.id === banner.id)
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    
    if (newIndex < 0 || newIndex >= banners.length) return

    const otherBanner = banners[newIndex]

    // Swap display orders
    try {
      await Promise.all([
        fetch(`/api/banners/${banner.id}`, {
          method: 'PUT',
          body: (() => {
            const fd = new FormData()
            fd.append('title', banner.title)
            fd.append('link', banner.link || '')
            fd.append('displayOrder', String(otherBanner.displayOrder))
            fd.append('isActive', String(banner.isActive))
            return fd
          })(),
        }),
        fetch(`/api/banners/${otherBanner.id}`, {
          method: 'PUT',
          body: (() => {
            const fd = new FormData()
            fd.append('title', otherBanner.title)
            fd.append('link', otherBanner.link || '')
            fd.append('displayOrder', String(banner.displayOrder))
            fd.append('isActive', String(otherBanner.isActive))
            return fd
          })(),
        }),
      ])
      fetchBanners()
    } catch (error) {
      console.error('Error reordering banners:', error)
      toast.error('Failed to reorder banners')
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Banner Management</h1>
          <p className="text-gray-600 mt-1">Manage homepage hero banners</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-[#743181] hover:bg-[#5a2a6e]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Banner
        </Button>
      </div>

      {/* Dimension Guidelines */}
      <Card className="mb-8 border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">Recommended Image Dimensions</h3>
              <div className="grid md:grid-cols-2 gap-4 mt-2 text-sm text-blue-800">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  <span><strong>Desktop:</strong> {DESKTOP_DIMENSIONS.width} × {DESKTOP_DIMENSIONS.height} px (2.5:1 ratio)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  <span><strong>Mobile:</strong> {MOBILE_DIMENSIONS.width} × {MOBILE_DIMENSIONS.height} px (1.5:1 ratio)</span>
                </div>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                Use PNG or JPG format. Keep file size under 500KB for optimal loading.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{editingBanner ? 'Edit Banner' : 'Add New Banner'}</CardTitle>
                <CardDescription>
                  {editingBanner ? 'Update the banner details below' : 'Upload a new banner for the homepage slider'}
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Banner Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., South Indian Sweets Collection"
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#743181] focus:border-transparent"
                  required
                />
              </div>

              {/* Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link (Optional)
                </label>
                <input
                  type="text"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="e.g., /products?category=traditional-tn"
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#743181] focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Where should the banner link to when clicked?</p>
              </div>

              {/* Desktop Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    Desktop Banner <span className="text-red-500">*</span>
                  </div>
                </label>
                <div className="text-xs text-gray-500 mb-2">
                  Recommended: {DESKTOP_DIMENSIONS.width} × {DESKTOP_DIMENSIONS.height} px
                </div>
                
                {desktopPreview ? (
                  <div className="relative border rounded-lg overflow-hidden">
                    <Image
                      src={desktopPreview}
                      alt="Desktop preview"
                      width={480}
                      height={192}
                      className="w-full h-48 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setDesktopImage(null)
                        setDesktopPreview(null)
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Click to upload desktop banner</p>
                      <p className="text-xs text-gray-400">{DESKTOP_DIMENSIONS.width} × {DESKTOP_DIMENSIONS.height} px recommended</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleDesktopImageChange}
                    />
                  </label>
                )}
              </div>

              {/* Mobile Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Mobile Banner (Optional)
                  </div>
                </label>
                <div className="text-xs text-gray-500 mb-2">
                  Recommended: {MOBILE_DIMENSIONS.width} × {MOBILE_DIMENSIONS.height} px
                </div>
                
                {mobilePreview ? (
                  <div className="relative border rounded-lg overflow-hidden max-w-xs">
                    <Image
                      src={mobilePreview}
                      alt="Mobile preview"
                      width={192}
                      height={128}
                      className="w-48 h-32 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setMobileImage(null)
                        setMobilePreview(null)
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-48 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="flex flex-col items-center justify-center">
                      <Upload className="h-6 w-6 text-gray-400 mb-1" />
                      <p className="text-xs text-gray-500">Upload mobile</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleMobileImageChange}
                    />
                  </label>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  If not provided, the desktop image will be used for mobile devices.
                </p>
              </div>

              {/* Submit */}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#743181] hover:bg-[#5a2a6e]"
                >
                  {submitting ? 'Saving...' : editingBanner ? 'Update Banner' : 'Create Banner'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Banners List */}
      {banners.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ImageIcon className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">No banners yet</h3>
            <p className="text-gray-500 mb-4">Add your first banner to get started</p>
            <Button onClick={() => setShowForm(true)} className="bg-[#743181] hover:bg-[#5a2a6e]">
              <Plus className="h-4 w-4 mr-2" />
              Add Banner
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {banners.map((banner, index) => (
            <Card key={banner.id} className={!banner.isActive ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Preview */}
                  <div className="relative w-64 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={banner.desktopImage}
                      alt={banner.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{banner.title}</h3>
                        {banner.link && (
                          <p className="text-sm text-gray-500">Links to: {banner.link}</p>
                        )}
                        <div className="flex gap-2 mt-2">
                          <Badge variant={banner.isActive ? 'default' : 'secondary'}>
                            {banner.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          {banner.mobileImage && (
                            <Badge variant="outline" className="text-blue-600 border-blue-200">
                              <Smartphone className="h-3 w-3 mr-1" />
                              Mobile
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {/* Reorder */}
                        <div className="flex flex-col">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleReorder(banner, 'up')}
                            disabled={index === 0}
                            className="h-6 w-6"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleReorder(banner, 'down')}
                            disabled={index === banners.length - 1}
                            className="h-6 w-6"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Toggle Active */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleActive(banner)}
                          title={banner.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {banner.isActive ? (
                            <Eye className="h-4 w-4 text-green-600" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>

                        {/* Edit */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(banner)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(banner.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
