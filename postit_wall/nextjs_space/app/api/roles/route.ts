
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        console.log('[API] Looking for roles with session:', session?.user?.email)

        if (!session?.user || (session.user as any).role !== 'SUPER_ADMIN') {
            console.log('[API] Forbidden access to roles.')
            return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 })
        }

        const roles = await prisma.userRole.findMany({
            orderBy: { name: 'asc' }
        })
        console.log(`[API] Found ${roles.length} roles.`)

        return NextResponse.json({ roles })
    } catch (error) {
        console.error('Error fetching roles:', error)
        return NextResponse.json({ error: 'Roller alınamadı' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user || (session.user as any).role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 })
        }

        const body = await request.json()
        const { name, description, permissions } = body

        if (!name) {
            return NextResponse.json({ error: 'Rol adı gereklidir' }, { status: 400 })
        }

        const role = await prisma.userRole.create({
            data: {
                name,
                description,
                permissions: permissions || []
            }
        })

        return NextResponse.json({ role }, { status: 201 })
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Bu isimde bir rol zaten var' }, { status: 400 })
        }
        console.error('Error creating role:', error)
        return NextResponse.json({ error: 'Rol oluşturulamadı' }, { status: 500 })
    }
}
