'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Camera, CheckCircle2, Loader2, Upload, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface Store {
  id: string
  name: string
}

export default function CustomCakesPage() {
  const [loading, setLoading] = useState(false)
  const [stores, setStores] = useState<Store[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      const newPreviews: string[] = []
      files.forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    // Remove individual cakeImage if multiple are present or ensure they are sent as cakeImages
    formData.delete('cakeImage')
    const fileInput = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement
    if (fileInput && fileInput.files) {
      Array.from(fileInput.files).forEach(file => {
        formData.append('cakeImages', file)
      })
    }
    
    try {
      const response = await fetch('/api/custom-cakes', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        setSubmitted(true)
        toast.success('Your cake request has been submitted!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to submit request')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 sm:py-20 flex items-center justify-center px-3 sm:px-4">
        <Card className="max-w-md w-full border-none shadow-2xl rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden bg-white text-center p-6 sm:p-12">
          <div className="w-16 sm:w-24 h-16 sm:h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-sm border border-green-100">
            <CheckCircle2 className="h-8 sm:h-12 w-8 sm:h-12 text-green-500" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-4 uppercase">REQUEST RECEIVED</h2>
          <p className="text-sm sm:text-base text-gray-500 font-medium leading-relaxed mb-6 sm:mb-8">
            Our master bakers have received your design. We will call you shortly to discuss pricing and details.
          </p>
          <Button
            className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-[#743181] hover:bg-[#5a2a6e] font-bold uppercase tracking-widest transition-all text-sm sm:text-base"
            onClick={() => setSubmitted(false)}
          >
            Submit Another
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12 px-3 sm:px-4 font-outfit">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="inline-flex items-center text-[#743181] hover:text-[#5a2a6e] mb-4 sm:mb-8 font-medium text-sm sm:text-base">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        <div className="text-center mb-8 sm:mb-16">
          <Badge className="mb-4 bg-purple-50 text-[#743181] hover:bg-purple-50 px-4 py-1.5 rounded-full border border-purple-100 font-black uppercase tracking-[0.2em] text-[8px] sm:text-[10px]">
            Masterclass Confectionery
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tighter mb-4 uppercase">
            UPLOAD YOUR <span className="text-[#743181]">CAKE</span>
          </h1>
          <p className="text-gray-500 font-bold max-w-2xl mx-auto uppercase tracking-widest text-[10px] sm:text-xs leading-relaxed px-2">
            From your imagination to our oven. Share your dream cake design, and our artisans will bring it to life.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6 lg:gap-8 items-start">
          {/* Inspiration Area - Hidden on mobile, shown on lg+ */}
          <div className="hidden lg:block lg:col-span-5 space-y-4 sm:space-y-6">
            <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-[2rem] overflow-hidden bg-white">
              <div className="p-4 sm:p-6 bg-gray-50 min-h-[300px] sm:min-h-[400px]">
                {imagePreviews.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative aspect-square rounded-2xl overflow-hidden shadow-md group">
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                    <Camera className="h-20 w-20 text-gray-200 mx-auto mb-6" />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Your Designs Will Appear Here</p>
                  </div>
                )}
              </div>
            </Card>
            
            <div className="p-4 sm:p-8 bg-[#743181] rounded-xl sm:rounded-[2rem] text-white shadow-xl shadow-purple-200">
               <h3 className="font-black text-lg sm:text-xl mb-3 sm:mb-4 uppercase tracking-tight">How it works</h3>
               <ul className="space-y-2 sm:space-y-4 text-xs sm:text-sm font-medium opacity-90">
                 <li className="flex gap-2 sm:gap-3">
                   <div className="w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-white/20 flex items-center justify-center text-[8px] sm:text-[10px] flex-shrink-0">01</div>
                   <span>Upload a reference image or sketch</span>
                 </li>
                 <li className="flex gap-2 sm:gap-3">
                   <div className="w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-white/20 flex items-center justify-center text-[8px] sm:text-[10px] flex-shrink-0">02</div>
                   <span>Select your preferred pick-up branch</span>
                 </li>
                 <li className="flex gap-2 sm:gap-3">
                   <div className="w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-white/20 flex items-center justify-center text-[8px] sm:text-[10px] flex-shrink-0">03</div>
                   <span>Wait for our call within 2-4 hours</span>
                 </li>
               </ul>
            </div>
          </div>

          {/* Form Area - Full width on mobile */}
          <Card className="w-full lg:col-span-7 border-none shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden bg-white">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 md:space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400">Full Name</Label>
                    <Input
                      name="customerName"
                      required
                      placeholder="Gandhi S"
                      className="h-12 sm:h-14 rounded-xl sm:rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all font-bold text-sm"
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400">Phone Number</Label>
                    <Input
                      name="phone"
                      required
                      placeholder="09843883829"
                      className="h-12 sm:h-14 rounded-xl sm:rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all font-bold text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400">Email Address (Optional)</Label>
                  <Input
                    name="email"
                    type="email"
                    placeholder="gandhidhamayanthi@gmail.com"
                    className="h-12 sm:h-14 rounded-xl sm:rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all font-bold text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400">Pick-up Branch</Label>
                    <Select name="storeId" required>
                      <SelectTrigger className="h-12 sm:h-14 rounded-xl sm:rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all font-bold text-sm">
                        <SelectValue placeholder="Select Branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {stores.map(store => (
                          <SelectItem key={store.id} value={store.id} className="font-bold">
                            {store.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400">Preferred Date</Label>
                    <Input
                      name="preferredDate"
                      type="date"
                      required
                      className="h-12 sm:h-14 rounded-xl sm:rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all font-bold text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400">Cake Description & Details</Label>
                  <Textarea
                    name="description"
                    placeholder="E.g. 2kg Chocolate Truffle with blue fondant ribbons..."
                    className="min-h-[100px] sm:min-h-[120px] rounded-xl sm:rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all font-bold p-3 sm:p-4 leading-relaxed text-sm"
                  />
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400">Upload Design</Label>
                  <label className="flex flex-col items-center justify-center w-full h-24 sm:h-32 border-2 border-dashed border-gray-200 rounded-xl sm:rounded-[1.5rem] cursor-pointer hover:bg-purple-50 hover:border-[#743181] transition-all group">
                    <div className="flex flex-col items-center justify-center pt-3 sm:pt-5 pb-3 sm:pb-6 px-2">
                      <Upload className="w-6 sm:w-8 h-6 sm:h-8 text-gray-400 group-hover:text-[#743181] mb-2" />
                      <p className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-widest text-center">Click to upload images</p>
                    </div>
                    <input name="cakeImage" type="file" className="hidden" accept="image/*" onChange={handleImageChange} multiple required={imagePreviews.length === 0} />
                  </label>
                </div>

                <Button
                  disabled={loading}
                  className="w-full h-12 sm:h-16 rounded-xl sm:rounded-[1.5rem] bg-gradient-to-r from-[#743181] to-[#B86E9F] hover:opacity-90 transition-all font-black text-xs sm:text-sm uppercase tracking-[0.2em] shadow-xl shadow-purple-100"
                >
                  {loading ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...</>
                  ) : (
                    'Submit Request'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
