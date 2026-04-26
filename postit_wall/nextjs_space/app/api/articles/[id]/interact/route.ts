import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id
    const articleId = params.id
    const body = await request.json()
    const { type } = body // 'view', 'like', 'share'

    if (!articleId) {
      return NextResponse.json({ error: 'Makale ID gerekli' }, { status: 400 })
    }

    if (type === 'view') {
      await prisma.article.update({
        where: { id: articleId },
        data: { views: { increment: 1 } }
      })
      return NextResponse.json({ success: true, type })
    }

    if (type === 'share') {
      await prisma.article.update({
        where: { id: articleId },
        data: { sharesCount: { increment: 1 } }
      })
      return NextResponse.json({ success: true, type })
    }

    if (type === 'like') {
      if (!userId) {
        return NextResponse.json({ error: 'Beğenmek için giriş yapmalısınız' }, { status: 401 })
      }

      // Check if already liked
      const existingLike = await prisma.articleLike.findUnique({
        where: {
          articleId_userId: {
            articleId,
            userId
          }
        }
      })

      if (existingLike) {
        // Unlike
        await prisma.articleLike.delete({
          where: { id: existingLike.id }
        })
        await prisma.article.update({
          where: { id: articleId },
          data: { likesCount: { decrement: 1 } }
        })
        return NextResponse.json({ success: true, action: 'unliked' })
      } else {
        // Like
        await prisma.articleLike.create({
          data: {
            articleId,
            userId
          }
        })
        await prisma.article.update({
          where: { id: articleId },
          data: { likesCount: { increment: 1 } }
        })
        return NextResponse.json({ success: true, action: 'liked' })
      }
    }

    return NextResponse.json({ error: 'Geçersiz etkileşim türü' }, { status: 400 })

  } catch (error: any) {
    console.error('Interact error:', error.message)
    return NextResponse.json({ error: 'Etkileşim kaydedilirken hata oluştu' }, { status: 500 })
  }
}
