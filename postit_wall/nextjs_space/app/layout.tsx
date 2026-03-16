import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'
import { prisma } from '@/lib/db'
import './globals.css'
import { SessionProvider } from '@/components/providers/session-provider'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? 'http://localhost:3000'),
  title: 'Panoda Şehir - Sanal Not Paylaşım Platformu',
  description: 'Fikirlerinizi paylaşın, topluluktaki diğerlerinin görüşlerini keşfedin. Panoda Şehir ile sanal not paylaşımının keyfini çıkarın.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'Panoda Şehir - Sanal Not Paylaşım Platformu',
    description: 'Fikirlerinizi paylaşın, topluluktaki diğerlerinin görüşlerini keşfedin',
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
        <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Patrick+Hand&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <SessionProvider>
          <Suspense fallback={<div className="h-16 w-full bg-white/80 animate-pulse border-b" />}>
            <Navbar initialSettings={siteSettings as any} />
          </Suspense>
          {children}
          <Footer />
          <Toaster position="top-right" />
        </SessionProvider>
      </body>
    </html>
  )
}
