import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const sliders = await prisma.slider.findMany({
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ sliders })
    } catch (error) {
        console.error('Sliders fetch error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await req.json()
        const { categoryId, images, links, backgroundColor, backgroundImage, isActive, isGradient, heroGradientFrom, heroGradientVia, heroGradientTo } = data

        // Check if slider already exists for this category
        const existing = await prisma.slider.findUnique({
            where: { categoryId: categoryId || '' }
        })

        if (existing && categoryId) {
            return NextResponse.json({ error: 'This category already has a slider.' }, { status: 400 })
        }

        const slider = await prisma.slider.create({
            data: {
                categoryId: categoryId || null,
                images: images || [],
                links: links || [],
                backgroundColor: backgroundColor || '#f8f9fa',
                backgroundImage: backgroundImage || null,
                isGradient: isGradient !== undefined ? isGradient : false,
                heroGradientFrom: heroGradientFrom || '#facc15',
                heroGradientVia: heroGradientVia || '#f472b6',
                heroGradientTo: heroGradientTo || '#a855f7',
                isActive: isActive !== undefined ? isActive : true
            }
        })

        return NextResponse.json(slider, { status: 201 })
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'This category already has a slider.' }, { status: 400 })
        }
        console.error('Slider create error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
