import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffffff',
}
import { Suspense } from 'react'
import { prisma } from '@/lib/db'
import './globals.css'
import { SessionProvider } from '@/components/providers/session-provider'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Toaster } from 'react-hot-toast'
import { CookieConsent } from '@/components/ui/cookie-consent'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? 'https://panodasehir.com'),
  title: {
    default: 'Panoda Şehir - Sanal Not Paylaşım Platformu',
    template: '%s | Panoda Şehir'
  },
  description: 'Panoda Şehir ile şehrinize dair güncel duyuruları, sanal notları keşfedin ve fikirlerinizi tüm toplulukla paylaşın.',
  keywords: ['panoda şehir', 'sanal pano', 'şehir haberleri', 'duyurular', 'not paylaşım', 'etkinlik takvimi', 'dijital pano', 'postit duvarı'],
  authors: [{ name: 'Panoda Şehir' }],
  creator: 'Panoda Şehir',
  publisher: 'Panoda Şehir',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: process.env.NEXTAUTH_URL ?? 'https://panodasehir.com',
    title: 'Panoda Şehir - Sanal Not Paylaşım Platformu',
    description: 'Fikirlerinizi paylaşın, topluluktaki diğerlerinin görüşlerini keşfedin. Sanal not ve duyuru paylaşımının keyfini çıkarın.',
    siteName: 'Panoda Şehir',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Panoda Şehir Çevrimiçi Pano',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Panoda Şehir - Sanal Not Paylaşım Platformu',
    description: 'Fikirlerinizi paylaşın, topluluktaki diğerlerinin görüşlerini keşfedin.',
    images: ['/og-image.png'],
  },
}


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // get settings
  const siteSettings = await prisma.siteSettings.findUnique({
    where: { id: 'global' },
  })

  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js"></script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Patrick+Hand&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.className} max-w-[100vw] overflow-x-hidden w-full`} suppressHydrationWarning>
        <SessionProvider>
          <Suspense fallback={<div className="h-16 w-full bg-white/80 animate-pulse border-b" />}>
            <Navbar initialSettings={siteSettings as any} />
          </Suspense>
          {children}
          <Footer />
          <CookieConsent />
          <Toaster position="top-right" />
        </SessionProvider>
      </body>
    </html>
  )
}
