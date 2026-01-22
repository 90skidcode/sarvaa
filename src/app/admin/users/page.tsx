'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Calendar, Mail, MapPin, Phone, User } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface User {
  id: string
  name: string | null
  email: string
  phone: string | null
  address: string | null
  role: string
  createdAt: string
}

export default function UsersAdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin" className="inline-flex items-center text-[#743181] hover:text-[#5a2a6e] font-medium mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Users</h1>
              <p className="text-gray-600 mt-2">Manage registered users</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-[#743181]">{users.length}</p>
            </div>
          </div>
        </div>

        {/* Users List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading users...</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {users.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-br from-[#743181] to-[#5a2a6e] rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      
                      {/* User Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {user.name || 'No Name'}
                          </h3>
                          <Badge 
                            variant={user.role === 'admin' ? 'default' : 'outline'}
                            className={user.role === 'admin' ? 'bg-[#743181]' : ''}
                          >
                            {user.role}
                          </Badge>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-2 mt-3">
                          {user.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="h-4 w-4" />
                              <span>{user.email}</span>
                            </div>
                          )}
                          
                          {user.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="h-4 w-4" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                          
                          {user.address && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="h-4 w-4" />
                              <span className="truncate">{user.address}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>Joined {formatDate(user.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && users.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No users found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
