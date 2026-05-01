'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { RichEditor } from '@/components/ui/rich-editor'
import { PushpinLogo } from '@/components/ui/pushpin-logo'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { PostItCard } from '@/components/postit/postit-card'
import TipTapSmallEditor from '@/components/editor/TipTapSmallEditor'
import {
  Loader2,
  Trash2,
  Users,
  StickyNote,
  Plus,
  Pencil,
  Eye,
  EyeOff,
  Home,
  LayoutDashboard,
  LayoutGrid,
  Search,
  ChevronDown,
  ChevronRight,
  BarChart,
  Palette,
  Image as ImageIcon,
  Shield,
  Type,
  Users as UserGroupIcon, // Using Users as generic group icon, creating alias
  Upload,
  MapPin,
  Settings,
  Calendar,
  X,
  Info,
  Phone,
  FileText,
  Lock,
  Cookie,
  HelpCircle,
  Share2,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Github,
  Menu,
  ExternalLink,
  ListTree,
  ArrowUp,
  ArrowDown,
  Megaphone,
  SquareStack,
  Save,  Calendar as CalendarIcon,
  Video,
  Paintbrush,
  LayoutTemplate,
  Play,
  Cloud,
  CloudOff,
  Building,
  PenTool,
  BookOpen,
  Wand2,
  MoveRight, Copy
} from 'lucide-react'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import { stripHtml } from '@/lib/utils'
import EditorArticlesTab from '@/components/editor/EditorArticlesTab'

type ActiveSection = 'dashboard' | 'users' | 'postits' | 'walls' | 'roles' | 'groups' | 'sliders' | 'locations' | 'locations_weather' | 'settings' | 'calendar' | 'about' | 'contact' | 'terms' | 'privacy' | 'cookies' | 'help' | 'kvkk' | 'popularCategories' | 'discover' | 'socialMedia' | 'ads' | 'postit_management' | 'editor_articles' | 'user_postits' | 'search_appearance' | 'merchant_registration'

export default function AdminPage() {
  const { data: session, status } = useSession() || {}
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<any[]>([])
  const [merchants, setMerchants] = useState<any[]>([])
  const [userTab, setUserTab] = useState<'kullanicilar' | 'firmalar'>('kullanicilar')
  const [merchantFilter, setMerchantFilter] = useState<'all' | 'verified' | 'pending'>('all')
  const [postits, setPostits] = useState<any[]>([])
  const [walls, setWalls] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [sliders, setSliders] = useState<any[]>([])
  const [userGroups, setUserGroups] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])
  const [districts, setDistricts] = useState<any[]>([])
  const [stats, setStats] = useState({ users: 0, postits: 0, pendingPostits: 0, unpublishedPostits: 0, walls: 0 })
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard')
  const [calendarCategories, setCalendarCategories] = useState<any[]>([])
  const [showCalendarCategoryModal, setShowCalendarCategoryModal] = useState(false)
  const [calendarCategoryForm, setCalendarCategoryForm] = useState({ name: '', order: 0, isActive: true, globalEntries: [] as any[] })
  const [activeShapeWallIds, setActiveShapeWallIds] = useState<string[]>([])
  const [uploadingShapeCustomImage, setUploadingShapeCustomImage] = useState(false)
  const [expandedShapeWallIds, setExpandedShapeWallIds] = useState<string[]>([])
  const [selectedGlobalCalendarDate, setSelectedGlobalCalendarDate] = useState<string>(new Date().toISOString().split('T')[0])

  const dataLoaded = useRef(false)

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false)
  const [showMerchantModal, setShowMerchantModal] = useState(false)
  const [showWallModal, setShowWallModal] = useState(false)
  const [showPostitModal, setShowPostitModal] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showUserGroupModal, setShowUserGroupModal] = useState(false)
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [showMoveWallModal, setShowMoveWallModal] = useState(false)
  const [wallToMove, setWallToMove] = useState<any>(null)
  const [selectedNewParentId, setSelectedNewParentId] = useState<string>('root')
  const [showMovePostitModal, setShowMovePostitModal] = useState(false)
  const [showCopyWallModal, setShowCopyWallModal] = useState(false)
  const [wallToCopy, setWallToCopy] = useState<any>(null)
  const [copyWallOptions, setCopyWallOptions] = useState({ copyPostits: false })
  const [selectedCopyParentId, setSelectedCopyParentId] = useState<string>('root')
  const [isCopyingWall, setIsCopyingWall] = useState(false)
  const [postitToMove, setPostitToMove] = useState<any>(null)
  const [selectedPostitNewCategoryId, setSelectedPostitNewCategoryId] = useState<string>('')
  const [statsData, setStatsData] = useState<{likers: any[], viewers: any[]}>({likers: [], viewers: []})
  const [loadingStats, setLoadingStats] = useState(false)
  const [showSliderModal, setShowSliderModal] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [uploadingSliderImage, setUploadingSliderImage] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  // Form states
  const [locationForm, setLocationForm] = useState({ type: 'CITY', name: '', cityId: '', showInWeather: false })
  const [merchantForm, setMerchantForm] = useState({ storeName: '', companyType: 'LTD', taxOffice: '', taxId: '', contactFirstName: '', contactLastName: '', contactEmail: '', contactPhone: '', status: 'PENDING', storeLogo: '', storeSlogan: '', username: '', iban: '', address: '', cityId: '', districtId: '', taxPlateUrl: '', signatureCircularUrl: '', idCardFrontUrl: '', idCardBackUrl: '', registryNumber: '', tradeRegistryGazetteUrl: '', selectedWallIds: [] as string[], remarks: '' })
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'USER', userGroupIds: [] as string[], permissions: [] as string[], nickname: '', companyName: '', phone: '', taxId: '', cityId: '', districtId: '', receiveEmail: true, receiveTelegram: true })
  const [wallForm, setWallForm] = useState({
    name: '', description: '', icon: '', wallManagerIds: [] as string[], wallViewerIds: [] as string[], userGroupId: '',
    parentId: '', cityId: '', districtId: '', contactName: '', contactPhone: '', contactEmail: '', heroSubtitle: '', heroTitleFont: 'sans-serif', heroTitleColor: '#ffffff', heroTitleSize: '5xl', heroSubtitleFont: 'sans-serif', heroSubtitleColor: '#ffffff', heroSubtitleSize: 'xl', heroGradientFrom: '#facc15', heroGradientVia: '#f472b6', heroGradientTo: '#a855f7', heroTitleBgMode: 'none', heroTitleBgColor: '#000000', heroTitleBgOpacity: 40, heroTitleBgImage: '',
    backgroundColor: '', backgroundImage: '', borderColor: '', borderTopColor: '', borderBottomColor: '', isGradient: false, gradientFrom: '#facc15', gradientVia: '#f472b6', gradientTo: '#a855f7', isWallTransparent: false, noBorder: false, noInnerBorder: false, innerBackgroundColor: '#E8DCC4', isInnerTransparent: false, heroAlignment: 'left', heroBackgroundImage: '', heroBackgroundStyle: 'cover', isHeroTransparent: false, hideHeroText: false, navMenuBgColor: '', navMenuFont: 'sans-serif', navMenuTextColor: '', navMenuFontSize: 14, navMenuMainBold: true, navMenuIsTransparent: false, navMenuBackgroundImage: '', navMenuVariant: 'classic', siteBackgroundColor: '', siteBackgroundImage: '', siteBackgroundStyle: 'repeat', siteGradientFrom: '', siteGradientVia: '', siteGradientTo: '', siteIsGradient: false,
    calendarEntries: [] as any[],
    homeCategoryIds: [] as string[],
    postitLimit: 0,
    logoUrl: '', logoPosition: 'top-right', logoSize: 'medium', logoFrame: 'original', useParentLogo: false,
    useCustomLayout: false, customLayout: [] as any[],
    postitAppearance: {} as any,
    isOttActive: false,
    showVirtualPostitsIfEmpty: true, showVirtualPostitLogos: false, ottItemsPerRow: 4, ottCardRatio: '9/13', ottAutoScrollSpeed: 0,
    ottShowTopMenu: true, ottShowHeroSlider: true, ottTopMenuShape: 'circle', ottShowCategoryTitles: true, ottCardStyle: 'cover',
    ottCategoryTitleSize: '2xl', ottCategoryTitleFont: 'sans-serif', ottCategoryTitleColor: '', ottCategoryTitleAlignment: 'left', ottSeparatorStyle: 'none', ottSeparatorColor: '#cbd5e1', ottTopMenuLabelBgColor: '', ottTopMenuLabelHasBorder: false, ottTopMenuIconBgColor: '', ottCardBgType: 'postit', ottCardBgColor: '', ottCardBgColorAlpha: 100, ottCardBgImage: '', ottModalBgType: 'postit', ottModalBgColor: '', ottModalBgColorAlpha: 70, ottModalBgImage: '', ottModalTextColor: '', ottTopMenuMarqueeActive: false, ottTopMenuMarqueeSpeed: 30, ottCategoryHeaderGlassy: false,
    hideWallTitle: false, hideWallRibbon: false, hideHeroPushpin: false, ribbonImage: '', ribbonColor: '#502bb1', ribbonTextColor: '#ffffff', ribbonTextFont: 'sans-serif', customRibbonText: '', ribbonAlignment: 'center',
    isActive: true,
    isPrivate: false,
    isEditorModeActive: false,
    isStyleModeActive: false,
    styleModeSettings: '{}',
    expirationDate: ''
  })
  const [postitForm, setPostitForm] = useState({ content: '', detail: '', categoryId: '', color: 'YELLOW', font: 'MODERN', pushpin: 'RED', link: '', isApproved: false, isPublished: true, imageUrl: '', imageUrls: [] as string[], expiresInDays: 'custom', expiresAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], textSize: 'text-base', textColor: '#000000' })
  const [uploadingPostitImage, setUploadingPostitImage] = useState(false)
  const [uploadingWallLogo, setUploadingWallLogo] = useState(false)
  const [uploadingWallRibbonImage, setUploadingWallRibbonImage] = useState(false)
  const [uploadingSiteRibbonImage, setUploadingSiteRibbonImage] = useState(false)
  const [uploadingBlockImage, setUploadingBlockImage] = useState<string | null>(null)
  const [uploadingTitleImage, setUploadingTitleImage] = useState<string | null>(null)
  const [uploadingOttBgImage, setUploadingOttBgImage] = useState(false)
  const [uploadingOttModalBgImage, setUploadingOttModalBgImage] = useState(false)
  const [roleForm, setRoleForm] = useState({ name: '', description: '', permissions: [] as string[] })
  const [sliderForm, setSliderForm] = useState({ categoryId: '', images: ['', '', '', '', ''], links: ['', '', '', '', ''], backgroundColor: '#f8f9fa', backgroundImage: '', isGradient: false, isTransparent: false, heroGradientFrom: '#facc15', heroGradientVia: '#f472b6', heroGradientTo: '#a855f7', isActive: true })
  const [userGroupForm, setUserGroupForm] = useState({ name: '', description: '' })
  const [ads, setAds] = useState<any[]>([])
  const [adCompanies, setAdCompanies] = useState<any[]>([])
  const [showCompanyModal, setShowCompanyModal] = useState(false)
  const [editingCompany, setEditingCompany] = useState<any>(null)
  const [companyForm, setCompanyForm] = useState({ name: '', contactInfo: '', isActive: true })
  
  const [showAdModal, setShowAdModal] = useState(false)
  const [adForm, setAdForm] = useState({ title: '', imageUrl: '', link: '', positions: ['NATIVE'], categoryId: '', categoryIds: [] as string[], isActive: true, startDate: '', endDate: '', frequency: 1, companyId: '' })
  const [expandedAdCategoryIds, setExpandedAdCategoryIds] = useState<string[]>([])
  
  // Merchant Form Preview States
  const [merchantSoleCityId, setMerchantSoleCityId] = useState('')
  const [merchantSoleDistrictId, setMerchantSoleDistrictId] = useState('')
  const [merchantCorpCityId, setMerchantCorpCityId] = useState('')
  const [merchantCorpDistrictId, setMerchantCorpDistrictId] = useState('')

  // Postit search and filter states
  const [postitSearch, setPostitSearch] = useState('')
  const [postitStatusFilter, setPostitStatusFilter] = useState<'all' | 'published' | 'unpublished' | 'pending' | 'private'>('pending')
  const [userSearch, setUserSearch] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set())

  // Wall search and hierarchy states
  const [wallSearch, setWallSearch] = useState('')
  const [wallStatusFilter, setWallStatusFilter] = useState<'all' | 'passive'>('all')
  const [expandedWalls, setExpandedWalls] = useState<Set<string>>(new Set())
  const [expandedCities, setExpandedCities] = useState<Set<string>>(new Set())
  const [showMovePostsModal, setShowMovePostsModal] = useState(false)
  const [parentWallForSubcategory, setParentWallForSubcategory] = useState<any>(null)
  const [selectedPostsToMove, setSelectedPostsToMove] = useState<string[]>([])

  // Appearance settings modal
  const [showAppearanceModal, setShowAppearanceModal] = useState(false)
  const [appearanceForm, setAppearanceForm] = useState({
    heroBackgroundImage: '',
    heroBackgroundStyle: 'cover',
    heroSubtitle: '',
    heroTitleFont: 'sans-serif',
    heroTitleColor: '#ffffff',
    heroTitleSize: '5xl',
    heroTitleBgMode: 'none',
    heroTitleBgColor: '#000000',
    heroTitleBgOpacity: 40,
    heroTitleBgImage: '',
    heroSubtitleFont: 'sans-serif',
    heroSubtitleColor: '#ffffff',
    heroSubtitleSize: 'xl',
    heroGradientFrom: '#facc15',
    heroGradientVia: '#f472b6',
    heroGradientTo: '#a855f7',
    heroAlignment: 'left',
    isHeroTransparent: false,
    hideHeroText: false,
    hideHeroPushpin: false,
    categoryFont: 'sans-serif',
    categoryColor: '#1f2937',
    categoryBgColor: '#ffffff',
    ribbonColor: '#502bb1',
    ribbonAlignment: 'center',
    logoUrl: '',
    logoPosition: 'top-right',
  })
  const [editingAppearanceWall, setEditingAppearanceWall] = useState<any>(null)
  const [tempCategoryRibbonColors, setTempCategoryRibbonColors] = useState<Record<string, string>>({})
  const [tempCategoryRibbonTextColors, setTempCategoryRibbonTextColors] = useState<Record<string, string>>({})
  const [tempCategoryRibbonImages, setTempCategoryRibbonImages] = useState<Record<string, string>>({})
  const [tempCategoryRibbonAlignments, setTempCategoryRibbonAlignments] = useState<Record<string, string>>({})
  const [uploadingRibbonImageId, setUploadingRibbonImageId] = useState<string | null>(null)
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(new Date().toISOString().split('T')[0])

  // Site Settings
  const [siteSettings, setSiteSettings] = useState({
    backgroundColor: '#cca378',
    backgroundImage: 'https://www.transparenttextures.com/patterns/cork-board.png',
    borderColor: '#6b4423',
    borderTopColor: '#8a5a2e',
    borderBottomColor: '#4a2f18',
    noBorder: false,
    noInnerBorder: false,
    innerBackgroundColor: '#E8DCC4',
    isInnerTransparent: false,
    isGradient: false,
    isWallTransparent: false,
    gradientFrom: '#facc15',
    gradientVia: '#f472b6',
    gradientTo: '#a855f7',
    heroBackgroundImage: '',
    heroBackgroundStyle: 'cover',
    searchCategoryTitleFont: 'sans-serif',
    searchCategoryTitleSize: '3xl',
    searchCategoryTitleColor: '#1f2937',
    isHeroTransparent: false,
    heroTitleFont: 'sans-serif',
    heroTitleColor: '#ffffff',
    heroTitleSize: '5xl',
    heroSubtitle: '',
    hideHeroText: false,
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
    siteBackgroundImage: '',
    siteBackgroundStyle: 'repeat',
    searchTitleSize: '5xl',
    searchTitleAlignment: 'left',
    searchTitleColor: '#1f2937',
    searchTitleFont: 'sans-serif',
    searchBgColor: '#ffffff',
    searchBgColorAlpha: 40,
    searchBorderColor: '#000000',
    searchTextColor: '#374151',
    calendarShow: true,
    calendarSize: 'medium',
    calendarPosition: 'right',
    calendarViewType: 'page',
    calendarColor: '#dc2626',
    calendarPopupBackgroundImage: '',
    ribbonColor: '#502bb1',
    aboutContent: '',
    contactContent: '',
    termsContent: '',
    privacyContent: '',
    cookiesContent: '',
    helpContent: '',
    kvkkContent: '',
    homeCategoryIds: [] as string[],
    postitLimit: 0,
    popularLinks: [] as { label: string; href: string }[],
    discoverLinks: [] as { label: string; href: string }[],
    socialLinks: [] as { platform: string; icon: string; url: string }[],
    navMenuBgColor: '#ffffff',
    navMenuFont: 'sans-serif',
    navMenuMainBold: true,
    navMenuIsTransparent: false,
    navMenuBackgroundImage: '',
    navMenuVariant: 'classic',
    navMenuTextColor: '#111827',
    navMenuFontSize: 14,
    hideWallTitle: false, hideWallRibbon: false, hideHeroPushpin: false, ribbonImage: '', ribbonTextColor: '#ffffff', ribbonTextFont: 'sans-serif', customRibbonText: '',
    postitAppearance: {} as any,
  })
  const [savingSettings, setSavingSettings] = useState(false)
  const [uploadingSiteImage, setUploadingSiteImage] = useState(false)
  const [uploadingSiteHeroImage, setUploadingSiteHeroImage] = useState(false)
  const [uploadingSiteBackgroundImage, setUploadingSiteBackgroundImage] = useState(false)
  const [uploadingCalendarPopupImage, setUploadingCalendarPopupImage] = useState(false)
  const [uploadingAppearanceImage, setUploadingAppearanceImage] = useState(false)

  // Mobil Geri Tuşu Yönetimi (Tüm Modallar İçin)
  const isAnyModalOpen = [
    showCalendarCategoryModal, showUserModal, showWallModal, showPostitModal,
    showRoleModal, showUserGroupModal, showStatsModal, showSliderModal,
    showLocationModal, showCompanyModal, showAdModal, showMovePostsModal, showAppearanceModal
  ].some(Boolean);
  const prevIsAnyModalOpen = useRef(false);

  useEffect(() => {
    if (isAnyModalOpen && !prevIsAnyModalOpen.current) {
      window.history.pushState({ modalOpen: true }, '');
    } else if (!isAnyModalOpen && prevIsAnyModalOpen.current) {
      if (window.history.state?.modalOpen) {
        window.history.back();
      }
    }
    prevIsAnyModalOpen.current = isAnyModalOpen;
  }, [isAnyModalOpen]);

  useEffect(() => {
    const handlePopState = () => {
      if (prevIsAnyModalOpen.current) {
        setShowCalendarCategoryModal(false);
        setShowUserModal(false);
        setShowWallModal(false);
        setShowPostitModal(false);
        setShowRoleModal(false);
        setShowUserGroupModal(false);
        setShowStatsModal(false);
        setShowSliderModal(false);
        setShowLocationModal(false);
        setShowCompanyModal(false);
        setShowAdModal(false);
        setShowMovePostsModal(false);
        setShowAppearanceModal(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated' && !dataLoaded.current) {
      const role = (session?.user as any)?.role
      if (role !== 'SUPER_ADMIN' && role !== 'WALL_MANAGER' && role !== 'WALL_USER') {
        toast.error('Bu sayfaya erişim yetkiniz yok')
        router.push('/')
        return
      }
      loadData()
      
      // Auto-Cleanup: Run background job to delete unreferenced/orphaned images
      if (role === 'SUPER_ADMIN') {
        fetch('/api/system/cleanup', { method: 'POST' })
          .then(res => res.json())
          .then(res => { if (res.deleted > 0) console.log(`[Auto-Cleanup] Temizlenen resim sayısı: ${res.deleted}`) })
          .catch(err => console.error('Cleanup failed:', err))
      }
      
      dataLoaded.current = true
    }
  }, [status, session, router])

  const loadData = async () => {
    try {
      setLoading(true)
      const [usersRes, postitsRes, wallsRes, rolesRes, slidersRes, locationsRes, settingsRes, calendarRes, adsRes, adCompaniesRes] = await Promise.all([
        fetch('/api/users', { cache: 'no-store' }),
        fetch('/api/postits?includeUnapproved=true&includePrivate=true', { cache: 'no-store' }),
        fetch('/api/categories', { cache: 'no-store' }),
        fetch('/api/roles', { cache: 'no-store' }),
        fetch('/api/sliders', { cache: 'no-store' }),
        fetch('/api/locations', { cache: 'no-store' }),
        fetch('/api/settings', { cache: 'no-store' }),
        fetch('/api/calendar-categories', { cache: 'no-store' }),
        fetch('/api/ads?all=true', { cache: 'no-store' }),
        fetch('/api/ad-companies', { cache: 'no-store' })
      ])

      if (!usersRes.ok) console.error('Users fetch failed', usersRes.status)
      if (!rolesRes.ok) console.error('Roles fetch failed', rolesRes.status)
      if (!slidersRes.ok) console.error('Sliders fetch failed', slidersRes.status)
      if (!locationsRes.ok) console.error('Locations fetch failed', locationsRes.status)
      if (!settingsRes.ok) console.error('Settings fetch failed', settingsRes.status)
      if (!calendarRes.ok) console.error('Calendar categories fetch failed', calendarRes.status)
      if (!adsRes.ok) console.error('Ads fetch failed', adsRes.status)

      const usersData = await usersRes.json()
      const postitsData = await postitsRes.json()
      const wallsData = await wallsRes.json()
      const rolesData = await rolesRes.json()
      const slidersData = await slidersRes.json()
      const locationsData = await locationsRes.json()
      const settingsData = await settingsRes.json()
      const calendarCategoriesData = await calendarRes.json()
      const adsData = await adsRes.json()
      const adCompaniesData = await adCompaniesRes.json()

      // Log roles data to debug
      console.log('Roles Data:', rolesData)

      if (settingsData?.settings) {
        setSiteSettings(settingsData.settings)
      }

      let fetchedUsers = usersData?.users ?? []
      const uRole = (session?.user as any)?.role
      if (uRole !== 'SUPER_ADMIN') {
        fetchedUsers = fetchedUsers.filter((u: any) => u.role !== 'SUPER_ADMIN')
      }
      setUsers(fetchedUsers)
      setPostits(postitsData?.postits ?? [])
      const allWalls = wallsData?.categories ?? []
      let visibleWalls = allWalls
      const userRole = (session?.user as any)?.role
      const currentUserId = (session?.user as any)?.id

      const currentUserObj = usersData?.users?.find((u: any) => u.id === currentUserId)
      const currentUserGroupIds = currentUserObj?.userGroups?.map((g: any) => g.id) || []

      if (userRole === 'WALL_MANAGER' || userRole === 'WALL_USER') {
        const managedIds = new Set<string>()
        allWalls.forEach((cat: any) => {
          if (
            cat.wallManagers?.some((m: any) => m.id === currentUserId) ||
            (cat.assignedGroup && currentUserGroupIds.includes(cat.assignedGroup.id))
          ) {
            managedIds.add(cat.id)
          }
        })

        let added = true
        while (added) {
          added = false
          allWalls.forEach((cat: any) => {
            if (cat.parentId && managedIds.has(cat.parentId) && !managedIds.has(cat.id)) {
              managedIds.add(cat.id)
              added = true
            }
          })
        }
        visibleWalls = allWalls.filter((cat: any) => managedIds.has(cat.id))
      }

      setWalls(visibleWalls)
      setRoles(rolesData?.roles ?? [])
      setSliders(slidersData?.sliders ?? [])
      setCities(locationsData?.cities ?? [])
      setDistricts(locationsData?.districts ?? [])
      setCalendarCategories(calendarCategoriesData ?? [])
      setAds(adsData?.ads ?? [])
      setAdCompanies(adCompaniesData?.companies ?? [])

      try {
        const groupsRes = await fetch('/api/user-groups')
        if (groupsRes.ok) {
          const groupsData = await groupsRes.json()
          setUserGroups(groupsData.userGroups ?? [])
        }
      } catch (e) {
        console.error('User groups loading failed', e)
      }


      const allPostits = postitsData?.postits ?? []
      setStats({
        users: usersData?.users?.length ?? 0,
        postits: allPostits.filter((p: any) => p.isApproved).length,
        pendingPostits: allPostits.filter((p: any) => !p.isApproved).length,
        unpublishedPostits: allPostits.filter((p: any) => p.isApproved === true && p.isPublished === false).length,
        walls: visibleWalls.length,
      })
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Veriler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  // Merchant operations
  const loadMerchants = () => fetch('/api/admin/merchant-applications').then(r => r.json()).then(data => { if (Array.isArray(data)) setMerchants(data) });

  const openEditMerchant = (merchant: any) => {
    setEditingItem(merchant)
    let parsedWalls = []
    try {
      parsedWalls = typeof merchant.selectedWallIds === 'string' ? JSON.parse(merchant.selectedWallIds) : merchant.selectedWallIds || []
    } catch(e) {}
    setMerchantForm({
      storeName: merchant.storeName || '',
      companyType: merchant.companyType || 'LTD',
      taxOffice: merchant.taxOffice || '',
      taxId: merchant.taxId || '',
      contactFirstName: merchant.contactFirstName || '',
      contactLastName: merchant.contactLastName || '',
      contactEmail: merchant.contactEmail || '',
      contactPhone: merchant.contactPhone || '',
      status: merchant.status || 'PENDING',
      storeLogo: merchant.storeLogo || '',
      storeSlogan: merchant.storeSlogan || '',
      username: merchant.username || '',
      iban: merchant.iban || '',
      address: merchant.address || '',
      cityId: merchant.cityId || '',
      districtId: merchant.districtId || '',
      taxPlateUrl: merchant.taxPlateUrl || '',
      signatureCircularUrl: merchant.signatureCircularUrl || '',
      idCardFrontUrl: merchant.idCardFrontUrl || '',
      idCardBackUrl: merchant.idCardBackUrl || '',
      registryNumber: merchant.registryNumber || '',
      tradeRegistryGazetteUrl: merchant.tradeRegistryGazetteUrl || '',
      selectedWallIds: parsedWalls,
      remarks: merchant.remarks || ''
    })
    setShowMerchantModal(true)
  }

  const handleSaveMerchant = async () => {
    try {
      if (editingItem) {
        const response = await fetch(`/api/admin/merchant-applications/${editingItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(merchantForm)
        })
        if (!response.ok) throw new Error('Güncelleme başarısız')
        toast.success('Firma güncellendi')
      }
      setShowMerchantModal(false)
      loadMerchants()
    } catch (error) {
      console.error(error)
      toast.error('Kayıt güncellenirken hata oluştu')
    }
  }

  const handleDeleteMerchant = async (id: string) => {
    if (!confirm('Bu firma başvurusunu silmek istediğinize emin misiniz?')) return
    try {
      const response = await fetch(`/api/admin/merchant-applications/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Silme başarısız')
      toast.success('Firma silindi')
      loadMerchants()
    } catch (error) {
      console.error(error)
      toast.error('Hata oluştu')
    }
  }

  // User operations
  const handleSaveUser = async () => {
    try {
      if (editingItem) {
        const response = await fetch(`/api/users/${editingItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userForm),
        })
        if (!response.ok) throw new Error('Güncelleme başarısız')
        toast.success('Kullanıcı güncellendi')
      } else {
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userForm),
        })
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Ekleme başarısız')
        }
        toast.success('Kullanıcı eklendi')
      }
      setShowUserModal(false)
      setEditingItem(null)
      setUserForm({ name: '', email: '', password: '', role: 'USER', userGroupIds: [], permissions: [], nickname: '', companyName: '', phone: '', taxId: '', cityId: '', districtId: '', receiveEmail: true, receiveTelegram: true })
      loadData()
    } catch (error: any) {
      toast.error(error.message || 'Kullanıcı kaydedilemedi')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) return
    try {
      const response = await fetch(`/api/users/${userId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Silme başarısız')
      toast.success('Kullanıcı silindi')
      loadData()
    } catch (error) {
      toast.error('Kullanıcı silinemedi')
    }
  }

  // Wall operations
  const handleSaveWall = async () => {
    try {
      const payload: any = {
        name: wallForm.name,
        description: wallForm.description,
        wallManagerIds: wallForm.wallManagerIds,
        wallViewerIds: wallForm.wallViewerIds,
        userGroupId: wallForm.userGroupId || null,
        parentId: wallForm.parentId || null,
        icon: wallForm.icon || null,
        cityId: wallForm.cityId || null,
        districtId: wallForm.districtId || null,
        contactName: wallForm.contactName || null,
        contactPhone: wallForm.contactPhone || null,
        contactEmail: wallForm.contactEmail || null,
        heroSubtitle: wallForm.heroSubtitle,
        heroTitleFont: wallForm.heroTitleFont,
        heroTitleColor: wallForm.heroTitleColor,
        heroTitleSize: wallForm.heroTitleSize,
        heroSubtitleFont: wallForm.heroSubtitleFont,
        heroSubtitleColor: wallForm.heroSubtitleColor,
        heroSubtitleSize: wallForm.heroSubtitleSize,
        hideWallTitle: wallForm.hideWallTitle,
        hideWallRibbon: wallForm.hideWallRibbon,
        hideHeroPushpin: wallForm.hideHeroPushpin,
        ribbonColor: wallForm.ribbonColor,
        ribbonTextColor: wallForm.ribbonTextColor,
        ribbonTextFont: wallForm.ribbonTextFont,
        customRibbonText: wallForm.customRibbonText,
        ribbonImage: wallForm.ribbonImage,
        ribbonAlignment: wallForm.ribbonAlignment,
        heroGradientFrom: wallForm.heroGradientFrom,
        heroGradientVia: wallForm.heroGradientVia,
        heroGradientTo: wallForm.heroGradientTo,
        backgroundColor: wallForm.backgroundColor,
        backgroundImage: wallForm.backgroundImage,
        borderColor: wallForm.borderColor,
        borderTopColor: wallForm.borderTopColor,
        borderBottomColor: wallForm.borderBottomColor,
        isGradient: wallForm.isGradient,
        gradientFrom: wallForm.gradientFrom,
        gradientVia: wallForm.gradientVia,
        gradientTo: wallForm.gradientTo,
        isWallTransparent: wallForm.isWallTransparent,
        noBorder: wallForm.noBorder,
        noInnerBorder: wallForm.noInnerBorder,
        innerBackgroundColor: wallForm.innerBackgroundColor,
        isInnerTransparent: wallForm.isInnerTransparent,
        heroAlignment: wallForm.heroAlignment,
        heroBackgroundImage: wallForm.heroBackgroundImage,
        heroBackgroundStyle: wallForm.heroBackgroundStyle,
        isHeroTransparent: wallForm.isHeroTransparent,
        hideHeroText: wallForm.hideHeroText, // Added hideHeroText
        navMenuBgColor: wallForm.navMenuBgColor,
        navMenuFont: wallForm.navMenuFont,
        navMenuTextColor: wallForm.navMenuTextColor,
        navMenuFontSize: wallForm.navMenuFontSize,
        navMenuMainBold: wallForm.navMenuMainBold,
        navMenuIsTransparent: wallForm.navMenuIsTransparent,
        navMenuBackgroundImage: wallForm.navMenuBackgroundImage,
        navMenuVariant: wallForm.navMenuVariant,
        siteBackgroundColor: wallForm.siteBackgroundColor,
        siteBackgroundImage: wallForm.siteBackgroundImage,
        siteBackgroundStyle: wallForm.siteBackgroundStyle,
        siteGradientFrom: wallForm.siteGradientFrom,
        siteGradientVia: wallForm.siteGradientVia,
        siteGradientTo: wallForm.siteGradientTo,
        siteIsGradient: wallForm.siteIsGradient,
        calendarEntries: wallForm.calendarEntries || [],
        homeCategoryIds: wallForm.homeCategoryIds || [],
        postitLimit: wallForm.postitLimit || 0,
        logoUrl: wallForm.logoUrl,
        logoPosition: wallForm.logoPosition,
        logoSize: wallForm.logoSize,
        logoFrame: wallForm.logoFrame,
        useParentLogo: wallForm.useParentLogo,
        useCustomLayout: wallForm.useCustomLayout,
        customLayout: wallForm.customLayout,
        postitAppearance: wallForm.postitAppearance,
        isOttActive: wallForm.isOttActive,
        showVirtualPostitsIfEmpty: wallForm.showVirtualPostitsIfEmpty,
        showVirtualPostitLogos: wallForm.showVirtualPostitLogos,
        ottItemsPerRow: wallForm.ottItemsPerRow,
        ottCardRatio: wallForm.ottCardRatio,
        ottAutoScrollSpeed: wallForm.ottAutoScrollSpeed,
        ottShowTopMenu: wallForm.ottShowTopMenu,
        ottShowHeroSlider: wallForm.ottShowHeroSlider,
        ottTopMenuShape: wallForm.ottTopMenuShape,
        ottShowCategoryTitles: wallForm.ottShowCategoryTitles,
        ottCardStyle: wallForm.ottCardStyle,
        ottCategoryTitleSize: wallForm.ottCategoryTitleSize,
        ottCategoryHeaderGlassy: wallForm.ottCategoryHeaderGlassy,
        ottCategoryTitleColor: wallForm.ottCategoryTitleColor,
        ottCategoryTitleAlignment: wallForm.ottCategoryTitleAlignment,
        ottCategoryTitleFont: wallForm.ottCategoryTitleFont,
        ottSeparatorStyle: wallForm.ottSeparatorStyle,
        ottSeparatorColor: wallForm.ottSeparatorColor,
        ottTopMenuLabelBgColor: wallForm.ottTopMenuLabelBgColor,
        ottTopMenuLabelHasBorder: wallForm.ottTopMenuLabelHasBorder,
        ottTopMenuIconBgColor: wallForm.ottTopMenuIconBgColor,
        ottCardBgType: wallForm.ottCardBgType,
        ottCardBgColor: wallForm.ottCardBgColor,
        ottCardBgColorAlpha: wallForm.ottCardBgColorAlpha,
        ottCardBgImage: wallForm.ottCardBgImage,
        ottModalBgType: wallForm.ottModalBgType,
        ottModalBgColor: wallForm.ottModalBgColor,
        ottModalBgColorAlpha: wallForm.ottModalBgColorAlpha,
        ottModalBgImage: wallForm.ottModalBgImage,
        ottModalTextColor: wallForm.ottModalTextColor,
        ottTopMenuMarqueeActive: wallForm.ottTopMenuMarqueeActive,
        ottTopMenuMarqueeSpeed: wallForm.ottTopMenuMarqueeSpeed,
        isEditorModeActive: wallForm.isEditorModeActive,
        isStyleModeActive: wallForm.isStyleModeActive,
        styleModeSettings: typeof wallForm.styleModeSettings === 'string' ? wallForm.styleModeSettings : JSON.stringify(wallForm.styleModeSettings),
        isActive: wallForm.isActive,
        isPrivate: wallForm.isPrivate,
        expirationDate: wallForm.expirationDate || null
      }

      // Add selected posts to move if creating new subcategory
      if (!editingItem && selectedPostsToMove.length > 0) {
        payload.movePostsToNew = selectedPostsToMove
      }

      const isEditing = !!editingItem
      let savedWall: any = editingItem
      
      const response = await fetch(
        isEditing ? `/api/categories/${editingItem.id}` : '/api/categories',
        {
          method: isEditing ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'İşlem başarısız')
      }

      const data = await response.json()
      savedWall = data.category
      setEditingItem(savedWall) // Keep modal editing the saved/newly created item

      // Slayder ayarlarını kaydet (Ana Duvar harici duvarlar için tab kullanıldıysa)
      if (wallForm.name !== 'Ana Duvar') {
        try {
          const cleanedImages = sliderForm.images.filter(img => img && img.trim() !== '')
          const cleanedLinks = sliderForm.links ? sliderForm.links.slice(0, cleanedImages.length) : []

          const sliderPayload = {
            ...sliderForm,
            categoryId: savedWall.id,
            images: cleanedImages,
            links: cleanedLinks
          }

          const existingSlider = sliders.find(s => s.categoryId === savedWall.id)
          const sliderRes = await fetch(
            existingSlider ? `/api/sliders/${existingSlider.id}` : '/api/sliders',
            {
              method: existingSlider ? 'PATCH' : 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(sliderPayload)
            }
          )

          if (!sliderRes.ok) {
            console.error('Slider settings could not be saved.')
          }
        } catch (err) {
          console.error('Error saving wall slider:', err)
        }
      }


      const ribbonObjIds = new Set([...Object.keys(tempCategoryRibbonColors), ...Object.keys(tempCategoryRibbonTextColors), ...Object.keys(tempCategoryRibbonImages), ...Object.keys(tempCategoryRibbonAlignments)])
      if (ribbonObjIds.size > 0) {
        await Promise.all(
          Array.from(ribbonObjIds).map(async (catId) => {
            const bodyPayload: any = {}
            if (tempCategoryRibbonColors[catId] !== undefined) bodyPayload.ribbonColor = tempCategoryRibbonColors[catId]
            if (tempCategoryRibbonTextColors[catId] !== undefined) bodyPayload.ribbonTextColor = tempCategoryRibbonTextColors[catId]
            if (tempCategoryRibbonImages[catId] !== undefined) bodyPayload.ribbonImage = tempCategoryRibbonImages[catId] === '' ? null : tempCategoryRibbonImages[catId]
            if (tempCategoryRibbonAlignments[catId] !== undefined) bodyPayload.ribbonAlignment = tempCategoryRibbonAlignments[catId]
            
            const res = await fetch(`/api/categories/${catId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(bodyPayload)
            })
            if (!res.ok) console.error(`Renk güncellenemedi: Kategori ${catId}`)
          })
        )
      }

      toast.success(isEditing ? 'Duvar güncellendi' : (wallForm.parentId ? 'Alt kategori oluşturuldu' : 'Duvar oluşturuldu'))

      await loadData()
      setTempCategoryRibbonColors({})
      setTempCategoryRibbonTextColors({})
      setTempCategoryRibbonImages({})
    } catch (error: any) {
      toast.error(error.message || 'Duvar kaydedilemedi')
    }
  }

  const handleAddCalendarEntry = () => {
    setWallForm({
      ...wallForm,
      calendarEntries: [
        ...wallForm.calendarEntries,
        { calendarCategoryId: '', date: selectedCalendarDate, content: '' }
      ]
    })
  }

  const handleRemoveCalendarEntry = (index: number) => {
    const newEntries = [...wallForm.calendarEntries]
    newEntries.splice(index, 1)
    setWallForm({ ...wallForm, calendarEntries: newEntries })
  }

  const handleCalendarEntryChange = (index: number, field: string, value: any) => {
    const newEntries = [...wallForm.calendarEntries]
    newEntries[index] = { ...newEntries[index], [field]: value }
    setWallForm({ ...wallForm, calendarEntries: newEntries })
  }

  const updateWallsRecursively = (wallList: any[], updates: any[]): any[] => {
    return wallList.map(w => {
      let currentWall = { ...w };
      const update = updates.find((u: any) => u.id === currentWall.id);
      if (update) {
        currentWall.order = update.order;
      }
      if (currentWall.children && currentWall.children.length > 0) {
        currentWall.children = updateWallsRecursively(currentWall.children, updates);
      }
      return currentWall;
    });
  };

  const handleMoveWallUp = async (wall: any, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Find siblings by either root or parentId
    let siblings = [];
    if (!wall.parentId) {
      siblings = walls.filter(w => !w.parentId);
    } else {
      const findParent = (list: any[]): any => {
        for (const w of list) {
          if (w.id === wall.parentId) return w;
          if (w.children) {
            const found = findParent(w.children);
            if (found) return found;
          }
        }
        return null;
      };
      const parent = findParent(walls);
      siblings = parent?.children || [];
    }
    
    siblings = [...siblings].sort((a, b) => (undefined !== a.order && undefined !== b.order ? a.order - b.order : 0) || a.name.localeCompare(b.name));
    
    const currentIndex = siblings.findIndex(w => w.id === wall.id);
    if (currentIndex <= 0) return; // Already at top

    // Calculate new orders sequentially
    const updates = siblings.map((w, index) => ({ id: w.id, order: index * 10 }));
    // Swap the current and prev
    const tempOrder = updates[currentIndex - 1].order;
    updates[currentIndex - 1].order = updates[currentIndex].order;
    updates[currentIndex].order = tempOrder;

    // Optimistik Update
    const newWalls = updateWallsRecursively(walls, updates);
    setWalls(newWalls);

    try {
      const response = await fetch('/api/categories/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      });
      if (!response.ok) throw new Error('Sıralama güncellenemedi');
      toast.success('Sıralama güncellendi');
    } catch (error: any) {
      loadData();
      toast.error(error.message || 'Sıralama güncellenemedi');
    }
  };

  const handleMoveWallDown = async (wall: any, e: React.MouseEvent) => {
    e.stopPropagation();

    // Find siblings by either root or parentId
    let siblings = [];
    if (!wall.parentId) {
      siblings = walls.filter(w => !w.parentId);
    } else {
      const findParent = (list: any[]): any => {
        for (const w of list) {
          if (w.id === wall.parentId) return w;
          if (w.children) {
            const found = findParent(w.children);
            if (found) return found;
          }
        }
        return null;
      };
      const parent = findParent(walls);
      siblings = parent?.children || [];
    }

    siblings = [...siblings].sort((a, b) => (undefined !== a.order && undefined !== b.order ? a.order - b.order : 0) || a.name.localeCompare(b.name));

    const currentIndex = siblings.findIndex(w => w.id === wall.id);
    if (currentIndex === -1 || currentIndex >= siblings.length - 1) return; // Already at bottom
    
    // Calculate new orders
    const updates = siblings.map((w, index) => ({ id: w.id, order: index * 10 }));
    // Swap the current and next
    const tempOrder = updates[currentIndex + 1].order;
    updates[currentIndex + 1].order = updates[currentIndex].order;
    updates[currentIndex].order = tempOrder;

    // Optimistik Update
    const newWalls = updateWallsRecursively(walls, updates);
    setWalls(newWalls);

    try {
      const response = await fetch('/api/categories/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      });
      if (!response.ok) throw new Error('Sıralama güncellenemedi');
      toast.success('Sıralama güncellendi');
    } catch (error: any) {
      loadData();
      toast.error(error.message || 'Sıralama güncellenemedi');
    }
  };


  const handleDeleteWall = async (wallId: string) => {
    if (!confirm('Bu duvarı silmek istediğinizden emin misiniz?')) return
    try {
      const response = await fetch(`/api/categories/${wallId}`, { method: 'DELETE' })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Silme başarısız')
      }
      toast.success('Duvar silindi')
      loadData()
    } catch (error: any) {
      toast.error(error.message || 'Duvar silinemedi')
    }
  }

  // Ad operations
  const handleSaveAd = async () => {
    try {
      if (!adForm.title || !adForm.imageUrl || !adForm.link || !adForm.positions || adForm.positions.length === 0) {
        toast.error('Lütfen zorunlu alanları (Başlık, Resim URL, Link, En az 1 Pozisyon) doldurun')
        return
      }
      
      const payload = { ...adForm }
      if (!payload.categoryId) delete (payload as any).categoryId

      const method = editingItem ? 'PUT' : 'POST'
      const url = editingItem ? `/api/ads/${editingItem.id}` : '/api/ads'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'İşlem başarısız')
      }

      toast.success(editingItem ? 'Reklam güncellendi' : 'Reklam oluşturuldu')
      setShowAdModal(false)
      loadData()
    } catch (error: any) {
      toast.error(error.message || 'Reklam kaydedilirken hata oluştu')
    }
  }

  const handleDeleteAd = async (id: string) => {
    if (!confirm('Bu reklamı silmek istediğinizden emin misiniz?')) return
    try {
      const response = await fetch(`/api/ads/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Silme başarısız')
      }
      toast.success('Reklam silindi')
      loadData()
    } catch (error: any) {
      toast.error(error.message || 'Reklam silinemedi')
    }
  }

  const handleSaveCompany = async () => {
    try {
      if (!companyForm.name) {
        toast.error('Lütfen firma adını girin')
        return
      }

      const method = editingCompany ? 'PUT' : 'POST'
      const url = editingCompany ? `/api/ad-companies/${editingCompany.id}` : '/api/ad-companies'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyForm)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'İşlem başarısız')
      }

      toast.success(editingCompany ? 'Firma güncellendi' : 'Firma oluşturuldu')
      setShowCompanyModal(false)
      loadData()
    } catch (error: any) {
      toast.error(error.message || 'Firma kaydedilirken hata oluştu')
    }
  }

  const handleDeleteCompany = async (id: string) => {
    if (!confirm('Bu firmayı silmek istediğinizden emin misiniz? Altındaki tüm reklamlar da silinecek ya da boşa düşecektir.')) return
    try {
      const response = await fetch(`/api/ad-companies/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Silme başarısız')
      }
      toast.success('Firma silindi')
      loadData()
    } catch (error: any) {
      toast.error(error.message || 'Firma silinemedi')
    }
  }

  const openCompanyModal = (company?: any) => {
    if (company) {
      setEditingCompany(company)
      setCompanyForm({
        name: company.name,
        contactInfo: company.contactInfo || '',
        isActive: company.isActive ?? true
      })
    } else {
      setEditingCompany(null)
      setCompanyForm({ name: '', contactInfo: '', isActive: true })
    }
    setShowCompanyModal(true)
  }

  const openAdModal = (companyId?: string, ad?: any) => {
    if (ad) {
      setEditingItem(ad)
      
      // Parse positions if they come back as string (depending on prisma json output format)
      let parsedPositions = ['NATIVE']
      if (ad.positions) {
        if (Array.isArray(ad.positions)) {
          parsedPositions = ad.positions
        } else if (typeof ad.positions === 'string') {
          try { parsedPositions = JSON.parse(ad.positions) } catch(e) {}
        }
      }

      let parsedCategoryIds: string[] = []
      if (ad.categoryIds && Array.isArray(ad.categoryIds) && ad.categoryIds.length > 0) {
        parsedCategoryIds = ad.categoryIds
      } else if (ad.categoryId) {
        parsedCategoryIds = [ad.categoryId]
      } else {
        // If neither exists, it implies all pages originally. Load all active wall IDs + root.
        parsedCategoryIds = ['root', ...walls.filter(c => c.isActive !== false).map(c => c.id)]
      }

      setAdForm({
        title: ad.title || '',
        imageUrl: ad.imageUrl || '',
        link: ad.link || '',
        positions: parsedPositions,
        categoryId: ad.categoryId || '',
        categoryIds: parsedCategoryIds,
        isActive: ad.isActive ?? true,
        startDate: ad.startDate ? new Date(ad.startDate).toISOString().slice(0, 16) : '',
        endDate: ad.endDate ? new Date(ad.endDate).toISOString().slice(0, 16) : '',
        frequency: ad.frequency || 1,
        companyId: ad.companyId || companyId || ''
      })
    } else {
      setEditingItem(null)
      setAdForm({ title: '', imageUrl: '', link: '', positions: ['NATIVE'], categoryId: '', categoryIds: ['root', ...walls.filter(c => c.isActive !== false).map(c => c.id)], isActive: true, startDate: '', endDate: '', frequency: 1, companyId: companyId || '' })
    }
    setShowAdModal(true)
  }

  // Post-it operations
  const handleSavePostit = async () => {
    if (postitForm.detail && stripHtml(postitForm.detail).length > 2000) {
      toast.error('Detay en fazla 2000 karakter olabilir')
      return
    }

    try {
      const response = await fetch(`/api/postits/${editingItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postitForm),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Güncelleme başarısız')
      }
      toast.success('Not güncellendi')
      setShowPostitModal(false)
      setEditingItem(null)
      setPostitForm({ content: '', detail: '', categoryId: '', color: 'YELLOW', font: 'HANDWRITING', pushpin: 'RED', link: '', isApproved: false, isPublished: true, imageUrl: '', imageUrls: [], expiresInDays: 'custom', expiresAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], textSize: 'text-base', textColor: '#000000' })
      loadData()
    } catch (error: any) {
      toast.error(error.message || 'Not kaydedilemedi')
    }
  }

  const handlePostitImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (postitForm.imageUrls.length >= 10) {
      toast.error('En fazla 10 medya ekleyebilirsiniz')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Dosya boyutu 10MB\'dan küçük olmalıdır')
      return
    }

    setUploadingPostitImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/local', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Dosya yüklenemedi')

      const { fileUrl } = await response.json()
      setPostitForm(prev => ({
        ...prev,
        imageUrls: [...prev.imageUrls, fileUrl],
        imageUrl: fileUrl
      }))
      toast.success('Resim yüklendi')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Resim yüklenirken hata oluştu')
    } finally {
      setUploadingPostitImage(false)
      e.target.value = ''
    }
  }

  const handleRemovePostitImage = (indexToRemove: number) => {
    setPostitForm(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, index) => index !== indexToRemove)
    }))
  }

  const handleToggleStatus = async (postitId: string, field: 'isApproved' | 'isPublished', value: boolean) => {
    // Optimistic update
    setPostits(prev => prev.map(p => p.id === postitId ? { ...p, [field]: value } : p))
    try {
      const response = await fetch(`/api/postits/${postitId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      })
      if (!response.ok) {
        // Revert on failure
        setPostits(prev => prev.map(p => p.id === postitId ? { ...p, [field]: !value } : p))
        throw new Error('Güncelleme başarısız')
      }
      const messageAction = value ? (field === 'isApproved' ? 'onaylandı' : 'yayına alındı') : (field === 'isApproved' ? 'onayı kaldırıldı' : 'yayından kaldırıldı')
      toast.success(`Not ${messageAction}`)
    } catch (error) {
      toast.error('Not güncellenemedi')
    }
  }

  const openStatsModal = async (postitId: string) => {
    setShowStatsModal(true);
    setLoadingStats(true);
    setStatsData({ likers: [], viewers: [] });
    try {
        const res = await fetch(`/api/admin/postits/${postitId}/stats`);
        if (res.ok) {
            const data = await res.json();
            setStatsData(data);
        } else {
            toast.error('İstatistikler alınamadı');
        }
    } catch (e) {
        toast.error('Bağlantı hatası');
    } finally {
        setLoadingStats(false);
    }
  }

  const handleDeletePostit = async (postitId: string) => {
    const userRole = (session?.user as any)?.role
    if (userRole !== 'SUPER_ADMIN') {
      toast.error('Post-it silme işlemini yalnızca Super Admin yapabilir');
      return;
    }

    if (!confirm('Bu notu silmek istediğinizden emin misiniz?')) return
    try {
      const response = await fetch(`/api/postits/${postitId}`, { method: 'DELETE' })
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Silme başarısız');
      }
      toast.success('Not silindi')
      loadData()
    } catch (error) {
      toast.error('Not silinemedi')
    }
  }


  const handleMovePostit = async (e: React.MouseEvent, postitId: string, direction: 'up' | 'down', groupArr: any[]) => {
    e.stopPropagation();
    const idx = groupArr.findIndex(p => p.id === postitId);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === groupArr.length - 1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const targetPostit = groupArr[targetIdx];

    setPostits(prev => {
      const copy = [...prev];
      const globalIdx1 = copy.findIndex(p => p.id === postitId);
      const globalIdx2 = copy.findIndex(p => p.id === targetPostit.id);
      if (globalIdx1 !== -1 && globalIdx2 !== -1) {
        const temp = copy[globalIdx1];
        copy[globalIdx1] = copy[globalIdx2];
        copy[globalIdx2] = temp;
      }
      return copy;
    });

    const newArr = [...groupArr];
    const tempGroup = newArr[idx];
    newArr[idx] = newArr[targetIdx];
    newArr[targetIdx] = tempGroup;
    
    const updates = newArr.map((p, i) => ({ id: p.id, order: i }));

    try {
      await fetch('/api/postits/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetOrder: updates })
      });
    } catch (error) {
      toast.error('Sıralama güncellenemedi');
    }
  }

  // Role operations
  const handleSaveRole = async () => {
    try {
      if (editingItem) {
        const response = await fetch(`/api/roles/${editingItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(roleForm),
        })
        if (!response.ok) throw new Error('Güncelleme başarısız')
        toast.success('Rol güncellendi')
      } else {
        const response = await fetch('/api/roles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(roleForm),
        })
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Ekleme başarısız')
        }
        toast.success('Rol eklendi')
      }
      setShowRoleModal(false)
      setEditingItem(null)
      setRoleForm({ name: '', description: '', permissions: [] })
      loadData()
    } catch (error: any) {
      toast.error(error.message || 'Rol kaydedilemedi')
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Bu rolü silmek istediğinizden emin misiniz?')) return
    try {
      const response = await fetch(`/api/roles/${roleId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Silme başarısız')
      toast.success('Rol silindi')
      loadData()
    } catch (error) {
      toast.error('Rol silinemedi')
    }
  }

  const handleSaveUserGroup = async () => {
    try {
      if (!userGroupForm.name) {
        toast.error('Grup adı gereklidir')
        return
      }

      if (editingItem) {
        // Update existing group
        const response = await fetch(`/api/user-groups/${editingItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userGroupForm),
        })
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Güncelleme başarısız')
        }
        toast.success('Grup güncellendi')
      } else {
        // Create new group
        const response = await fetch('/api/user-groups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userGroupForm),
        })
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Ekleme başarısız')
        }
        toast.success('Grup eklendi')
      }
      setShowUserGroupModal(false)
      setEditingItem(null)
      setUserGroupForm({ name: '', description: '' })
      loadData()
    } catch (error: any) {
      toast.error(error.message || 'Grup kaydedilemedi')
    }
  }

  const handleDeleteUserGroup = async (groupId: string) => {
    if (!confirm('Bu grubu silmek istediğinizden emin misiniz?')) return
    try {
      const response = await fetch(`/api/user-groups/${groupId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Silme başarısız')
      toast.success('Grup silindi')
      loadData()
    } catch (error) {
      toast.error('Grup silinemedi')
    }
  }

  // Slider operations
  const handleSaveSlider = async () => {
    try {
      // Clean up empty images and sync links
      const cleanedImages = []
      const cleanedLinks = []

      for (let i = 0; i < 5; i++) {
        const img = sliderForm.images[i]
        if (img && img.trim() !== '') {
          cleanedImages.push(img.trim())
          cleanedLinks.push(sliderForm.links[i]?.trim() || '')
        }
      }

      const payload = {
        ...sliderForm,
        categoryId: sliderForm.categoryId || null,
        images: cleanedImages,
        links: cleanedLinks
      }

      if (editingItem) {
        const response = await fetch(`/api/sliders/${editingItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Güncelleme başarısız')
        }
        toast.success('Slayder güncellendi')
      } else {
        const response = await fetch('/api/sliders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Ekleme başarısız')
        }
        toast.success('Slayder eklendi')
      }
      setShowSliderModal(false)
      setEditingItem(null)
      setSliderForm({ categoryId: '', images: ['', '', '', '', ''], links: ['', '', '', '', ''], backgroundColor: '#f8f9fa', backgroundImage: '', isGradient: false, isTransparent: false, heroGradientFrom: '#facc15', heroGradientVia: '#f472b6', heroGradientTo: '#a855f7', isActive: true })
      loadData()
    } catch (error: any) {
      toast.error(error.message || 'Slayder kaydedilemedi')
    }
  }

  const handleDeleteSlider = async (sliderId: string) => {
    if (!confirm('Bu slayderi silmek istediğinizden emin misiniz?')) return
    try {
      const response = await fetch(`/api/sliders/${sliderId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Silme başarısız')
      toast.success('Slayder silindi')
      loadData()
    } catch (error) {
      toast.error('Slayder silinemedi')
    }
  }

  // Open edit modals
  const openEditRole = (role: any) => {
    setEditingItem(role)
    let parsedPermissions: string[] = []
    if (role.permissions) {
      try {
        parsedPermissions = typeof role.permissions === 'string' ? JSON.parse(role.permissions) : role.permissions;
      } catch (e) { console.error('Error parsing permissions', e) }
    }
    setRoleForm({ name: role.name, description: role.description || '', permissions: parsedPermissions })
    setShowRoleModal(true)
  }

  const openAddRole = () => {
    setEditingItem(null)
    setRoleForm({ name: '', description: '', permissions: [] })
    setShowRoleModal(true)
  }

  const openEditUserGroup = (group: any) => {
    setEditingItem(group)
    setUserGroupForm({ name: group.name, description: group.description || '' })
    setShowUserGroupModal(true)
  }

  const openAddUserGroup = () => {
    setEditingItem(null)
    setUserGroupForm({ name: '', description: '' })
    setShowUserGroupModal(true)
  }

  const openEditUser = (user: any) => {
    setEditingItem(user)
    let perms = [];
    if (user.permissions) {
      try {
        perms = typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions;
      } catch (e) {}
    }
    setUserForm({ name: user.name || '', email: user.email, password: '', role: user.role, userGroupIds: user.userGroups?.map((g: any) => g.id) || [], permissions: perms, nickname: user.nickname || '', companyName: user.companyName || '', phone: user.phone || '', taxId: user.taxId || '', cityId: user.cityId || '', districtId: user.districtId || '', receiveEmail: user.receiveEmail !== false, receiveTelegram: user.receiveTelegram !== false })
    setShowUserModal(true)
  }

  const handleCopySettings = (sourceWallId: string) => {
    if (!sourceWallId) return;
    const sourceWall = walls.find(c => c.id === sourceWallId);
    if (!sourceWall) return;


    if (confirm(`DİKKAT: "${sourceWall.name}" duvarının tüm Görünüm, Pano ve OTT ayarları şu anki forma aktarılacaktır. Devam etmek istiyor musunuz?`)) {
      setWallForm((prev: any) => {
        const isAnaDuvar = sourceWall.name === 'Ana Duvar';
        const getV = (key: string, defaultVal: any) => {
            if (isAnaDuvar) {
              const val = (siteSettings as any)[key];
              return val !== undefined && val !== null ? val : defaultVal;
            }
            const val = sourceWall[key];
            return val !== undefined && val !== null ? val : defaultVal;
        };
        const getB = (key: string, defaultVal: boolean) => {
           if (isAnaDuvar) {
              const val = (siteSettings as any)[key];
              return val !== undefined && val !== null ? !!val : defaultVal;
           }
           const val = sourceWall[key];
           return val !== undefined && val !== null ? !!val : defaultVal;
        };

        return {
        ...prev,
        // Görünüm (Appearance)
        backgroundColor: getV('backgroundColor', ''),
        backgroundImage: getV('backgroundImage', ''),
        borderColor: getV('borderColor', ''),
        borderTopColor: getV('borderTopColor', ''),
        borderBottomColor: getV('borderBottomColor', ''),
        isGradient: getB('isGradient', false),
        gradientFrom: getV('gradientFrom', '#facc15'),
        gradientVia: getV('gradientVia', '#f472b6'),
        gradientTo: getV('gradientTo', '#a855f7'),
        isWallTransparent: getB('isWallTransparent', false),
        noBorder: getB('noBorder', false),
        ribbonImage: getV('ribbonImage', ''),
        ribbonColor: getV('ribbonColor', '#502bb1'),
        ribbonTextColor: getV('ribbonTextColor', '#ffffff'),
        ribbonTextFont: getV('ribbonTextFont', 'sans-serif'),
        customRibbonText: getV('customRibbonText', ''),
        ribbonAlignment: getV('ribbonAlignment', 'center'),
        hideWallTitle: getB('hideWallTitle', false),
        hideWallRibbon: getB('hideWallRibbon', false),
        hideHeroPushpin: getB('hideHeroPushpin', false),
        // Kategori Menüsü (Nav Menu)
        navMenuBgColor: getV('navMenuBgColor', ''),
        navMenuFont: getV('navMenuFont', 'sans-serif'),
        navMenuTextColor: getV('navMenuTextColor', ''),
        navMenuFontSize: getV('navMenuFontSize', 14),
        navMenuMainBold: getV('navMenuMainBold', true),
        navMenuIsTransparent: getV('navMenuIsTransparent', false),
        navMenuBackgroundImage: getV('navMenuBackgroundImage', ''),
        navMenuVariant: getV('navMenuVariant', 'classic'),
        // Genel Site Arka Planı
        siteBackgroundColor: getV('siteBackgroundColor', ''),
        siteBackgroundImage: getV('siteBackgroundImage', ''),
        siteBackgroundStyle: getV('siteBackgroundStyle', 'repeat'),
        siteGradientFrom: getV('siteGradientFrom', ''),
        siteGradientVia: getV('siteGradientVia', ''),
        siteGradientTo: getV('siteGradientTo', ''),
        siteIsGradient: getB('siteIsGradient', false),
        // Ana Kapak (Hero Settings)
        heroSubtitle: getV('heroSubtitle', ''),
        heroTitleFont: getV('heroTitleFont', 'sans-serif'),
        heroTitleColor: getV('heroTitleColor', '#ffffff'),
        heroTitleSize: getV('heroTitleSize', '5xl'),
        heroTitleBgMode: getV('heroTitleBgMode', 'none'),
        heroTitleBgColor: getV('heroTitleBgColor', '#000000'),
        heroTitleBgOpacity: getV('heroTitleBgOpacity', 40),
        heroTitleBgImage: getV('heroTitleBgImage', ''),
        heroSubtitleFont: getV('heroSubtitleFont', 'sans-serif'),
        heroSubtitleColor: getV('heroSubtitleColor', '#ffffff'),
        heroSubtitleSize: getV('heroSubtitleSize', 'xl'),
        heroGradientFrom: getV('heroGradientFrom', '#facc15'),
        heroGradientVia: getV('heroGradientVia', '#f472b6'),
        heroGradientTo: getV('heroGradientTo', '#a855f7'),
        heroAlignment: getV('heroAlignment', 'left'),
        heroBackgroundImage: getV('heroBackgroundImage', ''),
        heroBackgroundStyle: getV('heroBackgroundStyle', 'cover'),
        isHeroTransparent: getB('isHeroTransparent', false),
        hideHeroText: getB('hideHeroText', false),
        // Pano Düzeni (Board Layout)
        noInnerBorder: getB('noInnerBorder', false),
        innerBackgroundColor: getV('innerBackgroundColor', '#E8DCC4'),
        isInnerTransparent: getB('isInnerTransparent', false),
        useCustomLayout: getB('useCustomLayout', false),
        customLayout: Array.isArray(sourceWall.customLayout) ? sourceWall.customLayout : (typeof sourceWall.customLayout === 'string' ? (() => { try { return JSON.parse(sourceWall.customLayout) || [] } catch (e) { return [] } })() : []),
        postitAppearance: typeof sourceWall.postitAppearance === 'string' ? (() => { try { return JSON.parse(sourceWall.postitAppearance) || {} } catch (e) { return {} } })() : (sourceWall.postitAppearance || {}),
        // OTT Mod (OTT Settings)
        isOttActive: getB('isOttActive', false),
      showVirtualPostitsIfEmpty: getB('showVirtualPostitsIfEmpty', true),
      showVirtualPostitLogos: getB('showVirtualPostitLogos', false),
        ottItemsPerRow: getV('ottItemsPerRow', 4),
        ottCardRatio: getV('ottCardRatio', '16/9'),
        ottAutoScrollSpeed: getV('ottAutoScrollSpeed', 0),
        ottShowTopMenu: getV('ottShowTopMenu', true),
        ottShowHeroSlider: getV('ottShowHeroSlider', true),
        ottTopMenuShape: getV('ottTopMenuShape', 'circle'),
        ottShowCategoryTitles: getV('ottShowCategoryTitles', true),
        ottCardStyle: getV('ottCardStyle', 'cover'),
        ottCategoryTitleSize: getV('ottCategoryTitleSize', '2xl'),
      ottCategoryHeaderGlassy: getV('ottCategoryHeaderGlassy', false),
        ottCategoryTitleColor: getV('ottCategoryTitleColor', ''),
        ottCategoryTitleAlignment: getV('ottCategoryTitleAlignment', 'left'),
        ottCategoryTitleFont: getV('ottCategoryTitleFont', 'sans-serif'),
        ottSeparatorStyle: getV('ottSeparatorStyle', 'none'),
        ottSeparatorColor: getV('ottSeparatorColor', '#cbd5e1'),
        ottTopMenuLabelBgColor: getV('ottTopMenuLabelBgColor', ''),
        ottTopMenuLabelHasBorder: getB('ottTopMenuLabelHasBorder', false),
        ottTopMenuMarqueeActive: getB('ottTopMenuMarqueeActive', false),
        ottTopMenuMarqueeSpeed: getV('ottTopMenuMarqueeSpeed', 30),
        isEditorModeActive: getV('isEditorModeActive', false),
        isStyleModeActive: getV('isStyleModeActive', false),
        styleModeSettings: typeof getV('styleModeSettings', '{}') === 'object' ? JSON.stringify(getV('styleModeSettings', '{}')) : getV('styleModeSettings', '{}'),
        ottTopMenuIconBgColor: getV('ottTopMenuIconBgColor', ''),
        ottCardBgType: getV('ottCardBgType', 'postit'),
        ottCardBgColor: getV('ottCardBgColor', ''),
        ottCardBgColorAlpha: getV('ottCardBgColorAlpha', 100),
        ottCardBgImage: getV('ottCardBgImage', ''),
        ottModalBgType: getV('ottModalBgType', 'postit'),
        ottModalBgColor: getV('ottModalBgColor', ''),
        ottModalBgColorAlpha: getV('ottModalBgColorAlpha', 70),
        ottModalBgImage: getV('ottModalBgImage', ''),
        ottModalTextColor: getV('ottModalTextColor', '')
      };
    });

    // Slayder Yönetimi Ayarlarını Şablondan Aktarma
    const isAnaDuvar = sourceWall.name === 'Ana Duvar';
    const sourceWallSlider = sliders.find(s => s.categoryId === sourceWall.id) || (isAnaDuvar ? sliders.find(s => !s.categoryId) : null);
    if (sourceWallSlider) {
      setSliderForm((prev: any) => ({
        ...prev,
        // categoryId is not changed intentionally to maintain relation with the target wall
        images: sourceWallSlider.images || ['', '', '', '', ''],
        links: sourceWallSlider.links || ['', '', '', '', ''],
        backgroundColor: sourceWallSlider.backgroundColor || '#f8f9fa',
        backgroundImage: sourceWallSlider.backgroundImage || '',
        isGradient: sourceWallSlider.isGradient || false,
        heroGradientFrom: sourceWallSlider.heroGradientFrom || '#facc15',
        heroGradientVia: sourceWallSlider.heroGradientVia || '#f472b6',
        heroGradientTo: sourceWallSlider.heroGradientTo || '#a855f7',
        isTransparent: sourceWallSlider.isTransparent || false,
        isActive: sourceWallSlider.isActive !== undefined ? sourceWallSlider.isActive : true
      }));
    }

    toast.success('Şablon (ve varsa Slayder) ayarları forma başarıyla aktarıldı. Kaydetmek için en alttaki Kaydet butonuna basmayı unutmayın.');
    }
  }

  const openEditWall = (wall: any) => {
    setEditingItem(wall)
    const getV = (key: string, defaultVal: any) => (wall[key] !== undefined && wall[key] !== null && wall[key] !== '' ? wall[key] : defaultVal);
    const getB = (key: string, defaultVal: boolean) => (wall[key] !== undefined && wall[key] !== null ? !!wall[key] : defaultVal);
    setWallForm({
      name: wall.name,
      description: wall.description || '',
      icon: wall.icon || '',
      wallManagerIds: wall.wallManagers?.map((m: any) => m.id) || [],
      wallViewerIds: wall.wallViewers?.map((m: any) => m.id) || [],
      userGroupId: wall.userGroupId || '',
      parentId: wall.parentId || '',
      cityId: wall.cityId || '',
      districtId: wall.districtId || '',
      contactName: wall.contactName || '',
      contactPhone: wall.contactPhone || '',
      contactEmail: wall.contactEmail || '',
      heroSubtitle: getV('heroSubtitle', ''),
      heroTitleFont: getV('heroTitleFont', 'sans-serif'),
      heroTitleColor: getV('heroTitleColor', '#ffffff'),
      heroTitleSize: getV('heroTitleSize', '5xl'),
      heroTitleBgMode: getV('heroTitleBgMode', 'none'),
      heroTitleBgColor: getV('heroTitleBgColor', '#000000'),
      heroTitleBgOpacity: getV('heroTitleBgOpacity', 40),
      heroTitleBgImage: getV('heroTitleBgImage', ''),
      heroSubtitleFont: getV('heroSubtitleFont', 'sans-serif'),
      heroSubtitleColor: getV('heroSubtitleColor', '#ffffff'),
      heroSubtitleSize: getV('heroSubtitleSize', 'xl'),
      heroGradientFrom: getV('heroGradientFrom', '#facc15'),
      heroGradientVia: getV('heroGradientVia', '#f472b6'),
      heroGradientTo: getV('heroGradientTo', '#a855f7'),
      backgroundColor: getV('backgroundColor', ''),
      backgroundImage: getV('backgroundImage', ''),
      borderColor: getV('borderColor', ''),
      borderTopColor: getV('borderTopColor', ''),
      borderBottomColor: getV('borderBottomColor', ''),
      isGradient: getB('isGradient', false),
      gradientFrom: getV('gradientFrom', '#facc15'),
      gradientVia: getV('gradientVia', '#f472b6'),
      gradientTo: getV('gradientTo', '#a855f7'),
      isWallTransparent: getB('isWallTransparent', false),
      noBorder: getB('noBorder', false),
      noInnerBorder: getB('noInnerBorder', false),
      innerBackgroundColor: getV('innerBackgroundColor', '#E8DCC4'),
      isInnerTransparent: getB('isInnerTransparent', false),
      heroAlignment: getV('heroAlignment', 'left'),
      heroBackgroundImage: getV('heroBackgroundImage', ''),
      heroBackgroundStyle: getV('heroBackgroundStyle', 'cover'),
      isHeroTransparent: getB('isHeroTransparent', false),
      hideHeroText: getB('hideHeroText', false),
      hideWallTitle: getB('hideWallTitle', false),
      hideWallRibbon: getB('hideWallRibbon', false),
      hideHeroPushpin: getB('hideHeroPushpin', false),
      ribbonImage: getV('ribbonImage', ''),
      ribbonColor: getV('ribbonColor', '#502bb1'),
      ribbonTextColor: getV('ribbonTextColor', '#ffffff'),
      ribbonTextFont: getV('ribbonTextFont', 'sans-serif'),
      customRibbonText: getV('customRibbonText', ''),
      ribbonAlignment: getV('ribbonAlignment', 'center'),
      navMenuBgColor: getV('navMenuBgColor', ''),
      navMenuFont: getV('navMenuFont', 'sans-serif'),
      navMenuTextColor: getV('navMenuTextColor', ''),
      navMenuFontSize: getV('navMenuFontSize', 14),
      navMenuMainBold: getB('navMenuMainBold', true),
      navMenuIsTransparent: getB('navMenuIsTransparent', false),
      navMenuBackgroundImage: getV('navMenuBackgroundImage', ''),
      navMenuVariant: getV('navMenuVariant', 'classic'),
      siteBackgroundColor: getV('siteBackgroundColor', ''),
      siteBackgroundImage: getV('siteBackgroundImage', ''),
      siteBackgroundStyle: getV('siteBackgroundStyle', 'repeat'),
      siteGradientFrom: getV('siteGradientFrom', ''),
      siteGradientVia: getV('siteGradientVia', ''),
      siteGradientTo: getV('siteGradientTo', ''),
      siteIsGradient: getB('siteIsGradient', false),
      calendarEntries: wall.calendarEntries || [],
      homeCategoryIds: wall.homeCategoryIds || [],
      postitLimit: getV('postitLimit', 0),
      logoUrl: getV('logoUrl', ''),
      logoPosition: getV('logoPosition', 'top-right'),
      logoSize: getV('logoSize', 'medium'),
      logoFrame: getV('logoFrame', 'original'),
      useParentLogo: getB('useParentLogo', false),
      useCustomLayout: getB('useCustomLayout', false),
      customLayout: Array.isArray(wall.customLayout) ? wall.customLayout : (typeof wall.customLayout === 'string' ? (() => { try { return JSON.parse(wall.customLayout) || [] } catch (e) { return [] } })() : []),
      postitAppearance: typeof wall.postitAppearance === 'string' ? (() => { try { return JSON.parse(wall.postitAppearance) || {} } catch (e) { return {} } })() : (wall.postitAppearance || {}),
      isOttActive: getB('isOttActive', false),
      showVirtualPostitsIfEmpty: getB('showVirtualPostitsIfEmpty', true), showVirtualPostitLogos: getB('showVirtualPostitLogos', false),
      ottItemsPerRow: getV('ottItemsPerRow', 4),
      ottCardRatio: getV('ottCardRatio', '9/13'),
      ottAutoScrollSpeed: getV('ottAutoScrollSpeed', 0),
      ottShowTopMenu: getB('ottShowTopMenu', true),
      ottShowHeroSlider: getB('ottShowHeroSlider', true),
      ottTopMenuShape: getV('ottTopMenuShape', 'circle'),
      ottShowCategoryTitles: getB('ottShowCategoryTitles', true),
      ottCardStyle: getV('ottCardStyle', 'cover'),
      ottCategoryTitleSize: getV('ottCategoryTitleSize', '2xl'),
      ottCategoryHeaderGlassy: getB('ottCategoryHeaderGlassy', false),
      ottCategoryTitleColor: getV('ottCategoryTitleColor', ''),
      ottCategoryTitleAlignment: getV('ottCategoryTitleAlignment', 'left'),
      ottCategoryTitleFont: getV('ottCategoryTitleFont', 'sans-serif'),
      ottSeparatorStyle: getV('ottSeparatorStyle', 'none'),
      ottSeparatorColor: getV('ottSeparatorColor', '#cbd5e1'),
      ottTopMenuLabelBgColor: getV('ottTopMenuLabelBgColor', ''),
      ottTopMenuLabelHasBorder: getB('ottTopMenuLabelHasBorder', false),
      ottTopMenuMarqueeActive: getB('ottTopMenuMarqueeActive', false),
      ottTopMenuMarqueeSpeed: getV('ottTopMenuMarqueeSpeed', 30),
      isEditorModeActive: getV('isEditorModeActive', false),
      isStyleModeActive: getV('isStyleModeActive', false),
      styleModeSettings: typeof getV('styleModeSettings', '{}') === 'object' ? JSON.stringify(getV('styleModeSettings', '{}')) : getV('styleModeSettings', '{}'),
      ottTopMenuIconBgColor: getV('ottTopMenuIconBgColor', ''),
      ottCardBgType: getV('ottCardBgType', 'postit'),
      ottCardBgColor: getV('ottCardBgColor', ''),
      ottCardBgColorAlpha: getV('ottCardBgColorAlpha', 100),
      ottCardBgImage: getV('ottCardBgImage', ''),
      ottModalBgType: getV('ottModalBgType', 'postit'),
      ottModalBgColor: getV('ottModalBgColor', ''),
      ottModalBgColorAlpha: getV('ottModalBgColorAlpha', 70),
      ottModalBgImage: getV('ottModalBgImage', ''),
      ottModalTextColor: getV('ottModalTextColor', ''),
      isActive: wall.isActive !== undefined ? wall.isActive : true,
      isPrivate: wall.isPrivate !== undefined ? wall.isPrivate : false,
      expirationDate: wall.expirationDate ? new Date(wall.expirationDate).toISOString().split('T')[0] : ''
    })

    // Slayder ayarlarını yükle
    const wallSlider = sliders.find(s => s.categoryId === wall.id)
    if (wallSlider) {
      setSliderForm({
        categoryId: wall.id,
        images: wallSlider.images || ['', '', '', '', ''],
        links: wallSlider.links || ['', '', '', '', ''],
        backgroundColor: wallSlider.backgroundColor || '#f8f9fa',
        backgroundImage: wallSlider.backgroundImage || '',
        isGradient: wallSlider.isGradient || false,
        heroGradientFrom: wallSlider.heroGradientFrom || '#facc15',
        heroGradientVia: wallSlider.heroGradientVia || '#f472b6',
        heroGradientTo: wallSlider.heroGradientTo || '#a855f7',
        isTransparent: wallSlider.isTransparent || false,
        isActive: wallSlider.isActive !== undefined ? wallSlider.isActive : true
      })
    } else {
      setSliderForm({
        categoryId: wall.id,
        images: ['', '', '', '', ''],
        links: ['', '', '', '', ''],
        backgroundColor: '#f8f9fa',
        backgroundImage: '',
        isGradient: false,
        heroGradientFrom: '#facc15',
        heroGradientVia: '#f472b6',
        heroGradientTo: '#a855f7',
        isTransparent: false,
        isActive: true
      })
    }

    setShowWallModal(true)
  }

  const openMoveWallModal = (wall: any) => {
    setWallToMove(wall)
    setSelectedNewParentId('root') // default to root
    setShowMoveWallModal(true)
  }

  const handleMoveWallSubmit = async () => {
    if (!wallToMove) return;

    try {
      const response = await fetch(`/api/categories/${wallToMove.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parentId: selectedNewParentId === 'root' ? null : selectedNewParentId
        })
      });

      if (!response.ok) {
        throw new Error('Duvar taşınırken hata oluştu');
      }

      toast.success('Duvar başarıyla taşındı');
      setShowMoveWallModal(false);
      setWallToMove(null);
      loadData(); // reload walls
    } catch (e: any) {
      toast.error(e?.message || 'Bir hata oluştu');
    }
  }

  const openMovePostitModal = (postit: any) => {
    setPostitToMove(postit)
    setSelectedPostitNewCategoryId(postit.categoryId) // default to current wall
    setShowMovePostitModal(true)
  }

  const openCopyWallModal = (wall: any) => {
    setWallToCopy(wall)
    setCopyWallOptions({ copyPostits: false })
    setSelectedCopyParentId(wall.parentId || 'root')
    setShowCopyWallModal(true)
  }

  const handleCopyWallSubmit = async () => {
    if (!wallToCopy) return;
    setIsCopyingWall(true);
    try {
      const response = await fetch(`/api/categories/copy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryId: wallToCopy.id,
          copyPostits: copyWallOptions.copyPostits,
          targetParentId: selectedCopyParentId === 'root' ? null : selectedCopyParentId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Duvar kopyalanırken hata oluştu');
      }

      toast.success('Duvar başarıyla kopyalandı');
      setShowCopyWallModal(false);
      setWallToCopy(null);
      loadData(); // reload walls
    } catch (e: any) {
      toast.error(e?.message || 'Bir hata oluştu');
    } finally {
      setIsCopyingWall(false);
    }
  }

  const handleMovePostitSubmit = async () => {
    if (!postitToMove || !selectedPostitNewCategoryId) return;

    try {
      const response = await fetch(`/api/postits/${postitToMove.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryId: selectedPostitNewCategoryId
        })
      });

      if (!response.ok) {
        throw new Error('Not taşınırken hata oluştu');
      }

      toast.success('Not başarıyla taşındı');
      setShowMovePostitModal(false);
      setPostitToMove(null);
      loadData(); // reload data
    } catch (e: any) {
      toast.error(e?.message || 'Bir hata oluştu');
    }
  }

  const openAddSubcategory = (parentWall: any) => {
    setEditingItem(null)
    setParentWallForSubcategory(parentWall)
    setWallForm({
      name: '',
      description: '',
      icon: '',
      wallManagerIds: [],
      wallViewerIds: [],
      userGroupId: '',
      parentId: parentWall.id,
      cityId: '',
      districtId: '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      heroSubtitle: '',
      heroTitleFont: 'sans-serif',
      heroTitleColor: '#ffffff',
      heroTitleSize: '5xl',
      heroTitleBgMode: 'none',
      heroTitleBgColor: '#000000',
      heroTitleBgOpacity: 40,
      heroTitleBgImage: '',
      heroSubtitleFont: 'sans-serif',
      heroSubtitleColor: '#ffffff',
      heroSubtitleSize: 'xl',
      heroGradientFrom: '#facc15',
      heroGradientVia: '#f472b6',
      heroGradientTo: '#a855f7',
      backgroundColor: '',
      backgroundImage: '',
      borderColor: '',
      borderTopColor: '',
      borderBottomColor: '',
      isGradient: false,
      gradientFrom: '#facc15',
      gradientVia: '#f472b6',
      gradientTo: '#a855f7',
      isWallTransparent: false,
      noBorder: false,
      noInnerBorder: false,
      innerBackgroundColor: '#E8DCC4',
      isInnerTransparent: false,
      heroAlignment: 'left',
      hideHeroText: false,
      heroBackgroundImage: '',
      heroBackgroundStyle: 'cover',
      isHeroTransparent: false,
      navMenuBgColor: '',
      navMenuFont: 'sans-serif',
      navMenuTextColor: '',
      navMenuFontSize: 14,
      navMenuMainBold: true,
      navMenuIsTransparent: false,
      navMenuBackgroundImage: '',
      navMenuVariant: 'classic',
      siteBackgroundColor: '',
      siteBackgroundImage: '',
      siteBackgroundStyle: 'repeat',
      siteGradientFrom: '',
      siteGradientVia: '',
      siteGradientTo: '',
      siteIsGradient: false,
      calendarEntries: [],
      homeCategoryIds: [] as string[],
      postitLimit: 0,
      logoUrl: '',
      logoPosition: 'top-right',
      logoSize: 'medium',
      logoFrame: 'original',
      useParentLogo: false,
      useCustomLayout: false,
      customLayout: [],
      postitAppearance: {},
      isOttActive: false,
      showVirtualPostitsIfEmpty: true,
      showVirtualPostitLogos: false,
      ottItemsPerRow: 4,
      ottCardRatio: '9/13',
      ottAutoScrollSpeed: 0,
      ottShowTopMenu: true,
      ottShowHeroSlider: true,
      ottTopMenuShape: 'circle',
      ottShowCategoryTitles: true,
      ottCardStyle: 'cover',
      ottCategoryTitleSize: '2xl',
      ottCategoryTitleColor: '',
      ottCategoryTitleAlignment: 'left',
      ottCategoryTitleFont: 'sans-serif',
      ottSeparatorStyle: 'none',
      ottSeparatorColor: '#cbd5e1',
      ottTopMenuLabelBgColor: '',
      ottTopMenuLabelHasBorder: false,
      ottTopMenuMarqueeActive: false,
      ottTopMenuMarqueeSpeed: 30, ottCategoryHeaderGlassy: false,
      isEditorModeActive: false,
      isStyleModeActive: false,
      styleModeSettings: '{}',
      ottTopMenuIconBgColor: '',
      ottCardBgType: 'postit', ottCardBgColor: '', ottCardBgColorAlpha: 100, ottCardBgImage: '',
      ottModalBgType: 'postit', ottModalBgColor: '', ottModalBgColorAlpha: 70, ottModalBgImage: '', ottModalTextColor: '',
      hideWallTitle: false,
      hideWallRibbon: false,
      hideHeroPushpin: false,
      ribbonImage: '',
      ribbonColor: '#502bb1',
      ribbonTextColor: '#ffffff',
      ribbonTextFont: 'sans-serif',
      customRibbonText: '',
      ribbonAlignment: 'center',
      isActive: true,
      isPrivate: false,
      expirationDate: ''
    })
    setSliderForm({
      categoryId: '',
      images: ['', '', '', '', ''],
      links: ['', '', '', '', ''],
      backgroundColor: '#f8f9fa',
      backgroundImage: '',
      isGradient: false,
      heroGradientFrom: '#facc15',
      heroGradientVia: '#f472b6',
      heroGradientTo: '#a855f7',
      isTransparent: false,
      isActive: true
    })
    setSelectedPostsToMove([])
    // If parent has posts, show option to move them
    if (parentWall._count?.postits > 0) {
      setShowMovePostsModal(true)
    } else {
      setShowWallModal(true)
    }
  }

  const openEditPostit = (postit: any) => {
    setEditingItem(postit)

    let initialImages: string[] = []
    if (postit.PostItImage && postit.PostItImage.length > 0) {
      initialImages = postit.PostItImage.map((img: any) => img.url)
    } else if (postit.imageUrl) {
      initialImages = [postit.imageUrl]
    }

    setPostitForm({
      content: postit.content || '',
      detail: postit.detail || '',
      categoryId: postit.categoryId || '',
      color: postit.color || 'YELLOW',
      font: postit.font || 'HANDWRITING',
      pushpin: postit.pushpin || 'RED',
      link: postit.link || '',
      isApproved: postit.isApproved || false,
      isPublished: postit.isPublished !== false, // Defaults to true if missing
      imageUrl: postit.imageUrl || '',
      imageUrls: initialImages,
      expiresInDays: 'custom',
      expiresAtDate: postit.expiresAt ? new Date(postit.expiresAt).toISOString().split('T')[0] : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      textSize: postit.textSize || 'text-base',
      textColor: postit.textColor || '#000000'
    })
    setShowPostitModal(true)
  }

  const openAddUser = () => {
    setEditingItem(null)
    setUserForm({ name: '', email: '', password: '', role: 'USER', userGroupIds: [], permissions: [], nickname: '', companyName: '', phone: '', taxId: '', cityId: '', districtId: '', receiveEmail: true, receiveTelegram: true })
    setShowUserModal(true)
  }

  const openAddWall = () => {
    setEditingItem(null)
    setParentWallForSubcategory(null)
    setWallForm({
      name: '',
      description: '',
      icon: '',
      wallManagerIds: [],
      wallViewerIds: [],
      userGroupId: '',
      parentId: '',
      cityId: '',
      districtId: '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      heroSubtitle: '',
      heroTitleFont: 'sans-serif',
      heroTitleColor: '#ffffff',
      heroTitleSize: '5xl',
      heroTitleBgMode: 'none',
      heroTitleBgColor: '#000000',
      heroTitleBgOpacity: 40,
      heroTitleBgImage: '',
      heroSubtitleFont: 'sans-serif',
      heroSubtitleColor: '#ffffff',
      heroSubtitleSize: 'xl',
      heroGradientFrom: '#facc15',
      heroGradientVia: '#f472b6',
      heroGradientTo: '#a855f7',
      backgroundColor: '',
      backgroundImage: '',
      borderColor: '',
      borderTopColor: '',
      borderBottomColor: '',
      isGradient: false,
      gradientFrom: '#facc15',
      gradientVia: '#f472b6',
      gradientTo: '#a855f7',
      isWallTransparent: false,
      noBorder: false,
      noInnerBorder: false,
      innerBackgroundColor: '#E8DCC4',
      isInnerTransparent: false,
      heroAlignment: 'left',
      hideHeroText: false,
      heroBackgroundImage: '',
      heroBackgroundStyle: 'cover',
      isHeroTransparent: false,
      navMenuBgColor: '',
      navMenuFont: 'sans-serif',
      navMenuTextColor: '',
      navMenuFontSize: 14,
      navMenuMainBold: true,
      navMenuIsTransparent: false,
      navMenuBackgroundImage: '',
      navMenuVariant: 'classic',
      siteBackgroundColor: '',
      siteBackgroundImage: '',
      siteBackgroundStyle: 'repeat',
      siteGradientFrom: '',
      siteGradientVia: '',
      siteGradientTo: '',
      siteIsGradient: false,
      calendarEntries: [],
      homeCategoryIds: [] as string[],
      postitLimit: 0,
      logoUrl: '',
      logoPosition: 'top-right',
      logoSize: 'medium',
      logoFrame: 'original',
      useParentLogo: false,
      useCustomLayout: false,
      customLayout: [],
      postitAppearance: {},
      isOttActive: false,
      showVirtualPostitsIfEmpty: true,
      showVirtualPostitLogos: false,
      ottItemsPerRow: 4,
      ottCardRatio: '9/13',
      ottAutoScrollSpeed: 0,
      ottShowTopMenu: true,
      ottShowHeroSlider: true,
      ottTopMenuShape: 'circle',
      ottShowCategoryTitles: true,
      ottCardStyle: 'cover',
      ottCategoryTitleSize: '2xl',
      ottCategoryTitleColor: '',
      ottCategoryTitleAlignment: 'left',
      ottCategoryTitleFont: 'sans-serif',
      ottSeparatorStyle: 'none',
      ottSeparatorColor: '#cbd5e1',
      ottTopMenuLabelBgColor: '',
      ottTopMenuLabelHasBorder: false,
      ottTopMenuMarqueeActive: false,
      ottTopMenuMarqueeSpeed: 30, ottCategoryHeaderGlassy: false,
      isEditorModeActive: false,
      isStyleModeActive: false,
      styleModeSettings: '{}',
      ottTopMenuIconBgColor: '',
      ottCardBgType: 'postit', ottCardBgColor: '', ottCardBgColorAlpha: 100, ottCardBgImage: '',
      ottModalBgType: 'postit', ottModalBgColor: '', ottModalBgColorAlpha: 70, ottModalBgImage: '', ottModalTextColor: '',
      hideWallTitle: false,
      hideWallRibbon: false,
      hideHeroPushpin: false,
      ribbonImage: '',
      ribbonColor: '#502bb1',
      ribbonTextColor: '#ffffff',
      ribbonTextFont: 'sans-serif',
      customRibbonText: '',
      ribbonAlignment: 'center',
      isActive: true,
      isPrivate: false,
      expirationDate: ''
    })
    setSliderForm({
      categoryId: '',
      images: ['', '', '', '', ''],
      links: ['', '', '', '', ''],
      backgroundColor: '#f8f9fa',
      backgroundImage: '',
      isGradient: false,
      heroGradientFrom: '#facc15',
      heroGradientVia: '#f472b6',
      heroGradientTo: '#a855f7',
      isTransparent: false,
      isActive: false
    })
    setSelectedPostsToMove([])
    setShowWallModal(true)
  }

  const handleSliderImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Dosya boyutu 10MB\'dan küçük olmalıdır')
      return
    }

    setUploadingSliderImage(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/upload/local', {
        method: 'POST',
        body: uploadFormData,
      })

      if (!response.ok) {
        throw new Error('Dosya yüklenemedi')
      }

      const { fileUrl } = await response.json()

      const newImages = [...sliderForm.images]
      newImages[index] = fileUrl
      setSliderForm({ ...sliderForm, images: newImages })

      toast.success('Resim yüklendi')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Resim yüklenirken hata oluştu')
    } finally {
      setUploadingSliderImage(false)
      e.target.value = ''
    }
  }

  const handleSliderBgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Dosya boyutu 10MB\'dan küçük olmalıdır')
      return
    }

    setUploadingSliderImage(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/upload/local', {
        method: 'POST',
        body: uploadFormData,
      })

      if (!response.ok) {
        throw new Error('Dosya yüklenemedi')
      }

      const { fileUrl } = await response.json()

      setSliderForm({ ...sliderForm, backgroundImage: fileUrl })
      toast.success('Resim yüklendi')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Resim yüklenirken hata oluştu')
    } finally {
      setUploadingSliderImage(false)
      e.target.value = ''
    }
  }

  const openEditSlider = (slider: any) => {
    setEditingItem(slider)
    const imgs = slider.images || []
    const lnks = slider.links || []
    setSliderForm({
      categoryId: slider.categoryId || '',
      images: [...imgs, ...Array(5 - imgs.length).fill('')].slice(0, 5),
      links: [...lnks, ...Array(5 - lnks.length).fill('')].slice(0, 5),
      backgroundColor: slider.backgroundColor || '#f8f9fa',
      backgroundImage: slider.backgroundImage || '',
      isGradient: slider.isGradient || false,
      heroGradientFrom: slider.heroGradientFrom || '#facc15',
      heroGradientVia: slider.heroGradientVia || '#f472b6',
      heroGradientTo: slider.heroGradientTo || '#a855f7',
      isTransparent: slider.isTransparent,
      isActive: slider.isActive
    })
    setShowSliderModal(true)
  }

  const openAddSlider = () => {
    setEditingItem(null)
    setSliderForm({ categoryId: '', images: ['', '', '', '', ''], links: ['', '', '', '', ''], backgroundColor: '#f8f9fa', backgroundImage: '', isGradient: false, heroGradientFrom: '#facc15', heroGradientVia: '#f472b6', heroGradientTo: '#a855f7', isTransparent: false, isActive: true })
    setShowSliderModal(true)
  }

  // Location operations
  const handleSaveLocation = async () => {
    try {
      if (editingItem) {
        const response = await fetch(`/api/locations/${editingItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(locationForm),
        })
        if (!response.ok) throw new Error('Güncelleme başarısız')
        toast.success(locationForm.type === 'CITY' ? 'İl güncellendi' : 'İlçe güncellendi')
      } else {
        const response = await fetch('/api/locations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(locationForm),
        })
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Ekleme başarısız')
        }
        toast.success(locationForm.type === 'CITY' ? 'İl eklendi' : 'İlçe eklendi')
      }
      setShowLocationModal(false)
      setEditingItem(null)
      setLocationForm({ type: 'CITY', name: '', cityId: '', showInWeather: false })
      loadData()
    } catch (error: any) {
      toast.error(error.message || 'Konum kaydedilemedi')
    }
  }

  const handleToggleWeather = async (city: any) => {
    try {
      const response = await fetch(`/api/locations/${city.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'CITY',
          name: city.name,
          showInWeather: !city.showInWeather
        })
      })
      if (!response.ok) throw new Error('Hava durumu ayarı güncellenemedi')
      
      const updatedCity = await response.json()
      
      setCities(prev => prev.map(loc => 
        loc.id === city.id ? { ...loc, showInWeather: updatedCity.showInWeather } : loc
      ))
      
      toast.success(updatedCity.showInWeather ? `${city.name} hava durumu duvarına eklendi!` : `${city.name} hava durumu gösteriminden çıkarıldı!`)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleDeleteLocation = async (id: string, type: 'CITY' | 'DISTRICT') => {
    if (!confirm('Bu konumu silmek istediğinizden emin misiniz?')) return
    try {
      const response = await fetch(`/api/locations/${id}?type=${type}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Silme başarısız')
      toast.success(type === 'CITY' ? 'İl silindi' : 'İlçe silindi')
      loadData()
    } catch (error) {
      toast.error('Konum silinemedi')
    }
  }

  const openAddLocation = (type: 'CITY' | 'DISTRICT', cityId?: string) => {
    setEditingItem(null)
    setLocationForm({ type, name: '', cityId: cityId || '', showInWeather: false })
    setShowLocationModal(true)
  }

  const openEditLocation = (item: any, type: 'CITY' | 'DISTRICT') => {
    setEditingItem(item)
    setLocationForm({ type, name: item.name, cityId: item.cityId || '', showInWeather: item.showInWeather || false })
    setShowLocationModal(true)
  }

  // Appearance settings functions
  const openAppearanceSettings = (wall: any) => {
    setEditingAppearanceWall(wall)
    setAppearanceForm({
      heroBackgroundImage: wall.heroBackgroundImage || '',
      heroBackgroundStyle: wall.heroBackgroundStyle || 'cover',
      isHeroTransparent: !!wall.isHeroTransparent,
      heroSubtitle: wall.heroSubtitle || '',
      heroTitleFont: wall.heroTitleFont || 'sans-serif',
      heroTitleColor: wall.heroTitleColor || '#ffffff',
      heroTitleSize: wall.heroTitleSize || '5xl',
      heroTitleBgMode: wall.heroTitleBgMode || 'none',
      heroTitleBgColor: wall.heroTitleBgColor || '#000000',
      heroTitleBgOpacity: wall.heroTitleBgOpacity ?? 40,
      heroTitleBgImage: wall.heroTitleBgImage || '',
      heroSubtitleFont: wall.heroSubtitleFont || 'sans-serif',
      heroSubtitleColor: wall.heroSubtitleColor || '#ffffff',
      heroSubtitleSize: wall.heroSubtitleSize || 'xl',
      heroGradientFrom: wall.heroGradientFrom || '#facc15',
      heroGradientVia: wall.heroGradientVia || '#f472b6',
      heroGradientTo: wall.heroGradientTo || '#a855f7',
      heroAlignment: wall.heroAlignment || 'left',
      hideHeroText: !!wall.hideHeroText,
      hideHeroPushpin: !!wall.hideHeroPushpin,
      categoryFont: wall.categoryFont || 'sans-serif',
      categoryColor: wall.categoryColor || '#1f2937',
      categoryBgColor: wall.categoryBgColor || '#ffffff',
      ribbonColor: wall.ribbonColor || '#502bb1',
      ribbonAlignment: wall.ribbonAlignment || 'center',
      logoUrl: wall.logoUrl || '',
      logoPosition: wall.logoPosition || 'top-right'
    })
    setShowAppearanceModal(true)
  }

  const handleSaveAppearance = async () => {
    try {
      const response = await fetch(`/api/categories/${editingAppearanceWall.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appearanceForm),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Güncelleme başarısız')
      }
      toast.success('Görünüm ayarları kaydedildi')
      setShowAppearanceModal(false)
      setEditingAppearanceWall(null)
      loadData()
    } catch (error: any) {
      toast.error(error.message || 'Görünüm ayarları kaydedilemedi')
    }
  }

  const handleSiteImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Dosya boyutu 10MB'dan küçük olmalıdır")
      return
    }

    setUploadingSiteImage(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/upload/local', {
        method: 'POST',
        body: uploadFormData,
      })

      if (!response.ok) {
        throw new Error('Dosya yüklenemedi')
      }

      const { fileUrl } = await response.json()
      setSiteSettings({ ...siteSettings, backgroundImage: fileUrl })
      toast.success('Resim yüklendi')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Resim yüklenirken hata oluştu')
    } finally {
      setUploadingSiteImage(false)
    }
  }

  const handleAppearanceImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Dosya boyutu 10MB'dan küçük olmalıdır")
      return
    }

    setUploadingAppearanceImage(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/upload/local', {
        method: 'POST',
        body: uploadFormData,
      })

      if (!response.ok) {
        throw new Error('Dosya yüklenemedi')
      }

      const { fileUrl } = await response.json()
      setAppearanceForm({ ...appearanceForm, heroBackgroundImage: fileUrl })
      toast.success('Resim yüklendi')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Resim yüklenirken hata oluştu')
    } finally {
      setUploadingAppearanceImage(false)
    }
  }

  const handleWallRibbonImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Dosya boyutu 10MB'dan küçük olmalıdır")
      return
    }

    setUploadingWallRibbonImage(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/upload/local', {
        method: 'POST',
        body: uploadFormData,
      })

      if (!response.ok) throw new Error('Dosya yüklenemedi')

      const { fileUrl } = await response.json()
      setWallForm({ ...wallForm, ribbonImage: fileUrl })
      toast.success('Kurdele resmi yüklendi')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Resim yüklenirken hata oluştu')
    } finally {
      setUploadingWallRibbonImage(false)
    }
  }

  const handleOttBgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Dosya boyutu 10MB'dan küçük olmalıdır")
      return
    }
    setUploadingOttBgImage(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      const response = await fetch('/api/upload/local', { method: 'POST', body: uploadFormData })
      if (!response.ok) throw new Error('Dosya yüklenemedi')
      const { fileUrl } = await response.json()
      setWallForm({ ...wallForm, ottCardBgImage: fileUrl })
      toast.success('OTT arkaplan resmi yüklendi')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Resim yüklenirken hata oluştu')
    } finally {
      setUploadingOttBgImage(false)
    }
  }

  const handleOttModalBgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Dosya boyutu 10MB'dan küçük olmalıdır")
      return
    }
    setUploadingOttModalBgImage(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      const response = await fetch('/api/upload/local', { method: 'POST', body: uploadFormData })
      if (!response.ok) throw new Error('Dosya yüklenemedi')
      const { fileUrl } = await response.json()
      setWallForm({ ...wallForm, ottModalBgImage: fileUrl })
      toast.success('OTT Modal arkaplan resmi yüklendi')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Resim yüklenirken hata oluştu')
    } finally {
      setUploadingOttModalBgImage(false)
    }
  }

  const handleSiteRibbonImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Dosya boyutu 10MB'dan küçük olmalıdır")
      return
    }

    setUploadingSiteRibbonImage(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/upload/local', {
        method: 'POST',
        body: uploadFormData,
      })

      if (!response.ok) throw new Error('Dosya yüklenemedi')

      const { fileUrl } = await response.json()
      setSiteSettings({ ...siteSettings, ribbonImage: fileUrl })
      toast.success('Kurdele resmi yüklendi')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Resim yüklenirken hata oluştu')
    } finally {
      setUploadingSiteRibbonImage(false)
    }
  }

  const handleRibbonImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, catId: string) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Dosya boyutu 10MB'dan küçük olmalıdır")
      return
    }

    setUploadingRibbonImageId(catId)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/upload/local', {
        method: 'POST',
        body: uploadFormData,
      })

      if (!response.ok) {
        throw new Error('Dosya yüklenemedi')
      }

      const { fileUrl } = await response.json()
      setTempCategoryRibbonImages(prev => ({ ...prev, [catId]: fileUrl }))
      toast.success('Kurdele resmi yüklendi')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Görsel yüklenirken hata oluştu')
    } finally {
      setUploadingRibbonImageId(null)
    }
  }

  const handleCalendarPopupImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Dosya boyutu 10MB'dan küçük olmalıdır")
      return
    }

    setUploadingCalendarPopupImage(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/upload/local', {
        method: 'POST',
        body: uploadFormData,
      })

      if (!response.ok) {
        throw new Error('Dosya yüklenemedi')
      }

      const { fileUrl } = await response.json()
      setSiteSettings({ ...siteSettings, calendarPopupBackgroundImage: fileUrl })
      toast.success('Takvim pop-up resmi yüklendi')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Resim yüklenirken hata oluştu')
    } finally {
      setUploadingCalendarPopupImage(false)
    }
  }

  const handleSiteHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Dosya boyutu 10MB'dan küçük olmalıdır")
      return
    }

    setUploadingSiteHeroImage(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/upload/local', {
        method: 'POST',
        body: uploadFormData,
      })

      if (!response.ok) {
        throw new Error('Dosya yüklenemedi')
      }

      const { fileUrl } = await response.json()
      setSiteSettings({ ...siteSettings, heroBackgroundImage: fileUrl })
      toast.success('Resim yüklendi')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Resim yüklenirken hata oluştu')
    } finally {
      setUploadingSiteHeroImage(false)
    }
  }

  const handleWallLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Dosya boyutu 10MB'dan küçük olmalıdır")
      return
    }

    setUploadingWallLogo(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/upload/local', {
        method: 'POST',
        body: uploadFormData,
      })

      if (!response.ok) {
        throw new Error('Dosya yüklenemedi')
      }

      const { fileUrl } = await response.json()
      setWallForm({ ...wallForm, logoUrl: fileUrl })
      toast.success('Logo yüklendi')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Logo yüklenirken hata oluştu')
    } finally {
      setUploadingWallLogo(false)
    }
  }

  const handleBlockImageUpload = async (blockIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Dosya boyutu 10MB'dan küçük olmalıdır")
      return
    }

    const blockId = wallForm.customLayout[blockIndex]?.id;
    if (!blockId) return;

    setUploadingBlockImage(blockId)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/upload/local', {
        method: 'POST',
        body: uploadFormData,
      })

      const responseText = await response.text()
      let data = {} as any
      try { data = JSON.parse(responseText) } catch(e) {}

      if (!response.ok) {
        throw new Error(data.error || 'Dosya yüklenemedi')
      }

      const { fileUrl } = data

      const newLayout = [...wallForm.customLayout];
      newLayout[blockIndex] = { ...newLayout[blockIndex], backgroundImage: fileUrl };
      setWallForm({ ...wallForm, customLayout: newLayout });

      toast.success('Bölüm arkaplanı yüklendi')
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Arkaplan yüklenirken hata oluştu')
    } finally {
      setUploadingBlockImage(null)
      e.target.value = ''
    }
  }

  const handleTitleImageUpload = async (blockIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Dosya boyutu 10MB'dan küçük olmalıdır")
      return
    }

    const blockId = wallForm.customLayout[blockIndex]?.id || String(blockIndex);
    setUploadingTitleImage(blockId)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/upload/local', {
        method: 'POST',
        body: uploadFormData,
      })

      const responseText = await response.text()
      let data = {} as any
      try { data = JSON.parse(responseText) } catch(e) {}

      if (!response.ok) {
        throw new Error(data.error || 'Dosya yüklenemedi')
      }

      const { fileUrl } = data

      const newLayout = [...wallForm.customLayout];
      newLayout[blockIndex] = { ...newLayout[blockIndex], titleImage: fileUrl };
      setWallForm({ ...wallForm, customLayout: newLayout });

      toast.success('Başlık resmi yüklendi')
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Başlık resmi yüklenirken hata oluştu')
    } finally {
      setUploadingTitleImage(null)
      e.target.value = ''
    }
  }

  const handleSiteBackgroundImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Dosya boyutu 10MB'dan küçük olmalıdır")
      return
    }

    setUploadingSiteBackgroundImage(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/upload/local', {
        method: 'POST',
        body: uploadFormData,
      })

      if (!response.ok) {
        throw new Error('Dosya yüklenemedi')
      }

      const { fileUrl } = await response.json()
      setSiteSettings({ ...siteSettings, siteBackgroundImage: fileUrl })
      toast.success('Resim yüklendi')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Resim yüklenirken hata oluştu')
    } finally {
      setUploadingSiteBackgroundImage(false)
    }
  }

  const handleSaveSiteSettings = async () => {
    try {
      setSavingSettings(true)
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteSettings)
      })
      if (!res.ok) throw new Error('Site ayarları kaydedilemedi')
      toast.success('Site görünüm ayarları kaydedildi')
    } catch (e: any) {
      toast.error(e.message || 'Bir hata oluştu')
    } finally {
      setSavingSettings(false)
    }
  }



  const handleSaveCalendarCategory = async () => {
    try {
      setSavingSettings(true)
      const isEditing = !!editingItem
      const res = await fetch('/api/calendar-categories', {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEditing ? { ...calendarCategoryForm, id: editingItem.id } : calendarCategoryForm)
      })

      if (res.ok) {
        toast.success(isEditing ? 'Başlık güncellendi' : 'Başlık eklendi')
        setShowCalendarCategoryModal(false)
        setEditingItem(null)
        setCalendarCategoryForm({ name: '', order: 0, isActive: true, globalEntries: [] })
        loadData()
      } else {
        toast.error('İşlem başarısız oldu')
      }
    } catch (error) {
      console.error('Error saving calendar category:', error)
      toast.error('Bir hata oluştu')
    } finally {
      setSavingSettings(false)
    }
  }

  const handleDeleteCalendarCategory = async (id: string | undefined) => {
    if (!id || !confirm('Bu başlığı silmek istediğinize emin misiniz?')) return

    try {
      const res = await fetch(`/api/calendar-categories?id=${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        toast.success('Başlık silindi')
        loadData()
      } else {
        toast.error('Silme işlemi başarısız oldu')
      }
    } catch (error) {
      console.error('Error deleting calendar category:', error)
      toast.error('Bir hata oluştu')
    }
  }

  const openAddCalendarCategory = () => {
    setEditingItem(null)
    setCalendarCategoryForm({ name: '', order: 0, isActive: true, globalEntries: [] })
    setShowCalendarCategoryModal(true)
  }

  const openEditCalendarCategory = (cat: any) => {
    setEditingItem(cat)
    let parsedEntries = []
    if (cat.globalEntries) {
      if (typeof cat.globalEntries === 'string') {
        try { parsedEntries = JSON.parse(cat.globalEntries) } catch (e) { }
      } else if (Array.isArray(cat.globalEntries)) {
        parsedEntries = cat.globalEntries
      }
    }
    setCalendarCategoryForm({ name: cat.name, order: cat.order, isActive: cat.isActive ?? true, globalEntries: parsedEntries })
    setShowCalendarCategoryModal(true)
  }

  const handleAddGlobalCalendarEntry = () => {
    setCalendarCategoryForm({
      ...calendarCategoryForm,
      globalEntries: [
        ...calendarCategoryForm.globalEntries,
        { date: selectedGlobalCalendarDate, content: '' }
      ]
    })
  }

  const handleRemoveGlobalCalendarEntry = (index: number) => {
    const newEntries = [...calendarCategoryForm.globalEntries]
    newEntries.splice(index, 1)
    setCalendarCategoryForm({ ...calendarCategoryForm, globalEntries: newEntries })
  }

  const handleGlobalCalendarEntryChange = (index: number, field: string, value: any) => {
    const newEntries = [...calendarCategoryForm.globalEntries]
    newEntries[index] = { ...newEntries[index], [field]: value }
    setCalendarCategoryForm({ ...calendarCategoryForm, globalEntries: newEntries })
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const role = (session?.user as any)?.role
  const userId = (session?.user as any)?.id

  const hasPermission = (actionId: string) => {
    const roleStr = (session?.user as any)?.role;
    if (roleStr === 'SUPER_ADMIN') return true;

    if (roles && roles.length > 0) {
      const activeRoleDef = roles.find((r: any) => r.name === roleStr);
      if (activeRoleDef && activeRoleDef.permissions) {
        try {
           const permsArray = typeof activeRoleDef.permissions === 'string' 
            ? JSON.parse(activeRoleDef.permissions) 
            : activeRoleDef.permissions;
           if (Array.isArray(permsArray)) {
             return permsArray.includes(actionId) || permsArray.includes(actionId.split('_')[0]);
           }
        } catch(e) {}
      }
    }
    
    if (roleStr === 'WALL_MANAGER') {
       const managerAccess = ['dashboard', 'walls', 'postits', 'postit_management', 'users', 'ads', 'editor_articles'];
       return managerAccess.some(a => actionId.startsWith(a));
    }
    if (roleStr === 'WALL_USER') {
       const userAccess = ['dashboard', 'postits'];
       return userAccess.some(a => actionId.startsWith(a));
    }
    return false;
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'appearance',
      label: 'Site Yönetim Metinleri',
      icon: Palette,
      children: [
        { id: 'about', label: 'Hakkımızda', icon: Info },
        { id: 'contact', label: 'İletişim', icon: Phone },
        { id: 'terms', label: 'Kullanım Koşulları', icon: FileText },
        { id: 'privacy', label: 'Gizlilik Politikası', icon: Lock },
        { id: 'cookies', label: 'Çerez Politikası', icon: Cookie },
        { id: 'help', label: 'Yardım Merkezi', icon: HelpCircle },
        { id: 'kvkk', label: 'KVKK Metni', icon: Shield },
        { id: 'popularCategories', label: 'Popüler Kategoriler', icon: LayoutGrid },
        { id: 'discover', label: 'Keşfet', icon: Search },
        { id: 'socialMedia', label: 'Sosyal Medya', icon: Share2 },
      ]
    },
    { id: 'search_appearance', label: 'Arama Ekranı Görünümü', icon: Search },
    { id: 'merchant_registration', label: 'Firma Kayıt', icon: Building },
    { id: 'calendar', label: 'Takvim Ayarları', icon: Calendar },
    { id: 'walls', label: 'Duvarlar', icon: LayoutGrid },
    { id: 'locations', label: 'İl İlçe Tanımlama', icon: MapPin },
    { id: 'locations_weather', label: 'Hava Durumu Şehir Sıralaması', icon: Cloud },
    { id: 'users', label: 'Kullanıcılar', icon: Users },
    { id: 'roles', label: 'Yetki Türü Tanımla', icon: Shield },
    { id: 'groups', label: 'Kullanıcı Grupları', icon: UserGroupIcon },
    {
      id: 'notes_group',
      label: 'Notlar',
      icon: StickyNote,
      children: [
        { id: 'postits', label: 'Kategori Bazında Notlar', icon: StickyNote },
        { id: 'user_postits', label: 'Kullanıcı Bazında Notlar', icon: Users },
        { id: 'postit_management', label: 'Postit Yönetimi', icon: SquareStack },
      ]
    },
    { id: 'editor_articles', label: 'Editör Mod Yayınları', icon: BookOpen },
    { id: 'ads', label: 'Reklam Yönetimi', icon: Megaphone },
  ].map(item => {
    if (item.id === 'notes_group') {
      const filteredChildren = item.children?.filter(child => hasPermission(child.id + '_view') || hasPermission(child.id));
      return { ...item, children: filteredChildren };
    }
    return item;
  }).filter(item => {
    if (item.id === 'notes_group') {
      return item.children && item.children.length > 0;
    }
    return hasPermission(item.id + '_view') || hasPermission(item.id);
  })


  const wallManagers = users.filter(u => ['WALL_MANAGER', 'SUPER_ADMIN', 'WALL_USER'].includes(u.role))
  const colors = [
    { value: 'YELLOW', label: 'Sarı', class: 'bg-yellow-200 text-yellow-900 border-yellow-300' },
    { value: 'PINK', label: 'Pembe', class: 'bg-pink-200 text-pink-900 border-pink-300' },
    { value: 'BLUE', label: 'Mavi', class: 'bg-blue-200 text-blue-900 border-blue-300' },
    { value: 'GREEN', label: 'Yeşil', class: 'bg-green-200 text-green-900 border-green-300' },
    { value: 'ORANGE', label: 'Turuncu', class: 'bg-orange-200 text-orange-900 border-orange-300' },
    { value: 'PURPLE', label: 'Mor', class: 'bg-purple-200 text-purple-900 border-purple-300' },
    { value: 'TRANSPARENT', label: 'Transparan', class: 'bg-transparent text-slate-800 border-slate-300 relative border-dashed' },
    { value: 'BLACK', label: 'Gece', class: 'bg-slate-900 text-slate-100 border-slate-700' },
  ]

  const fonts = [
    { value: 'HANDWRITING', label: 'El Yazısı', class: 'font-handwriting' },
    { value: 'SERIF', label: 'Serif', class: 'font-serif' },
    { value: 'SANS', label: 'Sans', class: 'font-sans' },
    { value: 'MONO', label: 'Mono', class: 'font-mono' },
    { value: 'CURSIVE', label: 'Cursive', class: 'font-cursive' },
    { value: 'SYSTEM', label: 'Sistem', class: 'font-system' },
    { value: 'MODERN', label: 'Modern', class: 'font-modern' },
    { value: 'PLAYFUL', label: 'Eğlenceli', class: 'font-playful' }
  ]

  const pushpinOptions = [
    { value: 'RED', label: 'Kırmızı', image: '/pushpins/red.png' },
    { value: 'BLUE', label: 'Mavi', image: '/pushpins/blue.png' },
    { value: 'GOLD', label: 'Altın', image: '/pushpins/gold.png' },
    { value: 'GREEN', label: 'Yeşil', image: '/pushpins/green.png' },
    { value: 'PINK', label: 'Pembe', image: '/pushpins/pink.png' },
    { value: 'SILVER', label: 'Gümüş', image: '/pushpins/silver.png' },
    { value: 'BLACK', label: 'Siyah Kıskaç', image: '' },
    { value: 'TAPE', label: 'Sarı Bant', image: '' },
    { value: 'NONE', label: 'Yok', image: '' }
  ]


  const renderSliderSettings = () => {
    // Filter sliders for "Ana Sayfa (Varsayılan)"
    const homeSliders = sliders.filter(s => !s.categoryId)

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <ImageIcon className="w-6 h-6 text-blue-500" /> Ana Sayfa Slayder Yönetimi
            </h3>
            <p className="text-sm text-gray-500">Ana sayfanın en üstünde dönecek olan görsel slayderları buradan yönetebilirsiniz.</p>
          </div>
          <Button
            type="button"
            onClick={openAddSlider}
            className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Yeni Slayder Ekle
          </Button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-900">
              <TableRow className="border-gray-800 hover:bg-gray-900">
                <TableHead className="font-semibold text-gray-300 py-4 pl-6">Sıra / Resimler</TableHead>
                <TableHead className="font-semibold text-gray-300">Durum</TableHead>
                <TableHead className="font-semibold text-gray-300 text-right pr-6">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {homeSliders.length > 0 ? (
                homeSliders.map((slider, index) => (
                  <TableRow key={slider.id} className="hover:bg-gray-50/50 transition-colors group">
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center justify-center min-w-[24px] h-6 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold">
                          {index + 1}
                        </span>
                        <div className="flex -space-x-4 overflow-hidden py-1">
                          {slider.images?.filter((img: string) => img).slice(0, 4).map((img: string, i: number) => (
                            <div key={i} className="relative h-12 w-20 rounded-lg border-2 border-white shadow-sm overflow-hidden transform group-hover:translate-x-1 transition-transform" style={{ transitionDelay: `${i * 50}ms` }}>
                              <img
                                src={img}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ))}
                          {(slider.images?.filter((img: string) => img).length || 0) > 4 && (
                            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 border-2 border-white text-[10px] font-bold text-gray-500 z-10 shadow-sm">
                              +{(slider.images?.filter((img: string) => img).length || 0) - 4}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-700">
                            {slider.images?.filter((img: string) => img).length || 0} Görsel
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {slider.isGradient ? 'Gradyan Hero kullanılıyor' : 'Görsel Arka Plan'}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${slider.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`}></div>
                        <span className={`text-xs font-bold ${slider.isActive ? 'text-green-700' : 'text-red-700'}`}>
                          {slider.isActive ? 'YAYINDA' : 'PASİF'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openEditSlider(slider)}
                          className="h-9 w-9 p-0 hover:bg-blue-50 hover:text-blue-600 border-gray-200 shadow-sm"
                          title="Düzenle"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSlider(slider.id)}
                          className="h-9 w-9 p-0 hover:bg-red-50 hover:text-red-600 border-gray-200 shadow-sm"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-16 text-gray-400">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    Henüz bir slayder eklenmemiş.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3">
          <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed">
            <strong>Bilgi:</strong> Ana sayfa slayderları, herhangi bir kategoriye bağlanmamış genel slayderlardır.
            Birden fazla aktif slayder olması durumunda sistem bunları rastgele veya sıralı olarak gösterebilir.
          </p>
        </div>
      </div>
    )
  }

  const renderWallSliderTabContent = () => {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 flex items-center gap-2 mb-1">
            <ImageIcon className="w-5 h-5" /> Duvar Slayder Yönetimi
          </h4>
          <p className="text-sm text-blue-700">Bu duvarın en üstünde yer alacak olan görsel slayder'ı buradan yönetebilirsiniz.</p>
        </div>

        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="wallSliderIsActive"
              checked={sliderForm.isActive}
              onCheckedChange={(checked) => setSliderForm({ ...sliderForm, isActive: !!checked })}
            />
            <Label htmlFor="wallSliderIsActive" className="cursor-pointer font-medium">Slayder Aktif (Gösterilsin mi?)</Label>
          </div>

          <div className="space-y-4 border p-4 rounded-lg bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="wallSliderIsGradient"
                  checked={sliderForm.isGradient}
                  onCheckedChange={(checked) => setSliderForm({ ...sliderForm, isGradient: !!checked })}
                />
                <Label htmlFor="wallSliderIsGradient" className="cursor-pointer font-semibold">Hero Gradyan Renk Kullan</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="wallSliderIsTransparent"
                  checked={sliderForm.isTransparent}
                  onCheckedChange={(checked) => setSliderForm({ ...sliderForm, isTransparent: !!checked })}
                />
                <Label htmlFor="wallSliderIsTransparent" className="cursor-pointer font-semibold">Zemini Transparan Yap</Label>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label>Zemin Resmi (opsiyonel)</Label>
              <div className="flex gap-2 items-center">
                <Input
                  value={sliderForm.backgroundImage || ''}
                  onChange={(e) => setSliderForm({ ...sliderForm, backgroundImage: e.target.value })}
                  placeholder="https://... veya dosya yükleyin"
                  className="flex-1"
                />
                <div className="relative">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleSliderBgImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploadingSliderImage}
                  />
                  <Button type="button" variant="outline" disabled={uploadingSliderImage}>
                    {uploadingSliderImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500">Resim varsa, transparan veya seçilen arkaplan / gradyan kullanılmaz.</p>
            </div>

            {!sliderForm.isGradient && !sliderForm.isTransparent ? (
              <div className="space-y-2">
                <Label htmlFor="wallSliderBackgroundColor">Tek Arka Plan Rengi</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="wallSliderBackgroundColor"
                    type="color"
                    value={sliderForm.backgroundColor}
                    onChange={(e) => setSliderForm({ ...sliderForm, backgroundColor: e.target.value })}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={sliderForm.backgroundColor}
                    onChange={(e) => setSliderForm({ ...sliderForm, backgroundColor: e.target.value })}
                    className="flex-1 font-mono text-sm"
                    placeholder="#f8f9fa"
                  />
                </div>
              </div>
            ) : sliderForm.isGradient && !sliderForm.isTransparent ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Başlangıç Rengi</Label>
                  <div className="flex gap-2">
                    <Input type="color" className="w-10 h-10 p-1 cursor-pointer" value={sliderForm.heroGradientFrom} onChange={(e) => setSliderForm({ ...sliderForm, heroGradientFrom: e.target.value })} />
                    <Input className="font-mono text-xs" value={sliderForm.heroGradientFrom} onChange={(e) => setSliderForm({ ...sliderForm, heroGradientFrom: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Orta Renk</Label>
                  <div className="flex gap-2">
                    <Input type="color" className="w-10 h-10 p-1 cursor-pointer" value={sliderForm.heroGradientVia} onChange={(e) => setSliderForm({ ...sliderForm, heroGradientVia: e.target.value })} />
                    <Input className="font-mono text-xs" value={sliderForm.heroGradientVia} onChange={(e) => setSliderForm({ ...sliderForm, heroGradientVia: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Bitiş Rengi</Label>
                  <div className="flex gap-2">
                    <Input type="color" className="w-10 h-10 p-1 cursor-pointer" value={sliderForm.heroGradientTo} onChange={(e) => setSliderForm({ ...sliderForm, heroGradientTo: e.target.value })} />
                    <Input className="font-mono text-xs" value={sliderForm.heroGradientTo} onChange={(e) => setSliderForm({ ...sliderForm, heroGradientTo: e.target.value })} />
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-4 pt-4 border-t">
            <Label className="text-base font-bold">Resimler ve Linkler (Maks. 5)</Label>
            {[0, 1, 2, 3, 4].map((idx) => (
              <div key={idx} className="space-y-2 p-3 border rounded-lg bg-white relative group">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </span>
                  <Label className="text-xs">Görsel {idx + 1}</Label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-gray-500 uppercase">Resim URL</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        value={sliderForm.images[idx] || ''}
                        onChange={(e) => {
                          const newImages = [...sliderForm.images]
                          newImages[idx] = e.target.value
                          setSliderForm({ ...sliderForm, images: newImages })
                        }}
                        placeholder="https://..."
                        className="text-xs h-8"
                      />
                      <div className="relative">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleSliderImageUpload(e, idx)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={uploadingSliderImage}
                        />
                        <Button type="button" variant="outline" size="sm" className="h-8" disabled={uploadingSliderImage}>
                          {uploadingSliderImage ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-gray-500 uppercase">Tıklama Linki (URL)</Label>
                    <Input
                      value={sliderForm.links ? (sliderForm.links[idx] || '') : ''}
                      onChange={(e) => {
                        const newLinks = [...(sliderForm.links || ['', '', '', '', ''])]
                        newLinks[idx] = e.target.value
                        setSliderForm({ ...sliderForm, links: newLinks })
                      }}
                      placeholder="https://..."
                      className="text-xs h-8"
                    />
                  </div>
                </div>
                {sliderForm.images[idx] && (
                  <div className="mt-2 h-20 w-32 border rounded overflow-hidden shadow-sm">
                    <img src={sliderForm.images[idx]} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderWallGorseli = () => {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Sol Kolon: Pano ve Zemin Ayarları */}
          <div className="space-y-6">
            {/* Post-it Pano Görünümü Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                <LayoutGrid className="w-5 h-5 text-blue-500" /> Post-it Pano Görünümü (Mantar Pano) - Duvara Özel
              </h3>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex items-center space-x-2 bg-blue-50/50 p-3 rounded-lg border border-blue-100 flex-1">
                    <Checkbox
                      id="isWallTransparent"
                      checked={wallForm.isWallTransparent}
                      onCheckedChange={(checked) => setWallForm(s => ({ ...s, isWallTransparent: !!checked }))}
                    />
                    <Label htmlFor="isWallTransparent" className="cursor-pointer font-bold text-blue-600">Dış Arka Plan Transparan Olsun</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100 flex-1">
                    <Checkbox
                      id="isInnerTransparent"
                      checked={wallForm.isInnerTransparent}
                      onCheckedChange={(checked) => setWallForm(s => ({ ...s, isInnerTransparent: !!checked }))}
                    />
                    <Label htmlFor="isInnerTransparent" className="cursor-pointer font-bold text-emerald-600">İç Zemin Transparan Olsun</Label>
                  </div>
                </div>
                <div className={wallForm.isWallTransparent ? 'opacity-50 pointer-events-none transition-all' : 'transition-all'}>
                  <div className="flex items-center space-x-2 pt-2 pb-2">
                    <Checkbox
                      id="siteIsGradient"
                      checked={wallForm.isGradient}
                      onCheckedChange={(checked) => setWallForm(s => ({ ...s, isGradient: !!checked }))}
                    />
                    <Label htmlFor="siteIsGradient" className="cursor-pointer font-semibold text-gray-700">Panoda Renk/Gradyan Kullan</Label>
                  </div>

                  {!wallForm.isGradient ? (
                    <div className="space-y-2 pl-6">
                      <Label className="text-sm font-medium">Arka Plan Rengi</Label>
                      <div className="flex gap-2">
                        <Input type="color" className="w-12 p-1 h-10 cursor-pointer border-gray-200" value={wallForm.backgroundColor} onChange={e => setWallForm(s => ({ ...s, backgroundColor: e.target.value }))} />
                        <Input value={wallForm.backgroundColor} onChange={e => setWallForm(s => ({ ...s, backgroundColor: e.target.value }))} className="font-mono text-sm" />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pl-6">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-gray-500">Başlangıç</Label>
                        <div className="flex gap-1.5">
                          <Input type="color" className="w-10 h-9 p-1 cursor-pointer border-gray-200" value={wallForm.gradientFrom || '#facc15'} onChange={(e) => setWallForm({ ...wallForm, gradientFrom: e.target.value })} />
                          <Input className="font-mono text-xs h-9" value={wallForm.gradientFrom || '#facc15'} onChange={(e) => setWallForm({ ...wallForm, gradientFrom: e.target.value })} />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-gray-500">Orta</Label>
                        <div className="flex gap-1.5">
                          <Input type="color" className="w-10 h-9 p-1 cursor-pointer border-gray-200" value={wallForm.gradientVia || '#f472b6'} onChange={(e) => setWallForm({ ...wallForm, gradientVia: e.target.value })} />
                          <Input className="font-mono text-xs h-9" value={wallForm.gradientVia || '#f472b6'} onChange={(e) => setWallForm({ ...wallForm, gradientVia: e.target.value })} />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-gray-500">Bitiş</Label>
                        <div className="flex gap-1.5">
                          <Input type="color" className="w-10 h-9 p-1 cursor-pointer border-gray-200" value={wallForm.gradientTo || '#a855f7'} onChange={(e) => setWallForm({ ...wallForm, gradientTo: e.target.value })} />
                          <Input className="font-mono text-xs h-9" value={wallForm.gradientTo || '#a855f7'} onChange={(e) => setWallForm({ ...wallForm, gradientTo: e.target.value })} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className={`space-y-2 mt-4 pt-4 border-t border-gray-100 ${wallForm.isInnerTransparent ? 'opacity-50 pointer-events-none transition-all' : 'transition-all'}`}>
                    <Label className="text-sm font-medium text-emerald-700">İç Zemin Rengi</Label>
                    <div className="flex gap-2">
                      <Input type="color" className="w-12 p-1 h-10 cursor-pointer border-gray-200" value={wallForm.innerBackgroundColor || '#E8DCC4'} onChange={e => setWallForm(s => ({ ...s, innerBackgroundColor: e.target.value }))} />
                      <Input value={wallForm.innerBackgroundColor || '#E8DCC4'} onChange={e => setWallForm(s => ({ ...s, innerBackgroundColor: e.target.value }))} className="font-mono text-sm" />
                    </div>
                  </div>

                  <div className="space-y-2 mt-4 pt-4 border-t border-gray-100">
                    <Label className="text-sm font-medium">Arka Plan Dokusu Resmi URL</Label>
                    <div className="flex gap-2">
                      <Input value={wallForm.backgroundImage} placeholder="https://www.transparenttextures.com/patterns/cork-board.png" onChange={e => setWallForm(s => ({ ...s, backgroundImage: e.target.value }))} className="flex-1 h-10 text-sm" />
                      <div className="flex-shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = async (e: any) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const formData = new FormData();
                              formData.append('file', file);
                              try {
                                const res = await fetch('/api/upload/local', { method: 'POST', body: formData });
                                const data = await res.json();
                                if (data.fileUrl) {
                                  setWallForm(prev => ({ ...prev, backgroundImage: data.fileUrl }));
                                  toast.success('Resim yüklendi');
                                }
                              } catch (err) {
                                toast.error('Yükleme başarısız');
                              }
                            };
                            input.click();
                          }}
                          className="h-10 px-3 border-gray-200 hover:bg-gray-50"
                        >
                          <Upload className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="noBorder"
                          checked={wallForm.noBorder}
                          onCheckedChange={(checked) => setWallForm(s => ({ ...s, noBorder: !!checked }))}
                        />
                        <label htmlFor="noBorder" className="text-sm font-semibold text-gray-700 cursor-pointer">
                          Dış Çerçeve Yok
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="noInnerBorder"
                          checked={wallForm.noInnerBorder}
                          onCheckedChange={(checked) => setWallForm(s => ({ ...s, noInnerBorder: !!checked }))}
                        />
                        <label htmlFor="noInnerBorder" className="text-sm font-semibold text-gray-700 cursor-pointer">
                          İç Çerçeve Yok
                        </label>
                      </div>
                    </div>

                    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${wallForm.noBorder ? 'opacity-50 pointer-events-none' : ''}`}>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-gray-500">Dış Çerçeve (Sağ) Rengi</Label>
                        <div className="flex gap-2">
                          <Input type="color" className="w-10 h-9 p-1 cursor-pointer border-gray-200" value={wallForm.borderColor} onChange={e => setWallForm(s => ({ ...s, borderColor: e.target.value }))} />
                          <Input value={wallForm.borderColor} onChange={e => setWallForm(s => ({ ...s, borderColor: e.target.value }))} className="h-9 text-[10px] font-mono" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-gray-500">Üst ve Sol Çerçeve Rengi</Label>
                        <div className="flex gap-2">
                          <Input type="color" className="w-10 h-9 p-1 cursor-pointer border-gray-200" value={wallForm.borderTopColor} onChange={e => setWallForm(s => ({ ...s, borderTopColor: e.target.value }))} />
                          <Input value={wallForm.borderTopColor} onChange={e => setWallForm(s => ({ ...s, borderTopColor: e.target.value }))} className="h-9 text-[10px] font-mono" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-gray-500">Alt Çerçeve Rengi</Label>
                        <div className="flex gap-2">
                          <Input type="color" className="w-10 h-9 p-1 cursor-pointer border-gray-200" value={wallForm.borderBottomColor} onChange={e => setWallForm(s => ({ ...s, borderBottomColor: e.target.value }))} />
                          <Input value={wallForm.borderBottomColor} onChange={e => setWallForm(s => ({ ...s, borderBottomColor: e.target.value }))} className="h-9 text-[10px] font-mono" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Site Genel Arka Planı Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                <Home className="w-5 h-5 text-emerald-500" /> Duvar Arka Planı (Zemin) - Duvara Özel
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Zemin Resmi (opsiyonel)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={wallForm.siteBackgroundImage || ''}
                      onChange={(e) => setWallForm({ ...wallForm, siteBackgroundImage: e.target.value })}
                      placeholder="URL veya dosya yükleyin"
                      className="flex-1 h-10 text-sm"
                    />
                    <div className="flex-shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = async (e: any) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const formData = new FormData();
                            formData.append('file', file);
                            try {
                              const res = await fetch('/api/upload/local', { method: 'POST', body: formData });
                              const data = await res.json();
                              if (data.fileUrl) {
                                setWallForm(prev => ({ ...prev, siteBackgroundImage: data.fileUrl }));
                                toast.success('Resim yüklendi');
                              }
                            } catch (err) {
                              toast.error('Yükleme başarısız');
                            }
                          };
                          input.click();
                        }}
                        className="h-10 px-3 border-gray-200 hover:bg-gray-50"
                      >
                        <Upload className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Resim Yayılma Şekli (Sadece resim yüklüyse etkilidir)</Label>
                  <Select value={wallForm.siteBackgroundStyle || 'repeat'} onValueChange={(v) => setWallForm({ ...wallForm, siteBackgroundStyle: v })}>
                    <SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cover">Ekrana Yay (Ölçekle Keserek Doldur - Önerilen)</SelectItem>
                      <SelectItem value="stretch">Genişlet Sündür (Tam Ekrana Sığdır)</SelectItem>
                      <SelectItem value="repeat">Tekrarla (Deseni Çoğaltarak Kapla)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="siteGroundIsGradient"
                      checked={wallForm.siteIsGradient}
                      onCheckedChange={(checked) => setWallForm(s => ({ ...s, siteIsGradient: !!checked }))}
                    />
                    <Label htmlFor="siteGroundIsGradient" className="cursor-pointer font-bold text-emerald-700">Zeminde Renk/Gradyan Kullan</Label>
                  </div>

                  <div className="mt-4 transition-all">
                    {!wallForm.siteIsGradient ? (
                      <div className="space-y-2 pl-6">
                        <Label className="text-xs font-semibold text-emerald-600">Arka Plan Rengi</Label>
                        <div className="flex gap-2">
                          <Input type="color" className="w-12 h-10 p-1 cursor-pointer border-emerald-200" value={wallForm.siteBackgroundColor || '#fffbeb'} onChange={e => setWallForm(s => ({ ...s, siteBackgroundColor: e.target.value }))} />
                          <Input value={wallForm.siteBackgroundColor || '#fffbeb'} onChange={e => setWallForm(s => ({ ...s, siteBackgroundColor: e.target.value }))} className="flex-1 h-10 font-mono text-sm" />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pl-6">
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold text-emerald-600">Başlangıç</Label>
                          <div className="flex gap-1.5">
                            <Input type="color" className="w-9 h-8 p-1 cursor-pointer border-emerald-200" value={wallForm.siteGradientFrom || '#fffbeb'} onChange={(e) => setWallForm({ ...wallForm, siteGradientFrom: e.target.value })} />
                            <Input className="font-mono text-[9px] h-8" value={wallForm.siteGradientFrom || '#fffbeb'} onChange={(e) => setWallForm({ ...wallForm, siteGradientFrom: e.target.value })} />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold text-emerald-600">Orta</Label>
                          <div className="flex gap-1.5">
                            <Input type="color" className="w-9 h-8 p-1 cursor-pointer border-emerald-200" value={wallForm.siteGradientVia || '#fefce8'} onChange={(e) => setWallForm({ ...wallForm, siteGradientVia: e.target.value })} />
                            <Input className="font-mono text-[9px] h-8" value={wallForm.siteGradientVia || '#fefce8'} onChange={(e) => setWallForm({ ...wallForm, siteGradientVia: e.target.value })} />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold text-emerald-600">Bitiş</Label>
                          <div className="flex gap-1.5">
                            <Input type="color" className="w-9 h-8 p-1 cursor-pointer border-emerald-200" value={wallForm.siteGradientTo || '#fff7ed'} onChange={(e) => setWallForm({ ...wallForm, siteGradientTo: e.target.value })} />
                            <Input className="font-mono text-[9px] h-8" value={wallForm.siteGradientTo || '#fff7ed'} onChange={(e) => setWallForm({ ...wallForm, siteGradientTo: e.target.value })} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 pt-2 p-4 bg-gray-50 rounded-lg border border-gray-100 mt-4">
                  <Checkbox 
                    id="show-virtual-site-ground"
                    checked={wallForm.showVirtualPostitsIfEmpty !== false}
                    onCheckedChange={(checked) => setWallForm({ ...wallForm, showVirtualPostitsIfEmpty: !!checked })}
                  />
                  <div className="flex flex-col">
                    <Label htmlFor="show-virtual-site-ground" className="text-sm font-semibold text-gray-800 cursor-pointer">
                      Duvar Boşsa Sanal Postit Ekle
                    </Label>
                    <span className="text-xs text-gray-500 mt-1">Duvarda postit yoksa alt duvarları sanal birer karta dönüştürür.</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 pt-2 p-4 bg-gray-50 rounded-lg border border-gray-100 mt-4">
                  <Checkbox 
                    id="show-virtual-postit-logos"
                    checked={wallForm.showVirtualPostitLogos === true}
                    onCheckedChange={(checked) => setWallForm({ ...wallForm, showVirtualPostitLogos: !!checked })}
                  />
                  <div className="flex flex-col">
                    <Label htmlFor="show-virtual-postit-logos" className="text-sm font-semibold text-gray-800 cursor-pointer">
                      Sanal Kartlarda Alt Duvar Logolarını Göster
                    </Label>
                    <span className="text-xs text-gray-500 mt-1">Bu seçenek aktifse ve ilgili alt duvarın bir logosu ayarlanmışsa, oluşturulan sanal postitte temsil ettiği duvarın logosu gösterilir.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sağ Kolon: Hero ve Menü Ayarları */}
          <div className="space-y-6">
            {/* Hero Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                <Palette className="w-5 h-5 text-amber-500" /> Duvar Kapak (Hero) Görünümü - Duvara Özel
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-500">Zemin Resmi (opsiyonel)</Label>
                    <div className="flex gap-2">
                      <Input value={wallForm.heroBackgroundImage || ''} onChange={(e) => setWallForm({ ...wallForm, heroBackgroundImage: e.target.value })} placeholder="URL veya dosya yükleyin" className="flex-1 h-9 text-xs" />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = async (e: any) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const formData = new FormData();
                            formData.append('file', file);
                            try {
                              const res = await fetch('/api/upload/local', { method: 'POST', body: formData });
                              const data = await res.json();
                              if (data.fileUrl) {
                                setWallForm(prev => ({ ...prev, heroBackgroundImage: data.fileUrl }));
                                toast.success('Resim yüklendi');
                              }
                            } catch (err) {
                              toast.error('Yükleme başarısız');
                            }
                          };
                          input.click();
                        }}
                        className="h-9 px-2 border-gray-200 hover:bg-gray-50"
                      >
                        <Upload className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px] font-medium text-gray-500">Alt Başlık Metni</Label>
                    <Input value="Açıklamadan Gelir" disabled className="h-9 text-xs bg-gray-100 italic text-gray-500 cursor-not-allowed" />
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-500">Resim Sığdırma</Label>
                    <Select value={wallForm.heroBackgroundStyle || 'cover'} onValueChange={(v) => setWallForm({ ...wallForm, heroBackgroundStyle: v })}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cover-top">Kırp ve Üste Hizala (Tavsiye Edilen)</SelectItem>
                        <SelectItem value="cover-center">Kırp ve Ortala</SelectItem>
                        <SelectItem value="cover-bottom">Kırp ve Alta Hizala</SelectItem>
                        <SelectItem value="contain">Tamamını Sığdır (Contain)</SelectItem>
                        <SelectItem value="stretch">Genişlet (100% 100%)</SelectItem>
                        <SelectItem value="repeat">Tekrarla (Repeat)</SelectItem>
                        <SelectItem value="center">Merkezle (Center)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mt-2 border-b border-gray-100 pb-3">
                  <Checkbox
                    id="heroTransparent"
                    checked={wallForm.isHeroTransparent}
                    onCheckedChange={(checked) => setWallForm(s => ({ ...s, isHeroTransparent: !!checked }))}
                  />
                  <Label htmlFor="heroTransparent" className="cursor-pointer font-bold text-amber-700">Kapak Arka Planı (Zemin) Şeffaf Olsun</Label>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {['From', 'Via', 'To'].map((pos) => (
                    <div key={pos} className="space-y-1">
                      <Label className="text-[10px] font-bold text-gray-400">Gradyan {pos === 'From' ? 'Başlangıç' : pos === 'Via' ? 'Orta' : 'Bitiş'}</Label>
                      <div className="flex gap-1.5">
                        <input type="color" value={(wallForm as any)[`heroGradient${pos}`] || (pos === 'From' ? '#facc15' : pos === 'Via' ? '#f472b6' : '#a855f7')} onChange={(e) => setWallForm({ ...wallForm, [`heroGradient${pos}`]: e.target.value })} className="w-9 h-9 rounded cursor-pointer border border-gray-200" />
                        <Input value={(wallForm as any)[`heroGradient${pos}`] || (pos === 'From' ? '#facc15' : pos === 'Via' ? '#f472b6' : '#a855f7')} onChange={(e) => setWallForm({ ...wallForm, [`heroGradient${pos}`]: e.target.value })} className="h-9 text-[10px] font-mono flex-1" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-5 mt-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 bg-slate-50 p-2.5 rounded-lg border border-slate-200 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Type className="w-4 h-4 text-indigo-500" /> Başlık Ayarları
                    </h4>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border border-slate-200">
                        <Checkbox
                          id="hideWallHeroPushpin"
                          checked={!!wallForm.hideHeroPushpin}
                          onCheckedChange={(checked) => setWallForm({ ...wallForm, hideHeroPushpin: !!checked })}
                        />
                        <Label htmlFor="hideWallHeroPushpin" className="text-xs font-semibold cursor-pointer text-slate-700">Raptiyeyi Gizle</Label>
                      </div>
                      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border border-slate-200">
                        <Checkbox
                          id="hideWallHeroText"
                          checked={!!wallForm.hideHeroText}
                          onCheckedChange={(checked) => setWallForm({ ...wallForm, hideHeroText: !!checked })}
                        />
                        <Label htmlFor="hideWallHeroText" className="text-xs font-semibold cursor-pointer text-slate-700">Başlık ve Alt Metni Gizle</Label>
                      </div>
                    </div>
                  </div>
                  <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 transition-opacity duration-200 ${wallForm.hideHeroText ? 'opacity-40 pointer-events-none' : ''}`}>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-medium text-gray-500">Hizalama</Label>
                      <Select value={wallForm.heroAlignment || 'left'} onValueChange={(v) => setWallForm({ ...wallForm, heroAlignment: v })}>
                        <SelectTrigger className="h-8 text-[10px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Sol</SelectItem>
                          <SelectItem value="center">Orta</SelectItem>
                          <SelectItem value="right">Sağ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-medium text-gray-500">Font</Label>
                      <Select value={wallForm.heroTitleFont || 'sans-serif'} onValueChange={(v) => setWallForm({ ...wallForm, heroTitleFont: v })}>
                        <SelectTrigger className="h-8 text-[10px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sans-serif">Sans Serif</SelectItem>
                          <SelectItem value="serif">Serif</SelectItem>
                          <SelectItem value="Patrick Hand, cursive">El Yazısı</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-medium text-gray-500">Renk</Label>
                      <input type="color" value={wallForm.heroTitleColor || '#ffffff'} onChange={(e) => setWallForm({ ...wallForm, heroTitleColor: e.target.value })} className="w-full h-8 rounded cursor-pointer border border-gray-200" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-medium text-gray-500">Boyut</Label>
                      <Select value={wallForm.heroTitleSize || '5xl'} onValueChange={(v) => setWallForm({ ...wallForm, heroTitleSize: v })}>
                        <SelectTrigger className="h-8 text-[10px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="4xl">Küçük</SelectItem>
                          <SelectItem value="5xl">Orta</SelectItem>
                          <SelectItem value="6xl">Büyük</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Başlık Zemin Ayarları */}
                <div className={`border-t border-gray-200 pt-4 mt-4 transition-opacity duration-200 ${wallForm.hideHeroText ? 'opacity-40 pointer-events-none' : ''}`}>
                  <h4 className="text-xs font-bold text-slate-700 mb-3">Başlık Zemin Ayarları</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-medium text-gray-500">Zemin Tipi</Label>
                      <Select value={wallForm.heroTitleBgMode || 'none'} onValueChange={(v) => setWallForm({ ...wallForm, heroTitleBgMode: v })}>
                        <SelectTrigger className="h-8 text-[10px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Varsayılan (Şeffaf)</SelectItem>
                          <SelectItem value="color">Düz Renk</SelectItem>
                          <SelectItem value="transparent">Şeffaf Renk (Transparan)</SelectItem>
                          <SelectItem value="image">Görsel (Resim)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {(wallForm.heroTitleBgMode === 'color' || wallForm.heroTitleBgMode === 'transparent') && (
                      <div className="space-y-1">
                        <Label className="text-[10px] font-medium text-gray-500">Zemin Rengi</Label>
                        <input type="color" value={wallForm.heroTitleBgColor || '#000000'} onChange={(e) => setWallForm({ ...wallForm, heroTitleBgColor: e.target.value })} className="w-full h-8 rounded cursor-pointer border border-gray-200" />
                      </div>
                    )}
                    {wallForm.heroTitleBgMode === 'transparent' && (
                      <div className="space-y-1">
                        <Label className="text-[10px] font-medium text-gray-500">Şeffaflık Seviyesi: {wallForm.heroTitleBgOpacity ?? 40}%</Label>
                        <div className="h-8 flex items-center px-1">
                          <input type="range" min="0" max="100" value={wallForm.heroTitleBgOpacity ?? 40} onChange={(e) => setWallForm({ ...wallForm, heroTitleBgOpacity: parseInt(e.target.value) })} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 outline-none" />
                        </div>
                      </div>
                    )}
                    {wallForm.heroTitleBgMode === 'image' && (
                      <div className="space-y-1 sm:col-span-2">
                        <Label className="text-[10px] font-medium text-gray-500">Resim URL</Label>
                        <Input value={wallForm.heroTitleBgImage || ''} onChange={(e) => setWallForm({ ...wallForm, heroTitleBgImage: e.target.value })} placeholder="https://..." className="h-8 text-[10px]" />
                      </div>
                    )}
                  </div>
                </div>

                <div className={`border-t border-gray-200 pt-4 mt-2 transition-opacity duration-200 ${wallForm.hideHeroText ? 'opacity-40 pointer-events-none' : ''}`}>
                  <h4 className="text-xs font-bold text-slate-700 mb-3">Alt Başlık Ayarları</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-medium text-gray-500">Font</Label>
                      <Select value={wallForm.heroSubtitleFont || 'sans-serif'} onValueChange={(v) => setWallForm({ ...wallForm, heroSubtitleFont: v })}>
                        <SelectTrigger className="h-8 text-[10px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sans-serif">Sans Serif</SelectItem>
                          <SelectItem value="serif">Serif</SelectItem>
                          <SelectItem value="Patrick Hand, cursive">El Yazısı</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-medium text-gray-500">Renk</Label>
                      <input type="color" value={wallForm.heroSubtitleColor || '#ffffff'} onChange={(e) => setWallForm({ ...wallForm, heroSubtitleColor: e.target.value })} className="w-full h-8 rounded cursor-pointer border border-gray-200" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-medium text-gray-500">Boyut</Label>
                      <Select value={wallForm.heroSubtitleSize || 'xl'} onValueChange={(v) => setWallForm({ ...wallForm, heroSubtitleSize: v })}>
                        <SelectTrigger className="h-8 text-[10px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lg">Küçük</SelectItem>
                          <SelectItem value="xl">Orta</SelectItem>
                          <SelectItem value="2xl">Büyük</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navbar Menu Settings Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                <Menu className="w-5 h-5 text-indigo-500" /> Kategori Menü Görünümü - Duvara Özel
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Menü Zemini</Label>
                    <div className="flex gap-2">
                      <input type="color" value={wallForm.navMenuBgColor || '#ffffff'} onChange={(e) => setWallForm({ ...wallForm, navMenuBgColor: e.target.value })} className="w-10 h-10 rounded cursor-pointer border border-gray-200" />
                      <Input value={wallForm.navMenuBgColor || '#ffffff'} onChange={(e) => setWallForm({ ...wallForm, navMenuBgColor: e.target.value })} className="flex-1 font-mono text-sm" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Yazı Rengi</Label>
                    <div className="flex gap-2">
                      <input type="color" value={wallForm.navMenuTextColor || '#111827'} onChange={(e) => setWallForm({ ...wallForm, navMenuTextColor: e.target.value })} className="w-10 h-10 rounded cursor-pointer border border-gray-200" />
                      <Input value={wallForm.navMenuTextColor || '#111827'} onChange={(e) => setWallForm({ ...wallForm, navMenuTextColor: e.target.value })} className="flex-1 font-mono text-sm" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Font</Label>
                    <Select value={wallForm.navMenuFont || 'sans-serif'} onValueChange={(v) => setWallForm({ ...wallForm, navMenuFont: v })}>
                      <SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sans-serif">Sans Serif</SelectItem>
                        <SelectItem value="serif">Serif</SelectItem>
                        <SelectItem value="Patrick Hand, cursive">El Yazısı</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Yazı Boyutu (px)</Label>
                    <Select value={String(wallForm.navMenuFontSize || 14)} onValueChange={(v) => setWallForm({ ...wallForm, navMenuFontSize: parseInt(v) })}>
                      <SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[12, 14, 15, 16, 18, 20].map(s => (
                          <SelectItem key={s} value={String(s)}>{s}px</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                  <Checkbox
                    id="navMenuMainBold"
                    checked={wallForm.navMenuMainBold}
                    onCheckedChange={(checked) => setWallForm(s => ({ ...s, navMenuMainBold: !!checked }))}
                  />
                  <Label htmlFor="navMenuMainBold" className="cursor-pointer font-bold text-indigo-700">Ana Kategoriler Kalın Olsun</Label>
                </div>
              </div>
            </div>

            {/* Sayfa Adı ve Kurdele Görünümü Section (Duvara Özel) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                <Paintbrush className="w-5 h-5 text-pink-500" /> Sayfa Adı ve Kurdele Görünümü - Duvara Özel
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showWallTitle"
                      checked={!wallForm.hideWallTitle}
                      onCheckedChange={(checked) => setWallForm(s => ({ ...s, hideWallTitle: !checked }))}
                    />
                    <Label htmlFor="showWallTitle" className="cursor-pointer font-bold text-gray-700">Sayfa Adını Göster</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showWallRibbon"
                      checked={!wallForm.hideWallRibbon}
                      onCheckedChange={(checked) => setWallForm(s => ({ ...s, hideWallRibbon: !checked }))}
                    />
                    <Label htmlFor="showWallRibbon" className="cursor-pointer font-bold text-gray-700">Kurdeleyi Göster</Label>
                  </div>
                </div>

                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 ${wallForm.hideWallRibbon ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Kurdele Rengi</Label>
                    <div className="flex gap-2">
                      <input type="color" value={wallForm.ribbonColor || '#502bb1'} onChange={(e) => setWallForm({ ...wallForm, ribbonColor: e.target.value })} className="w-10 h-10 rounded cursor-pointer border border-gray-200" />
                      <Input value={wallForm.ribbonColor || '#502bb1'} onChange={(e) => setWallForm({ ...wallForm, ribbonColor: e.target.value })} className="flex-1 font-mono text-sm" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Kurdele Resmi (opsiyonel)</Label>
                    <div className="flex gap-2">
                      <Input value={wallForm.ribbonImage || ''} onChange={(e) => setWallForm({ ...wallForm, ribbonImage: e.target.value })} placeholder="URL veya dosya yükleyin" className="flex-1 text-sm" />
                      <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('wall-ribbon-upload')?.click()} className="h-10 px-3">
                        {uploadingWallRibbonImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      </Button>
                      <input id="wall-ribbon-upload" type="file" accept="image/*" onChange={handleWallRibbonImageUpload} className="hidden" />
                    </div>
                  </div>

                  <div className="space-y-2">
                     <Label className="text-sm font-medium">Başlık/Kurdele Konumu</Label>
                     <Select
                        value={wallForm.ribbonAlignment || 'center'}
                        onValueChange={(val) => setWallForm({ ...wallForm, ribbonAlignment: val })}
                     >
                        <SelectTrigger className="w-full">
                           <SelectValue placeholder="Konum Seçin" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="left">Sola Yasla</SelectItem>
                           <SelectItem value="center">Ortala (Varsayılan)</SelectItem>
                           <SelectItem value="right">Sağa Yasla</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
                  
                  <div className="space-y-2">
                     <Label className="text-sm font-medium">Sayfa Adı Metni (Boşsa otomatik)</Label>
                     <Input value={wallForm.customRibbonText || ''} onChange={(e) => setWallForm({ ...wallForm, customRibbonText: e.target.value })} placeholder="örn: Hoş Geldiniz" className="flex-1 text-sm font-mono" />
                  </div>
                  
                  <div className="space-y-2">
                     <Label className="text-sm font-medium">Sayfa Adı Rengi</Label>
                     <div className="flex gap-2">
                       <input type="color" value={wallForm.ribbonTextColor || '#ffffff'} onChange={(e) => setWallForm({ ...wallForm, ribbonTextColor: e.target.value })} className="w-10 h-10 rounded cursor-pointer border border-gray-200" />
                       <Input value={wallForm.ribbonTextColor || '#ffffff'} onChange={(e) => setWallForm({ ...wallForm, ribbonTextColor: e.target.value })} className="flex-1 font-mono text-sm" />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <Label className="text-sm font-medium">Sayfa Adı Yazı Tipi</Label>
                     <Select
                        value={wallForm.ribbonTextFont || 'sans-serif'}
                        onValueChange={(val) => setWallForm({ ...wallForm, ribbonTextFont: val })}
                     >
                        <SelectTrigger className="w-full">
                           <SelectValue placeholder="Font Seçin" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="sans-serif">Modern (Nunito - Varsayılan)</SelectItem>
                           <SelectItem value="sans-serif-generic">Düz Sans Serif</SelectItem>
                           <SelectItem value="arial">Arial</SelectItem>
                           <SelectItem value="calibri">Calibri</SelectItem>
                           <SelectItem value="serif">Klasik (Serif)</SelectItem>
                           <SelectItem value="cursive">El Yazısı (Cursive)</SelectItem>
                           <SelectItem value="monospace">Teknik (Monospace)</SelectItem>
                           <SelectItem value="system-ui">Sistem (System-ui)</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Hava Durumu Özel Ayarlar */}
            {wallForm.name === 'Hava Durumu' && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                  <Cloud className="w-5 h-5 text-sky-500" /> Hava Durumu Ayarları - Özel
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2 border-b border-gray-100 pb-4">
                    <Label className="text-sm font-medium">Kullanılacak İkon Stili</Label>
                    <Select
                      value={wallForm.postitAppearance?.weatherIconSet || 'default'}
                      onValueChange={(val) => setWallForm({ ...wallForm, postitAppearance: { ...(wallForm.postitAppearance || {}), weatherIconSet: val } })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="İkon Seti Seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Varsayılan (Modern Lucide Beyaz Çizgiler)</SelectItem>
                        <SelectItem value="emoji">Klasik Emoji (🌞, ☁️, 🌧️, ⛈️, ❄️)</SelectItem>
                        <SelectItem value="animated">Neon Işıklı (Renkli Gölgeli Klasik)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-4">
                     <Label className="text-sm font-medium">Özel Arka Plan Resimleri (Hücre İçi)</Label>
                     <p className="text-xs text-gray-500 mb-2">Hava durumuna göre değişecek özel resimler ayarlayın. Boş bırakırsanız mevcut renkler kullanılır.</p>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       {[
                         { field: 'weatherBgSunny', label: '☀️ Güneşli' },
                         { field: 'weatherBgCloudy', label: '☁️ Bulutlu' },
                         { field: 'weatherBgRainy', label: '🌧️ Yağmurlu' },
                         { field: 'weatherBgSnowy', label: '❄️ Karlı' },
                         { field: 'weatherBgFoggy', label: '🌫️ Sisli' },
                         { field: 'weatherBgStormy', label: '⛈️ Fırtınalı' }
                       ].map((item) => (
                          <div key={item.field} className="space-y-1 bg-gray-50 p-2 rounded-md border border-gray-100">
                            <Label className="text-xs font-semibold text-gray-700">{item.label}</Label>
                            <div className="flex gap-2">
                              <Input
                                value={wallForm.postitAppearance?.[item.field] || ''}
                                onChange={(e) => setWallForm({ ...wallForm, postitAppearance: { ...(wallForm.postitAppearance || {}), [item.field]: e.target.value } })}
                                placeholder="URL (örn: png, jpg)"
                                className="flex-1 h-8 text-xs bg-white"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  const input = document.createElement('input');
                                  input.type = 'file';
                                  input.accept = 'image/*';
                                  input.onchange = async (e: any) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const formData = new FormData();
                                    formData.append('file', file);
                                    try {
                                      const res = await fetch('/api/upload/local', { method: 'POST', body: formData });
                                      const data = await res.json();
                                      if (data.fileUrl) {
                                        setWallForm(prev => ({
                                          ...prev,
                                          postitAppearance: { ...(prev.postitAppearance || {}), [item.field]: data.fileUrl }
                                        }));
                                        toast.success('Resim yüklendi');
                                      }
                                    } catch (err) {
                                      toast.error('Yükleme başarısız');
                                    }
                                  };
                                  input.click();
                                }}
                                className="h-8 px-2 border-gray-200 hover:bg-gray-100 bg-white"
                              >
                                <Upload className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                       ))}
                     </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Canlı Önizleme Alanı */}
        <div className="pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-500" /> Canlı Önizleme
            </Label>
            <span className="text-[10px] text-gray-400 italic">Sol taraf: Site Zemini | Orta: Duvar Panosu</span>
          </div>

          {/* Site Zemini Önizlemesi */}
          <div
            className="w-full rounded-3xl p-6 md:p-12 shadow-inner border border-gray-100 relative overflow-hidden transition-all duration-700"
            style={{
              backgroundColor: wallForm.siteBackgroundColor || '#f8fafc',
              backgroundImage: wallForm.siteIsGradient
                ? `linear-gradient(135deg, ${wallForm.siteGradientFrom || '#fffbeb'}, ${wallForm.siteGradientVia || '#fefce8'}, ${wallForm.siteGradientTo || '#fff7ed'})`
                : wallForm.siteBackgroundImage ? `url("${wallForm.siteBackgroundImage}")` : 'none',
              backgroundSize: wallForm.siteBackgroundStyle === 'stretch' ? '100% 100%' : (wallForm.siteBackgroundStyle === 'cover' ? 'cover' : 'auto'),
              backgroundRepeat: wallForm.siteBackgroundStyle === 'repeat' || !wallForm.siteBackgroundStyle ? 'repeat' : 'no-repeat',
              backgroundPosition: 'center'
            }}
          >
            {/* Duvar Panosu (Wall Board) Önizlemesi */}
            <div className="w-full max-w-4xl mx-auto rounded-2xl relative p-4 md:p-10 flex shadow-2xl overflow-hidden border-4 border-white/30"
              style={{
                backgroundColor: wallForm.isWallTransparent ? 'transparent' : wallForm.backgroundColor,
                backgroundImage: !wallForm.isWallTransparent ? (wallForm.isGradient ? `linear-gradient(to bottom right, ${wallForm.gradientFrom || '#facc15'}, ${wallForm.gradientVia || '#f472b6'}, ${wallForm.gradientTo || '#a855f7'})` : `url("${wallForm.backgroundImage}")`) : 'none',
                border: wallForm.noBorder ? '0px' : `20px solid transparent`,
                borderImage: wallForm.noBorder ? 'none' : `linear-gradient(to right, ${wallForm.borderTopColor}, ${wallForm.borderColor}, ${wallForm.borderBottomColor}) 1`,
                minHeight: '450px',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {/* Dokulu kaplama */}
              {!wallForm.isWallTransparent && wallForm.backgroundImage && (
                <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply" style={{ backgroundImage: `url("${wallForm.backgroundImage}")`, backgroundSize: '200px' }}></div>
              )}

              <div className="m-auto relative z-10 w-full">
                {/* Hero Önizlemesi */}
                <div
                  className="mb-8 p-6 rounded-2xl overflow-hidden relative shadow-lg group transition-all duration-500 border border-white/20"
                  style={{
                    backgroundImage: wallForm.heroBackgroundImage
                      ? `url("${wallForm.heroBackgroundImage}")`
                      : `linear-gradient(135deg, ${wallForm.heroGradientFrom || '#facc15'}, ${wallForm.heroGradientVia || '#f472b6'}, ${wallForm.heroGradientTo || '#a855f7'})`,
                    backgroundSize: (wallForm.heroBackgroundStyle || 'cover').startsWith('cover') ? 'cover' : wallForm.heroBackgroundStyle === 'stretch' ? '100% 100%' : (wallForm.heroBackgroundStyle === 'contain' ? 'contain' : 'auto'),
                    backgroundRepeat: wallForm.heroBackgroundStyle === 'repeat' ? 'repeat' : 'no-repeat',
                    backgroundPosition: wallForm.heroBackgroundStyle === 'cover-top' ? 'top center' : wallForm.heroBackgroundStyle === 'cover-bottom' ? 'bottom center' : wallForm.heroBackgroundStyle === 'center' ? 'center' : (wallForm.heroBackgroundStyle === 'repeat' ? 'auto' : 'center'),
                    textAlign: (wallForm.heroAlignment as any) || 'left'
                  }}
                >
                  <h4
                    className="font-bold mb-2 transition-all duration-300 drop-shadow-md"
                    style={{
                      fontFamily: wallForm.heroTitleFont || 'sans-serif',
                      color: wallForm.heroTitleColor || '#ffffff',
                      fontSize: wallForm.heroTitleSize === '4xl' ? '1.5rem' : wallForm.heroTitleSize === '5xl' ? '2rem' : '2.5rem'
                    }}
                  >
                    {wallForm.name || 'Pano Adı'}
                  </h4>
                  <p
                    className="opacity-90 font-medium transition-all duration-300 drop-shadow-sm"
                    style={{
                      fontFamily: wallForm.heroSubtitleFont || 'sans-serif',
                      color: wallForm.heroSubtitleColor || '#ffffff',
                      fontSize: wallForm.heroSubtitleSize === 'lg' ? '0.9rem' : wallForm.heroSubtitleSize === 'xl' ? '1.1rem' : '1.3rem'
                    }}
                  >
                    {wallForm.heroSubtitle || 'Harika fikirlerin buluşma noktası'}
                  </p>
                </div>

                <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50 text-center scale-95 hover:scale-100 transition-transform duration-500">
                  {/* Kategori Menü Mockup */}
                  <div
                    className="flex gap-4 justify-center mb-6 py-3 px-4 rounded-full shadow-sm mx-auto w-fit"
                    style={{
                      backgroundColor: wallForm.navMenuBgColor || '#ffffff',
                      fontFamily: wallForm.navMenuFont || 'sans-serif',
                      fontSize: `${wallForm.navMenuFontSize || 14}px`,
                      color: wallForm.navMenuTextColor || '#111827'
                    }}
                  >
                    <span style={{ fontWeight: wallForm.navMenuMainBold ? 'bold' : 'normal' }}>Gündem</span>
                    <span style={{ fontWeight: wallForm.navMenuMainBold ? 'bold' : 'normal' }}>Haberler</span>
                    <span style={{ fontWeight: wallForm.navMenuMainBold ? 'bold' : 'normal' }}>Spor</span>
                  </div>

                  <p className="text-xl font-bold text-gray-800 mb-2">Pano İçerik Alanı</p>
                  <div className="flex gap-4 justify-center mt-6">
                    <div className="w-16 h-16 bg-yellow-200 shadow-md -rotate-3 rounded-sm border-t-4 border-yellow-300"></div>
                    <div className="w-16 h-16 bg-blue-200 shadow-md rotate-6 rounded-sm border-t-4 border-blue-300"></div>
                    <div className="w-16 h-16 bg-pink-200 shadow-md -rotate-6 rounded-sm border-t-4 border-pink-300"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSiteGorseli = () => {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Sol Kolon: Pano ve Zemin Ayarları */}
          <div className="space-y-6">
            {/* Post-it Pano Görünümü Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                <LayoutGrid className="w-5 h-5 text-blue-500" /> Post-it Pano Görünümü (Mantar Pano)
              </h3>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex items-center space-x-2 bg-blue-50/50 p-3 rounded-lg border border-blue-100 flex-1">
                    <Checkbox
                      id="isWallTransparentSites"
                      checked={wallForm.isWallTransparent}
                      onCheckedChange={(checked) => setWallForm(s => ({ ...s, isWallTransparent: !!checked }))}
                    />
                    <Label htmlFor="isWallTransparentSites" className="cursor-pointer font-bold text-blue-600">Dış Arka Plan Transparan Olsun</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100 flex-1">
                    <Checkbox
                      id="isInnerTransparentSites"
                      checked={wallForm.isInnerTransparent}
                      onCheckedChange={(checked) => setWallForm(s => ({ ...s, isInnerTransparent: !!checked }))}
                    />
                    <Label htmlFor="isInnerTransparentSites" className="cursor-pointer font-bold text-emerald-600">İç Zemin Transparan Olsun</Label>
                  </div>
                </div>

                <div className={wallForm.isWallTransparent ? 'opacity-50 pointer-events-none transition-all' : 'transition-all'}>
                  <div className="flex items-center space-x-2 pt-2 pb-2">
                    <Checkbox
                      id="siteIsGradient"
                      checked={wallForm.isGradient}
                      onCheckedChange={(checked) => setWallForm(s => ({ ...s, isGradient: !!checked }))}
                    />
                    <Label htmlFor="siteIsGradient" className="cursor-pointer font-semibold text-gray-700">Panoda Renk/Gradyan Kullan</Label>
                  </div>

                  {!wallForm.isGradient ? (
                    <div className="space-y-2 pl-6">
                      <Label className="text-sm font-medium">Arka Plan Rengi</Label>
                      <div className="flex gap-2">
                        <Input type="color" className="w-12 p-1 h-10 cursor-pointer border-gray-200" value={wallForm.backgroundColor} onChange={e => setWallForm(s => ({ ...s, backgroundColor: e.target.value }))} />
                        <Input value={wallForm.backgroundColor} onChange={e => setWallForm(s => ({ ...s, backgroundColor: e.target.value }))} className="font-mono text-sm" />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pl-6">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-gray-500">Başlangıç</Label>
                        <div className="flex gap-1.5">
                          <Input type="color" className="w-10 h-9 p-1 cursor-pointer border-gray-200" value={wallForm.gradientFrom || '#facc15'} onChange={(e) => setWallForm({ ...wallForm, gradientFrom: e.target.value })} />
                          <Input className="font-mono text-xs h-9" value={wallForm.gradientFrom || '#facc15'} onChange={(e) => setWallForm({ ...wallForm, gradientFrom: e.target.value })} />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-gray-500">Orta</Label>
                        <div className="flex gap-1.5">
                          <Input type="color" className="w-10 h-9 p-1 cursor-pointer border-gray-200" value={wallForm.gradientVia || '#f472b6'} onChange={(e) => setWallForm({ ...wallForm, gradientVia: e.target.value })} />
                          <Input className="font-mono text-xs h-9" value={wallForm.gradientVia || '#f472b6'} onChange={(e) => setWallForm({ ...wallForm, gradientVia: e.target.value })} />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-gray-500">Bitiş</Label>
                        <div className="flex gap-1.5">
                          <Input type="color" className="w-10 h-9 p-1 cursor-pointer border-gray-200" value={wallForm.gradientTo || '#a855f7'} onChange={(e) => setWallForm({ ...wallForm, gradientTo: e.target.value })} />
                          <Input className="font-mono text-xs h-9" value={wallForm.gradientTo || '#a855f7'} onChange={(e) => setWallForm({ ...wallForm, gradientTo: e.target.value })} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className={`space-y-2 mt-4 pt-4 border-t border-gray-100 ${wallForm.isInnerTransparent ? 'opacity-50 pointer-events-none transition-all' : 'transition-all'}`}>
                    <Label className="text-sm font-medium text-emerald-700">İç Zemin Rengi</Label>
                    <div className="flex gap-2">
                      <Input type="color" className="w-12 p-1 h-10 cursor-pointer border-gray-200" value={wallForm.innerBackgroundColor || '#E8DCC4'} onChange={e => setWallForm(s => ({ ...s, innerBackgroundColor: e.target.value }))} />
                      <Input value={wallForm.innerBackgroundColor || '#E8DCC4'} onChange={e => setWallForm(s => ({ ...s, innerBackgroundColor: e.target.value }))} className="font-mono text-sm" />
                    </div>
                  </div>

                  <div className="space-y-2 mt-4 pt-4 border-t border-gray-100">
                    <Label className="text-sm font-medium">Arka Plan Dokusu Resmi URL</Label>
                    <div className="flex gap-2">
                      <Input value={wallForm.backgroundImage} placeholder="https://www.transparenttextures.com/patterns/cork-board.png" onChange={e => setWallForm(s => ({ ...s, backgroundImage: e.target.value }))} className="flex-1 h-10 text-sm" />
                      <div className="flex-shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={uploadingSiteImage}
                          onClick={() => document.getElementById('site-bg-upload')?.click()}
                          className="h-10 px-3 border-gray-200 hover:bg-gray-50"
                        >
                          {uploadingSiteImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        </Button>
                        <input id="site-bg-upload" type="file" accept="image/*" onChange={handleSiteImageUpload} className="hidden" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="noBorderSite"
                          checked={wallForm.noBorder}
                          onCheckedChange={(checked) => setWallForm(s => ({ ...s, noBorder: !!checked }))}
                        />
                        <label htmlFor="noBorderSite" className="text-sm font-semibold text-gray-700 cursor-pointer">
                          Dış Çerçeve Yok
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="noInnerBorderSite"
                          checked={wallForm.noInnerBorder}
                          onCheckedChange={(checked) => setWallForm(s => ({ ...s, noInnerBorder: !!checked }))}
                        />
                        <label htmlFor="noInnerBorderSite" className="text-sm font-semibold text-gray-700 cursor-pointer">
                          İç Çerçeve Yok
                        </label>
                      </div>
                    </div>

                    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${wallForm.noBorder ? 'opacity-50 pointer-events-none' : ''}`}>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-gray-500">Dış Çerçeve (Sağ) Rengi</Label>
                        <div className="flex gap-2">
                          <Input type="color" className="w-10 h-9 p-1 cursor-pointer border-gray-200" value={wallForm.borderColor} onChange={e => setWallForm(s => ({ ...s, borderColor: e.target.value }))} />
                          <Input value={wallForm.borderColor} onChange={e => setWallForm(s => ({ ...s, borderColor: e.target.value }))} className="h-9 text-[10px] font-mono" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-gray-500">Üst ve Sol Çerçeve Rengi</Label>
                        <div className="flex gap-2">
                          <Input type="color" className="w-10 h-9 p-1 cursor-pointer border-gray-200" value={wallForm.borderTopColor} onChange={e => setWallForm(s => ({ ...s, borderTopColor: e.target.value }))} />
                          <Input value={wallForm.borderTopColor} onChange={e => setWallForm(s => ({ ...s, borderTopColor: e.target.value }))} className="h-9 text-[10px] font-mono" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-gray-500">Alt Çerçeve Rengi</Label>
                        <div className="flex gap-2">
                          <Input type="color" className="w-10 h-9 p-1 cursor-pointer border-gray-200" value={wallForm.borderBottomColor} onChange={e => setWallForm(s => ({ ...s, borderBottomColor: e.target.value }))} />
                          <Input value={wallForm.borderBottomColor} onChange={e => setWallForm(s => ({ ...s, borderBottomColor: e.target.value }))} className="h-9 text-[10px] font-mono" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Site Genel Arka Planı Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                <Home className="w-5 h-5 text-emerald-500" /> Site Genel Arka Planı (Zemin)
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Zemin Resmi (opsiyonel)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={wallForm.siteBackgroundImage || ''}
                      onChange={(e) => setWallForm({ ...wallForm, siteBackgroundImage: e.target.value })}
                      placeholder="URL veya dosya yükleyin"
                      className="flex-1 h-10 text-sm"
                    />
                    <div className="flex-shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={uploadingSiteBackgroundImage}
                        onClick={() => document.getElementById('site-global-bg-upload')?.click()}
                        className="h-10 px-3 border-gray-200 hover:bg-gray-50"
                      >
                        {uploadingSiteBackgroundImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      </Button>
                      <input id="site-global-bg-upload" type="file" accept="image/*" onChange={handleSiteBackgroundImageUpload} className="hidden" />
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 mt-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <Label className="text-sm font-semibold text-gray-700">Resim Görünümü</Label>
                  <div className="flex flex-wrap gap-4 items-center">
                    <Label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="radio" name="siteGlobalBackgroundStyle" value="cover" checked={wallForm.siteBackgroundStyle === 'cover'} onChange={(e) => setWallForm({ ...wallForm, siteBackgroundStyle: e.target.value })} />
                      <span>1. Resmi zeminde uzat</span>
                    </Label>
                    <Label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="radio" name="siteGlobalBackgroundStyle" value="stretch" checked={wallForm.siteBackgroundStyle === 'stretch'} onChange={(e) => setWallForm({ ...wallForm, siteBackgroundStyle: e.target.value })} />
                      <span>2. Resmin yüksekliğini uzat</span>
                    </Label>
                    <Label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="radio" name="siteGlobalBackgroundStyle" value="repeat" checked={!wallForm.siteBackgroundStyle || wallForm.siteBackgroundStyle === 'repeat'} onChange={(e) => setWallForm({ ...wallForm, siteBackgroundStyle: e.target.value })} />
                      <span>3. Resmi tekrarla</span>
                    </Label>
                  </div>
                </div>

                <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="siteGroundIsGradient"
                      checked={wallForm.siteIsGradient}
                      onCheckedChange={(checked) => setWallForm(s => ({ ...s, siteIsGradient: !!checked }))}
                    />
                    <Label htmlFor="siteGroundIsGradient" className="cursor-pointer font-bold text-emerald-700">Zeminde Renk/Gradyan Kullan</Label>
                  </div>

                  <div className="mt-4 transition-all">
                    {!wallForm.siteIsGradient ? (
                      <div className="space-y-2 pl-6">
                        <Label className="text-xs font-semibold text-emerald-600">Arka Plan Rengi</Label>
                        <div className="flex gap-2">
                          <Input type="color" className="w-12 h-10 p-1 cursor-pointer border-emerald-200" value={wallForm.siteBackgroundColor || '#fffbeb'} onChange={e => setWallForm(s => ({ ...s, siteBackgroundColor: e.target.value }))} />
                          <Input value={wallForm.siteBackgroundColor || '#fffbeb'} onChange={e => setWallForm(s => ({ ...s, siteBackgroundColor: e.target.value }))} className="flex-1 h-10 font-mono text-sm" />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pl-6">
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold text-emerald-600">Başlangıç</Label>
                          <div className="flex gap-1.5">
                            <Input type="color" className="w-9 h-8 p-1 cursor-pointer border-emerald-200" value={wallForm.siteGradientFrom || '#fffbeb'} onChange={(e) => setWallForm({ ...wallForm, siteGradientFrom: e.target.value })} />
                            <Input className="font-mono text-[9px] h-8" value={wallForm.siteGradientFrom || '#fffbeb'} onChange={(e) => setWallForm({ ...wallForm, siteGradientFrom: e.target.value })} />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold text-emerald-600">Orta</Label>
                          <div className="flex gap-1.5">
                            <Input type="color" className="w-9 h-8 p-1 cursor-pointer border-emerald-200" value={wallForm.siteGradientVia || '#fefce8'} onChange={(e) => setWallForm({ ...wallForm, siteGradientVia: e.target.value })} />
                            <Input className="font-mono text-[9px] h-8" value={wallForm.siteGradientVia || '#fefce8'} onChange={(e) => setWallForm({ ...wallForm, siteGradientVia: e.target.value })} />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold text-emerald-600">Bitiş</Label>
                          <div className="flex gap-1.5">
                            <Input type="color" className="w-9 h-8 p-1 cursor-pointer border-emerald-200" value={wallForm.siteGradientTo || '#fff7ed'} onChange={(e) => setWallForm({ ...wallForm, siteGradientTo: e.target.value })} />
                            <Input className="font-mono text-[9px] h-8" value={wallForm.siteGradientTo || '#fff7ed'} onChange={(e) => setWallForm({ ...wallForm, siteGradientTo: e.target.value })} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sağ Kolon: Hero ve Menü Ayarları */}
          <div className="space-y-6">
            {/* Hero Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                <Palette className="w-5 h-5 text-amber-500" /> Ana Sayfa Kapak (Hero) Görünümü
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-500">Zemin Resmi (opsiyonel)</Label>
                    <div className="flex gap-2">
                      <Input value={wallForm.heroBackgroundImage || ''} onChange={(e) => setWallForm({ ...wallForm, heroBackgroundImage: e.target.value })} placeholder="URL veya dosya yükleyin" className="flex-1 h-9 text-xs" />
                      <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('site-hero-upload')?.click()} className="h-9 h-9 px-2">
                        {uploadingSiteHeroImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      </Button>
                      <input id="site-hero-upload" type="file" accept="image/*" onChange={handleSiteHeroImageUpload} className="hidden" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-500">Alt Başlık Metni</Label>
                    <Input value="Açıklamadan Gelir" disabled className="h-9 text-xs bg-gray-100 italic text-gray-500 cursor-not-allowed" />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-500">Resim Sığdırma</Label>
                    <Select value={wallForm.heroBackgroundStyle || 'cover'} onValueChange={(v) => setWallForm({ ...wallForm, heroBackgroundStyle: v })}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cover-top">Kırp ve Üste Hizala (Tavsiye Edilen)</SelectItem>
                        <SelectItem value="cover-center">Kırp ve Ortala</SelectItem>
                        <SelectItem value="cover-bottom">Kırp ve Alta Hizala</SelectItem>
                        <SelectItem value="contain">Tamamını Sığdır (Contain)</SelectItem>
                        <SelectItem value="stretch">Genişlet (100% 100%)</SelectItem>
                        <SelectItem value="repeat">Tekrarla (Repeat)</SelectItem>
                        <SelectItem value="center">Merkezle (Center)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mt-2">
                  <Checkbox
                    id="siteHeroTransparent"
                    checked={wallForm.isHeroTransparent}
                    onCheckedChange={(checked) => setWallForm(s => ({ ...s, isHeroTransparent: !!checked }))}
                  />
                  <Label htmlFor="siteHeroTransparent" className="cursor-pointer font-bold text-amber-700">Kapak Arka Planı (Zemin) Şeffaf Olsun</Label>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {['From', 'Via', 'To'].map((pos) => (
                    <div key={pos} className="space-y-1">
                      <Label className="text-[10px] font-bold text-gray-400">Gradyan {pos === 'From' ? 'Başlangıç' : pos === 'Via' ? 'Orta' : 'Bitiş'}</Label>
                      <div className="flex gap-1.5">
                        <input type="color" value={(siteSettings as any)[`heroGradient${pos}`] || (pos === 'From' ? '#facc15' : pos === 'Via' ? '#f472b6' : '#a855f7')} onChange={(e) => setWallForm({ ...wallForm, [`heroGradient${pos}`]: e.target.value })} className="w-9 h-9 rounded cursor-pointer border border-gray-200" />
                        <Input value={(siteSettings as any)[`heroGradient${pos}`] || (pos === 'From' ? '#facc15' : pos === 'Via' ? '#f472b6' : '#a855f7')} onChange={(e) => setWallForm({ ...wallForm, [`heroGradient${pos}`]: e.target.value })} className="h-9 text-[10px] font-mono flex-1" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-5 mt-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 bg-slate-50 p-2.5 rounded-lg border border-slate-200 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Type className="w-4 h-4 text-indigo-500" /> Başlık Ayarları
                    </h4>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border border-slate-200">
                        <Checkbox
                          id="hideSiteHeroPushpin"
                          checked={!!wallForm.hideHeroPushpin}
                          onCheckedChange={(checked) => setWallForm({ ...wallForm, hideHeroPushpin: !!checked })}
                        />
                        <Label htmlFor="hideSiteHeroPushpin" className="text-xs font-semibold cursor-pointer text-slate-700">Raptiyeyi Gizle</Label>
                      </div>
                      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border border-slate-200">
                        <Checkbox
                          id="hideSiteHeroText"
                          checked={!!wallForm.hideHeroText}
                          onCheckedChange={(checked) => setWallForm({ ...wallForm, hideHeroText: !!checked })}
                        />
                        <Label htmlFor="hideSiteHeroText" className="text-xs font-semibold cursor-pointer text-slate-700">Başlık ve Alt Metni Gizle</Label>
                      </div>
                    </div>
                  </div>
                  <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 transition-opacity duration-200 ${wallForm.hideHeroText ? 'opacity-40 pointer-events-none' : ''}`}>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-medium text-gray-500">Hizalama</Label>
                      <Select value={wallForm.heroAlignment || 'left'} onValueChange={(v) => setWallForm({ ...wallForm, heroAlignment: v })}>
                        <SelectTrigger className="h-8 text-[10px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Sol</SelectItem>
                          <SelectItem value="center">Orta</SelectItem>
                          <SelectItem value="right">Sağ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-medium text-gray-500">Font</Label>
                      <Select value={wallForm.heroTitleFont || 'sans-serif'} onValueChange={(v) => setWallForm({ ...wallForm, heroTitleFont: v })}>
                        <SelectTrigger className="h-8 text-[10px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sans-serif">Sans Serif</SelectItem>
                          <SelectItem value="serif">Serif</SelectItem>
                          <SelectItem value="Patrick Hand, cursive">El Yazısı</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-medium text-gray-500">Renk</Label>
                      <input type="color" value={wallForm.heroTitleColor || '#ffffff'} onChange={(e) => setWallForm({ ...wallForm, heroTitleColor: e.target.value })} className="w-full h-8 rounded cursor-pointer border border-gray-200" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-medium text-gray-500">Boyut</Label>
                      <Select value={wallForm.heroTitleSize || '5xl'} onValueChange={(v) => setWallForm({ ...wallForm, heroTitleSize: v })}>
                        <SelectTrigger className="h-8 text-[10px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="4xl">Küçük</SelectItem>
                          <SelectItem value="5xl">Orta</SelectItem>
                          <SelectItem value="6xl">Büyük</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Başlık Zemin Ayarları */}
                <div className={`border-t border-gray-200 pt-4 mt-4 transition-opacity duration-200 ${wallForm.hideHeroText ? 'opacity-40 pointer-events-none' : ''}`}>
                  <h4 className="text-xs font-bold text-slate-700 mb-3">Başlık Zemin Ayarları</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-medium text-gray-500">Zemin Tipi</Label>
                      <Select value={wallForm.heroTitleBgMode || 'none'} onValueChange={(v) => setWallForm({ ...wallForm, heroTitleBgMode: v })}>
                        <SelectTrigger className="h-8 text-[10px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Varsayılan (Şeffaf)</SelectItem>
                          <SelectItem value="color">Düz Renk</SelectItem>
                          <SelectItem value="transparent">Şeffaf Renk (Transparan)</SelectItem>
                          <SelectItem value="image">Görsel (Resim)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {(wallForm.heroTitleBgMode === 'color' || wallForm.heroTitleBgMode === 'transparent') && (
                      <div className="space-y-1">
                        <Label className="text-[10px] font-medium text-gray-500">Zemin Rengi</Label>
                        <input type="color" value={wallForm.heroTitleBgColor || '#000000'} onChange={(e) => setWallForm({ ...wallForm, heroTitleBgColor: e.target.value })} className="w-full h-8 rounded cursor-pointer border border-gray-200" />
                      </div>
                    )}
                    {wallForm.heroTitleBgMode === 'transparent' && (
                      <div className="space-y-1">
                        <Label className="text-[10px] font-medium text-gray-500">Şeffaflık Seviyesi: {wallForm.heroTitleBgOpacity ?? 40}%</Label>
                        <div className="h-8 flex items-center px-1">
                          <input type="range" min="0" max="100" value={wallForm.heroTitleBgOpacity ?? 40} onChange={(e) => setWallForm({ ...wallForm, heroTitleBgOpacity: parseInt(e.target.value) })} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 outline-none" />
                        </div>
                      </div>
                    )}
                    {wallForm.heroTitleBgMode === 'image' && (
                      <div className="space-y-1 sm:col-span-2">
                        <Label className="text-[10px] font-medium text-gray-500">Resim URL</Label>
                        <Input value={wallForm.heroTitleBgImage || ''} onChange={(e) => setWallForm({ ...wallForm, heroTitleBgImage: e.target.value })} placeholder="https://..." className="h-8 text-[10px]" />
                      </div>
                    )}
                  </div>
                </div>

                <div className={`border-t border-gray-200 pt-4 mt-2 transition-opacity duration-200 ${wallForm.hideHeroText ? 'opacity-40 pointer-events-none' : ''}`}>
                  <h4 className="text-xs font-bold text-slate-700 mb-3">Alt Başlık Ayarları</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-medium text-gray-500">Font</Label>
                      <Select value={wallForm.heroSubtitleFont || 'sans-serif'} onValueChange={(v) => setWallForm({ ...wallForm, heroSubtitleFont: v })}>
                        <SelectTrigger className="h-8 text-[10px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sans-serif">Sans Serif</SelectItem>
                          <SelectItem value="serif">Serif</SelectItem>
                          <SelectItem value="Patrick Hand, cursive">El Yazısı</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-medium text-gray-500">Renk</Label>
                      <input type="color" value={wallForm.heroSubtitleColor || '#ffffff'} onChange={(e) => setWallForm({ ...wallForm, heroSubtitleColor: e.target.value })} className="w-full h-8 rounded cursor-pointer border border-gray-200" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-medium text-gray-500">Boyut</Label>
                      <Select value={wallForm.heroSubtitleSize || 'xl'} onValueChange={(v) => setWallForm({ ...wallForm, heroSubtitleSize: v })}>
                        <SelectTrigger className="h-8 text-[10px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lg">Küçük</SelectItem>
                          <SelectItem value="xl">Orta</SelectItem>
                          <SelectItem value="2xl">Büyük</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navbar Menu Settings Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                <Menu className="w-5 h-5 text-indigo-500" /> Kategori Menü Görünümü
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Menü Zemini</Label>
                    <div className="flex gap-2">
                      <input type="color" value={wallForm.navMenuBgColor || '#ffffff'} onChange={(e) => setWallForm({ ...wallForm, navMenuBgColor: e.target.value })} className="w-10 h-10 rounded cursor-pointer border border-gray-200" />
                      <Input value={wallForm.navMenuBgColor || '#ffffff'} onChange={(e) => setWallForm({ ...wallForm, navMenuBgColor: e.target.value })} className="flex-1 font-mono text-sm" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Yazı Rengi</Label>
                    <div className="flex gap-2">
                      <input type="color" value={wallForm.navMenuTextColor || '#111827'} onChange={(e) => setWallForm({ ...wallForm, navMenuTextColor: e.target.value })} className="w-10 h-10 rounded cursor-pointer border border-gray-200" />
                      <Input value={wallForm.navMenuTextColor || '#111827'} onChange={(e) => setWallForm({ ...wallForm, navMenuTextColor: e.target.value })} className="flex-1 font-mono text-sm" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Navbar Stili (Varyant)</Label>
                    <Select value={wallForm.navMenuVariant || 'classic'} onValueChange={(v) => setWallForm({ ...wallForm, navMenuVariant: v })}>
                      <SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="classic">Klasik Şeffaf (Aydınlık)</SelectItem>
                        <SelectItem value="modern">Modern Koyu Renk (Dark)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 flex items-end">
                    <div className="flex items-center space-x-2 bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100/50 flex-1 w-full h-10">
                      <Checkbox
                        id="siteNavMenuTransparent"
                        checked={wallForm.navMenuIsTransparent}
                        onCheckedChange={(checked) => setWallForm(s => ({ ...s, navMenuIsTransparent: !!checked }))}
                      />
                      <Label htmlFor="siteNavMenuTransparent" className="cursor-pointer font-bold text-slate-700 text-xs">Arkaplan Tamamen Şeffaf Mı?</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <Label className="text-sm font-medium">Özel Arkaplan Resim URL (İsteğe Bağlı)</Label>
                  <Input 
                    value={wallForm.navMenuBackgroundImage || ''} 
                    onChange={(e) => setWallForm({ ...wallForm, navMenuBackgroundImage: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full text-sm font-mono"
                  />
                  <p className="text-xs text-gray-500">Transparan seçeneği kapalıysa, bu görsel menü arkaplanında gösterilir.</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Font</Label>
                    <Select value={wallForm.navMenuFont || 'sans-serif'} onValueChange={(v) => setWallForm({ ...wallForm, navMenuFont: v })}>
                      <SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sans-serif">Sans Serif</SelectItem>
                        <SelectItem value="serif">Serif</SelectItem>
                        <SelectItem value="Patrick Hand, cursive">El Yazısı</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Yazı Boyutu (px)</Label>
                    <Select value={String(wallForm.navMenuFontSize || 14)} onValueChange={(v) => setWallForm({ ...wallForm, navMenuFontSize: parseInt(v) })}>
                      <SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[12, 14, 15, 16, 18, 20].map(s => (
                          <SelectItem key={s} value={String(s)}>{s}px</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                  <Checkbox
                    id="siteNavMenuMainBold"
                    checked={wallForm.navMenuMainBold}
                    onCheckedChange={(checked) => setWallForm(s => ({ ...s, navMenuMainBold: !!checked }))}
                  />
                  <Label htmlFor="siteNavMenuMainBold" className="cursor-pointer font-bold text-indigo-700">Ana Kategoriler Kalın Olsun</Label>
                </div>
              </div>
            </div>

            {/* Sayfa Adı ve Kurdele Görünümü Section (Genel Site) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                <Paintbrush className="w-5 h-5 text-pink-500" /> Sayfa Adı ve Kurdele Görünümü
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="siteShowWallTitle"
                      checked={!wallForm.hideWallTitle}
                      onCheckedChange={(checked) => setWallForm(s => ({ ...s, hideWallTitle: !checked }))}
                    />
                    <Label htmlFor="siteShowWallTitle" className="cursor-pointer font-bold text-gray-700">Sayfa Adını Göster</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="siteShowWallRibbon"
                      checked={!wallForm.hideWallRibbon}
                      onCheckedChange={(checked) => setWallForm(s => ({ ...s, hideWallRibbon: !checked }))}
                    />
                    <Label htmlFor="siteShowWallRibbon" className="cursor-pointer font-bold text-gray-700">Kurdeleyi Göster</Label>
                  </div>
                </div>

                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 ${wallForm.hideWallRibbon ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Kurdele Rengi</Label>
                    <div className="flex gap-2">
                      <input type="color" value={wallForm.ribbonColor || '#502bb1'} onChange={(e) => setWallForm({ ...wallForm, ribbonColor: e.target.value })} className="w-10 h-10 rounded cursor-pointer border border-gray-200" />
                      <Input value={wallForm.ribbonColor || '#502bb1'} onChange={(e) => setWallForm({ ...wallForm, ribbonColor: e.target.value })} className="flex-1 font-mono text-sm" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Kurdele Resmi (opsiyonel)</Label>
                    <div className="flex gap-2">
                      <Input value={wallForm.ribbonImage || ''} onChange={(e) => setWallForm({ ...wallForm, ribbonImage: e.target.value })} placeholder="URL veya dosya yükleyin" className="flex-1 text-sm" />
                      <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('site-ribbon-upload')?.click()} className="h-10 px-3">
                        {uploadingSiteRibbonImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      </Button>
                      <input id="site-ribbon-upload" type="file" accept="image/*" onChange={handleSiteRibbonImageUpload} className="hidden" />
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                     <Label className="text-sm font-medium">Sayfa Adı Metni (Boşsa otomatik)</Label>
                     <Input value={wallForm.customRibbonText || ''} onChange={(e) => setWallForm({ ...wallForm, customRibbonText: e.target.value })} placeholder="örn: Hoş Geldiniz" className="flex-1 text-sm font-mono" />
                  </div>
                  
                  <div className="space-y-2 mt-4">
                     <Label className="text-sm font-medium">Sayfa Adı Rengi</Label>
                     <div className="flex gap-2">
                       <input type="color" value={wallForm.ribbonTextColor || '#ffffff'} onChange={(e) => setWallForm({ ...wallForm, ribbonTextColor: e.target.value })} className="w-10 h-10 rounded cursor-pointer border border-gray-200" />
                       <Input value={wallForm.ribbonTextColor || '#ffffff'} onChange={(e) => setWallForm({ ...wallForm, ribbonTextColor: e.target.value })} className="flex-1 font-mono text-sm" />
                     </div>
                  </div>

                  <div className="space-y-2 mt-4">
                     <Label className="text-sm font-medium">Sayfa Adı Yazı Tipi</Label>
                     <Select
                        value={wallForm.ribbonTextFont || 'sans-serif'}
                        onValueChange={(val) => setWallForm({ ...wallForm, ribbonTextFont: val })}
                     >
                        <SelectTrigger className="w-full">
                           <SelectValue placeholder="Font Seçin" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="sans-serif">Modern (Nunito - Varsayılan)</SelectItem>
                           <SelectItem value="sans-serif-generic">Düz Sans Serif</SelectItem>
                           <SelectItem value="arial">Arial</SelectItem>
                           <SelectItem value="calibri">Calibri</SelectItem>
                           <SelectItem value="serif">Klasik (Serif)</SelectItem>
                           <SelectItem value="cursive">El Yazısı (Cursive)</SelectItem>
                           <SelectItem value="monospace">Teknik (Monospace)</SelectItem>
                           <SelectItem value="system-ui">Sistem (System-ui)</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Canlı Önizleme Alanı */}
        <div className="pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-500" /> Canlı Önizleme
            </Label>
            <span className="text-[10px] text-gray-400 italic">Sol taraf: Site Zemini | Orta: Duvar Panosu</span>
          </div>

          {/* Site Zemini Önizlemesi */}
          <div
            className="w-full rounded-3xl p-6 md:p-12 shadow-inner border border-gray-100 relative overflow-hidden transition-all duration-700"
            style={{
              backgroundColor: wallForm.siteBackgroundColor || '#f8fafc',
              backgroundImage: wallForm.siteIsGradient
                ? `linear-gradient(135deg, ${wallForm.siteGradientFrom || '#fffbeb'}, ${wallForm.siteGradientVia || '#fefce8'}, ${wallForm.siteGradientTo || '#fff7ed'})`
                : wallForm.siteBackgroundImage ? `url("${wallForm.siteBackgroundImage}")` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Duvar Panosu (Wall Board) Önizlemesi */}
            <div className="w-full max-w-4xl mx-auto rounded-2xl relative p-4 md:p-10 flex shadow-2xl overflow-hidden border-4 border-white/30"
              style={{
                backgroundColor: wallForm.isWallTransparent ? 'transparent' : wallForm.backgroundColor,
                backgroundImage: !wallForm.isWallTransparent ? (wallForm.isGradient ? `linear-gradient(to bottom right, ${wallForm.gradientFrom || '#facc15'}, ${wallForm.gradientVia || '#f472b6'}, ${wallForm.gradientTo || '#a855f7'})` : `url("${wallForm.backgroundImage}")`) : 'none',
                border: wallForm.noBorder ? '0px' : `20px solid transparent`,
                borderImage: wallForm.noBorder ? 'none' : `linear-gradient(to right, ${wallForm.borderTopColor}, ${wallForm.borderColor}, ${wallForm.borderBottomColor}) 1`,
                minHeight: '450px',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {/* Dokulu kaplama */}
              {!wallForm.isWallTransparent && wallForm.backgroundImage && (
                <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply" style={{ backgroundImage: `url("${wallForm.backgroundImage}")`, backgroundSize: '200px' }}></div>
              )}

              <div className="m-auto relative z-10 w-full">
                {/* Hero Önizlemesi */}
                <div
                  className="mb-8 p-6 rounded-2xl overflow-hidden relative shadow-lg group transition-all duration-500 border border-white/20"
                  style={{
                    backgroundImage: wallForm.heroBackgroundImage
                      ? `url("${wallForm.heroBackgroundImage}")`
                      : `linear-gradient(135deg, ${wallForm.heroGradientFrom || '#facc15'}, ${wallForm.heroGradientVia || '#f472b6'}, ${wallForm.heroGradientTo || '#a855f7'})`,
                    backgroundSize: (wallForm.heroBackgroundStyle || 'cover').startsWith('cover') ? 'cover' : wallForm.heroBackgroundStyle === 'stretch' ? '100% 100%' : (wallForm.heroBackgroundStyle === 'contain' ? 'contain' : 'auto'),
                    backgroundRepeat: wallForm.heroBackgroundStyle === 'repeat' ? 'repeat' : 'no-repeat',
                    backgroundPosition: wallForm.heroBackgroundStyle === 'cover-top' ? 'top center' : wallForm.heroBackgroundStyle === 'cover-bottom' ? 'bottom center' : wallForm.heroBackgroundStyle === 'center' ? 'center' : (wallForm.heroBackgroundStyle === 'repeat' ? 'auto' : 'center'),
                    textAlign: (wallForm.heroAlignment as any) || 'left'
                  }}
                >
                  <h4
                    className="font-bold mb-2 transition-all duration-300 drop-shadow-md"
                    style={{
                      fontFamily: wallForm.heroTitleFont || 'sans-serif',
                      color: wallForm.heroTitleColor || '#ffffff',
                      fontSize: wallForm.heroTitleSize === '4xl' ? '1.5rem' : wallForm.heroTitleSize === '5xl' ? '2rem' : '2.5rem'
                    }}
                  >
                    Ana Sayfa Başlığı
                  </h4>
                  <p
                    className="opacity-90 font-medium transition-all duration-300 drop-shadow-sm"
                    style={{
                      fontFamily: wallForm.heroSubtitleFont || 'sans-serif',
                      color: wallForm.heroSubtitleColor || '#ffffff',
                      fontSize: wallForm.heroSubtitleSize === 'lg' ? '0.9rem' : wallForm.heroSubtitleSize === 'xl' ? '1.1rem' : '1.3rem'
                    }}
                  >
                    {wallForm.heroSubtitle || 'Harika fikirlerin buluşma noktası'}
                  </p>
                </div>

                <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50 text-center scale-95 hover:scale-100 transition-transform duration-500">
                  {/* Kategori Menü Mockup */}
                  <div
                    className="flex gap-4 justify-center mb-6 py-3 px-4 rounded-full shadow-sm mx-auto w-fit"
                    style={{
                      backgroundColor: wallForm.navMenuBgColor || '#ffffff',
                      fontFamily: wallForm.navMenuFont || 'sans-serif',
                      fontSize: `${wallForm.navMenuFontSize || 14}px`,
                      color: wallForm.navMenuTextColor || '#111827'
                    }}
                  >
                    <span style={{ fontWeight: wallForm.navMenuMainBold ? 'bold' : 'normal' }}>Gündem</span>
                    <span style={{ fontWeight: wallForm.navMenuMainBold ? 'bold' : 'normal' }}>Haberler</span>
                    <span style={{ fontWeight: wallForm.navMenuMainBold ? 'bold' : 'normal' }}>Spor</span>
                  </div>

                  <p className="text-xl font-bold text-gray-800 mb-2">Pano İçerik Alanı</p>
                  <div className="flex gap-4 justify-center mt-6">
                    <div className="w-16 h-16 bg-yellow-200 shadow-md -rotate-3 rounded-sm border-t-4 border-yellow-300"></div>
                    <div className="w-16 h-16 bg-blue-200 shadow-md rotate-6 rounded-sm border-t-4 border-blue-300"></div>
                    <div className="w-16 h-16 bg-pink-200 shadow-md -rotate-6 rounded-sm border-t-4 border-pink-300"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <PushpinLogo size={32} />
            <h1 className="text-xl font-bold">Panoda Şehir</h1>
          </div>
          <p className="text-sm text-gray-400">Admin Paneli</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isExpanded = expandedMenus.has(item.id)
            const hasChildren = item.children && item.children.length > 0

            return (
              <div key={item.id} className="space-y-1">
                {hasChildren ? (
                  <>
                    <button
                      onClick={() => {
                        const newExpanded = new Set(expandedMenus)
                        if (isExpanded) newExpanded.delete(item.id)
                        else newExpanded.add(item.id)
                        setExpandedMenus(newExpanded)
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors text-gray-300 hover:bg-gray-800`}
                    >
                      <div className="flex items-center gap-3 text-left">
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="text-left leading-tight">{item.label}</span>
                      </div>
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    {isExpanded && (
                      <div className="ml-4 pl-4 border-l border-gray-700 space-y-1">
                        {item.children?.map((child) => {
                          const ChildIcon = child.icon
                          return (
                            <button
                              key={child.id}
                              onClick={() => setActiveSection(child.id as any)}
                              className={`w-full flex items-center gap-3 px-4 py-2 text-sm rounded-lg transition-colors text-left ${activeSection === child.id
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                }`}
                            >
                              <ChildIcon className="w-4 h-4 flex-shrink-0" />
                              <span className="leading-tight">{child.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => setActiveSection(item.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${activeSection === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                      }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="leading-tight">{item.label}</span>
                  </button>
                )}
              </div>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
            onClick={() => router.push('/')}
          >
            <Home className="w-5 h-5 mr-3" />
            Ana Sayfaya Dön
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-gray-50/50">
        <div className="p-8 pb-32 min-h-full">
          {/* Dashboard */}
          {activeSection === 'dashboard' && (
            <div className="space-y-8">
              <div>
                <div className="sticky top-0 z-30 bg-gray-50/95 py-5 mb-6 flex items-center justify-between border-b border-gray-200 shadow-sm -mx-8 -mt-8 px-8 backdrop-blur-sm">
                  <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-xl p-6 text-white border border-gray-700 relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
                      <Users className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                      <div className="text-gray-400 font-medium mb-1 text-sm uppercase tracking-wider">Toplam Kullanıcı</div>
                      <div className="text-4xl font-bold">{stats.users}</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl shadow-xl p-6 text-white border border-blue-700 relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
                      <LayoutGrid className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                      <div className="text-blue-200 font-medium mb-1 text-sm uppercase tracking-wider">Toplam Duvar</div>
                      <div className="text-4xl font-bold">{stats.walls}</div>
                      <div className="text-xs font-semibold text-blue-200 mt-2 flex justify-between items-center bg-blue-900/50 p-2 rounded-lg border border-blue-600/50">
                        <span>Aktif: <span className="text-emerald-300 ml-1">{walls.filter((w: any) => w.isActive !== false && (!w.expirationDate || new Date(w.expirationDate) >= new Date())).length}</span></span>
                        <span>Pasif: <span className="text-rose-300 ml-1">{walls.filter((w: any) => w.isActive === false || (w.expirationDate && new Date(w.expirationDate) < new Date())).length}</span></span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-600 to-amber-500 rounded-2xl shadow-xl p-6 text-white border border-amber-500 relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
                      <StickyNote className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                      <div className="text-amber-100 font-medium mb-1 text-sm uppercase tracking-wider">Onay Bekleyenler</div>
                      <div className="text-4xl font-bold">{stats.pendingPostits}</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-2xl shadow-xl p-6 text-white border border-emerald-500 relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
                      <StickyNote className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                      <div className="text-emerald-100 font-medium mb-1 text-sm uppercase tracking-wider">Onaylı Post-itler</div>
                      <div className="text-4xl font-bold">{stats.postits}</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-rose-600 to-rose-500 rounded-2xl shadow-xl p-6 text-white border border-rose-500 relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
                      <StickyNote className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                      <div className="text-rose-100 font-medium mb-1 text-sm uppercase tracking-wider">Yayında Olmayanlar</div>
                      <div className="text-4xl font-bold">{stats.unpublishedPostits}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Duvar İstatistikleri */}
              <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-700">Duvar İstatistikleri (Toplam Beğeni ve Görüntülenme)</h3>
                </div>
                <div className="overflow-x-auto max-h-[400px]">
                  <table className="w-full text-sm text-left relative">
                    <thead className="text-xs text-gray-600 uppercase bg-gray-100 sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="px-4 py-3 border-b">Duvar Adı</th>
                        <th className="px-4 py-3 border-b">Durum</th>
                        <th className="px-4 py-3 text-center border-b">Toplam Post-it</th>
                        <th className="px-4 py-3 text-center border-b">Onay Bekleyen</th>
                        <th className="px-4 py-3 text-center border-b">Görüntülenme</th>
                        <th className="px-4 py-3 text-center border-b">Beğeni</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {walls.map(wall => {
                        const wallPostits = postits.filter((p: any) => p.categoryId === wall.id)
                        const totalPostits = wallPostits.length
                        const pendingPostits = wallPostits.filter((p: any) => !p.isApproved).length
                        const totalViews = wallPostits.reduce((acc: number, p: any) => acc + (p.views || 0), 0)
                        const totalLikes = wallPostits.reduce((acc: number, p: any) => acc + (p._count?.likes || 0), 0)
                        
                        return { wall, totalPostits, pendingPostits, totalViews, totalLikes }
                      }).sort((a, b) => b.totalViews - a.totalViews).map(({ wall, totalPostits, pendingPostits, totalViews, totalLikes }) => (
                        <tr key={wall.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-4 py-3 font-medium text-gray-800">{wall.name}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${wall.isActive !== false && (!wall.expirationDate || new Date(wall.expirationDate) >= new Date()) ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                              {wall.isActive !== false && (!wall.expirationDate || new Date(wall.expirationDate) >= new Date()) ? '🟢 Aktif' : '🔴 Pasif'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-gray-600 font-semibold">{totalPostits}</td>
                          <td className="px-4 py-3 text-center min-w-[120px]">
                            {pendingPostits > 0 ? (
                              <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                {pendingPostits} Bekliyor
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center text-gray-600">{totalViews}</td>
                          <td className="px-4 py-3 text-center font-medium text-blue-600">{totalLikes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {walls.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      Hiç duvar bulunamadı.
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* Info Pages Placeholder */}
          {['about', 'contact', 'terms', 'privacy', 'cookies', 'help', 'kvkk'].includes(activeSection) && (
            <div className="space-y-6">
              <div className="sticky top-0 z-30 bg-gray-50/95 py-5 mb-6 flex items-center justify-between border-b border-gray-200 shadow-sm flex-col md:flex-row gap-4 md:gap-0 -mx-8 -mt-8 px-8 backdrop-blur-sm">
                <h2 className="text-2xl font-bold">
                  {activeSection === 'about' && 'Hakkımızda Sayfası Yönetimi'}
                  {activeSection === 'contact' && 'İletişim Sayfası Yönetimi'}
                  {activeSection === 'terms' && 'Kullanım Koşulları Yönetimi'}
                  {activeSection === 'privacy' && 'Gizlilik Politikası Yönetimi'}
                  {activeSection === 'cookies' && 'Çerez Politikası Yönetimi'}
                  {activeSection === 'help' && 'Yardım Merkezi Yönetimi'}
                  {activeSection === 'kvkk' && 'KVKK Metni Yönetimi'}
                </h2>
                <Button onClick={handleSaveSiteSettings} disabled={savingSettings}>
                  {savingSettings && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Değişiklikleri Kaydet
                </Button>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                <Label className="text-lg font-semibold block mb-4">İçerik Editörü</Label>
                <RichEditor
                  key={activeSection}
                  placeholder="Sayfa içeriğini buraya zengin metin olarak girebilirsiniz..."
                  value={(siteSettings as any)[
                    activeSection === 'about' ? 'aboutContent' :
                      activeSection === 'contact' ? 'contactContent' :
                        activeSection === 'terms' ? 'termsContent' :
                          activeSection === 'privacy' ? 'privacyContent' :
                            activeSection === 'cookies' ? 'cookiesContent' :
                              activeSection === 'help' ? 'helpContent' :
                                activeSection === 'kvkk' ? 'kvkkContent' : 'aboutContent'
                  ] || ''}
                  onChange={(value) => {
                    const field =
                      activeSection === 'about' ? 'aboutContent' :
                        activeSection === 'contact' ? 'contactContent' :
                          activeSection === 'terms' ? 'termsContent' :
                            activeSection === 'privacy' ? 'privacyContent' :
                              activeSection === 'cookies' ? 'cookiesContent' :
                                activeSection === 'help' ? 'helpContent' :
                                  activeSection === 'kvkk' ? 'kvkkContent' : 'aboutContent';
                    setSiteSettings(prev => ({ ...prev, [field]: value }));
                  }}
                />
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
                  <strong>İpucu:</strong> Buraya yazdığınız metinler sitedeki ilgili linklere tıklandığında popup (modal) içerisinde görüntülenecektir.
                </div>
              </div>
            </div>
          )}

          {/* Popular Categories Management */}
          {activeSection === 'popularCategories' && (
            <div className="space-y-6">
              <div className="sticky top-0 z-30 bg-gray-50/95 py-5 mb-6 flex items-center justify-between border-b border-gray-200 shadow-sm flex-col md:flex-row gap-4 md:gap-0 -mx-8 -mt-8 px-8 backdrop-blur-sm">
                <h2 className="text-2xl font-bold">Popüler Kategorileri Yönet</h2>
                <Button onClick={handleSaveSiteSettings} disabled={savingSettings}>
                  {savingSettings && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Düzeni Kaydet
                </Button>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Kategori Linkleri</h3>
                    <p className="text-sm text-gray-500">Footer'da "Popüler Kategoriler" sütununda görünecek linkler.</p>
                  </div>
                  <Button
                    onClick={() => {
                      const links = [...(siteSettings.popularLinks || [])];
                      links.push({ label: 'Yeni Kategori', href: '/kategori/yeni' });
                      setSiteSettings({ ...siteSettings, popularLinks: links });
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ekle
                  </Button>
                </div>

                <div className="space-y-4">
                  {(!siteSettings.popularLinks || siteSettings.popularLinks.length === 0) ? (
                    <div className="p-8 text-center text-gray-500 bg-gray-50/50 border-2 border-dashed border-gray-300 rounded-xl">
                      Henüz bir link eklenmemiş. "Ekle" butonunu kullanarak yeni linkler tanımlayabilirsiniz.
                    </div>
                  ) : (
                    siteSettings.popularLinks.map((link, idx) => (
                      <div key={idx} className="flex gap-4 items-end bg-gray-50/80 p-5 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex-1 space-y-2">
                          <Label>Görünen Ad</Label>
                          <Input
                            value={link.label}
                            onChange={(e) => {
                              const links = [...(siteSettings.popularLinks || [])];
                              links[idx].label = e.target.value;
                              setSiteSettings({ ...siteSettings, popularLinks: links });
                            }}
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label>Link Adresi (Href)</Label>
                          <Input
                            value={link.href}
                            onChange={(e) => {
                              const links = [...(siteSettings.popularLinks || [])];
                              links[idx].href = e.target.value;
                              setSiteSettings({ ...siteSettings, popularLinks: links });
                            }}
                            placeholder="/kategori/ornek"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            const links = [...(siteSettings.popularLinks || [])];
                            links.splice(idx, 1);
                            setSiteSettings({ ...siteSettings, popularLinks: links });
                          }}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Discover Management */}
          {activeSection === 'discover' && (
            <div className="space-y-6">
              <div className="sticky top-0 z-30 bg-gray-50/95 py-5 mb-6 flex items-center justify-between border-b border-gray-200 shadow-sm flex-col md:flex-row gap-4 md:gap-0 -mx-8 -mt-8 px-8 backdrop-blur-sm">
                <h2 className="text-2xl font-bold">Keşfet Bölümünü Yönet</h2>
                <Button onClick={handleSaveSiteSettings} disabled={savingSettings}>
                  {savingSettings && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Düzeni Kaydet
                </Button>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Keşfet Linkleri</h3>
                    <p className="text-sm text-gray-500">Footer'da "Keşfet" sütununda görünecek linkler.</p>
                  </div>
                  <Button
                    onClick={() => {
                      const links = [...(siteSettings.discoverLinks || [])];
                      links.push({ label: 'Yeni Link', href: '#' });
                      setSiteSettings({ ...siteSettings, discoverLinks: links });
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ekle
                  </Button>
                </div>

                <div className="space-y-4">
                  {(!siteSettings.discoverLinks || siteSettings.discoverLinks.length === 0) ? (
                    <div className="p-8 text-center text-gray-500 bg-gray-50/50 border-2 border-dashed border-gray-300 rounded-xl">
                      Henüz bir link eklenmemiş. "Ekle" butonunu kullanarak yeni linkler tanımlayabilirsiniz.
                    </div>
                  ) : (
                    siteSettings.discoverLinks.map((link, idx) => (
                      <div key={idx} className="flex gap-4 items-end bg-gray-50/80 p-5 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex-1 space-y-2">
                          <Label>Görünen Ad</Label>
                          <Input
                            value={link.label}
                            onChange={(e) => {
                              const links = [...(siteSettings.discoverLinks || [])];
                              links[idx].label = e.target.value;
                              setSiteSettings({ ...siteSettings, discoverLinks: links });
                            }}
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label>Link Adresi (Href)</Label>
                          <Input
                            value={link.href}
                            onChange={(e) => {
                              const links = [...(siteSettings.discoverLinks || [])];
                              links[idx].href = e.target.value;
                              setSiteSettings({ ...siteSettings, discoverLinks: links });
                            }}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            const links = [...(siteSettings.discoverLinks || [])];
                            links.splice(idx, 1);
                            setSiteSettings({ ...siteSettings, discoverLinks: links });
                          }}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Social Media Management */}
          {activeSection === 'socialMedia' && (
            <div className="space-y-6">
              <div className="sticky top-0 z-30 bg-gray-50/95 py-5 mb-6 flex items-center justify-between border-b border-gray-200 shadow-sm flex-col md:flex-row gap-4 md:gap-0 -mx-8 -mt-8 px-8 backdrop-blur-sm">
                <h2 className="text-2xl font-bold">Sosyal Medya Hesaplarını Yönet</h2>
                <Button onClick={handleSaveSiteSettings} disabled={savingSettings}>
                  {savingSettings && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Ayarları Kaydet
                </Button>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Hesaplar</h3>
                    <p className="text-sm text-gray-500">Footer'da görüntülenecek sosyal medya ikonları ve linkleri.</p>
                  </div>
                  <Button
                    onClick={() => {
                      const links = [...(siteSettings.socialLinks || [])];
                      links.push({ platform: 'Instagram', icon: 'Instagram', url: 'https://instagram.com/panodasehir' });
                      setSiteSettings({ ...siteSettings, socialLinks: links });
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ekle
                  </Button>
                </div>

                <div className="space-y-4">
                  {(!siteSettings.socialLinks || siteSettings.socialLinks.length === 0) ? (
                    <div className="p-8 text-center text-gray-500 bg-gray-50/50 border-2 border-dashed border-gray-300 rounded-xl">
                      Henüz bir hesap eklenmemiş. "Ekle" butonunu kullanarak bağlantılarınızı ekleyebilirsiniz.
                    </div>
                  ) : (
                    siteSettings.socialLinks.map((link, idx) => (
                      <div key={idx} className="flex flex-col md:flex-row gap-4 items-end bg-gray-50/80 p-5 rounded-xl border border-gray-200 shadow-sm">
                        <div className="w-40 space-y-2">
                          <Label>Platform</Label>
                          <Input
                            value={link.platform}
                            onChange={(e) => {
                              const links = [...(siteSettings.socialLinks || [])];
                              links[idx].platform = e.target.value;
                              setSiteSettings({ ...siteSettings, socialLinks: links });
                            }}
                            placeholder="Instagram"
                          />
                        </div>
                        <div className="w-48 space-y-2">
                          <Label>İkon (Lucide)</Label>
                          <Select
                            value={link.icon}
                            onValueChange={(val) => {
                              const links = [...(siteSettings.socialLinks || [])];
                              links[idx].icon = val;
                              setSiteSettings({ ...siteSettings, socialLinks: links });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="İkon Seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Instagram">Instagram</SelectItem>
                              <SelectItem value="Facebook">Facebook</SelectItem>
                              <SelectItem value="Twitter">Twitter/X</SelectItem>
                              <SelectItem value="Linkedin">LinkedIn</SelectItem>
                              <SelectItem value="Youtube">Youtube</SelectItem>
                              <SelectItem value="Github">Github</SelectItem>
                              <SelectItem value="Share2">Paylaş</SelectItem>
                              <SelectItem value="Mail">E-Posta</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1 space-y-2 w-full">
                          <Label>Hesap Linki (URL)</Label>
                          <Input
                            value={link.url}
                            onChange={(e) => {
                              const links = [...(siteSettings.socialLinks || [])];
                              links[idx].url = e.target.value;
                              setSiteSettings({ ...siteSettings, socialLinks: links });
                            }}
                            placeholder="https://..."
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            const links = [...(siteSettings.socialLinks || [])];
                            links.splice(idx, 1);
                            setSiteSettings({ ...siteSettings, socialLinks: links });
                          }}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Calendar Settings */}
          {activeSection === 'calendar' && (
            <div>
              <div className="sticky top-0 z-30 bg-gray-50/95 py-5 mb-6 flex items-center justify-between border-b border-gray-200 shadow-sm flex-col md:flex-row gap-4 md:gap-0 -mx-8 -mt-8 px-8 backdrop-blur-sm">
                <h2 className="text-2xl font-bold">Takvim Ayarları</h2>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={loadData} disabled={savingSettings}>
                    İptal
                  </Button>
                  <Button onClick={handleSaveSiteSettings} disabled={savingSettings}>
                    {savingSettings && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Kaydet
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6 bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Görünüm ve Konum</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 pt-2 pb-2">
                        <Checkbox
                          id="calendarShow"
                          checked={siteSettings.calendarShow}
                          onCheckedChange={(checked) => setSiteSettings(s => ({ ...s, calendarShow: !!checked }))}
                        />
                        <Label htmlFor="calendarShow" className="cursor-pointer font-semibold">Takvimi Göster</Label>
                      </div>

                      {siteSettings.calendarShow && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Sayfadaki Konumu</Label>
                              <Select
                                value={siteSettings.calendarPosition || 'right'}
                                onValueChange={(value) => setSiteSettings({ ...siteSettings, calendarPosition: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="left">Mantar Pano Solu</SelectItem>
                                  <SelectItem value="right">Mantar Pano Sağı</SelectItem>
                                  <SelectItem value="top-left">Sayfa Sol Üst (Sabit)</SelectItem>
                                  <SelectItem value="top-center">Sayfa Üst Orta (Sabit)</SelectItem>
                                  <SelectItem value="top-right">Sayfa Sağ Üst (Sabit)</SelectItem>
                                  <SelectItem value="hero-top-left">Kapak Sol Üst</SelectItem>
                                  <SelectItem value="hero-top-center">Kapak Üst Orta</SelectItem>
                                  <SelectItem value="hero-top-right">Kapak Sağ Üst</SelectItem>
                                  <SelectItem value="hero-bottom-left">Kapak Sol Alt</SelectItem>
                                  <SelectItem value="hero-bottom-right">Kapak Sağ Alt</SelectItem>
                                  <SelectItem value="board-top-left">Pano Sol Üst</SelectItem>
                                  <SelectItem value="board-top-right">Pano Sağ Üst</SelectItem>
                                  <SelectItem value="board-bottom-left">Pano Sol Alt</SelectItem>
                                  <SelectItem value="board-bottom-right">Pano Sağ Alt</SelectItem>
                                  <SelectItem value="slider-side">Slayder Yanı</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Takvim Görünümü</Label>
                              <Select
                                value={siteSettings.calendarViewType || 'page'}
                                onValueChange={(value) => setSiteSettings({ ...siteSettings, calendarViewType: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="page">Sayfa Takvim</SelectItem>
                                  <SelectItem value="modern">Modern Görünüm</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Boyut</Label>
                              <Select
                                value={siteSettings.calendarSize || 'medium'}
                                onValueChange={(value) => setSiteSettings({ ...siteSettings, calendarSize: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="small">Küçük</SelectItem>
                                  <SelectItem value="medium">Orta</SelectItem>
                                  <SelectItem value="large">Büyük</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Takvim Başlık Rengi</Label>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                className="w-12 p-1 h-10 cursor-pointer"
                                value={siteSettings.calendarColor || '#dc2626'}
                                onChange={e => setSiteSettings(s => ({ ...s, calendarColor: e.target.value }))}
                              />
                              <Input
                                value={siteSettings.calendarColor || '#dc2626'}
                                onChange={e => setSiteSettings(s => ({ ...s, calendarColor: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-2 mt-4">
                              <Label className="text-xs font-semibold flex justify-between">
                                Takvim Pop-up Zemin Resmi
                                {siteSettings.calendarPopupBackgroundImage && (
                                  <button onClick={() => setSiteSettings(s => ({ ...s, calendarPopupBackgroundImage: '' }))} className="text-red-500 text-[10px]">Temizle</button>
                                )}
                              </Label>
                              <div className="flex gap-2 items-center">
                                <div className="w-16 h-10 bg-gray-100 rounded border overflow-hidden relative flex items-center justify-center">
                                  {siteSettings.calendarPopupBackgroundImage ? (
                                    <img src={siteSettings.calendarPopupBackgroundImage} className="w-full h-full object-cover" />
                                  ) : <ImageIcon className="w-4 h-4 text-gray-400" />}
                                  {uploadingCalendarPopupImage && <div className="absolute inset-0 bg-white/50 flex items-center justify-center"><Loader2 className="w-3 h-3 animate-spin" /></div>}
                                </div>
                                <Input
                                  type="file"
                                  accept="image/*"
                                  className="flex-1 text-xs"
                                  onChange={handleCalendarPopupImageUpload}
                                />
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="block mb-2 text-sm text-gray-700">Canlı Önizleme (Temsili)</Label>
                  <div className="w-full bg-gray-200 rounded-lg p-4 relative border-2 border-gray-300 overflow-hidden" style={{ minHeight: '350px' }}>
                    {/* Pano Alanı */}
                    <div className={`mt-16 bg-white h-48 rounded shadow border-dashed border-2 border-gray-300 flex items-center justify-center text-gray-400 transition-all ${siteSettings.calendarPosition === 'left' ? 'ml-auto w-3/4' :
                      siteSettings.calendarPosition === 'right' ? 'mr-auto w-3/4' : 'w-full'
                      }`}>
                      Pano Alanı
                    </div>

                    {/* Calendar Render */}
                    {siteSettings.calendarShow && (
                      <div className={`transition-all duration-500 z-10 ${
                        siteSettings.calendarPosition === 'top-left' ? 'absolute top-4 left-4' :
                        siteSettings.calendarPosition === 'top-center' ? 'absolute top-4 left-1/2 -translate-x-1/2' :
                        siteSettings.calendarPosition === 'top-right' ? 'absolute top-4 right-4' :
                        siteSettings.calendarPosition === 'hero-top-left' ? 'absolute top-16 left-4' :
                        siteSettings.calendarPosition === 'hero-top-center' ? 'absolute top-16 left-1/2 -translate-x-1/2' :
                        siteSettings.calendarPosition === 'hero-top-right' ? 'absolute top-16 right-4' :
                        siteSettings.calendarPosition === 'hero-bottom-left' ? 'absolute top-24 left-4' :
                        siteSettings.calendarPosition === 'hero-bottom-right' ? 'absolute top-24 right-4' :
                        siteSettings.calendarPosition === 'board-top-left' ? 'absolute top-40 left-16' :
                        siteSettings.calendarPosition === 'board-top-right' ? 'absolute top-40 right-16' :
                        siteSettings.calendarPosition === 'board-bottom-left' ? 'absolute bottom-4 left-16' :
                        siteSettings.calendarPosition === 'board-bottom-right' ? 'absolute bottom-4 right-16' :
                        siteSettings.calendarPosition === 'left' ? 'absolute top-32 left-8' :
                        'absolute top-32 right-8'
                      }`}>
                        <div className={`border-2 border-red-500 rounded p-2 bg-white shadow-lg transition-transform ${siteSettings.calendarSize === 'large' ? 'scale-110' : siteSettings.calendarSize === 'small' ? 'scale-75' : 'scale-100'}`}>
                          <div className="bg-red-600 h-2 w-full mb-1"></div>
                          <div className="text-center font-bold text-lg">27</div>
                          <div className="text-[10px] text-center">Cuma</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-semibold">Takvim Başlıkları</h3>
                    <p className="text-sm text-gray-500">Takvimde görünecek kategori başlıklarını buradan yönetebilirsiniz.</p>
                  </div>
                  <Button onClick={openAddCalendarCategory} size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Yeni Başlık Ekle
                  </Button>
                </div>

                <div className="shadow-lg border rounded-2xl overflow-hidden bg-white">
                  <Table>
                    <TableHeader className="bg-gray-900">
                      <TableRow className="border-gray-800 hover:bg-gray-900">
                        <TableHead className="w-20 text-gray-300 font-semibold py-4 pl-6">Sıra</TableHead>
                        <TableHead className="text-gray-300 font-semibold">Başlık Adı</TableHead>
                        <TableHead className="w-32 text-gray-300 font-semibold">Durum</TableHead>
                        <TableHead className="w-24 text-right text-gray-300 font-semibold pr-6">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {calendarCategories.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                            Henüz hiçbir başlık eklenmemiş.
                          </TableCell>
                        </TableRow>
                      ) : (
                        calendarCategories.map((cat) => (
                          <TableRow key={cat.id}>
                            <TableCell>{cat.order}</TableCell>
                            <TableCell className="font-medium">{cat.name}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                {cat.isActive ? 'Aktif' : 'Pasif'}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="sm" onClick={() => openEditCalendarCategory(cat)} className="h-8 w-8 p-0">
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteCalendarCategory(cat.id)} className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}

          {/* Calendar Category Modal */}
          <Dialog open={showCalendarCategoryModal} onOpenChange={setShowCalendarCategoryModal}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Başlığı Düzenle' : 'Yeni Başlık Ekle'}</DialogTitle>
                <DialogDescription>
                  Takvimde kullanılacak kategori başlığını buraya girin.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="catName">Başlık Adı</Label>
                  <Input
                    id="catName"
                    placeholder="Örn: Tatil, Toplantı, Doğum Günü"
                    value={calendarCategoryForm.name}
                    onChange={(e) => setCalendarCategoryForm({ ...calendarCategoryForm, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="catOrder">Görüntüleme Sırası</Label>
                    <Input
                      id="catOrder"
                      type="number"
                      value={calendarCategoryForm.order}
                      onChange={(e) => setCalendarCategoryForm({ ...calendarCategoryForm, order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-8">
                    <Checkbox
                      id="catActive"
                      checked={calendarCategoryForm.isActive}
                      onCheckedChange={(checked) => setCalendarCategoryForm({ ...calendarCategoryForm, isActive: !!checked })}
                    />
                    <Label htmlFor="catActive" className="cursor-pointer font-medium">Aktif</Label>
                  </div>
                </div>

                {/* Global Calendar Entries Section */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Label className="text-base font-semibold">Takvim Metinleri (Global)</Label>
                      <Input
                        type="date"
                        className="w-auto h-8 text-sm"
                        value={selectedGlobalCalendarDate}
                        onChange={(e) => setSelectedGlobalCalendarDate(e.target.value)}
                      />
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddGlobalCalendarEntry} className="gap-1">
                      <Plus className="w-3 h-3" /> Ekle
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {calendarCategoryForm.globalEntries && calendarCategoryForm.globalEntries.map((entry: any, index: number) => {
                      const entryDateStr = entry.date ? (typeof entry.date === 'string' ? entry.date.split('T')[0] : new Date(entry.date).toISOString().split('T')[0]) : '';
                      if (entryDateStr !== selectedGlobalCalendarDate) return null;

                      return (
                        <div key={index} className="p-3 border rounded-md bg-gray-50 relative group">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveGlobalCalendarEntry(index)}
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-500"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>

                          <div className="space-y-1">
                            <Label className="text-xs">Metin</Label>
                            <Textarea
                              className="text-xs min-h-[60px]"
                              placeholder="Bu başlık için seçili tarihte gösterilecek metin..."
                              value={entry.content || ''}
                              onChange={(e) => handleGlobalCalendarEntryChange(index, 'content', e.target.value)}
                            />
                          </div>
                        </div>
                      )
                    })}
                    {(!calendarCategoryForm.globalEntries || calendarCategoryForm.globalEntries.filter((e: any) => {
                      const eDateStr = e.date ? (typeof e.date === 'string' ? e.date.split('T')[0] : new Date(e.date).toISOString().split('T')[0]) : '';
                      return eDateStr === selectedGlobalCalendarDate;
                    }).length === 0) && (
                        <p className="text-xs text-gray-500 text-center py-2">Bu tarih için henüz metin eklenmedi.</p>
                      )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCalendarCategoryModal(false)}>
                  Vazgeç
                </Button>
                <Button onClick={handleSaveCalendarCategory} disabled={savingSettings}>
                  {savingSettings && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingItem ? 'Güncelle' : 'Ekle'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Walls Section */}
          {activeSection === 'walls' && (
            <div>
              <div className="sticky top-0 z-30 bg-gray-50/95 py-5 mb-6 flex items-center justify-between border-b border-gray-200 shadow-sm flex-col md:flex-row gap-4 md:gap-0 -mx-8 -mt-8 px-8 backdrop-blur-sm">
                <h2 className="text-2xl font-bold">Duvar Yönetimi</h2>
                <Button onClick={openAddWall} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Yeni Ana Duvar
                </Button>
              </div>

              {/* Search Input and Status Filter */}
              <div className="mb-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="relative max-w-md w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Duvar ara..."
                    value={wallSearch}
                    onChange={(e) => setWallSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex items-center space-x-4 bg-gray-50/50 p-1.5 rounded-lg border border-gray-200">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="wallStatus" 
                      className="form-radio text-blue-600 focus:ring-blue-500" 
                      checked={wallStatusFilter === 'all'} 
                      onChange={() => setWallStatusFilter('all')} 
                    />
                    <span className="text-sm font-medium text-gray-700">Tüm Duvarlar</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer pr-2">
                    <input 
                      type="radio" 
                      name="wallStatus" 
                      className="form-radio text-rose-600 focus:ring-rose-500" 
                      checked={wallStatusFilter === 'passive'} 
                      onChange={() => setWallStatusFilter('passive')} 
                    />
                    <span className="text-sm font-medium text-gray-700">Pasif Duvarlar</span>
                  </label>
                </div>
              </div>

              {/* Hierarchical Walls Display */}
              <div className="space-y-4">
                {(() => {
                  // Get root categories
                  let rootWalls = walls.filter(w => !w.parentId)
                  const currentUserId = userId || (session?.user as any)?.id
                  const managedCats = new Set<string>()
                  walls.forEach(w => {
                    if (w.wallManagers?.some((m: any) => m.id === currentUserId)) {
                      managedCats.add(w.id)
                    }
                  })
                  // If they manage a child but not the parent, the child acts as a root
                  if (role === 'WALL_MANAGER') {
                    rootWalls = walls.filter(w =>
                      (w.wallManagers?.some((m: any) => m.id === currentUserId)) &&
                      (!w.parentId || !managedCats.has(w.parentId))
                    )
                  }

                  // Check if a wall or its descendants match the status filter
                  const matchesStatus = (wall: any): boolean => {
                    if (wallStatusFilter === 'all') return true
                    const now = new Date()
                    const isPassive = wall.isActive === false || (wall.expirationDate && new Date(wall.expirationDate) < now)
                    if (isPassive) return true
                    if (wall.children?.some((c: any) => matchesStatus(c))) return true
                    return false
                  }

                  // Filter by search (recursive)
                  const matchesSearch = (wall: any, searchTerm: string): boolean => {
                    if (!matchesStatus(wall)) return false

                    if (!searchTerm.trim()) return true
                    const searchLower = searchTerm.toLowerCase()
                    if (
                      wall.name?.toLowerCase().includes(searchLower) ||
                      wall.description?.toLowerCase().includes(searchLower) ||
                      wall.wallManagers?.some((m: any) => m.name?.toLowerCase().includes(searchLower))
                    ) {
                      return true
                    }
                    if (wall.children?.some((c: any) => matchesSearch(c, searchTerm))) {
                      return true
                    }
                    return false
                  }

                  const filterWalls = (wallList: any[], searchTerm: string): any[] => {
                    return wallList.filter(w => matchesSearch(w, searchTerm))
                  }

                  const filteredRootWalls = filterWalls(rootWalls, wallSearch).sort((a, b) => {
                    if (a.name === 'Ana Duvar') return -1;
                    if (b.name === 'Ana Duvar') return 1;
                    if (a.order !== undefined && b.order !== undefined && a.order !== b.order) {
                      return a.order - b.order;
                    }
                    return a.name.localeCompare(b.name);
                  });

                  const toggleWall = (wallId: string) => {
                    setExpandedWalls((prev) => {
                      const newSet = new Set(prev)
                      if (newSet.has(wallId)) {
                        newSet.delete(wallId)
                      } else {
                        newSet.add(wallId)
                      }
                      return newSet
                    })
                  }

                  // Recursive function to get total posts including all children
                  const getTotalPosts = (wall: any): number => {
                    let total = wall._count?.postits ?? 0
                    if (wall.children) {
                      wall.children.forEach((child: any) => {
                        total += getTotalPosts(child)
                      })
                    }
                    return total
                  }

                  // Recursive function to count all subcategories
                  const countAllChildren = (wall: any): number => {
                    let count = wall.children?.length ?? 0
                    if (wall.children) {
                      wall.children.forEach((child: any) => {
                        count += countAllChildren(child)
                      })
                    }
                    return count
                  }

                  // Toggle Wall Privacy Lock
                  const handleTogglePrivacy = async (wallId: string, currentStatus: boolean, e: React.MouseEvent) => {
                    e.stopPropagation(); // Prevent the wall folder from expanding
                    try {
                      const response = await fetch(`/api/categories/${wallId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ isPrivate: !currentStatus })
                      });
                      if (!response.ok) throw new Error('Güncelleme başarısız');
                      loadData();
                      toast.success(`Gizlilik ayarı ${!currentStatus ? 'Özel' : 'Açık'} olarak güncellendi.`);
                    } catch(err) {
                      toast.error('Hata oluştu');
                    }
                  };

                  // Recursive render function for walls
                  const renderWall = (wall: any, level: number = 0) => {
                    const filteredChildren = wall.children ? wall.children.filter((c: any) => matchesSearch(c, wallSearch)) : []
                    const isExpanded = expandedWalls.has(wall.id) || wallSearch.trim() !== '' || wallStatusFilter === 'passive'
                    const hasChildren = filteredChildren.length > 0
                    const totalPosts = getTotalPosts(wall)
                    const totalSubcategories = countAllChildren(wall)
                    const isRoot = level === 0
                    const indent = level * 24

                    return (
                      <div key={wall.id} className={isRoot ? 'bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-3' : ''}>
                        <div
                          className={`flex items-center justify-between p-3 hover:bg-blue-50/50 transition-colors ${!isRoot ? 'border-l-[3px] border-blue-100 ml-1 mt-1' : 'bg-gray-50 border-b border-gray-100'}`}
                          style={{ paddingLeft: isRoot ? 16 : indent + 16 }}
                        >
                          <button
                            onClick={() => toggleWall(wall.id)}
                            className="flex items-center gap-2 flex-1 text-left"
                          >
                            {hasChildren ? (
                              isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
                              )
                            ) : (
                              <div className="w-4 h-4 flex-shrink-0" />
                            )}
                            <div className="min-w-0">
                              <span className={`font-medium flex items-center gap-2 ${isRoot ? 'text-lg' : 'text-base'}`}>
                                <span>{!isRoot && '↳ '}{wall.icon && <span className="mr-1 hidden sm:inline-block">{wall.icon}</span>}{wall.name}</span>
                                {wall.name !== 'Ana Duvar' && (
                                  <div className="flex items-center gap-1">
                                    <span className={`text-[10px] inline-block px-2 py-0.5 rounded-full font-semibold leading-tight ${wall.isActive !== false && (!wall.expirationDate || new Date(wall.expirationDate) >= new Date()) ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-rose-100 text-rose-700 border border-rose-200'}`}>
                                      {wall.isActive !== false && (!wall.expirationDate || new Date(wall.expirationDate) >= new Date()) ? '🟢 Aktif' : '🔴 Pasif'}
                                    </span>
                                    <button 
                                      onClick={(e) => handleTogglePrivacy(wall.id, wall.isPrivate, e)}
                                      title={wall.isPrivate ? "Özel Duvar (Liste Dışı) - Herkese açık yapmak için tıklayın" : "Herkese Açık Duvar - Özel yapmak için tıklayın"}
                                      className={`text-[10px] inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold leading-tight border transition-colors ${wall.isPrivate ? 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'}`}
                                    >
                                      {wall.isPrivate ? '🔒 Özel' : '🔓 Açık'}
                                    </button>
                                  </div>
                                )}
                              </span>
                              {wall.description && (
                                <p className="text-xs text-gray-500 truncate">{wall.description}</p>
                              )}
                              {(wall.city || wall.district) && (
                                <p className="text-xs text-blue-500 mt-0.5 mt-0.5 opacity-80 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {wall.city?.name} {wall.district ? `/ ${wall.district.name}` : ''}
                                </p>
                              )}
                            </div>
                          </button>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {wall.wallManager && (
                              <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 hidden md:inline">
                                {wall.wallManager.name}
                              </span>
                            )}
                            <span className="text-xs text-gray-500">{totalPosts} not</span>
                            {hasChildren && (
                              <span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700">
                                {totalSubcategories} alt
                              </span>
                            )}
                            <div className="flex gap-0.5">
                              {wall.name !== 'Ana Duvar' && (
                                <>
                                  <Button variant="ghost" size="sm" onClick={(e) => handleMoveWallUp(wall, e)} title="Yukarı Taşı" className="h-7 w-7 p-0">
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={(e) => handleMoveWallDown(wall, e)} title="Aşağı Taşı" className="h-7 w-7 p-0">
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </Button>
                                </>
                              )}
                              <Button variant="ghost" size="sm" onClick={() => openAddSubcategory(wall)} title="Alt Kategori Ekle" className="h-7 w-7 p-0">
                                <Plus className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => openEditWall(wall)} title="Düzenle" className="h-7 w-7 p-0">
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              {wall.name !== 'Ana Duvar' && (
                                <Button variant="ghost" size="sm" onClick={() => openMoveWallModal(wall)} title="Başka Duvara Taşı" className="h-7 w-7 p-0">
                                  <MoveRight className="w-3.5 h-3.5 text-blue-600" />
                                </Button>
                              )}
                              {wall.name !== 'Ana Duvar' && (
                                <Button variant="ghost" size="sm" onClick={() => openCopyWallModal(wall)} title="Duvarı Kopyala" className="h-7 w-7 p-0">
                                  <Copy className="w-3.5 h-3.5 text-green-600" />
                                </Button>
                              )}
                              {wall.name !== 'Ana Duvar' && !wall.isSystem && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteWall(wall.id)}
                                  className="hover:bg-red-100 hover:text-red-600 h-7 w-7 p-0"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Children (Recursive) */}
                        {isExpanded && hasChildren && (
                          <div className={isRoot ? 'border-t bg-gray-50' : 'bg-gray-50/50'}>
                            {filteredChildren
                              .sort((a: any, b: any) => (undefined !== a.order && undefined !== b.order ? a.order - b.order : 0) || a.name.localeCompare(b.name))
                              .map((child: any) => renderWall(child, level + 1))}
                          </div>
                        )}

                        {/* Show message if expanded but no children */}
                        {isExpanded && !hasChildren && (
                          <div
                            className="py-2 text-center text-gray-500 text-xs bg-gray-50"
                            style={{ paddingLeft: indent + 40 }}
                          >
                            Alt kategori yok. <button onClick={() => openAddSubcategory(wall)} className="text-blue-600 hover:underline">Ekle</button>
                          </div>
                        )}
                      </div>
                    )
                  }

                  if (filteredRootWalls.length === 0) {
                    return (
                      <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
                        {wallSearch ? 'Arama sonucu bulunamadı' : 'Henüz duvar yok'}
                      </div>
                    )
                  }

                  return filteredRootWalls.map((wall) => renderWall(wall, 0))
                })()}
              </div>
            </div>
          )}

          {/* Locations Section */}
          {
            activeSection === 'locations' && (
              <div>
                <div className="sticky top-0 z-30 bg-gray-50 py-5 mb-6 flex items-center justify-between border-b border-gray-200 shadow-sm -mx-8 -mt-8 px-8">
                  <h2 className="text-2xl font-bold text-gray-800">İl İlçe Tanımlama</h2>
                  <div className="flex gap-2">
                    <Button onClick={() => openAddLocation('CITY')} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                      <Plus className="w-4 h-4" />
                      Yeni İl Ekle
                    </Button>
                    <Button onClick={() => openAddLocation('DISTRICT')} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                      <Plus className="w-4 h-4" />
                      Yeni İlçe Ekle
                    </Button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden p-6">
                  {/* Location list grouped by City */}
                  <div className="space-y-6">
                    {cities.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        Henüz hiç il tanımlanmamış.
                      </div>
                    ) : (
                      cities.map((city) => {
                        const isExpanded = expandedCities.has(city.id)
                        return (
                          <div key={city.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <div
                              className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-5 py-4 flex items-center justify-between border-b border-gray-800 cursor-pointer hover:from-gray-800 hover:to-gray-700 transition-colors"
                              onClick={() => {
                                setExpandedCities(prev => {
                                  const newSet = new Set(prev)
                                  if (newSet.has(city.id)) newSet.delete(city.id)
                                  else newSet.add(city.id)
                                  return newSet
                                })
                              }}
                            >
                              <div className="flex items-center gap-3">
                                {isExpanded ? (
                                  <ChevronDown className="w-5 h-5 text-gray-300" />
                                ) : (
                                  <ChevronRight className="w-5 h-5 text-gray-300" />
                                )}
                                <h3 className="font-semibold text-lg">{city.name}</h3>
                                <span className="text-xs bg-gray-700/50 text-gray-300 px-2.5 py-1 rounded-full border border-gray-600">
                                  {(city._count?.districts) || 0} ilçe
                                </span>
                                
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleToggleWeather(city); }}
                                  className={`text-xs ml-auto px-2.5 py-1.5 rounded-full border flex items-center gap-1.5 transition-colors focus:ring-2 focus:outline-none ${city.showInWeather ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 hover:bg-blue-500/40 focus:ring-blue-400' : 'bg-gray-800 text-gray-400 border-gray-600 hover:bg-gray-700 hover:text-gray-200 focus:ring-gray-500'}`}
                                  title={city.showInWeather ? "Hava Durumunda Gösteriliyor (Kapatmak için tıkla)" : "Hava Durumunda Göstermek için tıkla"}
                                >
                                  {city.showInWeather ? <Cloud className="w-3.5 h-3.5" /> : <CloudOff className="w-3.5 h-3.5" />}
                                  {city.showInWeather ? 'Hava Aktif' : 'Hava Kapalı'}
                                </button>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => { e.stopPropagation(); openEditLocation(city, 'CITY'); }}
                                  className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10"
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => { e.stopPropagation(); handleDeleteLocation(city.id, 'CITY'); }}
                                  className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            {isExpanded && (
                              <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 bg-gray-50/50">
                                {districts.filter(d => d.cityId === city.id).map(district => (
                                  <div key={district.id} className="bg-white border rounded-lg p-2.5 flex items-center justify-between group hover:border-blue-300 hover:shadow-sm transition-all">
                                    <span className="text-sm font-medium text-gray-700">{district.name}</span>
                                    <div className="flex bg-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={(e) => { e.stopPropagation(); openEditLocation(district, 'DISTRICT'); }} className="text-gray-400 hover:text-blue-600 p-1">
                                        <Pencil className="w-3.5 h-3.5" />
                                      </button>
                                      <button onClick={(e) => { e.stopPropagation(); handleDeleteLocation(district.id, 'DISTRICT'); }} className="text-gray-400 hover:text-red-600 p-1">
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>
            )
          }

          {/* Sliders Section */}
          {
            activeSection === 'sliders' && (
              <div>
                <div className="sticky top-0 z-30 bg-gray-50/95 py-5 mb-6 flex items-start justify-between border-b border-gray-200 shadow-sm flex-col md:flex-row gap-4 md:gap-0 -mx-8 -mt-8 px-8 backdrop-blur-sm">
                  <div>
                    <h2 className="text-2xl font-bold">Kategori Slayder Yönetimi</h2>
                    <p className="text-sm text-gray-500">Kategori bazlı slayderlar artık ilgili kategorinin (duvarın) düzenleme sayfasından yönetilmektedir.</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-900">
                      <TableRow className="border-gray-800 hover:bg-gray-900">
                        <TableHead className="text-gray-300 font-semibold py-4 pl-6">Kategori</TableHead>
                        <TableHead className="text-gray-300 font-semibold">Resim Sayısı</TableHead>
                        <TableHead className="text-gray-300 font-semibold">Durum</TableHead>
                        <TableHead className="text-gray-300 font-semibold pr-6">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sliders.filter(s => s.categoryId).length > 0 ? (
                        sliders.filter(s => s.categoryId).map((slider) => (
                          <TableRow key={slider.id}>
                            <TableCell className="font-medium">{slider.category?.name}</TableCell>
                            <TableCell>{slider.images?.length || 0} resim</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs ${slider.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {slider.isActive ? 'Aktif' : 'Pasif'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="icon" onClick={() => openEditWall(slider.category)} title="Bu Duvarı Düzenle">
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteSlider(slider.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  title="Slayderı Sil"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                            {sliders.length > 0 ? 'Ana sayfa slayderları Ana Duvar ayarlarından yönetilmektedir.' : 'Henüz slayder eklenmemiş.'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )
          }

          {/* Roles Section */}
          {
            activeSection === 'roles' && (
              <div>
                <div className="sticky top-0 z-30 bg-gray-50/95 py-5 mb-6 flex items-center justify-between border-b border-gray-200 shadow-sm flex-col md:flex-row gap-4 md:gap-0 -mx-8 -mt-8 px-8 backdrop-blur-sm">
                  <h2 className="text-2xl font-bold">Yetki Türü Tanımla</h2>
                  <Button onClick={openAddRole} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Yeni Rol Ekle
                  </Button>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-900">
                      <TableRow className="border-gray-800 hover:bg-gray-900">
                        <TableHead className="text-gray-300 font-semibold py-4 pl-6">Rol Adı</TableHead>
                        <TableHead className="text-gray-300 font-semibold">Açıklama</TableHead>
                        <TableHead className="text-gray-300 font-semibold pr-6">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roles.map((role) => (
                        <TableRow key={role.id}>
                          <TableCell className="font-medium">{role.name}</TableCell>
                          <TableCell>{role.description}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditRole(role)}
                                className="h-8 w-8 p-0"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              {role.name === 'SUPER_ADMIN' ? (
                                <Button variant="ghost" size="sm" disabled className="h-8 w-8 p-0" title="Super Admin silinemez"><Trash2 className="w-4 h-4 opacity-20" /></Button>
                              ) : users.some(u => u.role === role.name) ? (
                                <Button variant="ghost" size="sm" disabled className="h-8 w-8 p-0" title="Bu rol kullanımda olduğu için silinemez"><Trash2 className="w-4 h-4 opacity-20" /></Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteRole(role.id)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  title="Rolü Sil"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {roles.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                            Henüz hiç rol tanımlanmamış.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )
          }

          {/* User Groups Section */}
          {
            activeSection === 'groups' && (
              <div>
                <div className="sticky top-0 z-30 bg-gray-50/95 py-5 mb-6 flex items-center justify-between border-b border-gray-200 shadow-sm flex-col md:flex-row gap-4 md:gap-0 -mx-8 -mt-8 px-8 backdrop-blur-sm">
                  <h2 className="text-2xl font-bold">Kullanıcı Grupları</h2>
                  <Button onClick={openAddUserGroup} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Yeni Grup
                  </Button>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-900">
                      <TableRow className="border-gray-800 hover:bg-gray-900">
                        <TableHead className="text-gray-300 font-semibold py-4 pl-6">Grup Adı</TableHead>
                        <TableHead className="text-gray-300 font-semibold">Açıklama</TableHead>
                        <TableHead className="text-gray-300 font-semibold">Kullanıcı Sayısı</TableHead>
                        <TableHead className="text-gray-300 font-semibold pr-6">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userGroups.length > 0 ? (
                        userGroups.map((group) => (
                          <TableRow key={group.id}>
                            <TableCell className="font-medium">{group.name}</TableCell>
                            <TableCell>{group.description || '-'}</TableCell>
                            <TableCell>
                              <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                {group._count?.users ?? 0} kullanıcı
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => openEditUserGroup(group)}>
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteUserGroup(group.id)}
                                  className="hover:bg-red-100 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                            Henüz hiç grup tanımlanmamış.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )
          }

          {/* Weather Order Section */}
          {
            activeSection === 'locations_weather' && (
              <div>
                <div className="sticky top-0 z-30 bg-gray-50/95 py-5 mb-6 flex items-start justify-between border-b border-gray-200 shadow-sm flex-col md:flex-row gap-4 md:gap-0 -mx-8 -mt-8 px-8 backdrop-blur-sm">
                  <div>
                    <h2 className="text-2xl font-bold">Hava Durumu Şehir Sıralaması</h2>
                    <p className="text-sm text-gray-500">Hava durumu sayfasında gösterilecek illerin sırasını buradan belirleyebilirsiniz.</p>
                  </div>
                  <Button onClick={async () => {
                      try {
                        const orderedCityIds = cities.filter(c => c.showInWeather).sort((a,b) => (a.weatherOrder || 0) - (b.weatherOrder || 0)).map(c => c.id);
                        const res = await fetch('/api/locations/weather-order', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ orderedCityIds })
                        });
                        if (res.ok) {
                          toast.success('Sıralama başarıyla kaydedildi!');
                        } else {
                          toast.error('Sıralama kaydedilemedi.');
                        }
                      } catch (err) {
                        toast.error('Sıralama kaydedilirken bir hata oluştu.');
                      }
                    }} 
                    className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-md">
                    <Save className="w-4 h-4" /> Sıralamayı Kaydet
                  </Button>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-900">
                      <TableRow className="border-gray-800 hover:bg-gray-900">
                        <TableHead className="text-gray-300 font-semibold py-4 pl-6 w-24">Sıra</TableHead>
                        <TableHead className="text-gray-300 font-semibold">Şehir Adı</TableHead>
                        <TableHead className="text-gray-300 font-semibold pr-6 w-32 text-right">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cities.filter(c => c.showInWeather).sort((a,b) => (a.weatherOrder || 0) - (b.weatherOrder || 0)).map((city, index, filteredCities) => (
                        <TableRow key={city.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium pl-6 text-gray-500">{index + 1}</TableCell>
                          <TableCell className="font-semibold text-gray-800">{city.name}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={index === 0}
                                onClick={() => {
                                  // move up
                                  const showCities = [...filteredCities];
                                  const temp = showCities[index - 1];
                                  showCities[index - 1] = showCities[index];
                                  showCities[index] = temp;
                                  showCities.forEach((sc, idx) => { sc.weatherOrder = idx; });

                                  const updatedCities = [...cities];
                                  showCities.forEach(sc => {
                                     const idx = updatedCities.findIndex(c => c.id === sc.id);
                                     if (idx !== -1) updatedCities[idx] = sc;
                                  });
                                  setCities(updatedCities);
                                }}
                                className="h-8 w-8 p-0"
                                title="Yukarı Taşı"
                              >
                                <ArrowUp className="w-4 h-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={index === filteredCities.length - 1}
                                onClick={() => {
                                  // move down
                                  const showCities = [...filteredCities];
                                  const temp = showCities[index + 1];
                                  showCities[index + 1] = showCities[index];
                                  showCities[index] = temp;
                                  showCities.forEach((sc, idx) => { sc.weatherOrder = idx; });

                                  const updatedCities = [...cities];
                                  showCities.forEach(sc => {
                                     const idx = updatedCities.findIndex(c => c.id === sc.id);
                                     if (idx !== -1) updatedCities[idx] = sc;
                                  });
                                  setCities(updatedCities);
                                }}
                                className="h-8 w-8 p-0"
                                title="Aşağı Taşı"
                              >
                                <ArrowDown className="w-4 h-4 text-blue-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {cities.filter(c => c.showInWeather).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                            Hava durumu sayfasında gösterilecek aktif bir il bulunmuyor.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )
          }

          {/* Users Section */}
          {
            activeSection === 'users' && (
              <div>
                <div className="sticky top-0 z-30 bg-gray-50/95 py-5 mb-6 border-b border-gray-200 shadow-sm flex-col gap-4 -mx-8 -mt-8 px-8 backdrop-blur-sm">
                  <div className="flex items-center justify-between w-full">
                    <h2 className="text-2xl font-bold">Kullanıcı Yönetimi</h2>
                    {userTab === 'kullanicilar' && (
                      <Button onClick={openAddUser} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Yeni Kullanıcı
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4 pb-2">
                    <Button variant={userTab === 'kullanicilar' ? 'default' : 'outline'} onClick={() => setUserTab('kullanicilar')}>Kullanıcılar</Button>
                    <Button variant={userTab === 'firmalar' ? 'default' : 'outline'} onClick={() => {
                        setUserTab('firmalar');
                        if (merchants.length === 0) {
                           fetch('/api/admin/merchant-applications').then(r => r.json()).then(data => { if (Array.isArray(data)) setMerchants(data) });
                        }
                    }}>Firma Kayıtları</Button>
                  </div>
                </div>

                {userTab === 'firmalar' ? (() => {
                  const filteredMerchants = merchants.filter(m => {
                    if (merchantFilter === 'verified') return m.emailVerified !== null;
                    if (merchantFilter === 'pending') return m.emailVerified === null;
                    return true;
                  });

                  return (
                    <div className="space-y-4">
                      <div className="flex gap-6 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                        <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium hover:text-blue-600 transition-colors">
                          <input type="radio" value="all" className="w-4 h-4 text-blue-600 focus:ring-blue-500" checked={merchantFilter === 'all'} onChange={() => setMerchantFilter('all')} />
                          Tümü ({merchants.length})
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium hover:text-green-600 transition-colors">
                          <input type="radio" value="verified" className="w-4 h-4 text-green-600 focus:ring-green-500" checked={merchantFilter === 'verified'} onChange={() => setMerchantFilter('verified')} />
                          Mail Onaylı ({merchants.filter(m => m.emailVerified !== null).length})
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium hover:text-yellow-600 transition-colors">
                          <input type="radio" value="pending" className="w-4 h-4 text-yellow-600 focus:ring-yellow-500" checked={merchantFilter === 'pending'} onChange={() => setMerchantFilter('pending')} />
                          Onay Bekleyen ({merchants.filter(m => m.emailVerified === null).length})
                        </label>
                      </div>

                      {merchants.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow-md border">Kayıtlı firma başvurusu bulunmuyor. Yükleniyor olabilir...</div>
                      ) : filteredMerchants.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow-md border">Bu kategoriye ait firma başvurusu bulunamadı.</div>
                      ) : (
                        <div className="bg-white rounded-lg shadow border overflow-hidden">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Firma Adı</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yetkili</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mail / Telefon</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vergi Numarası</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {filteredMerchants.map((m: any) => (
                              <tr key={m.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="font-medium text-gray-900">{m.storeName}</div>
                                  <div className="text-sm text-gray-500">{m.companyType === 'SOLE' ? 'Şahıs' : 'Ltd/A.Ş'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {m.contactFirstName} {m.contactLastName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {m.contactEmail}
                                  <br/>
                                  {m.contactPhone}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {m.taxId}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${m.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {m.status}
                                  </span>
                                  <div className="mt-1">
                                  {m.emailVerified ? (
                                    <span className="text-xs text-green-600 font-medium">✅ Mail Onaylı</span>
                                  ) : (
                                    <span className="text-xs text-red-500 font-medium">⏳ Onay Bekliyor</span>
                                  )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button onClick={() => openEditMerchant(m)} className="text-blue-600 hover:text-blue-900 mx-1">
                                    <Pencil className="w-4 h-4 inline" /> Düzenle
                                  </button>
                                  <button onClick={() => handleDeleteMerchant(m.id)} className="text-red-600 hover:text-red-900 mx-1 ml-3">
                                    <Trash2 className="w-4 h-4 inline" /> Sil
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );})() : (
                  <>

                <div className="mb-6">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="İsim veya email ile ara..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Group users by Role */}
                  {(() => {
                    // Filter users first
                    const filteredUsers = users.filter(user =>
                      user.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
                      user.email?.toLowerCase().includes(userSearch.toLowerCase())
                    )

                    // Get unique roles from users list + predefined ones to ensure order
                    const usersByRole: Record<string, any[]> = {}
                    filteredUsers.forEach(u => {
                      const r = u.role || 'USER'
                      if (!usersByRole[r]) usersByRole[r] = []
                      usersByRole[r].push(u)
                    })

                    const sortedRoles = Object.keys(usersByRole).sort()

                    if (filteredUsers.length === 0) {
                      return (
                        <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow-md">
                          Arama sonucu bulunamadı.
                        </div>
                      )
                    }

                    return sortedRoles.map(roleName => (
                      <div key={roleName} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <button
                          className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 border-b hover:bg-gray-100 transition-colors"
                          onClick={() => {
                            const el = document.getElementById(`role-content-${roleName}`)
                            if (el) el.classList.toggle('hidden')
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${roleName === 'SUPER_ADMIN' ? 'bg-red-100 text-red-700' :
                              roleName === 'WALL_MANAGER' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                              {roleName}
                            </span>
                            <span className="text-sm text-gray-500">({usersByRole[roleName].length} kullanıcı)</span>
                          </div>
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>

                        <div id={`role-content-${roleName}`} className="hidden">
                          <Table>
                            <TableHeader className="bg-gray-800">
                              <TableRow className="border-gray-700 hover:bg-gray-800">
                                <TableHead className="text-gray-200 font-semibold py-3 pl-6">Ad</TableHead>
                                <TableHead className="text-gray-200 font-semibold py-3">Email</TableHead>
                                <TableHead className="text-gray-200 font-semibold py-3">Yönetici Yetkileri</TableHead>
                                <TableHead className="text-gray-200 font-semibold py-3">Grup Üyelikleri</TableHead>
                                <TableHead className="text-gray-200 font-semibold py-3">Not Sayısı</TableHead>
                                <TableHead className="text-gray-200 font-semibold py-3 pr-6">İşlemler</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {usersByRole[roleName].map((user) => {
                                const managedWalls = walls.filter(w => w.wallManagers?.some((m: any) => m.id === user.id))
                                const isWallManagerUser = role === 'WALL_MANAGER';

                                return (
                                  <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                      {managedWalls.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                          {managedWalls.map(w => (
                                            <span key={w.id} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] rounded">
                                              {w.name}
                                            </span>
                                          ))}
                                        </div>
                                      ) : (
                                        <span className="text-gray-400">-</span>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      {user.userGroups && user.userGroups.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                          {user.userGroups.map((g: any) => (
                                            <span key={g.id} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] rounded">
                                              {g.name}
                                            </span>
                                          ))}
                                        </div>
                                      ) : (
                                        <span className="text-gray-400">-</span>
                                      )}
                                    </TableCell>
                                    <TableCell>{user._count?.postits ?? 0}</TableCell>
                                    <TableCell>
                                      <div className="flex gap-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => openEditUser(user)}
                                          className="h-8 w-8 p-0"
                                        >
                                          <Pencil className="w-4 h-4" />
                                        </Button>
                                        {user.email !== 'admin@panodasehir.com' && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        )}
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                )
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    ))
                  })()}
                </div>
                </>
                )}
              </div>
            )
          }

          {/* Post-its Section */}
          {
            activeSection === 'postits' && (
              <div>
                <div className="sticky top-0 z-30 bg-gray-50/95 py-5 mb-6 flex items-center justify-between border-b border-gray-200 shadow-sm flex-col md:flex-row gap-4 md:gap-0 -mx-8 -mt-8 px-8 backdrop-blur-sm">
                  <h2 className="text-2xl font-bold">Not Yönetimi</h2>
                </div>

                {/* Search and Filter */}
                <div className="mb-4 flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Not ara (içerik, kullanıcı veya kategori)..."
                      value={postitSearch}
                      onChange={(e) => setPostitSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-md border shadow-sm">
                    <Label className="font-semibold text-gray-700 mr-2">Durum:</Label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="postitStatusFilter"
                        value="pending"
                        checked={postitStatusFilter === 'pending'}
                        onChange={(e) => setPostitStatusFilter(e.target.value as any)}
                        className="accent-yellow-500"
                      />
                      <span className="text-sm">Beklemede</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="postitStatusFilter"
                        value="all"
                        checked={postitStatusFilter === 'all'}
                        onChange={(e) => setPostitStatusFilter(e.target.value as any)}
                        className="accent-gray-900"
                      />
                      <span className="text-sm">Tümü</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="postitStatusFilter"
                        value="published"
                        checked={postitStatusFilter === 'published'}
                        onChange={(e) => setPostitStatusFilter(e.target.value as any)}
                        className="accent-green-600"
                      />
                      <span className="text-sm">Yayında</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="postitStatusFilter"
                        value="unpublished"
                        checked={postitStatusFilter === 'unpublished'}
                        onChange={(e) => setPostitStatusFilter(e.target.value as any)}
                        className="accent-red-600"
                      />
                      <span className="text-sm">Yayında Değil</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="postitStatusFilter"
                        value="private"
                        checked={postitStatusFilter === 'private'}
                        onChange={(e) => setPostitStatusFilter(e.target.value as any)}
                        className="accent-indigo-500"
                      />
                      <span className="text-sm font-semibold text-indigo-700">Özel Notlar</span>
                    </label>
                  </div>
                </div>

                {/* Grouped by Category */}
                <div className="space-y-4">
                  {(() => {
                    // Filter postits by search and status
                    const filteredPostits = postits.filter((postit) => {
                      const isPrivate = postit.content?.startsWith('[ÖZEL MESAJ]');
                      
                      // If filter is explicitly 'private', ONLY show private messages
                      if (postitStatusFilter === 'private') {
                        if (!isPrivate) return false;
                      } else {
                        // Standard filters should hide private messages by default to avoid clutter
                        // unless admin specifically looks for them or is viewing 'all'
                        if (isPrivate && postitStatusFilter !== 'all') return false;
                        
                        const statusMatch =
                          postitStatusFilter === 'all' ? true :
                            postitStatusFilter === 'published' ? postit.isPublished :
                              postitStatusFilter === 'unpublished' ? (!postit.isPublished && !isPrivate) :
                                postitStatusFilter === 'pending' ? (!postit.isApproved && !isPrivate) : true;

                        if (!statusMatch) return false;
                      }

                      if (!postitSearch.trim()) return true
                      const searchLower = postitSearch.toLowerCase()
                      return (
                        postit.content?.toLowerCase().includes(searchLower) ||
                        postit.user?.name?.toLowerCase().includes(searchLower) ||
                        postit.category?.name?.toLowerCase().includes(searchLower)
                      )
                    })

                    // Group by category
                    // Build category hierarchy paths
                    const categoryPathMap: Record<string, string> = {}
                    const buildPathMap = (cats: any[], parentPath = '') => {
                      cats.forEach(c => {
                        const path = parentPath ? `${parentPath} > ${c.name}` : c.name
                        categoryPathMap[c.id] = path
                        if (c.children?.length) {
                          buildPathMap(c.children, path)
                        }
                      })
                    }
                    buildPathMap(walls)

                    // Group by hierarchical category
                    const groupedPostits: Record<string, { categoryName: string; categoryId: string; postits: any[] }> = {}

                    filteredPostits.forEach((postit) => {
                      const catId = postit.categoryId || 'uncategorized'
                      const catName = categoryPathMap[catId] || postit.category?.name || 'Kategorisiz'
                      if (!groupedPostits[catId]) {
                        groupedPostits[catId] = { categoryName: catName, categoryId: catId, postits: [] }
                      }
                      groupedPostits[catId].postits.push(postit)
                    })

                    const sortedGroups = Object.values(groupedPostits).sort((a, b) =>
                      a.categoryName.localeCompare(b.categoryName, 'tr')
                    )

                    const toggleCategory = (catId: string) => {
                      setExpandedCategories((prev) => {
                        const newSet = new Set(prev)
                        if (newSet.has(catId)) {
                          newSet.delete(catId)
                        } else {
                          newSet.add(catId)
                        }
                        return newSet
                      })
                    }

                    if (filteredPostits.length === 0) {
                      return (
                        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
                          {postitSearch ? 'Arama sonucu bulunamadı' : 'Henüz not yok'}
                        </div>
                      )
                    }

                    return sortedGroups.map((group) => {
                      const isExpanded = expandedCategories.has(group.categoryId)
                      const approvedCount = group.postits.filter(p => p.isApproved).length
                      const pendingCount = group.postits.filter(p => !p.isApproved).length

                      return (
                        <div key={group.categoryId} className="bg-white rounded-lg shadow-md overflow-hidden">
                          {/* Category Header */}
                          <button
                            onClick={() => toggleCategory(group.categoryId)}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {isExpanded ? (
                                <ChevronDown className="w-5 h-5 text-gray-500" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-gray-500" />
                              )}
                              <span className="font-semibold text-lg">{group.categoryName}</span>
                              <span className="text-sm text-gray-500">({group.postits.length} not)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {approvedCount > 0 && (
                                <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                                  {approvedCount} yayında
                                </span>
                              )}
                              {pendingCount > 0 && (
                                <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
                                  {pendingCount} beklemede
                                </span>
                              )}
                            </div>
                          </button>

                          {/* Postits Table */}
                          {isExpanded && (
                            <Table className="table-fixed w-full">
                              <TableHeader className="bg-gray-800">
                                <TableRow className="border-gray-700 hover:bg-gray-800">
                                  <TableHead className="w-[18%] text-gray-200 font-semibold py-3 pl-4">İçerik</TableHead>
                                  <TableHead className="w-[10%] text-gray-200 font-semibold py-3">Kullanıcı</TableHead>
                                  <TableHead className="w-[5%] text-gray-200 font-semibold py-3">Renk</TableHead>
                                  <TableHead className="w-[8%] text-center text-gray-200 font-semibold py-3">Beğeni</TableHead>
                                  <TableHead className="w-[8%] text-center text-gray-200 font-semibold py-3">Görünüm</TableHead>
                                  <TableHead className="w-[8%] text-center text-gray-200 font-semibold py-3">Yorum</TableHead>
                                  <TableHead className="w-[5%] text-center text-gray-200 font-semibold py-3">Onaylı</TableHead>
                                  <TableHead className="w-[5%] text-center text-gray-200 font-semibold py-3">Yayında</TableHead>
                                  <TableHead className="w-[8%] text-gray-200 font-semibold py-3">Kayıt</TableHead>
                                  <TableHead className="w-[8%] text-gray-200 font-semibold py-3">Bitiş</TableHead>
                                  <TableHead className="w-[17%] text-gray-200 font-semibold py-3 pr-4 sticky right-0 bg-gray-800 z-10 shadow-[-4px_0_10px_rgba(0,0,0,0.1)]">İşlemler</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {group.postits.map((postit) => (
                                  <TableRow key={postit.id}>
                                    <TableCell className="max-w-xs">
                                      <p className="truncate">{postit.content}</p>
                                      {postit.imageUrl && (
                                        <span className="text-xs text-blue-600">[Resim var]</span>
                                      )}
                                      {postit.link && (
                                        <span className="text-xs text-green-600 ml-1">[Link var]</span>
                                      )}
                                    </TableCell>
                                    <TableCell>{postit.user?.nickname || postit.user?.name || '-'}</TableCell>
                                    <TableCell>
                                      <span
                                        className={`inline-block w-6 h-6 rounded ${postit.color === 'YELLOW'
                                          ? 'bg-yellow-300'
                                          : postit.color === 'PINK'
                                            ? 'bg-pink-300'
                                            : postit.color === 'BLUE'
                                              ? 'bg-blue-300'
                                              : postit.color === 'GREEN'
                                                ? 'bg-green-300'
                                                : postit.color === 'ORANGE'
                                                  ? 'bg-orange-300'
                                                  : 'bg-purple-300'
                                          }`}
                                      />
                                    </TableCell>
                                    <TableCell className="text-center font-bold text-gray-700">
                                      {(postit as any)?._count?.likes || 0}
                                    </TableCell>
                                    <TableCell className="text-center font-bold text-gray-700">
                                      {(postit as any)?.views || 0}
                                    </TableCell>
                                    <TableCell className="text-center font-bold text-gray-700">
                                      {(postit as any)?.comments?.length || 0}
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <Checkbox
                                        checked={postit.isApproved}
                                        onCheckedChange={(checked) => handleToggleStatus(postit.id, 'isApproved', checked as boolean)}
                                        disabled={postit.content?.startsWith('[ÖZEL MESAJ]')}
                                        className="mx-auto"
                                      />
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <Checkbox
                                        checked={postit.isPublished}
                                        onCheckedChange={(checked) => handleToggleStatus(postit.id, 'isPublished', checked as boolean)}
                                        disabled={new Date(postit.expiresAt) < new Date() || postit.content?.startsWith('[ÖZEL MESAJ]')}
                                        className="mx-auto"
                                      />
                                    </TableCell>
                                    <TableCell>{new Date(postit.createdAt).toLocaleDateString('tr-TR')}</TableCell>
                                    <TableCell>{new Date(postit.expiresAt).toLocaleDateString('tr-TR')}</TableCell>
                                    <TableCell className="sticky right-0 bg-white z-10 border-l shadow-[-4px_0_10px_rgba(0,0,0,0.05)] align-top min-w-[140px]">
                                      <div className="flex flex-col gap-1 w-full pt-1 pb-1">
                                        <PostItCard
                                          id={postit.id}
                                          content={postit.content}
                                          imageUrl={postit.imageUrl}
                                          images={postit.PostItImage?.map((img: any) => img.url) || []}
                                          link={postit.link}
                                          color={postit.color || 'YELLOW'}
                                          font={postit.font || 'HANDWRITING'}
                                          pushpin={postit.pushpin || 'RED'}
                                          rotation={postit.rotation || 0}
                                          userName={postit.user?.nickname || postit.user?.name || 'Anonim'}
                                          categoryName={group.categoryName || 'Genel'}
                                          createdAt={new Date(postit.createdAt)}
                                          comments={postit.comments || []}
                                          initialLikesCount={(postit as any)?._count?.likes || 0}
                                          initialViewsCount={postit.views || 0}
                                          canDelete={((session?.user as any)?.role === 'SUPER_ADMIN')}
                                          currentUserId={(session?.user as any)?.id}
                                          onDelete={(id) => handleDeletePostit(id)}
                                          triggerComponent={
                                            <Button variant="ghost" size="sm" title="Notu İncele" className="w-full justify-start text-green-600 hover:text-green-700 hover:bg-green-50">
                                              <Eye className="w-4 h-4 mr-2" /> İncele
                                            </Button>
                                          }
                                        />
                                        <div className="flex w-full gap-1">
                                          <Button variant="ghost" size="sm" onClick={(e) => handleMovePostit(e, postit.id, 'up', group.postits)} className="flex-1 justify-center text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-0" title="Yukarı Taşı">
                                            <ArrowUp className="w-4 h-4" />
                                          </Button>
                                          <Button variant="ghost" size="sm" onClick={(e) => handleMovePostit(e, postit.id, 'down', group.postits)} className="flex-1 justify-center text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-0" title="Aşağı Taşı">
                                            <ArrowDown className="w-4 h-4" />
                                          </Button>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => openEditPostit(postit)} className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                          <Pencil className="w-4 h-4 mr-2" /> Düzenle
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => openMovePostitModal(postit)} className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                          <MoveRight className="w-4 h-4 mr-2" /> Kategorisini Değiştir
                                        </Button>
                                        {((session?.user as any)?.role === 'SUPER_ADMIN') && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeletePostit(postit.id)}
                                            className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                                          >
                                            <Trash2 className="w-4 h-4 mr-2" /> Sil
                                          </Button>
                                        )}
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => openStatsModal(postit.id)}
                                          className="w-full justify-start text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
                                        >
                                          <BarChart className="w-4 h-4 mr-2" /> İstatistikler
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          )}
                        </div>
                      )
                    })
                  })()}
                </div>
              </div>
            )
          }

          {/* User Post-its Section */}
          {
            activeSection === 'user_postits' && (
              <div>
                <div className="sticky top-0 z-30 bg-gray-50/95 py-5 mb-6 flex items-center justify-between border-b border-gray-200 shadow-sm flex-col md:flex-row gap-4 md:gap-0 -mx-8 -mt-8 px-8 backdrop-blur-sm">
                  <h2 className="text-2xl font-bold">Kullanıcı Bazında Notlar</h2>
                </div>

                {/* Search and Filter */}
                <div className="mb-4 flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Not ara (içerik, kullanıcı veya kategori)..."
                      value={postitSearch}
                      onChange={(e) => setPostitSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-md border shadow-sm">
                    <Label className="font-semibold text-gray-700 mr-2">Durum:</Label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="postitStatusFilter"
                        value="pending"
                        checked={postitStatusFilter === 'pending'}
                        onChange={(e) => setPostitStatusFilter(e.target.value as any)}
                        className="accent-yellow-500"
                      />
                      <span className="text-sm">Beklemede</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="postitStatusFilter"
                        value="all"
                        checked={postitStatusFilter === 'all'}
                        onChange={(e) => setPostitStatusFilter(e.target.value as any)}
                        className="accent-gray-900"
                      />
                      <span className="text-sm">Tümü</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="postitStatusFilter"
                        value="published"
                        checked={postitStatusFilter === 'published'}
                        onChange={(e) => setPostitStatusFilter(e.target.value as any)}
                        className="accent-green-600"
                      />
                      <span className="text-sm">Yayında</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="postitStatusFilter"
                        value="unpublished"
                        checked={postitStatusFilter === 'unpublished'}
                        onChange={(e) => setPostitStatusFilter(e.target.value as any)}
                        className="accent-red-600"
                      />
                      <span className="text-sm">Yayında Değil</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="postitStatusFilter"
                        value="private"
                        checked={postitStatusFilter === 'private'}
                        onChange={(e) => setPostitStatusFilter(e.target.value as any)}
                        className="accent-indigo-500"
                      />
                      <span className="text-sm font-semibold text-indigo-700">Özel Notlar</span>
                    </label>
                  </div>
                </div>

                {/* Grouped by Category */}
                <div className="space-y-4">
                  {(() => {
                    // Filter postits by search and status
                    const filteredPostits = postits.filter((postit) => {
                      const isPrivate = postit.content?.startsWith('[ÖZEL MESAJ]');
                      
                      // If filter is explicitly 'private', ONLY show private messages
                      if (postitStatusFilter === 'private') {
                        if (!isPrivate) return false;
                      } else {
                        // Standard filters should hide private messages by default to avoid clutter
                        // unless admin specifically looks for them or is viewing 'all'
                        if (isPrivate && postitStatusFilter !== 'all') return false;
                        
                        const statusMatch =
                          postitStatusFilter === 'all' ? true :
                            postitStatusFilter === 'published' ? postit.isPublished :
                              postitStatusFilter === 'unpublished' ? (!postit.isPublished && !isPrivate) :
                                postitStatusFilter === 'pending' ? (!postit.isApproved && !isPrivate) : true;

                        if (!statusMatch) return false;
                      }

                      if (!postitSearch.trim()) return true
                      const searchLower = postitSearch.toLowerCase()
                      return (
                        postit.content?.toLowerCase().includes(searchLower) ||
                        postit.user?.name?.toLowerCase().includes(searchLower) ||
                        postit.category?.name?.toLowerCase().includes(searchLower)
                      )
                    })

                    // Group by category
                    // Build category hierarchy paths
                    const categoryPathMap: Record<string, string> = {}
                    const buildPathMap = (cats: any[], parentPath = '') => {
                      cats.forEach(c => {
                        const path = parentPath ? `${parentPath} > ${c.name}` : c.name
                        categoryPathMap[c.id] = path
                        if (c.children?.length) {
                          buildPathMap(c.children, path)
                        }
                      })
                    }
                    buildPathMap(walls)

                    // Group by user
                    const groupedPostits: Record<string, { categoryName: string; categoryId: string; postits: any[] }> = {}

                    filteredPostits.forEach((postit) => {
                      const userId = postit.userId || 'anonymous'
                      
                      // Try to find full user object from state, fallback to postit.user
                      const u = users.find(userObj => userObj.id === userId) || postit.user || {}
                      
                      const name = u.name || ''
                      const nickname = u.nickname ? `(${u.nickname})` : ''
                      const email = u.email || ''
                      
                      const nameParts = [name, nickname, email].filter(Boolean)
                      const userNameStr = nameParts.length > 0 ? nameParts.join(' - ') : 'Anonim'

                      if (!groupedPostits[userId]) {
                        groupedPostits[userId] = { categoryName: userNameStr, categoryId: userId, postits: [] }
                      }
                      groupedPostits[userId].postits.push(postit)
                    })

                    const sortedGroups = Object.values(groupedPostits).sort((a, b) =>
                      a.categoryName.localeCompare(b.categoryName, 'tr')
                    )

                    const toggleCategory = (catId: string) => {
                      setExpandedCategories((prev) => {
                        const newSet = new Set(prev)
                        if (newSet.has(catId)) {
                          newSet.delete(catId)
                        } else {
                          newSet.add(catId)
                        }
                        return newSet
                      })
                    }

                    if (filteredPostits.length === 0) {
                      return (
                        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
                          {postitSearch ? 'Arama sonucu bulunamadı' : 'Henüz not yok'}
                        </div>
                      )
                    }

                    return sortedGroups.map((group) => {
                      const isExpanded = expandedCategories.has(group.categoryId)
                      const approvedCount = group.postits.filter(p => p.isApproved).length
                      const pendingCount = group.postits.filter(p => !p.isApproved).length

                      return (
                        <div key={group.categoryId} className="bg-white rounded-lg shadow-md overflow-hidden">
                          {/* Category Header */}
                          <button
                            onClick={() => toggleCategory(group.categoryId)}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {isExpanded ? (
                                <ChevronDown className="w-5 h-5 text-gray-500" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-gray-500" />
                              )}
                              <span className="font-semibold text-lg">{group.categoryName}</span>
                              <span className="text-sm text-gray-500">({group.postits.length} not)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {approvedCount > 0 && (
                                <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                                  {approvedCount} yayında
                                </span>
                              )}
                              {pendingCount > 0 && (
                                <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
                                  {pendingCount} beklemede
                                </span>
                              )}
                            </div>
                          </button>

                          {/* Postits Table */}
                          {isExpanded && (
                            <Table className="table-fixed w-full">
                              <TableHeader className="bg-gray-800">
                                <TableRow className="border-gray-700 hover:bg-gray-800">
                                  <TableHead className="w-[18%] text-gray-200 font-semibold py-3 pl-4">İçerik</TableHead>
                                  <TableHead className="w-[10%] text-gray-200 font-semibold py-3">Kullanıcı</TableHead>
                                  <TableHead className="w-[5%] text-gray-200 font-semibold py-3">Renk</TableHead>
                                  <TableHead className="w-[8%] text-center text-gray-200 font-semibold py-3">Beğeni</TableHead>
                                  <TableHead className="w-[8%] text-center text-gray-200 font-semibold py-3">Görünüm</TableHead>
                                  <TableHead className="w-[8%] text-center text-gray-200 font-semibold py-3">Yorum</TableHead>
                                  <TableHead className="w-[5%] text-center text-gray-200 font-semibold py-3">Onaylı</TableHead>
                                  <TableHead className="w-[5%] text-center text-gray-200 font-semibold py-3">Yayında</TableHead>
                                  <TableHead className="w-[8%] text-gray-200 font-semibold py-3">Kayıt</TableHead>
                                  <TableHead className="w-[8%] text-gray-200 font-semibold py-3">Bitiş</TableHead>
                                  <TableHead className="w-[17%] text-gray-200 font-semibold py-3 pr-4 sticky right-0 bg-gray-800 z-10 shadow-[-4px_0_10px_rgba(0,0,0,0.1)]">İşlemler</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {group.postits.map((postit) => (
                                  <TableRow key={postit.id}>
                                    <TableCell className="max-w-xs">
                                      <p className="truncate">{postit.content}</p>
                                      {postit.imageUrl && (
                                        <span className="text-xs text-blue-600">[Resim var]</span>
                                      )}
                                      {postit.link && (
                                        <span className="text-xs text-green-600 ml-1">[Link var]</span>
                                      )}
                                    </TableCell>
                                    <TableCell>{postit.user?.nickname || postit.user?.name || '-'}</TableCell>
                                    <TableCell>
                                      <span
                                        className={`inline-block w-6 h-6 rounded ${postit.color === 'YELLOW'
                                          ? 'bg-yellow-300'
                                          : postit.color === 'PINK'
                                            ? 'bg-pink-300'
                                            : postit.color === 'BLUE'
                                              ? 'bg-blue-300'
                                              : postit.color === 'GREEN'
                                                ? 'bg-green-300'
                                                : postit.color === 'ORANGE'
                                                  ? 'bg-orange-300'
                                                  : 'bg-purple-300'
                                          }`}
                                      />
                                    </TableCell>
                                    <TableCell className="text-center font-bold text-gray-700">
                                      {(postit as any)?._count?.likes || 0}
                                    </TableCell>
                                    <TableCell className="text-center font-bold text-gray-700">
                                      {(postit as any)?.views || 0}
                                    </TableCell>
                                    <TableCell className="text-center font-bold text-gray-700">
                                      {(postit as any)?.comments?.length || 0}
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <Checkbox
                                        checked={postit.isApproved}
                                        onCheckedChange={(checked) => handleToggleStatus(postit.id, 'isApproved', checked as boolean)}
                                        disabled={postit.content?.startsWith('[ÖZEL MESAJ]')}
                                        className="mx-auto"
                                      />
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <Checkbox
                                        checked={postit.isPublished}
                                        onCheckedChange={(checked) => handleToggleStatus(postit.id, 'isPublished', checked as boolean)}
                                        disabled={new Date(postit.expiresAt) < new Date() || postit.content?.startsWith('[ÖZEL MESAJ]')}
                                        className="mx-auto"
                                      />
                                    </TableCell>
                                    <TableCell>{new Date(postit.createdAt).toLocaleDateString('tr-TR')}</TableCell>
                                    <TableCell>{new Date(postit.expiresAt).toLocaleDateString('tr-TR')}</TableCell>
                                    <TableCell className="sticky right-0 bg-white z-10 border-l shadow-[-4px_0_10px_rgba(0,0,0,0.05)] align-top min-w-[140px]">
                                      <div className="flex flex-col gap-1 w-full pt-1 pb-1">
                                        <PostItCard
                                          id={postit.id}
                                          content={postit.content}
                                          imageUrl={postit.imageUrl}
                                          images={postit.PostItImage?.map((img: any) => img.url) || []}
                                          link={postit.link}
                                          color={postit.color || 'YELLOW'}
                                          font={postit.font || 'HANDWRITING'}
                                          pushpin={postit.pushpin || 'RED'}
                                          rotation={postit.rotation || 0}
                                          userName={postit.user?.nickname || postit.user?.name || 'Anonim'}
                                          categoryName={group.categoryName || 'Genel'}
                                          createdAt={new Date(postit.createdAt)}
                                          comments={postit.comments || []}
                                          initialLikesCount={(postit as any)?._count?.likes || 0}
                                          initialViewsCount={postit.views || 0}
                                          canDelete={((session?.user as any)?.role === 'SUPER_ADMIN')}
                                          currentUserId={(session?.user as any)?.id}
                                          onDelete={(id) => handleDeletePostit(id)}
                                          triggerComponent={
                                            <Button variant="ghost" size="sm" title="Notu İncele" className="w-full justify-start text-green-600 hover:text-green-700 hover:bg-green-50">
                                              <Eye className="w-4 h-4 mr-2" /> İncele
                                            </Button>
                                          }
                                        />
                                        <Button variant="ghost" size="sm" onClick={() => openEditPostit(postit)} className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                          <Pencil className="w-4 h-4 mr-2" /> Düzenle
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => openMovePostitModal(postit)} className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                          <MoveRight className="w-4 h-4 mr-2" /> Taşı
                                        </Button>
                                        {((session?.user as any)?.role === 'SUPER_ADMIN') && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeletePostit(postit.id)}
                                            className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                                          >
                                            <Trash2 className="w-4 h-4 mr-2" /> Sil
                                          </Button>
                                        )}
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => openStatsModal(postit.id)}
                                          className="w-full justify-start text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
                                        >
                                          <BarChart className="w-4 h-4 mr-2" /> İstatistikler
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          )}
                        </div>
                      )
                    })
                  })()}
                </div>
              </div>
            )
          }

          {/* Ads Management Section */}
          {
            activeSection === 'ads' && (
              <div className="flex flex-col gap-6">
                <div className="sticky top-0 z-30 bg-gray-50/95 py-5 mb-2 flex items-start justify-between border-b border-gray-200 shadow-sm flex-col md:flex-row gap-4 md:gap-0 -mx-8 -mt-8 px-8 backdrop-blur-sm">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Building className="w-6 h-6 text-indigo-600" />
                    Reklam Firmaları & Reklamlar
                  </h2>
                  <Button
                    onClick={() => openCompanyModal()}
                    className="bg-indigo-600 hover:bg-indigo-700 shadow-sm rounded-full px-6"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Firma Ekle
                  </Button>
                </div>
                
                {/* Iterate over Companies */}
                {adCompanies.map(company => (
                  <div key={company.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                    <div className="bg-gray-100/80 p-4 flex flex-col md:flex-row items-center justify-between border-b border-gray-200 gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                          <Building className="w-5 h-5 text-gray-500" />
                          {company.name}
                          {!company.isActive && <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Pasif</span>}
                        </h3>
                        {company.contactInfo && <p className="text-sm text-gray-500 mt-1">{company.contactInfo}</p>}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button variant="outline" size="sm" onClick={() => openCompanyModal(company)} className="bg-white">
                          <Pencil className="w-4 h-4 mr-2" /> Firma Düzenle
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteCompany(company.id)} className="bg-white text-red-600 hover:bg-red-50 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button onClick={() => openAdModal(company.id)} className="bg-green-600 hover:bg-green-700 text-white ml-2">
                          <Plus className="w-4 h-4 mr-2" /> Bu Firmaya Reklam Ekle
                        </Button>
                      </div>
                    </div>
                    {/* Render ads for this company */}
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-gray-50/30">
                          <TableRow>
                            <TableHead>Görsel</TableHead>
                            <TableHead>Başlık & Link</TableHead>
                            <TableHead>Pozisyon</TableHead>
                            <TableHead>Kategori</TableHead>
                            <TableHead>Tarihler</TableHead>
                            <TableHead>Durum</TableHead>
                            <TableHead className="text-right">İşlemler</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {ads.filter(ad => ad.companyId === company.id).length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-6 text-gray-500">Bu firmaya henüz reklam eklenmemiş.</TableCell>
                            </TableRow>
                          ) : ads.filter(ad => ad.companyId === company.id).map(ad => (
                            <TableRow key={ad.id} className="hover:bg-gray-50/50 transition-colors">
                            <TableCell>
                              <div className="relative w-16 h-12 rounded bg-gray-100 border border-gray-200 overflow-hidden">
                                <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-semibold text-gray-900">{ad.title}</div>
                              <a href={ad.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1">
                                Git <ExternalLink className="w-3 h-3" />
                              </a>
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <div className="flex flex-wrap gap-1">
                                {(() => {
                                  let positionsArray: string[] = [];
                                  if (ad.positions) {
                                    if (Array.isArray(ad.positions)) {
                                      positionsArray = ad.positions;
                                    } else if (typeof ad.positions === 'string') {
                                      try { positionsArray = JSON.parse(ad.positions); } catch(e) {}
                                    }
                                  } else if ((ad as any).position) {
                                    positionsArray = [(ad as any).position];
                                  }
                                  
                                   return positionsArray.map((pos, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold whitespace-nowrap">
                                      {pos === 'NATIVE' ? 'Ana Pano (Native)' :
                                       pos === 'SEPARATOR' ? 'Kategori Arası' :
                                       pos === 'TOP_BANNER' ? 'Üst Manşet' :
                                       pos === 'BOTTOM_BANNER' ? 'Alt Manşet (Footer)' :
                                       pos === 'SIDEBAR_LEFT' ? 'Sol Kenar' :
                                       pos === 'SIDEBAR_RIGHT' ? 'Sağ Kenar' :
                                       pos === 'MARQUEE' ? 'Kayan Yazı' :
                                       pos === 'TOP_MENU' ? 'Üst Hikaye Menüsü' :
                                       pos}
                                    </span>
                                  ));
                                })()}
                              </div>
                            </TableCell>
                            <TableCell>
                              {ad.categoryId ? (
                                <span className="text-sm px-2 py-1 bg-purple-50 text-purple-700 rounded-md">
                                  {ad.category?.name || ad.categoryId}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-400">Tüm Sayfalar</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="text-xs text-gray-500 whitespace-nowrap">
                                <div>Başlangıç: <span className="font-semibold">{ad.startDate ? new Date(ad.startDate).toLocaleDateString('tr-TR') : 'Sürekli'}</span></div>
                                <div>Bitiş: <span className="font-semibold">{ad.endDate ? new Date(ad.endDate).toLocaleDateString('tr-TR') : 'Sürekli'}</span></div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {(() => {
                                const now = new Date();
                                const isStarted = !ad.startDate || new Date(ad.startDate) <= now;
                                const isExpired = ad.endDate && new Date(ad.endDate) < now;
                                
                                if (!ad.isActive) {
                                  return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Pasif (Kapalı)</span>
                                }
                                
                                if (isExpired) {
                                  return <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Süresi Doldu</span>
                                }
                                
                                if (!isStarted) {
                                  return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Beklemede</span>
                                }
                                
                                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Yayında</span>
                              })()}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openAdModal(ad.companyId, ad)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Pencil className="w-4 h-4 text-gray-500" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteAd(ad.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}

                {/* Ads without companies */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8 opacity-90">
                  <div className="bg-orange-50/80 p-4 flex items-center justify-between border-b border-orange-100">
                    <h3 className="text-lg font-bold text-orange-800 flex items-center gap-2">
                      <HelpCircle className="w-5 h-5" /> Firmasız / Bireysel Reklamlar
                    </h3>
                    <Button onClick={() => openAdModal(undefined)} className="bg-orange-600 hover:bg-orange-700 text-white">
                      <Plus className="w-4 h-4 mr-2" /> Bireysel Reklam Ekle
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-gray-50/30">
                        <TableRow>
                          <TableHead>Görsel</TableHead>
                          <TableHead>Başlık & Link</TableHead>
                          <TableHead>Pozisyon</TableHead>
                          <TableHead>Kategori</TableHead>
                          <TableHead>Tarihler</TableHead>
                          <TableHead>Durum</TableHead>
                          <TableHead className="text-right">İşlemler</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ads.filter(ad => !ad.companyId).length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-6 text-gray-500">Bireysel reklam bulunmuyor.</TableCell>
                          </TableRow>
                        ) : ads.filter(ad => !ad.companyId).map(ad => (
                            <TableRow key={ad.id} className="hover:bg-gray-50/50 transition-colors">
                            <TableCell>
                              <div className="relative w-16 h-12 rounded bg-gray-100 border border-gray-200 overflow-hidden">
                                <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-semibold text-gray-900">{ad.title}</div>
                              <a href={ad.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1">
                                Git <ExternalLink className="w-3 h-3" />
                              </a>
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <div className="flex flex-wrap gap-1">
                                {(() => {
                                  let positionsArray: string[] = [];
                                  if (ad.positions) {
                                    if (Array.isArray(ad.positions)) {
                                      positionsArray = ad.positions;
                                    } else if (typeof ad.positions === 'string') {
                                      try { positionsArray = JSON.parse(ad.positions); } catch(e) {}
                                    }
                                  } else if ((ad as any).position) {
                                    positionsArray = [(ad as any).position];
                                  }
                                  
                                   return positionsArray.map((pos, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold whitespace-nowrap">
                                      {pos === 'NATIVE' ? 'Ana Pano (Native)' :
                                       pos === 'SEPARATOR' ? 'Kategori Arası' :
                                       pos === 'TOP_BANNER' ? 'Üst Manşet' :
                                       pos === 'BOTTOM_BANNER' ? 'Alt Manşet (Footer)' :
                                       pos === 'SIDEBAR_LEFT' ? 'Sol Kenar' :
                                       pos === 'SIDEBAR_RIGHT' ? 'Sağ Kenar' :
                                       pos === 'MARQUEE' ? 'Kayan Yazı' :
                                       pos === 'TOP_MENU' ? 'Üst Hikaye Menüsü' :
                                       pos}
                                    </span>
                                  ));
                                })()}
                              </div>
                            </TableCell>
                            <TableCell>
                              {ad.categoryId ? (
                                <span className="text-sm px-2 py-1 bg-purple-50 text-purple-700 rounded-md">
                                  {ad.category?.name || ad.categoryId}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-400">Tüm Sayfalar</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="text-xs text-gray-500 whitespace-nowrap">
                                <div>Başlangıç: <span className="font-semibold">{ad.startDate ? new Date(ad.startDate).toLocaleDateString('tr-TR') : 'Sürekli'}</span></div>
                                <div>Bitiş: <span className="font-semibold">{ad.endDate ? new Date(ad.endDate).toLocaleDateString('tr-TR') : 'Sürekli'}</span></div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {(() => {
                                const now = new Date();
                                const isStarted = !ad.startDate || new Date(ad.startDate) <= now;
                                const isExpired = ad.endDate && new Date(ad.endDate) < now;
                                
                                if (!ad.isActive) {
                                  return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Pasif (Kapalı)</span>
                                }
                                
                                if (isExpired) {
                                  return <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Süresi Doldu</span>
                                }
                                
                                if (!isStarted) {
                                  return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Beklemede</span>
                                }
                                
                                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Yayında</span>
                              })()}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openAdModal(undefined, ad)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Pencil className="w-4 h-4 text-gray-500" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteAd(ad.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )
          }

          {/* Postit Management Section */}
          {
            activeSection === 'postit_management' && (() => {
              const currentAppearance = activeShapeWallIds.includes('global') 
                ? (siteSettings.postitAppearance || {})
                : activeShapeWallIds.length > 0 
                  ? (() => {
                      const activeWall = walls.find(w => w.id === activeShapeWallIds[0]);
                      if(!activeWall) return {};
                      try { return typeof activeWall.postitAppearance === 'string' ? JSON.parse(activeWall.postitAppearance) : (activeWall.postitAppearance || {}); } catch(e){return {}}
                    })()
                  : {};

              const updateShapeField = (field: string, value: string) => {
                 if (activeShapeWallIds.length === 0) {
                     toast.error("Lütfen önce yukarıdan '1. Uygulanacak Alan Seçimi' listesinden en az bir seçenek (Sistem Geneli veya özel duvar) işaretleyiniz.");
                     return;
                 }
                 if (activeShapeWallIds.includes('global')) {
                    setSiteSettings(s => ({ ...s, postitAppearance: { ...(s.postitAppearance || {}), [field]: value } }));
                 }
                 setWalls(prevWalls => prevWalls.map(w => {
                    if (activeShapeWallIds.includes(w.id)) {
                       let parsed: any = {};
                       try { parsed = typeof w.postitAppearance === 'string' ? JSON.parse(w.postitAppearance) : (w.postitAppearance || {}); } catch(e){}
                       parsed[field] = value;
                       return { ...w, postitAppearance: parsed };
                    }
                    return w;
                 }));
              };

              const handleSaveShapeSettings = async () => {
                 if (activeShapeWallIds.length === 0) {
                    toast.error('Lütfen uygulanacak en az bir alan seçin.');
                    return;
                 }
                 
                 toast.loading('Şekil ayarları kaydediliyor...', { id: 'saveShape' });
                 let hasError = false;

                 if (activeShapeWallIds.includes('global')) {
                    try {
                       await fetch('/api/settings', {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ ...siteSettings })
                       });
                    } catch(e) { hasError = true; }
                 }

                 const wallTasks = activeShapeWallIds.filter(id => id !== 'global').map(async (wallId) => {
                    const activeWall = walls.find(w => w.id === wallId);
                    if(!activeWall) return;
                    let parsed = {};
                    try { parsed = typeof activeWall.postitAppearance === 'string' ? JSON.parse(activeWall.postitAppearance) : (activeWall.postitAppearance || {}); } catch(e){}
                    
                    try {
                       const response = await fetch(`/api/categories/${wallId}`, {
                         method: 'PATCH',
                         headers: { 'Content-Type': 'application/json' },
                         body: JSON.stringify({ postitAppearance: parsed }),
                       });
                       if (!response.ok) hasError = true;
                    } catch (e) { hasError = true; }
                 });

                 await Promise.all(wallTasks);

                 if (!hasError) {
                    toast.success('Şekil ayarları seçili alanlara uygulandı!', { id: 'saveShape' });
                 } else {
                    toast.error('Bazı ayarlar kaydedilirken hata oluştu.', { id: 'saveShape' });
                 }
              };

              return (
              <div>
                <div className="sticky top-0 z-30 bg-gray-50/95 py-5 mb-6 flex flex-col md:flex-row items-center justify-between border-b border-gray-200 shadow-sm gap-4 md:gap-0 -mx-8 -mt-8 px-8 backdrop-blur-sm">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <SquareStack className="w-6 h-6 text-amber-600" />
                    Post-it Yönetimi & Şekiller
                  </h2>
                  <Button
                    onClick={handleSaveShapeSettings}
                    className="bg-amber-600 hover:bg-amber-700 shadow-sm rounded-full px-6"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Şekil Ayarlarını Kaydet
                  </Button>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                  <div className="flex justify-between items-center border-b pb-2 mb-4">
                    <h3 className="text-lg font-bold text-gray-800">1. Uygulanacak Alan Seçimi</h3>
                  </div>
                  <div className="border border-gray-100 rounded-md p-3 max-h-[400px] overflow-y-auto space-y-1 bg-white">
                     {/* Sistem Geneli Item */}
                     <div className="space-y-1 mb-4 border-b pb-4">
                       <div className={`flex items-center gap-2 p-2 rounded-md transition-colors ${activeShapeWallIds.includes('global') || activeShapeWallIds.length >= walls.length ? 'bg-amber-50/50' : 'hover:bg-gray-50'}`}>
                          <Checkbox
                             checked={activeShapeWallIds.includes('global') || activeShapeWallIds.length > walls.length}
                             onCheckedChange={(checked) => {
                                if (checked) {
                                   setActiveShapeWallIds(['global', ...walls.map((w: any) => w.id)])
                                } else {
                                   setActiveShapeWallIds([])
                                }
                             }}
                             className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                          />
                          <div className="flex flex-col flex-1">
                             <span className="text-sm font-semibold text-amber-900">Sistem Geneli <span className="text-xs font-normal text-amber-700 opacity-70">(Tüm Duvarlar)</span></span>
                          </div>
                       </div>
                     </div>

                     {/* Hierarchical Walls */}
                     {(() => {
                        const buildHierarchy = (items: any[]) => {
                          const rootItems = items.filter(i => !i.parentId).sort((a, b) => a.name.localeCompare(b.name, 'tr-TR'));
                          const findChildren = (parent: any) => {
                            parent.children = items.filter(i => i.parentId === parent.id).sort((a, b) => a.name.localeCompare(b.name, 'tr-TR'));
                            parent.children.forEach(findChildren);
                          };
                          rootItems.forEach(findChildren);
                          return rootItems;
                        };
                        const hierarchy = buildHierarchy(JSON.parse(JSON.stringify(walls)));

                        const renderNode = (node: any, depth = 0) => {
                          const isSelected = activeShapeWallIds.includes(node.id);
                          const realNode = walls.find((c: any) => c.id === node.id);
                          const subcatCount = realNode ? walls.filter((c: any) => c.parentId === realNode.id).length : 0;
                          const hasChildren = node.children && node.children.length > 0;
                          const isExpanded = expandedShapeWallIds.includes(node.id);

                          return (
                            <div key={node.id} className="space-y-1">
                                <div className={`flex items-center p-2 rounded-md transition-colors ${isSelected ? 'bg-indigo-50/50' : 'hover:bg-gray-50'}`} style={{ marginLeft: `${depth * 16}px` }}>
                                  {hasChildren ? (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        if (isExpanded) setExpandedShapeWallIds(expandedShapeWallIds.filter(id => id !== node.id));
                                        else setExpandedShapeWallIds([...expandedShapeWallIds, node.id]);
                                      }}
                                      className="p-1 hover:bg-gray-200 rounded text-gray-500 mr-2 flex items-center justify-center transition-colors"
                                    >
                                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                    </button>
                                  ) : (
                                    <div className="w-6 mr-2 flex-shrink-0" />
                                  )}
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                          setActiveShapeWallIds(prev => {
                                              const next = [...prev, node.id];
                                              if (next.filter(id => id !== 'global').length === walls.length) {
                                                  return [...next, 'global'];
                                              }
                                              return next;
                                          });
                                      } else {
                                          setActiveShapeWallIds(prev => prev.filter(id => id !== node.id && id !== 'global'));
                                      }
                                    }}
                                    className="data-[state=checked]:bg-indigo-600 data-[state=checked]:text-white mr-3"
                                  />
                                  <div className="flex flex-col flex-1">
                                    <span className={`text-sm ${isSelected ? 'font-bold text-indigo-900' : 'font-semibold text-gray-800'}`}>{node.name}</span>
                                    <span className="text-[10px] text-gray-500 font-medium mt-0.5">
                                      {subcatCount} alt kategori • {realNode?._count?.postits || 0} not
                                    </span>
                                  </div>
                                </div>
                                {hasChildren && isExpanded && (
                                  <div className="mt-1">
                                    {node.children.map((child: any) => renderNode(child, depth + 1))}
                                  </div>
                                )}
                            </div>
                          );
                        };

                        return hierarchy.map(node => renderNode(node, 0));
                     })()}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                  <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">2. Görünüm (Şekil) Seçimi</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Seçtiğiniz alan için notların varsayılan şeklini belirleyin. "Özel Görsel" seçerseniz, şeffaf arka planlı bir PNG yükleyerek notların o görsel üzerinde görünmesini sağlayabilirsiniz.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-semibold text-gray-700">Şekil Seçimi</Label>
                        <Select
                          value={currentAppearance?.shapeType || 'default'}
                          onValueChange={(val) => updateShapeField('shapeType', val)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Bir şekil seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">Varsayılan (Köşeleri hafif oval)</SelectItem>
                            <SelectItem value="square">Tam Kare (Keskin köşeli)</SelectItem>
                            <SelectItem value="circle">Yuvarlak / Daire</SelectItem>
                            <SelectItem value="paper_tear">Yırtık Kağıt Modeli</SelectItem>
                            <SelectItem value="transparent">Transparan (Arka plansız)</SelectItem>
                            <SelectItem value="custom">Özel Görsel Yükle (Custom)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {currentAppearance?.shapeType === 'custom' && (
                        <div className="mt-4 space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <Label className="text-sm font-semibold">Özel Şekil Görsel URL'si (PNG formatı önerilir)</Label>
                          <div className="flex gap-2">
                             <Input
                               value={currentAppearance?.backgroundImage || ''}
                               onChange={(e) => updateShapeField('backgroundImage', e.target.value)}
                               placeholder="https://..."
                               className="flex-1"
                             />
                             <div className="flex-shrink-0">
                               <Button
                                 type="button"
                                 variant="outline"
                                 disabled={uploadingShapeCustomImage}
                                 onClick={() => document.getElementById('shape-custom-upload')?.click()}
                                 className="px-3 border-gray-200 hover:bg-gray-50"
                               >
                                 {uploadingShapeCustomImage ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />} Gözat
                               </Button>
                               <input id="shape-custom-upload" type="file" accept="image/*" onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  if (file.size > 10 * 1024 * 1024) { toast.error("Dosya boyutu 10MB'dan küçük olmalıdır"); return; }
                                  setUploadingShapeCustomImage(true);
                                  try {
                                      const formData = new FormData();
                                      formData.append('file', file);
                                      const res = await fetch('/api/upload/local', { method: 'POST', body: formData });
                                      if (!res.ok) throw new Error();
                                      const { fileUrl } = await res.json();
                                      updateShapeField('backgroundImage', fileUrl);
                                  } catch(err) {
                                      toast.error("Görüntü yüklenirken hata oluştu");
                                  } finally {
                                      setUploadingShapeCustomImage(false);
                                  }
                               }} className="hidden" />
                             </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 mt-4 border-t pt-4">
                         <div className="space-y-2">
                            <Label className="font-semibold text-gray-700">Not Yazı Rengi</Label>
                            <div className="flex items-center gap-2">
                               <input 
                                 type="color" 
                                 value={currentAppearance?.textColor || '#ffffff'} 
                                 onChange={(e) => updateShapeField('textColor', e.target.value)}
                                 className="w-10 h-10 border-0 p-0 rounded-md cursor-pointer"
                               />
                               <span className="text-xs text-gray-500 uppercase tracking-wider">{currentAppearance?.textColor || '#ffffff'}</span>
                            </div>
                         </div>
                         <div className="space-y-2">
                            <Label className="font-semibold text-gray-700">Yazı Boyutu</Label>
                            <Select
                              value={currentAppearance?.textSize || 'text-base'}
                              onValueChange={(val) => updateShapeField('textSize', val)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Boyut seçin" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text-xs">Çok Küçük (xs)</SelectItem>
                                <SelectItem value="text-sm">Küçük (sm)</SelectItem>
                                <SelectItem value="text-base">Normal (base)</SelectItem>
                                <SelectItem value="text-lg">Büyük (lg)</SelectItem>
                                <SelectItem value="text-xl">Çok Büyük (xl)</SelectItem>
                                <SelectItem value="text-2xl">Kocaman (2xl)</SelectItem>
                              </SelectContent>
                            </Select>
                         </div>
                      </div>

                      <div className="space-y-3 mt-4 border-t pt-4 relative z-50 pointer-events-auto">
                         <Label className="font-semibold text-gray-700">Postit Animasyonu</Label>
                         <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 relative z-50">
                           <button 
                             type="button"
                             onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateShapeField('animationStyle', 'tilted'); }}
                             className={`flex items-center space-x-2 cursor-pointer border px-3 py-2 rounded-md transition-colors relative z-50 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                               (currentAppearance?.animationStyle || 'tilted') === 'tilted' ? 'border-amber-600 bg-amber-50' : 'border-gray-200 hover:bg-gray-50'
                             }`}
                           >
                             <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                               (currentAppearance?.animationStyle || 'tilted') === 'tilted' ? 'border-amber-600' : 'border-gray-300'
                             }`}>
                               {(currentAppearance?.animationStyle || 'tilted') === 'tilted' && <div className="w-2 h-2 rounded-full bg-amber-600" />}
                             </div>
                             <span className="text-sm font-medium text-gray-800">1. Eğik (Rotated/Tilted)</span>
                           </button>

                           <button 
                             type="button"
                             onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateShapeField('animationStyle', 'flat'); }}
                             className={`flex items-center space-x-2 cursor-pointer border px-3 py-2 rounded-md transition-colors relative z-50 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                               (currentAppearance?.animationStyle || 'tilted') === 'flat' ? 'border-amber-600 bg-amber-50' : 'border-gray-200 hover:bg-gray-50'
                             }`}
                           >
                             <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                               (currentAppearance?.animationStyle || 'tilted') === 'flat' ? 'border-amber-600' : 'border-gray-300'
                             }`}>
                               {(currentAppearance?.animationStyle || 'tilted') === 'flat' && <div className="w-2 h-2 rounded-full bg-amber-600" />}
                             </div>
                             <span className="text-sm font-medium text-gray-800">2. Düz (Straight/Flat)</span>
                           </button>
                         </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 border-dashed flex items-center justify-center min-h-[250px]">
                      <div 
                         className={`relative shadow-md bg-yellow-200 w-48 text-center flex flex-col justify-center transition-all p-6 min-h-[140px]
                           ${(!currentAppearance?.shapeType || currentAppearance?.shapeType === 'default') ? 'rounded-md shadow-md' : ''}
                           ${currentAppearance?.shapeType === 'square' ? 'rounded-none shadow-md' : ''}
                           ${currentAppearance?.shapeType === 'circle' ? 'rounded-full aspect-square shadow-lg items-center text-center pb-6' : ''}
                           ${currentAppearance?.shapeType === 'paper_tear' ? 'rounded-b-3xl rounded-t-sm border-b-8 shadow-lg' : ''}
                           ${currentAppearance?.shapeType === 'transparent' ? 'bg-transparent shadow-none border-none' : ''}
                           ${currentAppearance?.shapeType === 'custom' ? 'bg-transparent shadow-none !p-8 drop-shadow-xl border-none' : ''}
                         `}
                         style={{
                            ...(currentAppearance?.animationStyle === 'flat' ? { rotate: '0deg' } : { rotate: '-4deg' }),
                            ...((currentAppearance?.shapeType === 'custom' && currentAppearance?.backgroundImage) ? {
                              backgroundImage: `url("${currentAppearance.backgroundImage}")`,
                              backgroundSize: '100% 100%',
                              backgroundRepeat: 'no-repeat',
                            } : {})
                         }}
                      >
                         <div 
                           className="font-bold"
                           style={{ 
                             color: currentAppearance?.textColor || '#1f2937',
                             fontSize: ({ 'text-xs': '0.75rem', 'text-sm': '0.875rem', 'text-base': '1rem', 'text-lg': '1.125rem', 'text-xl': '1.25rem', 'text-2xl': '1.5rem' } as any)[currentAppearance?.textSize || 'text-base'] || '1rem' 
                           }}
                         >
                           Post-it Görünümü
                         </div>
                         <div 
                           className="text-xs mt-1 block opacity-80"
                           style={{ color: currentAppearance?.textColor || '#4b5563' }}
                         >
                           Tasarım böyle görünecektir...
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              )
            })()
          }

          {
            activeSection === 'editor_articles' && (
              <EditorArticlesTab />
            )
          }

          {
            activeSection === 'search_appearance' && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Search className="w-6 h-6 text-indigo-600" />
                    Arama Ekranı Görünümü
                  </h2>
                  <Button onClick={handleSaveSiteSettings} disabled={savingSettings} className="bg-indigo-600 hover:bg-indigo-700">
                    {savingSettings ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Değişiklikleri Kaydet
                  </Button>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Type className="h-5 w-5 text-indigo-500" /> Başlık Ayarları
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Başlık Yazı Tipi</Label>
                      <Select value={siteSettings.searchTitleFont || 'sans-serif'} onValueChange={(v) => setSiteSettings({ ...siteSettings, searchTitleFont: v })}>
                        <SelectTrigger><SelectValue placeholder="Seçiniz" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sans-serif">Varsayılan (Nunito / modern)</SelectItem>
                          <SelectItem value="serif">Klasik (Serif)</SelectItem>
                          <SelectItem value="cursive">El Yazısı (Cursive)</SelectItem>
                          <SelectItem value="handwriting">Elyazısı (Caveat)</SelectItem>
                          <SelectItem value="calibri">Calibri</SelectItem>
                          <SelectItem value="arial">Arial</SelectItem>
                          <SelectItem value="system-ui">Sistem Varsayılanı</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Başlık Boyutu</Label>
                      <Select value={siteSettings.searchTitleSize || '4xl'} onValueChange={(v) => setSiteSettings({ ...siteSettings, searchTitleSize: v })}>
                        <SelectTrigger><SelectValue placeholder="Seçiniz" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="xl">Çok Küçük</SelectItem>
                          <SelectItem value="2xl">Küçük</SelectItem>
                          <SelectItem value="3xl">Orta</SelectItem>
                          <SelectItem value="4xl">Büyük</SelectItem>
                          <SelectItem value="5xl">Çok Büyük</SelectItem>
                          <SelectItem value="6xl">Devasa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Başlık Rengi</Label>
                      <div className="flex gap-2">
                        <input type="color" value={siteSettings.searchTitleColor || '#1f2937'} onChange={(e) => setSiteSettings({ ...siteSettings, searchTitleColor: e.target.value })} className="h-10 w-10 p-1 cursor-pointer rounded-md border" />
                        <Input value={siteSettings.searchTitleColor || '#1f2937'} readOnly />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Hizalama</Label>
                      <Select value={siteSettings.searchTitleAlignment || 'left'} onValueChange={(v) => setSiteSettings({ ...siteSettings, searchTitleAlignment: v })}>
                        <SelectTrigger><SelectValue placeholder="Seçiniz" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Sola Hizalı</SelectItem>
                          <SelectItem value="center">Ortalı</SelectItem>
                          <SelectItem value="right">Sağa Hizalı</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Palette className="h-5 w-5 text-indigo-500" /> Kutu Görünüm Ayarları
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Zemin Rengi</Label>
                      <div className="flex gap-2">
                        <input type="color" value={siteSettings.searchBgColor || '#ffffff'} onChange={(e) => setSiteSettings({ ...siteSettings, searchBgColor: e.target.value })} className="h-10 w-10 p-1 cursor-pointer rounded-md border" />
                        <Input value={siteSettings.searchBgColor || '#ffffff'} readOnly />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Zemin Rengi Opaklığı (%)</Label>
                      <div className="px-2 pt-2 pb-6 w-full">
                        <input type="range" 
                           value={siteSettings.searchBgColorAlpha ?? 40}
                           min={0} max={100} step={5}
                           onChange={(e) => setSiteSettings({ ...siteSettings, searchBgColorAlpha: parseInt(e.target.value) })}
                           className="w-full accent-indigo-600"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Açıklama Metni Rengi</Label>
                      <div className="flex gap-2">
                        <input type="color" value={siteSettings.searchTextColor || '#374151'} onChange={(e) => setSiteSettings({ ...siteSettings, searchTextColor: e.target.value })} className="h-10 w-10 p-1 cursor-pointer rounded-md border" />
                        <Input value={siteSettings.searchTextColor || '#374151'} readOnly />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Kenarlık Ayracı Rengi</Label>
                      <div className="flex gap-2">
                        <input type="color" value={siteSettings.searchBorderColor || '#000000'} onChange={(e) => setSiteSettings({ ...siteSettings, searchBorderColor: e.target.value })} className="h-10 w-10 p-1 cursor-pointer rounded-md border" />
                        <Input value={siteSettings.searchBorderColor || '#000000'} readOnly />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Palette className="h-5 w-5 text-indigo-500" /> Grup (Kategori) Başlık Ayarları
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Başlık Yazı Tipi</Label>
                      <Select value={siteSettings?.searchCategoryTitleFont || 'sans-serif'} onValueChange={(v) => setSiteSettings({ ...siteSettings, searchCategoryTitleFont: v })}>
                        <SelectTrigger><SelectValue placeholder="Seçiniz" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sans-serif">Varsayılan (Nunito / modern)</SelectItem>
                          <SelectItem value="serif">Klasik (Serif)</SelectItem>
                          <SelectItem value="cursive">El Yazısı (Cursive)</SelectItem>
                          <SelectItem value="handwriting">Elyazısı (Caveat)</SelectItem>
                          <SelectItem value="calibri">Calibri</SelectItem>
                          <SelectItem value="arial">Arial</SelectItem>
                          <SelectItem value="system-ui">Sistem Varsayılanı</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Başlık Boyutu</Label>
                      <Select value={siteSettings?.searchCategoryTitleSize || '3xl'} onValueChange={(v) => setSiteSettings({ ...siteSettings, searchCategoryTitleSize: v })}>
                        <SelectTrigger><SelectValue placeholder="Seçiniz" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lg">Çok Küçük</SelectItem>
                          <SelectItem value="xl">Küçük</SelectItem>
                          <SelectItem value="2xl">Orta</SelectItem>
                          <SelectItem value="3xl">Büyük</SelectItem>
                          <SelectItem value="4xl">Çok Büyük</SelectItem>
                          <SelectItem value="5xl">Devasa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Başlık Rengi</Label>
                      <div className="flex gap-2">
                        <input type="color" value={siteSettings?.searchCategoryTitleColor || '#1f2937'} onChange={(e) => setSiteSettings({ ...siteSettings, searchCategoryTitleColor: e.target.value })} className="h-10 w-10 p-1 cursor-pointer rounded-md border" />
                        <Input value={siteSettings?.searchCategoryTitleColor || '#1f2937'} readOnly />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 border p-6 rounded-xl mt-6 flex flex-col items-center">
                  <div className="w-full max-w-3xl">
                     <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-4">Canlı Önizleme</p>
                     <div className="w-full p-4 md:p-8 backdrop-blur-sm rounded-xl mb-4 shadow-sm"
                          style={{
                            backgroundColor: siteSettings.searchBgColor ? `${siteSettings.searchBgColor}${Math.round((siteSettings.searchBgColorAlpha ?? 40) * 2.55).toString(16).padStart(2, '0')}` : 'rgba(255,255,255,0.4)',
                            border: siteSettings.searchBorderColor ? `1px solid ${siteSettings.searchBorderColor}30` : 'none',
                          }}>
                       <div className={`mb-8 border-b-2 pb-4 ${siteSettings.searchTitleAlignment === 'center' ? 'text-center' : siteSettings.searchTitleAlignment === 'right' ? 'text-right' : 'text-left'}`}
                            style={{ borderColor: siteSettings.searchBorderColor ? `${siteSettings.searchBorderColor}33` : 'rgba(0,0,0,0.2)' }}>
                         <h2 className={`${siteSettings.searchTitleSize === 'xl' ? 'text-xl' : siteSettings.searchTitleSize === '2xl' ? 'text-2xl' : siteSettings.searchTitleSize === '3xl' ? 'text-3xl' : siteSettings.searchTitleSize === '4xl' ? 'text-4xl' : siteSettings.searchTitleSize === '5xl' ? 'text-5xl' : siteSettings.searchTitleSize === '6xl' ? 'text-6xl' : 'text-4xl'} font-black tracking-tight`} 
                             style={{ 
                               fontFamily: siteSettings.searchTitleFont === 'cursive' ? "'Caveat', cursive" : siteSettings.searchTitleFont === 'handwriting' ? "'Caveat', cursive" : siteSettings.searchTitleFont === 'calibri' ? "'Calibri', sans-serif" : siteSettings.searchTitleFont === 'arial' ? "Arial, sans-serif" : siteSettings.searchTitleFont === 'sans-serif-generic' ? "sans-serif" : "'Nunito', 'Segoe UI', system-ui, sans-serif",
                               color: siteSettings.searchTitleColor || '#1f2937'
                             }}>
                           &quot;Aranan Metin&quot; Arama Sonuçları
                         </h2>
                         <p className="text-lg md:text-xl mt-2 font-semibold" style={{ color: siteSettings.searchTextColor || '#374151' }}>
                           Tüm panolardan toplam 8 eşleşen kayıt bulundu.
                         </p>
                       </div>
                     </div>
                  </div>
                </div>

              </div>
            )
          }

          {/* Merchant Registration Forms */}
          {activeSection === 'merchant_registration' && (
            <div className="space-y-6">
              <div className="sticky top-0 z-30 bg-gray-50/95 py-5 mb-6 flex items-center justify-between border-b border-gray-200 shadow-sm -mx-8 -mt-8 px-8 backdrop-blur-sm">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Firma Kayıt Formları (Önizleme)</h2>
                  <p className="text-sm text-gray-500 mt-1">Platforma onaylanmak üzere yeni bir mağaza profili tanımlayın veya mevcut olanı güncelleyin.</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <Tabs defaultValue="sole" className="w-full">
                  <div className="px-6 pt-6 border-b border-gray-100 bg-gray-50/50">
                    <TabsList className="grid w-full grid-cols-2 max-w-md h-12">
                      <TabsTrigger value="sole" className="text-base rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Şahıs Şirketi</TabsTrigger>
                      <TabsTrigger value="corp" className="text-base rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Limited / Anonim Şirket</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  {/* ŞAHIS ŞİRKETİ */}
                  <TabsContent value="sole" className="p-6 md:p-8 m-0 outline-none">
                    <div className="max-w-4xl space-y-8">
                      {/* Genel Bilgiler */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Mekan/Platform Bilgileri</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Mağaza Adı (Görünen Ad) <span className="text-red-500">*</span></Label>
                            <Input placeholder="Örn: Ahmet'in Yeri" />
                          </div>
                          <div className="space-y-2">
                            <Label>Mağaza Logosu</Label>
                            <Input type="file" accept="image/*" />
                          </div>
                          <div className="space-y-2">
                            <Label>Mağaza Sloganı / Spot Cümle</Label>
                            <Input placeholder="Örn: Lezzetin Tek Adresi" />
                          </div>
                          <div className="space-y-2">
                            <Label>Kullanıcı Adı <span className="text-red-500">*</span></Label>
                            <Input placeholder="ahmet_mekan_uye" />
                          </div>
                          <div className="space-y-2">
                            <Label>Şifre <span className="text-red-500">*</span></Label>
                            <Input type="password" placeholder="********" />
                          </div>
                        </div>
                      </div>

                      {/* İrtibat Bilgileri */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Yetkili/İrtibat Bilgileri</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Yetkili Adı <span className="text-red-500">*</span></Label>
                            <Input placeholder="Ahmet" />
                          </div>
                          <div className="space-y-2">
                            <Label>Yetkili Soyadı <span className="text-red-500">*</span></Label>
                            <Input placeholder="Yılmaz" />
                          </div>
                          <div className="space-y-2">
                            <Label>Telefon Numarası <span className="text-red-500">*</span></Label>
                            <Input placeholder="05XX XXX XX XX" />
                          </div>
                          <div className="space-y-2">
                            <Label>Mail Adresi <span className="text-red-500">*</span></Label>
                            <Input type="email" placeholder="ornek@mail.com" />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label>Adres Bilgisi <span className="text-red-500">*</span></Label>
                            <Textarea placeholder="Tam adresinizi giriniz..." rows={3} />
                          </div>
                          <div className="space-y-2">
                            <Label>Şehir <span className="text-red-500">*</span></Label>
                            <Select value={merchantSoleCityId || 'none'} onValueChange={(val) => { setMerchantSoleCityId(val === 'none' ? '' : val); setMerchantSoleDistrictId(''); }}>
                              <SelectTrigger><SelectValue placeholder="Şehir seçin" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Şehir Seçin</SelectItem>
                                {cities.map(city => (
                                  <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>İlçe <span className="text-red-500">*</span></Label>
                            <Select value={merchantSoleDistrictId || 'none'} onValueChange={(val) => setMerchantSoleDistrictId(val === 'none' ? '' : val)} disabled={!merchantSoleCityId}>
                              <SelectTrigger><SelectValue placeholder="İlçe seçin" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">İlçe Seçin</SelectItem>
                                {merchantSoleCityId && districts.filter(d => d.cityId === merchantSoleCityId).map(district => (
                                  <SelectItem key={district.id} value={district.id}>{district.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Resmi Evraklar (Şahıs) */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Resmi ve Finansal Bilgiler</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Vergi Dairesi <span className="text-red-500">*</span></Label>
                            <Input placeholder="Vergi Dairesi Adı" />
                          </div>
                          <div className="space-y-2">
                            <Label>TC Kimlik No / Vergi Numarası <span className="text-red-500">*</span></Label>
                            <Input placeholder="11 Haneli TC Kimlik veya Vergi No" />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label>Banka IBAN Numarası <span className="text-red-500">*</span></Label>
                            <Input placeholder="TRXX XXXX XXXX XXXX XXXX XXXX XX" />
                          </div>
                          
                          <div className="space-y-2 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <Label>Vergi Levhası (PDF/JPEG) <span className="text-red-500">*</span></Label>
                            <Input type="file" />
                          </div>
                          <div className="space-y-2 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <Label>İmza Sirküsü (PDF/JPEG) <span className="text-red-500">*</span></Label>
                            <Input type="file" />
                          </div>
                          <div className="space-y-2 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <Label>Kimlik Ön Yüz (PDF/JPEG) <span className="text-red-500">*</span></Label>
                            <Input type="file" />
                          </div>
                          <div className="space-y-2 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <Label>Kimlik Arka Yüz (PDF/JPEG) <span className="text-red-500">*</span></Label>
                            <Input type="file" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end pt-4 border-t border-gray-100">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white min-w-[200px] h-12 text-lg">Taslağı Kaydet</Button>
                      </div>
                    </div>
                  </TabsContent>

                  {/* LİMİTED/ANONİM ŞİRKET */}
                  <TabsContent value="corp" className="p-6 md:p-8 m-0 outline-none">
                    <div className="max-w-4xl space-y-8">
                      {/* Genel Bilgiler */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Mekan/Platform Bilgileri</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Mağaza Adı (Görünen Ad) <span className="text-red-500">*</span></Label>
                            <Input placeholder="Örn: Lezzet Dünyası" />
                          </div>
                          <div className="space-y-2">
                            <Label>Mağaza Logosu</Label>
                            <Input type="file" accept="image/*" />
                          </div>
                          <div className="space-y-2">
                            <Label>Mağaza Sloganı / Spot Cümle</Label>
                            <Input placeholder="Örn: En İyi Lezzet" />
                          </div>
                          <div className="space-y-2">
                            <Label>Kullanıcı Adı <span className="text-red-500">*</span></Label>
                            <Input placeholder="lezzet_dunyasi_uye" />
                          </div>
                          <div className="space-y-2">
                            <Label>Şifre <span className="text-red-500">*</span></Label>
                            <Input type="password" placeholder="********" />
                          </div>
                        </div>
                      </div>

                      {/* İrtibat Bilgileri */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Kurumsal/İrtibat Bilgileri</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2 md:col-span-2">
                            <Label>Firma Ünvanı (Resmi Ad) <span className="text-red-500">*</span></Label>
                            <Input placeholder="Lezzet Dünyası Gıda ve Turizm A.Ş." />
                          </div>
                          <div className="space-y-2 border-l-4 border-blue-500 pl-4 py-1 bg-blue-50/50">
                            <Label>Firma Yetkilisi Adı Soyadı <span className="text-red-500">*</span></Label>
                            <Input placeholder="Örn: Mehmet Yılmaz" />
                          </div>
                          <div className="space-y-2">
                            <Label>Firma Telefon Numarası <span className="text-red-500">*</span></Label>
                            <Input placeholder="0850 XXX XX XX" />
                          </div>
                          <div className="space-y-2">
                            <Label>Mail Adresi <span className="text-red-500">*</span></Label>
                            <Input type="email" placeholder="ornek@firma.com.tr" />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label>Firma Adresi <span className="text-red-500">*</span></Label>
                            <Textarea placeholder="Faturada yazan resmi firma adresini giriniz..." rows={3} />
                          </div>
                          <div className="space-y-2">
                            <Label>Şehir <span className="text-red-500">*</span></Label>
                            <Select value={merchantCorpCityId || 'none'} onValueChange={(val) => { setMerchantCorpCityId(val === 'none' ? '' : val); setMerchantCorpDistrictId(''); }}>
                              <SelectTrigger><SelectValue placeholder="Şehir seçin" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Şehir Seçin</SelectItem>
                                {cities.map(city => (
                                  <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>İlçe <span className="text-red-500">*</span></Label>
                            <Select value={merchantCorpDistrictId || 'none'} onValueChange={(val) => setMerchantCorpDistrictId(val === 'none' ? '' : val)} disabled={!merchantCorpCityId}>
                              <SelectTrigger><SelectValue placeholder="İlçe seçin" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">İlçe Seçin</SelectItem>
                                {merchantCorpCityId && districts.filter(d => d.cityId === merchantCorpCityId).map(district => (
                                  <SelectItem key={district.id} value={district.id}>{district.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Resmi Evraklar (LTD/AŞ) */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Resmi ve Finansal Bilgiler</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Vergi Dairesi <span className="text-red-500">*</span></Label>
                            <Input placeholder="Vergi Dairesi Adı" />
                          </div>
                          <div className="space-y-2">
                            <Label>Vergi Numarası (10 Haneli) <span className="text-red-500">*</span></Label>
                            <Input placeholder="Vergi No" />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label>Banka IBAN Numarası <span className="text-red-500">*</span></Label>
                            <Input placeholder="TRXX XXXX XXXX XXXX XXXX XXXX XX" />
                          </div>
                          
                          <div className="space-y-2 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <Label>Vergi Levhası (PDF/JPEG) <span className="text-red-500">*</span></Label>
                            <Input type="file" />
                          </div>
                          <div className="space-y-2 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <Label>İmza Sirküsü (Yetkili) <span className="text-red-500">*</span></Label>
                            <Input type="file" />
                          </div>
                          <div className="space-y-2 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <Label>Ticaret Odası Faaliyet Belgesi <span className="text-red-500">*</span></Label>
                            <Input type="file" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end pt-4 border-t border-gray-100">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white min-w-[200px] h-12 text-lg">Taslağı Kaydet</Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Company Modal */}
      <Dialog open={showCompanyModal} onOpenChange={setShowCompanyModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCompany ? 'Firmayı Düzenle' : 'Yeni Firma Ekle'}</DialogTitle>
            <DialogDescription>
              Firma bilgilerini aşağıdan doldurabilirsiniz.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Firma Adı</Label>
              <Input
                value={companyForm.name}
                onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                placeholder="Örn: X İletişim A.Ş."
              />
            </div>
            <div className="space-y-2">
              <Label>İletişim Bilgileri (Opsiyonel)</Label>
              <Textarea
                value={companyForm.contactInfo}
                onChange={(e) => setCompanyForm({ ...companyForm, contactInfo: e.target.value })}
                placeholder="Telefon, E-posta, Adres vb."
              />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="companyIsActive"
                checked={companyForm.isActive}
                onCheckedChange={(checked) => setCompanyForm({ ...companyForm, isActive: checked === true })}
              />
              <Label htmlFor="companyIsActive">Aktif</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompanyModal(false)}>İptal</Button>
            <Button onClick={handleSaveCompany} className="bg-indigo-600 hover:bg-indigo-700">
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ad Modal */}
      <Dialog open={showAdModal} onOpenChange={setShowAdModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Reklamı Düzenle' : 'Yeni Reklam Ekle'}</DialogTitle>
            <DialogDescription>
              Reklam bilgilerini aşağıdan doldurabilirsiniz.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 px-2">
            <div className="space-y-4">
            <div className="space-y-2">
              <Label>Firma Seçimi (Opsiyonel)</Label>
              <Select
                value={adForm.companyId}
                onValueChange={(val) => setAdForm({ ...adForm, companyId: val === 'none' ? '' : val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Firma Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Firmasız / Bireysel</SelectItem>
                  {adCompanies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Başlık (Alt tag / Açıklama)</Label>
              <Input
                value={adForm.title}
                onChange={(e) => setAdForm({ ...adForm, title: e.target.value })}
                placeholder="Örn: Yaz İndirimi Afişi"
              />
            </div>
            <div className="space-y-2">
              <Label>Resim URL</Label>
              <Input
                value={adForm.imageUrl}
                onChange={(e) => setAdForm({ ...adForm, imageUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label>Yönlendirilecek Link (Hedef URL)</Label>
              <Input
                value={adForm.link}
                onChange={(e) => setAdForm({ ...adForm, link: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label>Gösterim Pozisyonu (Çoklu Seçim Yapabilirsiniz)</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {[
                  { value: 'NATIVE', label: 'Ana Pano İçi (Native Gönderi Gibi)' },
                  { value: 'SEPARATOR', label: 'Kategori Arası (Yatay Banner)' },
                  { value: 'SIDEBAR_LEFT', label: 'Sol Kenar (Dikey Afiş)' },
                  { value: 'SIDEBAR_RIGHT', label: 'Sağ Kenar (Dikey Afiş)' },
                  { value: 'TOP_BANNER', label: 'Üst Manşet (Hero Altı)' },
                  { value: 'BOTTOM_BANNER', label: 'Alt Manşet (Footer Üstü)' },
                  { value: 'MARQUEE', label: 'Kayan Yazı Sponsorluğu' },
                  { value: 'TOP_MENU', label: 'Üst Hikaye Menüsü (Yuvarlak İkon)' }
                ].map((pos) => (
                  <label key={pos.value} className="flex items-center space-x-2 border rounded p-2 cursor-pointer hover:bg-gray-50 flex-1">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                      checked={adForm.positions.includes(pos.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAdForm({ ...adForm, positions: [...adForm.positions, pos.value] })
                        } else {
                          setAdForm({ ...adForm, positions: adForm.positions.filter(p => p !== pos.value) })
                        }
                      }}
                    />
                    <span className="text-sm text-gray-700">{pos.label}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {adForm.positions.includes('SEPARATOR') && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Görüntülenme Sıklığı (Kaç kategoride 1 gösterilsin?)</label>
                <div className="mt-1">
                  <Input 
                    type="number"
                    min="1"
                    value={adForm.frequency} 
                    onChange={(e) => setAdForm({ ...adForm, frequency: parseInt(e.target.value) || 1 })} 
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">Örn: 2 yazarsanız, her 2 kategoriden sonra bu yatay afiş gösterilir.</p>
                </div>
              </div>
            )}
            </div>
            
            <div className="space-y-4 flex flex-col h-full">
              <div className="space-y-4">
                <Label>Hedef Kategoriler</Label>
              <div className="border rounded-md w-full overflow-hidden">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="categories" className="border-none">
                    <AccordionTrigger className="text-sm px-4 py-3 bg-gray-50 hover:bg-gray-100 hover:no-underline">
                      <div className="flex justify-between w-full pr-4">
                        <span>Hedef Sayfaları Seç</span>
                        <span className="font-semibold text-amber-600">
                          {adForm.categoryIds.length === [{id: 'root'}, ...walls.filter(c => c.isActive !== false)].length 
                            ? 'Tüm Sayfalar' 
                            : `${adForm.categoryIds.length} Pano Seçili`}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 px-4 pb-4">
                      <div className="max-h-[400px] overflow-y-auto space-y-1">
                        <label className="flex items-center space-x-3 pb-3 mb-2 border-b cursor-pointer select-none">
                          <Checkbox
                            checked={adForm.categoryIds.length === [{id: 'root', name: 'Ana Sayfa'}, ...walls.filter(c => c.isActive !== false)].length}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setAdForm({ ...adForm, categoryIds: ['root', ...walls.filter(c => c.isActive !== false).map(c => c.id)] })
                              } else {
                                setAdForm({ ...adForm, categoryIds: [] })
                              }
                            }}
                          />
                          <span className="text-sm font-bold text-gray-800">Tüm Sayfalar (Hepsini Seç / Kaldır)</span>
                        </label>
                        {(() => {
                           const buildHierarchy = (items: any[]) => {
                             const rootItems = items.filter(i => !i.parentId).sort((a, b) => a.name.localeCompare(b.name, 'tr-TR'));
                             const findChildren = (parent: any) => {
                               parent.children = items.filter(i => i.parentId === parent.id).sort((a, b) => a.name.localeCompare(b.name, 'tr-TR'));
                               parent.children.forEach(findChildren);
                             };
                             rootItems.forEach(findChildren);
                             return rootItems;
                           };
                           const activeWallsArray = walls.filter(c => c.isActive !== false);
                           const hierarchyItems = [{id: 'root', name: '🏠 Ana Sayfa (Site Vitrini)'}, ...JSON.parse(JSON.stringify(activeWallsArray))];
                           const hierarchy = buildHierarchy(hierarchyItems);

                           const renderAdNode = (node: any, depth = 0) => {
                             const isSelected = adForm.categoryIds.includes(node.id);
                             const realNode = activeWallsArray.find((c: any) => c.id === node.id);
                             const subcatCount = realNode ? activeWallsArray.filter((c: any) => c.parentId === realNode.id).length : 0;
                             const hasChildren = node.children && node.children.length > 0;
                             const isExpanded = expandedAdCategoryIds.includes(node.id);

                             return (
                               <div key={node.id} className="space-y-1">
                                   <div className={`flex items-center p-2 rounded-md transition-colors ${isSelected ? 'bg-indigo-50/50' : 'hover:bg-gray-50'}`} style={{ marginLeft: `${depth * 16}px` }}>
                                     {hasChildren ? (
                                       <button
                                         type="button"
                                         onClick={(e) => {
                                           e.preventDefault();
                                           if (isExpanded) setExpandedAdCategoryIds(expandedAdCategoryIds.filter(id => id !== node.id));
                                           else setExpandedAdCategoryIds([...expandedAdCategoryIds, node.id]);
                                         }}
                                         className="p-1 hover:bg-gray-200 rounded text-gray-500 mr-2 flex items-center justify-center transition-colors"
                                       >
                                         {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                       </button>
                                     ) : (
                                       <div className="w-6 mr-2 flex-shrink-0" />
                                     )}
                                     <Checkbox
                                       checked={isSelected}
                                       onCheckedChange={(checked) => {
                                         if (checked) {
                                             setAdForm({ ...adForm, categoryIds: [...adForm.categoryIds, node.id] });
                                         } else {
                                             setAdForm({ ...adForm, categoryIds: adForm.categoryIds.filter(id => id !== node.id) });
                                         }
                                       }}
                                       className="data-[state=checked]:bg-indigo-600 data-[state=checked]:text-white mr-3"
                                     />
                                     <div className="flex flex-col flex-1">
                                       <span className={`text-sm ${isSelected ? 'font-bold text-indigo-900' : 'font-semibold text-gray-800'}`}>{node.name}</span>
                                       {node.id !== 'root' && (
                                         <span className="text-[10px] text-gray-500 font-medium mt-0.5">
                                           {subcatCount} alt kategori • {realNode?._count?.postits || 0} not
                                         </span>
                                       )}
                                     </div>
                                   </div>
                                   {hasChildren && isExpanded && (
                                     <div className="mt-1">
                                       {node.children.map((child: any) => renderAdNode(child, depth + 1))}
                                     </div>
                                   )}
                               </div>
                             );
                           };

                           return hierarchy.map(node => renderAdNode(node, 0));
                        })()}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
              <p className="text-xs text-gray-500">Reklamın görünmesini istediğiniz sayfaları seçin. Hiçbiri seçilmezse reklam yayınlanmaz.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Başlangıç Tarihi (Opsiyonel)</Label>
                <Input
                  type="datetime-local"
                  value={adForm.startDate}
                  onChange={(e) => setAdForm({ ...adForm, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Bitiş Tarihi (Opsiyonel)</Label>
                <Input
                  type="datetime-local"
                  value={adForm.endDate}
                  onChange={(e) => setAdForm({ ...adForm, endDate: e.target.value })}
                />
              </div>
            </div>

              <div className="flex items-center space-x-2 pt-4">
                <Checkbox
                  id="ad-active"
                  checked={adForm.isActive}
                  onCheckedChange={(checked) => setAdForm({ ...adForm, isActive: checked === true })}
                />
                <Label htmlFor="ad-active">Aktif (Kullanıcılara Gösterilir)</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setShowAdModal(false)}>İptal</Button>
            <Button onClick={handleSaveAd}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Appearance Settings Modal */}
      <Dialog open={showAppearanceModal} onOpenChange={setShowAppearanceModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Görünüm Ayarları - {editingAppearanceWall?.name}
            </DialogTitle>
            <DialogDescription>
              Bu kategorinin ana sayfadaki görünümünü özelleştirin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Hero Section Preview */}
            <div
              className={`rounded-lg p-6 relative overflow-hidden flex flex-col justify-center min-h-[160px] ${appearanceForm.heroAlignment === 'center' ? 'items-center text-center' :
                appearanceForm.heroAlignment === 'right' ? 'items-end text-right' :
                  'items-start text-left'
                }`}
              style={{
                backgroundImage: appearanceForm.heroBackgroundImage
                  ? `url('${appearanceForm.heroBackgroundImage}')`
                  : `linear-gradient(to right, ${appearanceForm.heroGradientFrom}, ${appearanceForm.heroGradientVia}, ${appearanceForm.heroGradientTo})`,
                backgroundSize: (appearanceForm.heroBackgroundStyle || 'cover').startsWith('cover') ? 'cover' : appearanceForm.heroBackgroundStyle === 'stretch' ? '100% 100%' : (appearanceForm.heroBackgroundStyle === 'contain' ? 'contain' : 'auto'),
                backgroundRepeat: appearanceForm.heroBackgroundStyle === 'repeat' ? 'repeat' : 'no-repeat',
                backgroundPosition: appearanceForm.heroBackgroundStyle === 'cover-top' ? 'top center' : appearanceForm.heroBackgroundStyle === 'cover-bottom' ? 'bottom center' : appearanceForm.heroBackgroundStyle === 'center' ? 'center' : (appearanceForm.heroBackgroundStyle === 'repeat' ? 'auto' : 'center')
              }}
            >
              <div className={`relative z-10 bg-black/10 backdrop-blur-sm p-4 rounded-xl inline-block ${appearanceForm.heroAlignment === 'center' ? 'text-center' :
                appearanceForm.heroAlignment === 'right' ? 'text-right' :
                  'text-left'
                }`}>
                <h2
                  className="font-bold mb-2 drop-shadow-md"
                  style={{
                    fontFamily: appearanceForm.heroTitleFont,
                    color: appearanceForm.heroTitleColor,
                    fontSize: appearanceForm.heroTitleSize === '4xl' ? '2.25rem' : appearanceForm.heroTitleSize === '5xl' ? '3rem' : appearanceForm.heroTitleSize === '6xl' ? '3.75rem' : '2.25rem'
                  }}
                >
                  📌 {editingAppearanceWall?.name || 'Kategori Adı'}
                </h2>
                <p
                  className="opacity-95 drop-shadow-md"
                  style={{
                    fontFamily: appearanceForm.heroSubtitleFont,
                    color: appearanceForm.heroSubtitleColor,
                    fontSize: appearanceForm.heroSubtitleSize === 'lg' ? '1.125rem' : appearanceForm.heroSubtitleSize === 'xl' ? '1.25rem' : appearanceForm.heroSubtitleSize === '2xl' ? '1.5rem' : '1.25rem'
                  }}
                >
                  {appearanceForm.heroSubtitle || 'Alt başlık metni buraya gelecek'}
                </p>
              </div>
            </div>

            {/* Hero Settings */}
            <div className="space-y-4 border rounded-lg p-4">
              <h3 className="font-semibold flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Hero Bölümü Ayarları
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Zemin Resmi (opsiyonel)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={appearanceForm.heroBackgroundImage}
                      onChange={(e) => setAppearanceForm({ ...appearanceForm, heroBackgroundImage: e.target.value })}
                      placeholder="https://t4.ftcdn.net/jpg/07/54/80/09/360_F_754800974_CXB9YRXM2ItqqUoEYouZnzctO9BTQhSv.jpg"
                    />
                    <div className="flex-shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={uploadingAppearanceImage}
                        onClick={() => document.getElementById('appearance-bg-upload')?.click()}
                      >
                        {uploadingAppearanceImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      </Button>
                      <input
                        id="appearance-bg-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAppearanceImageUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Resim varsa gradyan kullanılmaz</p>
                  <div className="space-y-2">
                    <Label>Arka Plan Resmi Stili</Label>
                    <Select
                      value={appearanceForm.heroBackgroundStyle || 'cover'}
                      onValueChange={(value) => setAppearanceForm({ ...appearanceForm, heroBackgroundStyle: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Stil Seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cover-top">Kırp ve Üste Hizala</SelectItem>
                        <SelectItem value="cover-center">Kırp ve Ortala</SelectItem>
                        <SelectItem value="cover-bottom">Kırp ve Alta Hizala</SelectItem>
                        <SelectItem value="contain">Sığdır (Resmi Göster)</SelectItem>
                        <SelectItem value="stretch">Uzat (Resmi Genişlet)</SelectItem>
                        <SelectItem value="repeat">Tekrarla (Döşe)</SelectItem>
                        <SelectItem value="center">Ortala (Tekrar Etme)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Alt Başlık Metni</Label>
                  <Input
                    value={appearanceForm.heroSubtitle}
                    onChange={(e) => setAppearanceForm({ ...appearanceForm, heroSubtitle: e.target.value })}
                    placeholder="Fikirlerinizi paylaşın..."
                  />
                </div>

                <div className="flex items-center space-x-2 mt-2 border-b border-gray-100 pb-3">
                  <Checkbox
                    id="appearanceHeroTransparent"
                    checked={appearanceForm.isHeroTransparent}
                    onCheckedChange={(checked) => setAppearanceForm(s => ({ ...s, isHeroTransparent: !!checked }))}
                  />
                  <Label htmlFor="appearanceHeroTransparent" className="cursor-pointer font-bold text-gray-700">Kapak Arka Planı (Zemin) Şeffaf Olsun</Label>
                </div>
              </div>

              {/* Gradient Colors */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Gradyan Başlangıç</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={appearanceForm.heroGradientFrom}
                      onChange={(e) => setAppearanceForm({ ...appearanceForm, heroGradientFrom: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={appearanceForm.heroGradientFrom}
                      onChange={(e) => setAppearanceForm({ ...appearanceForm, heroGradientFrom: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Gradyan Orta</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={appearanceForm.heroGradientVia}
                      onChange={(e) => setAppearanceForm({ ...appearanceForm, heroGradientVia: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={appearanceForm.heroGradientVia}
                      onChange={(e) => setAppearanceForm({ ...appearanceForm, heroGradientVia: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Gradyan Bitiş</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={appearanceForm.heroGradientTo}
                      onChange={(e) => setAppearanceForm({ ...appearanceForm, heroGradientTo: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={appearanceForm.heroGradientTo}
                      onChange={(e) => setAppearanceForm({ ...appearanceForm, heroGradientTo: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Title Settings */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 shadow-sm">
                  <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Type className="w-5 h-5 text-indigo-500" /> Başlık Ayarları
                  </h4>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border border-slate-200">
                      <Checkbox
                        id="hideAppearanceHeroPushpin"
                        checked={!!appearanceForm.hideHeroPushpin}
                        onCheckedChange={(checked) => setAppearanceForm({ ...appearanceForm, hideHeroPushpin: !!checked })}
                      />
                      <Label htmlFor="hideAppearanceHeroPushpin" className="text-sm font-semibold cursor-pointer text-slate-700">Raptiyeyi Gizle</Label>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border border-slate-200">
                      <Checkbox
                        id="hideAppearanceHeroText"
                        checked={!!appearanceForm.hideHeroText}
                        onCheckedChange={(checked) => setAppearanceForm({ ...appearanceForm, hideHeroText: !!checked })}
                      />
                      <Label htmlFor="hideAppearanceHeroText" className="text-sm font-semibold cursor-pointer text-slate-700">Başlık ve Alt Metni Gizle</Label>
                    </div>
                  </div>
                </div>
                <div className={`grid grid-cols-4 gap-4 transition-opacity duration-200 ${appearanceForm.hideHeroText ? 'opacity-40 pointer-events-none' : ''}`}>
                  <div className="space-y-2">
                    <Label>Hizalama</Label>
                    <Select
                      value={appearanceForm.heroAlignment}
                      onValueChange={(value) => setAppearanceForm({ ...appearanceForm, heroAlignment: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Sol</SelectItem>
                        <SelectItem value="center">Orta</SelectItem>
                        <SelectItem value="right">Sağ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Font</Label>
                    <Select
                      value={appearanceForm.heroTitleFont}
                      onValueChange={(value) => setAppearanceForm({ ...appearanceForm, heroTitleFont: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sans-serif">Sans Serif</SelectItem>
                        <SelectItem value="serif">Serif</SelectItem>
                        <SelectItem value="Patrick Hand, cursive">El Yazısı</SelectItem>
                        <SelectItem value="Dancing Script, cursive">Süslü</SelectItem>
                        <SelectItem value="monospace">Monospace</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Renk</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={appearanceForm.heroTitleColor}
                        onChange={(e) => setAppearanceForm({ ...appearanceForm, heroTitleColor: e.target.value })}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <Input
                        value={appearanceForm.heroTitleColor}
                        onChange={(e) => setAppearanceForm({ ...appearanceForm, heroTitleColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Boyut</Label>
                    <Select
                      value={appearanceForm.heroTitleSize}
                      onValueChange={(value) => setAppearanceForm({ ...appearanceForm, heroTitleSize: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4xl">Küçük (4xl)</SelectItem>
                        <SelectItem value="5xl">Orta (5xl)</SelectItem>
                        <SelectItem value="6xl">Büyük (6xl)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Subtitle Settings */}
              {/* Subtitle Settings */}
              <div className={`border-t border-gray-200 pt-6 mt-4 transition-opacity duration-200 ${appearanceForm.hideHeroText ? 'opacity-40 pointer-events-none' : ''}`}>
                <h4 className="text-sm font-bold text-slate-700 mb-4">Alt Başlık Ayarları</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Font</Label>
                    <Select
                      value={appearanceForm.heroSubtitleFont}
                      onValueChange={(value) => setAppearanceForm({ ...appearanceForm, heroSubtitleFont: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sans-serif">Sans Serif</SelectItem>
                        <SelectItem value="serif">Serif</SelectItem>
                        <SelectItem value="Patrick Hand, cursive">El Yazısı</SelectItem>
                        <SelectItem value="Dancing Script, cursive">Süslü</SelectItem>
                        <SelectItem value="monospace">Monospace</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Renk</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={appearanceForm.heroSubtitleColor}
                        onChange={(e) => setAppearanceForm({ ...appearanceForm, heroSubtitleColor: e.target.value })}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <Input
                        value={appearanceForm.heroSubtitleColor}
                        onChange={(e) => setAppearanceForm({ ...appearanceForm, heroSubtitleColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Boyut</Label>
                    <Select
                      value={appearanceForm.heroSubtitleSize}
                      onValueChange={(value) => setAppearanceForm({ ...appearanceForm, heroSubtitleSize: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lg">Küçük (lg)</SelectItem>
                        <SelectItem value="xl">Orta (xl)</SelectItem>
                        <SelectItem value="2xl">Büyük (2xl)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Section Preview */}
            <div
              className="rounded-lg p-4 border"
              style={{ backgroundColor: appearanceForm.categoryBgColor }}
            >
              <h3
                className="font-semibold"
                style={{
                  fontFamily: appearanceForm.categoryFont,
                  color: appearanceForm.categoryColor
                }}
              >
                Kategoriler Bölümü Önizleme
              </h3>
              <p style={{ color: appearanceForm.categoryColor, fontFamily: appearanceForm.categoryFont }}>
                Bu kategorinin sidebar'daki görünümü
              </p>
            </div>

            {/* Category Section Settings */}
            <div className="space-y-4 border rounded-lg p-4">
              <h3 className="font-semibold">Kategoriler Bölümü Ayarları</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Font</Label>
                  <Select
                    value={appearanceForm.categoryFont}
                    onValueChange={(value) => setAppearanceForm({ ...appearanceForm, categoryFont: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sans-serif">Sans Serif</SelectItem>
                      <SelectItem value="serif">Serif</SelectItem>
                      <SelectItem value="Patrick Hand, cursive">El Yazısı</SelectItem>
                      <SelectItem value="Dancing Script, cursive">Süslü</SelectItem>
                      <SelectItem value="monospace">Monospace</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Yazı Rengi</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={appearanceForm.categoryColor}
                      onChange={(e) => setAppearanceForm({ ...appearanceForm, categoryColor: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={appearanceForm.categoryColor}
                      onChange={(e) => setAppearanceForm({ ...appearanceForm, categoryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Arkaplan Rengi</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={appearanceForm.categoryBgColor}
                      onChange={(e) => setAppearanceForm({ ...appearanceForm, categoryBgColor: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={appearanceForm.categoryBgColor}
                      onChange={(e) => setAppearanceForm({ ...appearanceForm, categoryBgColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Kurdele Rengi</Label>
                    <div className="flex items-center gap-1.5 font-normal">
                      <Checkbox
                        id="noAppearanceRibbon"
                        checked={appearanceForm.ribbonColor === 'none'}
                        onCheckedChange={(checked) => setAppearanceForm({ ...appearanceForm, ribbonColor: checked ? 'none' : '#502bb1' })}
                      />
                      <Label htmlFor="noAppearanceRibbon" className="text-[10px] cursor-pointer italic text-gray-500">Kaldır (Kurdele Yok)</Label>
                    </div>
                  </div>
                  <div className={`flex gap-2 ${appearanceForm.ribbonColor === 'none' ? 'opacity-50 pointer-events-none' : ''}`}>
                    <input
                      type="color"
                      value={appearanceForm.ribbonColor === 'none' ? '#ffffff' : (appearanceForm.ribbonColor || '#502bb1')}
                      onChange={(e) => setAppearanceForm({ ...appearanceForm, ribbonColor: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={appearanceForm.ribbonColor === 'none' ? 'Yok' : (appearanceForm.ribbonColor || '#502bb1')}
                      onChange={(e) => setAppearanceForm({ ...appearanceForm, ribbonColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAppearanceModal(false)}>İptal</Button>
            <Button onClick={handleSaveAppearance}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >

      {/* Modals */}
      {/* ... (Existing User, Wall, Postit Modals) ... */}

      {/* Location Modal */}
      <Dialog open={showLocationModal} onOpenChange={setShowLocationModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem
                ? (locationForm.type === 'CITY' ? 'İl Düzenle' : 'İlçe Düzenle')
                : (locationForm.type === 'CITY' ? 'Yeni İl Ekle' : 'Yeni İlçe Ekle')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {locationForm.type === 'DISTRICT' && (
              <div className="space-y-2">
                <Label>Bağlı Olduğu İl</Label>
                <Select
                  value={locationForm.cityId}
                  onValueChange={(value) => setLocationForm({ ...locationForm, cityId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="İl seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map(city => (
                      <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>{locationForm.type === 'CITY' ? 'İl Adı' : 'İlçe Adı'}</Label>
              <Input
                value={locationForm.name}
                onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                placeholder={locationForm.type === 'CITY' ? 'Örn: İstanbul' : 'Örn: Kadıköy'}
              />
            </div>
            {locationForm.type === 'CITY' && (
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="showInWeather"
                  checked={locationForm.showInWeather}
                  onCheckedChange={(checked) => setLocationForm({ ...locationForm, showInWeather: !!checked })}
                />
                <Label htmlFor="showInWeather" className="font-normal cursor-pointer">
                  Hava Durumu Duvarında Göster (Hava durumu api ile çekilir)
                </Label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setShowLocationModal(false)}>
              İptal
            </Button>
            <Button type="button" onClick={handleSaveLocation}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Modal */}
      <Dialog open={showRoleModal} onOpenChange={setShowRoleModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Rolü Düzenle' : 'Yeni Rol Ekle'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Rol Adı</Label>
              <Input
                value={roleForm.name}
                onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                placeholder="Örn: Editor, Moderator"
              />
            </div>
            <div className="space-y-2">
              <Label>Açıklama</Label>
              <Textarea
                value={roleForm.description}
                onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                placeholder="Rolün yetkileri ve amacı..."
              />
            </div>
            <div className="space-y-2">
              <Label>Erişilebilir Menüler (Yetkiler)</Label>
              <div className="grid grid-cols-1 gap-4 border p-3 rounded-md max-h-[400px] overflow-y-auto bg-white">
                {[
                  { module: 'dashboard', label: 'Dashboard', actions: [{id: 'dashboard', label: 'Görüntüle'}] },
                  { module: 'walls', label: 'Duvarlar', actions: [ {id: 'walls_view', label: 'Görüntüle'}, {id: 'walls_create', label: 'Ekle'}, {id: 'walls_edit', label: 'Düzenle'}, {id: 'walls_delete', label: 'Sil'}, {id: 'walls_reorder', label: 'Sırala'} ] },
                  { module: 'users', label: 'Kullanıcı Yönetimi', actions: [ {id: 'users_view', label: 'Görüntüle'}, {id: 'users_create', label: 'Ekle'}, {id: 'users_edit', label: 'Düzenle'}, {id: 'users_delete', label: 'Sil'} ] },
                  { module: 'roles', label: 'Yetki Türü Tanımla', actions: [ {id: 'roles_view', label: 'Görüntüle'}, {id: 'roles_create', label: 'Ekle'}, {id: 'roles_edit', label: 'Düzenle'}, {id: 'roles_delete', label: 'Sil'} ] },
                  { module: 'groups', label: 'Kullanıcı Grupları', actions: [ {id: 'groups_view', label: 'Görüntüle'}, {id: 'groups_create', label: 'Ekle'}, {id: 'groups_edit', label: 'Düzenle'}, {id: 'groups_delete', label: 'Sil'} ] },
                  { module: 'postits', label: 'Kategori Bazında Notlar', actions: [ {id: 'postits_view', label: 'Görüntüle'}, {id: 'postits_edit', label: 'Düzenle'}, {id: 'postits_approve', label: 'Onay'}, {id: 'postits_publish', label: 'Yayın'}, {id: 'postits_delete', label: 'Sil'}, {id: 'postits_auto_approve', label: 'Süper Adminsiz Onay'} ] },
                    { module: 'user_postits', label: 'Kullanıcı Bazında Notlar', actions: [ {id: 'user_postits_view', label: 'Görüntüle'}, {id: 'user_postits_edit', label: 'Düzenle'}, {id: 'user_postits_approve', label: 'Onay'}, {id: 'user_postits_publish', label: 'Yayın'}, {id: 'user_postits_delete', label: 'Sil'}, {id: 'user_postits_auto_approve', label: 'Süper Adminsiz Onay'} ] },
                  { module: 'user_postits', label: 'Kullanıcı Bazında Notlar', actions: [ {id: 'user_postits_view', label: 'Görüntüle'}, {id: 'user_postits_edit', label: 'Düzenle'}, {id: 'user_postits_approve', label: 'Onay'}, {id: 'user_postits_publish', label: 'Yayın'}, {id: 'user_postits_delete', label: 'Sil'}, {id: 'user_postits_auto_approve', label: 'Süper Adminsiz Onay'} ] },
                  { module: 'postit_management', label: 'Postit Yönetimi', actions: [ {id: 'postit_management_view', label: 'Görüntüle'}, {id: 'postit_management_edit', label: 'Düzenle'} ] },
                  { module: 'sliders', label: 'Slayder', actions: [ {id: 'sliders_view', label: 'Görüntüle'}, {id: 'sliders_create', label: 'Ekle'}, {id: 'sliders_edit', label: 'Düzenle'}, {id: 'sliders_delete', label: 'Sil'} ] },
                  { module: 'locations', label: 'İl/İlçe', actions: [ {id: 'locations_view', label: 'Görüntüle'}, {id: 'locations_create', label: 'Ekle'}, {id: 'locations_edit', label: 'Düzenle'}, {id: 'locations_delete', label: 'Sil'} ] },
                  { module: 'calendar', label: 'Takvim', actions: [ {id: 'calendar_view', label: 'Görüntüle'}, {id: 'calendar_create', label: 'Ekle'}, {id: 'calendar_edit', label: 'Düzenle'}, {id: 'calendar_delete', label: 'Sil'} ] },
                  { module: 'appearance', label: 'Ek Sayfalar', actions: [ {id: 'appearance_view', label: 'Görüntüle'}, {id: 'appearance_edit', label: 'Düzenle'} ] },
                  { module: 'ads', label: 'Reklam', actions: [ {id: 'ads_view', label: 'Görüntüle'}, {id: 'ads_create', label: 'Ekle'}, {id: 'ads_edit', label: 'Düzenle'}, {id: 'ads_delete', label: 'Sil'} ] }
                ].map(group => (
                  <div key={group.module} className="bg-gray-50 p-3 rounded border">
                    <h4 className="font-semibold text-gray-800 mb-3 border-b pb-1">{group.label}</h4>
                    <div className="flex flex-wrap gap-4">
                      {group.actions.map(perm => (
                        <div key={perm.id} className="flex items-center space-x-2">
                          <Checkbox
                            checked={roleForm.permissions?.includes(perm.id) || roleForm.permissions?.includes(group.module)}
                            onCheckedChange={(checked) => {
                              const currentPerms = roleForm.permissions || [];
                              if (checked) {
                                const newPerms = [...currentPerms, perm.id].filter(p => p !== group.module);
                                setRoleForm({ ...roleForm, permissions: newPerms })
                              } else {
                                const newPerms = currentPerms.filter(p => p !== perm.id && p !== group.module);
                                setRoleForm({ ...roleForm, permissions: newPerms })
                              }
                            }}
                          />
                          <Label className="text-sm font-normal cursor-pointer select-none">{perm.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setShowRoleModal(false)}>
              İptal
            </Button>
            <Button type="button" onClick={handleSaveRole}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Group Modal */}
      <Dialog open={showUserGroupModal} onOpenChange={setShowUserGroupModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Grubu Düzenle' : 'Yeni Grup Ekle'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Grup Adı</Label>
              <Input
                value={userGroupForm.name}
                onChange={(e) => setUserGroupForm({ ...userGroupForm, name: e.target.value })}
                placeholder="Örn: Pazarlama, Satış"
              />
            </div>
            <div className="space-y-2">
              <Label>Açıklama</Label>
              <Textarea
                value={userGroupForm.description}
                onChange={(e) => setUserGroupForm({ ...userGroupForm, description: e.target.value })}
                placeholder="Grup hakkında..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setShowUserGroupModal(false)}>
              İptal
            </Button>
            <Button type="button" onClick={handleSaveUserGroup}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-4 px-2">
            
            {/* SOL KOLON: Temel Bilgiler ve Gruplar */}
            <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-2 pb-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ad Soyad</Label>
                  <Input
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Takma Ad (Nickname)</Label>
                  <Input
                    value={userForm.nickname}
                    onChange={(e) => setUserForm({ ...userForm, nickname: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefon Numarası</Label>
                  <Input
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Şifre {editingItem && '(Boş bırakırsanız değişmez)'}</Label>
                <Input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Firma Adı</Label>
                  <Input
                    value={userForm.companyName}
                    onChange={(e) => setUserForm({ ...userForm, companyName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>T.C. Kimlik / Vergi No</Label>
                  <Input
                    value={userForm.taxId}
                    onChange={(e) => setUserForm({ ...userForm, taxId: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>İl</Label>
                  <Select
                    value={userForm.cityId || 'none'}
                    onValueChange={(value) => setUserForm({ ...userForm, cityId: value === 'none' ? '' : value, districtId: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="İl seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">İl Yok</SelectItem>
                      {cities.map(city => (
                        <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>İlçe</Label>
                  <Select
                    value={userForm.districtId || 'none'}
                    onValueChange={(value) => setUserForm({ ...userForm, districtId: value === 'none' ? '' : value })}
                    disabled={!userForm.cityId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="İlçe seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">İlçe Yok</SelectItem>
                      {userForm.cityId && districts
                        .filter(d => d.cityId === userForm.cityId)
                        .map(district => (
                          <SelectItem key={district.id} value={district.id}>{district.name}</SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 border p-3 rounded-md bg-gray-50">
                <Label className="font-semibold block mb-3 text-gray-700">Bildirim Tercihleri</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="userAdminNoEmail"
                    checked={userForm.receiveEmail === false}
                    onCheckedChange={(checked) => setUserForm({ ...userForm, receiveEmail: !checked })}
                  />
                  <Label htmlFor="userAdminNoEmail" className="font-normal cursor-pointer text-sm">Panodasehir den "Mail almak istemiyorum"</Label>
                </div>
                <div className="flex items-center space-x-2 mt-3">
                  <Checkbox
                    id="userAdminNoTelegram"
                    checked={userForm.receiveTelegram === false}
                    onCheckedChange={(checked) => setUserForm({ ...userForm, receiveTelegram: !checked })}
                  />
                  <Label htmlFor="userAdminNoTelegram" className="font-normal cursor-pointer text-sm">Bildirim Almak İstemiyorum (Telegram mesajları kapatılır)</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Rol</Label>
                <Select
                  value={userForm.role}
                  onValueChange={(value) => setUserForm({ ...userForm, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.length > 0 ? (
                      roles
                        .filter(r => role === 'SUPER_ADMIN' || r.name === 'USER' || r.name === 'WALL_USER')
                        .map((r) => (
                          <SelectItem key={r.id} value={r.name}>
                            <div className="flex flex-col items-start py-1">
                              <span className="font-medium">{r.name}</span>
                              {r.description && (
                                <span className="text-xs text-muted-foreground text-left max-w-[300px] whitespace-normal">
                                  {r.description}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))
                    ) : (
                      <>
                        <SelectItem value="USER">Standart Kullanıcı</SelectItem>
                        {(role === 'SUPER_ADMIN' || role === 'WALL_MANAGER') && (
                          <SelectItem value="WALL_USER">Duvar Kullanıcısı</SelectItem>
                        )}
                        {role === 'SUPER_ADMIN' && (
                          <>
                            <SelectItem value="WALL_MANAGER">Duvar Yöneticisi</SelectItem>
                            <SelectItem value="SUPER_ADMIN">Süper Admin</SelectItem>
                          </>
                        )}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 flex-1 flex flex-col mt-2">
                <Label>Kullanıcı Grupları</Label>
                <div className="grid grid-cols-1 gap-2 flex-1 max-h-[250px] overflow-y-auto p-3 border rounded-md bg-white">
                  {userGroups.map((group) => (
                    <div key={group.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md border border-transparent hover:border-gray-200 transition-colors">
                      <Checkbox
                        id={`user-group-${group.id}`}
                        checked={(userForm.userGroupIds || []).includes(group.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setUserForm({ ...userForm, userGroupIds: [...(userForm.userGroupIds || []), group.id] })
                          } else {
                            setUserForm({ ...userForm, userGroupIds: (userForm.userGroupIds || []).filter(id => id !== group.id) })
                          }
                        }}
                      />
                      <label htmlFor={`user-group-${group.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1 py-1">
                        <div className="font-semibold text-gray-800">{group.name}</div>
                        {group.description && <div className="text-xs text-gray-500 mt-1">{group.description}</div>}
                      </label>
                    </div>
                  ))}
                  {userGroups.length === 0 && (
                    <div className="text-sm text-gray-500 text-center py-4">Kayıtlı grup bulunamadı.</div>
                  )}
                </div>
              </div>
            </div>

            {/* SAĞ KOLON: Yetkiler */}
            <div className="flex flex-col h-full overflow-hidden">
              <div className="space-y-2 flex-1 flex flex-col h-full">
                <Label className="flex items-center justify-between">
                  <span>Özel Menü / İşlem Yetkileri</span>
                </Label>
                <p className="text-[11px] text-gray-500 font-normal mb-1">
                  (İsteğe bağlı - Sadece seçilen yetkiler geçerli olur)
                </p>
                <div className="grid grid-cols-1 gap-4 border p-3 rounded-md flex-1 max-h-[600px] overflow-y-auto bg-slate-50/50">
                  {[
                    { module: 'dashboard', label: 'Dashboard', actions: [{id: 'dashboard', label: 'Görüntüle'}] },
                    { module: 'walls', label: 'Duvarlar', actions: [ {id: 'walls_view', label: 'Görüntüle'}, {id: 'walls_create', label: 'Ekle'}, {id: 'walls_edit', label: 'Düzenle'}, {id: 'walls_delete', label: 'Sil'}, {id: 'walls_reorder', label: 'Sırala'} ] },
                    { module: 'users', label: 'Kullanıcı Yönetimi', actions: [ {id: 'users_view', label: 'Görüntüle'}, {id: 'users_create', label: 'Ekle'}, {id: 'users_edit', label: 'Düzenle'}, {id: 'users_delete', label: 'Sil'} ] },
                    { module: 'roles', label: 'Yetki Türü Tanımla', actions: [ {id: 'roles_view', label: 'Görüntüle'}, {id: 'roles_create', label: 'Ekle'}, {id: 'roles_edit', label: 'Düzenle'}, {id: 'roles_delete', label: 'Sil'} ] },
                    { module: 'groups', label: 'Kullanıcı Grupları', actions: [ {id: 'groups_view', label: 'Görüntüle'}, {id: 'groups_create', label: 'Ekle'}, {id: 'groups_edit', label: 'Düzenle'}, {id: 'groups_delete', label: 'Sil'} ] },
                    { module: 'postits', label: 'Kategori Bazında Notlar', actions: [ {id: 'postits_view', label: 'Görüntüle'}, {id: 'postits_edit', label: 'Düzenle'}, {id: 'postits_approve', label: 'Onay'}, {id: 'postits_publish', label: 'Yayın'}, {id: 'postits_delete', label: 'Sil'}, {id: 'postits_auto_approve', label: 'Süper Adminsiz Onay'} ] },
                    { module: 'user_postits', label: 'Kullanıcı Bazında Notlar', actions: [ {id: 'user_postits_view', label: 'Görüntüle'}, {id: 'user_postits_edit', label: 'Düzenle'}, {id: 'user_postits_approve', label: 'Onay'}, {id: 'user_postits_publish', label: 'Yayın'}, {id: 'user_postits_delete', label: 'Sil'}, {id: 'user_postits_auto_approve', label: 'Süper Adminsiz Onay'} ] },
                    { module: 'postit_management', label: 'Postit Yönetimi', actions: [ {id: 'postit_management_view', label: 'Görüntüle'}, {id: 'postit_management_edit', label: 'Düzenle'} ] },
                    { module: 'sliders', label: 'Slayder', actions: [ {id: 'sliders_view', label: 'Görüntüle'}, {id: 'sliders_create', label: 'Ekle'}, {id: 'sliders_edit', label: 'Düzenle'}, {id: 'sliders_delete', label: 'Sil'} ] },
                    { module: 'locations', label: 'İl/İlçe', actions: [ {id: 'locations_view', label: 'Görüntüle'}, {id: 'locations_create', label: 'Ekle'}, {id: 'locations_edit', label: 'Düzenle'}, {id: 'locations_delete', label: 'Sil'} ] },
                    { module: 'calendar', label: 'Takvim', actions: [ {id: 'calendar_view', label: 'Görüntüle'}, {id: 'calendar_create', label: 'Ekle'}, {id: 'calendar_edit', label: 'Düzenle'}, {id: 'calendar_delete', label: 'Sil'} ] },
                    { module: 'appearance', label: 'Ek Sayfalar', actions: [ {id: 'appearance_view', label: 'Görüntüle'}, {id: 'appearance_edit', label: 'Düzenle'} ] },
                    { module: 'ads', label: 'Reklam', actions: [ {id: 'ads_view', label: 'Görüntüle'}, {id: 'ads_create', label: 'Ekle'}, {id: 'ads_edit', label: 'Düzenle'}, {id: 'ads_delete', label: 'Sil'} ] }
                  ].map(group => (
                    <div key={group.module} className="bg-white p-2.5 rounded shadow-sm border border-gray-100 hover:border-indigo-100 hover:shadow-md transition-all">
                      <h4 className="font-semibold text-[13px] text-gray-800 mb-2 border-b border-gray-100 pb-1.5 flex justify-between">
                        {group.label}
                      </h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-2">
                        {group.actions.map(perm => (
                          <div key={perm.id} className="flex items-center space-x-1.5 bg-gray-50/50 px-2 py-1 rounded">
                            <Checkbox
                              checked={userForm.permissions?.includes(perm.id) || userForm.permissions?.includes(group.module)}
                              onCheckedChange={(checked) => {
                                const currentPerms = userForm.permissions || [];
                                if (checked) {
                                  const newPerms = [...currentPerms, perm.id].filter(p => p !== group.module);
                                  setUserForm({ ...userForm, permissions: newPerms })
                                } else {
                                  const newPerms = currentPerms.filter(p => p !== perm.id && p !== group.module);
                                  setUserForm({ ...userForm, permissions: newPerms })
                                }
                              }}
                            />
                            <Label className="text-[12px] font-medium cursor-pointer select-none text-gray-600">
                              {perm.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setShowUserModal(false)}>
              İptal
            </Button>
            <Button type="button" onClick={handleSaveUser}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showMerchantModal} onOpenChange={setShowMerchantModal}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col p-0 bg-white">
          <DialogHeader className="px-6 py-4 border-b shrink-0 bg-slate-50">
            <DialogTitle className="text-xl text-slate-800">Firma Başvuru Detayları</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <Tabs defaultValue="temel">
              <TabsList className="mb-4 grid w-full grid-cols-4 h-12 bg-slate-100">
                <TabsTrigger value="temel" className="text-sm">Temel Bilgiler</TabsTrigger>
                <TabsTrigger value="resmi" className="text-sm">Resmi Bilgiler</TabsTrigger>
                <TabsTrigger value="evraklar" className="text-sm">Evraklar</TabsTrigger>
                <TabsTrigger value="duvarlar" className="text-sm">Duvarlar</TabsTrigger>
              </TabsList>
              
              <TabsContent value="temel" className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Mağaza Adı</label>
                    <Input value={merchantForm.storeName} onChange={e => setMerchantForm({...merchantForm, storeName: e.target.value})} className="border-slate-200" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Kullanıcı Adı</label>
                    <Input value={merchantForm.username} readOnly className="bg-slate-50 border-slate-200 text-slate-600" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Firma Tipi</label>
                    <Input value={merchantForm.companyType === 'SOLE' ? 'Şahıs' : merchantForm.companyType === 'LTD' ? 'Ltd / A.Ş.' : 'Diğer'} readOnly className="bg-slate-50 border-slate-200 text-slate-600" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Slogan</label>
                    <Input value={merchantForm.storeSlogan} readOnly className="bg-slate-50 border-slate-200 text-slate-600" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5 mt-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Yetkili Adı</label>
                    <Input value={merchantForm.contactFirstName} onChange={e => setMerchantForm({...merchantForm, contactFirstName: e.target.value})} className="border-slate-200" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Yetkili Soyadı</label>
                    <Input value={merchantForm.contactLastName} onChange={e => setMerchantForm({...merchantForm, contactLastName: e.target.value})} className="border-slate-200" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">E-Posta</label>
                    <Input value={merchantForm.contactEmail} onChange={e => setMerchantForm({...merchantForm, contactEmail: e.target.value})} className="border-slate-200" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Telefon</label>
                    <Input value={merchantForm.contactPhone} onChange={e => setMerchantForm({...merchantForm, contactPhone: e.target.value})} className="border-slate-200" />
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Adres</label>
                  <Input value={merchantForm.address} readOnly className="bg-slate-50 border-slate-200 text-slate-600" />
                </div>
              </TabsContent>
              
              <TabsContent value="resmi" className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Vergi Dairesi</label>
                    <Input value={merchantForm.taxOffice} onChange={e => setMerchantForm({...merchantForm, taxOffice: e.target.value})} className="border-slate-200" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Vergi Numarası</label>
                    <Input value={merchantForm.taxId} onChange={e => setMerchantForm({...merchantForm, taxId: e.target.value})} className="border-slate-200" />
                  </div>
                </div>
                <div className="mt-6">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">IBAN Numarası</label>
                  <Input value={merchantForm.iban} readOnly className="bg-slate-50 border-slate-200 text-slate-600 font-mono tracking-wider" />
                </div>
                {merchantForm.companyType !== 'SOLE' && (
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Mersis / Ticaret Sicil No</label>
                    <Input value={merchantForm.registryNumber} readOnly className="bg-slate-50 border-slate-200 text-slate-600" />
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="evraklar" className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-5">
                  <div className="p-4 border border-slate-200 rounded-lg shadow-sm bg-white hover:border-slate-300 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <p className="font-semibold text-sm text-slate-700">Vergi Levhası</p>
                    </div>
                    {merchantForm.taxPlateUrl ? <a href={merchantForm.taxPlateUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700 hover:underline text-xs break-all line-clamp-2" title={merchantForm.taxPlateUrl}>{merchantForm.taxPlateUrl.split('/').pop()}</a> : <span className="text-xs text-slate-400 italic">Evrak yüklenmemiş</span>}
                  </div>
                  <div className="p-4 border border-slate-200 rounded-lg shadow-sm bg-white hover:border-slate-300 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <p className="font-semibold text-sm text-slate-700">İmza Sirküsü</p>
                    </div>
                    {merchantForm.signatureCircularUrl ? <a href={merchantForm.signatureCircularUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700 hover:underline text-xs break-all line-clamp-2" title={merchantForm.signatureCircularUrl}>{merchantForm.signatureCircularUrl.split('/').pop()}</a> : <span className="text-xs text-slate-400 italic">Evrak yüklenmemiş</span>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div className="p-4 border border-slate-200 rounded-lg shadow-sm bg-white hover:border-slate-300 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <p className="font-semibold text-sm text-slate-700">Kimlik Ön Yüzü</p>
                    </div>
                    {merchantForm.idCardFrontUrl ? <a href={merchantForm.idCardFrontUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700 hover:underline text-xs break-all line-clamp-2" title={merchantForm.idCardFrontUrl}>{merchantForm.idCardFrontUrl.split('/').pop()}</a> : <span className="text-xs text-slate-400 italic">Evrak yüklenmemiş</span>}
                  </div>
                  <div className="p-4 border border-slate-200 rounded-lg shadow-sm bg-white hover:border-slate-300 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <p className="font-semibold text-sm text-slate-700">Kimlik Arka Yüzü</p>
                    </div>
                    {merchantForm.idCardBackUrl ? <a href={merchantForm.idCardBackUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700 hover:underline text-xs break-all line-clamp-2" title={merchantForm.idCardBackUrl}>{merchantForm.idCardBackUrl.split('/').pop()}</a> : <span className="text-xs text-slate-400 italic">Evrak yüklenmemiş</span>}
                  </div>
                </div>
                {merchantForm.companyType !== 'SOLE' && (
                  <div className="p-4 border border-slate-200 rounded-lg shadow-sm bg-white hover:border-slate-300 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <p className="font-semibold text-sm text-slate-700">Ticaret Sicil Gazetesi</p>
                    </div>
                    {merchantForm.tradeRegistryGazetteUrl ? <a href={merchantForm.tradeRegistryGazetteUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700 hover:underline text-xs break-all line-clamp-2" title={merchantForm.tradeRegistryGazetteUrl}>{merchantForm.tradeRegistryGazetteUrl.split('/').pop()}</a> : <span className="text-xs text-slate-400 italic">Evrak yüklenmemiş</span>}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="duvarlar" className="space-y-4 pt-2">
                <div className="p-5 border border-slate-200 rounded-lg shadow-sm bg-white">
                  <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                    <LayoutGrid className="w-5 h-5 text-indigo-500" />
                    <p className="text-sm font-semibold text-slate-800">Firmanın Paylaşım Talep Ettiği Duvarlar</p>
                  </div>
                  {merchantForm.selectedWallIds.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {merchantForm.selectedWallIds.map(wid => {
                        const foundWall = walls.find(w => w.id === wid);
                        return (
                          <div key={wid} className="flex items-center gap-2 bg-indigo-50 p-2.5 rounded border border-indigo-100">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></div>
                            <span className="text-sm text-indigo-900 font-medium truncate">{foundWall ? foundWall.name : wid}</span>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-slate-500">Herhangi bir duvar seçimi bulunmuyor.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 shrink-0 flex flex-col md:flex-row gap-4 justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10 relative">
            <div className="flex-1 w-full max-w-[240px]">
              <label className="block text-[10px] font-bold tracking-wider uppercase text-slate-500 mb-1.5 ml-1">Kayıt Onay Durumu</label>
              <Select
                value={merchantForm.status}
                onValueChange={(value) => setMerchantForm({ ...merchantForm, status: value })}
              >
                <SelectTrigger className={`border-2 shadow-sm font-semibold transition-colors ${merchantForm.status === 'APPROVED' ? 'border-green-500 text-green-700 bg-green-50 ring-green-500/20' : merchantForm.status === 'PENDING' ? 'border-yellow-400 text-yellow-700 bg-yellow-50 ring-yellow-400/20' : 'border-red-500 text-red-700 bg-red-50 ring-red-500/20'}`}>
                  <SelectValue placeholder="Durum seç" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING" className="font-semibold text-yellow-700 cursor-pointer hover:bg-yellow-50">⏳ Onay Bekliyor</SelectItem>
                  <SelectItem value="APPROVED" className="font-semibold text-green-700 cursor-pointer hover:bg-green-50">✅ Başvuruyu Onayla</SelectItem>
                  <SelectItem value="REJECTED" className="font-semibold text-red-700 cursor-pointer hover:bg-red-50">❌ Başvuruyu Reddet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0 items-end">
              <Button variant="outline" type="button" onClick={() => setShowMerchantModal(false)} className="border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-800">
                İptal
              </Button>
              <Button onClick={handleSaveMerchant} className="px-6 shadow-md bg-slate-800 hover:bg-slate-900 border border-slate-900 text-white font-medium flex gap-2 items-center">
                <Save className="w-4 h-4" /> Değişiklikleri Kaydet
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showWallModal} onOpenChange={setShowWallModal}>
        <DialogContent className="w-[95vw] sm:max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Duvar Düzenle' : wallForm.parentId ? 'Alt Kategori Ekle' : 'Yeni Ana Duvar'}
            </DialogTitle>
            {wallForm.parentId && parentWallForSubcategory && (
              <DialogDescription>
                Üst Kategori: <strong>{parentWallForSubcategory.name}</strong>
              </DialogDescription>
            )}
            
            {showWallModal && editingItem && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-4 p-3 bg-amber-50/50 rounded-lg border border-amber-200/60 shadow-sm animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-amber-500" />
                  <span className="text-sm font-semibold text-amber-800 whitespace-nowrap">Şablondan Aktar:</span>
                </div>
                <div className="flex-1">
                  <Select key={`template-select-${Date.now()}`} value="" onValueChange={(val) => handleCopySettings(val)}>
                    <SelectTrigger className="w-full h-8 bg-white border-amber-200 text-amber-900 focus:ring-amber-400">
                      <SelectValue placeholder="Görünüm, Pano ve OTT ayarları alınacak duvarı seçin..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        const buildHierarchical = (parentId: string | null, indent: number): any[] => {
                          const nodes = walls.filter(w => (parentId ? w.parentId === parentId : !w.parentId)).sort((a, b) => a.name.localeCompare(b.name));
                          let result: any[] = [];
                          nodes.forEach(node => {
                            result.push({ ...node, indent });
                            result = result.concat(buildHierarchical(node.id, indent + 1));
                          });
                          return result;
                        };
                        
                        const hierarchical = buildHierarchical(null, 0);
                        
                        return hierarchical
                          .filter(c => c.id !== editingItem?.id)
                          .map(c => (
                            <SelectItem key={c.id} value={c.id}>
                              <span style={{ marginLeft: `${c.indent * 1}rem` }} className={c.indent === 0 ? "font-medium" : ""}>
                                {c.indent > 0 && <span className="text-gray-400 mr-1.5">└</span>}
                                {c.name}
                              </span>
                            </SelectItem>
                          ));
                      })()}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </DialogHeader>
          <div className="py-4">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="flex flex-wrap gap-2 w-full mb-6 bg-slate-100/50 p-1.5 rounded-lg justify-start h-auto">
                <TabsTrigger value="general" className="flex items-center gap-2 flex-grow sm:flex-grow-0">
                  <Info className="w-4 h-4" /> Genel Bilgiler
                </TabsTrigger>
                <TabsTrigger value="appearance" className="flex items-center gap-2">
                  <Palette className="w-4 h-4" /> Görünüm Ayarları
                </TabsTrigger>
                <TabsTrigger value="sliders" className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Slayder Yönetimi
                </TabsTrigger>
                <TabsTrigger value="calendar" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Takvim Alanları
                </TabsTrigger>
                <TabsTrigger value="logo" className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Logo Ayarları
                </TabsTrigger>
                <TabsTrigger value="homeCategories" className="flex items-center gap-2 flex-grow sm:flex-grow-0">
                  <ListTree className="w-4 h-4" /> Duvar İçeriği Yönetimi
                </TabsTrigger>
                <TabsTrigger value="layout" className="flex items-center gap-2 flex-grow sm:flex-grow-0">
                  <LayoutGrid className="w-4 h-4" /> Pano Düzeni
                </TabsTrigger>
                <TabsTrigger value="ott" className="flex items-center gap-2 flex-grow sm:flex-grow-0">
                  <LayoutTemplate className="w-4 h-4" /> OTT Mod
                </TabsTrigger>
                <TabsTrigger value="styleMode" className="flex items-center gap-2 flex-grow sm:flex-grow-0 border-indigo-200 text-indigo-700 bg-indigo-50 data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-800">
                  <Wand2 className="w-4 h-4" /> Stil Mod
                </TabsTrigger>
                {(!editingItem || editingItem.name !== 'Ana Duvar') && (
                  <TabsTrigger value="editor" className="flex items-center gap-2 flex-grow sm:flex-grow-0 border-pink-200 text-pink-700 bg-pink-50 data-[state=active]:bg-pink-100 data-[state=active]:text-pink-800">
                    <PenTool className="w-4 h-4" /> Editör Modu
                  </TabsTrigger>
                )}
              </TabsList>



              <TabsContent value="general" className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Duvar Adı</Label>
                  <Input
                    value={wallForm.name}
                    onChange={(e) => setWallForm({ ...wallForm, name: e.target.value })}
                  />
                </div>
                {(!editingItem || editingItem.name !== 'Ana Duvar') && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-3 rounded-md bg-gray-50/50">
                    <div className="space-y-2">
                      <Label>Duvar Durumu (Kiralama)</Label>
                      <div className="flex items-center space-x-2 border border-gray-200 shadow-sm rounded-md p-2 h-10 w-full bg-white">
                        <Checkbox 
                          id="wall-is-active"
                          checked={wallForm.isActive}
                          onCheckedChange={(checked) => setWallForm({ ...wallForm, isActive: !!checked })}
                        />
                        <Label htmlFor="wall-is-active" className="cursor-pointer font-medium text-sm">
                          {wallForm.isActive ? <span className="text-emerald-600">🟢 Aktif (Sayfada Görünür)</span> : <span className="text-red-500">🔴 Pasif (Ziyaretçiye Gizli)</span>}
                        </Label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Özel Duvar (Gizlilik)</Label>
                      <div className="flex items-center space-x-2 border border-gray-200 shadow-sm rounded-md p-2 h-10 w-full bg-white">
                        <Checkbox 
                          id="wall-is-private"
                          checked={wallForm.isPrivate}
                          onCheckedChange={(checked) => setWallForm({ ...wallForm, isPrivate: !!checked })}
                        />
                        <Label htmlFor="wall-is-private" className="cursor-pointer font-medium text-sm">
                          {wallForm.isPrivate ? <span className="text-purple-600">🔒 Özel (Liste Dışı)</span> : <span className="text-gray-600">🔓 Herkese Açık</span>}
                        </Label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Son Görüntülenme Tarihi</Label>
                      <Input
                        type="date"
                        value={wallForm.expirationDate}
                        onChange={(e) => setWallForm({ ...wallForm, expirationDate: e.target.value })}
                        className="h-10"
                      />
                      <p className="text-[10px] text-gray-500 mt-1">Bu tarihten sonra duvar otomatik olarak pasif duruma geçer ve gizlenir. Boş bırakırsanız süresiz olur.</p>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Menü İkonu (Emoji)</Label>
                  <div className="flex gap-2 items-center text-sm">
                    <Input
                      className="w-16 text-center text-xl h-10"
                      value={wallForm.icon || ''}
                      onChange={(e) => setWallForm({ ...wallForm, icon: e.target.value })}
                      placeholder="📌"
                      maxLength={4}
                    />
                    <div className="flex flex-wrap gap-1 items-center flex-1 w-full bg-gray-50 border p-1 rounded-md">
                      {['📌', '📚', '🎭', '🎨', '💼', '🛍️', '🎓', '🏥', '⚽', '🎬', '🍽️', '💡', '🎵', '🌿', '🏢', '⚡', '🌟', '🚀', '🔥', '🌍', '🏠', '📸', '🎧', '🎸', '🎮', '🚗', '✈️', '⛵', '🗺️', '🍔', '🍕', '☕', '🍺', '🍎', '🍉', '🍓', '🏀', '🎾', '🥊', '🚴', '🏆', '🥇', '🐕', '🐈', '🐘', '🦋', '🌹', '🌻', '🌲', '🌙', '⭐', '☀️', '🌧️', '⛄', '💻', '📱', '⌚', '🛒', '🎁', '🎈', '🎉', '🎊', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '✅', '❌', '⚠️', 'ℹ️', '💬', '💭', '🔔', '📣', '💄', '💅', '💇‍♀️', '👗', '👠', '👜', '💍', '🎀', '👨', '👩', '👧', '👦', '👶', '👵', '👴', '👮', '🕵️', '🦸', '🧚', '🧜‍♀️', '💳', '💸', '💰', '🧾', '🏷️', '💃', '🕺', '👯‍♀️', '🩰', '🪩', '⚕️', '🩺', '💊', '🚑', '🩸', '🦠', '🧬', '🎒', '🏫', '📖', '📝', '✏️', '📐', '🔬', '🍼', '🎠', '🪁', '🧸', '🪀', '🏙️', '🌆', '🌇', '🌉', '🗽', '🗼', '🎢', '🎡', '🏦', '🏬', '🕌'].map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setWallForm({ ...wallForm, icon: emoji })}
                          className={`w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm transition-all ${wallForm.icon === emoji ? 'bg-blue-100 border border-blue-300 shadow-sm' : 'border border-transparent'}`}
                          title="İkon seç"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Açıklama</Label>
                  <Textarea
                    value={wallForm.description}
                    onChange={(e) => setWallForm({ ...wallForm, description: e.target.value })}
                  />
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-semibold text-gray-700">İletişim Bilgileri (İsteğe Bağlı)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border">
                      <div className="space-y-2">
                        <Label className="text-xs">Yetkili Adı</Label>
                        <Input
                          placeholder="Örn: Ahmet Yılmaz"
                          value={wallForm.contactName}
                          onChange={(e) => setWallForm({ ...wallForm, contactName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Telefon Numarası</Label>
                        <Input
                          placeholder="Örn: 0532 123 45 67"
                          value={wallForm.contactPhone}
                          onChange={(e) => setWallForm({ ...wallForm, contactPhone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">E-posta Adresi</Label>
                        <Input
                          placeholder="Örn: ahmet@example.com"
                          value={wallForm.contactEmail}
                          onChange={(e) => setWallForm({ ...wallForm, contactEmail: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bağlı Olduğu İl</Label>
                    <Select
                      value={wallForm.cityId || 'none'}
                      onValueChange={(value) => {
                        setWallForm({
                          ...wallForm,
                          cityId: value === 'none' ? '' : value,
                          districtId: '' // Reset district when city changes
                        })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="İl seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">İl Yok</SelectItem>
                        {cities.map(city => (
                          <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Bağlı Olduğu İlçe</Label>
                    <Select
                      value={wallForm.districtId || 'none'}
                      onValueChange={(value) => setWallForm({ ...wallForm, districtId: value === 'none' ? '' : value })}
                      disabled={!wallForm.cityId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="İlçe seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">İlçe Yok</SelectItem>
                        {wallForm.cityId && districts
                          .filter(d => d.cityId === wallForm.cityId)
                          .map(district => (
                            <SelectItem key={district.id} value={district.id}>{district.name}</SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Yönetici (Sadece Seçili Gruptaki Kullanıcılar)</Label>
                    <div className="border rounded-md p-4 max-h-48 overflow-y-auto space-y-2 bg-gray-50">
                      {!wallForm.userGroupId ? (
                        <p className="text-sm text-gray-500 text-center py-2">Lütfen önce bir Grup Yetkisi seçin.</p>
                      ) : (
                        users.filter(u => u.role !== 'SUPER_ADMIN' && u.userGroups?.some((g: any) => g.id === wallForm.userGroupId)).length === 0 ? (
                           <p className="text-sm text-gray-500 text-center py-2">Seçili grupta henüz hiç kullanıcı bulunmuyor.</p>
                        ) : (
                           users.filter(u => u.role !== 'SUPER_ADMIN' && u.userGroups?.some((g: any) => g.id === wallForm.userGroupId)).map((manager) => (
                             <div key={manager.id} className="flex items-center space-x-2">
                               <Checkbox
                                 id={`manager-${manager.id}`}
                                 checked={wallForm.wallManagerIds.includes(manager.id)}
                                 onCheckedChange={(checked) => {
                                   if (checked) {
                                     setWallForm({ ...wallForm, wallManagerIds: [...wallForm.wallManagerIds, manager.id] })
                                   } else {
                                     setWallForm({ ...wallForm, wallManagerIds: wallForm.wallManagerIds.filter(id => id !== manager.id) })
                                   }
                                 }}
                               />
                               <label
                                 htmlFor={`manager-${manager.id}`}
                                 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                               >
                                 {manager.name} <span className="text-xs text-gray-500">({manager.role})</span>
                               </label>
                             </div>
                           ))
                        )
                      )}
                    </div>

                    <div className="pt-2">
                      <Label className="text-amber-700 flex items-center gap-2">
                        <Eye className="w-4 h-4" /> Görme Yetkisi (Sadece Seçili Kullanıcılar Görür)
                      </Label>
                      <p className="text-xs text-slate-500 mb-2 mt-1">
                        Seçim yaparsanız, bu duvarı yalnızca aşağıdaki listeden işaretlediğiniz ve Süper Admin olan kişiler görebilir.
                      </p>
                      <div className="border border-amber-200 rounded-md p-4 max-h-48 overflow-y-auto space-y-2 bg-amber-50">
                        {!wallForm.userGroupId ? (
                          <p className="text-sm text-gray-500 text-center py-2">Lütfen önce bir Grup Yetkisi seçin.</p>
                        ) : (
                          users.filter(u => u.role !== 'SUPER_ADMIN' && u.userGroups?.some((g: any) => g.id === wallForm.userGroupId)).length === 0 ? (
                             <p className="text-sm text-gray-500 text-center py-2">Seçili grupta henüz hiç kullanıcı bulunmuyor.</p>
                          ) : (
                             users.filter(u => u.role !== 'SUPER_ADMIN' && u.userGroups?.some((g: any) => g.id === wallForm.userGroupId)).map((viewer) => (
                               <div key={viewer.id} className="flex items-center space-x-2">
                                 <Checkbox
                                   id={`viewer-${viewer.id}`}
                                   checked={wallForm.wallViewerIds.includes(viewer.id)}
                                   onCheckedChange={(checked) => {
                                     if (checked) {
                                       setWallForm({ ...wallForm, wallViewerIds: [...wallForm.wallViewerIds, viewer.id] })
                                     } else {
                                       setWallForm({ ...wallForm, wallViewerIds: wallForm.wallViewerIds.filter(id => id !== viewer.id) })
                                     }
                                   }}
                                 />
                                 <label
                                   htmlFor={`viewer-${viewer.id}`}
                                   className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                 >
                                   {viewer.name} <span className="text-xs text-gray-500">({viewer.role})</span>
                                 </label>
                               </div>
                             ))
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Grup Yetkisi</Label>
                    <Select
                      value={wallForm.userGroupId || 'none'}
                      onValueChange={(value) => {
                        setWallForm({ 
                          ...wallForm, 
                          userGroupId: value === 'none' ? '' : value,
                          // Optionally, we could clear wallManagerIds if group changes, but maybe the user wants to keep the old ones or just untick. Let's just update userGroupId.
                        })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Grup seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Grup Yok</SelectItem>
                        {userGroups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="sliders" className="space-y-4 pt-2">
                {wallForm.name === 'Ana Duvar' ? renderSliderSettings() : renderWallSliderTabContent()}
              </TabsContent>

              <TabsContent value="appearance" className="space-y-4 pt-2">
                {wallForm.name === 'Ana Duvar' ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-bold text-lg text-blue-700 flex items-center gap-2 mb-1">
                        <Settings className="w-5 h-5" /> Siteye Ait Metinler
                      </h4>
                      <p className="text-sm text-blue-600 mb-2 text-left">Bu ayarlar tüm site genelindeki görünümü ve pano yapısını etkiler.</p>
                    </div>
                    {renderSiteGorseli()}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <h4 className="font-bold text-lg text-amber-800 flex items-center gap-2 mb-1">
                        <Palette className="w-5 h-5" /> Duvara Özgü Görünüm Ayarları
                      </h4>
                      <p className="text-sm text-amber-700 mb-2 text-left">Bu ayarlar sadece bu duvarın (kategorinin) görünümünü değiştirir.</p>
                    </div>
                    {renderWallGorseli()}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="calendar" className="space-y-4 pt-2">
                <div className="bg-purple-50 p-4 rounded-lg flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-purple-800 flex items-center gap-2 mb-1">
                      <Calendar className="w-5 h-5" /> Takvim Alanları Yönetimi
                    </h4>
                    <p className="text-sm text-purple-700">Duvarın sağ tarafında tarihe göre değişen bilgilendirme alanlarını yönetin.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="date"
                      className="w-auto h-9 text-sm border-purple-200"
                      value={selectedCalendarDate}
                      onChange={(e) => setSelectedCalendarDate(e.target.value)}
                    />
                    <Button type="button" variant="outline" size="sm" onClick={handleAddCalendarEntry} className="gap-1 border-purple-300 text-purple-700 hover:bg-purple-100">
                      <Plus className="w-3 h-3" /> Alan Ekle
                    </Button>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  {wallForm.calendarEntries && wallForm.calendarEntries.map((entry: any, index: number) => {
                    const entryDateStr = entry.date ? (typeof entry.date === 'string' ? entry.date.split('T')[0] : new Date(entry.date).toISOString().split('T')[0]) : '';
                    if (entryDateStr !== selectedCalendarDate) return null;

                    return (
                      <div key={index} className="p-3 border rounded-md bg-gray-50 relative group">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCalendarEntry(index)}
                          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>

                        <div className="grid grid-cols-1 gap-3 mb-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Başlık</Label>
                            <Select
                              value={entry.calendarCategoryId}
                              onValueChange={(val) => handleCalendarEntryChange(index, 'calendarCategoryId', val)}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Başlık Seçin" />
                              </SelectTrigger>
                              <SelectContent>
                                {calendarCategories.filter(c => c.isActive).map(cat => (
                                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Metin</Label>
                          <Textarea
                            className="text-xs min-h-[60px]"
                            placeholder="İçerik giriniz..."
                            value={entry.content}
                            onChange={(e) => handleCalendarEntryChange(index, 'content', e.target.value)}
                          />
                        </div>
                      </div>
                    )
                  })}
                  {(!wallForm.calendarEntries || wallForm.calendarEntries.filter((e: any) => {
                    const eDateStr = e.date ? (typeof e.date === 'string' ? e.date.split('T')[0] : new Date(e.date).toISOString().split('T')[0]) : '';
                    return eDateStr === selectedCalendarDate;
                  }).length === 0) && (
                      <p className="text-xs text-gray-500 text-center py-2">Bu tarih için henüz takvim alanı eklenmedi.</p>
                    )}
                </div>
              </TabsContent>

              <TabsContent value="logo" className="space-y-4 pt-2">
                <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-1">
                      <ImageIcon className="w-5 h-5 text-indigo-500" /> Logo Ayarları
                    </h3>
                    <p className="text-sm text-gray-500">Duvarın belirlediğiniz bir köşesinde görünecek logoyu buradan yönetebilirsiniz.</p>
                  </div>

                  {wallForm.parentId && (
                    <div className="flex items-center space-x-2 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                      <Checkbox
                        id="useParentLogo"
                        checked={wallForm.useParentLogo}
                        onCheckedChange={(checked) => setWallForm(s => ({ ...s, useParentLogo: !!checked }))}
                      />
                      <Label htmlFor="useParentLogo" className="cursor-pointer font-bold text-indigo-700">Üst Duvar Logosunu Kullan</Label>
                    </div>
                  )}

                  {!wallForm.useParentLogo && (
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label>Logo Resmi</Label>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 relative overflow-hidden bg-white">
                            {wallForm.logoUrl ? (
                              <img src={wallForm.logoUrl} alt="Logo Önizleme" className="w-full h-full object-contain p-2" />
                            ) : (
                              <div className="flex flex-col items-center">
                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                <span className="text-sm text-gray-500">Logo Yükle</span>
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleWallLogoUpload}
                              disabled={uploadingWallLogo}
                            />
                            {uploadingWallLogo && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="text-white text-sm">Yükleniyor...</span>
                              </div>
                            )}
                          </label>
                          {wallForm.logoUrl && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => setWallForm({ ...wallForm, logoUrl: '' })}
                            >
                              Logoyu Kaldır
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Konum</Label>
                          <Select
                            value={wallForm.logoPosition}
                            onValueChange={(value) => setWallForm({ ...wallForm, logoPosition: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Konum Seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="page-top-left">Sayfa Sol Üst (Sabit)</SelectItem>
                              <SelectItem value="page-top-center">Sayfa Üst Orta (Sabit)</SelectItem>
                              <SelectItem value="page-top-right">Sayfa Sağ Üst (Sabit)</SelectItem>

                              <SelectItem value="hero-top-left">Kapak Sol Üst</SelectItem>
                              <SelectItem value="hero-top-center">Kapak Üst Orta</SelectItem>
                              <SelectItem value="hero-top-right">Kapak Sağ Üst</SelectItem>
                              <SelectItem value="hero-bottom-left">Kapak Sol Alt</SelectItem>
                              <SelectItem value="hero-bottom-right">Kapak Sağ Alt</SelectItem>

                              <SelectItem value="board-top-left">Pano Sol Üst</SelectItem>
                              <SelectItem value="board-top-right">Pano Sağ Üst</SelectItem>
                              <SelectItem value="board-bottom-left">Pano Sol Alt</SelectItem>
                              <SelectItem value="board-bottom-right">Pano Sağ Alt</SelectItem>

                              {/* Legacy fallbacks */}
                              <SelectItem value="top-left" className="hidden">Eski Sol Üst</SelectItem>
                              <SelectItem value="top-center" className="hidden">Eski Üst Orta</SelectItem>
                              <SelectItem value="top-right" className="hidden">Eski Sağ Üst</SelectItem>
                              <SelectItem value="bottom-left" className="hidden">Eski Sol Alt</SelectItem>
                              <SelectItem value="bottom-right" className="hidden">Eski Sağ Alt</SelectItem>
                              <SelectItem value="center" className="hidden">Eski Merkez</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Boyut</Label>
                          <Select
                            value={wallForm.logoSize}
                            onValueChange={(value) => setWallForm({ ...wallForm, logoSize: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Boyut Seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="small">Küçük</SelectItem>
                              <SelectItem value="medium">Orta</SelectItem>
                              <SelectItem value="large">Büyük</SelectItem>
                              <SelectItem value="xlarge">Çok Büyük</SelectItem>
                              <SelectItem value="mega">Mega</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Görünüm Çerçevesi</Label>
                          <Select
                            value={wallForm.logoFrame || 'original'}
                            onValueChange={(value) => setWallForm({ ...wallForm, logoFrame: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Çerçeve Seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="original">Orijinal</SelectItem>
                              <SelectItem value="oval">Kenarları Oval</SelectItem>
                              <SelectItem value="circle">Yuvarlak</SelectItem>
                              <SelectItem value="square">Kare</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Canlı Ön İzleme Alanı (Logo Özel) */}
                      {wallForm.logoUrl && (
                        <div className="mt-8 pt-6 border-t border-gray-100">
                          <Label className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-4">
                            <Eye className="w-4 h-4 text-blue-500" /> Logo Canlı Önizleme
                          </Label>
                          <div
                            className="w-full h-64 rounded-xl border border-gray-200 relative overflow-hidden bg-gray-100 shadow-inner"
                            style={{
                              backgroundImage: wallForm.heroBackgroundImage ? `url("${wallForm.heroBackgroundImage}")` : (wallForm.heroGradientFrom ? `linear-gradient(135deg, ${wallForm.heroGradientFrom}, ${wallForm.heroGradientVia}, ${wallForm.heroGradientTo})` : 'none')
                            }}
                          >
                            <div className="absolute inset-0 flex items-center justify-center opacity-30">
                              <span className="text-xl font-bold">Kapak (Hero) Alanı</span>
                            </div>
                            <div
                              className={`absolute p-4 z-10 ${(wallForm.logoPosition === 'hero-top-left' || wallForm.logoPosition === 'top-left' || wallForm.logoPosition === 'page-top-left') ? 'top-0 left-0' :
                                (wallForm.logoPosition === 'hero-top-center' || wallForm.logoPosition === 'top-center' || wallForm.logoPosition === 'page-top-center') ? 'top-0 left-1/2 -translate-x-1/2' :
                                  (wallForm.logoPosition === 'hero-top-right' || wallForm.logoPosition === 'top-right' || wallForm.logoPosition === 'page-top-right') ? 'top-0 right-0' :
                                    (wallForm.logoPosition === 'hero-bottom-left' || wallForm.logoPosition === 'bottom-left' || wallForm.logoPosition === 'board-top-left' || wallForm.logoPosition === 'board-bottom-left') ? 'bottom-0 left-0' :
                                      (wallForm.logoPosition === 'hero-bottom-right' || wallForm.logoPosition === 'bottom-right' || wallForm.logoPosition === 'board-top-right' || wallForm.logoPosition === 'board-bottom-right') ? 'bottom-0 right-0' :
                                        'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50'
                                }`}
                            >
                              <img
                                src={wallForm.logoUrl}
                                alt="Önizleme Logosu"
                                className={`object-contain ${wallForm.logoSize === 'small' ? 'h-8' :
                                  wallForm.logoSize === 'medium' ? 'h-12' :
                                    wallForm.logoSize === 'large' ? 'h-20' :
                                      wallForm.logoSize === 'xlarge' ? 'h-28' :
                                        'h-36' // mega fallback
                                  } ${wallForm.logoFrame === 'oval' ? 'rounded-xl object-cover' :
                                    wallForm.logoFrame === 'circle' ? 'rounded-full aspect-square object-cover' :
                                      wallForm.logoFrame === 'square' ? 'aspect-square object-cover' : ''} bg-white/10`}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="homeCategories" className="space-y-4 pt-2">
                <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-1">
                      <ListTree className="w-5 h-5 text-indigo-500" /> Duvar İçeriği (Satırlar) Yönetimi
                    </h3>
                    <p className="text-sm text-gray-500">Bu duvarda gösterilecek kategorileri seçerek hiyerarşik yapıdan sıralayın. İstediğiniz tüm kategorileri seçip kendi satırlarını oluşturabilirsiniz, veya tek bir slider istiyorsanız boş bırakabilirsiniz.</p>
                  </div>

                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 max-w-2xl">
                    <div>
                      <Label className="text-sm font-semibold text-indigo-800 block mb-1">Alt Kategorileri Akordeon İle Küçült</Label>
                      <p className="text-xs text-indigo-600">Açıkken; bu listeyi boş bıraktığınızda sistem alt kategorileri bulur ve otomatik olarak yer tasarrufu sağlayan akordeon bir menü halinde gruplar. Kapatırsanız akordeon özelliği çalışmaz.</p>
                    </div>
                    <div className="flex items-center shrink-0">
                      <Switch
                        checked={wallForm.postitAppearance?.ottGroupBySubwalls !== false}
                        onCheckedChange={(checked) => setWallForm({ ...wallForm, postitAppearance: { ...(wallForm.postitAppearance || {}), ottGroupBySubwalls: checked } })}
                      />
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-purple-800 block mb-1">Kategori Kurdele Rengi (İsteğe Bağlı)</Label>
                      <p className="text-xs text-purple-600">Bu duvar için özel kurdele rengi belirleyin.</p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0 items-end">
                        <div className={`flex gap-2 ${wallForm.ribbonColor === 'none' ? 'opacity-50 pointer-events-none' : ''}`}>
                          <input type="color" value={wallForm.ribbonColor === 'none' ? '#ffffff' : (wallForm.ribbonColor || '#502bb1')} onChange={(e) => setWallForm({ ...wallForm, ribbonColor: e.target.value })} className="w-10 h-10 rounded cursor-pointer border border-purple-200" />
                          <Input value={wallForm.ribbonColor === 'none' ? 'Yok' : (wallForm.ribbonColor || '#502bb1')} onChange={(e) => setWallForm({ ...wallForm, ribbonColor: e.target.value })} className="w-24 font-mono text-sm bg-white" />
                        </div>
                        <div className="flex items-center gap-1.5 font-normal">
                          <Checkbox
                            id="noDefaultRibbon"
                            checked={wallForm.ribbonColor === 'none'}
                            onCheckedChange={(checked) => setWallForm({ ...wallForm, ribbonColor: checked ? 'none' : '#502bb1' })}
                          />
                          <Label htmlFor="noDefaultRibbon" className="text-xs cursor-pointer text-purple-800 font-medium">Kurdele Gösterme (Yok)</Label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left: Hierarchical Catalog */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-700 bg-gray-50 px-3 py-2 rounded block border border-gray-100">Kategori Havuzu (Hiyerarşik)</Label>
                      <div className="border border-gray-100 rounded-md p-3 max-h-[400px] overflow-y-auto space-y-1 bg-white">
                        {(() => {
                          let homeArray = wallForm.homeCategoryIds || [];
                          if (typeof homeArray === 'string') { try { homeArray = JSON.parse(homeArray) } catch (e) { homeArray = [] } }
                          if (!Array.isArray(homeArray)) homeArray = [];
                          const allCats = walls.filter((w: any) => w.name !== 'Ana Duvar');

                          const buildHierarchy = (items: any[]) => {
                            const isSuperAdmin = (session?.user as any)?.role === 'SUPER_ADMIN';
                            let rootItems = [];

                            if (wallForm.name === 'Ana Duvar' || isSuperAdmin) {
                              rootItems = items.filter(i => !i.parentId).sort((a, b) => a.name.localeCompare(b.name, 'tr-TR'));
                            } else {
                              // Tüm içerikleri diğer duvarlara çekebilmesi için her zaman root gösterelim
                              rootItems = items.filter(i => !i.parentId).sort((a, b) => a.name.localeCompare(b.name, 'tr-TR'));
                            }

                            const findChildren = (parent: any) => {
                              const children = items.filter(i => i.parentId === parent.id).sort((a, b) => a.name.localeCompare(b.name, 'tr-TR'));
                              parent.children = children
                              children.forEach(findChildren)
                            }
                            rootItems.forEach(findChildren)
                            return rootItems
                          }

                          const hierarchy = buildHierarchy(JSON.parse(JSON.stringify(allCats)));

                          const renderNode = (node: any, depth = 0) => {
                            const isSelected = homeArray.includes(node.id);
                            const realNode = allCats.find((c: any) => c.id === node.id);
                            const subcatCount = realNode ? allCats.filter((c: any) => c.parentId === realNode.id).length : 0;

                            return (
                              <div key={node.id} className="space-y-1">
                                <div className={`flex items-center gap-2 p-2 rounded-md transition-colors ${isSelected ? 'bg-indigo-50/50' : 'hover:bg-gray-50'}`} style={{ marginLeft: `${depth * 16}px` }}>
                                  <Checkbox
                                    className="data-[state=checked]:bg-indigo-600 data-[state=checked]:text-white"
                                    checked={isSelected}
                                    onCheckedChange={(checked) => {
                                      const newArray = checked ? [...homeArray, node.id] : homeArray.filter((id: string) => id !== node.id);
                                      setWallForm({ ...wallForm, homeCategoryIds: newArray });
                                    }}
                                  />
                                  <div className="flex flex-col flex-1">
                                    <span className="text-sm font-semibold text-gray-800">{node.name}</span>
                                    <span className="text-[10px] text-gray-500 font-medium">
                                      {subcatCount} alt kategori • {realNode?._count?.postits || 0} not
                                    </span>
                                  </div>
                                </div>
                                {node.children && node.children.map((child: any) => renderNode(child, depth + 1))}
                              </div>
                            );
                          };

                          if (hierarchy.length === 0) return <div className="text-sm text-gray-400 p-2">Henüz kategori bulunmuyor.</div>;

                          return hierarchy.map(node => renderNode(node, 0));
                        })()}
                      </div>
                    </div>

                    {/* Right: Selected Categories Order */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-indigo-800 bg-indigo-50 px-3 py-2 rounded block border border-indigo-100">Seçili Kategoriler (Sıralı)</Label>
                      <div className="border border-indigo-100 rounded-md p-3 max-h-[400px] overflow-y-auto space-y-2 bg-slate-50">
                        {(() => {
                          let homeArray = wallForm.homeCategoryIds || [];
                          if (typeof homeArray === 'string') { try { homeArray = JSON.parse(homeArray) } catch (e) { homeArray = [] } }
                          if (!Array.isArray(homeArray)) homeArray = [];
                          const allCats = walls.filter((w: any) => w.name !== 'Ana Duvar');

                          if (homeArray.length === 0) {
                            return <div className="text-center py-6 text-gray-400 text-sm">Hiç kategori seçilmedi. Soldaki havuzdan seçin.</div>;
                          }

                          // Ensure we only map items that actually exist in allCats
                          const validHomeArray = homeArray.filter((id: string) => allCats.some((w: any) => w.id === id));

                          return validHomeArray.map((id: string, index: number) => {
                            const cat = allCats.find((w: any) => w.id === id);
                            if (!cat) return null;

                            return (
                              <div key={id} className="flex flex-col p-2 lg:p-3 bg-white border border-gray-200 rounded shadow-sm group">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="bg-indigo-100 text-indigo-700 font-bold text-xs w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0">
                                      {index + 1}
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="font-medium text-sm text-gray-800 line-clamp-1">{cat.name}</span>
                                      {cat.parentId && <span className="text-[10px] text-indigo-500 font-semibold bg-indigo-50 leading-none py-0.5 px-1.5 rounded w-fit mt-1">Alt Kategori</span>}
                                    </div>
                                  </div>
                                  <div className="flex gap-0.5 sm:gap-1">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-gray-400 hover:text-indigo-600 focus:bg-indigo-50"
                                      disabled={index === 0}
                                      onClick={(e) => {
                                        e.preventDefault(); e.stopPropagation();
                                        const newArray = [...validHomeArray];
                                        const temp = newArray[index - 1];
                                        newArray[index - 1] = newArray[index];
                                        newArray[index] = temp;
                                        if (wallForm.name === 'Ana Duvar') setSiteSettings({ ...siteSettings, homeCategoryIds: newArray });
                                        setWallForm({ ...wallForm, homeCategoryIds: newArray });
                                      }}
                                    >
                                      <ArrowUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-gray-400 hover:text-indigo-600 focus:bg-indigo-50"
                                      disabled={index === validHomeArray.length - 1}
                                      onClick={(e) => {
                                        e.preventDefault(); e.stopPropagation();
                                        const newArray = [...validHomeArray];
                                        const temp = newArray[index + 1];
                                        newArray[index + 1] = newArray[index];
                                        newArray[index] = temp;
                                        if (wallForm.name === 'Ana Duvar') setSiteSettings({ ...siteSettings, homeCategoryIds: newArray });
                                        setWallForm({ ...wallForm, homeCategoryIds: newArray });
                                      }}
                                    >
                                      <ArrowDown className="h-4 w-4" />
                                    </Button>
                                    <div className="w-px h-5 bg-gray-200 mx-1 self-center" />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-gray-400 hover:text-red-600 focus:bg-red-50 hover:bg-red-50"
                                      onClick={(e) => {
                                        e.preventDefault(); e.stopPropagation();
                                        const newArray = validHomeArray.filter((i: string) => i !== id);
                                        if (wallForm.name === 'Ana Duvar') setSiteSettings({ ...siteSettings, homeCategoryIds: newArray });
                                        setWallForm({ ...wallForm, homeCategoryIds: newArray });
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-gray-100">
                                  <div className="flex items-center gap-2">
                                    <Palette className="w-4 h-4 text-purple-400" />
                                    <span className="text-xs text-gray-500 flex-1">Özel Kurdele Rengi:</span>
                                    <div className="flex items-center gap-1.5">
                                      <input
                                        type="color"
                                        value={(tempCategoryRibbonColors[cat.id] !== undefined ? tempCategoryRibbonColors[cat.id] : cat.ribbonColor) === 'none' ? '#ffffff' : (tempCategoryRibbonColors[cat.id] || cat.ribbonColor || siteSettings.ribbonColor || '#502bb1')}
                                        onChange={(e) => setTempCategoryRibbonColors({ ...tempCategoryRibbonColors, [cat.id]: e.target.value })}
                                        className={`w-6 h-6 rounded cursor-pointer border border-gray-200 ${(tempCategoryRibbonColors[cat.id] !== undefined ? tempCategoryRibbonColors[cat.id] : cat.ribbonColor) === 'none' ? 'opacity-50 pointer-events-none' : ''}`}
                                      />
                                      <span className="text-[10px] text-gray-400 font-mono hidden sm:inline-block">
                                        {(tempCategoryRibbonColors[cat.id] !== undefined ? tempCategoryRibbonColors[cat.id] : cat.ribbonColor) === 'none' ? 'Yok' : (tempCategoryRibbonColors[cat.id] || cat.ribbonColor || siteSettings.ribbonColor || '#502bb1')}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className={`flex items-center gap-2 ${(tempCategoryRibbonColors[cat.id] !== undefined ? tempCategoryRibbonColors[cat.id] : cat.ribbonColor) === 'none' ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <Palette className="w-4 h-4 text-emerald-500" />
                                    <span className="text-xs text-gray-500 flex-1">Kurdele Yazı Rengi:</span>
                                    <div className="flex items-center gap-1.5">
                                      <input
                                        type="color"
                                        value={(tempCategoryRibbonTextColors[cat.id] !== undefined ? tempCategoryRibbonTextColors[cat.id] : cat.ribbonTextColor) === 'transparent' ? '#ffffff' : (tempCategoryRibbonTextColors[cat.id] || cat.ribbonTextColor || '#ffffff')}
                                        onChange={(e) => setTempCategoryRibbonTextColors({ ...tempCategoryRibbonTextColors, [cat.id]: e.target.value })}
                                        className={`w-6 h-6 rounded cursor-pointer border border-gray-200 ${(tempCategoryRibbonTextColors[cat.id] !== undefined ? tempCategoryRibbonTextColors[cat.id] : cat.ribbonTextColor) === 'transparent' ? 'opacity-50 pointer-events-none' : ''}`}
                                      />
                                      <span className="text-[10px] text-gray-400 font-mono hidden sm:inline-block">
                                        {(tempCategoryRibbonTextColors[cat.id] !== undefined ? tempCategoryRibbonTextColors[cat.id] : cat.ribbonTextColor) === 'transparent' ? 'Gizli' : (tempCategoryRibbonTextColors[cat.id] || cat.ribbonTextColor || '#ffffff')}
                                      </span>
                                    </div>
                                  </div>

                                  <div className={`flex items-center gap-2 ${(tempCategoryRibbonColors[cat.id] !== undefined ? tempCategoryRibbonColors[cat.id] : cat.ribbonColor) === 'none' ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <Upload className="w-4 h-4 text-blue-400" />
                                    <span className="text-xs text-gray-500 flex-1">Özel Resim:</span>
                                    <div className="flex items-center gap-2">
                                      {uploadingRibbonImageId === cat.id ? (
                                        <span className="text-[10px] text-blue-500 animate-pulse">Yükleniyor...</span>
                                      ) : (tempCategoryRibbonImages[cat.id] !== undefined ? tempCategoryRibbonImages[cat.id] : cat.ribbonImage) ? (
                                        <div className="flex items-center gap-1">
                                          <img src={tempCategoryRibbonImages[cat.id] !== undefined ? tempCategoryRibbonImages[cat.id] : cat.ribbonImage} alt="Ribbon" className="h-6 w-12 object-cover rounded border border-gray-200" />
                                          <Button type="button" variant="ghost" size="sm" className="h-6 px-1.5 text-[10px] text-red-500 hover:text-red-700" onClick={() => setTempCategoryRibbonImages({ ...tempCategoryRibbonImages, [cat.id]: '' })}>X</Button>
                                        </div>
                                      ) : (
                                        <label className="cursor-pointer bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 px-2 py-1 rounded text-[10px] font-medium transition-colors">
                                          Seç
                                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleRibbonImageUpload(e, cat.id)} />
                                        </label>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 justify-end mt-1">
                                    <div className="flex items-center gap-1.5 border border-indigo-100 bg-indigo-50 px-2 py-1 rounded">
                                      <Checkbox
                                        id={`noRibbon-${cat.id}`}
                                        checked={(tempCategoryRibbonColors[cat.id] !== undefined ? tempCategoryRibbonColors[cat.id] : cat.ribbonColor) === 'none'}
                                        onCheckedChange={(checked) => setTempCategoryRibbonColors({ ...tempCategoryRibbonColors, [cat.id]: checked ? 'none' : '#502bb1' })}
                                      />
                                      <Label htmlFor={`noRibbon-${cat.id}`} className="text-[10px] cursor-pointer font-medium text-indigo-700">Kurdele Gösterme</Label>
                                    </div>
                                    <div className={`flex items-center gap-1.5 border border-emerald-100 bg-emerald-50 px-2 py-1 rounded ${(tempCategoryRibbonColors[cat.id] !== undefined ? tempCategoryRibbonColors[cat.id] : cat.ribbonColor) === 'none' ? 'opacity-50 pointer-events-none' : ''}`}>
                                      <Checkbox
                                        id={`noRibbonText-${cat.id}`}
                                        checked={(tempCategoryRibbonTextColors[cat.id] !== undefined ? tempCategoryRibbonTextColors[cat.id] : cat.ribbonTextColor) === 'transparent'}
                                        onCheckedChange={(checked) => setTempCategoryRibbonTextColors({ ...tempCategoryRibbonTextColors, [cat.id]: checked ? 'transparent' : '#ffffff' })}
                                      />
                                      <Label htmlFor={`noRibbonText-${cat.id}`} className="text-[10px] cursor-pointer font-medium text-emerald-700">Yazıyı Gösterme</Label>
                                    </div>
                                  </div>

                                  <div className={`flex items-center gap-2 mt-2 ${(tempCategoryRibbonColors[cat.id] !== undefined ? tempCategoryRibbonColors[cat.id] : cat.ribbonColor) === 'none' ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Yazı/Kurdele Konumu:</span>
                                    <Select
                                      value={tempCategoryRibbonAlignments[cat.id] !== undefined ? tempCategoryRibbonAlignments[cat.id] : (cat.ribbonAlignment || 'center')}
                                      onValueChange={(val) => setTempCategoryRibbonAlignments({ ...tempCategoryRibbonAlignments, [cat.id]: val })}
                                    >
                                      <SelectTrigger className="h-7 text-xs flex-1 border-gray-200">
                                        <SelectValue placeholder="Konum Seçin" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="left" className="text-xs">Sola Yasla</SelectItem>
                                        <SelectItem value="center" className="text-xs">Ortala (Varsayılan)</SelectItem>
                                        <SelectItem value="right" className="text-xs">Sağa Yasla</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                            )
                          });
                        })()}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <Label className="text-sm font-semibold text-gray-700 bg-gray-50 px-3 py-2 rounded block border border-gray-100 mb-4">Görüntüleme Ayarları</Label>
                    <div className="flex flex-col gap-2">
                      <Label>Gösterilecek Maksimum Post-it Sayısı</Label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0 (Sınırsız)"
                        value={wallForm.name === 'Ana Duvar' ? (siteSettings.postitLimit || 0) : (wallForm.postitLimit || 0)}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          if (wallForm.name === 'Ana Duvar') {
                            setSiteSettings({ ...siteSettings, postitLimit: val });
                          } else {
                            setWallForm({ ...wallForm, postitLimit: val });
                          }
                        }}
                      />
                      <span className="text-xs text-gray-500">Bu duvarda en yeniden en eskiye doğru en fazla kaç post-it gösterileceğini belirler. Sınırsız veya tümünü göstermek için 0 bırakın. Alt kategorilerin gösterim sayısını etkilemez.</span>
                    </div>
                  </div>


                </div>
              </TabsContent>

              <TabsContent value="layout" className="space-y-4 pt-2">
                <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-1">
                      <LayoutGrid className="w-5 h-5 text-indigo-500" /> Pano Yerleşimi (Gelişmiş)
                    </h3>
                    <p className="text-sm text-gray-500">Mantar panonun içerisindeki klasik post-it listeleme düzenini iptal edip, özel Widget kutularıyla (Örn: Nöbetçi Eczaneler, Haberler, Etkinlikler) yeni nesil bir modüler pano görünümü oluşturabilirsiniz.</p>
                  </div>

                  <div className="flex items-center space-x-2 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                    <Checkbox
                      id="useCustomLayout"
                      checked={wallForm.useCustomLayout}
                      onCheckedChange={(checked) => setWallForm(s => ({ ...s, useCustomLayout: !!checked }))}
                    />
                    <Label htmlFor="useCustomLayout" className="cursor-pointer font-bold text-indigo-700 block">Özel Pano Yerleşimi Kullan (Beta)</Label>
                  </div>

                  {wallForm.useCustomLayout && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mt-4 border-t pt-4">
                        <Label className="text-sm font-semibold text-gray-700">Pano Blokları (Widgetlar)</Label>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setWallForm(s => ({
                              ...s,
                              customLayout: [...(s.customLayout || []), { id: Math.random().toString(36).substr(2, 9), type: 'category_posts', title: 'Yeni Blok', ribbonColor: '#502bb1', width: 'full', categoryId: '' }]
                            }))
                          }}
                        >
                          <Plus className="w-4 h-4 mr-1" /> Blok Ekle
                        </Button>
                      </div>

                      {(!wallForm.customLayout || wallForm.customLayout.length === 0) ? (
                        <div className="p-8 text-center text-gray-500 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl">
                          Henüz hiçbir blok eklemediniz. İlan panosunun düzenini dizebilmek için "Blok Ekle" butonuna tıklayarak tasarıma başlayın.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {wallForm.customLayout.map((block: any, index: number) => (
                            <div key={block.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50/80 relative group shadow-sm">
                              <div className="absolute -top-3 -right-2 flex gap-1 z-10 bg-white p-1 rounded-md shadow-sm border">
                                <Button
                                  type="button" variant="ghost" size="icon" className="h-6 w-6 text-gray-500 hover:bg-gray-100" disabled={index === 0}
                                  onClick={() => {
                                    const newLayout = [...wallForm.customLayout];
                                    const temp = newLayout[index - 1]; newLayout[index - 1] = newLayout[index]; newLayout[index] = temp;
                                    setWallForm({ ...wallForm, customLayout: newLayout });
                                  }}
                                  title="Yukarı Taşı"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  type="button" variant="ghost" size="icon" className="h-6 w-6 text-gray-500 hover:bg-gray-100" disabled={index === wallForm.customLayout.length - 1}
                                  onClick={() => {
                                    const newLayout = [...wallForm.customLayout];
                                    const temp = newLayout[index + 1]; newLayout[index + 1] = newLayout[index]; newLayout[index] = temp;
                                    setWallForm({ ...wallForm, customLayout: newLayout });
                                  }}
                                  title="Aşağı Taşı"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  type="button" variant="ghost" size="icon" className="h-6 w-6 text-red-600 hover:bg-red-50"
                                  onClick={() => {
                                    setWallForm(s => ({ ...s, customLayout: s.customLayout.filter((b: any) => b.id !== block.id) }))
                                  }}
                                  title="Bloğu Sil"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                                <div className="space-y-1">
                                  <Label className="text-xs font-semibold">Blok Tipi</Label>
                                  <Select
                                    value={block.type}
                                    onValueChange={(val) => {
                                      const newLayout = [...wallForm.customLayout];
                                      newLayout[index].type = val;
                                      setWallForm({ ...wallForm, customLayout: newLayout });
                                    }}
                                  >
                                    <SelectTrigger className="h-8 text-xs bg-white"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="category_posts">Dinamik Kategori Listesi</SelectItem>
                                      <SelectItem value="pharmacy_plugin">Nöbetçi Eczaneler Panosu (Akıllı)</SelectItem>
                                      <SelectItem value="custom_html">Özel Görsel / HTML Kutu</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs font-semibold">Özel Kurdele Başlığı</Label>
                                  <Input
                                    className="h-8 text-xs bg-white"
                                    placeholder="Örn: Önemli Duyurular"
                                    value={block.title || ''}
                                    onChange={(e) => {
                                      const newLayout = [...wallForm.customLayout];
                                      newLayout[index].title = e.target.value;
                                      setWallForm({ ...wallForm, customLayout: newLayout });
                                    }}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs font-semibold flex items-center justify-between">
                                    <span>Kurdele Rengi</span>
                                    <div className="flex items-center gap-1.5 font-normal">
                                      <Checkbox
                                        id={`noRibbonBlock-${block.id}`}
                                        checked={block.ribbonColor === 'none'}
                                        onCheckedChange={(checked) => {
                                          const newLayout = [...wallForm.customLayout];
                                          newLayout[index].ribbonColor = checked ? 'none' : '#502bb1';
                                          setWallForm({ ...wallForm, customLayout: newLayout });
                                        }}
                                      />
                                      <Label htmlFor={`noRibbonBlock-${block.id}`} className="text-[10px] cursor-pointer italic text-gray-500">Kaldır (Kurdele Yok)</Label>
                                    </div>
                                  </Label>
                                  <div className={`flex gap-2 ${block.ribbonColor === 'none' ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <input
                                      type="color"
                                      className="w-8 h-8 rounded shrink-0 p-0 border cursor-pointer"
                                      value={block.ribbonColor === 'none' ? '#ffffff' : (block.ribbonColor || '#000000')}
                                      onChange={(e) => {
                                        const newLayout = [...wallForm.customLayout];
                                        newLayout[index].ribbonColor = e.target.value;
                                        setWallForm({ ...wallForm, customLayout: newLayout });
                                      }}
                                    />
                                    <Input
                                      className="h-8 text-xs font-mono bg-white flex-1"
                                      value={block.ribbonColor === 'none' ? 'Yok' : (block.ribbonColor || '')}
                                      onChange={(e) => {
                                        const newLayout = [...wallForm.customLayout];
                                        newLayout[index].ribbonColor = e.target.value;
                                        setWallForm({ ...wallForm, customLayout: newLayout });
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs font-semibold">Metin Rengi</Label>
                                  <div className="flex gap-2">
                                    <input
                                      type="color"
                                      className="w-8 h-8 rounded shrink-0 p-0 border cursor-pointer"
                                      value={block.ribbonTextColor || '#FFFFFF'}
                                      onChange={(e) => {
                                        const newLayout = [...wallForm.customLayout];
                                        newLayout[index].ribbonTextColor = e.target.value;
                                        setWallForm({ ...wallForm, customLayout: newLayout });
                                      }}
                                    />
                                    <Input
                                      className="h-8 text-xs font-mono bg-white flex-1"
                                      value={block.ribbonTextColor || '#FFFFFF'}
                                      onChange={(e) => {
                                        const newLayout = [...wallForm.customLayout];
                                        newLayout[index].ribbonTextColor = e.target.value;
                                        setWallForm({ ...wallForm, customLayout: newLayout });
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs font-semibold flex items-center justify-between">
                                    <span>Veya Başlık Resmi</span>
                                    {block.titleImage && (
                                      <button type="button" onClick={() => {
                                        const newLayout = [...wallForm.customLayout];
                                        newLayout[index].titleImage = '';
                                        setWallForm({ ...wallForm, customLayout: newLayout });
                                      }} className="text-red-500 hover:text-red-700 text-[10px]">Temizle</button>
                                    )}
                                  </Label>
                                  <div className="flex items-center gap-2">
                                    <div className="relative overflow-hidden rounded border border-gray-200 bg-white h-8 w-12 flex items-center justify-center shrink-0">
                                      {block.titleImage ? (
                                        <img src={block.titleImage} alt="Başlık Resmi" className="w-full h-full object-contain" />
                                      ) : (
                                        <ImageIcon className="w-4 h-4 text-gray-300" />
                                      )}
                                      {uploadingTitleImage === (block.id || String(index)) && (
                                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                                          <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <Input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,image/gif"
                                        className="h-8 text-xs bg-white text-gray-500 cursor-pointer file:cursor-pointer file:h-full file:bg-gray-100 file:border-0 file:text-gray-700 file:font-semibold file:text-xs hover:file:bg-gray-200"
                                        onChange={(e) => handleTitleImageUpload(index, e)}
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs font-semibold">Genişlik (Dizilim Kapsamı)</Label>
                                  <Select
                                    value={block.width}
                                    onValueChange={(val) => {
                                      const newLayout = [...wallForm.customLayout];
                                      newLayout[index].width = val;
                                      setWallForm({ ...wallForm, customLayout: newLayout });
                                    }}
                                  >
                                    <SelectTrigger className="h-8 text-xs bg-white"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="full">Tam Genişlik (Büyük Blok)</SelectItem>
                                      <SelectItem value="half">Yarım Genişlik (1/2 Kutucuk)</SelectItem>
                                      <SelectItem value="third">Üçte Bir Genişlik (1/3 Kutucuk)</SelectItem>
                                      <SelectItem value="twothird">Üçte İki Genişlik (2/3 Kutucuk)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <Label className="text-xs font-semibold flex items-center justify-between">
                                    <span>Zemin Resmi / Deseni (Arkaplan)</span>
                                    {block.backgroundImage && (
                                      <button type="button" onClick={() => {
                                        const newLayout = [...wallForm.customLayout];
                                        newLayout[index].backgroundImage = '';
                                        setWallForm({ ...wallForm, customLayout: newLayout });
                                      }} className="text-red-500 hover:text-red-700 text-[10px]">Temizle</button>
                                    )}
                                  </Label>
                                  <div className="flex items-center gap-2">
                                    <div className="relative overflow-hidden rounded border border-gray-200 bg-white h-8 w-12 flex items-center justify-center shrink-0">
                                      {block.backgroundImage ? (
                                        <img src={block.backgroundImage} alt="Zemin" className="w-full h-full object-cover" />
                                      ) : (
                                        <ImageIcon className="w-4 h-4 text-gray-300" />
                                      )}
                                      {uploadingBlockImage === block.id && (
                                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                                          <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <Input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,image/gif"
                                        className="h-8 text-xs bg-white text-gray-500 cursor-pointer file:cursor-pointer file:h-full file:bg-gray-100 file:border-0 file:text-gray-700 file:font-semibold file:text-xs hover:file:bg-gray-200"
                                        onChange={(e) => handleBlockImageUpload(index, e)}
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs font-semibold">Zemin (Arkaplan) Rengi</Label>
                                  <div className="flex gap-2">
                                    <input
                                      type="color"
                                      className="w-8 h-8 rounded shrink-0 p-0 border cursor-pointer"
                                      value={block.backgroundColor || '#E8DCC4'}
                                      onChange={(e) => {
                                        const newLayout = [...wallForm.customLayout];
                                        newLayout[index].backgroundColor = e.target.value;
                                        setWallForm({ ...wallForm, customLayout: newLayout });
                                      }}
                                    />
                                    <Input
                                      className="h-8 text-xs font-mono bg-white flex-1"
                                      value={block.backgroundColor || ''}
                                      placeholder="#E8DCC4"
                                      onChange={(e) => {
                                        const newLayout = [...wallForm.customLayout];
                                        newLayout[index].backgroundColor = e.target.value;
                                        setWallForm({ ...wallForm, customLayout: newLayout });
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1 flex flex-col justify-center">
                                  <Label className="text-xs font-semibold flex items-center gap-2 cursor-pointer mt-2">
                                    <input
                                      type="checkbox"
                                      className="rounded border-gray-300"
                                      checked={!!block.isTransparent}
                                      onChange={(e) => {
                                        const newLayout = [...wallForm.customLayout];
                                        newLayout[index].isTransparent = e.target.checked;
                                        setWallForm({ ...wallForm, customLayout: newLayout });
                                      }}
                                    />
                                    Arkaplan Rengini Saydam Yap (Gizle)
                                  </Label>
                                </div>
                              </div>

                              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1 flex flex-col justify-center">
                                  <Label className="text-xs font-semibold flex items-center gap-2 cursor-pointer mt-5">
                                    <input
                                      type="checkbox"
                                      className="rounded border-gray-300"
                                      checked={!!block.noBorder}
                                      onChange={(e) => {
                                        const newLayout = [...wallForm.customLayout];
                                        newLayout[index].noBorder = e.target.checked;
                                        setWallForm({ ...wallForm, customLayout: newLayout });
                                      }}
                                    />
                                    Mantar Çerçeveyi Gizle
                                  </Label>
                                </div>
                                {!block.noBorder && (
                                  <div className="space-y-1">
                                    <Label className="text-xs font-semibold">Çerçeve (Mantar) Rengi</Label>
                                    <div className="flex gap-2">
                                      <input
                                        type="color"
                                        className="w-8 h-8 rounded shrink-0 p-0 border cursor-pointer"
                                        value={block.borderColor || '#8B5A2B'}
                                        onChange={(e) => {
                                          const newLayout = [...wallForm.customLayout];
                                          newLayout[index].borderColor = e.target.value;
                                          setWallForm({ ...wallForm, customLayout: newLayout });
                                        }}
                                      />
                                      <Input
                                        className="h-8 text-xs font-mono bg-white flex-1"
                                        value={block.borderColor || ''}
                                        placeholder="#8B5A2B"
                                        onChange={(e) => {
                                          const newLayout = [...wallForm.customLayout];
                                          newLayout[index].borderColor = e.target.value;
                                          setWallForm({ ...wallForm, customLayout: newLayout });
                                        }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Type Specific Fields */}
                              {block.type === 'category_posts' && (
                                <div className="mt-3 space-y-1 p-3 bg-indigo-50/50 rounded border border-indigo-100">
                                  <Label className="text-xs text-indigo-700 font-bold flex items-center gap-1">
                                    <ListTree className="w-3 h-3" /> Veri Kaynağı (Gösterilecek Duvar Kategorisi)
                                  </Label>
                                  <div className="flex flex-col sm:flex-row gap-2">
                                    <Select
                                      value={block.categoryId || undefined}
                                      onValueChange={(val) => {
                                        const newLayout = [...wallForm.customLayout];
                                        newLayout[index].categoryId = val;
                                        setWallForm({ ...wallForm, customLayout: newLayout });
                                      }}
                                    >
                                      <SelectTrigger className="h-8 text-xs bg-white mt-1 flex-1"><SelectValue placeholder="İlanların Çekileceği Kategoriyi Konumlandırın" /></SelectTrigger>
                                      <SelectContent>
                                        {walls.map((w: any) => (
                                          <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <Input
                                      type="number"
                                      placeholder="Sayı"
                                      className="h-8 text-xs bg-white mt-1 w-full sm:w-24 border-indigo-200"
                                      title="Gösterilecek Not Sayısı"
                                      value={block.limit || 3}
                                      onChange={(e) => {
                                        const newLayout = [...wallForm.customLayout];
                                        newLayout[index].limit = parseInt(e.target.value) || undefined;
                                        setWallForm({ ...wallForm, customLayout: newLayout });
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                              {block.type === 'custom_html' && (
                                <div className="mt-3 space-y-1 p-3 bg-slate-50 border rounded">
                                  <Label className="text-xs text-slate-700 font-bold block mb-1">
                                    Dış Görsel / Özel İçerik (Kodu buraya yapıştırın veya HTML formatında görsel linki girin)
                                  </Label>
                                  <Textarea
                                    rows={3}
                                    className="text-xs font-mono bg-white shadow-inner"
                                    placeholder='<a href="/hedef"><img src="https://gorsel.com/ilan.jpg" className="w-full rounded" /></a>'
                                    value={block.htmlContent || ''}
                                    onChange={(e) => {
                                      const newLayout = [...wallForm.customLayout];
                                      newLayout[index].htmlContent = e.target.value;
                                      setWallForm({ ...wallForm, customLayout: newLayout });
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Live Preview Area */}
                      {wallForm.customLayout && wallForm.customLayout.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-gray-100">
                          <Label className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-4">
                            <Eye className="w-4 h-4 text-indigo-500" /> Şablon Canlı Önizleme (Temsili)
                          </Label>
                          <div
                            className="w-full bg-[#e8cda3] rounded-xl border-[6px] border-[#a06830] p-4 flex flex-wrap gap-4 relative shadow-inner"
                          >
                            {wallForm.customLayout.map((block: any, i: number) => {
                              const widthClass = block.width === 'full' ? 'w-full' :
                                block.width === 'half' ? 'w-[calc(50%-0.5rem)]' :
                                  block.width === 'third' ? 'w-[calc(33.333%-0.66rem)]' :
                                    block.width === 'twothird' ? 'w-[calc(66.666%-0.66rem)]' : 'w-full';

                              return (
                                <div
                                  key={block.id || i}
                                  className={`${widthClass} bg-white/90 flex flex-col items-center justify-center p-4 min-h-[140px] relative shadow-sm overflow-hidden`}
                                  style={{
                                    backgroundImage: block.backgroundImage ? `url(${block.backgroundImage})` : 'none',
                                    backgroundSize: '100% 100%',
                                    backgroundPosition: 'center',
                                    borderColor: !block.noBorder ? (block.borderColor || '#8B5A2B') : 'transparent',
                                    borderWidth: !block.noBorder ? '6px' : '0px',
                                    borderStyle: !block.noBorder ? 'solid' : 'none',
                                    borderRadius: '0.5rem'
                                  }}
                                >
                                  {/* Mock Ribbon */}
                                  {/* Mock Ribbon / Title Image */}
                                  {(block.title || block.titleImage) && (
                                    <div className="absolute top-0 transform -translate-y-[20%] z-20 w-fit drop-shadow-md">
                                      {block.titleImage ? (
                                        <div className="relative inline-flex items-center justify-center">
                                          <img src={block.titleImage} alt="Title" className="h-12 w-auto object-contain" />
                                          {block.title && (
                                            <h3 className="absolute inset-0 flex items-center justify-center text-xs md:text-sm font-black tracking-wide px-2 text-center" style={{ color: block.ribbonTextColor || '#ffffff', fontFamily: "'Nunito', 'Segoe UI', system-ui, sans-serif", textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 -1px 1px rgba(255,255,255,0.4)' }}>
                                              {block.title}
                                            </h3>
                                          )}
                                        </div>
                                      ) : (
                                        <div className={block.ribbonColor !== 'none' ? "px-6 py-1 rounded-sm border-b-4 border-r-[3px] border-black/30 flex items-center gap-2 shadow-xl whitespace-nowrap" : "px-6 py-1 flex items-center gap-2 whitespace-nowrap"} style={block.ribbonColor !== 'none' ? { backgroundColor: block.ribbonColor || '#c40000' } : {}}>
                                          <h3 className="text-lg md:text-xl font-black tracking-wide" style={{ color: block.ribbonTextColor || (block.ribbonColor !== 'none' ? '#ffffff' : '#374151'), fontFamily: "'Nunito', 'Segoe UI', system-ui, sans-serif", textShadow: block.ribbonColor !== 'none' ? '0 2px 4px rgba(0,0,0,0.4), 0 -1px 1px rgba(255,255,255,0.2)' : 'none' }}>
                                            {block.title || 'Başlıksız Blok'}
                                          </h3>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  <div className={`mt-2 text-center z-10 ${block.backgroundImage ? 'bg-white/80 p-2 rounded backdrop-blur-sm' : ''}`}>
                                    <div className="text-gray-800 font-semibold text-sm">
                                      {block.type === 'category_posts' ? 'Kategori İlanları' :
                                        block.type === 'pharmacy_plugin' ? 'Nöbetçi Eczaneler' : 'Özel Görsel/Kod'}
                                    </div>
                                    <div className="text-gray-500 text-[10px] mt-1 font-mono">
                                      {block.width === 'full' ? 'Tam Genişlik (1/1)' :
                                        block.width === 'half' ? 'Yarım Genişlik (1/2)' :
                                          block.width === 'third' ? 'Üçte Bir Genişlik (1/3)' : 'İkili Genişlik (2/3)'}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="styleMode" className="space-y-4 pt-2">
                <div className="bg-indigo-50 p-4 rounded-lg flex items-center justify-between mb-4 shadow-sm border border-indigo-100">
                  <div>
                    <h4 className="font-semibold text-indigo-800 flex items-center gap-2 mb-1">
                      <Wand2 className="w-5 h-5" /> Stil Modu (İzole Tasarım)
                    </h4>
                    <p className="text-sm text-indigo-700">Bu duvarı, uygulamanın genel OTT/Düzen ayarlarından bağımsızlaştırarak tamamen kendisine has davranmasını sağlayın.</p>
                  </div>
                  <div className="flex items-center space-x-2 bg-white p-2 px-3 border border-indigo-200 rounded-md shadow-sm">
                     <Checkbox
                       id="wall-style-mode"
                       className="border-indigo-400 text-indigo-600 focus:ring-indigo-500"
                       checked={wallForm.isStyleModeActive === true}
                       onCheckedChange={(checked) => setWallForm({ ...wallForm, isStyleModeActive: !!checked, isEditorModeActive: !!checked ? false : wallForm.isEditorModeActive })}
                     />
                     <Label htmlFor="wall-style-mode" className="cursor-pointer font-bold text-sm text-indigo-900">
                        {wallForm.isStyleModeActive ? "Açık" : "Kapalı"}
                     </Label>
                  </div>
                </div>

                {wallForm.isStyleModeActive && (
                  <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-4">
                    {(() => {
                      let parsedSettings: any = {};
                      if (typeof wallForm.styleModeSettings === 'string') {
                         try { parsedSettings = JSON.parse(wallForm.styleModeSettings) } catch(e) { parsedSettings = {} }
                      } else if (wallForm.styleModeSettings) {
                         parsedSettings = wallForm.styleModeSettings;
                      }

                      const handleSettingChange = (key: string, value: any) => {
                         const updated = { ...parsedSettings, [key]: value };
                         setWallForm({ ...wallForm, styleModeSettings: updated });
                      };

                      return (
                        <div className="space-y-6 border p-6 rounded-md bg-gray-50/50">
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label className="text-indigo-800 font-semibold">Satır Başına Öğe Sayısı</Label>
                              <Input 
                                type="number" 
                                value={parsedSettings.itemsPerRow || ''} 
                                onChange={(e) => handleSettingChange('itemsPerRow', parseInt(e.target.value) || undefined)}
                                placeholder="Örn: 4 (Boş bırakırsanız üstten alır)"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-indigo-800 font-semibold">Kart Oranı</Label>
                              <Input 
                                value={parsedSettings.cardRatio || ''} 
                                onChange={(e) => handleSettingChange('cardRatio', e.target.value || undefined)}
                                placeholder="Örn: 16/9, 2/3, 1/1"
                              />
                            </div>
                            <div className="space-y-2">
                               <Label className="text-indigo-800 font-semibold">Oto Kaydırma Hızı (Saniye)</Label>
                               <Input 
                                type="number"
                                step="0.1"
                                value={parsedSettings.autoScrollSpeed || ''}
                                onChange={(e) => handleSettingChange('autoScrollSpeed', parseFloat(e.target.value) || undefined)}
                                placeholder="0 (Kapalı) veya örn: 2.5"
                               />
                            </div>
                            <div className="space-y-2">
                               <Label className="text-indigo-800 font-semibold">Kategori Başlık Rengi</Label>
                               <div className="flex gap-2">
                                 <Input
                                   type="color"
                                   value={parsedSettings.categoryTitleColor || '#ffffff'}
                                   onChange={(e) => handleSettingChange('categoryTitleColor', e.target.value)}
                                   className="w-12 h-10 p-1 cursor-pointer"
                                 />
                                 <Input
                                   value={parsedSettings.categoryTitleColor || ''}
                                   onChange={(e) => handleSettingChange('categoryTitleColor', e.target.value || undefined)}
                                   placeholder="Transparan veya miras almak için boş bırakın"
                                   className="flex-1 font-mono text-sm"
                                 />
                               </div>
                            </div>
                          </div>
                          
                          <div className="border-t pt-4 mt-6">
                            <h4 className="font-semibold text-gray-700 mb-4">Görünüm Bileşenleri</h4>
                            <div className="space-y-4">
                              <div className="flex items-center space-x-2">
                                <Checkbox 
                                  id="style-show-hero-slider"
                                  checked={parsedSettings.showHeroSlider !== false}
                                  onCheckedChange={(checked) => handleSettingChange('showHeroSlider', checked)}
                                />
                                <Label htmlFor="style-show-hero-slider" className="cursor-pointer text-sm font-medium text-amber-700">En Üst Kısım: Slayder (Hero) Bölümünü ve Logoyu Göster</Label>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Checkbox 
                                  id="style-show-top-menu"
                                  checked={parsedSettings.showTopMenu !== false}
                                  onCheckedChange={(checked) => handleSettingChange('showTopMenu', checked)}
                                />
                                <Label htmlFor="style-show-top-menu" className="cursor-pointer text-sm">Üst Kısım: Yuvarlak Kategori Menüsünü Göster</Label>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Checkbox 
                                  id="style-show-category-titles"
                                  checked={parsedSettings.showCategoryTitles !== false}
                                  onCheckedChange={(checked) => handleSettingChange('showCategoryTitles', checked)}
                                />
                                <Label htmlFor="style-show-category-titles" className="cursor-pointer text-sm">Kategori (İç Duvar) Başlıklarını Göster</Label>
                              </div>
                            </div>
                          </div>

                          <div className="border-t pt-4 mt-6">
                             <h4 className="font-semibold text-gray-700 mb-4">Kart ve Modal (Detay) Arkaplanı</h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="space-y-2 col-span-1 md:col-span-2">
                                  <Label>Hücre Model Tipi (Kart Şekli)</Label>
                                  <Select
                                    value={parsedSettings.cardStyle || 'cover'}
                                    onValueChange={(val) => handleSettingChange('cardStyle', val)}
                                  >
                                    <SelectTrigger><SelectValue placeholder="Model Seçin" /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="postit">Standart Postit Görünümü</SelectItem>
                                      <SelectItem value="cover">Tam Kapak Görünümü (Varsayılan)</SelectItem>
                                      <SelectItem value="magazine">Dergi / Afiş Görünümü (Görsel üstte, metin altta)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Kart Arkaplan Tipi</Label>
                                  <Select
                                    value={parsedSettings.cardBgType || 'postit'}
                                    onValueChange={(val) => handleSettingChange('cardBgType', val)}
                                  >
                                    <SelectTrigger><SelectValue placeholder="Miras Alınan" /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="postit">Postit Görünümü (Renk/Duygu)</SelectItem>
                                      <SelectItem value="solid">Düz Renk</SelectItem>
                                      <SelectItem value="transparent">Transparan (Dış hat yok)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label>Modal (Detay) Arkaplan Tipi</Label>
                                  <Select
                                    value={parsedSettings.modalBgType || 'postit'}
                                    onValueChange={(val) => handleSettingChange('modalBgType', val)}
                                  >
                                    <SelectTrigger><SelectValue placeholder="Miras Alınan" /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="postit">Postit Görünümü (Varsayılan)</SelectItem>
                                      <SelectItem value="solid">Düz Renk (Şeffaflık Destekli)</SelectItem>
                                      <SelectItem value="transparent">Transparan</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                             </div>
                             
                             {parsedSettings.modalBgType === 'solid' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 border rounded bg-white">
                                   <div className="space-y-2">
                                      <Label>Modal Düz Renk</Label>
                                      <div className="flex gap-2">
                                        <Input
                                          type="color"
                                          value={parsedSettings.modalBgColor || '#fafafa'}
                                          onChange={(e) => handleSettingChange('modalBgColor', e.target.value)}
                                          className="w-12 h-10 p-1 cursor-pointer"
                                        />
                                        <Input
                                          value={parsedSettings.modalBgColor || '#fafafa'}
                                          onChange={(e) => handleSettingChange('modalBgColor', e.target.value)}
                                          className="flex-1 font-mono text-sm h-10"
                                        />
                                      </div>
                                   </div>
                                   <div className="space-y-2">
                                      <Label>Modal Şeffaflık Görünürlüğü (10 - 100)</Label>
                                      <Input
                                        type="number"
                                        value={parsedSettings.modalBgColorAlpha || 70}
                                        onChange={(e) => handleSettingChange('modalBgColorAlpha', parseInt(e.target.value) || 70)}
                                        min="10" max="100"
                                      />
                                   </div>
                                </div>
                             )}

                             {parsedSettings.cardBgType === 'solid' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 border rounded bg-white">
                                   <div className="space-y-2">
                                      <Label>Kart Düz Renk</Label>
                                      <div className="flex gap-2">
                                        <Input
                                          type="color"
                                          value={parsedSettings.cardBgColor || '#fafafa'}
                                          onChange={(e) => handleSettingChange('cardBgColor', e.target.value)}
                                          className="w-12 h-10 p-1 cursor-pointer"
                                        />
                                        <Input
                                          value={parsedSettings.cardBgColor || '#fafafa'}
                                          onChange={(e) => handleSettingChange('cardBgColor', e.target.value)}
                                          className="flex-1 font-mono text-sm h-10"
                                        />
                                      </div>
                                   </div>
                                </div>
                             )}
                             {parsedSettings.cardStyle === 'magazine' && (
                                <div className="border-t border-dashed mt-6 pt-4">
                                  <h5 className="font-semibold text-gray-700 mb-4">Dergi / Afiş Modeli İç Tipografi (Özel)</h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label>Başlık Fontu</Label>
                                      <Select value={parsedSettings.magazineTitleFont || 'serif'} onValueChange={(val) => handleSettingChange('magazineTitleFont', val)}>
                                        <SelectTrigger><SelectValue placeholder="Font Seçimi" /></SelectTrigger>
                                        <SelectContent>
                                           <SelectItem value="sans-serif">Modern (Sans Serif)</SelectItem>
                                           <SelectItem value="serif">Klasik (Serif)</SelectItem>
                                           <SelectItem value="london">London Presley (Haber)</SelectItem>
                                           <SelectItem value="puerto">Puerto (Afiş)</SelectItem>
                                           <SelectItem value="retosta">Retosta (Klasik)</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Açıklama (Metin) Fontu</Label>
                                      <Select value={parsedSettings.magazineDescFont || 'sans-serif'} onValueChange={(val) => handleSettingChange('magazineDescFont', val)}>
                                        <SelectTrigger><SelectValue placeholder="Font Seçimi" /></SelectTrigger>
                                        <SelectContent>
                                           <SelectItem value="sans-serif">Modern (Sans Serif)</SelectItem>
                                           <SelectItem value="serif">Klasik (Serif)</SelectItem>
                                           <SelectItem value="handwriting">El Yazısı</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Başlık Büyüklüğü</Label>
                                      <Select value={parsedSettings.magazineTitleSize || 'xl'} onValueChange={(val) => handleSettingChange('magazineTitleSize', val)}>
                                        <SelectTrigger><SelectValue placeholder="Büyüklük Seçimi" /></SelectTrigger>
                                        <SelectContent>
                                           <SelectItem value="lg">Büyük (lg)</SelectItem>
                                           <SelectItem value="xl">Daha Büyük (xl)</SelectItem>
                                           <SelectItem value="2xl">Çok Büyük (2xl)</SelectItem>
                                           <SelectItem value="3xl">Devasa (3xl)</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2">
                                       <Label>Başlık Rengi</Label>
                                       <div className="flex gap-2">
                                          <Input type="color" value={parsedSettings.magazineTitleColor || '#1f2937'} onChange={(e) => handleSettingChange('magazineTitleColor', e.target.value)} className="w-12 h-10 p-1 cursor-pointer" />
                                          <Input value={parsedSettings.magazineTitleColor || '#1f2937'} onChange={(e) => handleSettingChange('magazineTitleColor', e.target.value)} className="flex-1 font-mono text-sm h-10" />
                                       </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                             <div className="border border-gray-200 mt-6 p-4 rounded-md bg-indigo-50/30">
                               <h4 className="font-semibold text-indigo-800 flex items-center gap-2 mb-4">
                                 Stil Modu OTT (Satır/Slayder) İleri Düzey Parametreleri
                               </h4>
                               <div className="space-y-4">
                                   <div className="space-y-2">
                                     <Label>Satır Başına Öğe Sayısı</Label>
                                     <Input 
                                       type="number" 
                                       value={parsedSettings.ottItemsPerRow || ''} 
                                       onChange={(e) => handleSettingChange('ottItemsPerRow', parseInt(e.target.value) || 0)}
                                       placeholder="Örn: 4"
                                     />
                                   </div>
                                   <div className="space-y-2">
                                     <Label>Kart Oranı (Örn: 16/9, 2/3)</Label>
                                     <Input 
                                       value={parsedSettings.ottCardRatio || ''} 
                                       onChange={(e) => handleSettingChange('ottCardRatio', e.target.value)}
                                       placeholder="16/9"
                                     />
                                   </div>
                                   <div className="space-y-2">
                                      <Label>Oto Kaydırma Hızı (Saniye - Örn: 1.5, 2.5)</Label>
                                      <Input 
                                       type="number"
                                       step="0.1"
                                       value={parsedSettings.ottAutoScrollSpeed === 0 ? '' : (parsedSettings.ottAutoScrollSpeed || '')}
                                       onChange={(e) => handleSettingChange('ottAutoScrollSpeed', parseFloat(e.target.value) || 0)}
                                       placeholder="0 (Kapalı) veya örn: 2.5"
                                      />
                                   </div>
                                   
                                   <div className="border-t pt-4 mt-6">
                                     <h4 className="font-semibold text-gray-700 mb-4">Tasarım Anatomisi Ayarları</h4>
                                     <div className="space-y-4">
                                       <div className="flex items-center space-x-2">
                                         <Checkbox 
                                           id="style-ott-show-hero-slider"
                                           checked={parsedSettings.ottShowHeroSlider ?? true}
                                           onCheckedChange={(checked) => handleSettingChange('ottShowHeroSlider', !!checked)}
                                         />
                                         <Label htmlFor="style-ott-show-hero-slider" className="cursor-pointer text-sm font-medium text-amber-700">En Üst Kısım: Slayder (Hero) Bölümünü ve Logoyu Göster</Label>
                                       </div>

                                       <div className="flex items-center space-x-2">
                                         <Checkbox 
                                           id="style-ott-show-top-menu"
                                           checked={parsedSettings.ottShowTopMenu ?? true}
                                           onCheckedChange={(checked) => handleSettingChange('ottShowTopMenu', !!checked)}
                                         />
                                         <Label htmlFor="style-ott-show-top-menu" className="cursor-pointer text-sm">Üst Kısım: Yuvarlak Kategori Menüsünü Göster (Instagram Hikayeleri Tarzı)</Label>
                                       </div>

                                       {(parsedSettings.ottShowTopMenu !== false) && (
                                         <div className="space-y-2 pl-6">
                                           <Label>Üst Menü İkon Şekli</Label>
                                           <Select
                                             value={parsedSettings.ottTopMenuShape || 'circle'}
                                             onValueChange={(val) => handleSettingChange('ottTopMenuShape', val)}
                                           >
                                             <SelectTrigger>
                                               <SelectValue placeholder="Şekil Seçin" />
                                             </SelectTrigger>
                                             <SelectContent>
                                               <SelectItem value="circle">Dairesel (Instagram Stili)</SelectItem>
                                               <SelectItem value="square">Oval / Kare (Netflix Stili)</SelectItem>
                                             </SelectContent>
                                           </Select>

                                           <div className="pt-2 space-y-2">
                                             <Label>İkon İç Arkaplan Zemin Rengi</Label>
                                             <div className="flex gap-2">
                                               <Input
                                                 type="color"
                                                 value={parsedSettings.ottTopMenuIconBgColor || '#ffffff'}
                                                 onChange={(e) => handleSettingChange('ottTopMenuIconBgColor', e.target.value)}
                                                 className="w-12 h-10 p-1 cursor-pointer"
                                               />
                                               <Input
                                                 value={parsedSettings.ottTopMenuIconBgColor || ''}
                                                 onChange={(e) => handleSettingChange('ottTopMenuIconBgColor', e.target.value)}
                                                 placeholder="Transparan için boş bırakın"
                                                 className="flex-1 font-mono text-sm"
                                               />
                                               <Button
                                                 type="button"
                                                 variant="outline"
                                                 onClick={() => handleSettingChange('ottTopMenuIconBgColor', '')}
                                                 title="Transparan Yap"
                                                 className="px-3"
                                               >
                                                 Sıfırla
                                               </Button>
                                             </div>
                                           </div>

                                           <div className="pt-4 border-t border-gray-100 flex items-center space-x-2">
                                             <Checkbox 
                                               id="style-ott-top-menu-marquee-active"
                                               checked={!!parsedSettings.ottTopMenuMarqueeActive}
                                               onCheckedChange={(checked) => handleSettingChange('ottTopMenuMarqueeActive', !!checked)}
                                             />
                                             <Label htmlFor="style-ott-top-menu-marquee-active" className="cursor-pointer text-sm">Menüyü Kayan Yazı (Marquee) Olarak Oynat</Label>
                                           </div>

                                           {parsedSettings.ottTopMenuMarqueeActive && (
                                             <div className="pt-2 space-y-2">
                                               <Label>Kayma Hızı (Saniye) (Daha düşük sayı = Daha hızlı)</Label>
                                               <Input
                                                 type="number"
                                                 value={parsedSettings.ottTopMenuMarqueeSpeed || 30}
                                                 onChange={(e) => handleSettingChange('ottTopMenuMarqueeSpeed', parseFloat(e.target.value) || 30)}
                                                 placeholder="Örn: 30"
                                                 className="w-full sm:w-1/3"
                                               />
                                             </div>
                                           )}
                                         </div>
                                       )}

                                       <div className="flex items-center space-x-2">
                                         <Checkbox 
                                           id="style-ott-show-category-titles"
                                           checked={parsedSettings.ottShowCategoryTitles ?? true}
                                           onCheckedChange={(checked) => handleSettingChange('ottShowCategoryTitles', !!checked)}
                                         />
                                         <Label htmlFor="style-ott-show-category-titles" className="cursor-pointer text-sm">Satırlar: Slayder Başlıklarını (Kategori İsimleri) Göster</Label>
                                       </div>

                                       <div className="flex items-center space-x-2">
                                         <Checkbox 
                                           id="style-ott-category-header-glassy"
                                           checked={parsedSettings.ottCategoryHeaderGlassy ?? false}
                                           onCheckedChange={(checked) => handleSettingChange('ottCategoryHeaderGlassy', !!checked)}
                                         />
                                         <Label htmlFor="style-ott-category-header-glassy" className="cursor-pointer text-sm font-medium">Satırlar: Kategori başlıkları saydam buton üstünde dursun</Label>
                                       </div>

                                       <div className="space-y-4 py-4 border-t border-b border-gray-100 my-4">
                                         <div className="space-y-2">
                                           <Label>OTT Kategori Satırı (Slider) Arkaplan Rengi</Label>
                                           <div className="flex gap-2">
                                             <Input
                                               type="color"
                                               value={parsedSettings.ottTopMenuLabelBgColor || '#ffffff'}
                                               onChange={(e) => handleSettingChange('ottTopMenuLabelBgColor', e.target.value)}
                                               className="w-12 h-10 p-1 cursor-pointer"
                                             />
                                             <Input
                                               value={parsedSettings.ottTopMenuLabelBgColor || ''}
                                               onChange={(e) => handleSettingChange('ottTopMenuLabelBgColor', e.target.value)}
                                               placeholder="Varsayılan Yarı Saydam (Boş Bırakılabilir)"
                                               className="flex-1 font-mono text-sm"
                                             />
                                           </div>
                                         </div>
                                         <div className="flex items-center space-x-2 pt-2">
                                           <Checkbox 
                                             id="style-ott-show-row-border"
                                             checked={!!parsedSettings.ottShowRowBorder}
                                             onCheckedChange={(checked) => handleSettingChange('ottShowRowBorder', !!checked)}
                                           />
                                           <Label htmlFor="style-ott-show-row-border" className="cursor-pointer text-sm">OTT Kategori Satırı (Slider) Etrafında Border (Çerçeve) Göster</Label>
                                         </div>
                                       </div>
                                     </div>
                                   </div>
                               </div>
                             </div>
                          </div>
                      </div>
                      );
                    })()}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="ott" className="space-y-4 pt-2">
                <div className="bg-indigo-50 p-4 rounded-lg flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-indigo-800 flex items-center gap-2 mb-1">
                      <LayoutTemplate className="w-5 h-5" /> OTT Görünüm Ayarları
                    </h4>
                    <p className="text-sm text-indigo-700">Duvarı yatay kaydırılabilir "Streaming Service UI" (Netflix vb.) formatında göstermek için ayarlar.</p>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                    <div className="flex items-center space-x-2 border border-gray-200 shadow-sm rounded-md p-4 bg-white">
                      <Checkbox 
                        id="ott-is-active"
                        checked={wallForm.isOttActive}
                        onCheckedChange={(checked) => setWallForm({ ...wallForm, isOttActive: !!checked })}
                      />
                      <Label htmlFor="ott-is-active" className="cursor-pointer font-medium text-sm">
                        Görüntüleme türünü aktif et (OTT Mod)
                      </Label>
                    </div>

                    {wallForm.isOttActive && (
                        <div className="space-y-4 border p-4 rounded-md bg-gray-50">
                           <div className="space-y-2">
                             <Label>Satır Başına Öğe Sayısı</Label>
                             <Input 
                               type="number" 
                               value={wallForm.ottItemsPerRow} 
                               onChange={(e) => setWallForm({ ...wallForm, ottItemsPerRow: parseInt(e.target.value) || 0 })}
                               placeholder="Örn: 4"
                             />
                           </div>
                           <div className="space-y-2">
                             <Label>Kart Oranı (Örn: 16/9, 2/3)</Label>
                             <Input 
                               value={wallForm.ottCardRatio} 
                               onChange={(e) => setWallForm({ ...wallForm, ottCardRatio: e.target.value })}
                               placeholder="16/9"
                             />
                           </div>
                           <div className="space-y-2">
                              <Label>Oto Kaydırma Hızı (Saniye - Örn: 1.5, 2.5)</Label>
                              <Input 
                               type="number"
                               step="0.1"
                               value={wallForm.ottAutoScrollSpeed === 0 ? '' : wallForm.ottAutoScrollSpeed}
                               onChange={(e) => setWallForm({ ...wallForm, ottAutoScrollSpeed: parseFloat(e.target.value) || 0 })}
                               placeholder="0 (Kapalı) veya örn: 2.5"
                              />
                           </div>
                           
                           <div className="border-t pt-4 mt-6">
                             <h4 className="font-semibold text-gray-700 mb-4">Tasarım Anatomisi Ayarları</h4>
                             <div className="space-y-4">
                               <div className="flex items-center space-x-2">
                                 <Checkbox 
                                   id="ott-show-hero-slider"
                                   checked={wallForm.ottShowHeroSlider}
                                   onCheckedChange={(checked) => setWallForm({ ...wallForm, ottShowHeroSlider: !!checked })}
                                 />
                                 <Label htmlFor="ott-show-hero-slider" className="cursor-pointer text-sm font-medium text-amber-700">En Üst Kısım: Slayder (Hero) Bölümünü ve Logoyu Göster</Label>
                               </div>

                               <div className="flex items-center space-x-2">
                                 <Checkbox 
                                   id="ott-show-top-menu"
                                   checked={wallForm.ottShowTopMenu}
                                   onCheckedChange={(checked) => setWallForm({ ...wallForm, ottShowTopMenu: !!checked })}
                                 />
                                 <Label htmlFor="ott-show-top-menu" className="cursor-pointer text-sm">Üst Kısım: Yuvarlak Kategori Menüsünü Göster (Instagram Hikayeleri Tarzı)</Label>
                               </div>

                               {wallForm.ottShowTopMenu && (
                                 <div className="space-y-2 pl-6">
                                   <Label>Üst Menü İkon Şekli</Label>
                                   <Select
                                     value={wallForm.ottTopMenuShape || 'circle'}
                                     onValueChange={(val) => setWallForm({ ...wallForm, ottTopMenuShape: val })}
                                   >
                                     <SelectTrigger>
                                       <SelectValue placeholder="Şekil Seçin" />
                                     </SelectTrigger>
                                     <SelectContent>
                                       <SelectItem value="circle">Dairesel (Instagram Stili)</SelectItem>
                                       <SelectItem value="square">Oval / Kare (Netflix Stili)</SelectItem>
                                     </SelectContent>
                                   </Select>

                                   <div className="pt-2 space-y-2">
                                     <Label>İkon İç Arkaplan Zemin Rengi</Label>
                                     <div className="flex gap-2">
                                       <Input
                                         type="color"
                                         value={wallForm.ottTopMenuIconBgColor || '#ffffff'}
                                         onChange={(e) => setWallForm({ ...wallForm, ottTopMenuIconBgColor: e.target.value })}
                                         className="w-12 h-10 p-1 cursor-pointer"
                                       />
                                       <Input
                                         value={wallForm.ottTopMenuIconBgColor || ''}
                                         onChange={(e) => setWallForm({ ...wallForm, ottTopMenuIconBgColor: e.target.value })}
                                         placeholder="Transparan için boş bırakın"
                                         className="flex-1 font-mono text-sm"
                                       />
                                       <Button
                                         type="button"
                                         variant="outline"
                                         onClick={() => setWallForm({ ...wallForm, ottTopMenuIconBgColor: '' })}
                                         title="Transparan Yap"
                                         className="px-3"
                                       >
                                         Sıfırla
                                       </Button>
                                     </div>
                                   </div>

                                   <div className="pt-4 border-t border-gray-100 flex items-center space-x-2">
                                     <Checkbox 
                                       id="ott-top-menu-marquee-active"
                                       checked={wallForm.ottTopMenuMarqueeActive}
                                       onCheckedChange={(checked) => setWallForm({ ...wallForm, ottTopMenuMarqueeActive: !!checked })}
                                     />
                                     <Label htmlFor="ott-top-menu-marquee-active" className="cursor-pointer text-sm">Menüyü Kayan Yazı (Marquee) Olarak Oynat</Label>
                                   </div>

                                   {wallForm.ottTopMenuMarqueeActive && (
                                     <div className="pt-2 space-y-2">
                                       <Label>Kayma Hızı (Saniye) (Daha düşük sayı = Daha hızlı)</Label>
                                       <Input
                                         type="number"
                                         value={wallForm.ottTopMenuMarqueeSpeed || 30}
                                         onChange={(e) => setWallForm({ ...wallForm, ottTopMenuMarqueeSpeed: parseFloat(e.target.value) || 30 })}
                                         placeholder="Örn: 30"
                                         className="w-full sm:w-1/3"
                                       />
                                     </div>
                                   )}
                                 </div>
                               )}

                               <div className="flex items-center space-x-2">
                                 <Checkbox 
                                   id="ott-show-category-titles"
                                   checked={wallForm.ottShowCategoryTitles}
                                   onCheckedChange={(checked) => setWallForm({ ...wallForm, ottShowCategoryTitles: !!checked })}
                                 />
                                 <Label htmlFor="ott-show-category-titles" className="cursor-pointer text-sm">Satırlar: Slayder Başlıklarını (Kategori İsimleri) Göster</Label>
                               </div>

                               <div className="flex items-center space-x-2 mt-2">
                                 <Checkbox 
                                   id="ott-category-header-glassy"
                                   checked={wallForm.ottCategoryHeaderGlassy}
                                   onCheckedChange={(checked) => setWallForm({ ...wallForm, ottCategoryHeaderGlassy: !!checked })}
                                 />
                                 <Label htmlFor="ott-category-header-glassy" className="cursor-pointer text-sm font-medium">Satırlar: Kategori başlıkları saydam buton üstünde dursun</Label>
                               </div>

                               <div className="space-y-4 py-4 border-t border-b border-gray-100 my-4">
                                 <div className="space-y-2">
                                   <Label>OTT Kategori Satırı (Slider) Arkaplan Rengi</Label>
                                   <div className="flex gap-2">
                                     <Input
                                       type="color"
                                       value={wallForm.ottTopMenuLabelBgColor || '#ffffff'}
                                       onChange={(e) => setWallForm({ ...wallForm, ottTopMenuLabelBgColor: e.target.value })}
                                       className="w-12 h-10 p-1 cursor-pointer"
                                     />
                                     <Input
                                       value={wallForm.ottTopMenuLabelBgColor || ''}
                                       onChange={(e) => setWallForm({ ...wallForm, ottTopMenuLabelBgColor: e.target.value })}
                                       placeholder="Varsayılan Yarı Saydam (Boş Bırakılabilir)"
                                       className="flex-1 font-mono text-sm"
                                     />
                                   </div>
                                 </div>
                                 <div className="flex items-center space-x-2">
                                   <Checkbox
                                     id="ott-top-menu-border"
                                     checked={wallForm.ottTopMenuLabelHasBorder}
                                     onCheckedChange={(checked) => setWallForm({ ...wallForm, ottTopMenuLabelHasBorder: !!checked })}
                                   />
                                   <Label htmlFor="ott-top-menu-border" className="cursor-pointer text-sm font-semibold">OTT Kategori Satırı (Slider) Etrafında Border (Çerçeve) Göster</Label>
                                 </div>
                               </div>


                               <div className="space-y-2 pt-2">
                                 <Label>İçerik Kartları Stili</Label>
                                 <Select
                                   value={wallForm.ottCardStyle || 'cover'}
                                   onValueChange={(val) => setWallForm({ ...wallForm, ottCardStyle: val })}
                                 >
                                   <SelectTrigger>
                                     <SelectValue placeholder="Kart Stili Seçin" />
                                   </SelectTrigger>
                                   <SelectContent>
                                     <SelectItem value="cover">Görsel Ön Planda (Hover ile Büyüyen Kapak Kartı)</SelectItem>
                                     <SelectItem value="classic">Klasik Post-it (Çizgili Not Kartı)</SelectItem>
                                     <SelectItem value="polaroid">Polaroid Kart (İçten Sınırlandırılmış Minimal Tasarım)</SelectItem>
                                     <SelectItem value="categorical">Kategorik Görünüm (Alt Kategoriler ve Temsili Postitler)</SelectItem>
                                   </SelectContent>
                                 </Select>
                               </div>

                               <div className="space-y-4 pt-4 border-t border-gray-100 mt-4">
                                 <div className="mt-8 p-6 bg-indigo-50/40 border border-indigo-100 rounded-xl space-y-8 shadow-sm">
                                 <div className="space-y-1 mb-4 border-b border-indigo-100/60 pb-4">
                                   <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                                     <StickyNote className="w-5 h-5 text-indigo-600" />
                                     Postit Kartı ve Açılır Pencere Görünüm Ayarları
                                   </h3>
                                   <p className="text-sm text-indigo-700/80">
                                     OTT modundaki postit hücrelerinin ve postite tıklandığında açılan okuma penceresinin tasarım ayarlarını tek bir yerden yönetin.
                                   </p>
                                 </div>
                                 <div className="space-y-4 pt-2">
                                   <Label className="text-base font-bold text-gray-800 border-l-4 border-indigo-500 pl-2">1. Postit (Hücre) Zemin Ayarları</Label>
                                 
                                 <div className="space-y-2">
                                   <Label>Zemin Tipi</Label>
                                   <Select
                                     value={wallForm.ottCardBgType || 'postit'}
                                     onValueChange={(val) => setWallForm({ ...wallForm, ottCardBgType: val })}
                                   >
                                     <SelectTrigger><SelectValue placeholder="Postit Rengi (Varsayılan)" /></SelectTrigger>
                                     <SelectContent>
                                       <SelectItem value="postit">Postit Rengi (Postit Oluşturulurken Gelen Renk)</SelectItem>
                                       <SelectItem value="transparent">Şeffaf (Transparan)</SelectItem>
                                       <SelectItem value="color">Özel Renk Seç</SelectItem>
                                       <SelectItem value="gradient">3 Renk Gradyan Seç</SelectItem>
                                       <SelectItem value="image">Arkaplan Resmi Ekle</SelectItem>
                                     </SelectContent>
                                   </Select>
                                 </div>

                                 <div className="space-y-4">
                                 {wallForm.ottCardBgType === 'color' && (
                                   <div className="space-y-2">
                                     <Label>Özel Zemin Rengi</Label>
                                     <div className="flex gap-2">
                                       <Input
                                         type="color"
                                         value={wallForm.ottCardBgColor || '#ffffff'}
                                         onChange={(e) => setWallForm({ ...wallForm, ottCardBgColor: e.target.value })}
                                         className="w-12 h-10 p-1 cursor-pointer"
                                       />
                                       <Input
                                         value={wallForm.ottCardBgColor || ''}
                                         onChange={(e) => setWallForm({ ...wallForm, ottCardBgColor: e.target.value })}
                                         placeholder="Örn: #ffffff veya rgb(255,255,255)"
                                         className="flex-1 font-mono text-sm"
                                       />
                                     </div>
                                      <div className="space-y-2 mt-4">
                                        <Label>Zemin Şeffaflığı (Yüzde %)</Label>
                                        <div className="flex items-center gap-4">
                                          <input 
                                            type="range" 
                                            min="0" max="100" 
                                            value={wallForm.ottCardBgColorAlpha ?? 100} 
                                            onChange={(e) => setWallForm({ ...wallForm, ottCardBgColorAlpha: parseInt(e.target.value) })}
                                            className="flex-1"
                                          />
                                          <span className="w-12 text-center text-sm font-semibold">{wallForm.ottCardBgColorAlpha ?? 100}%</span>
                                        </div>
                                        <p className="text-xs text-gray-400">0: Tam Şeffaf, 100: Tamamen Opak (Saydam değil)</p>
                                      </div>
                                   </div>
                                 )}

                                 {wallForm.ottCardBgType === 'gradient' && (
                                   <div className="space-y-2">
                                     <Label>3 Renk Gradyan (Başlangıç - Orta - Bitiş)</Label>
                                     <div className="flex gap-2">
                                       <Input
                                         type="color"
                                         value={(wallForm.ottCardBgColor?.includes(',') ? wallForm.ottCardBgColor.split(',')[0] : '#facc15')}
                                         onChange={(e) => {
                                           const parts = wallForm.ottCardBgColor?.includes(',') ? wallForm.ottCardBgColor.split(',') : ['#facc15', '#f472b6', '#a855f7'];
                                           parts[0] = e.target.value;
                                           setWallForm({ ...wallForm, ottCardBgColor: parts.join(',') })
                                         }}
                                         className="w-12 h-10 p-1 cursor-pointer"
                                         title="Başlangıç Rengi"
                                       />
                                       <Input
                                         type="color"
                                         value={(wallForm.ottCardBgColor?.includes(',') ? wallForm.ottCardBgColor.split(',')[1] : '#f472b6')}
                                         onChange={(e) => {
                                           const parts = wallForm.ottCardBgColor?.includes(',') ? wallForm.ottCardBgColor.split(',') : ['#facc15', '#f472b6', '#a855f7'];
                                           parts[1] = e.target.value;
                                           setWallForm({ ...wallForm, ottCardBgColor: parts.join(',') })
                                         }}
                                         className="w-12 h-10 p-1 cursor-pointer flex-1"
                                         title="Orta Renk"
                                       />
                                       <Input
                                         type="color"
                                         value={(wallForm.ottCardBgColor?.includes(',') ? wallForm.ottCardBgColor.split(',')[2] : '#a855f7')}
                                         onChange={(e) => {
                                           const parts = wallForm.ottCardBgColor?.includes(',') ? wallForm.ottCardBgColor.split(',') : ['#facc15', '#f472b6', '#a855f7'];
                                           parts[2] = e.target.value;
                                           setWallForm({ ...wallForm, ottCardBgColor: parts.join(',') })
                                         }}
                                         className="w-12 h-10 p-1 cursor-pointer flex-1"
                                         title="Bitiş Rengi"
                                       />
                                     </div>
                                   </div>
                                 )}

                                 {wallForm.ottCardBgType === 'image' && (
                                   <div className="space-y-2">
                                     <Label>Zemin Arkaplan Resmi</Label>
                                     <div className="flex gap-4 items-center">
                                       <Button
                                         type="button"
                                         variant="outline"
                                         onClick={() => document.getElementById('ott-bg-upload')?.click()}
                                         disabled={uploadingOttBgImage}
                                       >
                                         {uploadingOttBgImage ? 'Yükleniyor...' : 'Resim Yükle'}
                                       </Button>
                                       <input 
                                         id="ott-bg-upload" 
                                         type="file" 
                                         accept="image/*" 
                                         onChange={handleOttBgImageUpload} 
                                         className="hidden" 
                                       />
                                       {wallForm.ottCardBgImage && (
                                         <div className="relative group">
                                           <img src={wallForm.ottCardBgImage} alt="Zemin" className="w-16 h-16 object-cover rounded-lg border shadow-sm" />
                                           <button
                                             type="button"
                                             onClick={() => setWallForm({ ...wallForm, ottCardBgImage: '' })}
                                             className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                           >
                                             <X className="w-3 h-3" />
                                           </button>
                                         </div>
                                       )}
                                     </div>
                                     {wallForm.ottCardBgImage && (
                                       <div className="grid grid-cols-2 gap-4 mt-4 bg-gray-50/50 p-4 rounded-lg border">
                                         <div className="space-y-2">
                                           <Label>Resim Boyutlandırma</Label>
                                           <Select
                                             value={wallForm.postitAppearance?.ottCardBgImageSize || 'cover'}
                                             onValueChange={(val) => setWallForm({ ...wallForm, postitAppearance: { ...(wallForm.postitAppearance || {}), ottCardBgImageSize: val } })}
                                           >
                                             <SelectTrigger className="bg-white"><SelectValue placeholder="Seçiniz" /></SelectTrigger>
                                             <SelectContent>
                                               <SelectItem value="cover">Tamamı Kapla (Cover)</SelectItem>
                                               <SelectItem value="contain">Sığdır (Contain)</SelectItem>
                                               <SelectItem value="100% 100%">Kenarları Yasla (Uzat)</SelectItem>
                                               <SelectItem value="auto">Orjinal Boyut</SelectItem>
                                             </SelectContent>
                                           </Select>
                                         </div>
                                         <div className="space-y-2">
                                           <Label>Resim Hizalama</Label>
                                           <Select
                                             value={wallForm.postitAppearance?.ottCardBgImagePosition || 'center'}
                                             onValueChange={(val) => setWallForm({ ...wallForm, postitAppearance: { ...(wallForm.postitAppearance || {}), ottCardBgImagePosition: val } })}
                                           >
                                             <SelectTrigger className="bg-white"><SelectValue placeholder="Seçiniz" /></SelectTrigger>
                                             <SelectContent>
                                               <SelectItem value="center">Tam Merkez</SelectItem>
                                               <SelectItem value="top center">Üst Merkez</SelectItem>
                                               <SelectItem value="bottom center">Alt Merkez</SelectItem>
                                               <SelectItem value="left center">Sol Merkez</SelectItem>
                                               <SelectItem value="right center">Sağ Merkez</SelectItem>
                                             </SelectContent>
                                           </Select>
                                         </div>
                                       </div>
                                     )}
                                   </div>
                                 )}
                                 </div>

                                 <div className="space-y-4 pt-4 mt-2 border-t border-gray-100">
                                   <div className="space-y-2">
                                     <Label>Postit (Hücre) Yazı Rengi</Label>
                                     <div className="flex gap-2">
                                       <Input
                                         type="color"
                                         value={wallForm.postitAppearance?.textColor || '#ffffff'}
                                         onChange={(e) => setWallForm({ ...wallForm, postitAppearance: { ...(wallForm.postitAppearance || {}), textColor: e.target.value } })}
                                         className="w-12 h-10 p-1 cursor-pointer"
                                       />
                                       <div className="flex-1 flex gap-2">
                                        <Input
                                          value={wallForm.postitAppearance?.textColor || ''}
                                          onChange={(e) => setWallForm({ ...wallForm, postitAppearance: { ...(wallForm.postitAppearance || {}), textColor: e.target.value } })}
                                          placeholder="Varsayılan için boş bırakın"
                                          className="font-mono text-sm"
                                        />
                                        <Button type="button" variant="outline" onClick={() => setWallForm({ ...wallForm, postitAppearance: { ...(wallForm.postitAppearance || {}), textColor: '' } })}>Sıfırla</Button>
                                       </div>
                                     </div>
                                   </div>

                                   <div className="space-y-2">
                                     <Label>Postit (Hücre) Yazı Fontu</Label>
                                     <Select
                                       value={wallForm.postitAppearance?.font || ''}
                                       onValueChange={(val) => setWallForm({ ...wallForm, postitAppearance: { ...(wallForm.postitAppearance || {}), font: val } })}
                                     >
                                       <SelectTrigger className="bg-white"><SelectValue placeholder="Varsayılan (Tema fontu)" /></SelectTrigger>
                                       <SelectContent>
                                         <SelectItem value="font-sans">Modern (Sans)</SelectItem>
                                         <SelectItem value="font-serif">Klasik (Serif)</SelectItem>
                                         <SelectItem value="font-handwriting">El Yazısı (Kalam)</SelectItem>
                                         <SelectItem value="font-mono">Daktilo (Mono)</SelectItem>
                                         <SelectItem value="font-comic">Eğlenceli (Comic)</SelectItem>
                                       </SelectContent>
                                     </Select>
                                   </div>

                                   <div className="space-y-2">
                                     <Label>Postit (Hücre) Yazı Boyutu</Label>
                                     <Select
                                       value={wallForm.postitAppearance?.textSize || ''}
                                       onValueChange={(val) => setWallForm({ ...wallForm, postitAppearance: { ...(wallForm.postitAppearance || {}), textSize: val } })}
                                     >
                                       <SelectTrigger className="bg-white"><SelectValue placeholder="Varsayılan Boyut" /></SelectTrigger>
                                       <SelectContent>
                                         <SelectItem value="text-xs">Çok Küçük</SelectItem>
                                         <SelectItem value="text-sm">Küçük</SelectItem>
                                         <SelectItem value="text-base">Normal</SelectItem>
                                         <SelectItem value="text-lg">Büyük</SelectItem>
                                         <SelectItem value="text-xl">Çok Büyük</SelectItem>
                                         <SelectItem value="text-2xl">Ekstra Büyük</SelectItem>
                                         <SelectItem value="text-3xl">Dev</SelectItem>
                                       </SelectContent>
                                     </Select>
                                   </div>
                                 </div>
                               </div>

                                 <div className="space-y-4 pt-4 mt-4 border-t border-gray-100">
                                   <Label className="text-base font-bold text-gray-800 border-l-4 border-indigo-500 pl-2">2. Postit Hücre Çerçeve Ayarları</Label>
                                   
                                   <div className="flex items-center space-x-2">
                                     <Checkbox 
                                       id="ott-cell-border-enabled"
                                       checked={wallForm.postitAppearance?.ottCellBorderEnabled || false}
                                       onCheckedChange={(checked) => setWallForm({ ...wallForm, postitAppearance: { ...(wallForm.postitAppearance || {}), ottCellBorderEnabled: !!checked } })}
                                     />
                                     <Label htmlFor="ott-cell-border-enabled" className="cursor-pointer text-sm font-semibold">Çerçeve Uygula</Label>
                                   </div>

                                   {wallForm.postitAppearance?.ottCellBorderEnabled && (
                                     <div className="space-y-4 pl-6 border-l-2 border-indigo-100 ml-1 mt-4">
                                       <div className="space-y-2">
                                         <Label>Çizgi Tipi</Label>
                                         <Select
                                           value={wallForm.postitAppearance?.ottCellBorderStyle || 'solid'}
                                           onValueChange={(val) => setWallForm({ ...wallForm, postitAppearance: { ...(wallForm.postitAppearance || {}), ottCellBorderStyle: val } })}
                                         >
                                           <SelectTrigger className="bg-white"><SelectValue placeholder="Düz Çizgi (Solid)" /></SelectTrigger>
                                           <SelectContent>
                                             <SelectItem value="solid">Düz Çizgi (Solid)</SelectItem>
                                             <SelectItem value="dashed">Kesik Çizgi (Dashed)</SelectItem>
                                             <SelectItem value="dotted">Noktalı Çizgi (Dotted)</SelectItem>
                                             <SelectItem value="double">Çift Çizgi (Double)</SelectItem>
                                           </SelectContent>
                                         </Select>
                                       </div>

                                       <div className="space-y-2">
                                         <Label>Çizgi Rengi</Label>
                                         <div className="flex gap-2">
                                           <Input
                                             type="color"
                                             value={wallForm.postitAppearance?.ottCellBorderColor || '#000000'}
                                             onChange={(e) => setWallForm({ ...wallForm, postitAppearance: { ...(wallForm.postitAppearance || {}), ottCellBorderColor: e.target.value } })}
                                             className="w-12 h-10 p-1 cursor-pointer"
                                           />
                                           <div className="flex-1 flex gap-2">
                                             <Input
                                               value={wallForm.postitAppearance?.ottCellBorderColor || '#000000'}
                                               onChange={(e) => setWallForm({ ...wallForm, postitAppearance: { ...(wallForm.postitAppearance || {}), ottCellBorderColor: e.target.value } })}
                                               placeholder="#000000"
                                               className="font-mono text-sm"
                                             />
                                             <Button type="button" variant="outline" onClick={() => setWallForm({ ...wallForm, postitAppearance: { ...(wallForm.postitAppearance || {}), ottCellBorderColor: '#000000' } })}>Sıfırla</Button>
                                           </div>
                                         </div>
                                       </div>

                                       <div className="space-y-2">
                                         <Label>Çizgi Kalınlığı</Label>
                                         <Select
                                           value={wallForm.postitAppearance?.ottCellBorderWidth || '1px'}
                                           onValueChange={(val) => setWallForm({ ...wallForm, postitAppearance: { ...(wallForm.postitAppearance || {}), ottCellBorderWidth: val } })}
                                         >
                                           <SelectTrigger className="bg-white"><SelectValue placeholder="1px" /></SelectTrigger>
                                           <SelectContent>
                                             <SelectItem value="1px">İnce (1px)</SelectItem>
                                             <SelectItem value="2px">Normal (2px)</SelectItem>
                                             <SelectItem value="3px">Orta (3px)</SelectItem>
                                             <SelectItem value="4px">Kalın (4px)</SelectItem>
                                             <SelectItem value="8px">Çok Kalın (8px)</SelectItem>
                                           </SelectContent>
                                         </Select>
                                       </div>

                                       <div className="space-y-2">
                                         <Label>Köşe Ovalliği (Border Radius)</Label>
                                         <Select
                                           value={wallForm.postitAppearance?.ottCellBorderRadius || '0px'}
                                           onValueChange={(val) => setWallForm({ ...wallForm, postitAppearance: { ...(wallForm.postitAppearance || {}), ottCellBorderRadius: val } })}
                                         >
                                           <SelectTrigger className="bg-white"><SelectValue placeholder="Köşeli (0px)" /></SelectTrigger>
                                           <SelectContent>
                                             <SelectItem value="0px">Köşeli (0px - Varsayılan)</SelectItem>
                                             <SelectItem value="4px">Hafif Oval (4px)</SelectItem>
                                             <SelectItem value="8px">Oval (8px)</SelectItem>
                                             <SelectItem value="12px">Yuvarlak (12px)</SelectItem>
                                             <SelectItem value="16px">Çok Yuvarlak (16px)</SelectItem>
                                             <SelectItem value="24px">Tam Yuvarlak (24px)</SelectItem>
                                           </SelectContent>
                                         </Select>
                                       </div>
                                     </div>
                                   )}
                                 </div>

                                 <div className="space-y-4 pt-4 border-t border-gray-100 mt-4">
                                   <Label className="text-base font-bold text-gray-800 border-l-4 border-indigo-500 pl-2">3. Postit Detay (Açılır Pencere) Zemin Ayarları</Label>
                                 
                                 <div className="space-y-2">
                                   <Label>Zemin Tipi</Label>
                                   <Select
                                     value={wallForm.ottModalBgType || 'postit'}
                                     onValueChange={(val) => setWallForm({ ...wallForm, ottModalBgType: val })}
                                   >
                                     <SelectTrigger><SelectValue placeholder="Orjinal Renk" /></SelectTrigger>
                                     <SelectContent>
                                       <SelectItem value="postit">Orjinal Renk (Postit kendi rengi)</SelectItem>
                                       <SelectItem value="transparent">Transparan (Tam Şeffaf)</SelectItem>
                                       <SelectItem value="semi-transparent">%70 Transparan (Yarı Şeffaf)</SelectItem>
                                       <SelectItem value="color">Renk Seçimli (Özel Renk)</SelectItem>
                                       <SelectItem value="gradient">3 Renk Gradyan Seç</SelectItem>
                                       <SelectItem value="image">Arkaplan Resmi Ekle</SelectItem>
                                     </SelectContent>
                                   </Select>
                                 </div>

                                 {wallForm.ottModalBgType === 'color' && (
                                   <div className="space-y-4">
                                     <div className="space-y-2">
                                       <Label>Özel Zemin Rengi</Label>
                                       <div className="flex gap-2">
                                         <Input
                                           type="color"
                                           value={wallForm.ottModalBgColor || '#ffffff'}
                                           onChange={(e) => setWallForm({ ...wallForm, ottModalBgColor: e.target.value })}
                                           className="w-12 h-10 p-1 cursor-pointer"
                                         />
                                         <Input
                                           value={wallForm.ottModalBgColor || ''}
                                           onChange={(e) => setWallForm({ ...wallForm, ottModalBgColor: e.target.value })}
                                           placeholder="Örn: #ffffff"
                                           className="flex-1 font-mono text-sm"
                                         />
                                       </div>
                                     </div>
                                     <div className="space-y-2">
                                       <Label>Zemin Şeffaflığı (Yüzde %)</Label>
                                       <div className="flex items-center gap-4">
                                         <input 
                                           type="range" 
                                           min="0" max="100" 
                                           value={wallForm.ottModalBgColorAlpha ?? 70} 
                                           onChange={(e) => setWallForm({ ...wallForm, ottModalBgColorAlpha: parseInt(e.target.value) })}
                                           className="flex-1"
                                         />
                                         <span className="w-12 text-center text-sm font-semibold">{wallForm.ottModalBgColorAlpha ?? 70}%</span>
                                       </div>
                                       <p className="text-xs text-gray-400">0: Tam Şeffaf, 100: Tamamen Opak (Saydam değil)</p>
                                     </div>
                                   </div>
                                 )}

                                 {wallForm.ottModalBgType === 'gradient' && (
                                   <div className="space-y-4">
                                     <div className="space-y-2">
                                       <Label>3 Renk Gradyan (Başlangıç - Orta - Bitiş)</Label>
                                       <div className="flex gap-2">
                                         <Input
                                           type="color"
                                           value={(wallForm.ottModalBgColor?.includes(',') ? wallForm.ottModalBgColor.split(',')[0] : '#facc15')}
                                           onChange={(e) => {
                                             const parts = wallForm.ottModalBgColor?.includes(',') ? wallForm.ottModalBgColor.split(',') : ['#facc15', '#f472b6', '#a855f7'];
                                             parts[0] = e.target.value;
                                             setWallForm({ ...wallForm, ottModalBgColor: parts.join(',') })
                                           }}
                                           className="w-12 h-10 p-1 cursor-pointer"
                                           title="Başlangıç Rengi"
                                         />
                                         <Input
                                           type="color"
                                           value={(wallForm.ottModalBgColor?.includes(',') ? wallForm.ottModalBgColor.split(',')[1] : '#f472b6')}
                                           onChange={(e) => {
                                             const parts = wallForm.ottModalBgColor?.includes(',') ? wallForm.ottModalBgColor.split(',') : ['#facc15', '#f472b6', '#a855f7'];
                                             parts[1] = e.target.value;
                                             setWallForm({ ...wallForm, ottModalBgColor: parts.join(',') })
                                           }}
                                           className="w-12 h-10 p-1 cursor-pointer flex-1"
                                           title="Orta Renk"
                                         />
                                         <Input
                                           type="color"
                                           value={(wallForm.ottModalBgColor?.includes(',') ? wallForm.ottModalBgColor.split(',')[2] : '#a855f7')}
                                           onChange={(e) => {
                                             const parts = wallForm.ottModalBgColor?.includes(',') ? wallForm.ottModalBgColor.split(',') : ['#facc15', '#f472b6', '#a855f7'];
                                             parts[2] = e.target.value;
                                             setWallForm({ ...wallForm, ottModalBgColor: parts.join(',') })
                                           }}
                                           className="w-12 h-10 p-1 cursor-pointer flex-1"
                                           title="Bitiş Rengi"
                                         />
                                       </div>
                                     </div>
                                   </div>
                                 )}

                                 {wallForm.ottModalBgType === 'image' && (
                                   <div className="space-y-4">
                                     <div className="space-y-2">
                                       <Label>Açılır Pencere Arkaplan Resmi</Label>
                                       <div className="flex gap-4 items-center">
                                         <Button
                                           type="button"
                                           variant="outline"
                                           onClick={() => document.getElementById('ott-modal-bg-upload')?.click()}
                                           disabled={uploadingOttModalBgImage}
                                         >
                                           {uploadingOttModalBgImage ? 'Yükleniyor...' : 'Resim Yükle'}
                                         </Button>
                                         <input 
                                           id="ott-modal-bg-upload" 
                                           type="file" 
                                           accept="image/*" 
                                           onChange={handleOttModalBgImageUpload} 
                                           className="hidden" 
                                         />
                                         {wallForm.ottModalBgImage && (
                                           <div className="relative group">
                                             <img src={wallForm.ottModalBgImage} alt="Zemin" className="w-16 h-16 object-cover rounded-lg border shadow-sm" />
                                             <button
                                               type="button"
                                               onClick={() => setWallForm({ ...wallForm, ottModalBgImage: '' })}
                                               className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                             >
                                               <X className="w-3 h-3" />
                                             </button>
                                           </div>
                                         )}
                                       </div>
                                     </div>
                                     {wallForm.ottModalBgImage && (
                                       <div className="grid grid-cols-2 gap-4 mt-4 bg-gray-50/50 p-4 rounded-lg border">
                                         <div className="space-y-2">
                                           <Label>Resim Boyutlandırma</Label>
                                           <Select
                                             value={wallForm.postitAppearance?.ottModalBgImageSize || 'cover'}
                                             onValueChange={(val) => setWallForm({ ...wallForm, postitAppearance: { ...(wallForm.postitAppearance || {}), ottModalBgImageSize: val } })}
                                           >
                                             <SelectTrigger className="bg-white"><SelectValue placeholder="Seçiniz" /></SelectTrigger>
                                             <SelectContent>
                                               <SelectItem value="cover">Tamamı Kapla (Cover)</SelectItem>
                                               <SelectItem value="contain">Sığdır (Contain)</SelectItem>
                                               <SelectItem value="100% 100%">Kenarları Yasla (Uzat)</SelectItem>
                                               <SelectItem value="auto">Orjinal Boyut</SelectItem>
                                             </SelectContent>
                                           </Select>
                                         </div>
                                         <div className="space-y-2">
                                           <Label>Resim Hizalama</Label>
                                           <Select
                                             value={wallForm.postitAppearance?.ottModalBgImagePosition || 'center'}
                                             onValueChange={(val) => setWallForm({ ...wallForm, postitAppearance: { ...(wallForm.postitAppearance || {}), ottModalBgImagePosition: val } })}
                                           >
                                             <SelectTrigger className="bg-white"><SelectValue placeholder="Seçiniz" /></SelectTrigger>
                                             <SelectContent>
                                               <SelectItem value="center">Tam Merkez</SelectItem>
                                               <SelectItem value="top center">Üst Merkez</SelectItem>
                                               <SelectItem value="bottom center">Alt Merkez</SelectItem>
                                               <SelectItem value="left center">Sol Merkez</SelectItem>
                                               <SelectItem value="right center">Sağ Merkez</SelectItem>
                                             </SelectContent>
                                           </Select>
                                         </div>
                                       </div>
                                     )}
                                   </div>
                                 )}

                                 <div className="space-y-2 mt-4">
                                   <Label>Postit İçeriği (Yazı) Rengi (Opsiyonel)</Label>
                                   <div className="flex gap-2">
                                     <Input
                                       type="color"
                                       value={wallForm.ottModalTextColor || '#000000'}
                                       onChange={(e) => setWallForm({ ...wallForm, ottModalTextColor: e.target.value })}
                                       className="w-12 h-10 p-1 cursor-pointer"
                                     />
                                     <div className="flex-1 flex gap-2">
                                      <Input
                                        value={wallForm.ottModalTextColor || ''}
                                        onChange={(e) => setWallForm({ ...wallForm, ottModalTextColor: e.target.value })}
                                        placeholder="Varsayılan için boş bırakın"
                                        className="font-mono text-sm"
                                      />
                                      <Button type="button" variant="outline" onClick={() => setWallForm({ ...wallForm, ottModalTextColor: '' })}>Sıfırla</Button>
                                     </div>
                                   </div>
                                  </div>

                                  <div className="space-y-4 pt-4 mt-2 border-t border-indigo-100">
                                     <div className="space-y-2">
                                       <Label>Açılır Pencere Yazı Fontu (Opsiyonel)</Label>
                                       <Select
                                         value={wallForm.postitAppearance?.ottModalFont || ''}
                                         onValueChange={(val) => setWallForm({ ...wallForm, postitAppearance: { ...(wallForm.postitAppearance || {}), ottModalFont: val } })}
                                       >
                                         <SelectTrigger className="bg-white"><SelectValue placeholder="Orjinal (Hücre Fontu)" /></SelectTrigger>
                                         <SelectContent>
                                           <SelectItem value="font-sans">Modern (Sans)</SelectItem>
                                           <SelectItem value="font-serif">Klasik (Serif)</SelectItem>
                                           <SelectItem value="font-handwriting">El Yazısı (Kalam)</SelectItem>
                                           <SelectItem value="font-mono">Daktilo (Mono)</SelectItem>
                                       <SelectItem value="font-comic">Eğlenceli (Comic)</SelectItem>
                                         </SelectContent>
                                       </Select>
                                     </div>

                                     <div className="space-y-2">
                                       <Label>Açılır Pencere Yazı Boyutu (Opsiyonel)</Label>
                                       <Select
                                         value={wallForm.postitAppearance?.ottModalTextSize || ''}
                                         onValueChange={(val) => setWallForm({ ...wallForm, postitAppearance: { ...(wallForm.postitAppearance || {}), ottModalTextSize: val } })}
                                       >
                                         <SelectTrigger className="bg-white"><SelectValue placeholder="Varsayılan Boyut" /></SelectTrigger>
                                         <SelectContent>
                                           <SelectItem value="text-sm">Küçük</SelectItem>
                                           <SelectItem value="text-base">Normal</SelectItem>
                                           <SelectItem value="text-lg">Büyük</SelectItem>
                                           <SelectItem value="text-xl">Çok Büyük</SelectItem>
                                           <SelectItem value="text-2xl">Ekstra Büyük</SelectItem>
                                           <SelectItem value="text-3xl">Dev</SelectItem>
                                           <SelectItem value="text-4xl">Mega</SelectItem>
                                         </SelectContent>
                                       </Select>
                                     </div>
                                  </div>
                                </div>
                               </div>
                               </div>

                               {wallForm.ottShowCategoryTitles && (
                                 <div className="space-y-4 pt-4 border-t border-gray-100">
                                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                     <div className="space-y-2">
                                       <Label>Kategori Başlığı Hizalaması</Label>
                                       <Select
                                         value={wallForm.ottCategoryTitleAlignment || 'left'}
                                         onValueChange={(val) => setWallForm({ ...wallForm, ottCategoryTitleAlignment: val })}
                                       >
                                         <SelectTrigger><SelectValue placeholder="Sola Yasla" /></SelectTrigger>
                                         <SelectContent>
                                           <SelectItem value="left">Sola Yasla (Üst Sol)</SelectItem>
                                           <SelectItem value="center">Ortala (Üst Orta)</SelectItem>
                                           <SelectItem value="right">Sağa Yasla (Üst Sağ)</SelectItem>
                                         </SelectContent>
                                       </Select>
                                     </div>
                                     <div className="space-y-2">
                                       <Label>Kategori Başlığı Fontu</Label>
                                       <Select
                                         value={wallForm.ottCategoryTitleFont || 'sans-serif'}
                                         onValueChange={(val) => setWallForm({ ...wallForm, ottCategoryTitleFont: val })}
                                       >
                                         <SelectTrigger><SelectValue placeholder="Sistem Fontu" /></SelectTrigger>
                                         <SelectContent>
                                           <SelectItem value="sans-serif">Sistem Fontu (Nunito)</SelectItem>
                                           <SelectItem value="sans-serif-generic">Düz Sans Serif</SelectItem>
                                           <SelectItem value="arial">Arial</SelectItem>
                                           <SelectItem value="calibri">Calibri</SelectItem>
                                           <SelectItem value="handwriting">El Yazısı (Caveat)</SelectItem>
                                           <SelectItem value="london">London Presley</SelectItem>
                                           <SelectItem value="puerto">Puerto</SelectItem>
                                           <SelectItem value="retosta">Retosta</SelectItem>
                                           <SelectItem value="Dancing Script, cursive">Dancing Script</SelectItem>
                                         </SelectContent>
                                       </Select>
                                     </div>
                                     <div className="space-y-2">
                                       <Label>Kategori Başlığı Boyutu</Label>
                                       <Select
                                         value={wallForm.ottCategoryTitleSize || '2xl'}
                                         onValueChange={(val) => setWallForm({ ...wallForm, ottCategoryTitleSize: val })}
                                       >
                                         <SelectTrigger><SelectValue placeholder="Büyük (2xl)" /></SelectTrigger>
                                         <SelectContent>
                                           <SelectItem value="sm">Küçük (sm)</SelectItem>
                                           <SelectItem value="md">Orta (md)</SelectItem>
                                           <SelectItem value="lg">Büyük (lg)</SelectItem>
                                           <SelectItem value="xl">Büyük (xl)</SelectItem>
                                           <SelectItem value="2xl">Büyük (2xl)</SelectItem>
                                           <SelectItem value="3xl">Çok Büyük (3xl)</SelectItem>
                                           <SelectItem value="4xl">Devasa (4xl)</SelectItem>
                                           <SelectItem value="5xl">Jumbo (5xl)</SelectItem>
                                         </SelectContent>
                                       </Select>
                                     </div>
                                   </div>
                                   
                                   <div className="space-y-2">
                                      <Label>Kategori Başlığı Yazı Rengi</Label>
                                      <div className="flex gap-2">
                                        <Input
                                          type="color"
                                          value={wallForm.ottCategoryTitleColor || '#ffffff'}
                                          onChange={(e) => setWallForm({ ...wallForm, ottCategoryTitleColor: e.target.value })}
                                          className="w-12 h-10 p-1 cursor-pointer"
                                        />
                                        <Input
                                          value={wallForm.ottCategoryTitleColor || ''}
                                          onChange={(e) => setWallForm({ ...wallForm, ottCategoryTitleColor: e.target.value })}
                                          placeholder="Varsayılan: Kategori Ribbon Y.R."
                                          className="flex-1 font-mono text-sm"
                                        />
                                        <Button
                                          type="button"
                                          variant="outline"
                                          onClick={() => setWallForm({ ...wallForm, ottCategoryTitleColor: '' })}
                                          title="Varsayılana Dön"
                                          className="px-3"
                                        >
                                          Sıfırla
                                        </Button>
                                      </div>
                                   </div>

                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                     <div className="space-y-2">
                                       <Label>Satır Ayırıcı Çizgi Stili</Label>
                                       <Select
                                         value={wallForm.ottSeparatorStyle || 'none'}
                                         onValueChange={(val) => setWallForm({ ...wallForm, ottSeparatorStyle: val })}
                                       >
                                         <SelectTrigger><SelectValue placeholder="Yok" /></SelectTrigger>
                                         <SelectContent>
                                           <SelectItem value="none">Çizgi Yok</SelectItem>
                                           <SelectItem value="solid">Düz Çizgi (Solid)</SelectItem>
                                           <SelectItem value="dashed">Kesik Çizgi (Dashed)</SelectItem>
                                           <SelectItem value="dotted">Noktalı Çizgi (Dotted)</SelectItem>
                                           <SelectItem value="double">Çift Çizgi (Double)</SelectItem>
                                         </SelectContent>
                                       </Select>
                                     </div>
                                     {wallForm.ottSeparatorStyle !== 'none' && (
                                       <div className="space-y-2">
                                         <Label>Satır Çizgi Rengi (Başlangıç - Bitiş)</Label>
                                         <div className="flex gap-2">
                                           <Input
                                             type="color"
                                             value={(wallForm.ottSeparatorColor?.includes(',') ? wallForm.ottSeparatorColor.split(',')[0] : (wallForm.ottSeparatorColor || '#cbd5e1'))}
                                             onChange={(e) => {
                                               const parts = wallForm.ottSeparatorColor?.includes(',') ? wallForm.ottSeparatorColor.split(',') : [wallForm.ottSeparatorColor || '#cbd5e1', 'transparent'];
                                               parts[0] = e.target.value;
                                               setWallForm({ ...wallForm, ottSeparatorColor: parts.join(',') });
                                             }}
                                             className="w-12 h-10 p-1 cursor-pointer"
                                             title="Başlığı Saran (Başlangıç) Renk"
                                           />
                                           <Input
                                             type="color"
                                             value={(wallForm.ottSeparatorColor?.includes(',') ? (wallForm.ottSeparatorColor.split(',')[1] === 'transparent' ? '#ffffff' : wallForm.ottSeparatorColor.split(',')[1]) : '#ffffff')}
                                             onChange={(e) => {
                                               const parts = wallForm.ottSeparatorColor?.includes(',') ? wallForm.ottSeparatorColor.split(',') : [wallForm.ottSeparatorColor || '#cbd5e1', '#ffffff'];
                                               parts[1] = e.target.value;
                                               setWallForm({ ...wallForm, ottSeparatorColor: parts.join(',') });
                                             }}
                                             className="w-12 h-10 p-1 cursor-pointer"
                                             title="Dışarı Doğru Uzanacak (Bitiş) Renk"
                                           />
                                           <Input
                                             value={wallForm.ottSeparatorColor || '#cbd5e1'}
                                             onChange={(e) => setWallForm({ ...wallForm, ottSeparatorColor: e.target.value })}
                                             placeholder="Örn: #ff0000,transparent"
                                             className="flex-1 font-mono text-sm"
                                           />
                                           <Button
                                             type="button"
                                             variant="outline"
                                             onClick={() => {
                                               const parts = wallForm.ottSeparatorColor?.includes(',') ? wallForm.ottSeparatorColor.split(',') : [wallForm.ottSeparatorColor || '#cbd5e1', 'transparent'];
                                               parts[1] = 'transparent';
                                               setWallForm({ ...wallForm, ottSeparatorColor: parts.join(',') });
                                             }}
                                             title="Bitişi Şeffaf Yap"
                                             className="px-2"
                                           >
                                             Şeffaf
                                           </Button>
                                         </div>
                                         <p className="text-xs text-gray-400">İkinci rengi şeffaf yaparak ucuna doğru pürüzsüzce kaybolmasını sağlayabilirsiniz.</p>
                                       </div>
                                     )}
                                   </div>
                                 </div>
                               )}
                             </div>
                           </div>
                        </div>
                    )}
                </div>
              </TabsContent>

              <TabsContent value="editor" className="space-y-4 pt-4">
                <div className="bg-pink-50 border border-pink-100 rounded-xl p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <Label className="text-lg font-bold text-pink-900">Editör Modunu Aktifleştir</Label>
                      <p className="text-sm text-pink-700">
                        Bu ayar açıldığında, pano görünümü yerine özel bir editör okuma tasarımı kullanılır. 
                        Tasarım referanslarını Görünüm Ayarlarından alır. (Bu moda özel kutucuk sayısı, renk, font ve boyut ayarlarını aşağıdan yapabilirsiniz).
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Label className="text-sm font-semibold text-pink-800">{wallForm.isEditorModeActive ? 'Açık' : 'Kapalı'}</Label>
                      <Switch
                        checked={wallForm.isEditorModeActive || false}
                        onCheckedChange={(checked) => setWallForm({ ...wallForm, isEditorModeActive: !!checked, isStyleModeActive: !!checked ? false : wallForm.isStyleModeActive })}
                        className="data-[state=checked]:bg-pink-600"
                      />
                    </div>
                  </div>
                </div>

                {wallForm.isEditorModeActive && (
                  <div className="space-y-6 pt-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-md font-bold text-gray-800 border-b pb-2">Editör Modu Tasarım Ayarları</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-semibold">Yan Yana Kart Sayısı</Label>
                        <Select
                          value={wallForm.postitAppearance?.editorItemsPerRow?.toString() || '3'}
                          onValueChange={(val) => setWallForm({ ...wallForm, postitAppearance: { ...(wallForm.postitAppearance || {}), editorItemsPerRow: parseInt(val) } })}
                        >
                          <SelectTrigger className="bg-white"><SelectValue placeholder="3" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 (Tek Sütun)</SelectItem>
                            <SelectItem value="2">2 Kart</SelectItem>
                            <SelectItem value="3">3 Kart</SelectItem>
                            <SelectItem value="4">4 Kart</SelectItem>
                            <SelectItem value="5">5 Kart</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-700 font-semibold">Görsel Boyut Oranı (Aspect Ratio)</Label>
                        <Select
                          value={wallForm.postitAppearance?.editorImageRatio || '16/9'}
                          onValueChange={(val) => setWallForm({ ...wallForm, postitAppearance: { ...(wallForm.postitAppearance || {}), editorImageRatio: val } })}
                        >
                          <SelectTrigger className="bg-white"><SelectValue placeholder="16/9 (Geniş)" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="16/9">16/9 (Geniş)</SelectItem>
                            <SelectItem value="4/3">4/3 (Klasik)</SelectItem>
                            <SelectItem value="1/1">1/1 (Kare)</SelectItem>
                            <SelectItem value="3/4">3/4 (Dikey)</SelectItem>
                            <SelectItem value="auto">Serbest / Auto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-700 font-semibold">Kart Zemin Rengi</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={wallForm.postitAppearance?.editorCardBgColor || '#ffffff'}
                            onChange={(e) => setWallForm({ ...wallForm, postitAppearance: { ...(wallForm.postitAppearance || {}), editorCardBgColor: e.target.value } })}
                            className="w-12 h-10 p-1 cursor-pointer rounded-md"
                          />
                          <Input
                            value={wallForm.postitAppearance?.editorCardBgColor || ''}
                            onChange={(e) => setWallForm({ ...wallForm, postitAppearance: { ...(wallForm.postitAppearance || {}), editorCardBgColor: e.target.value } })}
                            placeholder="Örn: #ffffff"
                            className="flex-1 font-mono text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-700 font-semibold">Kart Başlık Rengi</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={wallForm.postitAppearance?.editorTitleColor || '#111827'}
                            onChange={(e) => setWallForm({ ...wallForm, postitAppearance: { ...(wallForm.postitAppearance || {}), editorTitleColor: e.target.value } })}
                            className="w-12 h-10 p-1 cursor-pointer rounded-md"
                          />
                          <Input
                            value={wallForm.postitAppearance?.editorTitleColor || ''}
                            onChange={(e) => setWallForm({ ...wallForm, postitAppearance: { ...(wallForm.postitAppearance || {}), editorTitleColor: e.target.value } })}
                            placeholder="Örn: #111827"
                            className="flex-1 font-mono text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-700 font-semibold">Kart Başlık Fontu</Label>
                        <Select
                          value={wallForm.postitAppearance?.editorTitleFont || 'sans-serif'}
                          onValueChange={(val) => setWallForm({ ...wallForm, postitAppearance: { ...(wallForm.postitAppearance || {}), editorTitleFont: val } })}
                        >
                          <SelectTrigger className="bg-white"><SelectValue placeholder="Sistem Fontu" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sans-serif">Modern (Sans)</SelectItem>
                            <SelectItem value="serif">Klasik (Serif / Playfair)</SelectItem>
                            <SelectItem value="handwriting">El Yazısı (Caveat)</SelectItem>
                            <SelectItem value="london">London Presley</SelectItem>
                            <SelectItem value="puerto">Puerto</SelectItem>
                            <SelectItem value="retosta">Retosta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-700 font-semibold">Kart Başlık Boyutu</Label>
                        <Select
                          value={wallForm.postitAppearance?.editorTitleSize || 'xl'}
                          onValueChange={(val) => setWallForm({ ...wallForm, postitAppearance: { ...(wallForm.postitAppearance || {}), editorTitleSize: val } })}
                        >
                          <SelectTrigger className="bg-white"><SelectValue placeholder="Büyük (xl)" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sm">Küçük (sm)</SelectItem>
                            <SelectItem value="base">Normal (base)</SelectItem>
                            <SelectItem value="lg">Orta Büyük (lg)</SelectItem>
                            <SelectItem value="xl">Büyük (xl)</SelectItem>
                            <SelectItem value="2xl">Çok Büyük (2xl)</SelectItem>
                            <SelectItem value="3xl">Devasa (3xl)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-semibold">Yıldız İkonu Rengi</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={wallForm.postitAppearance?.editorStarColor || '#facc15'}
                            onChange={(e) => setWallForm({ ...wallForm, postitAppearance: { ...(wallForm.postitAppearance || {}), editorStarColor: e.target.value } })}
                            className="w-12 h-10 p-1 cursor-pointer rounded-md"
                          />
                          <Input
                            value={wallForm.postitAppearance?.editorStarColor || ''}
                            onChange={(e) => setWallForm({ ...wallForm, postitAppearance: { ...(wallForm.postitAppearance || {}), editorStarColor: e.target.value } })}
                            placeholder="Örn: #facc15"
                            className="flex-1 font-mono text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-700 font-semibold">Gölge ve Köşe Yuvarlatma</Label>
                        <Select
                          value={wallForm.postitAppearance?.editorCardStyle || 'modern'}
                          onValueChange={(val) => setWallForm({ ...wallForm, postitAppearance: { ...(wallForm.postitAppearance || {}), editorCardStyle: val } })}
                        >
                          <SelectTrigger className="bg-white"><SelectValue placeholder="Modern (Yuvarlak + Gölge)" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="modern">Modern (Yumuşak Gölgeli)</SelectItem>
                            <SelectItem value="flat">Düz (Minimal, Gölgeli Değil)</SelectItem>
                            <SelectItem value="bordered">Sınırlı (Keskin Hatlı)</SelectItem>
                            <SelectItem value="glass">Cam (Glassmorphism)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setShowWallModal(false)}>
              İptal
            </Button>
            <Button type="button" onClick={handleSaveWall}>Kaydet</Button>
          </DialogFooter>
        </DialogContent >
      </Dialog >

      {/* Move Posts Modal */}
      <Dialog open={showMovePostsModal} onOpenChange={setShowMovePostsModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mevcut Notları Taşı</DialogTitle>
            <DialogDescription>
              <strong>{parentWallForSubcategory?.name}</strong> kategorisinde {parentWallForSubcategory?._count?.postits} adet not bulunuyor.
              Yeni oluşturacağınız alt kategoriye taşımak istediğiniz notları seçin.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[300px] overflow-y-auto border rounded-md p-4 space-y-2 my-4">
            {/* Note: This requires loading posts for specific category first. For now, showing info message or loading generic posts if we had them related to this wall */}
            <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
              Not: Şu an için not taşıma özelliği aktif değil. Alt kategori oluşturulduktan sonra notları manuel olarak düzenleyebilirsiniz.
            </p>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => {
              setShowMovePostsModal(false)
              setShowWallModal(true) // Proceed to wall creation without moving posts
            }}>
              Notları Taşıma, Devam Et
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >

      <Dialog open={showPostitModal} onOpenChange={setShowPostitModal}>
        <DialogContent className="max-w-6xl w-[95vw] sm:w-full max-h-[90vh] overflow-hidden p-0 border border-white/20 bg-white/60 backdrop-blur-xl rounded-[24px] shadow-2xl">
          <div className="bg-white/95 h-[90vh] sm:h-[85vh] overflow-y-auto sm:overflow-hidden block sm:flex sm:flex-row min-h-0 w-full">

            {/* LEFT COLUMN - CONTENT & SETTINGS */}
            <div className="flex-1 p-6 sm:p-10 sm:overflow-y-auto bg-white sm:min-h-0 min-h-0 relative">
              <div className="mb-8">
                <DialogTitle className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
                  <div className="bg-yellow-400 p-2 rounded-xl shadow-inner border border-yellow-300">
                    <Pencil className="w-5 h-5 text-yellow-900" strokeWidth={3} />
                  </div>
                  Not Düzenle
                </DialogTitle>
                <DialogDescription className="text-slate-500 mt-2 text-[15px]">
                  Mevcut duyuruyu güncelleyin veya onay durumunu değiştirin.
                </DialogDescription>
              </div>

              <div className="space-y-7">
                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-[13px] uppercase tracking-wider font-bold text-slate-500 ml-1">Kategori (Duvar) *</Label>
                  <Select
                    value={postitForm.categoryId}
                    onValueChange={(value) => setPostitForm({ ...postitForm, categoryId: value })}
                  >
                    <SelectTrigger className="h-12 bg-slate-50/50 hover:bg-slate-100/50 border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] focus:ring-2 focus:ring-slate-900 rounded-2xl transition-all">
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        const flatten = (cats: any[], depth = 0): any[] => {
                          return cats.reduce((acc, cat) => {
                            acc.push({ ...cat, depth })
                            if (cat.children) acc.push(...flatten(cat.children, depth + 1))
                            return acc
                          }, [])
                        }
                        const buildHierarchy = (items: any[]) => {
                          const rootItems = items.filter(i => !i.parentId).sort((a, b) => a.name.localeCompare(b.name, 'tr-TR'))
                          const findChildren = (parent: any) => {
                            const children = items.filter(i => i.parentId === parent.id).sort((a, b) => a.name.localeCompare(b.name, 'tr-TR'))
                            parent.children = children
                            children.forEach(findChildren)
                          }
                          rootItems.forEach(findChildren)
                          return rootItems
                        }
                        const hierarchy = buildHierarchy(JSON.parse(JSON.stringify(walls)))
                        const flatOptions = flatten(hierarchy)

                        return flatOptions.map((w: any) => (
                          <SelectItem key={w.id} value={w.id}>
                            <span style={{ paddingLeft: `${w.depth * 12}px` }}>
                              {w.depth > 0 && '↳ '}{w.name}
                            </span>
                          </SelectItem>
                        ))
                      })()}
                    </SelectContent>
                  </Select>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <Label htmlFor="content" className="text-[13px] uppercase tracking-wider font-bold text-slate-500 ml-1">Özet (İçerik) *</Label>
                  <Textarea
                    id="content"
                    value={postitForm.content}
                    onChange={(e) => setPostitForm({ ...postitForm, content: e.target.value })}
                    placeholder="İnsanların görmesini istediğiniz fikri buraya dökün..."
                    className="bg-slate-50/50 hover:bg-slate-100/50 border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] focus:ring-2 focus:ring-slate-900 resize-none rounded-[20px] transition-all p-4 text-base leading-relaxed"
                    rows={4}
                    maxLength={750}
                    required
                  />
                  <div className="flex justify-end p-1">
                    <span className={`text-xs ${postitForm.content.length > 700 ? 'text-orange-500 font-bold' : 'text-gray-400'}`}>
                      {postitForm.content.length}/750
                    </span>
                  </div>
                </div>

                {/* Detail */}
                <div className="space-y-2">
                  <Label htmlFor="detail" className="text-[13px] uppercase tracking-wider font-bold text-slate-500 ml-1">Detay (Genişletilmiş İçerik)</Label>
                  <TipTapSmallEditor
                    content={postitForm.detail}
                    onChange={(html) => setPostitForm({ ...postitForm, detail: html })}
                    placeholder="Detaylı bilgi eklemek isterseniz buraya yazın..."
                    maxLength={2000}
                  />
                </div>

                {/* Expiration */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50/60 p-5 rounded-[20px] border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
                  <div className="space-y-2">
                    <Label htmlFor="expires" className="text-[12px] uppercase tracking-wider font-bold text-slate-500">Gösterim Süresi *</Label>
                    <Select
                      value={postitForm.expiresInDays}
                      onValueChange={(value) => {
                        const daysMap: { [key: string]: number } = {
                          '1': 1, '3': 3, '7': 7, '30': 30
                        }
                        const newForm = { ...postitForm, expiresInDays: value }
                        if (value !== 'custom') {
                          const days = daysMap[value] || 1
                          newForm.expiresAtDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                        }
                        setPostitForm(newForm)
                      }}
                    >
                      <SelectTrigger className="h-11 bg-white border-slate-200 shadow-sm rounded-xl hover:bg-slate-50 transition-colors focus:ring-2 focus:ring-slate-900">
                        <SelectValue placeholder="Süre seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Gün</SelectItem>
                        <SelectItem value="3">3 Gün</SelectItem>
                        <SelectItem value="7">1 Hafta</SelectItem>
                        <SelectItem value="30">1 Ay</SelectItem>
                        <SelectItem value="custom">Tarihine kadar (Özel)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[12px] uppercase tracking-wider font-bold text-slate-500">Bitiş Tarihi</Label>
                    <Input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={postitForm.expiresAtDate}
                      onChange={(e) => setPostitForm({ ...postitForm, expiresAtDate: e.target.value })}
                      required
                      readOnly={postitForm.expiresInDays !== 'custom'}
                      className={`h-11 rounded-xl shadow-sm border-slate-200 transition-colors focus:ring-2 focus:ring-slate-900 ${postitForm.expiresInDays !== 'custom' ? 'bg-slate-100 cursor-not-allowed text-slate-400 border-slate-100' : 'bg-white hover:bg-slate-50'}`}
                    />
                  </div>
                </div>

                {/* Link */}
                <div className="space-y-2">
                  <Label htmlFor="link" className="text-[13px] uppercase tracking-wider font-bold text-slate-500 ml-1">Harici Bağlantı (Opsiyonel)</Label>
                  <Input
                    id="link"
                    type="url"
                    value={postitForm.link}
                    onChange={(e) => setPostitForm({ ...postitForm, link: e.target.value })}
                    className="h-11 bg-slate-50/50 hover:bg-slate-100/50 border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] focus:ring-2 focus:ring-slate-900 rounded-[14px] transition-all px-4"
                    placeholder="https://örnek.com"
                  />
                </div>

                {/* Publish & Approve settings for Admins */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50/60 p-5 rounded-[20px] border border-slate-100 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="isApproved"
                      className="border-slate-300 w-5 h-5 rounded data-[state=checked]:bg-slate-900 data-[state=checked]:text-white"
                      checked={postitForm.isApproved}
                      onCheckedChange={(checked) => setPostitForm({ ...postitForm, isApproved: checked === true })}
                    />
                    <label htmlFor="isApproved" className="text-[13px] uppercase tracking-wider font-bold text-slate-700 cursor-pointer">
                      Onaylı
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="isPublished"
                      className="border-slate-300 w-5 h-5 rounded data-[state=checked]:bg-slate-900 data-[state=checked]:text-white"
                      checked={postitForm.isPublished}
                      onCheckedChange={(checked) => setPostitForm({ ...postitForm, isPublished: checked === true })}
                    />
                    <label htmlFor="isPublished" className="text-[13px] uppercase tracking-wider font-bold text-slate-700 cursor-pointer">
                      Yayında
                    </label>
                  </div>
                </div>

                {/* Images */}
                <div className="space-y-3 bg-slate-50/40 p-5 rounded-[24px] border border-slate-100/50 shadow-inner">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="image" className="text-[13px] uppercase tracking-wider font-bold text-slate-600 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-slate-400" />
                      Medya (Resim/Video)
                    </Label>
                    <span className="text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1 rounded-full shadow-sm font-semibold">{postitForm.imageUrls.length}/10</span>
                  </div>

                  {postitForm.imageUrls.length > 0 && (
                    <div className="grid grid-cols-5 gap-2 mt-2 mb-2">
                      {postitForm.imageUrls.map((url, index) => (
                        <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-sm transform transition duration-300 hover:scale-105">
                          {url.match(/\.(mp4|webm|ogg)$/i) ? (
                            <div className="relative w-full h-full group/video">
                              <video src={`${url}#t=0.001`} className="w-full h-full object-cover" preload="metadata" muted playsInline />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                                <Play className="w-6 h-6 text-white/90 fill-white/90" />
                              </div>
                            </div>
                          ) : (
                            <img src={url} alt={`Medya ${index + 1}`} className="w-full h-full object-cover" />
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemovePostitImage(index)}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <div className="bg-red-500 text-white rounded-full p-1 shadow-lg border border-red-600">
                              <X className="w-3 h-3" />
                            </div>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {postitForm.imageUrls.length < 10 && (
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full h-16 border-dashed border-2 flex flex-col gap-1 items-center justify-center text-slate-500 bg-white hover:text-slate-800 hover:bg-slate-50 hover:border-slate-400 rounded-[14px] transition-colors border-slate-200 shadow-sm"
                        onClick={() => document.getElementById('admin-edit-image-upload')?.click()}
                        disabled={uploadingPostitImage}
                      >
                        {uploadingPostitImage ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Upload className="w-5 h-5 mb-0.5" />
                        )}
                        <span className="text-[11px] uppercase tracking-wider font-bold">Medya Seç veya Bırak</span>
                      </Button>
                      <Input
                        id="admin-edit-image-upload"
                        type="file"
                        accept="image/*,video/mp4,video/webm"
                        onChange={handlePostitImageUpload}
                        disabled={uploadingPostitImage}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - PREVIEW & APPEARANCE */}
            <div className="w-full sm:w-[420px] sm:shrink-0 bg-slate-50 border-t sm:border-t-0 sm:border-l border-slate-200 p-4 sm:p-8 sm:overflow-y-auto flex flex-col justify-between gap-6 sm:gap-0 sm:min-h-0 min-h-0 shrink-0">
              <div className="space-y-10">
                {/* Preview Block */}
                <div>
                  <Label className="text-[12px] font-extrabold text-slate-800 tracking-[0.2em] uppercase mb-4 block flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div> Canlı Önizleme
                  </Label>
                  <div className="px-6 py-10 rounded-[32px] bg-slate-200/60 shadow-inner flex items-center justify-center border border-slate-200/70 pattern-grid-lg text-slate-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent mix-blend-overlay"></div>
                    <div className={`
                      w-44 h-44 relative shadow-2xl transform rotate-2 hover:rotate-0 transition-all duration-300
                      flex flex-col items-center justify-center p-4 text-center group
                      ${colors.find(c => c.value === postitForm.color)?.class || 'bg-yellow-200'}
                    `}>
                      <div className="absolute top-0 bottom-0 left-0 border-l-[3px] border-black/5 mix-blend-multiply pointer-events-none" />

                      {postitForm.pushpin && postitForm.pushpin !== 'NONE' && (
                        <div className={`absolute ${postitForm.pushpin === 'TAPE' ? '-top-3' : '-top-4'} left-1/2 -translate-x-1/2 z-10 ${postitForm.pushpin === 'TAPE' ? 'w-16 h-8 opacity-80' : 'w-8 h-8'} drop-shadow-lg group-hover:-translate-y-1 transition-transform`}>
                          <img 
                            src={pushpinOptions.find(p => p.value === postitForm.pushpin)?.image || '/pushpins/red.png'} 
                            alt="pin" 
                            className="w-full h-full object-contain" 
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/pushpins/red.png'
                            }}
                          />
                        </div>
                      )}

                      <p className={`
                        opacity-80 overflow-hidden leading-relaxed
                        ${fonts.find(f => f.value === postitForm.font)?.class || 'font-handwriting'}
                      `}
                        style={{
                          color: postitForm.textColor,
                          fontSize: ({ 'text-xs': '0.75rem', 'text-sm': '0.875rem', 'text-base': '1rem', 'text-lg': '1.125rem', 'text-xl': '1.25rem', 'text-2xl': '1.5rem', 'text-3xl': '1.875rem' } as any)[postitForm.textSize] || '1rem',
                          WebkitLineClamp: 5,
                          display: '-webkit-box',
                          WebkitBoxOrient: 'vertical',
                          wordBreak: 'break-word',
                        }}
                      >
                        {postitForm.content || 'Aklınızdaki harika fikri buraya yazın...'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Color */}
                <div>
                  <Label className="text-[11px] font-extrabold text-slate-500 tracking-widest mb-3 block">1. ZEMİN FORMÜLÜ (KAĞIT)</Label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setPostitForm({ ...postitForm, color: color.value })}
                        className={`
                          ${color.class} w-10 h-10 rounded-[14px] border-2 transition-all transform hover:scale-[1.15] shadow-sm
                          ${postitForm.color === color.value ? 'border-slate-800 ring-2 ring-slate-800 ring-offset-2 scale-110 shadow-md' : 'border-slate-200'}
                        `}
                        title={color.label}
                      >
                        {color.value === 'TRANSPARENT' && (
                          <div className="w-full h-[2px] bg-red-400 rotate-45 transform origin-center absolute inset-0 m-auto opacity-50"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font */}
                <div>
                  <Label className="text-[11px] font-extrabold text-slate-500 tracking-widest mb-3 block">2. YAZI TİPOGRAFİSİ</Label>
                  
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {fonts.map((font) => (
                      <button
                        key={font.value}
                        type="button"
                        onClick={() => setPostitForm({ ...postitForm, font: font.value })}
                        className={`
                          px-3.5 py-2 rounded-xl border flex items-center justify-center transition-all bg-white whitespace-nowrap shadow-sm
                          ${postitForm.font === font.value ? 'border-slate-800 ring-2 ring-slate-800 text-slate-900 font-bold shadow-md transform scale-[1.03]' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}
                          ${font.class} text-[13px]
                        `}
                      >
                        {font.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 bg-white p-2.5 rounded-[18px] border border-slate-200 shadow-sm">
                    <div className="flex-1">
                      <Select
                        value={postitForm.textSize}
                        onValueChange={(value) => setPostitForm({ ...postitForm, textSize: value })}
                      >
                        <SelectTrigger className="h-10 border-none bg-slate-50 hover:bg-slate-100 rounded-[12px] font-semibold text-slate-700">
                          <SelectValue placeholder="Boyut" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text-xs">Ufacık (XS)</SelectItem>
                          <SelectItem value="text-sm">Küçük (SM)</SelectItem>
                          <SelectItem value="text-base">Normal (MD)</SelectItem>
                          <SelectItem value="text-lg">Büyük (LG)</SelectItem>
                          <SelectItem value="text-xl">Devasa (XL)</SelectItem>
                          <SelectItem value="text-2xl">Manşet (2XL)</SelectItem>
                          <SelectItem value="text-3xl">Pankart (3XL)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 pr-3 pl-2 border-l border-slate-100">
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Renk:</span>
                      <label className="relative w-8 h-8 rounded-full border-2 border-slate-200 shadow-inner hover:scale-110 transition-transform shrink-0 cursor-pointer overflow-hidden">
                        <div className="absolute inset-0 m-auto w-full h-full rounded-full" style={{ backgroundColor: postitForm.textColor }}></div>
                        <input 
                          type="color" 
                          title="Metin Rengi"
                          value={postitForm.textColor} 
                          onChange={(e) => setPostitForm({...postitForm, textColor: e.target.value})} 
                          className="absolute opacity-0 w-full h-full cursor-pointer" 
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Pin */}
                <div>
                  <Label className="text-[11px] font-extrabold text-slate-500 tracking-widest mb-3 block">3. AKSESUAR (İĞNE / BANT)</Label>
                  <div className="flex flex-wrap gap-2.5">
                    {pushpinOptions.map((pin) => (
                      <button
                        key={pin.value}
                        type="button"
                        onClick={() => setPostitForm({ ...postitForm, pushpin: pin.value })}
                        className={`
                          w-[46px] h-[46px] rounded-[14px] bg-white border flex items-center justify-center transition-all group hover:bg-slate-50 hover:shadow-md
                          ${postitForm.pushpin === pin.value ? 'border-slate-900 ring-2 ring-slate-900 shadow-sm scale-110' : 'border-slate-200 shadow-sm'}
                        `}
                        title={pin.label}
                      >
                        {pin.value === 'NONE' ? (
                          <div className="text-[10px] uppercase font-extrabold text-slate-400 group-hover:text-slate-600 transition-colors">YOK</div>
                        ) : pin.value === 'TAPE' ? (
                          <div className="w-6 h-3 bg-yellow-200/70 border border-yellow-300/30 rounded-sm transform rotate-[-5deg] drop-shadow-sm"></div>
                        ) : pin.value === 'BLACK' ? (
                          <div className="w-5 h-2 bg-slate-800 rounded-sm shadow-sm relative">
                             <div className="w-3 h-3 border-2 border-slate-700 rounded-full absolute -top-2 left-1/2 -translate-x-1/2"></div>
                          </div>
                        ) : (
                          <img
                            src={pin.image}
                            alt={pin.label}
                            className={`w-6 h-6 object-contain filter transition-transform group-hover:scale-125 ${postitForm.pushpin === pin.value ? 'drop-shadow-lg' : 'drop-shadow-md'}`}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/pushpins/red.png'
                            }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 sticky bottom-0 -mx-4 sm:-mx-8 -mb-4 sm:-mb-8 px-4 sm:px-8 py-6 border-t border-slate-200 flex items-center justify-end gap-3 bg-slate-50/95 backdrop-blur-md z-10">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowPostitModal(false)}
                  className="text-slate-500 hover:text-slate-900 font-semibold h-11 px-6 rounded-xl"
                >
                  İptal Et
                </Button>
                <Button
                  onClick={handleSavePostit}
                  className="bg-slate-900 hover:bg-slate-800 text-white h-11 px-8 rounded-xl font-bold shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] hover:-translate-y-0.5 transition-all text-[14px]"
                >
                  <Save className="w-5 h-5 mr-2" /> Kaydet
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Slider Modal */}
      <Dialog open={showSliderModal} onOpenChange={setShowSliderModal}>
        <DialogContent className="max-w-5xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Slayder Düzenle' : 'Yeni Slayder Ekle'}</DialogTitle>
            <DialogDescription>
              En fazla 5 adet resim URL'si ekleyebilirsiniz. Bir duvar (kategori) seçerek onun sayfasında görünmesini sağlayın.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-4 px-2">
            
            {/* SOL KOLON: Ayarlar */}
            <div className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label>Hangi Duvar (Kategori)?</Label>
              <Select
                value={sliderForm.categoryId}
                onValueChange={(value) => setSliderForm({ ...sliderForm, categoryId: value === 'none' ? '' : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ana Sayfa (Seçilmezse)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ana Sayfa (Kategorisiz)</SelectItem>
                  {walls.map((wall) => (
                    <SelectItem key={wall.id} value={wall.id}>
                      {wall.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="isActive"
                checked={sliderForm.isActive}
                onCheckedChange={(checked) => setSliderForm({ ...sliderForm, isActive: !!checked })}
              />
              <Label htmlFor="isActive" className="cursor-pointer">Aktif (Gösterilsin mi?)</Label>
            </div>

            <div className="space-y-4 border p-4 rounded-lg bg-gray-50">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="isGradient"
                    checked={sliderForm.isGradient}
                    onCheckedChange={(checked) => setSliderForm({ ...sliderForm, isGradient: !!checked })}
                  />
                  <Label htmlFor="isGradient" className="cursor-pointer font-semibold">Hero Gradyan Renk Kullan</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="isTransparent"
                    checked={sliderForm.isTransparent}
                    onCheckedChange={(checked) => setSliderForm({ ...sliderForm, isTransparent: !!checked })}
                  />
                  <Label htmlFor="isTransparent" className="cursor-pointer font-semibold">Zemini Transparan Yap</Label>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <Label>Zemin Resmi (opsiyonel)</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    value={sliderForm.backgroundImage || ''}
                    onChange={(e) => setSliderForm({ ...sliderForm, backgroundImage: e.target.value })}
                    placeholder="https://... veya dosya yükleyin"
                    className="flex-1"
                  />
                  <div className="relative">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleSliderBgImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploadingSliderImage}
                    />
                    <Button type="button" variant="outline" disabled={uploadingSliderImage}>
                      {uploadingSliderImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Resim varsa, transparan veya seçilen arkaplan / gradyan kullanılmaz.</p>
              </div>

              {!sliderForm.isGradient && !sliderForm.isTransparent ? (
                <div className="space-y-2">
                  <Label htmlFor="backgroundColor">Tek Arka Plan Rengi</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="backgroundColor"
                      type="color"
                      value={sliderForm.backgroundColor}
                      onChange={(e) => setSliderForm({ ...sliderForm, backgroundColor: e.target.value })}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={sliderForm.backgroundColor}
                      onChange={(e) => setSliderForm({ ...sliderForm, backgroundColor: e.target.value })}
                      className="flex-1 font-mono text-sm"
                      placeholder="#f8f9fa"
                    />
                  </div>
                </div>
              ) : sliderForm.isGradient && !sliderForm.isTransparent ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Başlangıç Rengi</Label>
                    <div className="flex gap-2">
                      <Input type="color" className="w-12 h-10 p-1 cursor-pointer" value={sliderForm.heroGradientFrom} onChange={(e) => setSliderForm({ ...sliderForm, heroGradientFrom: e.target.value })} />
                      <Input className="font-mono" value={sliderForm.heroGradientFrom} onChange={(e) => setSliderForm({ ...sliderForm, heroGradientFrom: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Orta Renk</Label>
                    <div className="flex gap-2">
                      <Input type="color" className="w-12 h-10 p-1 cursor-pointer" value={sliderForm.heroGradientVia} onChange={(e) => setSliderForm({ ...sliderForm, heroGradientVia: e.target.value })} />
                      <Input className="font-mono" value={sliderForm.heroGradientVia} onChange={(e) => setSliderForm({ ...sliderForm, heroGradientVia: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Bitiş Rengi</Label>
                    <div className="flex gap-2">
                      <Input type="color" className="w-12 h-10 p-1 cursor-pointer" value={sliderForm.heroGradientTo} onChange={(e) => setSliderForm({ ...sliderForm, heroGradientTo: e.target.value })} />
                      <Input className="font-mono" value={sliderForm.heroGradientTo} onChange={(e) => setSliderForm({ ...sliderForm, heroGradientTo: e.target.value })} />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            </div>

            {/* SAĞ KOLON: Resimler */}
            <div className="space-y-4 flex flex-col h-full bg-slate-50/50 p-4 rounded-lg border">
              <Label>Resim Linkleri veya Yükleme (Maksimum 5)</Label>
              {sliderForm.images.map((img, index) => (
                <div key={index} className="flex gap-2 items-center">
                  {img && (
                    <div className="w-12 h-12 flex-shrink-0 rounded-md overflow-hidden border border-gray-200 shadow-sm bg-white">
                      <img src={img} alt={`Resim ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 flex flex-col gap-2">
                    <Input
                      placeholder={`Resim URL ${index + 1}`}
                      value={img}
                      onChange={(e) => {
                        const newImages = [...sliderForm.images];
                        newImages[index] = e.target.value;
                        setSliderForm({ ...sliderForm, images: newImages });
                      }}
                      className="text-sm shadow-sm"
                    />
                    {img && (
                      <Input
                        placeholder="Yönlendirme Linki (İsteğe Bağlı URL)"
                        value={sliderForm.links[index]}
                        onChange={(e) => {
                          const newLinks = [...sliderForm.links];
                          newLinks[index] = e.target.value;
                          setSliderForm({ ...sliderForm, links: newLinks });
                        }}
                        className="text-sm shadow-sm border-indigo-100 placeholder:text-indigo-300"
                      />
                    )}
                  </div>
                  <div className="flex-shrink-0 flex items-start h-full">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingSliderImage}
                      onClick={() => document.getElementById(`slider-img-upload-${index}`)?.click()}
                      className="truncate shadow-sm h-10 bg-white"
                    >
                      {uploadingSliderImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 mr-2 text-gray-500" />} Seç
                    </Button>
                    <input
                      id={`slider-img-upload-${index}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleSliderImageUpload(e, index)}
                      className="hidden"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSliderModal(false)}>
              İptal
            </Button>
            <Button onClick={handleSaveSlider}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showStatsModal} onOpenChange={setShowStatsModal}>
        <DialogContent className="max-w-2xl bg-white" style={{ position: 'fixed', zIndex: 100000000 }}>
          <DialogHeader>
            <DialogTitle>Post-it İstatistikleri</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {loadingStats ? (
                <div className="flex justify-center items-center py-10"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
            ) : (
                <Tabs defaultValue="likers" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="likers">Beğenenler ({statsData.likers?.length || 0})</TabsTrigger>
                        <TabsTrigger value="viewers">Görüntüleyenler ({statsData.viewers?.length || 0})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="likers" className="max-h-96 overflow-y-auto">
                        {statsData.likers?.length === 0 ? <p className="text-gray-500 py-4 text-center">Henüz beğenen kimse yok.</p> : (
                            <ul className="divide-y divide-gray-100">
                                {statsData.likers?.map((l, i) => (
                                    <li key={i} className="py-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold overflow-hidden">
                                                {l.image ? <img src={l.image} className="w-full h-full object-cover"/> : (l.nickname?.[0] || l.name?.[0] || 'U')}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">{l.nickname || l.name}</p>
                                                <p className="text-xs text-gray-500">{l.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {new Date(l.likedAt).toLocaleString('tr-TR')}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </TabsContent>
                    <TabsContent value="viewers" className="max-h-96 overflow-y-auto">
                        {statsData.viewers?.length === 0 ? <p className="text-gray-500 py-4 text-center">İzlenebilir kayıtlı görüntüleme bulunmuyor (anonim veya yeni özellik öncesi olabilir).</p> : (
                            <ul className="divide-y divide-gray-100">
                                {statsData.viewers?.map((v, i) => (
                                    <li key={i} className="py-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold overflow-hidden">
                                                {v.image ? <img src={v.image} className="w-full h-full object-cover"/> : (v.nickname?.[0] || v.name?.[0] || 'U')}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">{v.nickname || v.name}</p>
                                                <p className="text-xs text-gray-500">{v.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {new Date(v.viewedAt).toLocaleString('tr-TR')}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </TabsContent>
                </Tabs>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatsModal(false)}>Kapat</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showMoveWallModal} onOpenChange={setShowMoveWallModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Duvarı Taşı</DialogTitle>
            <DialogDescription>
              <strong>{wallToMove?.name}</strong> isimli duvarı başka bir duvarın altına taşıyorsunuz.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label className="mb-2 block">Yeni Konum (Üst Kategori)</Label>
            <Select 
              value={selectedNewParentId} 
              onValueChange={setSelectedNewParentId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Bir üst duvar seçin" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="root">-- Ana Dizin (En Üst Seviye) --</SelectItem>
                {(() => {
                  const flatten = (cats: any[], depth = 0): any[] => {
                    return cats.reduce((acc, cat) => {
                      acc.push({ ...cat, depth })
                      if (cat.children) acc.push(...flatten(cat.children, depth + 1))
                      return acc
                    }, [])
                  }
                  const buildHierarchy = (items: any[]) => {
                    const rootItems = items.filter(i => !i.parentId).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'tr-TR'))
                    const findChildren = (parent: any) => {
                      const children = items.filter(i => i.parentId === parent.id).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'tr-TR'))
                      if (children.length > 0) {
                        parent.children = children.map(c => findChildren(c))
                      }
                      return parent
                    }
                    return rootItems.map(r => findChildren({ ...r }))
                  }
                  
                  return flatten(buildHierarchy(walls)).map((w: any) => {
                    // Prevent moving into itself or its children
                    let isDescendant = false;
                    let current = w;
                    while (current) {
                      if (current.id === wallToMove?.id) {
                        isDescendant = true;
                        break;
                      }
                      current = walls.find((p: any) => p.id === current.parentId);
                    }
                    
                    if (w.id === wallToMove?.id || isDescendant) return null;

                    return (
                      <SelectItem key={w.id} value={w.id}>
                        {'— '.repeat(w.depth)}{w.name}
                      </SelectItem>
                    );
                  })
                })()}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMoveWallModal(false)}>İptal</Button>
            <Button onClick={handleMoveWallSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">
              Taşı
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCopyWallModal} onOpenChange={setShowCopyWallModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Duvarı Kopyala</DialogTitle>
            <DialogDescription>
              <strong>{wallToCopy?.name}</strong> isimli duvarı alt duvarlarıyla birlikte kopyalamak üzeresiniz.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label className="mb-2 block">Hedef Konum (Üst Kategori)</Label>
              <Select 
                value={selectedCopyParentId} 
                onValueChange={setSelectedCopyParentId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Bir üst duvar seçin" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="root">-- Ana Dizin (En Üst Seviye) --</SelectItem>
                  {(() => {
                    const flatten = (cats: any[], depth = 0): any[] => {
                      return cats.reduce((acc, cat) => {
                        acc.push({ ...cat, depth })
                        if (cat.children) acc.push(...flatten(cat.children, depth + 1))
                        return acc
                      }, [])
                    }
                    const buildHierarchy = (items: any[]) => {
                      const rootItems = items.filter(i => !i.parentId).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'tr-TR'))
                      const findChildren = (parent: any) => {
                        const children = items.filter(i => i.parentId === parent.id).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'tr-TR'))
                        if (children.length > 0) {
                          parent.children = children.map(c => findChildren(c))
                        }
                        return parent
                      }
                      return rootItems.map(r => findChildren({ ...r }))
                    }
                    
                    return flatten(buildHierarchy(walls)).map((w: any) => {
                      // Prevent copying into itself or its children
                      let isDescendant = false;
                      let current = w;
                      while (current) {
                        if (current.id === wallToCopy?.id) {
                          isDescendant = true;
                          break;
                        }
                        current = walls.find((p: any) => p.id === current.parentId);
                      }
                      
                      if (w.id === wallToCopy?.id || isDescendant) return null;

                      return (
                        <SelectItem key={w.id} value={w.id}>
                          {'— '.repeat(w.depth)}{w.name}
                        </SelectItem>
                      );
                    })
                  })()}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 pt-2 border-t mt-4">
              <Checkbox 
                id="copyPostits" 
                checked={copyWallOptions.copyPostits} 
                onCheckedChange={(checked) => setCopyWallOptions(prev => ({ ...prev, copyPostits: !!checked }))}
              />
              <Label htmlFor="copyPostits" className="cursor-pointer">
                Duvar içindeki tüm notları (Post-it'leri) da kopyala
              </Label>
            </div>
            <p className="text-xs text-gray-500 mt-2 ml-6">
              Not: Alt duvarlar otomatik olarak kopyalanacaktır. Yetkilendirmeler yeni kopyaya aktarılmaz.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCopyWallModal(false)} disabled={isCopyingWall}>İptal</Button>
            <Button onClick={handleCopyWallSubmit} disabled={isCopyingWall} className="bg-green-600 hover:bg-green-700 text-white">
              {isCopyingWall ? 'Kopyalanıyor...' : 'Kopyala'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showMovePostitModal} onOpenChange={setShowMovePostitModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Notu Taşı</DialogTitle>
            <DialogDescription>
              Bu notu başka bir duvara (kategoriye) taşıyorsunuz.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label className="mb-2 block">Yeni Duvar (Kategori)</Label>
            <Select 
              value={selectedPostitNewCategoryId} 
              onValueChange={setSelectedPostitNewCategoryId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Bir duvar seçin" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {(() => {
                  const flatten = (cats: any[], depth = 0): any[] => {
                    return cats.reduce((acc, cat) => {
                      acc.push({ ...cat, depth })
                      if (cat.children) acc.push(...flatten(cat.children, depth + 1))
                      return acc
                    }, [])
                  }
                  const buildHierarchy = (items: any[]) => {
                    const rootItems = items.filter(i => !i.parentId).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'tr-TR'))
                    const findChildren = (parent: any) => {
                      const children = items.filter(i => i.parentId === parent.id).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'tr-TR'))
                      if (children.length > 0) {
                        parent.children = children.map(c => findChildren(c))
                      }
                      return parent
                    }
                    return rootItems.map(r => findChildren({ ...r }))
                  }
                  
                  return flatten(buildHierarchy(walls)).map((w: any) => (
                    <SelectItem key={w.id} value={w.id}>
                      {'— '.repeat(w.depth)}{w.name}
                    </SelectItem>
                  ))
                })()}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMovePostitModal(false)}>İptal</Button>
            <Button onClick={handleMovePostitSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">
              Taşı
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  )
}
