'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getCurrentUser, isAuthenticated, logout } from '@/lib/api-client'
import { ClipboardList, Edit, LogOut, Mail, MapPin, Phone, Save, User, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  phoneNumber?: string
  address: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  })

  useEffect(() => {
    const loadProfile = async () => {
      if (!isAuthenticated()) {
        router.push('/login')
        return
      }

      const currentUser = getCurrentUser()
      if (!currentUser) {
        setLoading(false)
        return
      }

      try {
        // Fetch profile from API
        const response = await fetch('/api/profile', {
          headers: {
            'x-firebase-uid': currentUser.uid || '',
            'x-phone-number': currentUser.phoneNumber || ''
          }
        })

        if (response.ok) {
          const { profile } = await response.json()
          const mergedUser = {
            ...currentUser,
            ...profile,
            phone: profile.phone || currentUser.phone || currentUser.phoneNumber?.replace('+91', '') || ''
          }
          setUser(mergedUser)
          setFormData({
            name: profile.name || '',
            email: profile.email || '',
            phone: profile.phone || currentUser.phoneNumber?.replace('+91', '') || '',
            address: profile.address || ''
          })
          // Update localStorage with merged data
          localStorage.setItem('user', JSON.stringify(mergedUser))
          // Dispatch custom event to notify other components (like Header)
          window.dispatchEvent(new Event('userUpdated'))
        } else {
          // Use localStorage data if API fails (user not in DB yet)
          setUser(currentUser)
          setFormData({
            name: currentUser.name || '',
            email: currentUser.email || '',
            phone: currentUser.phone || currentUser.phoneNumber?.replace('+91', '') || '',
            address: currentUser.address || ''
          })
        }
      } catch (error) {
        console.error('Error loading profile:', error)
        // Fallback to localStorage on error
        setUser(currentUser)
        setFormData({
          name: currentUser.name || '',
          email: currentUser.email || '',
          phone: currentUser.phone || currentUser.phoneNumber?.replace('+91', '') || '',
          address: currentUser.address || ''
        })
      }

      setLoading(false)
    }

    loadProfile()
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const currentUser = getCurrentUser()
      if (!currentUser) {
        toast.error('User not authenticated')
        return
      }

      // Save to API
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-firebase-uid': currentUser.uid || '',
          'x-phone-number': currentUser.phoneNumber || ''
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          address: formData.address
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save profile')
      }

      const { profile } = await response.json()
      
      const updatedUser = { 
        ...currentUser,
        ...profile,
        phone: profile.phone || formData.phone,
        phoneNumber: profile.phoneNumber || currentUser.phoneNumber
      }
      
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      // Dispatch custom event to notify other components (like Header)
      window.dispatchEvent(new Event('userUpdated'))
      
      setUser(updatedUser as UserProfile)
      setEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-[#743181]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600 mt-1">Manage your account details</p>
            </div>
            <Link href="/profile/orders">
              <Button variant="outline" className="border-[#743181] text-[#743181] hover:bg-purple-50">
                <ClipboardList className="h-4 w-4 mr-2" />
                My Orders
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card className="md:col-span-2 border-none shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-[#743181]">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                {!editing ? (
                  <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={saving} className="bg-[#743181] hover:bg-[#5a2a6e]">
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {editing ? (
                  <>
                    <div className="space-y-2">
                      <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700">Full Name</label>
                      <Input
                        id="profile-name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="profile-email" className="block text-sm font-medium text-gray-700">Email</label>
                      <Input
                        id="profile-email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="profile-phone" className="block text-sm font-medium text-gray-700">Phone</label>
                      <div className="flex gap-2">
                        <div className="flex items-center justify-center bg-gray-100 rounded-xl px-4 font-medium text-gray-500">+91</div>
                        <Input
                          id="profile-phone"
                          name="phone"
                          value={formData.phone}
                          readOnly
                          disabled
                          placeholder="9876543210"
                          maxLength={10}
                          className="rounded-xl flex-1 bg-gray-100 cursor-not-allowed"
                        />
                      </div>
                      <p className="text-xs text-gray-500 italic">Phone number cannot be changed as it's linked to your account</p>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="profile-address" className="block text-sm font-medium text-gray-700">Address</label>
                      <Input
                        id="profile-address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Your address"
                        className="rounded-xl"
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="p-3 bg-white rounded-full shadow-sm">
                        <User className="h-5 w-5 text-[#743181]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase">Name</p>
                        <p className="text-gray-900 font-semibold">{user?.name || 'Not set'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="p-3 bg-white rounded-full shadow-sm">
                        <Mail className="h-5 w-5 text-[#743181]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase">Email</p>
                        <p className="text-gray-900 font-semibold">{user?.email || 'Not set'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="p-3 bg-white rounded-full shadow-sm">
                        <Phone className="h-5 w-5 text-[#743181]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase">Phone</p>
                        <p className="text-gray-900 font-semibold">{user?.phone ? `+91 ${user.phone}` : 'Not set'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="p-3 bg-white rounded-full shadow-sm">
                        <MapPin className="h-5 w-5 text-[#743181]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase">Address</p>
                        <p className="text-gray-900 font-semibold">{user?.address || 'Not set'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="space-y-4">
              <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#743181] to-[#5a2a6e] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold text-white">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-center text-gray-900">{user?.name || 'User'}</h3>
                  <p className="text-sm text-gray-500 text-center">{user?.email}</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardContent className="p-4 space-y-2">
                  <Link href="/profile/orders" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <ClipboardList className="h-5 w-5 text-[#743181]" />
                    <span className="font-medium text-gray-700">Order History</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition-colors w-full text-left"
                  >
                    <LogOut className="h-5 w-5 text-red-500" />
                    <span className="font-medium text-red-500">Logout</span>
                  </button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
