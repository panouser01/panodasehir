'use client'

import { useState } from 'react'
import { Public_Sans } from 'next/font/google'
const publicSans = Public_Sans({ subsets: ['latin'], weight: ['800', '900'] })
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showResend, setShowResend] = useState(false)
  const [resending, setResending] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      })

      if (result?.error) {
        if (result.error.toLowerCase().includes('doğrula') || result.error.includes('onay')) {
          toast.error(result.error)
          setShowResend(true)
        } else {
          toast.error('Geçersiz email veya şifre')
          setShowResend(false)
        }
        return
      }

      setShowResend(false)

      toast.success('Giriş başarılı!')
      window.location.href = '/'
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Giriş yapılırken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!formData.email) {
      toast.error('Lütfen e-posta adresinizi girin.')
      return
    }
    setResending(true)
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gönderilemedi')
      
      toast.success('Onay e-postası tekrar gönderildi. Lütfen gelen kutunuzu kontrol edin.')
      setShowResend(false)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setResending(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    try {
      await signIn('google', { redirect: true, callbackUrl: '/' })
    } catch (error) {
      console.error('Google sign in error:', error)
      toast.error('Google ile giriş yapılırken hata oluştu')
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-2">
              <h1 className={`${publicSans.className} text-3xl font-bold bg-red-600 text-white px-4 py-1.5 rounded-lg shadow-sm tracking-tight`}>
                Panoda Şehir
              </h1>
            </div>
            <p className="text-gray-600 mt-2">Hesabınıza giriş yapın</p>
          </div>

          {/* Google Sign In Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full mb-6 flex items-center justify-center gap-2 h-11"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Google ile Giriş Yap
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">veya</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="ornek@email.com"
                required
                disabled={loading || googleLoading}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <Label htmlFor="password">Şifre</Label>
                <Link href="/forgot-password" className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline">
                  Şifremi Unuttum?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="••••••••"
                required
                disabled={loading || googleLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading || googleLoading || resending}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Giriş yapılıyor...
                </>
              ) : (
                'Giriş Yap'
              )}
            </Button>
            
            {showResend && (
              <Button 
                type="button" 
                variant="outline" 
                className="w-full border-[#facc15] text-amber-600 hover:bg-yellow-50 mt-2"
                onClick={handleResend}
                disabled={resending}
              >
                {resending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gönderiliyor...
                  </>
                ) : (
                  'Onay E-postasını Tekrar Gönder'
                )}
              </Button>
            )}
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Hesabınız yok mu? </span>
            <Link href="/signup" className="text-blue-600 hover:underline font-medium">
              Kayıt olun
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link href="/">
              <Button variant="ghost" className="w-full">
                Ana Sayfaya Dön
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
