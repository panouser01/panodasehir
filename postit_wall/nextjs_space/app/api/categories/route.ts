import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { revalidateTag } from 'next/cache'

export const dynamic = 'force-dynamic'

// Helper to check if user can manage a category (is wall manager or super admin)
async function canManageCategory(userId: string, userRole: string, categoryId: string): Promise<boolean> {
  if (userRole === 'SUPER_ADMIN') return true
  if (userRole !== 'WALL_MANAGER') return false

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { parent: true }
  })

  if (!category) return false

  // Check if user is wall manager of this category or any parent
  let currentCat: any = category
  while (currentCat) {
    if (currentCat.wallManagers?.some((m: any) => m.id === userId)) return true
    currentCat = currentCat.parent
  }

  return false
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id
    const userRole = (session?.user as any)?.role

    const activeFilter = {
      isApproved: true,
      isPublished: true,
      expiresAt: { gt: new Date() }
    }

    const categories = await prisma.category.findMany({
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
        city: { select: { id: true, name: true } },
        district: { select: { id: true, name: true } },
        children: {
          include: {
            assignedGroup: true,
            wallManagers: {
              select: { id: true, name: true, email: true }
            },
            wallViewers: {
              select: { id: true, name: true, email: true }
            },
            _count: {
              select: {
                postits: { where: activeFilter }
              }
            },
            city: { select: { id: true, name: true } },
            district: { select: { id: true, name: true } },
            children: {
              include: {
                assignedGroup: true,
                wallManagers: {
                  select: { id: true, name: true, email: true }
                },
                wallViewers: {
                  select: { id: true, name: true, email: true }
                },
                _count: {
                  select: {
                    postits: { where: activeFilter }
                  }
                },
                children: {
                  include: {
                    assignedGroup: true,
                    wallManagers: {
                      select: { id: true, name: true, email: true }
                    },
                    wallViewers: {
                      select: { id: true, name: true, email: true }
                    },
                    _count: {
                      select: {
                        postits: { where: activeFilter }
                      }
                    },
                    children: {
                      include: {
                        assignedGroup: true,
                        wallManagers: {
                          select: { id: true, name: true, email: true }
                        },
                        wallViewers: {
                          select: { id: true, name: true, email: true }
                        },
                        _count: {
                          select: {
                            postits: { where: activeFilter }
                          }
                        }
                      },
                      orderBy: [
                        { order: 'asc' },
                        { name: 'asc' }
                      ]
                    }
                  },
                  orderBy: [
                    { order: 'asc' },
                    { name: 'asc' }
                  ]
                }
              },
              orderBy: [
                { order: 'asc' },
                { name: 'asc' }
              ]
            }
          },
          orderBy: [
            { order: 'asc' },
            { name: 'asc' }
          ]
        },
        _count: {
          select: {
            postits: { where: activeFilter }
          }
        },
        calendarEntries: {
          include: { calendarCategory: true }
        }
      },
      orderBy: [
        { order: 'asc' },
        { name: 'asc' }
      ]
    })

    // Filter viewers recursively
    const filterViewers = (cats: any[]): any[] => {
      const filtered = cats.filter(cat => {
        const hasViewers = cat.wallViewers && cat.wallViewers.length > 0
        if (!hasViewers) return true

        if (userRole === 'SUPER_ADMIN') return true
        if (!userId) return false
        
        const isViewer = cat.wallViewers.some((v: any) => v.id === userId)
        const isManager = cat.wallManagers?.some((m: any) => m.id === userId)

        return isViewer || isManager
      })

      return filtered.map(cat => ({
        ...cat,
        children: cat.children ? filterViewers(cat.children) : []
      }))
    }

    // Map _count.postits to postCount recursively for the frontend
    const mapCounts = (cats: any[]): any[] => {
      return cats.map(cat => ({
        ...cat,
        postCount: cat._count?.postits || 0,
        children: cat.children ? mapCounts(cat.children) : []
      }))
    }

    const visibleCategories = filterViewers(categories)
    const categoriesWithCounts = mapCounts(visibleCategories)

    return NextResponse.json({ categories: categoriesWithCounts })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Kategoriler alınırken hata oluştu' },
      { status: 500 }
    )
  }
}

