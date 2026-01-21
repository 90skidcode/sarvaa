'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Award, Clock, Heart, Sparkles, Users } from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#743181] to-[#5a2a6e] text-white py-16">
        <div className="container mx-auto px-4">
          <Link href="/" className="inline-flex items-center text-white/80 hover:text-white font-medium mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-5xl font-bold mb-4">About Sarvaa Sweets</h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Preserving the rich heritage of Tamil Nadu's traditional sweets for over three generations
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Our Story */}
        <div className="max-w-4xl mx-auto mb-16">
          <Badge className="mb-4 bg-[#743181]">Our Story</Badge>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            A Journey Through Tamil Nadu's Sweet Traditions
          </h2>
          
          <div className="prose prose-lg max-w-none text-gray-600 space-y-4">
            <p>
              Founded in the heart of Tamil Nadu, <strong>Sarvaa Sweets</strong> has been crafting authentic 
              traditional sweets for over 50 years. What started as a small sweet shop in Chennai's bustling 
              T. Nagar has grown into Tamil Nadu's most trusted name for premium, handcrafted mithai.
            </p>
            
            <p>
              Our journey began with a simple mission: to preserve and share the authentic flavors of Tamil Nadu's 
              rich culinary heritage. Every sweet we create tells a story of tradition, passed down through generations 
              of master sweet makers who have perfected the art of crafting India's most beloved confections.
            </p>
            
            <p>
              From the ghee-rich <strong>Mysore Pak</strong> that melts in your mouth, to the divine{' '}
              <strong>Tirunelveli Halwa</strong> made with pure wheat and cashews, to the festival favorite{' '}
              <strong>Adhirasam</strong> – each product reflects our commitment to authenticity, quality, and taste.
            </p>

            <p>
              We source only the finest ingredients: pure desi ghee from local dairies, premium cashews and almonds, 
              authentic jaggery from Chettinad, and fresh milk from Tamil Nadu's dairy farms. Our recipes remain 
              unchanged from the original formulations, ensuring that every bite transports you to the temple towns 
              and traditional sweet shops of Tamil Nadu.
            </p>
          </div>
        </div>

        {/* Our Values */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-purple-100 text-[#743181]">Our Values</Badge>
            <h2 className="text-3xl font-bold text-gray-900">What Makes Us Special</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Award className="h-12 w-12 text-[#743181]" />,
                title: 'Pure Ingredients',
                description: 'Only the finest desi ghee, premium dry fruits, and authentic ingredients sourced directly from Tamil Nadu'
              },
              {
                icon: <Clock className="h-12 w-12 text-[#743181]" />,
                title: 'Traditional Recipes',
                description: 'Centuries-old recipes passed down through generations, preserving the authentic taste of Tamil sweets'
              },
              {
                icon: <Heart className="h-12 w-12 text-[#743181]" />,
                title: 'Handcrafted Daily',
                description: 'Every sweet is made fresh daily by our master craftsmen, ensuring maximum freshness and quality'
              },
              {
                icon: <Users className="h-12 w-12 text-[#743181]" />,
                title: '50,000+ Happy Customers',
                description: 'Trusted by thousands of families across Tamil Nadu and beyond for their celebrations'
              }
            ].map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="mb-4 flex justify-center">{value.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Our Heritage */}
        <div className="bg-white rounded-lg p-8 md:p-12 mb-16">
          <div className="max-w-3xl mx-auto text-center">
            <Sparkles className="h-12 w-12 text-[#743181] mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Preserving Tamil Nadu's Sweet Heritage
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              From the famous sweet shops of Srivilliputhur to the halwa makers of Tirunelveli, 
              from Kovilpatti's peanut candy to Chennai's traditional sweets – we bring you the 
              best of Tamil Nadu's confectionery traditions, all under one roof.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="outline" className="text-[#743181] border-[#743181] px-4 py-2">
                Srivilliputhur Palgova
              </Badge>
              <Badge variant="outline" className="text-[#743181] border-[#743181] px-4 py-2">
                Tirunelveli Halwa
              </Badge>
              <Badge variant="outline" className="text-[#743181] border-[#743181] px-4 py-2">
                Kovilpatti Kadalai Mittai
              </Badge>
              <Badge variant="outline" className="text-[#743181] border-[#743181] px-4 py-2">
                Chettinad Specialties
              </Badge>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-[#743181] to-[#5a2a6e] text-white rounded-lg p-12">
          <h2 className="text-3xl font-bold mb-4">Experience Authentic Tamil Sweets</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of happy customers who trust Sarvaa Sweets for their celebrations and special moments
          </p>
          <Link href="/products">
            <Button size="lg" variant="secondary" className="bg-white text-[#743181] hover:bg-gray-100">
              Browse Our Collection
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
