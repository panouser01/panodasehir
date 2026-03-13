import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { PostItWall } from '@/components/postit/postit-wall'
import { PostItStack } from '@/components/postit/postit-stack'
import { ImageSlider } from '@/components/ui/image-slider'
import { EczanePopup } from '@/components/postit/eczane-popup'
import { redirect } from 'next/navigation'
import { ChevronLeft, ListTree, StickyNote } from 'lucide-react'
import Link from 'next/link'
import { CalendarPopup } from '@/components/postit/calendar-popup'

export const dynamic = 'force-dynamic'

interface HomePageProps {
  searchParams: { category?: string; from?: string }
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const session = await getServerSession(authOptions)
  const categoryId = searchParams?.category
  const fromId = searchParams?.from

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

  // Resolve Logo Settings
  // Initial resolution from current wall/home wall
  let resolvedLogoUrl = selectedCategory ? selectedCategory.logoUrl : (homeWall ? homeWall.logoUrl : null)
  let resolvedLogoPosition = selectedCategory ? selectedCategory.logoPosition : (homeWall ? homeWall.logoPosition : 'top-right')
  let resolvedLogoSize = selectedCategory ? selectedCategory.logoSize : (homeWall ? homeWall.logoSize : 'medium')

  if (selectedCategory && selectedCategory.useParentLogo && selectedCategory.parentId) {
    const parentWall = categories.find(c => c.id === selectedCategory.parentId)
    if (parentWall) {
      resolvedLogoUrl = parentWall.logoUrl || null
      resolvedLogoPosition = parentWall.logoPosition || 'top-right'
      resolvedLogoSize = parentWall.logoSize || 'medium'
    }
  }

