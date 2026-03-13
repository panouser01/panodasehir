import { randomUUID } from 'crypto'
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
    const userId = (session.user as any).id

    const existingPostit = await prisma.postIt.findUnique({
      where: { id: params.id },
      select: { isApproved: true, isPublished: true, categoryId: true, expiresAt: true }
    })

    if (!existingPostit) {
      return NextResponse.json({ error: 'Post-it bulunamadı' }, { status: 404 })
    }

    // Only super admin or wall manager can edit posts
    if (userRole !== 'SUPER_ADMIN' && userRole !== 'WALL_MANAGER' && userRole !== 'WALL_USER') {
      return NextResponse.json({ error: 'Bu işlemi yapmaya yetkiniz yok' }, { status: 403 })
    }

    if (userRole === 'WALL_MANAGER' || userRole === 'WALL_USER') {
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { userGroups: { select: { id: true } } }
      })
      const currentUserGroupIds = currentUser?.userGroups?.map((g: any) => g.id) || []

      // Find all categories they manage including children
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

      if (!managedIds.has(existingPostit.categoryId)) {
        return NextResponse.json({ error: 'Bu duvar üzerinde işlem yapma yetkiniz yok' }, { status: 403 })
      }
    }

    const body = await request.json()
    const { content, categoryId, color, font, pushpin, link, isApproved, isPublished, expiresInDays, expiresAtDate, imageUrl, imageUrls } = body

    const updateData: any = {}
    if (content !== undefined) updateData.content = content
    if (categoryId !== undefined) updateData.categoryId = categoryId
    if (color !== undefined) updateData.color = color
    if (font !== undefined) updateData.font = font
    if (pushpin !== undefined) updateData.pushpin = pushpin
    if (link !== undefined) updateData.link = link
    if (isApproved !== undefined) updateData.isApproved = isApproved
    if (isPublished !== undefined) updateData.isPublished = isPublished

    // Handle image updates
    if (imageUrls !== undefined && Array.isArray(imageUrls)) {
      updateData.imageUrl = imageUrls.length > 0 ? imageUrls[0] : null
      updateData.PostItImage = {
        deleteMany: {},
        create: imageUrls.map((url: string) => ({
          id: randomUUID(),
          url: url
        }))
      }
    } else if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl
      updateData.PostItImage = {
        deleteMany: {},
        create: imageUrl ? [{ id: randomUUID(), url: imageUrl }] : []
      }
    }

    if (expiresInDays !== undefined) {
      let expiresAt = new Date()
      if (expiresInDays === 'custom' && expiresAtDate) {
        expiresAt = new Date(expiresAtDate)
        if (expiresAt < new Date()) {
          expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      } else {
        const daysMap: { [key: string]: number } = {
          '1': 1,
          '3': 3,
          '7': 7,
          '30': 30
        }
        const days = daysMap[expiresInDays] || 1
        expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
      }
      updateData.expiresAt = expiresAt
    }

    const postit = await prisma.postIt.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true } }
      }
    })

    // Update category post count if approval or published status changed
    const statusChanged =
      (isApproved !== undefined && isApproved !== existingPostit.isApproved) ||
      (isPublished !== undefined && isPublished !== existingPostit.isPublished)

    if (statusChanged) {
      // Logic for postCount increment: if it becomes both approved AND published, AND not expired.
      // Wait, let's keep it simple: the sync background job usually handles postcounts accurately in large scale apps,
      // but let's do a basic sync here too.
      const currentlyValid = existingPostit.isApproved && existingPostit.isPublished
      const newApproved = isApproved !== undefined ? isApproved : existingPostit.isApproved
      const newPublished = isPublished !== undefined ? isPublished : existingPostit.isPublished
      const newlyValid = newApproved && newPublished

      const isNotExpired = new Date(existingPostit.expiresAt) > new Date()

      if (isNotExpired && currentlyValid !== newlyValid) {
        try {
          await prisma.category.update({
            where: { id: existingPostit.categoryId },
            data: { postCount: { [newlyValid ? 'increment' : 'decrement']: 1 } } as any
          })
        } catch (e) {
          console.error('Failed to update post count:', e)
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

    // Sadece SUPER_ADMIN silebilir
    if (userRole !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Post-it silme işlemini yalnızca Super Admin yapabilir' },
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

    if (postit.isApproved && postit.isPublished && new Date(postit.expiresAt) > new Date()) {
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
