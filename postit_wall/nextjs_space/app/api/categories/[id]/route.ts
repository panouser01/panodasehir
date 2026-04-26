import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { revalidateTag } from 'next/cache'

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
        wallViewers: {
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
          },
          orderBy: [
            { order: 'asc' },
            { name: 'asc' }
          ]
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
      name, description, wallManagerIds, wallViewerIds, userGroupId, movePostsTo,
      cityId, districtId,
      contactName, contactPhone, contactEmail,
      // Appearance fields
      heroBackgroundImage, heroBackgroundStyle, isHeroTransparent, heroSubtitle, hideHeroText,
      heroTitleFont, heroTitleColor, heroTitleSize,
      heroSubtitleFont, heroSubtitleColor, heroSubtitleSize,
      hideWallTitle, hideWallRibbon, hideHeroPushpin,
      heroGradientFrom, heroGradientVia, heroGradientTo,
      heroAlignment,
      categoryFont, categoryColor, categoryBgColor,
      calendarEntries // Array of { calendarCategoryId, date, content }
    } = body

    // Only super admin can change wallManagerIds, wallViewerIds or userGroupId
    if ((wallManagerIds !== undefined || wallViewerIds !== undefined || userGroupId !== undefined) && userRole !== 'SUPER_ADMIN') {
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
    if (body.districtId !== undefined) updateData.districtId = body.districtId === '' ? null : body.districtId
    if (body.contactName !== undefined) updateData.contactName = body.contactName
    if (body.contactPhone !== undefined) updateData.contactPhone = body.contactPhone
    if (body.contactEmail !== undefined) updateData.contactEmail = body.contactEmail
    if (body.icon !== undefined) updateData.icon = body.icon || null
    if (body.parentId !== undefined) updateData.parentId = body.parentId
    if (userRole === 'SUPER_ADMIN') {
      if (wallManagerIds !== undefined) {
        updateData.wallManagers = { set: Array.isArray(wallManagerIds) ? wallManagerIds.map((id: string) => ({ id })) : [] }
      }
      if (wallViewerIds !== undefined) {
        updateData.wallViewers = { set: Array.isArray(wallViewerIds) ? wallViewerIds.map((id: string) => ({ id })) : [] }
      }
      if (userGroupId !== undefined) updateData.userGroupId = userGroupId || null
    }

    // Appearance fields
    if (heroBackgroundImage !== undefined) updateData.heroBackgroundImage = heroBackgroundImage || null
    if (heroBackgroundStyle !== undefined) updateData.heroBackgroundStyle = heroBackgroundStyle
    if (isHeroTransparent !== undefined) updateData.isHeroTransparent = isHeroTransparent
    if (heroSubtitle !== undefined) updateData.heroSubtitle = heroSubtitle || null
    if (heroTitleFont !== undefined) updateData.heroTitleFont = heroTitleFont
    if (hideHeroText !== undefined) updateData.hideHeroText = hideHeroText
    if (heroTitleColor !== undefined) updateData.heroTitleColor = heroTitleColor
    if (heroTitleSize !== undefined) updateData.heroTitleSize = heroTitleSize
    if (heroSubtitleFont !== undefined) updateData.heroSubtitleFont = heroSubtitleFont
    if (heroSubtitleColor !== undefined) updateData.heroSubtitleColor = heroSubtitleColor
    if (heroSubtitleSize !== undefined) updateData.heroSubtitleSize = heroSubtitleSize
    if (hideWallTitle !== undefined) updateData.hideWallTitle = hideWallTitle
    if (hideWallRibbon !== undefined) updateData.hideWallRibbon = hideWallRibbon
    if (hideHeroPushpin !== undefined) updateData.hideHeroPushpin = hideHeroPushpin
    if (heroGradientFrom !== undefined) updateData.heroGradientFrom = heroGradientFrom
    if (heroGradientVia !== undefined) updateData.heroGradientVia = heroGradientVia
    if (heroGradientTo !== undefined) updateData.heroGradientTo = heroGradientTo
    if (heroAlignment !== undefined) updateData.heroAlignment = heroAlignment
    if (categoryFont !== undefined) updateData.categoryFont = categoryFont
    if (categoryColor !== undefined) updateData.categoryColor = categoryColor
    if (categoryBgColor !== undefined) updateData.categoryBgColor = categoryBgColor
    if (body.ribbonColor !== undefined) updateData.ribbonColor = body.ribbonColor
    if (body.ribbonTextColor !== undefined) updateData.ribbonTextColor = body.ribbonTextColor
    if (body.ribbonTextFont !== undefined) updateData.ribbonTextFont = body.ribbonTextFont
    if (body.customRibbonText !== undefined) updateData.customRibbonText = body.customRibbonText
    if (body.ribbonImage !== undefined) updateData.ribbonImage = body.ribbonImage
    if (body.ribbonAlignment !== undefined) updateData.ribbonAlignment = body.ribbonAlignment

    // Board appearance fields
    const {
      backgroundColor, backgroundImage, borderColor, borderTopColor, borderBottomColor,
      isGradient, gradientFrom, gradientVia, gradientTo, isWallTransparent, isWallBackgroundRepeat, noBorder, noInnerBorder, innerBackgroundColor, isInnerTransparent
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
    if (isWallBackgroundRepeat !== undefined) updateData.isWallBackgroundRepeat = isWallBackgroundRepeat
    if (noBorder !== undefined) updateData.noBorder = noBorder
    if (noInnerBorder !== undefined) updateData.noInnerBorder = noInnerBorder
    if (innerBackgroundColor !== undefined) updateData.innerBackgroundColor = innerBackgroundColor
    if (isInnerTransparent !== undefined) updateData.isInnerTransparent = isInnerTransparent

    // New fields for full parity with SiteSettings
    if (body.navMenuBgColor !== undefined) updateData.navMenuBgColor = body.navMenuBgColor
    if (body.navMenuFont !== undefined) updateData.navMenuFont = body.navMenuFont
    if (body.navMenuTextColor !== undefined) updateData.navMenuTextColor = body.navMenuTextColor
    if (body.navMenuFontSize !== undefined) updateData.navMenuFontSize = body.navMenuFontSize
    if (body.navMenuMainBold !== undefined) updateData.navMenuMainBold = body.navMenuMainBold
    if (body.siteBackgroundColor !== undefined) updateData.siteBackgroundColor = body.siteBackgroundColor
    if (body.siteBackgroundImage !== undefined) updateData.siteBackgroundImage = body.siteBackgroundImage
    if (body.siteBackgroundStyle !== undefined) updateData.siteBackgroundStyle = body.siteBackgroundStyle
    if (body.siteGradientFrom !== undefined) updateData.siteGradientFrom = body.siteGradientFrom
    if (body.siteGradientVia !== undefined) updateData.siteGradientVia = body.siteGradientVia
    if (body.siteGradientTo !== undefined) updateData.siteGradientTo = body.siteGradientTo
    if (body.siteIsGradient !== undefined) updateData.siteIsGradient = body.siteIsGradient
    if (body.homeCategoryIds !== undefined) updateData.homeCategoryIds = body.homeCategoryIds
    if (body.postitLimit !== undefined) {
      const parsedLimit = parseInt(body.postitLimit);
      updateData.postitLimit = isNaN(parsedLimit) ? 0 : parsedLimit;
    }
    if (body.logoUrl !== undefined) updateData.logoUrl = body.logoUrl || null
    if (body.logoPosition !== undefined) updateData.logoPosition = body.logoPosition
    if (body.logoSize !== undefined) updateData.logoSize = body.logoSize
    if (body.logoFrame !== undefined) updateData.logoFrame = body.logoFrame
    if (body.useParentLogo !== undefined) updateData.useParentLogo = body.useParentLogo

    // Layout configuration
    if (body.useCustomLayout !== undefined) updateData.useCustomLayout = body.useCustomLayout
    if (body.customLayout !== undefined) updateData.customLayout = body.customLayout
    if (body.postitAppearance !== undefined) updateData.postitAppearance = body.postitAppearance

    // OTT configuration
    if (body.isOttActive !== undefined) updateData.isOttActive = body.isOttActive
    if (body.showVirtualPostitsIfEmpty !== undefined) updateData.showVirtualPostitsIfEmpty = body.showVirtualPostitsIfEmpty
    if (body.showVirtualPostitLogos !== undefined) updateData.showVirtualPostitLogos = body.showVirtualPostitLogos
    if (body.ottItemsPerRow !== undefined) updateData.ottItemsPerRow = parseInt(body.ottItemsPerRow)
    if (body.ottCardRatio !== undefined) updateData.ottCardRatio = body.ottCardRatio
    if (body.ottAutoScrollSpeed !== undefined) updateData.ottAutoScrollSpeed = parseFloat(body.ottAutoScrollSpeed)
    if (body.ottShowTopMenu !== undefined) updateData.ottShowTopMenu = body.ottShowTopMenu
    if (body.ottShowHeroSlider !== undefined) updateData.ottShowHeroSlider = body.ottShowHeroSlider
    if (body.ottTopMenuShape !== undefined) updateData.ottTopMenuShape = body.ottTopMenuShape
    if (body.ottShowCategoryTitles !== undefined) updateData.ottShowCategoryTitles = body.ottShowCategoryTitles
    if (body.ottCardStyle !== undefined) updateData.ottCardStyle = body.ottCardStyle
    if (body.ottCategoryTitleSize !== undefined) updateData.ottCategoryTitleSize = body.ottCategoryTitleSize
    if (body.ottCategoryHeaderGlassy !== undefined) updateData.ottCategoryHeaderGlassy = body.ottCategoryHeaderGlassy
    if (body.ottCategoryTitleColor !== undefined) updateData.ottCategoryTitleColor = body.ottCategoryTitleColor
    if (body.ottCategoryTitleAlignment !== undefined) updateData.ottCategoryTitleAlignment = body.ottCategoryTitleAlignment
    if (body.ottCategoryTitleFont !== undefined) updateData.ottCategoryTitleFont = body.ottCategoryTitleFont
    if (body.ottSeparatorStyle !== undefined) updateData.ottSeparatorStyle = body.ottSeparatorStyle
    if (body.ottSeparatorColor !== undefined) updateData.ottSeparatorColor = body.ottSeparatorColor
    if (body.ottTopMenuLabelBgColor !== undefined) updateData.ottTopMenuLabelBgColor = body.ottTopMenuLabelBgColor
    if (body.ottTopMenuLabelHasBorder !== undefined) updateData.ottTopMenuLabelHasBorder = body.ottTopMenuLabelHasBorder
    if (body.ottTopMenuIconBgColor !== undefined) updateData.ottTopMenuIconBgColor = body.ottTopMenuIconBgColor
    if (body.ottCardBgType !== undefined) updateData.ottCardBgType = body.ottCardBgType
    if (body.ottCardBgColor !== undefined) updateData.ottCardBgColor = body.ottCardBgColor
    if (body.ottCardBgColorAlpha !== undefined) updateData.ottCardBgColorAlpha = parseInt(body.ottCardBgColorAlpha?.toString() || '100')
    if (body.ottCardBgImage !== undefined) updateData.ottCardBgImage = body.ottCardBgImage
    if (body.ottModalBgType !== undefined) updateData.ottModalBgType = body.ottModalBgType
    if (body.ottModalBgColor !== undefined) updateData.ottModalBgColor = body.ottModalBgColor
    if (body.ottModalBgColorAlpha !== undefined) updateData.ottModalBgColorAlpha = parseInt(body.ottModalBgColorAlpha?.toString() || '70')
    if (body.ottModalBgImage !== undefined) updateData.ottModalBgImage = body.ottModalBgImage
    if (body.ottModalTextColor !== undefined) updateData.ottModalTextColor = body.ottModalTextColor
    if (body.ottTopMenuMarqueeActive !== undefined) updateData.ottTopMenuMarqueeActive = body.ottTopMenuMarqueeActive
    if (body.ottTopMenuMarqueeSpeed !== undefined) updateData.ottTopMenuMarqueeSpeed = parseFloat(body.ottTopMenuMarqueeSpeed?.toString() || '30')
    if (body.isEditorModeActive !== undefined) (updateData as any).isEditorModeActive = body.isEditorModeActive
    if (body.isStyleModeActive !== undefined) (updateData as any).isStyleModeActive = body.isStyleModeActive
    if (body.styleModeSettings !== undefined) (updateData as any).styleModeSettings = body.styleModeSettings

    if (body.isActive !== undefined) updateData.isActive = body.isActive
    if (body.isPrivate !== undefined) updateData.isPrivate = body.isPrivate
    if (body.expirationDate !== undefined) {
      updateData.expirationDate = body.expirationDate ? new Date(body.expirationDate) : null
    }

    console.log("CATEGORY PATCH DEBUG - ID:", params.id);
    console.log("CATEGORY PATCH DEBUG - Incoming postitAppearance:", body.postitAppearance);
    console.log("CATEGORY PATCH DEBUG - Final updateData:", JSON.stringify(updateData));

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

    revalidateTag('all-categories-tree')
    return NextResponse.json({ category })
  } catch (error) {
    console.error('Error updating category:', error)
    const err = error as Error
    return NextResponse.json({ error: err.message || 'Kategori güncellenirken hata oluştu' }, { status: 500 })
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

    revalidateTag('all-categories-tree')
    return NextResponse.json({ message: 'Kategori silindi' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Kategori silinirken hata oluştu' }, { status: 500 })
  }
}
