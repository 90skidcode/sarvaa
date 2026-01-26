import { Badge } from '@/components/ui/badge'
import { BookOpen } from 'lucide-react'

export default function Blog() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12 text-center">
          <Badge className="mb-4 bg-[#743181]">Stories</Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-8 font-serif">Sweet Stories</h1>
          
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center">
              <BookOpen className="h-10 w-10 text-[#743181]" />
            </div>
          </div>
          
          <p className="text-xl text-gray-600 mb-8">
            Discover the history, recipes, and traditions behind your favorite sweets.
          </p>
          
          <div className="grid gap-6 md:grid-cols-2 text-left">
            <div className="border border-gray-100 rounded-lg overflow-hidden group">
              <div className="h-40 bg-gray-200 animate-pulse"></div>
              <div className="p-4">
                <div className="h-6 bg-gray-100 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-50 rounded w-full mb-1"></div>
                <div className="h-4 bg-gray-50 rounded w-2/3"></div>
              </div>
            </div>
            <div className="border border-gray-100 rounded-lg overflow-hidden group">
              <div className="h-40 bg-gray-200 animate-pulse"></div>
              <div className="p-4">
                <div className="h-6 bg-gray-100 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-50 rounded w-full mb-1"></div>
                <div className="h-4 bg-gray-50 rounded w-2/3"></div>
              </div>
            </div>
          </div>
          
          <p className="mt-12 text-gray-500 italic">
            Articles and stories coming soon! Stay tuned.
          </p>
        </div>
      </div>
    </div>
  )
}
