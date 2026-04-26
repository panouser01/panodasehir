import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions)
        const userRole = (session?.user as any)?.role

        if (userRole !== 'SUPER_ADMIN' && userRole !== 'WALL_MANAGER' && userRole !== 'WALL_USER') {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
        }

        const postitId = params.id
        if (!postitId) {
            return NextResponse.json({ error: 'Post-it ID eksik' }, { status: 400 })
        }

        // Fetch likers
        const likers = await prisma.postItLike.findMany({
            where: { postItId: postitId },
            include: { user: { select: { id: true, name: true, nickname: true, email: true, image: true } } },
            orderBy: { createdAt: 'desc' }
        })

        // Fetch viewers
        let viewers: any[] = []
        try {
            viewers = await prisma.postItView.findMany({
                where: { postItId: postitId },
                include: { user: { select: { id: true, name: true, nickname: true, email: true, image: true } } },
                orderBy: { createdAt: 'desc' }
            })
        } catch (e) {
            console.error("Viewers fetching error (perhaps db not fully synced):", e)
        }

        return NextResponse.json({ 
            likers: likers.map(l => ({ ...l.user, likedAt: l.createdAt })),
            viewers: viewers.map(v => ({ ...v.user, viewedAt: v.createdAt }))
        })

    } catch (error) {
        console.error('Post-it istatistikleri alınırken hata:', error)
        return NextResponse.json({ error: 'Veriler alınamadı' }, { status: 500 })
    }
}
