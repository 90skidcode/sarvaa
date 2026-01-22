'use client'

import Link from 'next/link'
import { Button } from './ui/button'

export function Footer() {
  return (
    <footer className="relative mt-20">
      {/* Wavy/Scalloped Top Border */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] -translate-y-[98%]">
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className="relative block w-full h-[40px] md:h-[60px]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,0 Q60,100 120,0 Q180,100 240,0 Q300,100 360,0 Q420,100 480,0 Q540,100 600,0 Q660,100 720,0 Q780,100 840,0 Q900,100 960,0 Q1020,100 1080,0 Q1140,100 1200,0 Q1260,100 1320,0 Q1380,100 1440,0 V120 H0 Z"
            fill="#fdf2f8"
          />
        </svg>
      </div>

      <div className="bg-pink-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
             <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#743181] mb-4">
               Crafted with <span className="italic">Thamizh Parampara</span>
             </h2>
             <div className="w-24 h-1 bg-gradient-to-r from-[#743181] to-pink-400 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-gray-700">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <img src="/images/sarvaa-logo-icon.jpg" alt="Sarvaa Logo" className="w-8 h-8" />
                </div>
                <span className="text-gray-900 text-xl font-bold tracking-tight">Sarvaa Sweets</span>
              </div>
              <p className="mb-6 leading-relaxed text-gray-600">
                Authentic Tamil Nadu sweets made with pure ghee and centuries-old recipes. Preserving tradition, one sweet at a time.
              </p>
              <div className="flex gap-4">
                {['facebook', 'instagram', 'twitter', 'youtube'].map((social) => (
                  <Link key={social} href="#" className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-[#743181] hover:text-white transition-all">
                    <span className="sr-only">{social}</span>
                    <div className="w-5 h-5 bg-current opacity-70"></div>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-gray-900 font-bold text-lg mb-6">Quick Links</h4>
              <ul className="space-y-4">
                <li><Link href="/products" className="hover:text-[#743181] transition-colors">Our Products</Link></li>
                <li><Link href="/about" className="hover:text-[#743181] transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-[#743181] transition-colors">Contact Us</Link></li>
                <li><Link href="/store-locator" className="hover:text-[#743181] transition-colors">Store Locations</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-gray-900 font-bold text-lg mb-6">Business</h4>
              <ul className="space-y-4">
                <li><Link href="/bulk-orders" className="hover:text-[#743181] transition-colors">Bulk Orders</Link></li>
                <li><Link href="/franchise" className="hover:text-[#743181] transition-colors">Franchise Enquiries</Link></li>
                <li><Link href="/store-locator" className="hover:text-[#743181] transition-colors">Store Locator</Link></li>
                <li><Link href="/blog" className="hover:text-[#743181] transition-colors">Sweet Stories</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-gray-900 font-bold text-lg mb-6">Newsletter</h4>
              <p className="mb-4 text-gray-600">Get sweet updates and festive offers!</p>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your Email"
                  className="bg-white border border-gray-200 rounded-lg px-4 py-2 flex-1 focus:ring-2 focus:ring-[#743181] outline-none"
                />
                <Button className="bg-[#743181] hover:bg-[#5a2a6e] text-white">Join</Button>
              </form>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Sarvaa Sweets. Dedicated to Tamil Traditions.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-gray-900">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-gray-900">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
