'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    ArrowLeft,
    Calendar,
    Eye,
    Package,
    Phone,
    Search,
    User,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface CustomCakeOrder {
  id: string
  customerName: string
  phone: string
  email: string | null
  cakeImage: string
  images: string | null
  description: string | null
  status: string
  preferredDate: string | null
  storeId: string
  store: {
    id: string
    name: string
  }
  createdAt: string
}

export default function AdminCustomCakesPage() {
  const [orders, setOrders] = useState<CustomCakeOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [currentGalleryImage, setCurrentGalleryImage] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [statusFilter])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      let url = '/api/custom-cakes?'
      if (statusFilter !== 'all') {
        url += `status=${statusFilter}`
      }

      const response = await fetch(url)
      const data = await response.json()
      setOrders(Array.isArray(data.orders) ? data.orders : [])
    } catch (error) {
      console.error('Error fetching custom cake orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/custom-cakes/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        toast.success(`Request marked as ${status}`)
        fetchOrders()
      } else {
        toast.error('Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Something went wrong')
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      quoted: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const filteredOrders = orders.filter(order =>
    order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.phone.includes(searchQuery)
  )

  const selectedOrder = orders.find(o => o.id === selectedOrderId)

  useEffect(() => {
    if (selectedOrder) {
      setCurrentGalleryImage(selectedOrder.cakeImage)
    } else {
      setCurrentGalleryImage(null)
    }
  }, [selectedOrderId, selectedOrder])

  let content
  if (loading) {
    content = (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#B86E9F] mx-auto"></div>
        <p className="mt-4 text-gray-500 font-medium uppercase tracking-widest text-[10px]">Filtering Designs...</p>
      </div>
    )
  } else if (selectedOrderId && selectedOrder) {
    content = (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setSelectedOrderId(null)}
          className="text-gray-400 hover:text-[#743181] font-bold -ml-2 transition-all hover:translate-x-[-4px]"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          BACK TO DECORATIONS
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          <Card className="lg:col-span-6 border-none shadow-[0_10px_40px_rgba(0,0,0,0.04)] rounded-[2rem] overflow-hidden bg-white">
            <div className="flex flex-col h-full">
              <div className="aspect-square relative bg-gray-50 group flex-grow">
                <img 
                  src={currentGalleryImage || selectedOrder.cakeImage} 
                  alt="Cake Design" 
                  className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute top-6 right-6">
                  <Badge className={`${getStatusColor(selectedOrder.status)} text-[10px] font-black uppercase px-4 py-1.5 rounded-full border-none shadow-lg tracking-widest`}>
                    {selectedOrder.status}
                  </Badge>
                </div>
                
                {(() => {
                  const allImages = selectedOrder.images ? JSON.parse(selectedOrder.images) : [selectedOrder.cakeImage];
                  if (allImages.length <= 1) return null;
                  
                  return (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 p-3 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl overflow-x-auto max-w-[90%]">
                      {allImages.map((img: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentGalleryImage(img)}
                          className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                            currentGalleryImage === img ? 'border-[#743181] scale-110 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          </Card>

          <div className="lg:col-span-4 space-y-6">
            <Card className="border-none shadow-[0_10px_40px_rgba(0,0,0,0.04)] rounded-[2rem] bg-white p-8">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-6">Customer Requirements</h3>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-[#743181]">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Customer</p>
                    <p className="font-bold text-gray-900">{selectedOrder.customerName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Phone</p>
                    <p className="font-bold text-gray-900">{selectedOrder.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Pickup Date</p>
                    <p className="font-bold text-gray-900">
                      {selectedOrder.preferredDate ? new Date(selectedOrder.preferredDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : 'ASAP'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Branch Location</p>
                    <p className="font-bold text-gray-900">{selectedOrder.store.name}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100/80">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Instructions</p>
                <p className="text-sm font-bold text-gray-700 leading-relaxed italic">
                  "{selectedOrder.description || 'No special instructions provided'}"
                </p>
              </div>

              <div className="mt-10 space-y-3">
                 <div className="grid grid-cols-2 gap-3">
                    <Button 
                      disabled={selectedOrder.status !== 'pending'}
                      onClick={() => updateStatus(selectedOrder.id, 'quoted')}
                      className="rounded-2xl h-14 font-black text-[10px] uppercase tracking-widest bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100"
                    >
                       Send Quote
                    </Button>
                    <Button 
                      disabled={['cancelled', 'confirmed'].includes(selectedOrder.status)}
                      onClick={() => updateStatus(selectedOrder.id, 'confirmed')}
                      className="rounded-2xl h-14 font-black text-[10px] uppercase tracking-widest bg-green-600 hover:bg-green-700 shadow-lg shadow-green-100"
                    >
                       Confirm
                    </Button>
                 </div>
                 <Button 
                    variant="ghost"
                    onClick={() => updateStatus(selectedOrder.id, 'cancelled')}
                    className="w-full h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest text-red-500 hover:bg-red-50"
                 >
                    Reject Request
                 </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  } else {
    content = (
      <Card className="border-none shadow-xl shadow-gray-100/50 rounded-2xl overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-none h-12">
              <TableHead className="pl-6 text-[10px] font-black uppercase tracking-widest text-[#743181]">PREVIEW</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">STATUS</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-400">CUSTOMER</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-400">BRANCH</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-400">PICKUP DATE</TableHead>
              <TableHead className="text-right pr-6 text-[10px] font-black uppercase tracking-widest text-gray-400">ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-20 text-gray-400 font-bold uppercase tracking-widest text-xs">No cake requests found</TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow 
                  key={order.id} 
                  className="group cursor-pointer hover:bg-purple-50/30 border-b border-gray-50 transition-all duration-300 h-20"
                  onClick={() => setSelectedOrderId(order.id)}
                >
                  <TableCell className="pl-6">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 shadow-sm">
                      <img src={order.cakeImage} alt="Cake" className="w-full h-full object-cover" />
                    </div>
                  </TableCell>
                   <TableCell className="text-center">
                    <Badge className={`${getStatusColor(order.status)} rounded-full px-2 py-0.5 font-black text-[9px] uppercase shadow-sm border-none`}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col leading-tight">
                      <span className="font-black text-gray-800 tracking-tighter group-hover:text-[#743181] transition-colors">{order.customerName}</span>
                      <span className="text-[10px] font-bold text-gray-400">{order.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-gray-700 text-[11px] uppercase tracking-tight">
                      {order.store?.name || 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-gray-500 uppercase tracking-tighter">
                    {order.preferredDate ? new Date(order.preferredDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'ASAP'}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#743181] hover:bg-white rounded-full h-8 w-8 p-0 border border-transparent hover:border-purple-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrderId(order.id);
                      }}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    )
  }

  return (
    <div className="space-y-4 font-outfit">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">
            {selectedOrder ? 'Cake Request Review' : 'Custom Cake Orders'}
          </h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none">
            {selectedOrder ? `ID: ${selectedOrder.id}` : 'Review and quote custom designs'}
          </p>
        </div>
      </div>

      {!selectedOrderId && (
        <Card className="border-none shadow-sm bg-gray-50/50">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search customer or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'pending', label: 'Pending' },
                  { id: 'quoted', label: 'Quoted' },
                  { id: 'confirmed', label: 'Confirmed' },
                  { id: 'cancelled', label: 'Cancelled' }
                ].map((s) => (
                  <Button
                    key={s.id}
                    variant={statusFilter === s.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter(s.id)}
                    className={`rounded-full px-4 h-8 text-[11px] font-bold uppercase tracking-wider ${
                      statusFilter === s.id ? 'bg-[#743181] hover:bg-[#B86E9F]' : ''
                    }`}
                  >
                    {s.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {content}
    </div>
  )
}
