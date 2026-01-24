'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Lock, Mail } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      if (data.user.role !== 'admin') {
        throw new Error('Access denied. Admin privileges required.')
      }

      // Store admin session
      localStorage.setItem('user', JSON.stringify(data.user))
      // For now, we'll use a dummy token for admin since the backend expects one
      // In a real app, the login API should return a proper JWT
      localStorage.setItem('authToken', 'admin-session-token')

      toast.success('Admin login successful!', {
        description: `Welcome back, ${data.user.name}`
      })

      router.push('/admin')
    } catch (error: any) {
      console.error('Admin login error:', error)
      toast.error('Login failed', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f0f7] flex items-center justify-center p-4 font-outfit">
      <div className="fixed -top-24 -right-24 w-96 h-96 bg-[#743181]/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="fixed -bottom-24 -left-24 w-96 h-96 bg-[#B86E9F]/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-24 h-16 mx-auto mb-4 relative">
             <img
                src="/sarvaa-logo-full.jpg"
                alt="Sarvaa Logo"
                className="w-full h-full object-contain"
              />
          </div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tighter">SARVAA<span className="text-[#B86E9F]">.</span> OS</h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Administrative Gateway</p>
        </div>

        <Card className="border-none shadow-[0_30px_60px_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-xl ring-1 ring-black/5">
          <CardHeader className="pt-10 pb-2 text-center">
            <CardTitle className="text-xl font-black text-[#743181] uppercase tracking-widest">Sign In</CardTitle>
          </CardHeader>
          <CardContent className="p-10 space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="admin-email" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@sarvaasweets.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-12 h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="admin-password" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Secure Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-12 h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all font-bold"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-gradient-to-br from-[#743181] to-[#B86E9F] hover:opacity-90 text-white font-black uppercase tracking-widest shadow-xl shadow-purple-200 mt-4 transition-all hover:translate-y-[-2px] active:translate-y-[0px]"
              >
                {loading ? 'Authenticating...' : 'Access Terminal'}
              </Button>
            </form>

            <div className="pt-6 border-t border-gray-100 text-center">
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  Secure Access • Authorized Personnel Only
               </p>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-8 text-center">
           <Link href="/" className="text-gray-400 hover:text-[#743181] transition-colors text-xs font-bold uppercase tracking-widest">
              ← Return to Live Portal
           </Link>
        </div>
      </div>
    </div>
  )
}
