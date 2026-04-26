import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { revalidateTag } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userRole = (session?.user as any)?.role

    if (!session?.user) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 })
    }

    // Only SUPER_ADMIN and WALL_MANAGER can reorder
    if (userRole !== 'SUPER_ADMIN' && userRole !== 'WALL_MANAGER') {
      return NextResponse.json({ error: 'Bu işlemi yapmaya yetkiniz yok' }, { status: 403 })
    }

    const body = await request.json()
    const { updates } = body

    if (!Array.isArray(updates)) {
      return NextResponse.json({ error: 'Geçersiz veri formatı' }, { status: 400 })
    }

    // Perform updates sequentially or in a transaction
    // Using transaction for safe atomic updates
    await prisma.$transaction(
      updates.map((item: { id: string, order: number }) =>
        prisma.category.update({
          where: { id: item.id },
          data: { order: item.order }
        })
      )
    )

    revalidateTag('all-categories-tree')

    return NextResponse.json({ message: 'Sıralama güncellendi' })
  } catch (error) {
    console.error('Error reordering categories:', error)
    return NextResponse.json({ error: 'Sıralama güncellenirken hata oluştu' }, { status: 500 })
  }
}
