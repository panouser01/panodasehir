'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function VerifyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!token || !email) {
      setStatus('error')
      setErrorMessage('Eksik veya geçersiz bağlantı.')
      return
    }

    const verify = async () => {
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, email })
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Bir hata oluştu')
        }

        setStatus('success')
        setTimeout(() => {
          router.push('/login')
        }, 4000)
      } catch (err: any) {
        setStatus('error')
        setErrorMessage(err.message)
      }
    }

    verify()
  }, [token, email, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 border-4 border-[#facc15] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h2 className="text-2xl font-bold text-gray-800">Doğrulanıyor...</h2>
            <p className="text-gray-500">Lütfen bekleyin, e-posta adresiniz onaylanıyor.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-500">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Başarılı!</h2>
            <p className="text-gray-500">E-posta adresiniz onaylandı. Yönlendiriliyorsunuz...</p>
            <Link href="/login" className="inline-block mt-4 px-6 py-2 bg-[#facc15] text-black font-semibold rounded-lg hover:bg-[#eab308] transition-colors">
              Giriş Yap
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-500">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Doğrulama Başarısız</h2>
            <p className="text-red-500">{errorMessage}</p>
            <Link href="/login" className="inline-block mt-4 px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors">
              Giriş Sayfasına Dön
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50">Yükleniyor...</div>}>
      <VerifyContent />
    </Suspense>
  )
}
