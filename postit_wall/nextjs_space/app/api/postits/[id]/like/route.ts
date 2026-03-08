import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { id } = params
        const userId = (session.user as any).id

        const postIt = await prisma.postIt.findUnique({
            where: { id }
        })

        if (!postIt) {
            return new NextResponse('Not Found', { status: 404 })
        }

        const existingLike = await prisma.postItLike.findFirst({
            where: {
                postItId: id,
                userId: userId
            }
        })

        if (existingLike) {
            await prisma.postItLike.delete({
                where: {
                    id: existingLike.id
                }
            })
            return NextResponse.json({ liked: false })
        } else {
            await prisma.postItLike.create({
                data: {
                    postItId: id,
                    userId: userId
                }
            })
            return NextResponse.json({ liked: true })
        }
    } catch (error) {
        console.error('Error in like postit:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
