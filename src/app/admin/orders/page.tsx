'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { getCurrentUser } from '@/lib/api-client'
import { generateInvoice } from '@/lib/invoice'
import {
    ArrowLeft,
    Check,
    CheckCircle2,
    ClipboardList,
    Clock,
    Download,
    Eye,
    Package,
    Search
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface Order {
  id: string
  orderNumber: string
  status: string
  total: number
  phone: string
  address: string
  name: string | null
  email: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  statusHistory: {
    status: string
    createdAt: string
  }[]
  user: {
    id: string
    name: string
    email: string
  } | null
  items: {
    id: string
    quantity: number
    price: number
    product: {
      id: string
      name: string
      image: string
    }
  }[]
  store?: {
    id: string
    name: string
  } | null
}

interface Store {
  id: string
  name: string
  isActive: boolean
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [storeFilter, setStoreFilter] = useState('all')
  const [stores, setStores] = useState<Store[]>([])
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  useEffect(() => {
    const user = getCurrentUser()
    if (user?.storeId) {
      setStoreFilter(user.storeId)
    }
    fetchOrders()
  }, [statusFilter, storeFilter])

  useEffect(() => {
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

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const user = getCurrentUser()
      let url = '/api/orders?limit=100'
      
      if (statusFilter !== 'all') {
        url += `&status=${statusFilter}`
      }
      
      // If user is restricted to a store, always filter by that store
      // otherwise use the storeFilter from UI
      const effectiveStoreId = user?.storeId || storeFilter
      if (effectiveStoreId !== 'all') {
        url += `&storeId=${effectiveStoreId}`
      }

      const response = await fetch(url)
      const data = await response.json()
      setOrders(Array.isArray(data.orders) ? data.orders : [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        toast.success(`Order ${status} updated`)
        fetchOrders()
      } else {
        toast.error('Failed to update status')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Something went wrong')
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      ready: 'bg-green-100 text-green-800',
      delivered: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const filteredOrders = orders.filter(order =>
    order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (order.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (order.user?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (order.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (order.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length
  }

  const selectedOrder = orders.find(o => o.id === selectedOrderId)

  return (
    <div className="space-y-4">
      {/* Page Title Extra Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">
            {selectedOrder ? `ORDER ${selectedOrder.orderNumber}` : 'ORDERS MANAGEMENT'}
          </h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none">
            {selectedOrder ? 'Fulfillment view' : 'Track and manage flows'}
          </p>
        </div>
      </div>

      {/* Filters Bar - Only show in list view */}
      {!selectedOrderId && (
        <Card className="border-none shadow-sm bg-gray-50/50">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 rounded-xl"
                />
              </div>

              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <Select
                  value={storeFilter}
                  onValueChange={setStoreFilter}
                  disabled={!!getCurrentUser()?.storeId}
                >
                  <SelectTrigger className="w-full md:w-[180px] h-10 rounded-xl bg-white border-gray-200">
                    <SelectValue placeholder="All Branches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    {stores.map((store) => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'pending', label: 'Pending' },
                  { id: 'confirmed', label: 'Confirmed' },
                  { id: 'preparing', label: 'Preparing' },
                  { id: 'ready', label: 'Ready' },
                  { id: 'delivered', label: 'Delivered' }
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
                    {s.label} ({statusCounts[s.id as keyof typeof statusCounts]})
                  </Button>
                ))}
              </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Area */}
      {(() => {
        if (loading) {
          return (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#B86E9F] mx-auto"></div>
              <p className="mt-4 text-gray-500 font-medium uppercase tracking-widest text-[10px]">Syncing Data...</p>
            </div>
          )
        }

        if (selectedOrderId && selectedOrder) {
          // Redesigned Detailed View
          return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 font-outfit">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedOrderId(null)}
                className="text-gray-400 hover:text-[#743181] font-bold -ml-2 transition-all hover:translate-x-[-4px]"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                BACK TO LISTING
              </Button>
              
              <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                {/* LEFT PANEL: The "Ticket" (70%) */}
                <Card className="lg:col-span-7 border-none shadow-[0_10px_40px_rgba(0,0,0,0.04)] rounded-[2rem] overflow-hidden bg-white">
                  <CardContent className="p-10 flex flex-col h-full min-h-[600px]">
                    
                    {/* Header Group */}
                    <div className="mb-10">
                      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                          {selectedOrder.user?.name || selectedOrder.name || 'Guest User'}
                        </h1>
                        {selectedOrder.store && (
                          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-purple-50 text-[#743181] text-[11px] font-black uppercase tracking-widest border border-purple-100/50 shadow-sm">
                            {selectedOrder.store.name}
                          </div>
                        )}
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-8 text-sm">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Delivery / Pickup Address</p>
                          <p className="font-bold text-gray-700 leading-relaxed max-w-sm">
                            {selectedOrder.address}
                          </p>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Contact Channels</p>
                            <div className="flex flex-col gap-1">
                              <p className="font-bold text-gray-800">
                                <span className="text-gray-400 font-medium mr-2">Email:</span>
                                {selectedOrder.user?.email || selectedOrder.email || 'No email provided'}
                              </p>
                              <p className="font-bold text-[#743181]">
                                <span className="text-gray-400 font-medium mr-2">Phone:</span>
                                {selectedOrder.phone}
                              </p>
                            </div>
                          </div>
                          {selectedOrder.notes && (
                            <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Order Notes</p>
                              <p className="text-gray-600 font-medium italic text-xs">"{selectedOrder.notes}"</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Item List */}
                    <div className="flex-grow border-y border-gray-100 py-8 my-4">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Package Contents</h4>
                      <div className="space-y-4">
                        {selectedOrder.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-6 group transition-all">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex-shrink-0">
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-black text-gray-900 text-base">{item.product.name}</h4>
                              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                                Qty: <span className="text-[#B86E9F]">{item.quantity}</span> × ₹{item.price.toFixed(0)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-black text-gray-900 text-lg">₹{(item.quantity * item.price).toFixed(0)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Total Section */}
                    <div className="mt-auto pt-6 flex justify-between items-end">
                      <div>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">Total Revenue</p>
                        <div className="flex items-baseline gap-2">
                           <span className="text-5xl font-black text-[#743181] tracking-tighter">₹{selectedOrder.total.toFixed(0)}</span>
                           <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Gst Inclusive</span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 px-6 py-4 rounded-3xl border border-dashed border-gray-200">
                         <div className="flex items-center gap-3">
                            <ClipboardList className="h-5 w-5 text-gray-400" />
                            <div>
                               <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Order Number</p>
                               <p className="font-black text-gray-700 text-lg leading-none mt-1">{selectedOrder.orderNumber}</p>
                            </div>
                         </div>
                      </div>
                    </div>

                  </CardContent>
                </Card>

                {/* RIGHT PANEL: Sidebar (30%) */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Status Timeline Card */}
                  <Card className="border-none shadow-[0_10px_40px_rgba(0,0,0,0.04)] rounded-[2rem] overflow-hidden bg-white h-full flex flex-col">
                    <CardContent className="p-8 flex flex-col h-full">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-10">Fulfillment Status</h4>
                      
                      <div className="flex-grow">
                        <div className="relative space-y-8">
                          {/* Vertical Line */}
                          <div className="absolute left-[11px] top-2 bottom-6 w-[2px] bg-gray-100"></div>

                          {(() => {
                            const steps = [
                              { id: 'pending', label: 'Ordered', icon: Clock },
                              { id: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
                              { id: 'preparing', label: 'Preparing', icon: Package },
                              { id: 'ready', label: 'Ready', icon: CheckCircle2 },
                              { id: 'delivered', label: 'Delivered', icon: CheckCircle2 }
                            ]

                            const currentIdx = steps.findIndex(s => s.id === selectedOrder.status)

                            return steps.map((step, idx) => {
                              const isCompleted = currentIdx >= idx
                              const isCurrent = currentIdx === idx
                              const logTime = step.id === 'pending' 
                                ? selectedOrder.createdAt 
                                : selectedOrder.statusHistory?.find(h => h.status === step.id)?.createdAt

                              return (
                                <div key={step.id} className={`relative pl-10 group`}>
                                  {/* Step Dot */}
                                  <div className={`
                                    absolute left-0 top-0 w-6 h-6 rounded-full border-2 bg-white z-10 
                                    flex items-center justify-center transition-all duration-500
                                    ${isCompleted ? 'border-[#743181] bg-[#743181] text-white shadow-lg' : 'border-gray-200'}
                                    ${isCurrent ? 'ring-4 ring-purple-100 scale-110' : ''}
                                  `}>
                                    {isCompleted && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
                                  </div>

                                  <div className="flex flex-col">
                                    <h4 className={`
                                      text-sm font-black uppercase tracking-wider transition-colors duration-500
                                      ${isCompleted ? 'text-[#743181]' : 'text-gray-400'}
                                      ${isCurrent ? 'text-gray-900 underline decoration-[#B86E9F] decoration-2 underline-offset-4' : ''}
                                    `}>
                                      {step.label}
                                    </h4>
                                    <p className="text-[10px] font-bold text-gray-400 mt-1">
                                      {logTime 
                                        ? `${new Date(logTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}, ${new Date(logTime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`
                                        : (idx === 0 ? '-' : 'Pending')}
                                    </p>
                                  </div>
                                </div>
                              )
                            })
                          })()}
                        </div>
                      </div>

                      {/* Actions Group */}
                      <div className="mt-12 space-y-3">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-4">Operations</p>
                        
                        <div className="space-y-2">
                          <Button
                            className={`w-full py-6 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg transition-all
                              ${selectedOrder.status === 'pending' || selectedOrder.status === 'cancelled'
                                ? 'bg-gradient-to-r from-[#743181] to-[#B86E9F] hover:opacity-90' 
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                            `}
                            onClick={() => updateOrderStatus(selectedOrder.id, 'confirmed')}
                            disabled={selectedOrder.status !== 'pending'}
                          >
                            {selectedOrder.status === 'pending' ? 'Confirm Order' : 'Confirmed'}
                          </Button>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              className="py-6 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 hover:bg-purple-50 transition-all"
                              onClick={() => updateOrderStatus(selectedOrder.id, 'ready')}
                              disabled={['ready', 'delivered', 'cancelled', 'pending'].includes(selectedOrder.status)}
                            >
                              Mark Ready
                            </Button>
                            <Button
                              variant="outline"
                              className="py-6 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 hover:bg-green-50 hover:text-green-600 transition-all"
                              onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}
                              disabled={selectedOrder.status !== 'ready'}
                            >
                              Deliver
                            </Button>
                          </div>

                          <Button
                            variant="outline"
                            className="w-full py-6 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 hover:bg-purple-50 transition-all mb-2"
                            onClick={() => generateInvoice(selectedOrder)}
                          >
                            <Download className="h-4 w-4 mr-2" /> Download Invoice
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-red-400 hover:text-red-500 hover:bg-red-50 font-bold text-[10px] uppercase tracking-widest mt-4"
                            onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                            disabled={['delivered', 'cancelled'].includes(selectedOrder.status)}
                          >
                            Cancel Fulfillment
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )
        }

        if (filteredOrders.length === 0) {
          return (
            <Card className="border-none shadow-sm rounded-[2rem] bg-gray-50/30">
              <CardContent className="py-24 text-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
                  <ClipboardList className="h-8 w-8 text-gray-300" />
                </div>
                <h2 className="text-xl font-bold text-gray-400 tracking-tight mb-2">No Records Found</h2>
                <p className="text-sm text-gray-400 font-medium">
                  We couldn't find any orders matching your current criteria.
                </p>
              </CardContent>
            </Card>
          )
        }

        return (
          <Card className="border-none shadow-xl shadow-gray-100/50 rounded-2xl overflow-hidden bg-white">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-none h-12">
                  <TableHead className="pl-6 text-[10px] font-black uppercase tracking-widest text-[#743181]">ORDER ID</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">STATUS</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-400">BRANCH</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-400">CUSTOMER</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-400">DATE</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-400">TOTAL</TableHead>
                  <TableHead className="text-right pr-6 text-[10px] font-black uppercase tracking-widest text-gray-400">ACTION</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow 
                    key={order.id} 
                    className="group cursor-pointer hover:bg-purple-50/30 border-b border-gray-50 transition-all duration-300 h-16"
                    onClick={() => setSelectedOrderId(order.id)}
                  >
                    <TableCell className="pl-6">
                      <span className="font-black text-gray-800 tracking-tighter group-hover:text-[#743181] transition-colors">{order.orderNumber}</span>
                    </TableCell>
                     <TableCell className="text-center">
                      <Badge className={`${getStatusColor(order.status)} rounded-full px-2 py-0.5 font-black text-[9px] uppercase shadow-sm border-none`}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-gray-700 text-[11px] uppercase tracking-tight">
                        {order.store?.name || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col leading-tight">
                        <span className="font-bold text-gray-900 text-[12px] tracking-tight">
                          {order.user?.name || order.name || 'Guest'}
                        </span>
                        <span className="text-[9px] text-gray-400 font-bold truncate max-w-[120px]">
                          {order.user?.email || order.email || 'N/A'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short'
                      })}
                    </TableCell>
                    <TableCell className="font-black text-[#743181] text-xs">
                      ₹{order.total.toFixed(0)}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#743181] hover:bg-white rounded-full h-8 w-8 p-0 border border-transparent hover:border-purple-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            generateInvoice(order);
                          }}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )
      })()}
    </div>
  )
}
