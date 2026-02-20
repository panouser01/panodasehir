
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || (session.user as any).role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 })
        }

        const userGroups = await prisma.userGroup.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { users: true }
                }
            }
        })

        return NextResponse.json({ userGroups })
    } catch (error) {
        console.error('Error fetching user groups:', error)
        return NextResponse.json({ error: 'Kullanıcı grupları alınamadı' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user || (session.user as any).role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 })
        }

        const body = await request.json()
        const { name, description } = body

        if (!name) {
            return NextResponse.json({ error: 'Grup adı gereklidir' }, { status: 400 })
        }

        const userGroup = await prisma.userGroup.create({
            data: {
                name,
                description
            }
        })

        return NextResponse.json({ userGroup }, { status: 201 })
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Bu isimde bir grup zaten var' }, { status: 400 })
        }
        console.error('Error creating user group:', error)
        return NextResponse.json({ error: 'Grup oluşturulamadı' }, { status: 500 })
    }
}
