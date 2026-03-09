import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { moderateContent } from '@/lib/moderation'

export const dynamic = 'force-dynamic'

// GET all approved post-its
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const includeUnapproved = searchParams.get('includeUnapproved') === 'true'

    const session = await getServerSession(authOptions)

    // Housekeeping: Auto-unpublish expired post-its
    await prisma.postIt.updateMany({
      where: {
        expiresAt: { lt: new Date() },
        isPublished: true
      },
      data: { isPublished: false }
    })

    const isAdmin = (session?.user as any)?.role === 'SUPER_ADMIN'
    const isWallManager = (session?.user as any)?.role === 'WALL_MANAGER' || (session?.user as any)?.role === 'WALL_USER'
    const userId = (session?.user as any)?.id
    const where: any = {}

    // Only show unexpired, approved and published post-its to public/regular users
    if (!includeUnapproved || (!isAdmin && !isWallManager)) {
      where.expiresAt = { gt: new Date() }
      where.isApproved = true
      where.isPublished = true
      if (categoryId) {
        where.categoryId = categoryId
      }
    } else {
      // Logic for SUPER_ADMIN or WALL_MANAGER looking at admin dashboard
      if (isWallManager) {
        // Find all categories they manage including children
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

        if (categoryId) {
          if (managedIds.has(categoryId)) {
            where.categoryId = categoryId
          } else {
            where.categoryId = 'none-match'
          }
        } else {
          where.categoryId = { in: Array.from(managedIds) }
        }
      } else if (categoryId) {
        // SUPER_ADMIN wants a specific category
        where.categoryId = categoryId
      }
    }

    const postits = await prisma.postIt.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        },
        PostItImage: true, // Include images
        _count: {
          select: { likes: true }
        }
      },
      orderBy: [
        {
          likes: {
            _count: 'desc'
          }
        },
        {
          createdAt: 'desc'
        }
      ]
    })

    return NextResponse.json({ postits })
  } catch (error) {
    console.error('Error fetching post-its:', error)
    return NextResponse.json(
      { error: 'Post-it\'ler alınırken hata oluştu' },
      { status: 500 }
    )
  }
}

// CREATE new post-it
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Giriş yapmalısınız' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { content, imageUrl, imageUrls, link, color, font, pushpin, categoryId, expiresInDays, expiresAtDate } = body
    const userRole = (session.user as any).role

    if (!content || !categoryId) {
      return NextResponse.json(
        { error: 'İçerik ve kategori gereklidir' },
        { status: 400 }
      )
    }

    if (content.length > 500) {
      return NextResponse.json(
        { error: 'İçerik en fazla 500 karakter olabilir' },
        { status: 400 }
      )
    }

    // Moderate content
    const moderation = await moderateContent(content)

    if (!moderation.isApproved) {
      return NextResponse.json(
        {
          error: 'Uygunsuz içerik tespit edildi',
          reason: moderation.reason
        },
        { status: 400 }
      )
    }

    // Check category user group permission
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { userGroupId: true }
    })

    if (category?.userGroupId) {
      const user = await prisma.user.findUnique({
        where: { id: (session.user as any).id },
        select: { userGroups: { select: { id: true } }, role: true }
      })

      const userGroupIds = user?.userGroups?.map((g: any) => g.id) || []

      console.log('Category UserGroupId:', category.userGroupId)
      console.log('User UserGroupIds:', userGroupIds)
      console.log('User Role:', user?.role)

      if (user?.role !== 'SUPER_ADMIN' && !userGroupIds.includes(category.userGroupId)) {
        return NextResponse.json(
          { error: 'Bu duvara sadece yetkili grup üyeleri yazabilir' },
          { status: 403 }
        )
      }
    }

    // Calculate expiry date
    let expiresAt = new Date()
    if (expiresInDays === 'custom' && expiresAtDate) {
      expiresAt = new Date(expiresAtDate)
      // If it's earlier than today, just add 1 day to current date as fallback
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

    // Generate random rotation (-8 to 8 degrees)
    const rotation = Math.random() * 16 - 8

    // Determine main image URL
    // Use the first image from the list, or the legacy single image field
    const mainImageUrl = (imageUrls && imageUrls.length > 0) ? imageUrls[0] : (imageUrl || null)

    // Prepare images to create
    const imagesToCreate = (imageUrls && Array.isArray(imageUrls))
      ? imageUrls.map((url: string) => ({
        id: randomUUID(),
        url: url
      }))
      : (imageUrl ? [{ id: randomUUID(), url: imageUrl }] : [])

    const postit = await prisma.postIt.create({
      data: {
        content,
        imageUrl: mainImageUrl, // Backward compatibility
        link: link || null,
        color: color || 'YELLOW',
        font: font || 'HANDWRITING',
        pushpin: pushpin || 'RED',
        rotation,
        expiresAt,
        isApproved: userRole !== 'USER', // Require approval for USER role
        isPublished: true, // Auto-publish by default
        isModerated: true,
        userId: (session.user as any).id,
        categoryId,
        PostItImage: {
          create: imagesToCreate
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        },
        PostItImage: true
      }
    })

    // Increment category post count (fail-safe)
    try {
      await prisma.category.update({
        where: { id: categoryId },
        data: {
          postCount: {
            increment: 1
          }
        } as any
      })
    } catch (error: any) {
      console.error('Failed to update category post count:', error)
      // Continue without failing the request
    }

    return NextResponse.json({ postit }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating post-it:', error)
    if (error.code === 'P2003' && error.meta?.field_name === 'userId') {
      return NextResponse.json(
        { error: 'Oturumuzun süresi dolmuş veya kullanıcı bulunamadı. Lütfen çıkış yapıp tekrar giriş yapın.' },
        { status: 401 }
      )
    }
    // Handle Prisma error P2003 (Foreign key constraint failed) generically if meta doesn't match
    if (error.code === 'P2003') {
      // Log the specific constraint
      console.error('Constraint failed:', error.meta)
      // If it looks like userId failure based on previous logs
      const constraint = error.meta?.constraint || []
      if (constraint.includes('userId') || error.meta?.field_name === 'userId') {
        return NextResponse.json(
          { error: 'Oturum hatası: Kullanıcı bulunamadı. Lütfen tekrar giriş yapın.' },
          { status: 401 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Post-it oluşturulurken hata oluştu' },
      { status: 500 }
    )
  }
}
