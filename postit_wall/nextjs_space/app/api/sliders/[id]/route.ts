import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await req.json()
        const { categoryId, images, links, backgroundColor, backgroundImage, isActive, isGradient, heroGradientFrom, heroGradientVia, heroGradientTo } = data

        const slider = await prisma.slider.update({
            where: { id: params.id },
            data: {
                categoryId: categoryId || null,
                images: images,
                links: links,
                backgroundColor: backgroundColor,
                backgroundImage: backgroundImage,
                isGradient: isGradient,
                heroGradientFrom: heroGradientFrom,
                heroGradientVia: heroGradientVia,
                heroGradientTo: heroGradientTo,
                isActive: isActive
            }
        })

        return NextResponse.json(slider)
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'This category already has a slider.' }, { status: 400 })
        }
        console.error('Slider update error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await prisma.slider.delete({
            where: { id: params.id }
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error('Slider delete error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
