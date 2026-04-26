import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET current user's post-its
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

    const postits = await prisma.postIt.findMany({
      where: {
        userId: userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            nickname: true,
            email: true,
            image: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        },
        PostItImage: {
          orderBy: {
            id: 'asc'
          }
        },
        comments: {
          include: {
            user: { select: { id: true, name: true, nickname: true, image: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ postits })
  } catch (error) {
    console.error('Error fetching user post-its:', error)
    return NextResponse.json(
      { error: 'Post-it\'ler alınırken hata oluştu' },
      { status: 500 }
    )
  }
}
