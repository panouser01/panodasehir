import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, email } = body

    if (!token || !email) {
      return NextResponse.json({ error: 'Token veya email eksik.' }, { status: 400 })
    }

    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        identifier: email
      }
    })

    if (!verificationToken) {
      return NextResponse.json({ error: 'Geçersiz veya süresi dolmuş bağlantı.' }, { status: 400 })
    }

    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({ 
        where: { token: verificationToken.token } 
      })
      return NextResponse.json({ error: 'Bağlantının süresi dolmuş. Lütfen yeniden kayıt olun veya yeni doğrulama gönderin.' }, { status: 400 })
    }

    // Verify User Setup (if exists)
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      await prisma.user.update({
        where: { email },
        data: { emailVerified: new Date() }
      });
    }

    // Verify Merchant Application (if exists)
    await prisma.merchantApplication.updateMany({
      where: { contactEmail: email },
      data: { emailVerified: new Date() }
    });

    // Remove the handled Token
    await prisma.verificationToken.delete({
      where: { token: verificationToken.token }
    })

    return NextResponse.json({ message: 'E-posta adresiniz başarıyla onaylandı.' }, { status: 200 })
  } catch (error) {
    console.error('Verify email error:', error)
    return NextResponse.json({ error: 'İşlem sırasında bir hata oluştu.' }, { status: 500 })
  }
}
