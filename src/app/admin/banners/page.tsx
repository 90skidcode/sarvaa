'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  ImageIcon,
  Layout,
  Link as LinkIcon,
  Monitor,
  Package,
  Plus,
  Smartphone,
  Tag,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

type BannerType = 'HERO' | 'PROMO'
type LinkType = 'URL' | 'PRODUCT' | 'CATEGORY'

interface Banner {
  id: string
  title: string
  desktopImage: string
  mobileImage: string | null
  link: string | null
  type: BannerType
  ctaLabel: string | null
  linkType: LinkType
  linkProductSlug: string | null
  linkCategorySlug: string | null
  isActive: boolean
  displayOrder: number
  createdAt: string
}

interface SimpleOption {
  slug: string
  name: string
}

const HERO_DIMENSIONS = { width: 1920, height: 768 }
const PROMO_DIMENSIONS = { width: 1200, height: 600 }
const MOBILE_DIMENSIONS = { width: 768, height: 512 }

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [activeTab, setActiveTab] = useState<BannerType>('HERO')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [products, setProducts] = useState<SimpleOption[]>([])
  const [categories, setCategories] = useState<SimpleOption[]>([])

  // Form state
  const [title, setTitle] = useState('')
  const [link, setLink] = useState('')
  const [type, setType] = useState<BannerType>('HERO')
  const [ctaLabel, setCtaLabel] = useState('')
  const [linkType, setLinkType] = useState<LinkType>('URL')
  const [linkProductSlug, setLinkProductSlug] = useState('')
  const [linkCategorySlug, setLinkCategorySlug] = useState('')
  const [desktopImage, setDesktopImage] = useState<File | null>(null)
  const [mobileImage, setMobileImage] = useState<File | null>(null)
  const [desktopPreview, setDesktopPreview] = useState<string | null>(null)
  const [mobilePreview, setMobilePreview] = useState<string | null>(null)

  useEffect(() => {
    fetchBanners()
    fetchOptions()
  }, [])

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/banners?admin=true')
      const data = await response.json()
      setBanners(data.banners || [])
    } catch (error) {
      console.error('Error fetching banners:', error)
      toast.error('Failed to load banners')
    } finally {
      setLoading(false)
    }
  }

  const fetchOptions = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products?limit=500'),
        fetch('/api/categories?limit=200&activeOnly=true'),
      ])
      const productsData = await productsRes.json()
      const categoriesData = await categoriesRes.json()
      setProducts(
        (productsData.products || []).map((p: any) => ({ slug: p.slug, name: p.name })),
      )
      setCategories(
        (categoriesData.categories || []).map((c: any) => ({ slug: c.slug, name: c.name })),
      )
    } catch (error) {
      console.error('Error fetching link options:', error)
    }
  }

  const resetForm = () => {
    setTitle('')
    setLink('')
    setCtaLabel('')
    setLinkType('URL')
    setLinkProductSlug('')
    setLinkCategorySlug('')
    setDesktopImage(null)
    setMobileImage(null)
    setDesktopPreview(null)
    setMobilePreview(null)
    setEditingBanner(null)
    setShowForm(false)
  }

  const openAddForm = () => {
    resetForm()
    setType(activeTab)
    setShowForm(true)
  }

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner)
    setTitle(banner.title)
    setLink(banner.link || '')
    setType(banner.type)
    setCtaLabel(banner.ctaLabel || '')
    setLinkType(banner.linkType)
    setLinkProductSlug(banner.linkProductSlug || '')
    setLinkCategorySlug(banner.linkCategorySlug || '')
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

    if (linkType === 'PRODUCT' && !linkProductSlug) {
      toast.error('Select a product to link to')
      return
    }
    if (linkType === 'CATEGORY' && !linkCategorySlug) {
      toast.error('Select a category to link to')
      return
    }
    if (linkType === 'URL' && link && !/^(https?:\/\/|\/)/.test(link)) {
      toast.error('Custom URL must start with http(s):// or /')
      return
    }

    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('type', type)
      formData.append('ctaLabel', ctaLabel)
      formData.append('linkType', linkType)
      formData.append('link', linkType === 'URL' ? link : '')
      formData.append('linkProductSlug', linkType === 'PRODUCT' ? linkProductSlug : '')
      formData.append('linkCategorySlug', linkType === 'CATEGORY' ? linkCategorySlug : '')
      formData.append(
        'displayOrder',
        String(editingBanner ? editingBanner.displayOrder : banners.filter((b) => b.type === type).length),
      )

      if (editingBanner) {
        formData.append('isActive', String(editingBanner.isActive))
      }
      if (desktopImage) formData.append('desktopImage', desktopImage)
      if (mobileImage) formData.append('mobileImage', mobileImage)

      const url = editingBanner ? `/api/banners/${editingBanner.id}` : '/api/banners'
      const method = editingBanner ? 'PUT' : 'POST'

      const response = await fetch(url, { method, body: formData })

      if (!response.ok) {
        if (response.status === 409) throw new Error('A banner with this title already exists')
        const errBody = await response.json().catch(() => null)
        throw new Error(errBody?.error || 'Failed to save banner')
      }

      toast.success(editingBanner ? 'Banner updated successfully' : 'Banner created successfully')
      resetForm()
      fetchBanners()
    } catch (error) {
      console.error('Error saving banner:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save banner')
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
      formData.append('displayOrder', String(banner.displayOrder))
      formData.append('isActive', String(!banner.isActive))

      const response = await fetch(`/api/banners/${banner.id}`, { method: 'PUT', body: formData })
      if (!response.ok) throw new Error('Failed to update')
      toast.success(`Banner ${!banner.isActive ? 'activated' : 'deactivated'}`)
      fetchBanners()
    } catch (error) {
      console.error('Error toggling banner:', error)
      toast.error('Failed to update banner')
    }
  }

  const handleReorder = async (banner: Banner, direction: 'up' | 'down') => {
    const sameType = banners.filter((b) => b.type === banner.type)
    const currentIndex = sameType.findIndex((b) => b.id === banner.id)
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= sameType.length) return

    const otherBanner = sameType[newIndex]

    try {
      await Promise.all([
        fetch(`/api/banners/${banner.id}`, {
          method: 'PUT',
          body: (() => {
            const fd = new FormData()
            fd.append('title', banner.title)
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

  const getLinkLabel = (banner: Banner): string => {
    if (banner.linkType === 'PRODUCT' && banner.linkProductSlug) {
      const p = products.find((x) => x.slug === banner.linkProductSlug)
      return `Product: ${p?.name || banner.linkProductSlug}`
    }
    if (banner.linkType === 'CATEGORY' && banner.linkCategorySlug) {
      const c = categories.find((x) => x.slug === banner.linkCategorySlug)
      return `Category: ${c?.name || banner.linkCategorySlug}`
    }
    if (banner.linkType === 'URL' && banner.link) return `URL: ${banner.link}`
    return '—'
  }

  const filteredBanners = banners.filter((b) => b.type === activeTab)
  const recommendedDims = type === 'HERO' ? HERO_DIMENSIONS : PROMO_DIMENSIONS

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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Banner Management</h1>
          <p className="text-gray-600 mt-1">Manage homepage hero slides and promotional banners</p>
        </div>
        <Button onClick={openAddForm} className="bg-[#743181] hover:bg-[#5a2a6e]">
          <Plus className="h-4 w-4 mr-2" />
          Add {activeTab === 'HERO' ? 'Hero' : 'Promo'} Banner
        </Button>
      </div>

      {/* Type tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit mb-6">
        <button
          onClick={() => setActiveTab('HERO')}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'HERO' ? 'bg-white shadow text-[#743181]' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Layout className="h-4 w-4 inline mr-2" />
          Hero Slides ({banners.filter((b) => b.type === 'HERO').length})
        </button>
        <button
          onClick={() => setActiveTab('PROMO')}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'PROMO' ? 'bg-white shadow text-[#743181]' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Tag className="h-4 w-4 inline mr-2" />
          Promo Banners ({banners.filter((b) => b.type === 'PROMO').length})
        </button>
      </div>

      {/* Dimension Guidelines */}
      <Card className="mb-8 border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">
                Recommended dimensions — {activeTab === 'HERO' ? 'Hero' : 'Promo'}
              </h3>
              <div className="grid md:grid-cols-2 gap-4 mt-2 text-sm text-blue-800">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  <span>
                    <strong>Desktop:</strong>{' '}
                    {activeTab === 'HERO'
                      ? `${HERO_DIMENSIONS.width} × ${HERO_DIMENSIONS.height} px (2.5:1)`
                      : `${PROMO_DIMENSIONS.width} × ${PROMO_DIMENSIONS.height} px (2:1)`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  <span>
                    <strong>Mobile:</strong> {MOBILE_DIMENSIONS.width} × {MOBILE_DIMENSIONS.height} px (1.5:1)
                  </span>
                </div>
              </div>
              <p className="text-xs text-blue-600 mt-2">PNG/JPG/WebP. Keep file size under 500KB.</p>
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
                <CardTitle>{editingBanner ? 'Edit Banner' : `Add New ${type === 'HERO' ? 'Hero' : 'Promo'} Banner`}</CardTitle>
                <CardDescription>
                  {type === 'HERO'
                    ? 'Full-width slider banner shown at the top of the homepage'
                    : 'Promotional banner shown below the hero slider'}
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Banner Type</label>
                <div className="flex gap-2">
                  {(['HERO', 'PROMO'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`flex-1 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        type === t
                          ? 'border-[#743181] bg-purple-50 text-[#743181]'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {t === 'HERO' ? (
                        <>
                          <Layout className="h-4 w-4 inline mr-2" />
                          Hero slide
                        </>
                      ) : (
                        <>
                          <Tag className="h-4 w-4 inline mr-2" />
                          Promo banner
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Banner Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={type === 'PROMO' ? 'e.g., Diwali Special Offer' : 'e.g., South Indian Sweets Collection'}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#743181] focus:border-transparent"
                  required
                />
              </div>

              {/* CTA Label (mainly for promo) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Call-to-action label (optional)
                </label>
                <input
                  type="text"
                  value={ctaLabel}
                  onChange={(e) => setCtaLabel(e.target.value)}
                  placeholder="e.g., Shop Now, Join Now, Explore"
                  maxLength={50}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#743181] focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Button label shown on the banner. Leave empty to make the whole banner clickable.
                </p>
              </div>

              {/* Link Target */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link target</label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {(
                    [
                      { value: 'PRODUCT', label: 'Product', icon: Package },
                      { value: 'CATEGORY', label: 'Category', icon: Tag },
                      { value: 'URL', label: 'Custom URL', icon: LinkIcon },
                    ] as const
                  ).map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setLinkType(value)}
                      className={`px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                        linkType === value
                          ? 'border-[#743181] bg-purple-50 text-[#743181]'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-4 w-4 inline mr-1.5" />
                      {label}
                    </button>
                  ))}
                </div>

                {linkType === 'PRODUCT' && (
                  <select
                    value={linkProductSlug}
                    onChange={(e) => setLinkProductSlug(e.target.value)}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#743181] focus:border-transparent"
                  >
                    <option value="">Select a product…</option>
                    {products.map((p) => (
                      <option key={p.slug} value={p.slug}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                )}

                {linkType === 'CATEGORY' && (
                  <select
                    value={linkCategorySlug}
                    onChange={(e) => setLinkCategorySlug(e.target.value)}
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#743181] focus:border-transparent"
                  >
                    <option value="">Select a category…</option>
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}

                {linkType === 'URL' && (
                  <>
                    <input
                      type="text"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder="/about or https://example.com"
                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#743181] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Must start with / or http(s)://</p>
                  </>
                )}
              </div>

              {/* Desktop Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    Desktop Image <span className="text-red-500">*</span>
                  </div>
                </label>
                <div className="text-xs text-gray-500 mb-2">
                  Recommended: {recommendedDims.width} × {recommendedDims.height} px
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
                      <p className="text-sm text-gray-500">Click to upload desktop image</p>
                      <p className="text-xs text-gray-400">
                        {recommendedDims.width} × {recommendedDims.height} px recommended
                      </p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleDesktopImageChange} />
                  </label>
                )}
              </div>

              {/* Mobile Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Mobile Image (Optional)
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
                    <input type="file" className="hidden" accept="image/*" onChange={handleMobileImageChange} />
                  </label>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  If not provided, the desktop image will be used for mobile devices.
                </p>
              </div>

              {/* Submit */}
              <div className="flex gap-3">
                <Button type="submit" disabled={submitting} className="bg-[#743181] hover:bg-[#5a2a6e]">
                  {submitting ? 'Saving…' : editingBanner ? 'Update Banner' : 'Create Banner'}
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
      {filteredBanners.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ImageIcon className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">
              No {activeTab === 'HERO' ? 'hero slides' : 'promo banners'} yet
            </h3>
            <p className="text-gray-500 mb-4">Add your first one to get started</p>
            <Button onClick={openAddForm} className="bg-[#743181] hover:bg-[#5a2a6e]">
              <Plus className="h-4 w-4 mr-2" />
              Add {activeTab === 'HERO' ? 'Hero' : 'Promo'} Banner
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBanners.map((banner, index) => (
            <Card key={banner.id} className={!banner.isActive ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="relative w-64 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    <Image src={banner.desktopImage} alt={banner.title} fill className="object-cover" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900">{banner.title}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <ExternalLink className="h-3.5 w-3.5" />
                          {getLinkLabel(banner)}
                        </p>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <Badge variant={banner.isActive ? 'default' : 'secondary'}>
                            {banner.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline" className="text-[#743181] border-purple-200">
                            {banner.type === 'HERO' ? 'Hero' : 'Promo'}
                          </Badge>
                          {banner.ctaLabel && (
                            <Badge variant="outline" className="text-emerald-700 border-emerald-200">
                              CTA: {banner.ctaLabel}
                            </Badge>
                          )}
                          {banner.mobileImage && (
                            <Badge variant="outline" className="text-blue-600 border-blue-200">
                              <Smartphone className="h-3 w-3 mr-1" />
                              Mobile
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
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
                            disabled={index === filteredBanners.length - 1}
                            className="h-6 w-6"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </div>

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

                        <Button variant="ghost" size="icon" onClick={() => handleEdit(banner)}>
                          <Edit className="h-4 w-4" />
                        </Button>

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
