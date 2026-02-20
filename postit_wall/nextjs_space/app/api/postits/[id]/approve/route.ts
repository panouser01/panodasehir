import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// APPROVE/REJECT/UPDATE post-it (for wall managers)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Giriş yapmalısınız' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { isApproved, content, categoryId, color, font, pushpin, link } = body

    const postit = await prisma.postIt.findUnique({
      where: { id: params.id },
      include: {
        category: true
      }
    })

    if (!postit) {
      return NextResponse.json(
        { error: 'Post-it bulunamadı' },
        { status: 404 }
      )
    }

    const userRole = (session.user as any).role
    const userId = (session.user as any).id

    // Check permissions - wall manager can manage posts in their walls
    const canManage = 
      userRole === 'SUPER_ADMIN' ||
      (userRole === 'WALL_MANAGER' && postit.category?.wallManagerId === userId)

    if (!canManage) {
      return NextResponse.json(
        { error: 'Bu işlemi yapmaya yetkiniz yok' },
        { status: 403 }
      )
    }

    // Build update data
    const updateData: any = {}
    if (isApproved !== undefined) updateData.isApproved = isApproved
    if (content !== undefined) updateData.content = content
    if (categoryId !== undefined) updateData.categoryId = categoryId
    if (color !== undefined) updateData.color = color
    if (font !== undefined) updateData.font = font
    if (pushpin !== undefined) updateData.pushpin = pushpin
    if (link !== undefined) updateData.link = link

    const updatedPostit = await prisma.postIt.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true } }
      }
    })

    return NextResponse.json({ postit: updatedPostit })
  } catch (error) {
    console.error('Error updating post-it:', error)
    return NextResponse.json(
      { error: 'Post-it güncellenirken hata oluştu' },
      { status: 500 }
    )
  }
}
