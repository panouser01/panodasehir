import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Helper to check if user can manage a category
async function canManageCategory(userId: string, userRole: string, categoryId: string): Promise<boolean> {
  if (userRole === 'SUPER_ADMIN') return true
  if (userRole !== 'WALL_MANAGER') return false

  // Recursive function to check hierarchy
  async function checkHierarchy(catId: string): Promise<boolean> {
    const category = await prisma.category.findUnique({
      where: { id: catId },
      select: { wallManagers: { select: { id: true } }, parentId: true }
    })
    if (!category) return false
    if (category.wallManagers?.some((m: any) => m.id === userId)) return true
    if (category.parentId) return checkHierarchy(category.parentId)
    return false
  }

  return checkHierarchy(categoryId)
}

// GET single category with hierarchy info
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        assignedGroup: true,
        wallManagers: {
          select: { id: true, name: true, email: true }
        },
        parent: {
          select: { id: true, name: true }
        },
        children: {
          include: {
            wallManagers: { select: { id: true, name: true, email: true } },
            city: { select: { id: true, name: true } },
            district: { select: { id: true, name: true } },
            _count: { select: { postits: true } }
          }
        },
        city: { select: { id: true, name: true } },
        district: { select: { id: true, name: true } },
        calendarEntries: {
          include: { calendarCategory: true }
        },
        postits: {
          select: { id: true, content: true, isApproved: true }
        },
        _count: { select: { postits: true, children: true } }
      }
    })

    if (!category) {
      return NextResponse.json({ error: 'Kategori bulunamadı' }, { status: 404 })
    }

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json({ error: 'Kategori alınırken hata oluştu' }, { status: 500 })
  }
}

