import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const [cities, districts] = await Promise.all([
            prisma.city.findMany({
                orderBy: { name: 'asc' },
                include: { _count: { select: { districts: true } } }
            }),
            prisma.district.findMany({
                orderBy: [{ city: { name: 'asc' } }, { name: 'asc' }],
                include: { city: true }
            })
        ])

        return NextResponse.json({ cities, districts })
    } catch (error) {
        console.error('Failed to fetch locations:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user || (session.user as any).role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const json = await req.json()
        const { type, name, cityId, showInWeather } = json

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 })
        }

        if (type === 'CITY') {
            const city = await prisma.city.create({
                data: { name, showInWeather: showInWeather || false }
            })
            return NextResponse.json(city)
        } else if (type === 'DISTRICT') {
            if (!cityId) {
                return NextResponse.json({ error: 'City ID is required' }, { status: 400 })
            }
            const district = await prisma.district.create({
                data: { name, cityId }
            })
            return NextResponse.json(district)
        }

        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    } catch (error: any) {
        console.error('Failed to create location:', error)
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'A location with this name already exists in the same context' }, { status: 400 })
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
