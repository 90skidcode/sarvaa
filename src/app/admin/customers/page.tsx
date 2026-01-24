'use client'

import { Badge } from '@/components/ui/badge'
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
import { Calendar, Loader2, Mail, MapPin, Phone, Search, Smartphone, Trash2, User, UserPlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface CustomerProfile {
  id: string
  firebaseUid: string
  phoneNumber: string
  phone: string | null
  name: string | null
  email: string | null
  address: string | null
  createdAt: string
}

export default function CustomersAdminPage() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // New Customer Form State
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: ''
  })

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/customers')
      const data = await response.json()
      setCustomers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching customers:', error)
      toast.error('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Ensure phone number starts with +91 if not provided
    const formattedPhone = newCustomer.phoneNumber.startsWith('+') 
      ? newCustomer.phoneNumber 
      : `+91${newCustomer.phoneNumber}`

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newCustomer,
          phoneNumber: formattedPhone
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create customer profile')
      }
      
      toast.success('Customer profile created')
      setIsCreateOpen(false)
      fetchCustomers()
      setNewCustomer({
        name: '',
        email: '',
        phoneNumber: '',
        address: ''
      })
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer profile?')) return

    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete profile')
      }
      
      toast.success('Customer profile removed')
      fetchCustomers()
    } catch (error) {
      toast.error('Error deleting profile')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredCustomers = customers.filter(customer => 
    customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phoneNumber.includes(searchQuery) ||
    customer.phone?.includes(searchQuery)
  )

  return (
    <div className="space-y-8 font-outfit">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">Customer Database</h2>
          <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Direct Connection to UserProfile Table</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 w-64 rounded-xl border-white/80 bg-white/50 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-purple-100 transition-all font-bold"
            />
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="h-11 px-6 rounded-xl bg-gradient-to-br from-[#743181] to-[#B86E9F] text-white font-black uppercase tracking-widest shadow-lg shadow-purple-100 transition-all hover:translate-y-[-2px] active:translate-y-[0px]">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden font-outfit">
              <DialogHeader className="bg-gradient-to-br from-[#743181] to-[#B86E9F] p-8 text-white">
                <DialogTitle className="text-2xl font-black uppercase tracking-tight">New Customer Profile</DialogTitle>
                <DialogDescription className="text-white/70 font-bold text-[10px] uppercase tracking-widest">
                  Directly insert a record into the UserProfile table.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateCustomer} className="p-8 space-y-4">
                <div className="space-y-1">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Profile Name</Label>
                  <Input
                    placeholder="Lakshmi Priya"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                    required
                    className="rounded-xl border-gray-100 bg-gray-50/50 font-bold"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Email Address (Optional)</Label>
                  <Input
                    type="email"
                    placeholder="customer@example.com"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                    className="rounded-xl border-gray-100 bg-gray-50/50 font-bold"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Primary Phone (+91)</Label>
                  <div className="flex gap-3">
                    <div className="flex items-center justify-center bg-gray-50 border border-gray-100 rounded-xl px-4 font-bold text-gray-500 text-xs">
                        +91
                    </div>
                    <Input
                      placeholder="9876543210"
                      value={newCustomer.phoneNumber}
                      onChange={(e) => setNewCustomer({...newCustomer, phoneNumber: e.target.value})}
                      required
                      className="flex-1 rounded-xl border-gray-100 bg-gray-50/50 font-bold"
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Saved Address</Label>
                  <Input
                    placeholder="45, Anna Salai, Madurai"
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
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
                    CANCEL
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 rounded-xl bg-[#743181] hover:bg-[#5a2a6e] text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-purple-100"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'SAVE TO DATABASE'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Customers List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/40 backdrop-blur-sm rounded-[2.5rem] border border-white/60">
          <Loader2 className="h-10 w-10 text-[#743181] animate-spin mb-4" />
          <p className="text-gray-400 font-extrabold uppercase tracking-[0.3em] text-[10px]">Querying UserProfile Table...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-20 bg-white/40 backdrop-blur-sm rounded-[2.5rem] border border-white/60">
               <User className="h-12 w-12 text-gray-200 mx-auto mb-4" />
               <p className="text-gray-400 font-extrabold uppercase tracking-[0.3em] text-[10px]">No matches found in directory</p>
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <Card key={customer.id} className="border-none shadow-[0_10px_30px_rgba(0,0,0,0.02)] rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-md transition-all hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] hover:translate-y-[-2px] group">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex gap-6 items-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[1.5rem] flex items-center justify-center border border-blue-100/50 shadow-inner group-hover:scale-110 transition-transform duration-500 shrink-0">
                        {customer.firebaseUid.includes('admin') ? <User className="h-8 w-8 text-blue-600" /> : <Smartphone className="h-8 w-8 text-indigo-600" />}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-xl font-black text-gray-900 tracking-tight">
                            {customer.name || 'Anonymous Customer'}
                          </h3>
                          <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-indigo-100 bg-indigo-50/30 text-indigo-400">
                             {customer.firebaseUid.includes('admin') ? 'Manual' : 'Phone Auth'}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-x-8 gap-y-2">
                          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400">
                            <Phone className="h-4 w-4 text-blue-300" />
                            <span className="text-gray-600">{customer.phoneNumber}</span>
                          </div>
                          
                          {customer.email && (
                            <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400">
                              <Mail className="h-4 w-4 text-blue-300" />
                              <span className="text-gray-600">{customer.email}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400">
                            <Calendar className="h-4 w-4 text-blue-300" />
                            <span>Linked <span className="text-gray-600">{formatDate(customer.createdAt)}</span></span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                       {customer.address && (
                        <div className="hidden lg:flex items-center gap-3 px-6 py-3 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 max-w-sm">
                          <MapPin className="h-4 w-4 text-gray-300 shrink-0" />
                          <span className="text-[10px] font-bold text-gray-500 leading-snug">{customer.address}</span>
                        </div>
                      )}
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteCustomer(customer.id)}
                        className="h-12 w-12 rounded-2xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                        title="Delete Profile"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
