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

    const all = searchParams.get('all') === 'true'

    const where: any = {}
    if (!all) {
      where.isActive = true
      const now = new Date()
      where.AND = [
        { OR: [{ startDate: null }, { startDate: { lte: now } }] },
        { OR: [{ endDate: null }, { endDate: { gte: now } }] }
      ]
    }

    if (all) {
      const session = await getServerSession(authOptions)
      const userRole = (session?.user as any)?.role
      if (!session?.user || (userRole !== 'SUPER_ADMIN' && userRole !== 'WALL_MANAGER')) {
        return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
      }
    }

    if (position) {
      where.positions = { array_contains: position }
    }

    if (categoryId) {
      where.OR = [
        { categoryId },
        { categoryId: null },
        { categoryIds: { array_contains: categoryId } }
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
    const { title, imageUrl, link, positions, categoryId, categoryIds, startDate, endDate, frequency, companyId } = body

    if (!title || !imageUrl || !link || !positions || !Array.isArray(positions) || positions.length === 0) {
      return NextResponse.json(
        { error: 'Tüm alanlar gereklidir ve en az bir gösterim pozisyonu seçilmelidir' },
        { status: 400 }
      )
    }

    const ad = await prisma.ad.create({
      data: {
        title,
        imageUrl,
        link,
        positions,
        categoryId: categoryId || null,
        categoryIds: categoryIds || [],
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        frequency: frequency !== undefined ? parseInt(frequency) : 1,
        companyId: companyId || null,
        createdBy: (session.user as any).id
      }
    })

    const { revalidateTag } = require('next/cache')
    revalidateTag('ads-and-settings')
    revalidateTag('site-settings')

    return NextResponse.json({ ad }, { status: 201 })
  } catch (error) {
    console.error('Error creating ad:', error)
    return NextResponse.json(
      { error: 'Reklam oluşturulurken hata oluştu' },
      { status: 500 }
    )
  }
}
