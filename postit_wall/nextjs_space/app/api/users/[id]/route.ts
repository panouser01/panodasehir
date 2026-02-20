import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import * as bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

// GET single user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if ((session?.user as any)?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Bu işlemi yapmaya yetkiniz yok' }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: { select: { postits: true } }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Kullanıcı alınırken hata oluştu' }, { status: 500 })
  }
}

// UPDATE user (Super Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if ((session?.user as any)?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Bu işlemi yapmaya yetkiniz yok' }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, role, password, userGroupId } = body

    // Check if email is taken by another user
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: params.id }
        }
      })

      if (existingUser) {
        return NextResponse.json({ error: 'Bu email adresi başka bir kullanıcı tarafından kullanılıyor' }, { status: 400 })
      }
    }

    const updateData: any = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (role) updateData.role = role
    if (password) updateData.password = await bcrypt.hash(password, 10)
    if (userGroupId !== undefined) updateData.userGroupId = userGroupId

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Kullanıcı güncellenirken hata oluştu' }, { status: 500 })
  }
}

// DELETE user (Super Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if ((session?.user as any)?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Bu işlemi yapmaya yetkiniz yok' }, { status: 403 })
    }

    // Don't allow deleting yourself
    if ((session?.user as any)?.id === params.id) {
      return NextResponse.json({ error: 'Kendinizi silemezsiniz' }, { status: 400 })
    }

    await prisma.user.delete({ where: { id: params.id } })

    return NextResponse.json({ message: 'Kullanıcı silindi' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Kullanıcı silinirken hata oluştu' }, { status: 500 })
  }
}
