import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Oylama yapmak için giriş yapmalısınız' }, { status: 401 })
    }

    const { rating } = await req.json()

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Geçersiz puan' }, { status: 400 })
    }

    const existingRating = await prisma.articleRating.findUnique({
      where: {
        articleId_userId: {
          articleId: params.id,
          userId: (session.user as any).id
        }
      }
    })

    if (existingRating) {
      return NextResponse.json({ error: 'Bu metne zaten oy verdiniz' }, { status: 400 })
    }

    // Oyu kaydet
    await prisma.articleRating.create({
      data: {
        articleId: params.id,
        userId: (session.user as any).id,
        rating: rating
      }
    })

    // Ortalama puanı yeniden hesapla
    const allRatings = await prisma.articleRating.findMany({
      where: { articleId: params.id }
    })
    
    const sum = allRatings.reduce((acc: number, curr: any) => acc + curr.rating, 0)
    const average = sum / allRatings.length

    // Article tablosunu güncelle
    await prisma.article.update({
      where: { id: params.id },
      data: { averageRating: average }
    })

    return NextResponse.json({ success: true, newAverage: average })
  } catch (error: any) {
    console.error('Error rating article:', error)
    return NextResponse.json(
      { error: 'Oy verilirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
