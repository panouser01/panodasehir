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
    if (userRole !== 'SUPER_ADMIN' && userRole !== 'WALL_MANAGER' && userRole !== 'WALL_USER') {
      return NextResponse.json({ error: 'Bu işlemi yapmaya yetkiniz yok' }, { status: 403 })
    }

    if (userRole === 'WALL_MANAGER' || userRole === 'WALL_USER') {
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { userGroups: { select: { id: true } } }
      })
      const currentUserGroupIds = currentUser?.userGroups?.map((g: any) => g.id) || []

      const allCategories = await prisma.category.findMany({
        select: { id: true, parentId: true, userGroupId: true, wallManagers: { select: { id: true } } }
      })
      const managedIds = new Set<string>()

      allCategories.forEach(cat => {
        if (
          cat.wallManagers?.some((m: any) => m.id === userId) ||
          (cat.userGroupId && currentUserGroupIds.includes(cat.userGroupId))
        ) {
          managedIds.add(cat.id)
        }
      })

      let added = true
      while (added) {
        added = false
        allCategories.forEach(cat => {
          if (cat.parentId && managedIds.has(cat.parentId) && !managedIds.has(cat.id)) {
            managedIds.add(cat.id)
            added = true
          }
        })
      }

      if (!managedIds.has(postit.categoryId)) {
        return NextResponse.json(
          { error: 'Bu işlemi yapmaya yetkiniz yok' },
          { status: 403 }
        )
      }
    }

    // Build update data
    const updateData: any = {}
    if (isApproved !== undefined) {
      updateData.isApproved = isApproved;
      if (isApproved === true && postit.isPublished === true) {
        updateData.hasBeenPublished = true;
      }
    }
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
        user: { select: { id: true, name: true, nickname: true, email: true } },
        category: { select: { id: true, name: true } }
      }
    })

    // If it was just approved and is not a direct message, notify subscribers
    if (isApproved === true && postit.isApproved === false && updatedPostit.isPublished && !updatedPostit.content.startsWith('[ÖZEL MESAJ]')) {
      try {
        const { notifySubscribers, notifyFollowers } = await import('@/lib/telegram');
        const authorName = updatedPostit.user?.nickname || updatedPostit.user?.name || 'Bir kullanıcı';
        const categoryName = updatedPostit.category?.name || 'Bilinmiyor';
        const authorId = updatedPostit.user?.id;
        
        await notifySubscribers(updatedPostit.categoryId, categoryName, updatedPostit.content, authorName, authorId);
        if (authorId) {
          await notifyFollowers(authorId, authorName, updatedPostit.content, categoryName, updatedPostit.categoryId);
        }
      } catch (err) {
        console.error("Abone bildirim hatası:", err);
      }
    }

    return NextResponse.json({ postit: updatedPostit })
  } catch (error) {
    console.error('Error updating post-it:', error)
    return NextResponse.json(
      { error: 'Post-it güncellenirken hata oluştu' },
      { status: 500 }
    )
  }
}
