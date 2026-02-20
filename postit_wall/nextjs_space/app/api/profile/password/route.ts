import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

// PATCH change password
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
    const { currentPassword, newPassword, confirmPassword } = body

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    // If user has a password (not OAuth-only), verify current password
    if (user.password) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Mevcut şifrenizi girmelisiniz' },
          { status: 400 }
        )
      }

      const isValid = await bcrypt.compare(currentPassword, user.password)
      if (!isValid) {
        return NextResponse.json(
          { error: 'Mevcut şifreniz yanlış' },
          { status: 400 }
        )
      }
    }

    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Yeni şifre en az 6 karakter olmalıdır' },
        { status: 400 }
      )
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'Şifreler eşleşmiyor' },
        { status: 400 }
      )
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    })

    return NextResponse.json({ message: 'Şifre başarıyla değiştirildi' })
  } catch (error) {
    console.error('Error changing password:', error)
    return NextResponse.json(
      { error: 'Şifre değiştirilirken hata oluştu' },
      { status: 500 }
    )
  }
}
