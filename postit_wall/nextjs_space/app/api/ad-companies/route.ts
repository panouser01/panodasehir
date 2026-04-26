import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 })
    }
    const userRole = (session.user as any).role
    if (!['SUPER_ADMIN', 'WALL_MANAGER'].includes(userRole)) {
      return NextResponse.json({ error: 'Bu işlemi yapmaya yetkiniz yok' }, { status: 403 })
    }

    const companies = await prisma.adCompany.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ companies })
  } catch (error) {
    console.error('Error fetching ad companies:', error)
    return NextResponse.json({ error: 'Firmalar getirilirken hata oluştu' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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
    const { name, contactInfo, isActive } = body

    if (!name) {
      return NextResponse.json({ error: 'Firma adı zorunludur' }, { status: 400 })
    }

    const company = await prisma.adCompany.create({
      data: {
        name,
        contactInfo,
        isActive: isActive !== undefined ? isActive : true
      }
    })

    return NextResponse.json({ company }, { status: 201 })
  } catch (error) {
    console.error('Error creating ad company:', error)
    return NextResponse.json({ error: 'Firma oluşturulurken hata oluştu' }, { status: 500 })
  }
}
