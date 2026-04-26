import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import crypto from 'crypto'
import { sendVerificationEmail } from '@/lib/mail'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'E-posta adresi gereklidir.' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Güvenlik gereği kullanıcı yoksa bile başarılı gibi dönülebilir
      // ama şu an kullanıcıları uyarabiliriz.
      return NextResponse.json({ error: 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı.' }, { status: 404 })
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: 'Bu hesabın e-postası zaten onaylanmış.' }, { status: 400 })
    }

    // Eski token varsa sil
    await prisma.verificationToken.deleteMany({
      where: { identifier: email }
    })

    // Yeni token oluştur
    const token = crypto.randomBytes(32).toString('hex')
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    })

    try {
      await sendVerificationEmail(email, token)
    } catch (mailError) {
      console.error('Mail sending error on resend:', mailError)
      return NextResponse.json({ error: 'E-posta gönderilirken bir hata oluştu.' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Onay e-postası başarıyla gönderildi.' }, { status: 200 })
  } catch (error) {
    console.error('Resend error:', error)
    return NextResponse.json({ error: 'Bir hata oluştu.' }, { status: 500 })
  }
}
