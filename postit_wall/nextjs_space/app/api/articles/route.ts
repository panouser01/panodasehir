import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get('categoryId')
    const isPublished = searchParams.get('isPublished')

    const where: any = {}
    
    if (categoryId) where.categoryId = categoryId
    if (isPublished === 'true') where.isPublished = true

    const articles = await prisma.article.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { name: true, image: true, nickname: true, showAvatarInPostit: true }
        },
        category: {
          select: { id: true, name: true }
        }
      }
    })

    const safeArticles = articles.map((article: any) => {
      if (article.author && article.author.showAvatarInPostit === false) {
        article.author.image = null;
      }
      return article;
    });

    return NextResponse.json(safeArticles)
  } catch (error: any) {
    console.error('Error fetching articles:', error)
    return NextResponse.json(
      { error: 'İçerikler alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const { title, content, averageRating, seoTags, seoSummary, categoryId, thumbnailUrl, isPublished, images, documents, link } = await req.json()

    if (!title || !content || !categoryId) {
      return NextResponse.json({ error: 'Başlık, İçerik ve Kategori zorunludur' }, { status: 400 })
    }

    const article = await prisma.article.create({
      data: {
        title,
        content,
        thumbnailUrl: thumbnailUrl || null,
        averageRating: averageRating || 0,
        seoTags: seoTags || null,
        seoSummary: seoSummary || null,
        isPublished: isPublished !== undefined ? isPublished : true,
        authorId: (session.user as any).id,
        categoryId: categoryId,
        images: images || [],
        documents: documents || [],
        link: link || null,
      }
    })

    return NextResponse.json(article)
  } catch (error: any) {
    console.error('Error creating article:', error)
    return NextResponse.json(
      { error: 'Makale oluşturulurken bir hata oluştu' },
      { status: 500 }
    )
  }
}
