import { Badge } from '@/components/ui/badge'
import { ShoppingBag } from 'lucide-react'

export default function BulkOrders() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12 text-center">
          <Badge className="mb-4 bg-[#743181]">Orders</Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-8 font-serif">Bulk Orders</h1>
          
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center">
              <ShoppingBag className="h-10 w-10 text-[#743181]" />
            </div>
          </div>
          
          <p className="text-xl text-gray-600 mb-8">
            Planning a celebration or corporate event? We've got you covered!
          </p>
          
          <div className="max-w-md mx-auto bg-pink-50 p-8 rounded-lg border border-pink-100 text-left">
            <h3 className="font-bold text-gray-900 mb-4">Contact us for Bulk Enquiries:</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center gap-2">
                <span className="font-semibold">Phone:</span> +91 XXXXXXXXXX
              </li>
              <li className="flex items-center gap-2">
                <span className="font-semibold">Email:</span> orders@sarvaasweets.com
              </li>
            </ul>
            <p className="mt-6 text-sm italic">
              Special discounts available for large orders!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