// UPDATE category
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userRole = (session?.user as any)?.role
    const userId = (session?.user as any)?.id

    if (!session?.user) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 })
    }

    const hasPermission = await canManageCategory(userId, userRole, params.id)
    if (!hasPermission) {
      return NextResponse.json({ error: 'Bu işlemi yapmaya yetkiniz yok' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name, description, wallManagerIds, userGroupId, movePostsTo,
      cityId, districtId,
      contactName, contactPhone, contactEmail,
      // Appearance fields
      heroBackgroundImage, heroSubtitle,
      heroTitleFont, heroTitleColor, heroTitleSize,
      heroSubtitleFont, heroSubtitleColor, heroSubtitleSize,
      heroGradientFrom, heroGradientVia, heroGradientTo,
      heroAlignment,
      categoryFont, categoryColor, categoryBgColor,
      calendarEntries // Array of { calendarCategoryId, date, content }
    } = body

    // Only super admin can change wallManagerIds or userGroupId
    if ((wallManagerIds !== undefined || userGroupId !== undefined) && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Yönetici veya grup atamak için Super Admin yetkisi gerekli' }, { status: 403 })
    }

    // If movePostsTo is specified, move posts to that category
    if (movePostsTo) {
      const targetHasPermission = await canManageCategory(userId, userRole, movePostsTo)
      if (!targetHasPermission) {
        return NextResponse.json({ error: 'Hedef kategoride yetkiniz yok' }, { status: 403 })
      }

      await prisma.postIt.updateMany({
        where: { categoryId: params.id },
        data: { categoryId: movePostsTo }
      })
    }

    const updateData: any = {}
    if (name) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (cityId !== undefined) updateData.cityId = cityId || null
    if (districtId !== undefined) updateData.districtId = districtId || null
    if (contactName !== undefined) updateData.contactName = contactName || null
    if (contactPhone !== undefined) updateData.contactPhone = contactPhone || null
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail || null
    if (userRole === 'SUPER_ADMIN') {
      if (wallManagerIds !== undefined) {
        updateData.wallManagers = { set: Array.isArray(wallManagerIds) ? wallManagerIds.map((id: string) => ({ id })) : [] }
      }
      if (userGroupId !== undefined) updateData.userGroupId = userGroupId || null
    }

    // Appearance fields
    if (heroBackgroundImage !== undefined) updateData.heroBackgroundImage = heroBackgroundImage || null
    if (heroSubtitle !== undefined) updateData.heroSubtitle = heroSubtitle || null
    if (heroTitleFont !== undefined) updateData.heroTitleFont = heroTitleFont
    if (heroTitleColor !== undefined) updateData.heroTitleColor = heroTitleColor
    if (heroTitleSize !== undefined) updateData.heroTitleSize = heroTitleSize
    if (heroSubtitleFont !== undefined) updateData.heroSubtitleFont = heroSubtitleFont
    if (heroSubtitleColor !== undefined) updateData.heroSubtitleColor = heroSubtitleColor
    if (heroSubtitleSize !== undefined) updateData.heroSubtitleSize = heroSubtitleSize
    if (heroGradientFrom !== undefined) updateData.heroGradientFrom = heroGradientFrom
    if (heroGradientVia !== undefined) updateData.heroGradientVia = heroGradientVia
    if (heroGradientTo !== undefined) updateData.heroGradientTo = heroGradientTo
    if (heroAlignment !== undefined) updateData.heroAlignment = heroAlignment
    if (categoryFont !== undefined) updateData.categoryFont = categoryFont
    if (categoryColor !== undefined) updateData.categoryColor = categoryColor
    if (categoryBgColor !== undefined) updateData.categoryBgColor = categoryBgColor

    // Board appearance fields
    const {
      backgroundColor, backgroundImage, borderColor, borderTopColor, borderBottomColor,
      isGradient, gradientFrom, gradientVia, gradientTo, isWallTransparent, noBorder
    } = body
    if (backgroundColor !== undefined) updateData.backgroundColor = backgroundColor
    if (backgroundImage !== undefined) updateData.backgroundImage = backgroundImage
    if (borderColor !== undefined) updateData.borderColor = borderColor
    if (borderTopColor !== undefined) updateData.borderTopColor = borderTopColor
    if (borderBottomColor !== undefined) updateData.borderBottomColor = borderBottomColor
    if (isGradient !== undefined) updateData.isGradient = isGradient
    if (gradientFrom !== undefined) updateData.gradientFrom = gradientFrom
    if (gradientVia !== undefined) updateData.gradientVia = gradientVia
    if (gradientTo !== undefined) updateData.gradientTo = gradientTo
    if (isWallTransparent !== undefined) updateData.isWallTransparent = isWallTransparent
    if (noBorder !== undefined) updateData.noBorder = noBorder

    // New fields for full parity with SiteSettings
    if (body.navMenuBgColor !== undefined) updateData.navMenuBgColor = body.navMenuBgColor
    if (body.navMenuFont !== undefined) updateData.navMenuFont = body.navMenuFont
    if (body.navMenuTextColor !== undefined) updateData.navMenuTextColor = body.navMenuTextColor
    if (body.navMenuFontSize !== undefined) updateData.navMenuFontSize = body.navMenuFontSize
    if (body.navMenuMainBold !== undefined) updateData.navMenuMainBold = body.navMenuMainBold
    if (body.siteBackgroundColor !== undefined) updateData.siteBackgroundColor = body.siteBackgroundColor
    if (body.siteBackgroundImage !== undefined) updateData.siteBackgroundImage = body.siteBackgroundImage
    if (body.siteGradientFrom !== undefined) updateData.siteGradientFrom = body.siteGradientFrom
    if (body.siteGradientVia !== undefined) updateData.siteGradientVia = body.siteGradientVia
    if (body.siteGradientTo !== undefined) updateData.siteGradientTo = body.siteGradientTo
    if (body.siteIsGradient !== undefined) updateData.siteIsGradient = body.siteIsGradient

    const category = await prisma.category.update({
      where: { id: params.id },
      data: updateData
    })

    if (calendarEntries !== undefined && Array.isArray(calendarEntries)) {
      await prisma.wallCalendarEntry.deleteMany({
        where: { categoryId: params.id }
      })

      if (calendarEntries.length > 0) {
        await prisma.wallCalendarEntry.createMany({
          data: calendarEntries.map((e: any) => ({
            categoryId: params.id,
            calendarCategoryId: e.calendarCategoryId,
            date: new Date(e.date || new Date()),
            content: e.content || ''
          }))
        })
      }
    }

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({ error: 'Kategori güncellenirken hata oluştu' }, { status: 500 })
  }
}

// DELETE category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userRole = (session?.user as any)?.role
    const userId = (session?.user as any)?.id

    if (!session?.user) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 })
    }

    const hasPermission = await canManageCategory(userId, userRole, params.id)
    if (!hasPermission) {
      return NextResponse.json({ error: 'Bu işlemi yapmaya yetkiniz yok' }, { status: 403 })
    }

    // Check if category has posts or children
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: { _count: { select: { postits: true, children: true } } }
    })

    if (!category) {
      return NextResponse.json({ error: 'Kategori bulunamadı' }, { status: 404 })
    }

    if (category._count.postits > 0) {
      return NextResponse.json(
        { error: 'Bu kategoride notlar var, önce notları silin veya taşıyın' },
        { status: 400 }
      )
    }

    if (category._count.children > 0) {
      return NextResponse.json(
        { error: 'Bu kategoride alt kategoriler var, önce onları silin' },
        { status: 400 }
      )
    }

    await prisma.category.delete({ where: { id: params.id } })

    return NextResponse.json({ message: 'Kategori silindi' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Kategori silinirken hata oluştu' }, { status: 500 })
  }
}
