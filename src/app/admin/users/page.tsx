'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, Edit, Loader2, Mail, MapPin, Phone, Search, Trash2, User, UserPlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface User {
  id: string
  name: string | null
  email: string
  phone: string | null
  address: string | null
  role: string
  storeId: string | null
  store: {
    id: string
    name: string
  } | null
  createdAt: string
}

export default function UsersAdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // New/Edit User Form State
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: 'admin',
    storeId: ''
  })
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    storeId: ''
  })

  const [stores, setStores] = useState<any[]>([])

  useEffect(() => {
    fetchUsers()
    fetchStores()
  }, [])

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/stores?activeOnly=true')
      const data = await response.json()
      setStores(Array.isArray(data.stores) ? data.stores : [])
    } catch (error) {
      console.error('Error fetching stores:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users')
      const data = await response.json()
      // Filter only staff/admins
      const staff = (Array.isArray(data) ? data : []).filter(u => u.role === 'admin')
      setUsers(staff)
    } catch (error) {
      console.error('Error fetching staff:', error)
      toast.error('Failed to load staff directory')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // If storeId is empty string, send null for "All Branches"
      const payload = {
        ...newUser,
        role: 'admin',
        storeId: newUser.storeId === '' || newUser.storeId === 'all' ? null : newUser.storeId
      }

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create staff account')
      }
      
      toast.success('Staff account created successfully')
      setIsCreateOpen(false)
      fetchUsers()
      setNewUser({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        role: 'admin',
        storeId: ''
      })
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditClick = (user: User) => {
    setEditingUser(user)
    setEditFormData({
      name: user.name || '',
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      storeId: user.storeId || ''
    })
    setIsEditOpen(true)
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    setIsSubmitting(true)

    try {
      const payload = {
        ...editFormData,
        storeId: editFormData.storeId === '' || editFormData.storeId === 'all' ? null : editFormData.storeId
      }

      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user')
      }

      toast.success('Staff details updated successfully')
      setIsEditOpen(false)
      fetchUsers()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete staff member')
      }
      
      toast.success('Staff member removed successfully')
      fetchUsers()
    } catch (error) {
      toast.error('Error removing staff member')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone?.includes(searchQuery)
  )

  return (
    <div className="space-y-8 font-outfit">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">Staff Access</h2>
          <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Directory of Administrative Personnel</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 w-64 rounded-xl border-white/80 bg-white/50 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-purple-100 transition-all font-bold"
            />
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="h-11 px-6 rounded-xl bg-gradient-to-br from-[#743181] to-[#B86E9F] text-white font-black uppercase tracking-widest shadow-lg shadow-purple-100 transition-all hover:translate-y-[-2px] active:translate-y-[0px]">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden font-outfit">
              <DialogHeader className="bg-gradient-to-br from-[#743181] to-[#B86E9F] p-8 text-white">
                <DialogTitle className="text-2xl font-black uppercase tracking-tight">Register Staff</DialogTitle>
                <DialogDescription className="text-white/70 font-bold text-[10px] uppercase tracking-widest">
                  Fill in the details to add a new administrative account.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="p-8 space-y-4">
                <div className="space-y-1">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Staff Name</Label>
                  <Input
                    placeholder="Gandhi S"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    required
                    className="rounded-xl border-gray-100 bg-gray-50/50 font-bold"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Work Email</Label>
                  <Input
                    type="email"
                    placeholder="gandhi@sarvaasweets.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    required
                    className="rounded-xl border-gray-100 bg-gray-50/50 font-bold"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Terminal Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    required
                    className="rounded-xl border-gray-100 bg-gray-50/50 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Assigned Branch</Label>
                  <select
                    value={newUser.storeId}
                    onChange={(e) => setNewUser({...newUser, storeId: e.target.value})}
                    className="w-full h-10 px-3 rounded-xl border border-gray-100 bg-gray-50/50 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-purple-100"
                  >
                    <option value="">All Branches</option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Contact Phone</Label>
                  <Input
                    placeholder="9123456789"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    className="rounded-xl border-gray-100 bg-gray-50/50 font-bold"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Residence Address</Label>
                  <Input
                    placeholder="123, Street, City"
                    value={newUser.address}
                    onChange={(e) => setNewUser({...newUser, address: e.target.value})}
                    className="rounded-xl border-gray-100 bg-gray-50/50 font-bold"
                  />
                </div>
                
                <DialogFooter className="pt-4 gap-2">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setIsCreateOpen(false)}
                    className="rounded-xl font-black text-[10px] uppercase tracking-widest"
                  >
                    DISCARD
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 rounded-xl bg-[#743181] hover:bg-[#5a2a6e] text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-purple-100"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'CREATE ACCOUNT'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit Staff Dialog */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent className="sm:max-w-md rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden font-outfit">
              <DialogHeader className="bg-gradient-to-br from-[#743181] to-[#B86E9F] p-8 text-white">
                <DialogTitle className="text-2xl font-black uppercase tracking-tight">Update Staff</DialogTitle>
                <DialogDescription className="text-white/70 font-bold text-[10px] uppercase tracking-widest">
                  Modify the details for {editingUser?.name}.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateUser} className="p-8 space-y-4">
                <div className="space-y-1">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Staff Name</Label>
                  <Input
                    placeholder="Gandhi S"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                    required
                    className="rounded-xl border-gray-100 bg-gray-50/50 font-bold"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Work Email</Label>
                  <Input
                    type="email"
                    placeholder="gandhi@sarvaasweets.com"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                    required
                    className="rounded-xl border-gray-100 bg-gray-50/50 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Assigned Branch</Label>
                  <select
                    value={editFormData.storeId}
                    onChange={(e) => setEditFormData({...editFormData, storeId: e.target.value})}
                    className="w-full h-10 px-3 rounded-xl border border-gray-100 bg-gray-50/50 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-purple-100"
                  >
                    <option value="">All Branches</option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Contact Phone</Label>
                  <Input
                    placeholder="9123456789"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                    className="rounded-xl border-gray-100 bg-gray-50/50 font-bold"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Residence Address</Label>
                  <Input
                    placeholder="123, Street, City"
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                    className="rounded-xl border-gray-100 bg-gray-50/50 font-bold"
                  />
                </div>
                
                <DialogFooter className="pt-4 gap-2">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setIsEditOpen(false)}
                    className="rounded-xl font-black text-[10px] uppercase tracking-widest"
                  >
                    CANCEL
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 rounded-xl bg-[#743181] hover:bg-[#5a2a6e] text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-purple-100"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'UPDATE DETAILS'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/40 backdrop-blur-sm rounded-[2.5rem] border border-white/60">
          <Loader2 className="h-10 w-10 text-[#743181] animate-spin mb-4" />
          <p className="text-gray-400 font-extrabold uppercase tracking-[0.3em] text-[10px]">Accessing Database...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-20 bg-white/40 backdrop-blur-sm rounded-[2.5rem] border border-white/60">
               <User className="h-12 w-12 text-gray-200 mx-auto mb-4" />
               <p className="text-gray-400 font-extrabold uppercase tracking-[0.3em] text-[10px]">No matches found in directory</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <Card key={user.id} className="border-none shadow-[0_10px_30px_rgba(0,0,0,0.02)] rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-md transition-all hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] hover:translate-y-[-2px] group">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex gap-6 items-center">
                      {/* Avatar */}
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-50 to-pink-50 rounded-[1.5rem] flex items-center justify-center border border-purple-100/50 shadow-inner group-hover:scale-110 transition-transform duration-500">
                        <User className="h-8 w-8 text-[#743181]" />
                      </div>
                      
                      {/* User Info */}
                      <div>
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-xl font-black text-gray-900 tracking-tight">
                            {user.name || 'Anonymous User'}
                          </h3>
                          <div className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm
                            ${user.role === 'admin' 
                              ? 'bg-purple-50 text-[#743181] border-purple-100' 
                              : 'bg-gray-50 text-gray-400 border-gray-100'}
                          `}>
                            {user.role}
                          </div>
                          <div className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm
                            ${user.storeId 
                              ? 'bg-blue-50 text-blue-700 border-blue-100' 
                              : 'bg-green-50 text-green-700 border-green-100'}
                          `}>
                            {user.store?.name || 'All Branches'}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-x-8 gap-y-2">
                          {user.email && (
                            <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400">
                              <Mail className="h-4 w-4 text-[#743181]/40" />
                              <span className="text-gray-600">{user.email}</span>
                            </div>
                          )}
                          
                          {user.phone && (
                            <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400">
                              <Phone className="h-4 w-4 text-[#743181]/40" />
                              <span className="text-gray-600">{user.phone}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400">
                            <Calendar className="h-4 w-4 text-[#743181]/40" />
                            <span>Member since <span className="text-gray-600">{formatDate(user.createdAt)}</span></span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                       {user.address && (
                        <div className="hidden lg:flex items-center gap-3 px-6 py-3 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 max-w-sm">
                          <MapPin className="h-4 w-4 text-gray-300 shrink-0" />
                          <span className="text-[10px] font-bold text-gray-500 leading-snug">{user.address}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                         <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditClick(user)}
                          className="h-12 w-12 rounded-2xl text-gray-400 hover:text-[#743181] hover:bg-purple-50 transition-all font-bold"
                          title="Edit Staff"
                        >
                          <Edit className="h-5 w-5" />
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteUser(user.id)}
                          className="h-12 w-12 rounded-2xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                          title="Remove User"
                          disabled={user.role === 'admin' && user.email === 'admin@sarvaasweets.com'}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )))}
        </div>
      )}
    </div>
  )
}
