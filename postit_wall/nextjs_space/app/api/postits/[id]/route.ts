import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET single post-it
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postit = await prisma.postIt.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true } }
      }
    })

    if (!postit) {
      return NextResponse.json({ error: 'Not bulunamadı' }, { status: 404 })
    }

    return NextResponse.json({ postit })
  } catch (error) {
    console.error('Error fetching postit:', error)
    return NextResponse.json({ error: 'Not alınırken hata oluştu' }, { status: 500 })
  }
}

// PATCH update post-it
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 })
    }

    const userRole = (session.user as any).role

    // Only super admin can edit posts
    if (userRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Bu işlemi yapmaya yetkiniz yok' }, { status: 403 })
    }

    const body = await request.json()
    const { content, categoryId, color, font, pushpin, link, isApproved } = body

    const updateData: any = {}
    if (content !== undefined) updateData.content = content
    if (categoryId !== undefined) updateData.categoryId = categoryId
    if (color !== undefined) updateData.color = color
    if (font !== undefined) updateData.font = font
    if (pushpin !== undefined) updateData.pushpin = pushpin
    if (link !== undefined) updateData.link = link
    if (isApproved !== undefined) updateData.isApproved = isApproved

    const existingPostit = await prisma.postIt.findUnique({
      where: { id: params.id },
      select: { isApproved: true, categoryId: true, expiresAt: true }
    })

    if (!existingPostit) {
      return NextResponse.json({ error: 'Post-it bulunamadı' }, { status: 404 })
    }

    const postit = await prisma.postIt.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true } }
      }
    })

    // Update category post count if approval status changed
    if (isApproved !== undefined && isApproved !== existingPostit.isApproved) {
      // Only valid if not expired
      const isNotExpired = new Date(existingPostit.expiresAt) > new Date()

      if (isNotExpired) {
        if (isApproved) {
          // Approved: Increment
          try {
            await prisma.category.update({
              where: { id: existingPostit.categoryId },
              data: { postCount: { increment: 1 } } as any
            })
          } catch (e) {
            console.error('Failed to increment post count:', e)
          }
        } else {
          // Unapproved: Decrement
          try {
            await prisma.category.update({
              where: { id: existingPostit.categoryId },
              data: { postCount: { decrement: 1 } } as any
            })
          } catch (e) {
            console.error('Failed to decrement post count:', e)
          }
        }
      }
    }

    return NextResponse.json({ postit })
  } catch (error) {
    console.error('Error updating postit:', error)
    return NextResponse.json({ error: 'Not güncellenirken hata oluştu' }, { status: 500 })
  }
}

// DELETE post-it
export async function DELETE(
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

    // Check permissions
    const canDelete =
      userRole === 'SUPER_ADMIN' ||
      (userRole === 'WALL_MANAGER' && postit.category?.wallManagerId === userId) ||
      postit.userId === userId

    if (!canDelete) {
      return NextResponse.json(
        { error: 'Bu işlemi yapmaya yetkiniz yok' },
        { status: 403 }
      )
    }

    await prisma.postIt.delete({
      where: { id: params.id }
    })

    // Decrement category post count if it was approved and not expired
    // Actually, we should only decrement if it contributed to the count.
    // The count is for "active approved post-its".
    // We should check if it was approved and active before decrementing?
    // The sync script counts: `isApproved: true` AND `expiresAt > now`.
    // So if we delete such a post-it, we decrement.
    // If we delete an unapproved or expired one, we shouldn't decrement.

    if (postit.isApproved && new Date(postit.expiresAt) > new Date()) {
      try {
        await prisma.category.update({
          where: { id: postit.categoryId },
          data: {
            postCount: {
              decrement: 1
            }
          } as any
        })
      } catch (updateError) {
        console.error('Failed to update category post count on delete:', updateError)
      }
    }

    return NextResponse.json({ message: 'Post-it silindi' })
  } catch (error) {
    console.error('Error deleting post-it:', error)
    return NextResponse.json(
      { error: 'Post-it silinirken hata oluştu' },
      { status: 500 }
    )
  }
}
