import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { PostItWall } from '@/components/postit/postit-wall'
import { ImageSlider } from '@/components/ui/image-slider'
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

  // Fetch site settings
  let siteSettings: any = await prisma.siteSettings.findUnique({
    where: { id: 'global' }
  })

  if (!siteSettings) {
    siteSettings = {
      id: 'global',
      backgroundColor: '#cca378',
      backgroundImage: 'https://www.transparenttextures.com/patterns/cork-board.png',
      borderColor: '#6b4423',
      borderTopColor: '#8a5a2e',
      borderBottomColor: '#4a2f18',
      noBorder: false,
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
      heroAlignment: 'left',
      siteIsGradient: true,
      siteGradientFrom: '#fffbeb',
      siteGradientVia: '#fefce8',
      siteGradientTo: '#fff7ed',
      siteBackgroundColor: '#fffbeb',
      updatedAt: new Date()
    }
  }

  // Default appearance settings (now from global site settings)
  const defaultAppearance = {
    heroBackgroundImage: siteSettings.heroBackgroundImage || null,
    heroSubtitle: siteSettings.heroSubtitle || 'Fikirlerinizi paylaşın, topluluktaki diğerlerinin görüşlerini keşfedin',
    heroTitleFont: siteSettings.heroTitleFont || 'sans-serif',
    heroTitleColor: siteSettings.heroTitleColor || '#ffffff',
    heroTitleSize: siteSettings.heroTitleSize || '5xl',
    heroSubtitleFont: siteSettings.heroSubtitleFont || 'sans-serif',
    heroSubtitleColor: siteSettings.heroSubtitleColor || '#ffffff',
    heroSubtitleSize: siteSettings.heroSubtitleSize || 'xl',
    heroGradientFrom: siteSettings.heroGradientFrom || '#facc15',
    heroGradientVia: siteSettings.heroGradientVia || '#f472b6',
    heroGradientTo: siteSettings.heroGradientTo || '#a855f7',
    heroAlignment: siteSettings.heroAlignment || 'left',
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
    heroAlignment: selectedCategory.heroAlignment || defaultAppearance.heroAlignment,
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

  // Fetch slider for this category (or home page if category is null)
  const activeSlider = await prisma.slider.findFirst({
    where: {
      categoryId: categoryId || null,
      isActive: true,
    }
  })
  const sliderImages = (activeSlider?.images as string[]) || []
  const sliderLinks = (activeSlider?.links as string[]) || []

  const userRole = (session?.user as any)?.role
  const canDelete = userRole === 'SUPER_ADMIN' || userRole === 'WALL_MANAGER'

  // Compute hero background style
  const heroBackground = appearance.heroBackgroundImage
    ? `url('${appearance.heroBackgroundImage}') center/cover`
    : `linear-gradient(to right, ${appearance.heroGradientFrom}, ${appearance.heroGradientVia}, ${appearance.heroGradientTo})`

  return (
    <div
      className="min-h-screen"
      style={{
        background: siteSettings.siteIsGradient
          ? `linear-gradient(to bottom right, ${siteSettings.siteGradientFrom || '#fffbeb'}, ${siteSettings.siteGradientVia || '#fefce8'}, ${siteSettings.siteGradientTo || '#fff7ed'})`
          : (siteSettings.siteBackgroundColor || '#fffbeb')
      }}
    >
      {/* Hero / Slider Section */}
      <div
        className="relative w-full overflow-hidden shadow-md"
        style={{
          background: sliderImages.length > 0
            ? ((activeSlider as any)?.backgroundImage
              ? `url('${(activeSlider as any).backgroundImage}') center/cover`
              : ((activeSlider as any)?.isGradient
                ? `linear-gradient(to right, ${(activeSlider as any)?.heroGradientFrom || '#facc15'}, ${(activeSlider as any)?.heroGradientVia || '#f472b6'}, ${(activeSlider as any)?.heroGradientTo || '#a855f7'})`
                : ((activeSlider as any)?.backgroundColor || '#f8f9fa')))
            : heroBackground
        }}
      >
        {sliderImages.length > 0 ? (
          <div className="w-full flex justify-center py-4">
            <ImageSlider
              images={sliderImages}
              links={sliderLinks}
              className="relative w-full max-w-[1170px] mx-auto h-[130px] sm:h-[160px] md:h-[200px] lg:h-[300px] rounded-xl shadow-md"
            />
          </div>
        ) : (
          <div className={`relative py-12 flex flex-col justify-center h-full min-h-[160px] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full ${appearance.heroAlignment === 'center' ? 'items-center' :
            appearance.heroAlignment === 'right' ? 'items-end' :
              'items-start'
            }`}>
            <div className={`relative z-10 bg-black/10 backdrop-blur-sm p-6 rounded-2xl inline-block max-w-3xl ${appearance.heroAlignment === 'center' ? 'text-center' :
              appearance.heroAlignment === 'right' ? 'text-right' :
                'text-left'
              }`}>
              <h1
                className="font-bold mb-4 drop-shadow-md"
                style={{
                  fontFamily: appearance.heroTitleFont,
                  color: appearance.heroTitleColor,
                  fontSize: titleSizeMap[appearance.heroTitleSize] || '3rem'
                }}
              >
                📌 {heroTitle}
              </h1>
              <p
                className="mb-6 opacity-95 drop-shadow-md"
                style={{
                  fontFamily: appearance.heroSubtitleFont,
                  color: appearance.heroSubtitleColor,
                  fontSize: subtitleSizeMap[appearance.heroSubtitleSize] || '1.25rem'
                }}
              >
                {selectedCategory?.description || appearance.heroSubtitle}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Post-it Wall with Corkboard Styling */}
          <main
            className="flex-1 w-full rounded-sm relative p-4 md:p-8 shadow-2xl"
            style={{
              background: siteSettings.isGradient
                ? `linear-gradient(to right, ${siteSettings.gradientFrom || '#facc15'}, ${siteSettings.gradientVia || '#f472b6'}, ${siteSettings.gradientTo || '#a855f7'})`
                : siteSettings.backgroundColor,
              backgroundImage: siteSettings.isGradient ? undefined : `url("${siteSettings.backgroundImage}")`,
              border: siteSettings.noBorder ? '0px' : `18px solid ${siteSettings.borderColor}`,
              borderBottomColor: siteSettings.noBorder ? 'transparent' : siteSettings.borderBottomColor,
              borderRightColor: siteSettings.noBorder ? 'transparent' : siteSettings.borderBottomColor,
              borderTopColor: siteSettings.noBorder ? 'transparent' : siteSettings.borderTopColor,
              borderLeftColor: siteSettings.noBorder ? 'transparent' : siteSettings.borderTopColor,
              boxShadow: 'inset 0 0 30px rgba(0,0,0,0.6), 0 15px 25px rgba(0,0,0,0.15)',
              minHeight: '75vh'
            }}
          >
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
