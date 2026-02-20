import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// PATCH - Toggle publish status of user's own post-it
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Giriş yapmalısınız' },
        { status: 401 }
      )
    }

    const userId = (session.user as any).id

    // Check if post belongs to user
    const existingPost = await prisma.postIt.findUnique({
      where: { id: params.id }
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post-it bulunamadı' },
        { status: 404 }
      )
    }

    if (existingPost.userId !== userId) {
      return NextResponse.json(
        { error: 'Bu post-it\'i düzenleme yetkiniz yok' },
        { status: 403 }
      )
    }

    // Check if post is expired
    if (new Date(existingPost.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Süresi dolmuş post-it\'lerin yayın durumu değiştirilemez' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { isApproved } = body

    const postit = await prisma.postIt.update({
      where: { id: params.id },
      data: { isApproved },
      include: {
        user: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true } }
      }
    })

    return NextResponse.json({ postit })
  } catch (error) {
    console.error('Error toggling publish status:', error)
    return NextResponse.json(
      { error: 'Yayın durumu değiştirilirken hata oluştu' },
      { status: 500 }
    )
  }
}
