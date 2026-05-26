import { Badge } from '@/components/ui/badge'

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          <Badge className="mb-4 bg-[#743181]">Legal</Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-8 font-serif">Return and Refund Policy</h1>
          
          <div className="prose prose-pink max-w-none text-gray-600 space-y-6">
            <p className="text-lg">We do <strong>not accept product returns</strong> under any circumstances.</p>

            <p>Refunds may be considered only if a complaint is raised within <strong>1 hour of delivery</strong>. After this time window, refund requests will not be eligible for processing.</p>

            <p className="bg-pink-50 p-6 rounded-lg border-l-4 border-[#743181]">
              If a refund is approved, the amount will be credited to your original payment method within <strong>7 business days</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
