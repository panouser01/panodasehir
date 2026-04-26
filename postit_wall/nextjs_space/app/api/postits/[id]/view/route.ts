import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const postitId = params.id
        if (!postitId) {
            return NextResponse.json({ error: 'Post-it ID eksik' }, { status: 400 })
        }

        const session = await getServerSession(authOptions)
        const userId = session?.user ? (session.user as any).id : null

        const updateResult = await prisma.postIt.updateMany({
            where: { id: postitId },
            data: {
                views: {
                    increment: 1
                }
            }
        })
        
        if (updateResult.count === 0) {
             return NextResponse.json({ error: 'Post-it bulunamadı' }, { status: 404 })
        }

        if (userId) {
            try {
                // Upsert to not crash if the unique constraint hits (they already viewed it)
                await prisma.postItView.upsert({
                    where: {
                        userId_postItId: {
                            userId: userId,
                            postItId: postitId
                        }
                    },
                    update: {}, // do nothing if exists
                    create: {
                        userId: userId,
                        postItId: postitId
                    }
                })
            } catch (e) {
                console.error("PostItView upsert error", e)
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Post-it görüntüleme hatası:', error)
        return NextResponse.json(
            { error: 'Görüntüleme kaydedilemedi' },
            { status: 500 }
        )
    }
}
