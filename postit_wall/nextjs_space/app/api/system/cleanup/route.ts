import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    
    // Klasör yoksa hata verme, boş dön
    if (!fs.existsSync(uploadsDir)) {
      return NextResponse.json({ message: 'No uploads directory found', deleted: 0 })
    }

    const files = fs.readdirSync(uploadsDir)
    if (files.length === 0) {
      return NextResponse.json({ message: 'No files to clean', deleted: 0 })
    }

    // Sisteme kayıtlı, kullanımdaki tüm resim URL'lerini toplayalım
    const inUseUrls = new Set<string>()

    // 1. PostIt resimleri (PostItImage)
    const postItImages = await prisma.postItImage.findMany({ select: { url: true } })
    postItImages.forEach(img => inUseUrls.add(img.url))

    // 2. PostIt imageUrl (Eğer varsa)
    const postIts = await prisma.postIt.findMany({ where: { imageUrl: { not: null } }, select: { imageUrl: true } })
    postIts.forEach(p => { if (p.imageUrl) inUseUrls.add(p.imageUrl) })

    // 3. Category arka planları ve logoları
    const categories = await prisma.category.findMany({
      select: {
        heroBackgroundImage: true,
        backgroundImage: true,
        siteBackgroundImage: true,
        logoUrl: true,
        customLayout: true
      }
    })
    categories.forEach(c => {
      if (c.heroBackgroundImage) inUseUrls.add(c.heroBackgroundImage)
      if (c.backgroundImage) inUseUrls.add(c.backgroundImage)
      if (c.siteBackgroundImage) inUseUrls.add(c.siteBackgroundImage)
      if (c.logoUrl) inUseUrls.add(c.logoUrl)
      
      // Check customLayout blocks for images
      if (c.customLayout) {
        let layout: any = c.customLayout;
        if (typeof layout === 'string') {
          try { layout = JSON.parse(layout) } catch (e) {}
        }
        
        if (Array.isArray(layout)) {
          layout.forEach((block: any) => {
            if (block.backgroundImage) inUseUrls.add(block.backgroundImage)
            if (block.titleImage) inUseUrls.add(block.titleImage)
          })
        }
      }
    })

    // 4. Slider resimleri ve arka planları
    const sliders = await prisma.slider.findMany({ select: { images: true, backgroundImage: true } })
    sliders.forEach(s => {
      if (s.backgroundImage) inUseUrls.add(s.backgroundImage)
      if (s.images && Array.isArray(s.images)) {
        s.images.forEach(img => {
          if (typeof img === 'string') inUseUrls.add(img)
        })
      }
    })

    // 5. Site Ayarları
    const settings = await prisma.siteSettings.findUnique({ where: { id: 'global' } })
    if (settings) {
      if (settings.backgroundImage) inUseUrls.add(settings.backgroundImage)
      if (settings.heroBackgroundImage) inUseUrls.add(settings.heroBackgroundImage)
      if (settings.siteBackgroundImage) inUseUrls.add(settings.siteBackgroundImage)
      if (settings.calendarPopupBackgroundImage) inUseUrls.add(settings.calendarPopupBackgroundImage)
    }

    // 6. Kullanıcı Profil Resimleri
    const users = await prisma.user.findMany({ where: { image: { not: null } }, select: { image: true } })
    users.forEach(u => { if (u.image) inUseUrls.add(u.image) })

    // 7. Reklamlar
    const ads = await prisma.ad.findMany({ select: { imageUrl: true } })
    ads.forEach(ad => { if (ad.imageUrl) inUseUrls.add(ad.imageUrl) })

    // Temizleme İşlemi (Hangileri inUseUrls setinde yoksa sil)
    let deletedCount = 0
    let keptCount = 0

    // Set'i hızlı arama için dosya isimlerine dönüştürelim
    // Prisma db'sinde URL'ler genellikle '/uploads/dosyaismi.png' şeklinde başlar.
    const inUseFileNames = new Set(
      Array.from(inUseUrls).map(url => {
        const parts = url.split('/')
        return parts[parts.length - 1]
      })
    )

    for (const file of files) {
      const filePath = path.join(uploadsDir, file)
      // eğer dosya veritabanındaki hiçbir isme eşleşmiyorsa, orphan (yetim) dosyadır
      if (!inUseFileNames.has(file)) {
        try {
          const stats = fs.statSync(filePath)
          const now = Date.now()
          const fileAgeMs = now - stats.mtimeMs
          const ONE_HOUR = 60 * 60 * 1000

          // Eğer dosya 1 saatten daha yeni ise silme. Kullanıcı şu anda formu dolduruyor olabilir.
          if (fileAgeMs < ONE_HOUR) {
            keptCount++
            continue
          }

          fs.unlinkSync(filePath)
          deletedCount++
        } catch (err) {
          console.error(`Failed to delete orphaned file: ${file}`, err)
        }
      } else {
        keptCount++
      }
    }

    return NextResponse.json({
      message: 'Cleanup completed',
      deleted: deletedCount,
      kept: keptCount
    })

  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json({ error: 'Internal server error during cleanup' }, { status: 500 })
  }
}
