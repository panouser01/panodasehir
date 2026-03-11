import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { PostItWall } from '@/components/postit/postit-wall'
import { ImageSlider } from '@/components/ui/image-slider'
import { EczanePopup } from '@/components/postit/eczane-popup'
import { redirect } from 'next/navigation'
import { ChevronLeft, ListTree, StickyNote } from 'lucide-react'

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
      isWallTransparent: false,
      isWallBackgroundRepeat: true,
      homeCategoryIds: [],
      heroBackgroundImage: null,
      isHeroTransparent: false,
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
    isHeroTransparent: siteSettings.isHeroTransparent || false,
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

  // Use selected category appearance or default (Fallback to SiteSettings ONLY for Home Page, NOT for other walls)
  const getValue = (prop: string, fallback: any) => {
    if (selectedCategory) {
      // For sub-walls: ONLY use its own value if set, NO inheritance from siteSettings/Ana Duvar
      return isSet(selectedCategory[prop]) ? selectedCategory[prop] : fallback
    } else {
      // On Home Page: Use siteSettings (Ana Duvar)
      return isSet(siteSettings[prop]) ? siteSettings[prop] : fallback
    }
  }

  const appearance = {
    heroBackgroundImage: getValue('heroBackgroundImage', null),
    isHeroTransparent: getValue('isHeroTransparent', false),
    heroSubtitle: getValue('heroSubtitle', 'Fikirlerinizi paylaşın, topluluktaki diğerlerinin görüşlerini keşfedin'),
    heroTitleFont: getValue('heroTitleFont', 'sans-serif'),
    heroTitleColor: getValue('heroTitleColor', '#ffffff'),
    heroTitleSize: getValue('heroTitleSize', '5xl'),
    heroSubtitleFont: getValue('heroSubtitleFont', 'sans-serif'),
    heroSubtitleColor: getValue('heroSubtitleColor', '#ffffff'),
    heroSubtitleSize: getValue('heroSubtitleSize', 'xl'),
    heroAlignment: getValue('heroAlignment', 'left'),
    heroGradientFrom: getValue('heroGradientFrom', '#facc15'),
    heroGradientVia: getValue('heroGradientVia', '#f472b6'),
    heroGradientTo: getValue('heroGradientTo', '#a855f7'),
    categoryFont: getValue('categoryFont', 'sans-serif'),
    categoryColor: getValue('categoryColor', '#1f2937'),
    categoryBgColor: getValue('categoryBgColor', '#ffffff'),
    ribbonColor: getValue('ribbonColor', '#502bb1')
  }

  // Pano (Board) Appearance settings - NO inheritance for sub-walls
  const boardAppearance = {
    isWallTransparent: getValue('isWallTransparent', false),
    isWallBackgroundRepeat: getValue('isWallBackgroundRepeat', true),
    isGradient: getValue('isGradient', false),
    backgroundColor: getValue('backgroundColor', '#cca378'),
    backgroundImage: getValue('backgroundImage', null),
    gradientFrom: getValue('gradientFrom', '#facc15'),
    gradientVia: getValue('gradientVia', '#f472b6'),
    gradientTo: getValue('gradientTo', '#a855f7'),
    noBorder: getValue('noBorder', false),
    borderColor: getValue('borderColor', '#6b4423'),
    borderTopColor: getValue('borderTopColor', '#8a5a2e'),
    borderBottomColor: getValue('borderBottomColor', '#4a2f18'),
  }

  // Site Ground (Zemin) Appearance - NO inheritance for sub-walls
  const siteAppearance = {
    backgroundColor: getValue('siteBackgroundColor', '#fffbeb'),
    backgroundImage: getValue('siteBackgroundImage', null),
    isGradient: getValue('siteIsGradient', true),
    gradientFrom: getValue('siteGradientFrom', '#fffbeb'),
    gradientVia: getValue('siteGradientVia', '#fefce8'),
    gradientTo: getValue('siteGradientTo', '#fff7ed'),
  }

  // Hero title - use category name if selected, otherwise if homeWall exists use its name, otherwise default
  const heroTitle = selectedCategory ? selectedCategory.name : (homeWall && homeWall.name === 'Ana Duvar' ? 'Ana Pano' : (homeWall ? homeWall.name : 'Panoda Şehir'))

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

  const currentUserId = (session?.user as any)?.id || ''

  const postitData = await prisma.postIt.findMany({
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
      PostItImage: true,
      likes: {
        where: {
          userId: currentUserId
        }
      },
      _count: {
        select: {
          likes: true
        }
      }
    },
    orderBy: [
      {
        createdAt: 'desc'
      }
    ]
  })

  const postits = postitData.map(postit => ({
    ...postit,
    hasLiked: postit.likes.length > 0,
    likesCount: postit._count.likes
  }))

  // Fetch slider for this category (or home page if category is null)
  let activeSlider = await prisma.slider.findFirst({
    where: {
      categoryId: categoryId || null,
      isActive: true,
    }
  })
  const sliderImages = (activeSlider?.images as string[]) || []
  const sliderLinks = (activeSlider?.links as string[]) || []

  const userRole = (session?.user as any)?.role
  const canDelete = userRole === 'SUPER_ADMIN' || userRole === 'WALL_MANAGER' || userRole === 'WALL_USER'

  // Calendar JSX
  const calendarLeaf = (
    <div className="flex flex-col items-center gap-2">
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

      {/* Nöbetçi Eczaneler Linki / Pop-up */}
      <EczanePopup calendarSize={siteSettings.calendarSize} />
    </div>
  );

  // Compute hero background style
  const heroBackground = appearance.isHeroTransparent
    ? 'transparent'
    : (appearance.heroBackgroundImage
      ? `url('${appearance.heroBackgroundImage}') center/cover`
      : `linear-gradient(to right, ${appearance.heroGradientFrom}, ${appearance.heroGradientVia}, ${appearance.heroGradientTo})`)



  return (
    <div
      className="min-h-screen"
      style={{
        background: siteAppearance.backgroundImage
          ? `${siteAppearance.backgroundColor || '#fffbeb'} url('${siteAppearance.backgroundImage}') top center / 100% auto no-repeat fixed`
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
        className={`relative w-full overflow-hidden ${((activeSlider as any)?.isTransparent || appearance.isHeroTransparent) ? '' : 'shadow-md'}`}
        style={{
          background: sliderImages.length > 0
            ? ((activeSlider as any)?.isTransparent
              ? 'transparent'
              : ((activeSlider as any)?.backgroundImage
                ? `url('${(activeSlider as any).backgroundImage}') center/cover`
                : ((activeSlider as any)?.isGradient
                  ? `linear-gradient(to right, ${(activeSlider as any)?.heroGradientFrom || '#facc15'}, ${(activeSlider as any)?.heroGradientVia || '#f472b6'}, ${(activeSlider as any)?.heroGradientTo || '#a855f7'})`
                  : ((activeSlider as any)?.backgroundColor || '#f8f9fa'))))
            : heroBackground
        }}
      >
        {sliderImages.length > 0 ? (
          <div className="w-full flex justify-center py-4">
            <ImageSlider
              images={sliderImages}
              links={sliderLinks}
              className={`relative w-full max-w-[1170px] mx-auto h-[130px] sm:h-[160px] md:h-[200px] lg:h-[300px] rounded-xl ${((activeSlider as any)?.isTransparent) ? '' : 'shadow-md'}`}
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
          <main className="flex-1 w-full flex flex-col gap-2">
            {/* Sub-walls Marquee */}
            {((selectedCategory ? selectedCategory.children : allCategories) || []).filter((c: any) => c.name !== 'Ana Duvar').length > 0 && (
              <div className="w-full bg-white/40 backdrop-blur-sm border-y border-black/10 py-1.5 overflow-hidden group">
                <div className="relative flex overflow-x-hidden">
                  <div className="animate-marquee whitespace-nowrap">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="flex shrink-0">
                        {((selectedCategory ? selectedCategory.children : allCategories) || [])
                          .filter((c: any) => c.name !== 'Ana Duvar')
                          .map((child: any) => (
                            <a
                              key={`${i}-${child.id}`}
                              href={`/?category=${child.id}`}
                              className="mx-8 text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-1.5"
                            >
                              <span className="text-yellow-500 text-lg">📌</span>
                              {child.name}
                            </a>
                          ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div
              className="w-full rounded-sm relative p-4 md:p-8 shadow-2xl flex-1"
              style={{
                background: boardAppearance.isWallTransparent
                  ? 'transparent'
                  : (boardAppearance.isGradient
                    ? `linear-gradient(to right, ${boardAppearance.gradientFrom || '#facc15'}, ${boardAppearance.gradientVia || '#f472b6'}, ${boardAppearance.gradientTo || '#a855f7'})`
                    : boardAppearance.backgroundColor),
                backgroundImage: boardAppearance.isWallTransparent
                  ? 'none'
                  : (boardAppearance.isGradient ? undefined : (boardAppearance.backgroundImage ? `url("${boardAppearance.backgroundImage}")` : undefined)),
                backgroundSize: (!boardAppearance.isWallTransparent && !boardAppearance.isGradient && boardAppearance.backgroundImage) ? (boardAppearance.isWallBackgroundRepeat ? 'auto' : '100% auto') : undefined,
                backgroundRepeat: (!boardAppearance.isWallTransparent && !boardAppearance.isGradient && boardAppearance.backgroundImage) ? (boardAppearance.isWallBackgroundRepeat ? 'repeat' : 'no-repeat') : undefined,
                backgroundPosition: (!boardAppearance.isWallTransparent && !boardAppearance.isGradient && boardAppearance.backgroundImage) ? 'top center' : undefined,
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
              {/* Back Button for Sub-Categories */}
              {selectedCategory && (
                <a
                  href={selectedCategory.parentId ? `/?category=${selectedCategory.parentId}` : '/'}
                  className="absolute top-2 left-2 z-20 flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-white/60 hover:bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-black/5 transition-all hover:-translate-x-1 hover:scale-110 active:scale-90 group"
                  title="Üst Duvara Geri Dön"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 md:w-6 md:h-6 text-gray-900 group-hover:text-blue-600 transition-colors"
                  >
                    <path d="M10 9V5L3 12L10 19V14.9C15 14.9 18.5 16.5 21 20C20 15 17 10 10 9Z" />
                  </svg>
                </a>
              )}

              {!categoryId && siteSettings.homeCategoryIds && siteSettings.homeCategoryIds.length > 0 ? (
                <div className="space-y-12 w-full mt-4">
                  {siteSettings.homeCategoryIds.map((catId: string) => {
                    const cat = categories.find((c: any) => c.id === catId);
                    if (!cat) return null;

                    const getCategoryIds = (c: any): string[] => {
                      const ids = [c.id];
                      if (c.children && c.children.length > 0) {
                        c.children.forEach((child: any) => {
                          ids.push(...getCategoryIds(child));
                        });
                      }
                      return ids;
                    };

                    const validIds = getCategoryIds(cat);
                    const catPostits = postits.filter((p: any) => validIds.includes(p.categoryId));
                    if (catPostits.length === 0) return null;

                    const subcatCount = validIds.length - 1;
                    const postitCount = catPostits.length;

                    const currentRibbonColor = cat.ribbonColor || '#502bb1';

                    return (
                      <div key={cat.id} className="space-y-4">
                        <div className="relative flex justify-center w-full mt-6 mb-8 z-10 transition-transform hover:scale-105 duration-300">
                          <div className="relative inline-flex items-center justify-center group">

                            {/* Ribbon Left Tail */}
                            <div className="absolute top-3 -left-10 w-16 h-full -z-20 drop-shadow-md brightness-75"
                              style={{ backgroundColor: currentRibbonColor, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 25% 50%)' }} />

                            {/* Ribbon Right Tail */}
                            <div className="absolute top-3 -right-10 w-16 h-full -z-20 drop-shadow-md brightness-75"
                              style={{ backgroundColor: currentRibbonColor, clipPath: 'polygon(0 0, 100% 0, 75% 50%, 100% 100%, 0 100%)' }} />

                            {/* Fold Left */}
                            <div className="absolute -bottom-3 left-0 w-6 h-3 -z-10 brightness-50"
                              style={{ backgroundColor: currentRibbonColor, clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }} />

                            {/* Fold Right */}
                            <div className="absolute -bottom-3 right-0 w-6 h-3 -z-10 brightness-50"
                              style={{ backgroundColor: currentRibbonColor, clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />

                            {/* Main Banner */}
                            <a href={`/?category=${cat.id}`} className="relative px-8 md:px-14 py-3 rounded-sm border-b-[6px] border-r-4 border-black/30 shadow-xl flex flex-col sm:flex-row items-center gap-3 decoration-transparent" style={{ backgroundColor: currentRibbonColor }}>
                              <h2 className="text-3xl md:text-5xl tracking-normal text-white mb-0"
                                style={{
                                  textShadow: '0 1px 0 rgba(255,255,255,0.3), 0 2px 0 rgba(255,255,255,0.2), 0 3px 0 rgba(255,255,255,0.1), 0 4px 0 rgba(0,0,0,0.1), 0 5px 0 rgba(0,0,0,0.15), 0 6px 1px rgba(0,0,0,.1), 0 0 5px rgba(0,0,0,.1), 0 1px 3px rgba(0,0,0,.3), 0 3px 5px rgba(0,0,0,.2), 0 5px 10px rgba(0,0,0,.25), 0 10px 10px rgba(0,0,0,.2), 0 20px 20px rgba(0,0,0,.15)',
                                  fontFamily: "'Nunito', 'Segoe UI', system-ui, sans-serif",
                                  fontWeight: 900
                                }}>
                                {cat.name}
                              </h2>
                            </a>

                            {/* Badges as floating elements on top right */}
                            <div className="absolute -top-4 -right-4 flex items-center gap-1.5 z-20">
                              {(subcatCount > 0) && (
                                <span className="text-xs bg-blue-100/90 backdrop-blur-sm text-blue-800 font-bold px-2.5 py-1.5 rounded-full flex items-center gap-1 shadow-md border-[1.5px] border-blue-400">
                                  <ListTree className="w-3.5 h-3.5" /> {subcatCount}
                                </span>
                              )}
                              <span className="text-xs bg-yellow-100/90 backdrop-blur-sm text-yellow-800 font-bold px-2.5 py-1.5 rounded-full flex items-center gap-1 shadow-md border-[1.5px] border-yellow-500">
                                <StickyNote className="w-3.5 h-3.5" /> {postitCount}
                              </span>
                            </div>
                          </div>
                        </div>
                        <PostItWall
                          initialPostits={catPostits as any}
                          canDelete={canDelete}
                          currentUserId={(session?.user as any)?.id}
                        />
                      </div>
                    )
                  })}
                </div>
              ) : (
                <PostItWall
                  initialPostits={postits as any}
                  canDelete={canDelete}
                  currentUserId={(session?.user as any)?.id}
                />
              )}

            </div>
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
