import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { moderateContent } from '@/lib/moderation'

export const dynamic = 'force-dynamic'

// PATCH - Update user's own post-it
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

    const userId = (session.user as any).id

    // Check if post belongs to user
    const existingPost = await prisma.postIt.findUnique({
      where: { id: params.id }
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post-it bulunamadı' },
        { status: 404 }
      )
    }

    if (existingPost.userId !== userId) {
      return NextResponse.json(
        { error: 'Bu post-it\'i düzenleme yetkiniz yok' },
        { status: 403 }
      )
    }

    const userRole = (session.user as any)?.role

    if (existingPost.hasBeenPublished && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Yayınlanmış postitler düzenlenemez. Sadece görünürlüğünü kapatabilirsiniz.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { content, color, font, pushpin, link, categoryId, imageUrl, imageUrls, createdAt, expiresAt } = body

    const updateData: any = {}

    // If content changed, moderate it
    if (content !== undefined && content !== existingPost.content) {
      if (content.length > 2500) {
        return NextResponse.json(
          { error: 'İçerik en fazla 2500 karakter olabilir' },
          { status: 400 }
        )
      }

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
      updateData.content = content
    }

    if (color !== undefined) updateData.color = color
    if (font !== undefined) updateData.font = font
    if (pushpin !== undefined) updateData.pushpin = pushpin
    if (link !== undefined) updateData.link = link || null
    if (categoryId !== undefined) updateData.categoryId = categoryId
    if (createdAt !== undefined) updateData.createdAt = new Date(createdAt)
    if (expiresAt !== undefined) updateData.expiresAt = new Date(expiresAt)

    // Handle images
    if (imageUrls !== undefined) {
      // Set main image URL (first one or null)
      const mainImageUrl = (Array.isArray(imageUrls) && imageUrls.length > 0) ? imageUrls[0] : null
      updateData.imageUrl = mainImageUrl

      // Manage PostItImage relation
      // We will replace all images with the new list
      updateData.PostItImage = {
        deleteMany: {}, // Delete all existing images for this post-it
        create: Array.isArray(imageUrls) ? imageUrls.map((url: string) => ({
          id: randomUUID(),
          url: url
        })) : []
      }
    } else if (imageUrl !== undefined) {
      // Fallback for legacy single image update if imageUrls not provided
      updateData.imageUrl = imageUrl || null
      // If setting to null/empty, we should clear images? 
      // Or just assume single image update clears others? 
      // Let's keep it simple: if only imageUrl provided, we treat it as single image mode
      if (imageUrl) {
        updateData.PostItImage = {
          deleteMany: {},
          create: [{
            id: randomUUID(),
            url: imageUrl
          }]
        }
      } else {
        updateData.PostItImage = {
          deleteMany: {}
        }
      }
    }

    const postit = await prisma.postIt.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true } },
        PostItImage: {
          orderBy: {
            id: 'asc'
          }
        }
      }
    })

    return NextResponse.json({ postit })
  } catch (error) {
    console.error('Error updating postit:', error)
    return NextResponse.json(
      { error: 'Post-it güncellenirken hata oluştu' },
      { status: 500 }
    )
  }
}
