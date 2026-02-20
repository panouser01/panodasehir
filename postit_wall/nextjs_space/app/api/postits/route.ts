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
    const isAdmin = (session?.user as any)?.role === 'SUPER_ADMIN'

    const where: any = {
      expiresAt: {
        gt: new Date()
      }
    }

    // Only show approved post-its to non-admins
    if (!includeUnapproved || !isAdmin) {
      where.isApproved = true
    }

    if (categoryId) {
      where.categoryId = categoryId
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
        PostItImage: true // Include images
      },
      orderBy: {
        createdAt: 'desc'
      }
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
    const { content, imageUrl, imageUrls, link, color, font, pushpin, categoryId, expiresInDays } = body

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
        select: { userGroupId: true, role: true }
      })

      console.log('Category UserGroupId:', category.userGroupId)
      console.log('User UserGroupId:', user?.userGroupId)
      console.log('User Role:', user?.role)

      if (user?.role !== 'SUPER_ADMIN' && user?.userGroupId !== category.userGroupId) {
        return NextResponse.json(
          { error: 'Bu duvara sadece yetkili grup üyeleri yazabilir' },
          { status: 403 }
        )
      }
    }

    // Calculate expiry date
    const daysMap: { [key: string]: number } = {
      '1': 1,
      '3': 3,
      '7': 7,
      '30': 30
    }
    const days = daysMap[expiresInDays] || 7
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000)

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
        isApproved: true, // Auto-approve if moderation passes
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
