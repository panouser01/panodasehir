import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 })
    }

    const commentId = params.id
    const comment = await prisma.postItComment.findUnique({ where: { id: commentId } })

    if (!comment) {
      return NextResponse.json({ error: 'Yorum bulunamadı' }, { status: 404 })
    }

    const isAdmin = (session.user as any).role === 'SUPER_ADMIN'
    const isOwner = comment.userId === (session.user as any).id

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 })
    }

    await prisma.postItComment.delete({ where: { id: commentId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Yorum silinirken hata:', error)
    return NextResponse.json({ error: 'Yorum silinemedi' }, { status: 500 })
  }
}
