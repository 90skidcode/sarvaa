import { Badge } from '@/components/ui/badge'

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          <Badge className="mb-4 bg-[#743181]">Legal</Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-8 font-serif">Shipping Policy</h1>
          
          <div className="prose prose-pink max-w-none text-gray-600 space-y-6">
            <p>Orders placed by users are shipped through over delivery partners. Delivery will avaliable within 20km only from shop location.</p>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Delivery Timeline</h2>
              <p>Orders are typically delivered within <strong>4 Hours</strong> from the date of order placement and/or payment, or as per the delivery date agreed at the time of order confirmation. This is subject to the standard norms of the delivery partners.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Liability</h2>
              <p>The Platform Owner shall not be held liable for any delays in delivery caused by the delivery partners.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Delivery Address</h2>
              <p>All orders will be delivered to the address provided by the buyer during the purchase process. It is the buyer’s responsibility to ensure the address is accurate and complete.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Confirmation</h2>
              <p>Delivery confirmation and updates will be sent to the email address provided by the user at the time of registration.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-l-4 border-[#743181] pl-4 bg-pink-50 p-2 rounded-r-lg">
                Shipping Costs
              </h2>
              <p>Any shipping charges levied by the seller or the Platform Owner are <strong>non-refundable</strong>.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
