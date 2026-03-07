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
  let selectedCategory = categoryId
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
      siteBackgroundImage: null,
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

  // Get selected category for appearance settings
  // (already defined as categoryId matching logic below)

  // If we are on home page (no category), try to find "Ana Duvar" to use its appearance
  const homeWall = categories.find(c => c.name === 'Ana Duvar') || null

  const isSet = (val: any) => val !== null && val !== undefined && val !== ''

  const getProp = (prop: string, fallback: any) => {
    if (selectedCategory && isSet(selectedCategory[prop])) return selectedCategory[prop]
    if (homeWall && isSet(homeWall[prop])) return homeWall[prop]
    return fallback
  }

  // Use selected category appearance or homeWall appearance or default
  const appearance = {
    heroBackgroundImage: getProp('heroBackgroundImage', siteSettings?.heroBackgroundImage || null),
    heroSubtitle: getProp('heroSubtitle', siteSettings?.heroSubtitle || 'Fikirlerinizi paylaşın, topluluktaki diğerlerinin görüşlerini keşfedin'),
    heroTitleFont: getProp('heroTitleFont', siteSettings?.heroTitleFont || 'sans-serif'),
    heroTitleColor: getProp('heroTitleColor', siteSettings?.heroTitleColor || '#ffffff'),
    heroTitleSize: getProp('heroTitleSize', siteSettings?.heroTitleSize || '5xl'),
    heroSubtitleFont: getProp('heroSubtitleFont', siteSettings?.heroSubtitleFont || 'sans-serif'),
    heroSubtitleColor: getProp('heroSubtitleColor', siteSettings?.heroSubtitleColor || '#ffffff'),
    heroSubtitleSize: getProp('heroSubtitleSize', siteSettings?.heroSubtitleSize || 'xl'),
    heroGradientFrom: getProp('heroGradientFrom', siteSettings?.heroGradientFrom || '#facc15'),
    heroGradientVia: getProp('heroGradientVia', siteSettings?.heroGradientVia || '#f472b6'),
    heroGradientTo: getProp('heroGradientTo', siteSettings?.heroGradientTo || '#a855f7'),
    heroAlignment: getProp('heroAlignment', siteSettings?.heroAlignment || 'left'),
    categoryFont: getProp('categoryFont', 'sans-serif'),
    categoryColor: getProp('categoryColor', '#1f2937'),
    categoryBgColor: getProp('categoryBgColor', '#ffffff')
  }

  // Pano (Board) Appearance settings with inheritance (Ana Duvar aka SiteSettings is fallback)
  const boardAppearance = {
    isWallTransparent: getProp('isWallTransparent', siteSettings?.isWallTransparent),
    isGradient: getProp('isGradient', siteSettings?.isGradient),
    backgroundColor: getProp('backgroundColor', siteSettings?.backgroundColor),
    backgroundImage: getProp('backgroundImage', siteSettings?.backgroundImage),
    gradientFrom: getProp('gradientFrom', siteSettings?.gradientFrom),
    gradientVia: getProp('gradientVia', siteSettings?.gradientVia),
    gradientTo: getProp('gradientTo', siteSettings?.gradientTo),
    noBorder: getProp('noBorder', siteSettings?.noBorder),
    borderColor: getProp('borderColor', siteSettings?.borderColor),
    borderTopColor: getProp('borderTopColor', siteSettings?.borderTopColor),
    borderBottomColor: getProp('borderBottomColor', siteSettings?.borderBottomColor),
  }

  // Hero title - use category name if selected, otherwise if homeWall exists use its name, otherwise default
  const heroTitle = selectedCategory ? selectedCategory.name : (homeWall ? homeWall.name : 'Panoda Şehir')

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
  let activeSlider = await prisma.slider.findFirst({
    where: {
      categoryId: categoryId || null,
      isActive: true,
    }
  })

  // If slider is missing on selectedCategory or front page, fallback to homeWall (Ana Duvar) slider 
  if (!activeSlider && homeWall) {
    activeSlider = await prisma.slider.findFirst({
      where: {
        categoryId: homeWall.id,
        isActive: true,
      }
    })
  }
  const sliderImages = (activeSlider?.images as string[]) || []
  const sliderLinks = (activeSlider?.links as string[]) || []

  const userRole = (session?.user as any)?.role
  const canDelete = userRole === 'SUPER_ADMIN' || userRole === 'WALL_MANAGER'

  // Calendar JSX
  const calendarLeaf = (
    <div className="select-none transform rotate-3 hover:rotate-0 transition-all duration-500 group cursor-pointer">
      <div
        className={`rounded-lg shadow-xl border-2 border-gray-100 flex flex-col items-center relative transition-all duration-500 group-hover:-translate-y-1 ${siteSettings.calendarSize === 'large' ? 'min-w-[140px]' :
          siteSettings.calendarSize === 'small' ? 'min-w-[80px]' :
            'min-w-[110px]'
          }`}
        style={{
          backgroundColor: '#f4ecd8', // Samanlı kağıt rengi (Straw paper color)
          backgroundImage: `
            radial-gradient(circle at 2px 2px, rgba(0,0,0,0.02) 1px, transparent 0),
            linear-gradient(to bottom, transparent, rgba(0,0,0,0.02))
          `,
          backgroundSize: '4px 4px, 100% 100%'
        }}
      >
        {/* The curl triangle */}
        <div className="absolute bottom-0 right-0 w-0 h-0 border-solid border-b-transparent border-l-transparent transition-all duration-300 group-hover:border-b-[25px] group-hover:border-l-[25px] group-hover:border-b-[#f4ecd8] group-hover:border-l-gray-300 z-30 drop-shadow-[-2px_-2px_3px_rgba(0,0,0,0.2)]"></div>

        {/* The cut-out effect triangle */}
        <div className="absolute bottom-0 right-0 w-0 h-0 border-solid border-t-transparent border-r-transparent transition-all duration-300 group-hover:border-t-[25px] group-hover:border-r-[25px] group-hover:border-t-black/5 group-hover:border-r-black/5 z-10"></div>

        <div
          className="w-full py-1.5 px-3 text-center overflow-hidden rounded-t-md"
          style={{ backgroundColor: siteSettings.calendarColor || '#dc2626' }}
        >
          <span className={`text-white font-bold uppercase tracking-wider ${siteSettings.calendarSize === 'large' ? 'text-xs' :
            siteSettings.calendarSize === 'small' ? 'text-[8px]' :
              'text-[10px]'
            }`}>
            {new Intl.DateTimeFormat('tr-TR', { month: 'long' }).format(new Date())}
          </span>
        </div>
        <div className={`flex flex-col items-center pb-2 ${siteSettings.calendarSize === 'large' ? 'py-4 px-6' :
          siteSettings.calendarSize === 'small' ? 'py-1.5 px-3' :
            'py-3 px-4'
          }`}>
          <span className={`font-black text-amber-900/80 leading-none ${siteSettings.calendarSize === 'large' ? 'text-6xl' :
            siteSettings.calendarSize === 'small' ? 'text-3xl' :
              'text-5xl'
            }`}>
            {new Date().getDate()}
          </span>
          <span className={`font-bold text-amber-800/60 uppercase ${siteSettings.calendarSize === 'large' ? 'text-sm mt-3' :
            siteSettings.calendarSize === 'small' ? 'text-[9px] mt-1' :
              'text-[11px] mt-2'
            }`}>
            {new Intl.DateTimeFormat('tr-TR', { weekday: 'long' }).format(new Date())}
          </span>
        </div>
        {/* Spiral elements */}
        <div className="absolute -top-1 left-0 right-0 flex justify-around px-2">
          {[...Array(siteSettings.calendarSize === 'large' ? 5 : siteSettings.calendarSize === 'small' ? 3 : 4)].map((_, i) => (
            <div
              key={i}
              className={`${siteSettings.calendarSize === 'large' ? 'w-3 h-5' :
                siteSettings.calendarSize === 'small' ? 'w-1.5 h-3' :
                  'w-2.5 h-4'
                } bg-gray-400/50 rounded-full border border-gray-500/30 -mt-2 shadow-sm`}
            />
          ))}
        </div>
      </div>
    </div>
  );

  // Compute hero background style
  const heroBackground = appearance.heroBackgroundImage
    ? `url('${appearance.heroBackgroundImage}') center/cover`
    : `linear-gradient(to right, ${appearance.heroGradientFrom}, ${appearance.heroGradientVia}, ${appearance.heroGradientTo})`

  // Site Ground (Zemin) Appearance with inheritance
  const siteAppearance = {
    backgroundColor: getProp('siteBackgroundColor', siteSettings?.siteBackgroundColor),
    backgroundImage: getProp('siteBackgroundImage', siteSettings?.siteBackgroundImage),
    isGradient: getProp('siteIsGradient', siteSettings?.siteIsGradient),
    gradientFrom: getProp('siteGradientFrom', siteSettings?.siteGradientFrom),
    gradientVia: getProp('siteGradientVia', siteSettings?.siteGradientVia),
    gradientTo: getProp('siteGradientTo', siteSettings?.siteGradientTo),
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: siteAppearance.backgroundImage
          ? `url('${siteAppearance.backgroundImage}') center/cover fixed`
          : (siteAppearance.isGradient
            ? `linear-gradient(to bottom right, ${siteAppearance.gradientFrom || '#fffbeb'}, ${siteAppearance.gradientVia || '#fefce8'}, ${siteAppearance.gradientTo || '#fff7ed'})`
            : (siteAppearance.backgroundColor || '#fffbeb'))
      }}
    >
      {/* Top Fixed Calendar Section */}
      {siteSettings.calendarShow !== false && siteSettings.calendarPosition?.startsWith('top-') && (
        <div className={`fixed top-4 z-[100] transition-all duration-500 ${siteSettings.calendarPosition === 'top-left' ? 'left-4' : 'right-4'}`}>
          {calendarLeaf}
        </div>
      )}

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
        <div className={`flex flex-col gap-8 ${siteSettings.calendarPosition === 'left' ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
          {/* Post-it Wall with Corkboard Styling */}
          <main
            className="flex-1 w-full rounded-sm relative p-4 md:p-8 shadow-2xl"
            style={{
              background: boardAppearance.isWallTransparent
                ? 'transparent'
                : (boardAppearance.isGradient
                  ? `linear-gradient(to right, ${boardAppearance.gradientFrom || '#facc15'}, ${boardAppearance.gradientVia || '#f472b6'}, ${boardAppearance.gradientTo || '#a855f7'})`
                  : boardAppearance.backgroundColor),
              backgroundImage: boardAppearance.isWallTransparent
                ? 'none'
                : (boardAppearance.isGradient ? undefined : (boardAppearance.backgroundImage ? `url("${boardAppearance.backgroundImage}")` : undefined)),
              border: boardAppearance.noBorder ? '0px' : `18px solid ${boardAppearance.borderColor}`,
              borderBottomColor: boardAppearance.noBorder ? 'transparent' : boardAppearance.borderBottomColor,
              borderRightColor: boardAppearance.noBorder ? 'transparent' : boardAppearance.borderBottomColor,
              borderTopColor: boardAppearance.noBorder ? 'transparent' : boardAppearance.borderTopColor,
              borderLeftColor: boardAppearance.noBorder ? 'transparent' : boardAppearance.borderTopColor,
              boxShadow: boardAppearance.isWallTransparent
                ? 'none'
                : 'inset 0 0 30px rgba(0,0,0,0.6), 0 15px 25px rgba(0,0,0,0.15)',
              minHeight: '75vh'
            }}
          >
            <PostItWall
              initialPostits={postits as any}
              canDelete={canDelete}
              currentUserId={(session?.user as any)?.id}
            />

          </main>

          {/* Side Calendar Section */}
          {siteSettings.calendarShow !== false && (siteSettings.calendarPosition === 'left' || siteSettings.calendarPosition === 'right' || !siteSettings.calendarPosition) && (
            <aside className={`${siteSettings.calendarSize === 'large' ? 'lg:w-40' : siteSettings.calendarSize === 'small' ? 'lg:w-24' : 'lg:w-32'} flex flex-col items-center ${siteSettings.calendarPosition === 'left' ? 'lg:items-end' : 'lg:items-start'}`}>
              <div className="sticky top-8">
                {calendarLeaf}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}