  const logoSettings = {
    url: resolvedLogoUrl,
    position: resolvedLogoPosition,
    size: resolvedLogoSize
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
    const getSubIds = (cat: any): string[] => {
      const ids = [cat.id]
      if (cat.children && cat.children.length > 0) {
        cat.children.forEach((child: any) => {
          ids.push(...getSubIds(child))
        })
      }
      return ids
    }
    const catNode = categories.find(c => c.id === categoryId)
    if (catNode) {
      const allRequiredIds = new Set<string>()

      // Kategorinin kendisi ve alt kategorileri
      getSubIds(catNode).forEach(id => allRequiredIds.add(id))

      // Seçili diğer duvarların (varsa) kendisi ve alt kategorileri
      let homeIds = catNode.homeCategoryIds || []
      if (typeof homeIds === 'string') {
        try { homeIds = JSON.parse(homeIds) } catch (e) { homeIds = [] }
      }
      if (Array.isArray(homeIds)) {
        homeIds.forEach((hId: string) => {
          const hNode = categories.find(c => c.id === hId)
          if (hNode) {
            getSubIds(hNode).forEach(id => allRequiredIds.add(id))
          }
        })
      }

      where.categoryId = { in: Array.from(allRequiredIds) }
    } else {
      where.categoryId = categoryId
    }
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
  const canDelete = userRole === 'SUPER_ADMIN'

  // Fetch Calendar Data
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const todayStr = today.toISOString().split('T')[0];

  const activeCalendarCategories = await prisma.calendarCategory.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' }
  });

  const calendarDailyData: { categoryName: string; content: string; isWallSpecific?: boolean }[] = [];

  // Global Entries
  activeCalendarCategories.forEach(cat => {
    let entries: any[] = [];
    if (cat.globalEntries) {
      if (typeof cat.globalEntries === 'string') {
        try { entries = JSON.parse(cat.globalEntries); } catch (e) { }
      } else if (Array.isArray(cat.globalEntries)) {
        entries = cat.globalEntries;
      }
    }
    const todayEntry = entries.find(e => {
      const eDateStr = e.date ? (typeof e.date === 'string' ? e.date.split('T')[0] : new Date(e.date).toISOString().split('T')[0]) : '';
      return eDateStr === todayStr;
    });
    if (todayEntry?.content) {
      calendarDailyData.push({
        categoryName: cat.name,
        content: todayEntry.content
      });
    }
  });

  // Wall Specific Entries
  if (selectedCategory) {
    const wallEntries = await prisma.wallCalendarEntry.findMany({
      where: {
        categoryId: selectedCategory.id,
        date: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        calendarCategory: true
      }
    });

    wallEntries.forEach(w => {
      calendarDailyData.push({
        categoryName: w.calendarCategory.name,
        content: w.content,
        isWallSpecific: true
      });
    });
  }

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

  const clickableCalendarLeaf = (
    <CalendarPopup dailyData={calendarDailyData} backgroundImage={siteSettings.calendarPopupBackgroundImage}>
      {calendarLeaf}
    </CalendarPopup>
  )

  // Compute hero background style
  const heroBackground = appearance.isHeroTransparent
    ? 'transparent'
    : (appearance.heroBackgroundImage
      ? `url('${appearance.heroBackgroundImage}') center / cover no-repeat`
      : `linear-gradient(to right, ${appearance.heroGradientFrom}, ${appearance.heroGradientVia}, ${appearance.heroGradientTo})`)



  // Helper to render logo in multiple contexts if it matches
  const renderLogo = (context: 'page' | 'hero' | 'board') => {
    if (!logoSettings.url) return null;

    let pos = logoSettings.position || 'hero-top-right';
    // Backwards compatibility for legacy simple positions (map to hero by default)
    if (!pos.includes('-') && pos === 'center') pos = 'hero-center';
    else if (pos.startsWith('top-') || pos.startsWith('bottom-')) pos = 'hero-' + pos;

    if (!pos.startsWith(context + '-')) return null;

    let posClasses = '';
    if (pos.endsWith('-top-left')) posClasses = 'top-0 left-0';
    else if (pos.endsWith('-top-center')) posClasses = 'top-0 left-1/2 -translate-x-1/2';
    else if (pos.endsWith('-top-right')) posClasses = 'top-0 right-0';
    else if (pos.endsWith('-bottom-left')) posClasses = 'bottom-0 left-0';
    else if (pos.endsWith('-bottom-right')) posClasses = 'bottom-0 right-0';
    else posClasses = 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20'; // center fallback

    const sizeClasses = logoSettings.size === 'small' ? 'h-12 md:h-16' :
      logoSettings.size === 'large' ? 'h-32 md:h-44' :
        logoSettings.size === 'xlarge' ? 'h-48 md:h-64' :
          logoSettings.size === 'mega' ? 'h-64 md:h-96' :
            'h-20 md:h-28'; // medium / fallback

    // Page is fixed, Hero/Board is absolute
    const baseClasses = context === 'page' ? 'fixed z-[120] p-4 md:p-6' : 'absolute z-40 p-4 md:p-6';

    return (
      <div className={`${baseClasses} pointer-events-none ${posClasses}`}>
        <img
          src={logoSettings.url}
          alt="Duvar Logosu"
          className={`object-contain ${sizeClasses}`}
        />
      </div>
    );
  };

  return (
    <div
      className="min-h-screen"
      style={(() => {
        if (siteAppearance.backgroundImage) {
          return {
            backgroundColor: siteAppearance.backgroundColor || '#fffbeb',
            backgroundImage: `url('${siteAppearance.backgroundImage}')`,
            backgroundPosition: 'top center',
            backgroundSize: '100% auto',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
          }
        } else if (siteAppearance.isGradient) {
          return {
            backgroundImage: `linear-gradient(to bottom right, ${siteAppearance.gradientFrom || '#fffbeb'}, ${siteAppearance.gradientVia || '#fefce8'}, ${siteAppearance.gradientTo || '#fff7ed'})`,
          }
        } else {
          return {
            backgroundColor: siteAppearance.backgroundColor || '#fffbeb',
          }
        }
      })()}
    >
      {/* Page Logo Render */}
      {renderLogo('page')}

      {/* Top Fixed Calendar Section */}
      {siteSettings.calendarShow !== false && siteSettings.calendarPosition?.startsWith('top-') && (
        <div className={`fixed top-4 z-[100] transition-all duration-500 ${siteSettings.calendarPosition === 'top-left' ? 'left-4' : 'right-4'}`}>
          {clickableCalendarLeaf}
        </div>
      )}

      {/* Hero / Slider Section */}
      <div
        className={`relative w-full overflow-hidden ${((activeSlider as any)?.isTransparent || (appearance.isHeroTransparent && !activeSlider)) ? '' : 'shadow-md'}`}
        style={{
          background: activeSlider
            ? ((activeSlider as any)?.isTransparent
              ? 'transparent'
              : ((activeSlider as any)?.backgroundImage
                ? `url('${(activeSlider as any).backgroundImage}') center / cover no-repeat`
                : ((activeSlider as any)?.isGradient
                  ? `linear-gradient(to right, ${(activeSlider as any)?.heroGradientFrom || '#facc15'}, ${(activeSlider as any)?.heroGradientVia || '#f472b6'}, ${(activeSlider as any)?.heroGradientTo || '#a855f7'})`
                  : ((activeSlider as any)?.backgroundColor || '#f8f9fa'))))
            : heroBackground
        }}
      >
        {/* Logo Render in Hero Section */}
        {renderLogo('hero')}
        {activeSlider ? (
          <div className="w-full flex justify-center py-4 min-h-[160px]">
            {sliderImages.length > 0 && (
              <ImageSlider
                images={sliderImages}
                links={sliderLinks}
                className={`relative w-full max-w-[1170px] mx-auto h-[130px] sm:h-[160px] md:h-[200px] lg:h-[300px] rounded-xl ${((activeSlider as any)?.isTransparent) ? '' : 'shadow-md'}`}
              />
            )}
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
            {(() => {
              const items = (selectedCategory ? selectedCategory.children : allCategories) || [];
              let displayItems = items.filter((c: any) => c.name !== 'Ana Duvar');

              // Ana sayfa için TÜM ana kategorileri göster (orderedIds'yi yok say). 
              // Sadece alt sayfalardayken (selectedCategory varsa) özel sıralamayı dikkate al.
              if (selectedCategory) {
                let orderedIds = selectedCategory.homeCategoryIds || [];
                if (typeof orderedIds === 'string') { try { orderedIds = JSON.parse(orderedIds); } catch (e) { orderedIds = []; } }
                if (!Array.isArray(orderedIds)) orderedIds = [];

                if (orderedIds && orderedIds.length > 0) {
                  displayItems = orderedIds
                    .map((id: string) => categories.find((c: any) => c.id === id))
                    .filter(Boolean)
                    .filter((c: any) => c.name !== 'Ana Duvar');
                }
              }

              if (displayItems.length === 0) return null;

              // Sağda boşluk kalmaması için ekranı tamamen dolduracak kadar (yaklaşık 60-80 eleman)
              // tekrar sayısını garantiye alırken, kusursuz döngü için tekrar sayısını çift tutuyoruz (x2).
              const baseRepetitions = Math.max(1, Math.ceil(30 / displayItems.length));
              const repeatCount = baseRepetitions * 2;

              return (
                <div className="w-full bg-white/40 backdrop-blur-sm border-y border-black/10 py-1.5 overflow-hidden group">
                  <div className="relative flex overflow-x-hidden">
                    <div className="animate-marquee whitespace-nowrap">
                      {[...Array(repeatCount)].map((_, i) => (
                        <div key={i} className="flex shrink-0 items-center justify-start">
                          {displayItems.map((child: any) => (
                            <a
                              key={`${i}-${child.id}`}
                              href={`/?category=${child.id}&from=${categoryId || 'root'}`}
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
              );
            })()}

            <div
              className="w-full rounded-sm relative p-4 md:p-8 shadow-2xl flex-1"
              style={{
                backgroundColor: boardAppearance.isWallTransparent
                  ? 'transparent'
                  : boardAppearance.backgroundColor || '#cca378',
                backgroundImage: boardAppearance.isWallTransparent
                  ? 'none'
                  : (boardAppearance.isGradient
                    ? `linear-gradient(to right, ${boardAppearance.gradientFrom || '#facc15'}, ${boardAppearance.gradientVia || '#f472b6'}, ${boardAppearance.gradientTo || '#a855f7'})`
                    : (boardAppearance.backgroundImage ? `url("${boardAppearance.backgroundImage}")` : 'none')),
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
              {(selectedCategory || fromId) && (
                <a
                  href={fromId ? (fromId === 'root' ? '/' : `/?category=${fromId}`) : (selectedCategory?.parentId ? `/?category=${selectedCategory.parentId}` : '/')}
                  className="absolute top-2 left-2 z-20 flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-white/60 hover:bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-black/5 transition-all hover:-translate-x-1 hover:scale-110 active:scale-90 group"
                  title="Geri Dön"
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

              {/* Logo Render in Board Section */}
              {renderLogo('board')}

              {(() => {
                const isCustomLayoutEnabled = categoryId
                  ? selectedCategory?.useCustomLayout
                  : (homeWall?.useCustomLayout || siteSettings.useCustomLayout);

                if (isCustomLayoutEnabled) {
                  const customLayoutStr = categoryId
                    ? selectedCategory?.customLayout
                    : (homeWall?.useCustomLayout ? homeWall.customLayout : siteSettings.customLayout);
                  let customLayout: any[] = [];
                  try {
                    customLayout = typeof customLayoutStr === 'string' ? JSON.parse(customLayoutStr) : (customLayoutStr || []);
                  } catch (e) {
                    customLayout = [];
                  }

                  if (customLayout && customLayout.length > 0) {
                    return (
                      <div className="flex flex-row flex-wrap gap-x-[2%] gap-y-6 w-full mt-4">
                        {customLayout.map((block: any, idx: number) => {
                          let content = null;
                          let needsCorkFrame = false;

                          if (block.type === 'category_posts') {
                            const catPostitsRaw = block.categoryId ? postits.filter((p: any) => p.categoryId === block.categoryId) : [];
                            const catLimit = block.limit || 0;
                            const catPostits = catLimit > 0 ? catPostitsRaw.slice(0, catLimit) : catPostitsRaw;

                            content = <PostItStack postits={catPostits as any} canDelete={canDelete} currentUserId={currentUserId} />;
                            needsCorkFrame = !block.noBorder;
                          } else if (block.type === 'custom_html') {
                            content = <div dangerouslySetInnerHTML={{ __html: block.htmlContent || '' }} className="w-full h-full p-4" />;
                          } else if (block.type === 'pharmacy_plugin') {
                            content = (
                              <div className="w-full h-[300px] bg-red-500/10 border-2 border-red-500 text-red-700 font-bold text-2xl flex flex-col items-center justify-center rounded-xl p-4 text-center">
                                ⚕️ Nöbetçi Eczaneler Alanı
                                <span className="text-sm font-normal mt-2">Bu modül ileride eklenecektir. (Placeholder)</span>
                              </div>
                            );
                          }

                          const blockWidth = block.width || 'full';
                          let widthClass = 'w-full';
                          if (blockWidth === 'half') widthClass = 'w-full md:w-[49%]';
                          if (blockWidth === 'third') widthClass = 'w-full md:w-[32%]';
                          if (blockWidth === 'twothird') widthClass = 'w-full md:w-[66%]';

                          const currentRibbonColor = block.ribbonColor || appearance.ribbonColor || '#c40000';
                          const defaultBorderColor = '#8B5A2B';
                          const dynamicBorderColor = block.borderColor || defaultBorderColor;

                          return (
                            <div key={idx} className={`${widthClass} flex flex-col mb-4 relative`}>
                              {/* Customizable Background */}
                              <div
                                className="absolute inset-0 z-0 bg-center bg-no-repeat rounded-xl opacity-100 pointer-events-none"
                                style={{
                                  backgroundImage: block.backgroundImage ? `url(${block.backgroundImage})` : 'none',
                                  backgroundSize: '100% 100%'
                                }}
                              />

                              {(block.title || block.titleImage) && (
                                <div className="relative flex justify-center w-full mt-2 mb-0 z-10">
                                  {block.titleImage ? (
                                    <Link href={block.categoryId ? `/?category=${block.categoryId}` : '#'} className="relative inline-flex items-center justify-center transform transition-transform duration-300 hover:scale-[1.05] -mt-2 cursor-pointer z-20">
                                      <img src={block.titleImage} alt={block.title || 'Başlık'} className="max-h-24 w-auto object-contain drop-shadow-lg" />
                                      {block.title && (
                                        <h3 className="absolute inset-0 flex items-center justify-center text-lg md:text-2xl font-black tracking-wide text-white px-4 text-center leading-tight" style={{ fontFamily: "'Nunito', 'Segoe UI', system-ui, sans-serif", textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 -1px 2px rgba(255,255,255,0.4)' }}>
                                          {block.title}
                                        </h3>
                                      )}
                                    </Link>
                                  ) : (
                                    <Link href={block.categoryId ? `/?category=${block.categoryId}` : '#'} className="relative inline-flex items-center justify-center group transform transition-transform duration-300 hover:scale-[1.05] cursor-pointer z-20">
                                      {/* Ribbon side folds */}
                                      <div className="absolute top-2 -left-8 w-12 h-full -z-20 drop-shadow-md brightness-[0.65]" style={{ backgroundColor: currentRibbonColor, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 25% 50%)' }} />
                                      <div className="absolute top-2 -right-8 w-12 h-full -z-20 drop-shadow-md brightness-[0.65]" style={{ backgroundColor: currentRibbonColor, clipPath: 'polygon(0 0, 100% 0, 75% 50%, 100% 100%, 0 100%)' }} />
                                      <div className="absolute -bottom-2 left-0 w-4 h-2 -z-10 brightness-50" style={{ backgroundColor: currentRibbonColor, clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }} />
                                      <div className="absolute -bottom-2 right-0 w-4 h-2 -z-10 brightness-50" style={{ backgroundColor: currentRibbonColor, clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />

                                      <div className="relative px-6 md:px-12 py-2 rounded-sm border-b-4 border-r-[3px] border-black/30 shadow-xl flex items-center gap-2" style={{ backgroundColor: currentRibbonColor }}>
                                        <h3 className="text-xl md:text-3xl font-black tracking-wide text-white group-hover:text-yellow-200 transition-colors duration-200" style={{ fontFamily: "'Nunito', 'Segoe UI', system-ui, sans-serif", textShadow: '0 2px 4px rgba(0,0,0,0.4), 0 -1px 1px rgba(255,255,255,0.2)' }}>
                                          {block.title}
                                        </h3>
                                      </div>
                                    </Link>
                                  )}
                                </div>
                              )}

                              <div
                                className={`relative flex overflow-hidden transition-all duration-300 ${needsCorkFrame ? 'border-[12px] bg-[#E8DCC4] shadow-[inset_0_0_20px_rgba(0,0,0,0.4),0_6px_12px_rgba(0,0,0,0.2)] rounded-sm' : ''} z-10 flex-1`}
                                style={needsCorkFrame ? { borderColor: dynamicBorderColor } : {}}
                              >
                                {needsCorkFrame && (
                                  <div className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none" style={{ backgroundImage: 'url("/patterns/cork.png")', backgroundSize: '150px' }} />
                                )}
                                <div className="relative z-10 w-full p-2 h-full flex flex-col items-center">
                                  {content}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }
                } // End Custom Layout Logic

                let wallSettingsIds = categoryId
                  ? (selectedCategory?.homeCategoryIds || [])
                  : (siteSettings.homeCategoryIds || []);

                if (typeof wallSettingsIds === 'string') {
                  try { wallSettingsIds = JSON.parse(wallSettingsIds); } catch (e) { wallSettingsIds = []; }
                }
                if (!Array.isArray(wallSettingsIds)) wallSettingsIds = [];

                if (wallSettingsIds.length > 0) {
                  const directPostits = categoryId ? postits.filter((p: any) => p.categoryId === categoryId) : [];
                  const currentWallLimit = categoryId ? (selectedCategory?.postitLimit || 0) : (siteSettings.postitLimit || 0);
                  const limitedDirectPostits = currentWallLimit > 0 ? directPostits.slice(0, currentWallLimit) : directPostits;

                  return (
                    <div className="space-y-12 w-full mt-4">
                      {limitedDirectPostits.length > 0 && (
                        <div className="mb-12">
                          <div className="relative flex justify-center w-full mt-6 mb-8 z-10 transition-transform hover:scale-105 duration-300">
                            <div className="relative inline-flex items-center justify-center group">
                              <div className="absolute top-3 -left-10 w-16 h-full -z-20 drop-shadow-md brightness-75"
                                style={{ backgroundColor: appearance.ribbonColor, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 25% 50%)' }} />
                              <div className="absolute top-3 -right-10 w-16 h-full -z-20 drop-shadow-md brightness-75"
                                style={{ backgroundColor: appearance.ribbonColor, clipPath: 'polygon(0 0, 100% 0, 75% 50%, 100% 100%, 0 100%)' }} />
                              <div className="absolute -bottom-3 left-0 w-6 h-3 -z-10 brightness-50"
                                style={{ backgroundColor: appearance.ribbonColor, clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }} />
                              <div className="absolute -bottom-3 right-0 w-6 h-3 -z-10 brightness-50"
                                style={{ backgroundColor: appearance.ribbonColor, clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
                              <div className="relative px-8 md:px-14 py-3 rounded-sm border-b-[6px] border-r-4 border-black/30 shadow-xl flex flex-col sm:flex-row items-center gap-3 decoration-transparent" style={{ backgroundColor: appearance.ribbonColor }}>
                                <h2 className="text-3xl md:text-5xl tracking-normal text-white mb-0"
                                  style={{
                                    textShadow: '0 1px 0 rgba(255,255,255,0.3), 0 2px 0 rgba(255,255,255,0.2), 0 3px 0 rgba(255,255,255,0.1), 0 4px 0 rgba(0,0,0,0.1), 0 5px 0 rgba(0,0,0,0.15), 0 6px 1px rgba(0,0,0,.1), 0 0 5px rgba(0,0,0,.1), 0 1px 3px rgba(0,0,0,.3), 0 3px 5px rgba(0,0,0,.2), 0 5px 10px rgba(0,0,0,.25), 0 10px 10px rgba(0,0,0,.2), 0 20px 20px rgba(0,0,0,.15)',
                                    fontFamily: "'Nunito', 'Segoe UI', system-ui, sans-serif",
                                    fontWeight: 900
                                  }}>
                                  {selectedCategory?.name || 'Ana Duvar'}
                                </h2>
                              </div>
                            </div>
                          </div>
                          <PostItWall
                            initialPostits={limitedDirectPostits as any}
                            canDelete={canDelete}
                            currentUserId={(session?.user as any)?.id}
                          />
                        </div>
                      )}
                      {wallSettingsIds.map((catId: string) => {
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
                        const catPostitsRaw = postits.filter((p: any) => validIds.includes(p.categoryId));
                        if (catPostitsRaw.length === 0) return null;

                        const catLimit = cat.postitLimit || 0;
                        const catPostits = catLimit > 0 ? catPostitsRaw.slice(0, catLimit) : catPostitsRaw;

                        const subcatCount = validIds.length - 1;
                        const postitCount = catPostitsRaw.length;

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
                                <a href={`/?category=${cat.id}&from=${categoryId || 'root'}`} className="relative px-8 md:px-14 py-3 rounded-sm border-b-[6px] border-r-4 border-black/30 shadow-xl flex flex-col sm:flex-row items-center gap-3 decoration-transparent" style={{ backgroundColor: currentRibbonColor }}>
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
                  );
                } else {
                  const currentWallLimit = categoryId ? (selectedCategory?.postitLimit || 0) : (siteSettings.postitLimit || 0);
                  const limitedPostits = currentWallLimit > 0 ? postits.slice(0, currentWallLimit) : postits;

                  return (
                    <div className="space-y-12 w-full mt-4">
                      <div className="mb-12">
                        <div className="relative flex justify-center w-full mt-6 mb-8 z-10 transition-transform hover:scale-105 duration-300">
                          <div className="relative inline-flex items-center justify-center group">
                            <div className="absolute top-3 -left-10 w-16 h-full -z-20 drop-shadow-md brightness-75"
                              style={{ backgroundColor: appearance.ribbonColor, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 25% 50%)' }} />
                            <div className="absolute top-3 -right-10 w-16 h-full -z-20 drop-shadow-md brightness-75"
                              style={{ backgroundColor: appearance.ribbonColor, clipPath: 'polygon(0 0, 100% 0, 75% 50%, 100% 100%, 0 100%)' }} />
                            <div className="absolute -bottom-3 left-0 w-6 h-3 -z-10 brightness-50"
                              style={{ backgroundColor: appearance.ribbonColor, clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }} />
                            <div className="absolute -bottom-3 right-0 w-6 h-3 -z-10 brightness-50"
                              style={{ backgroundColor: appearance.ribbonColor, clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
                            <div className="relative px-8 md:px-14 py-3 rounded-sm border-b-[6px] border-r-4 border-black/30 shadow-xl flex flex-col sm:flex-row items-center gap-3 decoration-transparent" style={{ backgroundColor: appearance.ribbonColor }}>
                              <h2 className="text-3xl md:text-5xl tracking-normal text-white mb-0"
                                style={{
                                  textShadow: '0 1px 0 rgba(255,255,255,0.3), 0 2px 0 rgba(255,255,255,0.2), 0 3px 0 rgba(255,255,255,0.1), 0 4px 0 rgba(0,0,0,0.1), 0 5px 0 rgba(0,0,0,0.15), 0 6px 1px rgba(0,0,0,.1), 0 0 5px rgba(0,0,0,.1), 0 1px 3px rgba(0,0,0,.3), 0 3px 5px rgba(0,0,0,.2), 0 5px 10px rgba(0,0,0,.25), 0 10px 10px rgba(0,0,0,.2), 0 20px 20px rgba(0,0,0,.15)',
                                  fontFamily: "'Nunito', 'Segoe UI', system-ui, sans-serif",
                                  fontWeight: 900
                                }}>
                                {selectedCategory?.name || 'Ana Duvar'}
                              </h2>
                            </div>
                          </div>
                        </div>
                        <PostItWall
                          initialPostits={limitedPostits as any}
                          canDelete={canDelete}
                          currentUserId={(session?.user as any)?.id}
                        />
                      </div>
                    </div>
                  );
                }
              })()}

            </div>
          </main>

          {/* Side Calendar Section */}
          {siteSettings.calendarShow !== false && (siteSettings.calendarPosition === 'left' || siteSettings.calendarPosition === 'right' || !siteSettings.calendarPosition) && (
            <aside className={`${siteSettings.calendarSize === 'large' ? 'lg:w-40' : siteSettings.calendarSize === 'small' ? 'lg:w-24' : 'lg:w-32'} flex flex-col items-center ${siteSettings.calendarPosition === 'left' ? 'lg:items-end' : 'lg:items-start'}`}>
              <div className="sticky top-8">
                {clickableCalendarLeaf}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}
