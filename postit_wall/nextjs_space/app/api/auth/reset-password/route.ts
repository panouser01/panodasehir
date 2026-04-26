import { NextResponse } from 'next/server'
import { prisma as db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { token, email, password } = await req.json()

    if (!token || !email || !password) {
      return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Şifreniz en az 6 karakter olmalıdır' }, { status: 400 })
    }

    const identifier = `password_reset_${email}`

    const verificationToken = await db.verificationToken.findFirst({
      where: {
        identifier,
        token
      }
    })

    if (!verificationToken) {
      return NextResponse.json({ error: 'Geçersiz veya süresi dolmuş bağlantı' }, { status: 400 })
    }

    if (verificationToken.expires < new Date()) {
      await db.verificationToken.delete({
        where: {
          identifier_token: {
            identifier,
            token
          }
        }
      })
      return NextResponse.json({ error: 'Bu bağlantının süresi dolmuş' }, { status: 400 })
    }

    // Şifreyi güncelle
    const hashedPassword = await bcrypt.hash(password, 10)
    await db.user.update({
      where: { email },
      data: { password: hashedPassword }
    })

    // Token temizle
    await db.verificationToken.delete({
      where: {
        identifier_token: {
          identifier,
          token
        }
      }
    })

    return NextResponse.json({ message: 'Şifreniz başarıyla güncellendi' }, { status: 200 })
  } catch (error: any) {
    console.error('Password reset error:', error)
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
  }
}
