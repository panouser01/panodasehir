import { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Canlı site adresi (Arama motoru ve Search Console uyumu için her zaman www kullanıyoruz)
  const baseUrl = 'https://www.panodasehir.com'
  
  // Tüm aktif kategorileri çek
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, updatedAt: true },
  })

  // Kategoriler için site haritası alt linklerini üret
  const categoryEntries = categories.map((cat) => ({
    url: `${baseUrl}/?category=${cat.id}`,
    lastModified: cat.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly', // Ana sayfa sık değişiyor
      priority: 1.0,
    },
    ...categoryEntries,
  ]
}
