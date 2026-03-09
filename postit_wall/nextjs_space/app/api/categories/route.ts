import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

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

// GET all categories with hierarchy (up to 3 levels deep)
export async function GET() {
  try {
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
                    _count: {
                      select: {
                        postits: { where: activeFilter }
                      }
                    }
                  },
                  orderBy: { name: 'asc' }
                }
              },
              orderBy: { name: 'asc' }
            }
          },
          orderBy: { name: 'asc' }
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
      orderBy: {
        name: 'asc'
      }
    })

    // Map _count.postits to postCount recursively for the frontend
    const mapCounts = (cats: any[]): any[] => {
      return cats.map(cat => ({
        ...cat,
        postCount: cat._count?.postits || 0,
        children: cat.children ? mapCounts(cat.children) : []
      }))
    }

    const categoriesWithCounts = mapCounts(categories)

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
      name, description, wallManagerIds, userGroupId, parentId, movePostsToNew,
      cityId, districtId,
      contactName, contactPhone, contactEmail,
      // Appearance fields
      heroBackgroundImage, heroSubtitle,
      heroTitleFont, heroTitleColor, heroTitleSize,
      heroSubtitleFont, heroSubtitleColor, heroSubtitleSize,
      heroGradientFrom, heroGradientVia, heroGradientTo,
      categoryFont, categoryColor, categoryBgColor,
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
        wallManagers: wallManagerIds && wallManagerIds.length > 0 ? { connect: wallManagerIds.map((id: string) => ({ id })) } : undefined,
        userGroupId: userGroupId || null,
        parentId: parentId || null,
        cityId: cityId || null,
        districtId: districtId || null,
        contactName: contactName || null,
        contactPhone: contactPhone || null,
        contactEmail: contactEmail || null,
        // Appearance fields
        heroBackgroundImage: heroBackgroundImage || null,
        heroSubtitle: heroSubtitle || null,
        heroTitleFont: heroTitleFont || 'sans-serif',
        heroTitleColor: heroTitleColor || '#ffffff',
        heroTitleSize: heroTitleSize || '5xl',
        heroSubtitleFont: heroSubtitleFont || 'sans-serif',
        heroSubtitleColor: heroSubtitleColor || '#ffffff',
        heroSubtitleSize: heroSubtitleSize || 'xl',
        heroGradientFrom: heroGradientFrom || '#facc15',
        heroGradientVia: heroGradientVia || '#f472b6',
        heroGradientTo: heroGradientTo || '#a855f7',
        categoryFont: categoryFont || 'sans-serif',
        categoryColor: categoryColor || '#1f2937',
        categoryBgColor: categoryBgColor || '#ffffff',
        // Board appearance fields
        backgroundColor: body.backgroundColor || null,
        backgroundImage: body.backgroundImage || null,
        borderColor: body.borderColor || null,
        borderTopColor: body.borderTopColor || null,
        borderBottomColor: body.borderBottomColor || null,
        isGradient: body.isGradient !== undefined ? body.isGradient : null,
        gradientFrom: body.gradientFrom || '#facc15',
        gradientVia: body.gradientVia || '#f472b6',
        gradientTo: body.gradientTo || '#a855f7',
        isWallTransparent: body.isWallTransparent !== undefined ? body.isWallTransparent : null,
        noBorder: body.noBorder !== undefined ? body.noBorder : null,
        // Full parity with SiteSettings
        navMenuBgColor: body.navMenuBgColor || null,
        navMenuFont: body.navMenuFont || null,
        navMenuTextColor: body.navMenuTextColor || null,
        navMenuFontSize: body.navMenuFontSize || null,
        navMenuMainBold: body.navMenuMainBold !== undefined ? body.navMenuMainBold : null,
        siteBackgroundColor: body.siteBackgroundColor || null,
        siteBackgroundImage: body.siteBackgroundImage || null,
        siteGradientFrom: body.siteGradientFrom || null,
        siteGradientVia: body.siteGradientVia || null,
        siteGradientTo: body.siteGradientTo || null,
        siteIsGradient: body.siteIsGradient !== undefined ? body.siteIsGradient : null,
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

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Kategori oluşturulurken hata oluştu' },
      { status: 500 }
    )
  }
}
