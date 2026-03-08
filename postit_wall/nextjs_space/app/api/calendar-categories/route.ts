import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
    try {
        const categories = await prisma.calendarCategory.findMany({
            orderBy: { order: 'asc' }
        })
        return NextResponse.json(categories)
    } catch (error) {
        console.error('Error fetching calendar categories:', error)
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { name, order, isActive, globalEntries } = await req.json()
        const category = await prisma.calendarCategory.create({
            data: { name, order: order || 0, isActive: isActive !== undefined ? isActive : true, globalEntries: globalEntries || [] }
        })
        return NextResponse.json(category)
    } catch (error) {
        console.error('Error creating calendar category:', error)
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { id, name, order, isActive, globalEntries } = await req.json()
        const category = await prisma.calendarCategory.update({
            where: { id },
            data: { name, order, isActive, globalEntries }
        })
        return NextResponse.json(category)
    } catch (error) {
        console.error('Error updating calendar category:', error)
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

        await prisma.calendarCategory.delete({
            where: { id }
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting calendar category:', error)
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
    }
}
