import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET all active ads
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const position = searchParams.get('position')
    const categoryId = searchParams.get('categoryId')

    const where: any = { isActive: true }

    if (position) {
      where.position = position
    }

    if (categoryId) {
      where.OR = [
        { categoryId },
        { categoryId: null }
      ]
    }

    const ads = await prisma.ad.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ ads })
  } catch (error) {
    console.error('Error fetching ads:', error)
    return NextResponse.json(
      { error: 'Reklamlar alınırken hata oluştu' },
      { status: 500 }
    )
  }
}

// CREATE ad (Super Admin and Wall Manager)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Giriş yapmalısınız' },
        { status: 401 }
      )
    }

    const userRole = (session.user as any).role

    if (!['SUPER_ADMIN', 'WALL_MANAGER'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Bu işlemi yapmaya yetkiniz yok' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, imageUrl, link, position, categoryId } = body

    if (!title || !imageUrl || !link || !position) {
      return NextResponse.json(
        { error: 'Tüm alanlar gereklidir' },
        { status: 400 }
      )
    }

    const ad = await prisma.ad.create({
      data: {
        title,
        imageUrl,
        link,
        position,
        categoryId: categoryId || null,
        createdBy: (session.user as any).id
      }
    })

    return NextResponse.json({ ad }, { status: 201 })
  } catch (error) {
    console.error('Error creating ad:', error)
    return NextResponse.json(
      { error: 'Reklam oluşturulurken hata oluştu' },
      { status: 500 }
    )
  }
}
