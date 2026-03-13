import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const postitId = params.id
        if (!postitId) {
            return NextResponse.json({ error: 'Post-it ID eksik' }, { status: 400 })
        }

        const updatedPostit = await prisma.postIt.update({
            where: { id: postitId },
            data: {
                views: {
                    increment: 1
                }
            }
        })

        return NextResponse.json({ success: true, views: updatedPostit.views })
    } catch (error) {
        console.error('Post-it görüntüleme hatası:', error)
        return NextResponse.json(
            { error: 'Görüntüleme kaydedilemedi' },
            { status: 500 }
        )
    }
}
