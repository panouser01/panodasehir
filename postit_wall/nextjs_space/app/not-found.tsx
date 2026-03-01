'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Home, Loader2, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
    const router = useRouter()
    const [countdown, setCountdown] = useState(5)

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    router.push('/')
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [router])

    return (
        <div className="min-h-screen bg-[#fffbeb] flex items-center justify-center p-4 text-center font-sans">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12 border border-gray-100 flex flex-col items-center">
                {/* Animated Icon */}
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-yellow-400/20 rounded-full animate-ping scale-150"></div>
                    <div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 w-20 h-20 rounded-full flex items-center justify-center shadow-lg">
                        <Rocket className="w-10 h-10 text-white" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-800 mb-4 leading-tight">
                    SAYFAMIZ GELİŞTİRME AŞAMASINDA
                </h1>

                <p className="text-lg text-gray-600 mb-8 font-medium">
                    Yakında Hizmetinizde Olacaktır.
                </p>

                {/* Countdown Indicator */}
                <div className="w-full bg-gray-100 h-2 rounded-full mb-4 overflow-hidden">
                    <div
                        className="h-full bg-blue-600 transition-all duration-1000 ease-linear"
                        style={{ width: `${(countdown / 5) * 100}%` }}
                    ></div>
                </div>

                <div className="flex items-center gap-2 text-blue-600 font-semibold mb-8">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{countdown} saniye içinde ana sayfaya yönlendiriliyorsunuz...</span>
                </div>

                <Button asChild className="w-full py-6 rounded-xl text-lg font-bold shadow-md hover:shadow-lg transition-all">
                    <Link href="/" className="flex items-center justify-center gap-2">
                        <Home className="w-5 h-5" />
                        Hemen Ana Sayfaya Git
                    </Link>
                </Button>

                <p className="mt-8 text-sm text-gray-400">
                    © {new Date().getFullYear()} Panoda Şehir. Tüm hakları saklıdır.
                </p>
            </div>
        </div>
    )
}
