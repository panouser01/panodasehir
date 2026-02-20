
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

        const group = await prisma.userGroup.update({
            where: { id: params.id },
            data: {
                name: name || undefined,
                description: description
            }
        })

        return NextResponse.json({ group })
    } catch (error) {
        console.error('Error updating user group:', error)
        return NextResponse.json({ error: 'Grup güncellenemedi' }, { status: 500 })
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

        await prisma.userGroup.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ message: 'Grup silindi' })
    } catch (error) {
        console.error('Error deleting user group:', error)
        return NextResponse.json({ error: 'Grup silinemedi' }, { status: 500 })
    }
}
