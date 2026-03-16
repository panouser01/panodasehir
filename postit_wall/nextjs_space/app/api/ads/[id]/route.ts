import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 })
    }
    const userRole = (session.user as any).role
    if (!['SUPER_ADMIN', 'WALL_MANAGER'].includes(userRole)) {
      return NextResponse.json({ error: 'Bu işlemi yapmaya yetkiniz yok' }, { status: 403 })
    }
    const body = await request.json()
    const { title, imageUrl, link, positions, categoryId, isActive, startDate, endDate } = body

    const ad = await prisma.ad.update({
      where: { id: params.id },
      data: {
        title,
        imageUrl,
        link,
        positions,
        categoryId: categoryId || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive !== undefined ? isActive : true
      }
    })

    return NextResponse.json({ ad })
  } catch (error) {
    console.error('Error updating ad:', error)
    return NextResponse.json({ error: 'Reklam güncellenirken hata oluştu' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 })
    }
    const userRole = (session.user as any).role
    if (!['SUPER_ADMIN', 'WALL_MANAGER'].includes(userRole)) {
      return NextResponse.json({ error: 'Bu işlemi yapmaya yetkiniz yok' }, { status: 403 })
    }

    await prisma.ad.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting ad:', error)
    return NextResponse.json({ error: 'Reklam silinirken hata oluştu' }, { status: 500 })
  }
}
