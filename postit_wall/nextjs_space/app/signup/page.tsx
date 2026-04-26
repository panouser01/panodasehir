'use client'

import { useState } from 'react'
import { Public_Sans } from 'next/font/google'
const publicSans = Public_Sans({ subsets: ['latin'], weight: ['800', '900'] })
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { InfoDialog } from '@/components/ui/info-dialog'

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [openDialog, setOpenDialog] = useState<{ title: string; content: string } | null>(null)

  const handleLinkClick = async (e: React.MouseEvent, field: string, title: string) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      const content = data.settings?.[field] || ''
      setOpenDialog({ title, content })
    } catch (error) {
      console.error('Settings fetch failed', error)
      setOpenDialog({ title, content: 'İçerik yüklenemedi.' })
    }
  }

  const [acceptTerms, setAcceptTerms] = useState(false)
  const [acceptPrivacy, setAcceptPrivacy] = useState(false)
  const [acceptCookies, setAcceptCookies] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Register user
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error ?? 'Kayıt başarısız')
      }

      toast.success('Kayıt başarılı! Lütfen e-postanıza gönderilen bağlantı ile hesabınızı onaylayın.', { duration: 6000 })
      router.push('/login')
    } catch (error: any) {
      console.error('Signup error:', error)
      toast.error(error?.message ?? 'Kayıt sırasında hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true)
    try {
      await signIn('google', { redirect: true, callbackUrl: '/' })
    } catch (error) {
      console.error('Google sign up error:', error)
      toast.error('Google ile kayıt olunurken hata oluştu')
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
            <p className="text-gray-600 mt-2">Yeni hesap oluşturun</p>
          </div>

          {/* Google Sign Up Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full mb-3 flex items-center justify-center gap-2 h-11 border-gray-300"
            onClick={handleGoogleSignUp}
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
            Google ile Kayıt Ol
          </Button>

          <Link href="/merchant/register" className="block w-full mb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2 h-11 border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-100 hover:text-blue-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-store">
                <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h2v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4h2a2 2 0 0 0 2-2v-8"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.5 2.5 0 0 1-2.5-2.5V7a2.5 2.5 0 0 0-2.5 2.5c-.53 0-1.01-.19-1.38-.5A2.47 2.47 0 0 1 12 7.5a2.47 2.47 0 0 1-1.62 1.5 2.5 2.5 0 0 0-2.5-2.5V7a2.5 2.5 0 0 0-2.5 2.5V7a2 2 0 0 1-2-2Z"/>
              </svg>
              İşletme Kaydı
            </Button>
          </Link>

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
              <Label htmlFor="name">Ad Soyad</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ahmet Yılmaz"
                required
                disabled={loading || googleLoading}
              />
            </div>

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
              <Label htmlFor="password">Şifre</Label>
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
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">En az 6 karakter</p>
            </div>

            <div className="space-y-3 p-1">
              <div className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 bg-white cursor-pointer"
                />
                <label htmlFor="terms" className="text-gray-600 leading-tight">
                  <a href="https://panodasehir.com/kosullar" onClick={(e) => handleLinkClick(e, 'termsContent', 'Kullanım Koşulları')} className="text-blue-600 hover:underline hover:text-blue-700 transition-colors cursor-pointer">Kullanım Koşulları</a>'nı okudum ve kabul ediyorum.
                </label>
              </div>

              <div className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  id="privacy"
                  checked={acceptPrivacy}
                  onChange={(e) => setAcceptPrivacy(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 bg-white cursor-pointer"
                />
                <label htmlFor="privacy" className="text-gray-600 leading-tight">
                  <a href="https://panodasehir.com/gizlilik" onClick={(e) => handleLinkClick(e, 'privacyContent', 'Gizlilik Politikası')} className="text-blue-600 hover:underline hover:text-blue-700 transition-colors cursor-pointer">Gizlilik Politikası</a>'nı okudum ve kabul ediyorum.
                </label>
              </div>

              <div className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  id="cookies"
                  checked={acceptCookies}
                  onChange={(e) => setAcceptCookies(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 bg-white cursor-pointer"
                />
                <label htmlFor="cookies" className="text-gray-600 leading-tight">
                  <a href="https://panodasehir.com/cerezler" onClick={(e) => handleLinkClick(e, 'cookiesContent', 'Çerez Politikası')} className="text-blue-600 hover:underline hover:text-blue-700 transition-colors cursor-pointer">Çerez Politikası</a>'nı okudum ve kabul ediyorum.
                </label>
              </div>
            </div>

            <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading || googleLoading || !acceptTerms || !acceptPrivacy || !acceptCookies}>
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Kayıt yapılıyor...
                </>
              ) : (
                'Kayıt Ol'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Zaten hesabınız var mı? </span>
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Giriş yapın
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

      <InfoDialog
        isOpen={!!openDialog}
        onOpenChange={(open) => !open && setOpenDialog(null)}
        title={openDialog?.title || ''}
        content={openDialog?.content || ''}
      />
    </div>
  )
}
