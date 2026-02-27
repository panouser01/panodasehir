import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

// GET current user's profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Giriş yapmalısınız' },
        { status: 401 }
      )
    }

    const userId = (session.user as any).id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        companyName: true,
        phone: true,
        taxId: true,
        role: true,
        createdAt: true,
        cityId: true,
        districtId: true,
        _count: {
          select: { postits: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Profil alınırken hata oluştu' },
      { status: 500 }
    )
  }
}

// PATCH update profile
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Giriş yapmalısınız' },
        { status: 401 }
      )
    }

    const userId = (session.user as any).id
    const body = await request.json()
    const { name, companyName, phone, taxId, email, cityId, districtId } = body

    // Check if email is being changed and if it's already in use
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: email,
          NOT: { id: userId }
        }
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'Bu e-posta adresi zaten kullanılıyor' },
          { status: 400 }
        )
      }
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (companyName !== undefined) updateData.companyName = companyName
    if (phone !== undefined) updateData.phone = phone
    if (taxId !== undefined) updateData.taxId = taxId
    if (email !== undefined) updateData.email = email
    if (cityId !== undefined) updateData.cityId = cityId || null
    if (districtId !== undefined) updateData.districtId = districtId || null

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        companyName: true,
        phone: true,
        taxId: true,
        role: true,
        cityId: true,
        districtId: true
      }
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Profil güncellenirken hata oluştu' },
      { status: 500 }
    )
  }
}