// CREATE category or subcategory
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userRole = (session?.user as any)?.role
    const userId = (session?.user as any)?.id

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      name, description, icon, wallManagerIds, wallViewerIds, userGroupId, parentId, movePostsToNew,
      cityId, districtId,
      contactName, contactPhone, contactEmail,
      // Appearance fields
      heroBackgroundImage, heroBackgroundStyle, isHeroTransparent, heroSubtitle,
      heroTitleFont, heroTitleColor, heroTitleSize,
      heroSubtitleFont, heroSubtitleColor, heroSubtitleSize,
      hideWallTitle, hideWallRibbon, hideHeroPushpin,
      heroGradientFrom, heroGradientVia, heroGradientTo,
      categoryFont, categoryColor, categoryBgColor, ribbonColor, ribbonTextColor, ribbonTextFont, customRibbonText,
      logoUrl, logoPosition, logoSize, logoFrame, useParentLogo,
      useCustomLayout, customLayout, postitAppearance,
      isOttActive, ottItemsPerRow, ottCardRatio, ottAutoScrollSpeed, showVirtualPostitsIfEmpty, showVirtualPostitLogos,
      calendarEntries // Array of { calendarCategoryId, date, content }
    } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Kategori adı gereklidir' },
        { status: 400 }
      )
    }

    // For root categories, only super admin can create
    if (!parentId && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Ana kategori oluşturmak için Super Admin yetkisi gereklidir' },
        { status: 403 }
      )
    }

    // For subcategories, check if user has permission on parent
    if (parentId) {
      const hasPermission = await canManageCategory(userId, userRole, parentId)
      if (!hasPermission) {
        return NextResponse.json(
          { error: 'Bu duvar altında alt kategori oluşturma yetkiniz yok' },
          { status: 403 }
        )
      }
    }

    // Check if category with same name exists under same parent
    const existingCategory = await prisma.category.findFirst({
      where: {
        name,
        parentId: parentId || null
      }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Bu isimde bir kategori zaten mevcut' },
        { status: 400 }
      )
    }

    const category = await prisma.category.create({
      data: {
        name,
        description: description || null,
        icon: icon || null,
        wallManagers: wallManagerIds && wallManagerIds.length > 0 ? { connect: wallManagerIds.map((id: string) => ({ id })) } : undefined,
        wallViewers: wallViewerIds && wallViewerIds.length > 0 ? { connect: wallViewerIds.map((id: string) => ({ id })) } : undefined,
        userGroupId: userGroupId || null,
        parentId: parentId || null,
        cityId: cityId || null,
        districtId: districtId || null,
        contactName: contactName || null,
        contactPhone: contactPhone || null,
        contactEmail: contactEmail || null,
        // Appearance fields
        heroBackgroundImage: heroBackgroundImage || null,
        heroBackgroundStyle: heroBackgroundStyle || 'cover',
        isHeroTransparent: isHeroTransparent !== undefined ? isHeroTransparent : false,
        heroSubtitle: heroSubtitle || null,
        heroTitleFont: heroTitleFont || 'sans-serif',
        heroTitleColor: heroTitleColor || '#ffffff',
        heroTitleSize: heroTitleSize || '5xl',
        heroSubtitleFont: heroSubtitleFont || 'sans-serif',
        heroSubtitleColor: heroSubtitleColor || '#ffffff',
        heroSubtitleSize: heroSubtitleSize || 'xl',
        hideWallTitle: hideWallTitle || false,
        hideWallRibbon: hideWallRibbon || false,
        hideHeroPushpin: hideHeroPushpin || false,
        heroGradientFrom: heroGradientFrom || '#facc15',
        heroGradientVia: heroGradientVia || '#f472b6',
        heroGradientTo: heroGradientTo || '#a855f7',
        categoryFont: categoryFont || 'sans-serif',
        categoryColor: categoryColor || '#1f2937',
        categoryBgColor: categoryBgColor || '#ffffff',
        ribbonColor: ribbonColor || '#502bb1',
        ribbonTextColor: ribbonTextColor || '#ffffff',
        ribbonTextFont: ribbonTextFont || 'sans-serif',
        customRibbonText: customRibbonText || null,
        // Board appearance fields
        backgroundColor: body.backgroundColor || null,
        backgroundImage: body.backgroundImage || null,
        ribbonImage: body.ribbonImage,
        ribbonAlignment: body.ribbonAlignment,
        borderColor: body.borderColor || null,
        borderTopColor: body.borderTopColor || null,
        borderBottomColor: body.borderBottomColor || null,
        isGradient: body.isGradient !== undefined ? body.isGradient : null,
        gradientFrom: body.gradientFrom || '#facc15',
        gradientVia: body.gradientVia || '#f472b6',
        gradientTo: body.gradientTo || '#a855f7',
        isWallTransparent: body.isWallTransparent !== undefined ? body.isWallTransparent : null,
        isWallBackgroundRepeat: body.isWallBackgroundRepeat !== undefined ? body.isWallBackgroundRepeat : null,
        noBorder: body.noBorder !== undefined ? body.noBorder : null,
        noInnerBorder: body.noInnerBorder !== undefined ? body.noInnerBorder : null,
        innerBackgroundColor: body.innerBackgroundColor || null,
        isInnerTransparent: body.isInnerTransparent !== undefined ? body.isInnerTransparent : null,
        // Full parity with SiteSettings
        navMenuBgColor: body.navMenuBgColor || null,
        navMenuFont: body.navMenuFont || null,
        navMenuTextColor: body.navMenuTextColor || null,
        navMenuFontSize: body.navMenuFontSize || null,
        navMenuMainBold: body.navMenuMainBold !== undefined ? body.navMenuMainBold : null,
        siteBackgroundColor: body.siteBackgroundColor || null,
        siteBackgroundImage: body.siteBackgroundImage || null,
        siteBackgroundStyle: body.siteBackgroundStyle || 'repeat',
        siteGradientFrom: body.siteGradientFrom || null,
        siteGradientVia: body.siteGradientVia || null,
        siteGradientTo: body.siteGradientTo || null,
        siteIsGradient: body.siteIsGradient !== undefined ? body.siteIsGradient : null,
        homeCategoryIds: body.homeCategoryIds || null,
        postitLimit: body.postitLimit !== undefined ? parseInt(body.postitLimit) : 0,
        logoUrl: logoUrl || null,
        logoPosition: logoPosition || 'top-right',
        logoSize: logoSize || 'medium',
        logoFrame: logoFrame || 'original',
        useParentLogo: useParentLogo !== undefined ? useParentLogo : false,
        useCustomLayout: useCustomLayout !== undefined ? useCustomLayout : false,
        customLayout: customLayout || null,
        postitAppearance: postitAppearance || null,
        isOttActive: isOttActive !== undefined ? isOttActive : false,
        showVirtualPostitsIfEmpty: showVirtualPostitsIfEmpty !== undefined ? showVirtualPostitsIfEmpty : true,
        showVirtualPostitLogos: showVirtualPostitLogos !== undefined ? showVirtualPostitLogos : false,
        ottItemsPerRow: ottItemsPerRow !== undefined ? parseInt(ottItemsPerRow) : 4,
        ottCardRatio: ottCardRatio || '16/9',
        ottAutoScrollSpeed: ottAutoScrollSpeed !== undefined ? parseInt(ottAutoScrollSpeed) : 0,
        ottShowTopMenu: body.ottShowTopMenu !== undefined ? body.ottShowTopMenu : true,
        ottShowHeroSlider: body.ottShowHeroSlider !== undefined ? body.ottShowHeroSlider : true,
        ottTopMenuShape: body.ottTopMenuShape || 'circle',
        ottShowCategoryTitles: body.ottShowCategoryTitles !== undefined ? body.ottShowCategoryTitles : true,
        ottCardStyle: body.ottCardStyle || 'cover',
        ottCategoryTitleSize: body.ottCategoryTitleSize || '2xl',
        ottCategoryHeaderGlassy: body.ottCategoryHeaderGlassy !== undefined ? body.ottCategoryHeaderGlassy : false,
        ottCategoryTitleColor: body.ottCategoryTitleColor || null,
        ottCategoryTitleAlignment: body.ottCategoryTitleAlignment || 'left',
        ottCategoryTitleFont: body.ottCategoryTitleFont || 'sans-serif',
        ottSeparatorStyle: body.ottSeparatorStyle || 'none',
        ottSeparatorColor: body.ottSeparatorColor || null,
        ottTopMenuLabelBgColor: body.ottTopMenuLabelBgColor || null,
        ottTopMenuLabelHasBorder: body.ottTopMenuLabelHasBorder !== undefined ? body.ottTopMenuLabelHasBorder : false,
        ottTopMenuIconBgColor: body.ottTopMenuIconBgColor || null,
        ottCardBgType: body.ottCardBgType || 'postit',
        ottCardBgColor: body.ottCardBgColor || null,
        ottCardBgColorAlpha: body.ottCardBgColorAlpha !== undefined ? parseInt(body.ottCardBgColorAlpha) : 100,
        ottCardBgImage: body.ottCardBgImage || null,
        ottModalBgType: body.ottModalBgType || 'postit',
        ottModalBgColor: body.ottModalBgColor || null,
        ottModalBgColorAlpha: body.ottModalBgColorAlpha !== undefined ? parseInt(body.ottModalBgColorAlpha) : 70,
        ottModalBgImage: body.ottModalBgImage || null,
        ottModalTextColor: body.ottModalTextColor || null,
        ottTopMenuMarqueeActive: body.ottTopMenuMarqueeActive !== undefined ? body.ottTopMenuMarqueeActive : false,
        ottTopMenuMarqueeSpeed: body.ottTopMenuMarqueeSpeed !== undefined ? parseFloat(body.ottTopMenuMarqueeSpeed) : 30,
        // @ts-ignore
        isEditorModeActive: body.isEditorModeActive !== undefined ? body.isEditorModeActive : false,
        // @ts-ignore
        isStyleModeActive: body.isStyleModeActive !== undefined ? body.isStyleModeActive : false,
        // @ts-ignore
        styleModeSettings: body.styleModeSettings !== undefined ? body.styleModeSettings : {},
        isActive: body.isActive !== undefined ? body.isActive : true,
        isPrivate: body.isPrivate !== undefined ? body.isPrivate : false,
        expirationDate: body.expirationDate ? new Date(body.expirationDate) : null
      }
    })

    // If movePostsToNew is an array of postit IDs, move them to the new category
    if (movePostsToNew && Array.isArray(movePostsToNew) && movePostsToNew.length > 0) {
      await prisma.postIt.updateMany({
        where: {
          id: { in: movePostsToNew }
        },
        data: {
          categoryId: category.id
        }
      })
    }

    if (calendarEntries !== undefined && Array.isArray(calendarEntries) && calendarEntries.length > 0) {
      await prisma.wallCalendarEntry.createMany({
        data: calendarEntries.map((e: any) => ({
          categoryId: category.id,
          calendarCategoryId: e.calendarCategoryId,
          date: new Date(e.date || new Date()),
          content: e.content || ''
        }))
      })
    }

    revalidateTag('all-categories-tree')
    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Kategori oluşturulurken hata oluştu' },
      { status: 500 }
    )
  }
}
