import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import * as bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

// GET all users (Super Admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if ((session?.user as any)?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Bu işlemi yapmaya yetkiniz yok' },
        { status: 403 }
      )
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        userGroupId: true,
        userGroup: {
          select: {
            id: true,
            name: true
          }
        },
        createdAt: true,
        _count: {
          select: {
            postits: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Kullanıcılar alınırken hata oluştu' },
      { status: 500 }
    )
  }
}

// CREATE user (Super Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if ((session?.user as any)?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Bu işlemi yapmaya yetkiniz yok' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { email, name, password, role, userGroupId } = body

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Email, ad ve şifre gereklidir' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu email adresi zaten kullanımda' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role || 'USER',
        userGroupId: userGroupId || null
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        userGroupId: true,
        userGroup: {
          select: {
            id: true,
            name: true
          }
        },
        createdAt: true
      }
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Kullanıcı oluşturulurken hata oluştu' },
      { status: 500 }
    )
  }
}
