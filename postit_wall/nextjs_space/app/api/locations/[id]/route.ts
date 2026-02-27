import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user || (session.user as any).role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const json = await req.json()
        const { type, name, cityId } = json

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 })
        }

        if (type === 'CITY') {
            const city = await prisma.city.update({
                where: { id: params.id },
                data: { name }
            })
            return NextResponse.json(city)
        } else if (type === 'DISTRICT') {
            if (!cityId) {
                return NextResponse.json({ error: 'City ID is required' }, { status: 400 })
            }
            const district = await prisma.district.update({
                where: { id: params.id },
                data: { name, cityId }
            })
            return NextResponse.json(district)
        }

        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'A location with this name already exists in the same context' }, { status: 400 })
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user || (session.user as any).role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Since we don't know the type from the URL alone easily, we can try to
        // delete district first, if fails try city, or rely on a query param
        const { searchParams } = new URL(req.url)
        const type = searchParams.get('type')

        if (type === 'CITY') {
            await prisma.city.delete({ where: { id: params.id } })
        } else if (type === 'DISTRICT') {
            await prisma.district.delete({ where: { id: params.id } })
        } else {
            return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete location' }, { status: 500 })
    }
}
