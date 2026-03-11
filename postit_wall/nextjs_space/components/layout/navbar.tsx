'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { LogOut, Settings, User, LogIn, StickyNote, Search, Menu, ChevronDown } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { NavbarPostItButton } from './navbar-postit-button'
import { CategoryFilter } from './category-filter'
import { PushpinLogo } from '../ui/pushpin-logo'

export function Navbar() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [searchQuery, setSearchQuery] = useState(searchParams?.get('q') || '')
  const [categories, setCategories] = useState([])
  const [siteSettings, setSiteSettings] = useState<any>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const userRole = (session?.user as any)?.role

  // Update query in URL when searching (debounced slightly to prevent excessive routing)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams(searchParams?.toString())
      if (searchQuery) {
        params.set('q', searchQuery)
      } else {
        params.delete('q')
      }

      const paramStr = params.toString()
      const newUrl = paramStr ? `/?${paramStr}` : '/'

      if (window.location.pathname === '/') {
        router.push(newUrl, { scroll: false })
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, router, searchParams])

  useEffect(() => {
    // Fetch categories for the menu
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.categories) setCategories(data.categories)
      })
      .catch(err => console.error("Error fetching categories:", err))

    // Fetch site settings for menu appearance
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings) setSiteSettings(data.settings)
      })
      .catch(err => console.error("Error fetching settings:", err))
  }, [])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const currentCategoryId = searchParams?.get('category')
  const currentCategory: any = currentCategoryId ? categories.find((c: any) => c.id === currentCategoryId) : null

  const isSet = (val: any) => val !== null && val !== undefined && val !== ''

  const effectiveSettings = siteSettings ? {
    ...siteSettings,
    ...(currentCategory ? {
      navMenuBgColor: isSet(currentCategory.navMenuBgColor) ? currentCategory.navMenuBgColor : '#ffffff',
      navMenuFont: isSet(currentCategory.navMenuFont) ? currentCategory.navMenuFont : 'sans-serif',
      navMenuTextColor: isSet(currentCategory.navMenuTextColor) ? currentCategory.navMenuTextColor : '#111827',
      navMenuFontSize: isSet(currentCategory.navMenuFontSize) ? currentCategory.navMenuFontSize : 14,
      navMenuMainBold: currentCategory.navMenuMainBold !== null ? currentCategory.navMenuMainBold : true,
    } : {
      navMenuBgColor: siteSettings.navMenuBgColor || '#ffffff',
      navMenuFont: siteSettings.navMenuFont || 'sans-serif',
      navMenuTextColor: siteSettings.navMenuTextColor || '#111827',
      navMenuFontSize: siteSettings.navMenuFontSize || 14,
      navMenuMainBold: siteSettings.navMenuMainBold !== null ? siteSettings.navMenuMainBold : true,
    })
  } : null

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Category Menu */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 border-yellow-400/50 hover:border-yellow-400 hover:bg-yellow-50 transition-all duration-300 shadow-sm px-3 md:px-4"
                >
                  <Menu className="w-5 h-5 text-yellow-600" />
                  <span className="font-semibold text-gray-700 text-sm">Kategoriler</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="w-72 max-h-[80vh] overflow-y-auto p-4 z-[100] shadow-xl border"
                style={{ backgroundColor: effectiveSettings?.navMenuBgColor || '#ffffff' }}
              >
                {categories.length > 0 ? (
                  <CategoryFilter
                    categories={categories.filter((c: any) => !c.parentId)}
                    onSelect={() => setIsMenuOpen(false)}
                    settings={effectiveSettings}
                  />
                ) : (
                  <div className="flex justify-center p-4">Yükleniyor...</div>
                )}
              </PopoverContent>
            </Popover>
            <Link href="/" className="flex items-center gap-2 group">
              <PushpinLogo size={32} className="drop-shadow-sm transition-transform group-hover:rotate-12 duration-300" />
              <div className="flex flex-col -gap-1">
                <div className="text-2xl font-bold md:text-xl lg:text-2xl bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent whitespace-nowrap leading-tight">
                  Panoda Şehir
                </div>
                <div className="text-[10px] md:text-[11px] font-medium text-gray-500 uppercase tracking-widest leading-none ml-1 opacity-80">
                  {currentCategory ? currentCategory.name : 'Ana Pano'}
                </div>
              </div>
            </Link>
          </div>

          {/* Search Box & Action */}
          <div className="flex-1 max-w-2xl mx-4 hidden sm:flex items-center gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Şehirde ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400 sm:text-sm"
              />
            </div>
            {session && (
              <NavbarPostItButton
                userGroupIds={(session?.user as any)?.userGroupIds}
                userRole={userRole}
                defaultCategoryId={searchParams?.get('category') || undefined}
              />
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <User className="w-4 h-4" />
                    {session?.user?.name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="font-medium leading-none">{session?.user?.name}</p>
                      <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {(userRole === 'SUPER_ADMIN' || userRole === 'WALL_MANAGER' || userRole === 'WALL_USER') && (
                    <DropdownMenuItem onClick={() => router.push('/admin')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>{userRole === 'SUPER_ADMIN' ? 'Admin Panel' : 'Yönetici Panel'}</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profil Ayarları</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/my-postits')}>
                    <StickyNote className="mr-2 h-4 w-4" />
                    <span>Postlarım</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-500">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Çıkış Yap</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="gap-2">
                    <LogIn className="w-4 h-4" />
                    Giriş Yap
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="gap-2">Kayıt Ol</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
