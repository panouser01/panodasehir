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
    if (currentCat.wallManagerId === userId) return true
    currentCat = currentCat.parent
  }

  return false
}

// GET all categories with hierarchy (up to 3 levels deep)
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        assignedGroup: true,
        wallManager: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        parent: {
          select: {
            id: true,
            name: true
          }
        },
        children: {
          include: {
            assignedGroup: true,
            wallManager: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            _count: {
              select: {
                postits: true
              }
            },
            children: {
              include: {
                assignedGroup: true,
                wallManager: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                },
                _count: {
                  select: {
                    postits: true
                  }
                },
                children: {
                  include: {
                    assignedGroup: true,
                    wallManager: {
                      select: {
                        id: true,
                        name: true,
                        email: true
                      }
                    },
                    _count: {
                      select: {
                        postits: true
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
            postits: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({ categories })
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
      name, description, wallManagerId, userGroupId, parentId, movePostsToNew,
      // Appearance fields
      heroBackgroundImage, heroSubtitle,
      heroTitleFont, heroTitleColor, heroTitleSize,
      heroSubtitleFont, heroSubtitleColor, heroSubtitleSize,
      heroGradientFrom, heroGradientVia, heroGradientTo,
      categoryFont, categoryColor, categoryBgColor
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
        wallManagerId: wallManagerId || null,
        userGroupId: userGroupId || null,
        parentId: parentId || null,
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
        categoryBgColor: categoryBgColor || '#ffffff'
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

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Kategori oluşturulurken hata oluştu' },
      { status: 500 }
    )
  }
}
