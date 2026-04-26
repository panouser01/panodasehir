import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const article = await prisma.article.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: { name: true, image: true, nickname: true, showAvatarInPostit: true }
        },
        category: {
          select: { name: true }
        }
      }
    })

    if (!article) {
      return NextResponse.json({ error: 'Makale bulunamadı' }, { status: 404 })
    }

    if (article.author && article.author.showAvatarInPostit === false) {
      article.author.image = null;
    }

    return NextResponse.json(article)
  } catch (error: any) {
    console.error('Error fetching article:', error)
    return NextResponse.json(
      { error: 'Makale alınırken bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    // Gözlemci veya düzenleme yetkisi olmayan yazarı engellemek için kontroller eklenebilir.
    // Öncelikle makaleyi bul:
    const existingArticle = await prisma.article.findUnique({
      where: { id: params.id }
    })

    if (!existingArticle) {
      return NextResponse.json({ error: 'Makale bulunamadı' }, { status: 404 })
    }

    // Yetki kontrolü (Sadece author'un kendisi veya ADMIN vb. düzenleyebilir)
    // Şimdilik oturum açan herkesin yazar olduğunu veya admin olduğunu varsayalım, ancak burada rol kontrolü yapılmalı.
    // if (existingArticle.authorId !== session.user.id && session.user.role !== 'ADMIN') { ... }

    const body = await req.json()
    const { title, content, averageRating, seoTags, seoSummary, thumbnailUrl, isPublished, writeVersion, images, documents, link } = body

    // Eğer writeVersion true ise eski hali ArticleVersion a kaydedilecek (Bunu Gemini ile entegrede kullanabiliriz)
    if (writeVersion) {
      await prisma.articleVersion.create({
        data: {
          articleId: existingArticle.id,
          oldTitle: existingArticle.title,
          oldContent: existingArticle.content,
          updatedById: (session.user as any).id,
          changeSummary: 'Kullanıcı kendi düzenledi.'
        }
      })
    }

    const updatedArticle = await prisma.article.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(averageRating !== undefined && { averageRating }),
        ...(seoTags !== undefined && { seoTags }),
        ...(seoSummary !== undefined && { seoSummary }),
        ...(thumbnailUrl !== undefined && { thumbnailUrl }),
        ...(isPublished !== undefined && { isPublished }),
        ...(images !== undefined && { images }),
        ...(documents !== undefined && { documents }),
        ...(link !== undefined && { link }),
      }
    })

    return NextResponse.json(updatedArticle)
  } catch (error: any) {
    console.error('Error updating article:', error)
    return NextResponse.json(
      { error: 'Makale güncellenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    await prisma.article.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true, message: 'Makale silindi' })
  } catch (error: any) {
    console.error('Error deleting article:', error)
    return NextResponse.json(
      { error: 'Makale silinirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
