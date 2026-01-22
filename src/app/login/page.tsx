'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { auth } from '@/lib/firebase'
import { ConfirmationResult, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import { Phone } from 'lucide-react'
import Link from 'next/link'
import { KeyboardEvent, useRef, useState } from 'react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  
  // Refs for OTP inputs
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  // Initialize reCAPTCHA
  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA verified')
        },
      })
    }
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!phoneNumber || phoneNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number')
      return
    }

    setLoading(true)
    const fullPhoneNumber = `+91${phoneNumber}`

    try {
      setupRecaptcha()
      const appVerifier = (window as any).recaptchaVerifier
      
      const confirmation = await signInWithPhoneNumber(auth, fullPhoneNumber, appVerifier)
      setConfirmationResult(confirmation)
      setStep('otp')
      
      toast.success('OTP sent successfully!', {
        description: `Verification code sent to +91${phoneNumber}`
      })
      
      // Focus first OTP input
      setTimeout(() => otpRefs[0].current?.focus(), 100)
    } catch (error: any) {
      console.error('Error sending OTP:', error)
      toast.error('Failed to send OTP', {
        description: error.message || 'Please try again'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs[index + 1].current?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newOtp = [...otp]
    
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i]
    }
    
    setOtp(newOtp)
    
    // Focus appropriate input
    const nextIndex = Math.min(pastedData.length, 5)
    otpRefs[nextIndex].current?.focus()
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()

    const otpCode = otp.join('')
    if (otpCode.length !== 6) {
      toast.error('Please enter all 6 digits')
      return
    }

    setLoading(true)

    try {
      if (!confirmationResult) {
        throw new Error('No confirmation result available')
      }

      const result = await confirmationResult.confirm(otpCode)
      const user = result.user
      
      // Get Firebase ID token for API authentication
      const idToken = await user.getIdToken()
      
      // Store user info and token in localStorage
      localStorage.setItem('user', JSON.stringify({
        uid: user.uid,
        phoneNumber: user.phoneNumber,
        idToken: idToken,
      }))
      
      // Store token separately for API calls
      localStorage.setItem('authToken', idToken)
      
      toast.success('Login successful!', {
        description: `Welcome to Sarvaa Sweets!`
      })

      // Redirect to home
      setTimeout(() => {
        window.location.href = '/'
      }, 1500)

    } catch (error: any) {
      console.error('Error verifying OTP:', error)
      toast.error('Invalid OTP', {
        description: 'Please check the code and try again'
      })
      // Clear OTP on error
      setOtp(['', '', '', '', '', ''])
      otpRefs[0].current?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setOtp(['', '', '', '', '', ''])
    setStep('phone')
    setConfirmationResult(null)
    toast.info('You can now request a new OTP')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4">
      <div className="container mx-auto max-w-md">
        {/* Back Button */}


        {/* Main Card */}
        <Card className="shadow-2xl border-purple-100">
          <CardHeader className="text-center pb-4">
            {/* Logo */}
            <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden shadow-lg">
              <img
                src="/images/sarvaa-logo-icon.jpg"
                alt="Sarvaa Sweets"
                className="w-full h-full object-cover"
              />
            </div>
            <CardTitle className="text-3xl font-bold text-[#743181]">
              {step === 'phone' ? 'Login with OTP' : 'Verify OTP'}
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {step === 'phone' 
                ? 'Enter your mobile number to receive OTP' 
                : `OTP sent to +91${phoneNumber}`
              }
            </p>
            <p className="text-sm text-gray-500 mt-1">தமிழ்நாட்டின் #1 இனிப்பு கடை</p>
          </CardHeader>

          <CardContent>
            {step === 'phone' ? (
              /* Phone Number Form */
              <form onSubmit={handleSendOTP} className="space-y-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number
                  </label>
                  <div className="flex gap-2">
                    {/* Country Code (Read-only) */}
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="text"
                        value="+91"
                        readOnly
                        className="pl-10 w-20 bg-gray-100 text-gray-600 font-semibold"
                      />
                    </div>
                    
                    {/* Phone Number Input */}
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="9876543210"
                      className="flex-1 text-lg"
                      maxLength={10}
                      autoFocus
                    />
                  </div>
                </div>

                {/* reCAPTCHA container */}
                <div id="recaptcha-container"></div>

                <Button
                  type="submit"
                  disabled={loading || phoneNumber.length !== 10}
                  className="w-full bg-gradient-to-r from-[#743181] to-[#5a2a6e] hover:from-[#5a2a6e] hover:to-[#743181] text-white py-6 text-lg"
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </Button>

                {/* Info Box */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs font-semibold text-blue-800 mb-2">📱 OTP Login Benefits:</p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>✓ Quick & secure authentication</li>
                    <li>✓ No password to remember</li>
                    <li>✓ Instant account creation for new users</li>
                  </ul>
                </div>
              </form>
            ) : (
              /* OTP Verification Form */
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                    Enter 6-Digit OTP
                  </label>
                  
                  {/* OTP Input Fields */}
                  <div className="flex justify-center gap-2 mb-4">
                    {otp.map((digit, index) => (
                      <Input
                        key={index}
                        ref={otpRefs[index]}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={index === 0 ? handleOtpPaste : undefined}
                        className="w-12 h-14 text-center text-2xl font-bold border-2 focus:border-[#743181]"
                      />
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading || otp.join('').length !== 6}
                  className="w-full bg-gradient-to-r from-[#743181] to-[#5a2a6e] hover:from-[#5a2a6e] hover:to-[#743181] text-white py-6 text-lg"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </Button>

                {/* Resend OTP */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className="text-[#743181] font-semibold hover:underline text-sm"
                  >
                    Resend OTP
                  </button>
                </div>

                {/* Change Number */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('phone')
                      setOtp(['', '', '', '', '', ''])
                      setConfirmationResult(null)
                    }}
                    className="text-gray-600 hover:text-[#743181] text-sm"
                  >
                    Change mobile number
                  </button>
                </div>
              </form>
            )}

            {/* Security Note */}
            <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-xs text-center text-gray-600">
                🔒 Secure authentication powered by Firebase
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="text-[#743181] hover:underline">Terms of Service</Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-[#743181] hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}
