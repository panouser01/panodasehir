import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const articleId = params.id
    if (!articleId) {
      return NextResponse.json({ error: 'Makale ID gerekli' }, { status: 400 })
    }

    // Fetch top-level comments and their replies (1 level deep is enough)
    const comments = await prisma.articleComment.findMany({
      where: { 
        articleId,
        parentId: null 
      },
      include: {
        user: {
          select: { id: true, name: true, nickname: true, image: true, role: true }
        },
        replies: {
          include: {
            user: { select: { id: true, name: true, nickname: true, image: true, role: true } }
          },
          orderBy: { createdAt: 'asc' } // Replies in chronological order
        }
      },
      orderBy: { createdAt: 'desc' } // Main comments in reverse chronological
    })

    return NextResponse.json(comments)
  } catch (error: any) {
    console.error('Fetch comments error:', error.message)
    return NextResponse.json({ error: 'Yorumlar getirilirken hata oluştu' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id
    const articleId = params.id

    if (!userId) {
      return NextResponse.json({ error: 'İşlem yapmak için giriş yapmalısınız' }, { status: 401 })
    }

    const body = await request.json()
    const { content, isQuestion, parentId } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'İçerik boş olamaz' }, { status: 400 })
    }

    const comment = await prisma.articleComment.create({
      data: {
        articleId,
        userId,
        content: content.trim(),
        isQuestion: Boolean(isQuestion),
        parentId: parentId || null
      },
      include: {
        user: {
          select: { id: true, name: true, nickname: true, image: true, role: true }
        }
      }
    })

    await prisma.article.update({
      where: { id: articleId },
      data: { commentsCount: { increment: 1 } }
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error: any) {
    console.error('Post comment error:', error.message)
    return NextResponse.json({ error: 'Kaydedilirken hata oluştu' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id
    const userRole = (session?.user as any)?.role
    const articleId = params.id
    
    const searchParams = request.nextUrl.searchParams
    const commentId = searchParams.get('commentId')

    if (!userId) {
      return NextResponse.json({ error: 'Oturum açın' }, { status: 401 })
    }

    if (!commentId) {
      return NextResponse.json({ error: 'Yorum ID gerekli' }, { status: 400 })
    }

    const comment = await prisma.articleComment.findUnique({
      where: { id: commentId },
      include: { replies: true }
    })

    if (!comment) {
      return NextResponse.json({ error: 'İçerik bulunamadı' }, { status: 404 })
    }

    // Only creator or admin/super_admin can delete
    const isOwner = comment.userId === userId
    const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(userRole)

    if (!isOwner && !isAdmin) {
       return NextResponse.json({ error: 'Bunu silme yetkiniz yok' }, { status: 403 })
    }

    // Determine how many items are being deleted to decrement the article counter
    const deleteCount = 1 + comment.replies.length

    await prisma.articleComment.delete({
      where: { id: commentId }
    })

    await prisma.article.update({
      where: { id: articleId },
      data: { commentsCount: { decrement: deleteCount } }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete comment error:', error.message)
    return NextResponse.json({ error: 'Silinirken hata oluştu' }, { status: 500 })
  }
}
