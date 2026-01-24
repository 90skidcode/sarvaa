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
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Clock,
  Eye,
  Package,
  Search,
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
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [statusFilter])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      let url = '/api/orders'
      if (statusFilter !== 'all') {
        url += `?status=${statusFilter}`
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
          // Detailed "Inner" View
          return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedOrderId(null)}
                className="text-gray-500 hover:text-[#743181] font-bold -ml-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                BACK TO LISTING
              </Button>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                  {/* Status Timeline Card */}
                  <Card className="border-none shadow-[0_10px_40px_rgba(0,0,0,0.03)] rounded-2xl overflow-hidden bg-gradient-to-br from-white to-gray-50/50">
                    <CardContent className="p-6">
                      <div className="relative pt-6 pb-10">
                        {/* Connecting LineBackground */}
                        <div className="absolute top-[4.5rem] left-0 w-full h-[2px] bg-gray-100 shadow-inner"></div>
                        
                        {/* Active Progress Line */}
                        <div 
                          className="absolute top-[4.5rem] left-0 h-[2px] bg-[#B86E9F] transition-all duration-1000 ease-in-out shadow-[0_0_10px_rgba(184,110,159,0.5)]"
                          style={{ 
                            width: (() => {
                              const percentages: Record<string, string> = {
                                pending: '0%',
                                confirmed: '25%',
                                preparing: '50%',
                                ready: '75%',
                                delivered: '100%'
                              }
                              return percentages[selectedOrder.status] || '0%'
                            })()
                          }}
                        ></div>

                        <div className="flex justify-between relative z-10">
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
                                <div key={step.id} className="flex flex-col items-center flex-1">
                                  <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500
                                    ${isCompleted ? 'bg-[#743181] border-[#743181] text-white shadow-lg' : 'bg-white border-gray-200 text-gray-300'}
                                    ${isCurrent ? 'ring-4 ring-purple-100 scale-125 z-20' : ''}
                                  `}>
                                    <step.icon className={`h-5 w-5 ${isCurrent ? 'animate-pulse' : ''}`} />
                                  </div>
                                  <div className="mt-4 flex flex-col items-center">
                                    <span className={`
                                      text-[10px] font-black uppercase tracking-widest transition-colors duration-500
                                      ${isCompleted ? 'text-[#743181]' : 'text-gray-400'}
                                      ${isCurrent ? 'text-gray-900 border-b-2 border-[#B86E9F] pb-1' : ''}
                                    `}>
                                      {step.label}
                                    </span>
                                    {logTime && (
                                      <span className="text-[9px] text-gray-500 font-bold mt-2 text-center leading-tight">
                                        {new Date(logTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                        <br />
                                        {new Date(logTime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )
                            })
                          })()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Order Contents */}
                  <Card className="border-none shadow-sm rounded-2xl">
                    <CardContent className="p-4">
                       <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Package Contents</h4>
                        <div className="space-y-2">
                          {selectedOrder.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 p-2 bg-gray-50/50 rounded-xl border border-gray-100/50 transition-all hover:shadow-md">
                              <div className="w-12 h-12 rounded-lg overflow-hidden shadow-sm border border-white">
                                <img
                                  src={item.product.image}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <p className="font-bold text-gray-900 text-sm">{item.product.name}</p>
                                <p className="text-[10px] text-gray-500 font-medium tracking-tight">Qty: {item.quantity} × ₹{item.price.toFixed(0)}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-black text-[#743181] text-xs">₹{(item.quantity * item.price).toFixed(0)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  {/* Actions Panel */}
                  <Card className="border-none shadow-lg bg-gradient-to-br from-[#743181] to-[#B86E9F] rounded-2xl text-white overflow-hidden">
                    <CardContent className="p-5">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.25em] mb-4 opacity-70">Update Fulfillment</h4>
                      
                      <div className="relative mb-4">
                        <Select
                          value={selectedOrder.status}
                          onValueChange={(value) => updateOrderStatus(selectedOrder.id, value)}
                        >
                          <SelectTrigger className="bg-white/10 border-white/20 text-white rounded-lg h-9 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="preparing">Preparing</SelectItem>
                            <SelectItem value="ready">Ready</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full bg-white/20 hover:bg-white text-white hover:text-[#743181] font-black text-[9px] uppercase rounded-lg h-8 tracking-widest border border-white/10"
                          onClick={() => updateOrderStatus(selectedOrder.id, 'confirmed')}
                          disabled={selectedOrder.status === 'cancelled'}
                        >
                          Confirm
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full bg-white/20 hover:bg-white text-white hover:text-[#743181] font-black text-[9px] uppercase rounded-lg h-8 tracking-widest border border-white/10"
                          onClick={() => updateOrderStatus(selectedOrder.id, 'ready')}
                          disabled={selectedOrder.status === 'cancelled' || selectedOrder.status === 'delivered' || selectedOrder.status === 'ready'}
                        >
                          Ready
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full bg-[#662525] hover:bg-green-500 text-white font-black text-[9px] uppercase rounded-lg h-8 tracking-widest border border-white/10 shadow-lg"
                          onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}
                          disabled={selectedOrder.status === 'cancelled' || selectedOrder.status === 'delivered'}
                        >
                          Deliver
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Customer Info */}
                  <Card className="border-none shadow-sm rounded-2xl">
                    <CardContent className="p-5">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Customer Details</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Contact</p>
                          <p className="font-bold text-gray-900 text-sm">{selectedOrder.user?.name || selectedOrder.name || 'Guest'}</p>
                          <p className="text-[10px] text-gray-500 font-medium truncate">{selectedOrder.user?.email || selectedOrder.email || 'N/A'}</p>
                          <p className="font-bold text-[#743181] text-xs">{selectedOrder.phone}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Address</p>
                          <p className="text-[11px] font-medium text-gray-600 leading-tight">{selectedOrder.address}</p>
                        </div>
                        <div className="pt-2 border-t border-gray-50 flex justify-between items-center">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Revenue</span>
                            <span className="text-lg font-black text-[#743181]">₹{selectedOrder.total.toFixed(0)}</span>
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
                ))}
              </TableBody>
            </Table>
          </Card>
        )
      })()}
    </div>
  )
}
