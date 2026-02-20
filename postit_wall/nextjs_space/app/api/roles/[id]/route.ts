
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user || (session.user as any).role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 })
        }

        const body = await request.json()
        const { name, description } = body

        // Check if role exists
        const existing = await prisma.userRole.findUnique({ where: { id: params.id } })
        if (!existing) {
            return NextResponse.json({ error: 'Rol bulunamadı' }, { status: 404 })
        }

        const role = await prisma.userRole.update({
            where: { id: params.id },
            data: {
                name: name || undefined,
                description: description
            }
        })

        return NextResponse.json({ role })
    } catch (error) {
        console.error('Error updating role:', error)
        return NextResponse.json({ error: 'Rol güncellenemedi' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user || (session.user as any).role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 })
        }

        await prisma.userRole.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ message: 'Rol silindi' })
    } catch (error) {
        console.error('Error deleting role:', error)
        return NextResponse.json({ error: 'Rol silinemedi' }, { status: 500 })
    }
}
