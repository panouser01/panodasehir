import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = (session.user as any).role
    if (role !== 'SUPER_ADMIN' && role !== 'WALL_MANAGER' && role !== 'WALL_USER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { targetOrder } = await request.json()

    if (!Array.isArray(targetOrder)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    // Process updates in transaction
    const updatePromises = targetOrder.map((item: { id: string, order: number }) => 
      prisma.postIt.update({
        where: { id: item.id },
        data: { order: item.order }
      })
    )

    await prisma.$transaction(updatePromises)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
