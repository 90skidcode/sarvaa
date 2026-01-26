import { Badge } from '@/components/ui/badge'
import { Building2 } from 'lucide-react'

export default function Franchise() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12 text-center">
          <Badge className="mb-4 bg-[#743181]">Business</Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-8 font-serif">Franchise Enquiries</h1>
          
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center">
              <Building2 className="h-10 w-10 text-[#743181]" />
            </div>
          </div>
          
          <p className="text-xl text-gray-600 mb-8">
            Partner with us to spread the sweetness of Tamil traditions!
          </p>
          
          <div className="max-w-md mx-auto bg-pink-50 p-8 rounded-lg border border-pink-100 text-left">
            <h3 className="font-bold text-gray-900 mb-4">Franchise Opportunities:</h3>
            <p className="text-gray-600 mb-6">
              Join the Sarvaa Sweets family and bring authentic Tamil sweets to your city. We provide comprehensive support, recipes, and marketing guidance.
            </p>
            <div className="space-y-3 text-gray-600">
              <p><span className="font-semibold">Email:</span> franchise@sarvaasweets.com</p>
              <p><span className="font-semibold">Hotline:</span> +91 XXXXXXXXXX</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
