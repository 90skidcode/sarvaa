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
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600 mt-0.5 sm:mt-1 text-xs sm:text-base">Manage your account details</p>
            </div>
            <Link href="/profile/orders" className="w-full sm:w-auto">
              <Button variant="outline" className="border-[#743181] text-[#743181] hover:bg-purple-50 w-full sm:w-auto">
                <ClipboardList className="h-4 w-4 mr-2" />
                My Orders
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Profile Card */}
            <Card className="md:col-span-2 border-none shadow-lg">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-[#743181]">
                  <User className="h-4 sm:h-5 w-4 sm:w-5" />
                  <span className="text-lg sm:text-xl">Personal Information</span>
                </CardTitle>
                {!editing ? (
                  <Button variant="ghost" size="sm" onClick={() => setEditing(true)} className="w-full sm:w-auto">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="ghost" size="sm" onClick={() => setEditing(false)} className="flex-1 sm:flex-none">
                      <X className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Cancel</span>
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={saving} className="flex-1 sm:flex-none bg-[#743181] hover:bg-[#5a2a6e]">
                      <Save className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save'}</span>
                      <span className="sm:hidden">{saving ? '...' : 'Save'}</span>
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                {editing ? (
                  <>
                    <div className="space-y-1.5 sm:space-y-2">
                      <label htmlFor="profile-name" className="block text-xs sm:text-sm font-medium text-gray-700">Full Name</label>
                      <Input
                        id="profile-name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        className="rounded-lg sm:rounded-xl p-3 sm:p-4 text-sm h-10 sm:h-12"
                      />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <label htmlFor="profile-email" className="block text-xs sm:text-sm font-medium text-gray-700">Email</label>
                      <Input
                        id="profile-email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        className="rounded-lg sm:rounded-xl p-3 sm:p-4 text-sm h-10 sm:h-12"
                      />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <label htmlFor="profile-phone" className="block text-xs sm:text-sm font-medium text-gray-700">Phone</label>
                      <div className="flex gap-2">
                        <div className="flex items-center justify-center bg-gray-100 rounded-lg sm:rounded-xl px-2 sm:px-4 font-medium text-gray-500 text-sm">+91</div>
                        <Input
                          id="profile-phone"
                          name="phone"
                          value={formData.phone}
                          readOnly
                          disabled
                          placeholder="9876543210"
                          maxLength={10}
                          className="rounded-lg sm:rounded-xl p-3 sm:p-4 text-sm h-10 sm:h-12 flex-1 bg-gray-100 cursor-not-allowed"
                        />
                      </div>
                      <p className="text-[8px] sm:text-xs text-gray-500 italic">Phone number cannot be changed as it's linked to your account</p>
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <label htmlFor="profile-address" className="block text-xs sm:text-sm font-medium text-gray-700">Address</label>
                      <Input
                        id="profile-address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Your address"
                        className="rounded-lg sm:rounded-xl p-3 sm:p-4 text-sm h-10 sm:h-12"
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                      <div className="p-2 sm:p-3 bg-white rounded-full shadow-sm flex-shrink-0">
                        <User className="h-4 sm:h-5 w-4 sm:w-5 text-[#743181]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[8px] sm:text-xs text-gray-500 font-medium uppercase">Name</p>
                        <p className="text-sm sm:text-base text-gray-900 font-semibold truncate">{user?.name || 'Not set'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                      <div className="p-2 sm:p-3 bg-white rounded-full shadow-sm flex-shrink-0">
                        <Mail className="h-4 sm:h-5 w-4 sm:w-5 text-[#743181]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[8px] sm:text-xs text-gray-500 font-medium uppercase">Email</p>
                        <p className="text-sm sm:text-base text-gray-900 font-semibold truncate">{user?.email || 'Not set'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                      <div className="p-2 sm:p-3 bg-white rounded-full shadow-sm flex-shrink-0">
                        <Phone className="h-4 sm:h-5 w-4 sm:w-5 text-[#743181]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[8px] sm:text-xs text-gray-500 font-medium uppercase">Phone</p>
                        <p className="text-sm sm:text-base text-gray-900 font-semibold truncate">{user?.phone ? `+91 ${user.phone}` : 'Not set'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                      <div className="p-2 sm:p-3 bg-white rounded-full shadow-sm flex-shrink-0">
                        <MapPin className="h-4 sm:h-5 w-4 sm:w-5 text-[#743181]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[8px] sm:text-xs text-gray-500 font-medium uppercase">Address</p>
                        <p className="text-sm sm:text-base text-gray-900 font-semibold truncate">{user?.address || 'Not set'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="space-y-3 sm:space-y-4">
              <Card className="border-none shadow-lg">
                <CardContent className="p-4 sm:p-6">
                  <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-[#743181] to-[#5a2a6e] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <span className="text-2xl sm:text-3xl font-bold text-white">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-xl font-bold text-center text-gray-900 truncate">{user?.name || 'User'}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 text-center truncate">{user?.email}</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardContent className="p-3 sm:p-4 space-y-1.5">
                  <Link href="/profile/orders" className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors">
                    <ClipboardList className="h-4 sm:h-5 w-4 sm:w-5 text-[#743181] flex-shrink-0" />
                    <span className="font-medium text-gray-700 text-sm">Order History</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-red-50 transition-colors w-full text-left"
                  >
                    <LogOut className="h-4 sm:h-5 w-4 sm:w-5 text-red-500 flex-shrink-0" />
                    <span className="font-medium text-red-500 text-sm">Logout</span>
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
