import { NextResponse } from 'next/server'
import { prisma as db } from '@/lib/db'
import { randomBytes } from 'crypto'
import { sendPasswordResetEmail } from '@/lib/mail'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'E-posta adresi gereklidir' }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Güvenlik: Kullanıcı bulunamasa bile hata göstermiyoruz, sadece başarılı döndürüyoruz.
      return NextResponse.json({ message: 'Şifre sıfırlama bağlantısı gönderildi' }, { status: 200 })
    }

    // Token oluştur
    const token = randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 3600 * 1000) // 1 saat geçerli

    // Eski şifre sıfırlama token'ı varsa sil
    const identifier = `password_reset_${email}`
    await db.verificationToken.deleteMany({
      where: { identifier }
    })

    // Yeni token ekle
    await db.verificationToken.create({
      data: {
        identifier,
        token,
        expires
      }
    })

    // Mail gönder
    await sendPasswordResetEmail(email, token)

    return NextResponse.json({ message: 'Şifre sıfırlama bağlantısı gönderildi' }, { status: 200 })
  } catch (error: any) {
    console.error('Password reset request error:', error)
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
  }
}
