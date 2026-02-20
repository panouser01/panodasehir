import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { PostItWall } from '@/components/postit/postit-wall'
import { CategoryFilter } from '@/components/layout/category-filter'
import { PostItForm } from '@/components/forms/postit-form'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface HomePageProps {
  searchParams: { category?: string }
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const session = await getServerSession(authOptions)
  const categoryId = searchParams?.category

  // Fetch root categories (without parent) with their children
  const allCategories = await prisma.category.findMany({
    include: {
      children: {
        include: {
          children: {
            include: {
              children: true // recursive include for depth 3
            },
            orderBy: { name: 'asc' }
          }
        },
        orderBy: { name: 'asc' }
      }
    },
    where: {
      parentId: null // Only root categories
    },
    orderBy: { name: 'asc' }
  })

  // Flatten categories for PostItForm with depth indicator
  const flattenCategories = (cats: any[], depth: number = 0): any[] => {
    const result: any[] = []
    for (const cat of cats) {
      result.push({ ...cat, depth })
      if (cat.children?.length > 0) {
        result.push(...flattenCategories(cat.children, depth + 1))
      }
    }
    return result
  }
  const categories = flattenCategories(allCategories)

  // Get selected category for appearance settings
  const selectedCategory = categoryId
    ? categories.find(c => c.id === categoryId)
    : null

  // Default appearance settings
  const defaultAppearance = {
    heroBackgroundImage: null,
    heroSubtitle: 'Fikirlerinizi paylaşın, topluluktaki diğerlerinin görüşlerini keşfedin',
    heroTitleFont: 'sans-serif',
    heroTitleColor: '#ffffff',
    heroTitleSize: '5xl',
    heroSubtitleFont: 'sans-serif',
    heroSubtitleColor: '#ffffff',
    heroSubtitleSize: 'xl',
    heroGradientFrom: '#facc15',
    heroGradientVia: '#f472b6',
    heroGradientTo: '#a855f7',
    categoryFont: 'sans-serif',
    categoryColor: '#1f2937',
    categoryBgColor: '#ffffff'
  }

  // Use selected category appearance or default
  const appearance = selectedCategory ? {
    heroBackgroundImage: selectedCategory.heroBackgroundImage || defaultAppearance.heroBackgroundImage,
    heroSubtitle: selectedCategory.heroSubtitle || defaultAppearance.heroSubtitle,
    heroTitleFont: selectedCategory.heroTitleFont || defaultAppearance.heroTitleFont,
    heroTitleColor: selectedCategory.heroTitleColor || defaultAppearance.heroTitleColor,
    heroTitleSize: selectedCategory.heroTitleSize || defaultAppearance.heroTitleSize,
    heroSubtitleFont: selectedCategory.heroSubtitleFont || defaultAppearance.heroSubtitleFont,
    heroSubtitleColor: selectedCategory.heroSubtitleColor || defaultAppearance.heroSubtitleColor,
    heroSubtitleSize: selectedCategory.heroSubtitleSize || defaultAppearance.heroSubtitleSize,
    heroGradientFrom: selectedCategory.heroGradientFrom || defaultAppearance.heroGradientFrom,
    heroGradientVia: selectedCategory.heroGradientVia || defaultAppearance.heroGradientVia,
    heroGradientTo: selectedCategory.heroGradientTo || defaultAppearance.heroGradientTo,
    categoryFont: selectedCategory.categoryFont || defaultAppearance.categoryFont,
    categoryColor: selectedCategory.categoryColor || defaultAppearance.categoryColor,
    categoryBgColor: selectedCategory.categoryBgColor || defaultAppearance.categoryBgColor
  } : defaultAppearance

  // Hero title - use category name if selected, otherwise default
  const heroTitle = selectedCategory ? selectedCategory.name : 'Panoda Şehir'

  // Map size string to actual CSS size
  const titleSizeMap: Record<string, string> = {
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem'
  }

  const subtitleSizeMap: Record<string, string> = {
    'lg': '1.125rem',
    'xl': '1.25rem',
    '2xl': '1.5rem'
  }

  // Fetch post-its
  const where: any = {
    isApproved: true,
    expiresAt: {
      gt: new Date()
    }
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
      PostItImage: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const userRole = (session?.user as any)?.role
  const canDelete = userRole === 'SUPER_ADMIN' || userRole === 'WALL_MANAGER'

  // Compute hero background style
  const heroBackground = appearance.heroBackgroundImage
    ? `url(${appearance.heroBackgroundImage}) center/cover`
    : `linear-gradient(to right, ${appearance.heroGradientFrom}, ${appearance.heroGradientVia}, ${appearance.heroGradientTo})`

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      {/* Hero Section */}
      <div
        className="py-12"
        style={{ background: heroBackground }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1
            className="font-bold mb-4"
            style={{
              fontFamily: appearance.heroTitleFont,
              color: appearance.heroTitleColor,
              fontSize: titleSizeMap[appearance.heroTitleSize] || '3rem'
            }}
          >
            📌 {heroTitle}
          </h1>
          <p
            className="mb-6 opacity-90"
            style={{
              fontFamily: appearance.heroSubtitleFont,
              color: appearance.heroSubtitleColor,
              fontSize: subtitleSizeMap[appearance.heroSubtitleSize] || '1.25rem'
            }}
          >
            {appearance.heroSubtitle}
          </p>
          {session ? (
            <PostItForm
              categories={categories}
              userGroupId={(session?.user as any)?.userGroupId}
              userRole={(session?.user as any)?.role}
              defaultCategoryId={categoryId}
            />
          ) : (
            <p
              className="text-sm opacity-80"
              style={{ color: appearance.heroSubtitleColor }}
            >
              Not eklemek için giriş yapın veya kayıt olun
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-20 bg-white rounded-lg shadow-md p-6">
              <CategoryFilter categories={allCategories} />
            </div>
          </aside>

          {/* Post-it Wall */}
          <main className="flex-1">
            <PostItWall
              initialPostits={postits as any}
              canDelete={canDelete}
              currentUserId={(session?.user as any)?.id}
            />
          </main>
        </div>
      </div>
    </div>
  )
}
