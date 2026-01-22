'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Cake, Send, Sparkles, Upload } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'

export function CustomCakeSection() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    flavor: '',
    weight: '',
    message: '',
    designFile: null as File | null,
  })

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size too large', { description: 'Please upload an image smaller than 5MB' })
        return
      }
      setFormData({ ...formData, designFile: file })
      setPreviewUrl(URL.createObjectURL(file))
      toast.success('Design uploaded successfully!')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if ( !formData.flavor || !formData.weight) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      toast.success('Quote Request Sent!', {
        description: 'Our master chef will review your design and contact you within 2 hours.',
      })
      // Reset form
      setFormData({
        flavor: '',
        weight: '',
        message: '',
        designFile: null,
      })
      setPreviewUrl(null)
    }, 2000)
  }

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background with Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/custom_cake_background.png" // I need to make sure this path works or use the generated path
          alt="Custom Cake Background"
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#743181]/10 via-white to-pink-50/20"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-[#743181] font-bold text-sm tracking-wide animate-bounce">
                <Sparkles className="h-4 w-4" />
                NEW: CUSTOM CAKE STUDIO
              </div>
              
              <h2 className="text-5xl lg:text-6xl font-black text-gray-900 leading-tight">
                Upload Your Cake Design, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#743181] to-[#5a2a6e]">
                  We'll Bake the Magic.
                </span>
              </h2>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Got a dream cake in mind? Share your inspiration with us. From tiered wedding masterpieces 
                to whimsical birthday surprises, our master patissiers bring your vision to life with 
                authentic flavors and premium ingredients.
              </p>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-white shadow-xl shadow-purple-100 border border-purple-50 group hover:-translate-y-1 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-4 group-hover:bg-[#743181] group-hover:text-white transition-colors">
                    <Upload className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Upload Inspiration</h4>
                  <p className="text-sm text-gray-500">Sketch, photo, or an idea - we craftsmen can replicate anything.</p>
                </div>
                
                <div className="p-6 rounded-2xl bg-white shadow-xl shadow-purple-100 border border-purple-50 group hover:-translate-y-1 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-4 group-hover:bg-[#743181] group-hover:text-white transition-colors">
                    <Cake className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Artisan Flavors</h4>
                  <p className="text-sm text-gray-500">Choice of 20+ premium flavors and exotic fillings.</p>
                </div>
              </div>
            </div>

            {/* Right Form */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#743181] to-[#5a2a6e] rounded-[3rem] blur-3xl opacity-10"></div>
              
              <Card className="relative overflow-hidden rounded-[2.5rem] border-none shadow-2xl bg-white/80 backdrop-blur-xl">
                <CardContent className="p-8 lg:p-10">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <Label className="text-gray-900 font-bold text-lg">Upload Your Cake Design Photo</Label>
                      <div 
                        className={`relative group cursor-pointer border-2 border-dashed rounded-3xl p-8 transition-all ${
                          previewUrl ? 'border-[#743181] bg-purple-50/30' : 'border-gray-200 hover:border-[#743181] hover:bg-purple-50/50'
                        }`}
                        onClick={() => document.getElementById('cake-upload')?.click()}
                      >
                        <input
                          id="cake-upload"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                        {previewUrl ? (
                          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg animate-in fade-in zoom-in duration-300">
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="text-white font-bold flex items-center gap-2">
                                <Upload className="h-5 w-5" /> Change Design
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center space-y-3">
                            <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mx-auto text-[#743181] group-hover:scale-110 transition-transform">
                              <Upload className="h-8 w-8" />
                            </div>
                            <div>
                              <p className="text-gray-900 font-bold">Drop your image here</p>
                              <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4">
                     

                      <div className="space-y-2">
                        <Label htmlFor="flavor" className="font-bold text-gray-700">Flavors</Label>
                        <Select value={formData.flavor} onValueChange={(val) => setFormData({...formData, flavor: val})} >
                          <SelectTrigger className="rounded-xl border-gray-200 h-12 focus:ring-[#743181]/20 w-full">
                            <SelectValue placeholder="Chose Flavor" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="belgian-choc">Premium Belgian Chocolate</SelectItem>
                            <SelectItem value="red-velvet">Velvet Berry Red Velvet</SelectItem>
                            <SelectItem value="exotic-vanilla">Madagascar Vanilla bean</SelectItem>
                            <SelectItem value="butterscotch">Crunchy Butterscotch</SelectItem>
                            <SelectItem value="pineapple">Zesty Tropical Pineapple</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="weight" className="font-bold text-gray-700">Weight (KGs)</Label>
                        <Select value={formData.weight} onValueChange={(val) => setFormData({...formData, weight: val})}>
                          <SelectTrigger className="rounded-xl border-gray-200 h-12 focus:ring-[#743181]/20 w-full">
                            <SelectValue placeholder="Select KG" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1.0 KG (Standard)</SelectItem>
                            <SelectItem value="1.5">1.5 KG</SelectItem>
                            <SelectItem value="2">2.0 KG</SelectItem>
                            <SelectItem value="3">3.0 KG</SelectItem>
                            <SelectItem value="5">5.0 KG+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="font-bold text-gray-700">Message on Cake</Label>
                      <Textarea 
                        id="message"
                        placeholder="Write your special message here..."
                        className="rounded-2xl border-gray-200 min-h-[100px] focus:ring-[#743181]/20"
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                      />
                    </div>

                    <Button 
                      type="submit"
                      disabled={loading}
                      className="w-full h-14 rounded-2xl bg-[#743181] hover:bg-[#5a2a6e] text-white font-bold text-lg shadow-xl shadow-purple-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Sending Request...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send className="h-5 w-5" /> Get Custom Quote
                        </span>
                      )}
                    </Button>
                    
                    <p className="text-center text-xs text-gray-400 font-medium tracking-wide">
                      * OUR CHEFS WILL CALL YOU TO FINALIZE PRICING AND PICKUP
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
