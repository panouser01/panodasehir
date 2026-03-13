'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
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
} from 'lucide-react'
import Image from 'next/image'
import { toast } from 'react-hot-toast'

type ActiveSection = 'dashboard' | 'users' | 'postits' | 'walls' | 'roles' | 'groups' | 'sliders' | 'locations' | 'settings' | 'calendar' | 'about' | 'contact' | 'terms' | 'privacy' | 'cookies' | 'help' | 'kvkk' | 'popularCategories' | 'discover' | 'socialMedia'

export default function AdminPage() {
  const { data: session, status } = useSession() || {}
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<any[]>([])
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
  const [selectedGlobalCalendarDate, setSelectedGlobalCalendarDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [showPreview, setShowPreview] = useState(false)
  const dataLoaded = useRef(false)

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false)
  const [showWallModal, setShowWallModal] = useState(false)
  const [showPostitModal, setShowPostitModal] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showUserGroupModal, setShowUserGroupModal] = useState(false)
  const [showSliderModal, setShowSliderModal] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [uploadingSliderImage, setUploadingSliderImage] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  // Form states
  const [locationForm, setLocationForm] = useState({ type: 'CITY', name: '', cityId: '' })
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'USER', userGroupIds: [] as string[] })
  const [wallForm, setWallForm] = useState({
    name: '', description: '', wallManagerIds: [] as string[], userGroupId: '',
    parentId: '', cityId: '', districtId: '', contactName: '', contactPhone: '', contactEmail: '', heroSubtitle: '', heroTitleFont: 'sans-serif', heroTitleColor: '#ffffff', heroTitleSize: '5xl', heroSubtitleFont: 'sans-serif', heroSubtitleColor: '#ffffff', heroSubtitleSize: 'xl', heroGradientFrom: '#facc15', heroGradientVia: '#f472b6', heroGradientTo: '#a855f7',
    backgroundColor: '', backgroundImage: '', borderColor: '', borderTopColor: '', borderBottomColor: '', isGradient: false, gradientFrom: '#facc15', gradientVia: '#f472b6', gradientTo: '#a855f7', isWallTransparent: false, noBorder: false, heroAlignment: 'left', heroBackgroundImage: '', isHeroTransparent: false, navMenuBgColor: '', navMenuFont: 'sans-serif', navMenuTextColor: '', navMenuFontSize: 14, navMenuMainBold: true, siteBackgroundColor: '', siteBackgroundImage: '', siteGradientFrom: '', siteGradientVia: '', siteGradientTo: '', siteIsGradient: false,
    calendarEntries: [] as any[],
    homeCategoryIds: [] as string[],
    postitLimit: 0,
    logoUrl: '', logoPosition: 'top-right', logoSize: 'medium', useParentLogo: false,
    useCustomLayout: false, customLayout: [] as any[]
  })
  const [postitForm, setPostitForm] = useState({ content: '', categoryId: '', color: 'YELLOW', font: 'HANDWRITING', pushpin: 'RED', link: '', isApproved: false, isPublished: true, imageUrl: '', imageUrls: [] as string[], expiresInDays: 'custom', expiresAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] })
  const [uploadingPostitImage, setUploadingPostitImage] = useState(false)
  const [uploadingWallLogo, setUploadingWallLogo] = useState(false)
  const [uploadingBlockImage, setUploadingBlockImage] = useState<string | null>(null)
  const [uploadingTitleImage, setUploadingTitleImage] = useState<string | null>(null)
  const [roleForm, setRoleForm] = useState({ name: '', description: '' })
  const [sliderForm, setSliderForm] = useState({ categoryId: '', images: ['', '', '', '', ''], links: ['', '', '', '', ''], backgroundColor: '#f8f9fa', backgroundImage: '', isGradient: false, isTransparent: false, heroGradientFrom: '#facc15', heroGradientVia: '#f472b6', heroGradientTo: '#a855f7', isActive: true })
  const [userGroupForm, setUserGroupForm] = useState({ name: '', description: '' })

  // Postit search and filter states
  const [postitSearch, setPostitSearch] = useState('')
  const [postitStatusFilter, setPostitStatusFilter] = useState<'all' | 'published' | 'unpublished' | 'pending'>('pending')
  const [userSearch, setUserSearch] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set())

  // Wall search and hierarchy states
  const [wallSearch, setWallSearch] = useState('')
  const [expandedWalls, setExpandedWalls] = useState<Set<string>>(new Set())
  const [expandedCities, setExpandedCities] = useState<Set<string>>(new Set())
  const [showMovePostsModal, setShowMovePostsModal] = useState(false)
  const [parentWallForSubcategory, setParentWallForSubcategory] = useState<any>(null)
  const [selectedPostsToMove, setSelectedPostsToMove] = useState<string[]>([])

  // Appearance settings modal
  const [showAppearanceModal, setShowAppearanceModal] = useState(false)
  const [appearanceForm, setAppearanceForm] = useState({
    heroBackgroundImage: '',
    heroSubtitle: '',
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
    isHeroTransparent: false,
    categoryFont: 'sans-serif',
    categoryColor: '#1f2937',
    categoryBgColor: '#ffffff',
    ribbonColor: '#502bb1'
  })
  const [editingAppearanceWall, setEditingAppearanceWall] = useState<any>(null)
  const [tempCategoryRibbonColors, setTempCategoryRibbonColors] = useState<Record<string, string>>({})
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(new Date().toISOString().split('T')[0])

  // Site Settings
  const [siteSettings, setSiteSettings] = useState({
    backgroundColor: '#cca378',
    backgroundImage: 'https://www.transparenttextures.com/patterns/cork-board.png',
    borderColor: '#6b4423',
    borderTopColor: '#8a5a2e',
    borderBottomColor: '#4a2f18',
    noBorder: false,
    isGradient: false,
    isWallTransparent: false,
    gradientFrom: '#facc15',
    gradientVia: '#f472b6',
    gradientTo: '#a855f7',
    heroBackgroundImage: '',
    isHeroTransparent: false,
    heroTitleFont: 'sans-serif',
    heroTitleColor: '#ffffff',
    heroTitleSize: '5xl',
    heroSubtitle: '',
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
    calendarShow: true,
    calendarSize: 'medium',
    calendarPosition: 'right',
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
    navMenuTextColor: '#111827',
    navMenuFontSize: 14,
  })
  const [savingSettings, setSavingSettings] = useState(false)
  const [uploadingSiteImage, setUploadingSiteImage] = useState(false)
  const [uploadingSiteHeroImage, setUploadingSiteHeroImage] = useState(false)
  const [uploadingSiteBackgroundImage, setUploadingSiteBackgroundImage] = useState(false)
  const [uploadingCalendarPopupImage, setUploadingCalendarPopupImage] = useState(false)
  const [uploadingAppearanceImage, setUploadingAppearanceImage] = useState(false)

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
      dataLoaded.current = true
    }
  }, [status, session, router])

  const loadData = async () => {
    try {
      setLoading(true)
      const [usersRes, postitsRes, wallsRes, rolesRes, slidersRes, locationsRes, settingsRes, calendarRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/postits?includeUnapproved=true'),
        fetch('/api/categories'),
        fetch('/api/roles'),
        fetch('/api/sliders'),
        fetch('/api/locations'),
        fetch('/api/settings'),
        fetch('/api/calendar-categories')
      ])

      if (!usersRes.ok) console.error('Users fetch failed', usersRes.status)
      if (!rolesRes.ok) console.error('Roles fetch failed', rolesRes.status)
      if (!slidersRes.ok) console.error('Sliders fetch failed', slidersRes.status)
      if (!locationsRes.ok) console.error('Locations fetch failed', locationsRes.status)
      if (!settingsRes.ok) console.error('Settings fetch failed', settingsRes.status)
      if (!calendarRes.ok) console.error('Calendar categories fetch failed', calendarRes.status)

      const usersData = await usersRes.json()
      const postitsData = await postitsRes.json()
      const wallsData = await wallsRes.json()
      const rolesData = await rolesRes.json()
      const slidersData = await slidersRes.json()
      const locationsData = await locationsRes.json()
      const settingsData = await settingsRes.json()
      const calendarCategoriesData = await calendarRes.json()

      // Log roles data to debug
      console.log('Roles Data:', rolesData)

      if (settingsData?.settings) {
        setSiteSettings(settingsData.settings)
      }

      setUsers(usersData?.users ?? [])
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
      setUserForm({ name: '', email: '', password: '', role: 'USER', userGroupIds: [] })
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
        userGroupId: wallForm.userGroupId || null,
        parentId: wallForm.parentId || null,
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
        heroAlignment: wallForm.heroAlignment,
        heroBackgroundImage: wallForm.heroBackgroundImage,
        isHeroTransparent: wallForm.isHeroTransparent,
        navMenuBgColor: wallForm.navMenuBgColor,
        navMenuFont: wallForm.navMenuFont,
        navMenuTextColor: wallForm.navMenuTextColor,
        navMenuFontSize: wallForm.navMenuFontSize,
        navMenuMainBold: wallForm.navMenuMainBold,
        siteBackgroundColor: wallForm.siteBackgroundColor,
        siteBackgroundImage: wallForm.siteBackgroundImage,
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
        useParentLogo: wallForm.useParentLogo,
        useCustomLayout: wallForm.useCustomLayout,
        customLayout: wallForm.customLayout
      }

      // Add selected posts to move if creating new subcategory
      if (!editingItem && selectedPostsToMove.length > 0) {
        payload.movePostsToNew = selectedPostsToMove
      }

      const isEditing = !!editingItem
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
      const savedWall = data.category
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

      // Ana Duvar ise genel site ayarlarını da kaydet
      if (wallForm.name === 'Ana Duvar') {
        const settingsRes = await fetch('/api/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(siteSettings)
        });
        if (!settingsRes.ok) {
          console.error('Site settings could not be saved along with Ana Duvar.');
        }
      }

      toast.success(isEditing ? 'Duvar güncellendi' : (wallForm.parentId ? 'Alt kategori oluşturuldu' : 'Duvar oluşturuldu'))

      loadData()
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

  // Post-it operations
  const handleSavePostit = async () => {
    try {
      const response = await fetch(`/api/postits/${editingItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postitForm),
      })
      if (!response.ok) throw new Error('Güncelleme başarısız')
      toast.success('Not güncellendi')
      setShowPostitModal(false)
      setEditingItem(null)
      setPostitForm({ content: '', categoryId: '', color: 'YELLOW', font: 'HANDWRITING', pushpin: 'RED', link: '', isApproved: false, isPublished: true, imageUrl: '', imageUrls: [], expiresInDays: 'custom', expiresAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] })
      loadData()
    } catch (error) {
      toast.error('Not kaydedilemedi')
    }
  }

  const handlePostitImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (postitForm.imageUrls.length >= 5) {
      toast.error('En fazla 5 resim ekleyebilirsiniz')
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
      setRoleForm({ name: '', description: '' })
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
    setRoleForm({ name: role.name, description: role.description || '' })
    setShowRoleModal(true)
  }

  const openAddRole = () => {
    setEditingItem(null)
    setRoleForm({ name: '', description: '' })
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
    setUserForm({ name: user.name, email: user.email, password: '', role: user.role, userGroupIds: user.userGroups?.map((g: any) => g.id) || [] })
    setShowUserModal(true)
  }

  const openEditWall = (wall: any) => {
    setEditingItem(wall)
    setWallForm({
      name: wall.name,
      description: wall.description || '',
      wallManagerIds: wall.wallManagers?.map((m: any) => m.id) || [],
      userGroupId: wall.userGroupId || '',
      parentId: wall.parentId || '',
      cityId: wall.cityId || '',
      districtId: wall.districtId || '',
      contactName: wall.contactName || '',
      contactPhone: wall.contactPhone || '',
      contactEmail: wall.contactEmail || '',
      heroSubtitle: wall.heroSubtitle || '',
      heroTitleFont: wall.heroTitleFont || 'sans-serif',
      heroTitleColor: wall.heroTitleColor || '#ffffff',
      heroTitleSize: wall.heroTitleSize || '5xl',
      heroSubtitleFont: wall.heroSubtitleFont || 'sans-serif',
      heroSubtitleColor: wall.heroSubtitleColor || '#ffffff',
      heroSubtitleSize: wall.heroSubtitleSize || 'xl',
      heroGradientFrom: wall.heroGradientFrom || '#facc15',
      heroGradientVia: wall.heroGradientVia || '#f472b6',
      heroGradientTo: wall.heroGradientTo || '#a855f7',
      backgroundColor: wall.backgroundColor || '',
      backgroundImage: wall.backgroundImage || '',
      borderColor: wall.borderColor || '',
      borderTopColor: wall.borderTopColor || '',
      borderBottomColor: wall.borderBottomColor || '',
      isGradient: !!wall.isGradient,
      gradientFrom: wall.gradientFrom || '#facc15',
      gradientVia: wall.gradientVia || '#f472b6',
      gradientTo: wall.gradientTo || '#a855f7',
      isWallTransparent: !!wall.isWallTransparent,
      noBorder: !!wall.noBorder,
      heroAlignment: wall.heroAlignment || 'left',
      heroBackgroundImage: wall.heroBackgroundImage || '',
      isHeroTransparent: !!wall.isHeroTransparent,
      navMenuBgColor: wall.navMenuBgColor || '',
      navMenuFont: wall.navMenuFont || 'sans-serif',
      navMenuTextColor: wall.navMenuTextColor || '',
      navMenuFontSize: wall.navMenuFontSize || 14,
      navMenuMainBold: wall.navMenuMainBold !== null ? wall.navMenuMainBold : true,
      siteBackgroundColor: wall.siteBackgroundColor || '',
      siteBackgroundImage: wall.siteBackgroundImage || '',
      siteGradientFrom: wall.siteGradientFrom || '',
      siteGradientVia: wall.siteGradientVia || '',
      siteGradientTo: wall.siteGradientTo || '',
      siteIsGradient: !!wall.siteIsGradient,
      calendarEntries: wall.calendarEntries || [],
      homeCategoryIds: wall.homeCategoryIds || [],
      postitLimit: wall.postitLimit !== undefined ? wall.postitLimit : 0,
      logoUrl: wall.logoUrl || '',
      logoPosition: wall.logoPosition || 'top-right',
      logoSize: wall.logoSize || 'medium',
      useParentLogo: wall.useParentLogo || false,
      useCustomLayout: wall.useCustomLayout || false,
      customLayout: Array.isArray(wall.customLayout) ? wall.customLayout : (typeof wall.customLayout === 'string' ? (() => { try { return JSON.parse(wall.customLayout) || [] } catch (e) { return [] } })() : [])
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

  const openAddSubcategory = (parentWall: any) => {
    setEditingItem(null)
    setParentWallForSubcategory(parentWall)
    setWallForm({
      name: '',
      description: '',
      wallManagerIds: [],
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
      heroAlignment: 'left',
      heroBackgroundImage: '',
      isHeroTransparent: false,
      navMenuBgColor: '',
      navMenuFont: 'sans-serif',
      navMenuTextColor: '',
      navMenuFontSize: 14,
      navMenuMainBold: true,
      siteBackgroundColor: '',
      siteBackgroundImage: '',
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
      useParentLogo: false,
      useCustomLayout: false,
      customLayout: []
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
      expiresAtDate: postit.expiresAt ? new Date(postit.expiresAt).toISOString().split('T')[0] : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    })
    setShowPostitModal(true)
  }

  const openAddUser = () => {
    setEditingItem(null)
    setUserForm({ name: '', email: '', password: '', role: 'USER', userGroupIds: [] })
    setShowUserModal(true)
  }

  const openAddWall = () => {
    setEditingItem(null)
    setParentWallForSubcategory(null)
    setWallForm({
      name: '',
      description: '',
      wallManagerIds: [],
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
      heroAlignment: 'left',
      heroBackgroundImage: '',
      isHeroTransparent: false,
      navMenuBgColor: '',
      navMenuFont: 'sans-serif',
      navMenuTextColor: '',
      navMenuFontSize: 14,
      navMenuMainBold: true,
      siteBackgroundColor: '',
      siteBackgroundImage: '',
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
      useParentLogo: false,
      useCustomLayout: false,
      customLayout: []
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
      setLocationForm({ type: 'CITY', name: '', cityId: '' })
      loadData()
    } catch (error: any) {
      toast.error(error.message || 'Konum kaydedilemedi')
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
    setLocationForm({ type, name: '', cityId: cityId || '' })
    setShowLocationModal(true)
  }

  const openEditLocation = (item: any, type: 'CITY' | 'DISTRICT') => {
    setEditingItem(item)
    setLocationForm({ type, name: item.name, cityId: item.cityId || '' })
    setShowLocationModal(true)
  }

  // Appearance settings functions
  const openAppearanceSettings = (wall: any) => {
    setEditingAppearanceWall(wall)
    setAppearanceForm({
      heroBackgroundImage: wall.heroBackgroundImage || '',
      isHeroTransparent: !!wall.isHeroTransparent,
      heroSubtitle: wall.heroSubtitle || '',
      heroTitleFont: wall.heroTitleFont || 'sans-serif',
      heroTitleColor: wall.heroTitleColor || '#ffffff',
      heroTitleSize: wall.heroTitleSize || '5xl',
      heroSubtitleFont: wall.heroSubtitleFont || 'sans-serif',
      heroSubtitleColor: wall.heroSubtitleColor || '#ffffff',
      heroSubtitleSize: wall.heroSubtitleSize || 'xl',
      heroGradientFrom: wall.heroGradientFrom || '#facc15',
      heroGradientVia: wall.heroGradientVia || '#f472b6',
      heroGradientTo: wall.heroGradientTo || '#a855f7',
      heroAlignment: wall.heroAlignment || 'left',
      categoryFont: wall.categoryFont || 'sans-serif',
      categoryColor: wall.categoryColor || '#1f2937',
      categoryBgColor: wall.categoryBgColor || '#ffffff',
      ribbonColor: wall.ribbonColor || '#502bb1'
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

      if (!response.ok) {
        throw new Error('Dosya yüklenemedi')
      }

      const { fileUrl } = await response.json()

      const newLayout = [...wallForm.customLayout];
      newLayout[blockIndex] = { ...newLayout[blockIndex], backgroundImage: fileUrl };
      setWallForm({ ...wallForm, customLayout: newLayout });

      toast.success('Bölüm arkaplanı yüklendi')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Arkaplan yüklenirken hata oluştu')
    } finally {
      setUploadingBlockImage(null)
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

      if (!response.ok) {
        throw new Error('Dosya yüklenemedi')
      }

      const { fileUrl } = await response.json()

      const newLayout = [...wallForm.customLayout];
      newLayout[blockIndex] = { ...newLayout[blockIndex], titleImage: fileUrl };
      setWallForm({ ...wallForm, customLayout: newLayout });

      toast.success('Başlık resmi yüklendi')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Başlık resmi yüklenirken hata oluştu')
    } finally {
      setUploadingTitleImage(null)
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

  const handleSaveHomeCategories = async () => {
    try {
      setSavingSettings(true)

      if (wallForm.name === 'Ana Duvar') {
        const resSettings = await fetch('/api/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(siteSettings)
        })
        if (!resSettings.ok) throw new Error('Site ayarları kaydedilemedi')
      } else {
        if (!editingItem?.id) throw new Error('Kategori ayarlarını kaydetmeden önce duvarı kaydetmelisiniz (Ana menüye dönüp kaydedin)')
        const resWall = await fetch(`/api/categories/${editingItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ homeCategoryIds: wallForm.homeCategoryIds, postitLimit: wallForm.postitLimit || 0 })
        })
        if (!resWall.ok) throw new Error('Duvar sıralama ayarları kaydedilemedi')
      }

      const entries = Object.entries(tempCategoryRibbonColors)
      if (entries.length > 0) {
        await Promise.all(
          entries.map(async ([catId, color]) => {
            const res = await fetch(`/api/categories/${catId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ribbonColor: color })
            })
            if (!res.ok) console.error(`Renk güncellenemedi: Kategori ${catId}`)
          })
        )
      }

      toast.success('Kategori düzeni ve renk ayarları kaydedildi')
      loadData()
      setTempCategoryRibbonColors({})
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
    { id: 'calendar', label: 'Takvim Ayarları', icon: Calendar },
    { id: 'walls', label: 'Duvarlar', icon: LayoutGrid },
    { id: 'locations', label: 'İl İlçe Tanımlama', icon: MapPin },
    { id: 'users', label: 'Kullanıcılar', icon: Users },
    { id: 'roles', label: 'Yetki Türü Tanımla', icon: Shield },
    { id: 'groups', label: 'Kullanıcı Grupları', icon: UserGroupIcon },
    { id: 'postits', label: 'Notlar', icon: StickyNote },
  ].filter(item => {
    if (role === 'SUPER_ADMIN') return true
    if (role === 'WALL_MANAGER') {
      return ['dashboard', 'walls', 'postits', 'users'].includes(item.id)
    }
    if (role === 'WALL_USER') {
      return ['dashboard', 'postits'].includes(item.id)
    }
    return false
  })

  const wallManagers = users.filter(u => ['WALL_MANAGER', 'SUPER_ADMIN', 'WALL_USER'].includes(u.role))
  const colors = [
    { value: 'YELLOW', label: 'Sarı', bg: 'bg-yellow-300' },
    { value: 'PINK', label: 'Pembe', bg: 'bg-pink-300' },
    { value: 'BLUE', label: 'Mavi', bg: 'bg-blue-300' },
    { value: 'GREEN', label: 'Yeşil', bg: 'bg-green-300' },
    { value: 'ORANGE', label: 'Turuncu', bg: 'bg-orange-300' },
    { value: 'PURPLE', label: 'Mor', bg: 'bg-purple-300' },
  ]

  const fonts = [
    { value: 'HANDWRITING', label: 'El Yazısı', class: 'font-handwriting' },
    { value: 'SERIF', label: 'Serif', class: 'font-serif' },
    { value: 'SANS', label: 'Sans', class: 'font-sans' },
    { value: 'MONO', label: 'Mono', class: 'font-mono' },
    { value: 'CURSIVE', label: 'Cursive', class: 'font-cursive' },
  ]

  const pushpinOptions = [
    { value: 'RED', label: 'Kırmızı', image: '/pushpins/red.png' },
    { value: 'BLUE', label: 'Mavi', image: '/pushpins/blue.png' },
    { value: 'GOLD', label: 'Altın', image: '/pushpins/gold.png' },
    { value: 'GREEN', label: 'Yeşil', image: '/pushpins/green.png' },
    { value: 'PINK', label: 'Pembe', image: '/pushpins/pink.png' },
    { value: 'SILVER', label: 'Gümüş', image: '/pushpins/silver.png' },
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
                <div className="flex items-center space-x-2 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                  <Checkbox
                    id="isWallTransparent"
                    checked={wallForm.isWallTransparent}
                    onCheckedChange={(checked) => setWallForm(s => ({ ...s, isWallTransparent: !!checked }))}
                  />
                  <Label htmlFor="isWallTransparent" className="cursor-pointer font-bold text-blue-600">Arka Plan Transparan Olsun</Label>
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
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="noBorder"
                        checked={wallForm.noBorder}
                        onCheckedChange={(checked) => setWallForm(s => ({ ...s, noBorder: !!checked }))}
                      />
                      <label htmlFor="noBorder" className="text-sm font-semibold text-gray-700 cursor-pointer">
                        Çerçeve Yok
                      </label>
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
                    <Input value={wallForm.heroSubtitle || ''} onChange={(e) => setWallForm({ ...wallForm, heroSubtitle: e.target.value })} placeholder="Fikirlerinizi paylaşın..." className="h-9 text-xs" />
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

                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <Type className="w-4 h-4" /> Başlık Ayarları
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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

                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-xs font-bold text-gray-700 mb-3">Alt Başlık Ayarları</h4>
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
                    backgroundSize: 'cover',
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
                <div className="flex items-center space-x-2 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                  <Checkbox
                    id="isWallTransparent"
                    checked={siteSettings.isWallTransparent}
                    onCheckedChange={(checked) => setSiteSettings(s => ({ ...s, isWallTransparent: !!checked }))}
                  />
                  <Label htmlFor="isWallTransparent" className="cursor-pointer font-bold text-blue-600">Arka Plan Transparan Olsun</Label>
                </div>

                <div className={siteSettings.isWallTransparent ? 'opacity-50 pointer-events-none transition-all' : 'transition-all'}>
                  <div className="flex items-center space-x-2 pt-2 pb-2">
                    <Checkbox
                      id="siteIsGradient"
                      checked={siteSettings.isGradient}
                      onCheckedChange={(checked) => setSiteSettings(s => ({ ...s, isGradient: !!checked }))}
                    />
                    <Label htmlFor="siteIsGradient" className="cursor-pointer font-semibold text-gray-700">Panoda Renk/Gradyan Kullan</Label>
                  </div>

                  {!siteSettings.isGradient ? (
                    <div className="space-y-2 pl-6">
                      <Label className="text-sm font-medium">Arka Plan Rengi</Label>
                      <div className="flex gap-2">
                        <Input type="color" className="w-12 p-1 h-10 cursor-pointer border-gray-200" value={siteSettings.backgroundColor} onChange={e => setSiteSettings(s => ({ ...s, backgroundColor: e.target.value }))} />
                        <Input value={siteSettings.backgroundColor} onChange={e => setSiteSettings(s => ({ ...s, backgroundColor: e.target.value }))} className="font-mono text-sm" />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pl-6">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-gray-500">Başlangıç</Label>
                        <div className="flex gap-1.5">
                          <Input type="color" className="w-10 h-9 p-1 cursor-pointer border-gray-200" value={siteSettings.gradientFrom || '#facc15'} onChange={(e) => setSiteSettings({ ...siteSettings, gradientFrom: e.target.value })} />
                          <Input className="font-mono text-xs h-9" value={siteSettings.gradientFrom || '#facc15'} onChange={(e) => setSiteSettings({ ...siteSettings, gradientFrom: e.target.value })} />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-gray-500">Orta</Label>
                        <div className="flex gap-1.5">
                          <Input type="color" className="w-10 h-9 p-1 cursor-pointer border-gray-200" value={siteSettings.gradientVia || '#f472b6'} onChange={(e) => setSiteSettings({ ...siteSettings, gradientVia: e.target.value })} />
                          <Input className="font-mono text-xs h-9" value={siteSettings.gradientVia || '#f472b6'} onChange={(e) => setSiteSettings({ ...siteSettings, gradientVia: e.target.value })} />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-gray-500">Bitiş</Label>
                        <div className="flex gap-1.5">
                          <Input type="color" className="w-10 h-9 p-1 cursor-pointer border-gray-200" value={siteSettings.gradientTo || '#a855f7'} onChange={(e) => setSiteSettings({ ...siteSettings, gradientTo: e.target.value })} />
                          <Input className="font-mono text-xs h-9" value={siteSettings.gradientTo || '#a855f7'} onChange={(e) => setSiteSettings({ ...siteSettings, gradientTo: e.target.value })} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 mt-4 pt-4 border-t border-gray-100">
                    <Label className="text-sm font-medium">Arka Plan Dokusu Resmi URL</Label>
                    <div className="flex gap-2">
                      <Input value={siteSettings.backgroundImage} placeholder="https://www.transparenttextures.com/patterns/cork-board.png" onChange={e => setSiteSettings(s => ({ ...s, backgroundImage: e.target.value }))} className="flex-1 h-10 text-sm" />
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
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="noBorder"
                        checked={siteSettings.noBorder}
                        onCheckedChange={(checked) => setSiteSettings(s => ({ ...s, noBorder: !!checked }))}
                      />
                      <label htmlFor="noBorder" className="text-sm font-semibold text-gray-700 cursor-pointer">
                        Çerçeve Yok
                      </label>
                    </div>

                    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${siteSettings.noBorder ? 'opacity-50 pointer-events-none' : ''}`}>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-gray-500">Dış Çerçeve (Sağ) Rengi</Label>
                        <div className="flex gap-2">
                          <Input type="color" className="w-10 h-9 p-1 cursor-pointer border-gray-200" value={siteSettings.borderColor} onChange={e => setSiteSettings(s => ({ ...s, borderColor: e.target.value }))} />
                          <Input value={siteSettings.borderColor} onChange={e => setSiteSettings(s => ({ ...s, borderColor: e.target.value }))} className="h-9 text-[10px] font-mono" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-gray-500">Üst ve Sol Çerçeve Rengi</Label>
                        <div className="flex gap-2">
                          <Input type="color" className="w-10 h-9 p-1 cursor-pointer border-gray-200" value={siteSettings.borderTopColor} onChange={e => setSiteSettings(s => ({ ...s, borderTopColor: e.target.value }))} />
                          <Input value={siteSettings.borderTopColor} onChange={e => setSiteSettings(s => ({ ...s, borderTopColor: e.target.value }))} className="h-9 text-[10px] font-mono" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-gray-500">Alt Çerçeve Rengi</Label>
                        <div className="flex gap-2">
                          <Input type="color" className="w-10 h-9 p-1 cursor-pointer border-gray-200" value={siteSettings.borderBottomColor} onChange={e => setSiteSettings(s => ({ ...s, borderBottomColor: e.target.value }))} />
                          <Input value={siteSettings.borderBottomColor} onChange={e => setSiteSettings(s => ({ ...s, borderBottomColor: e.target.value }))} className="h-9 text-[10px] font-mono" />
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
                      value={siteSettings.siteBackgroundImage || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, siteBackgroundImage: e.target.value })}
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

                <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="siteGroundIsGradient"
                      checked={siteSettings.siteIsGradient}
                      onCheckedChange={(checked) => setSiteSettings(s => ({ ...s, siteIsGradient: !!checked }))}
                    />
                    <Label htmlFor="siteGroundIsGradient" className="cursor-pointer font-bold text-emerald-700">Zeminde Renk/Gradyan Kullan</Label>
                  </div>

                  <div className="mt-4 transition-all">
                    {!siteSettings.siteIsGradient ? (
                      <div className="space-y-2 pl-6">
                        <Label className="text-xs font-semibold text-emerald-600">Arka Plan Rengi</Label>
                        <div className="flex gap-2">
                          <Input type="color" className="w-12 h-10 p-1 cursor-pointer border-emerald-200" value={siteSettings.siteBackgroundColor || '#fffbeb'} onChange={e => setSiteSettings(s => ({ ...s, siteBackgroundColor: e.target.value }))} />
                          <Input value={siteSettings.siteBackgroundColor || '#fffbeb'} onChange={e => setSiteSettings(s => ({ ...s, siteBackgroundColor: e.target.value }))} className="flex-1 h-10 font-mono text-sm" />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pl-6">
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold text-emerald-600">Başlangıç</Label>
                          <div className="flex gap-1.5">
                            <Input type="color" className="w-9 h-8 p-1 cursor-pointer border-emerald-200" value={siteSettings.siteGradientFrom || '#fffbeb'} onChange={(e) => setSiteSettings({ ...siteSettings, siteGradientFrom: e.target.value })} />
                            <Input className="font-mono text-[9px] h-8" value={siteSettings.siteGradientFrom || '#fffbeb'} onChange={(e) => setSiteSettings({ ...siteSettings, siteGradientFrom: e.target.value })} />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold text-emerald-600">Orta</Label>
                          <div className="flex gap-1.5">
                            <Input type="color" className="w-9 h-8 p-1 cursor-pointer border-emerald-200" value={siteSettings.siteGradientVia || '#fefce8'} onChange={(e) => setSiteSettings({ ...siteSettings, siteGradientVia: e.target.value })} />
                            <Input className="font-mono text-[9px] h-8" value={siteSettings.siteGradientVia || '#fefce8'} onChange={(e) => setSiteSettings({ ...siteSettings, siteGradientVia: e.target.value })} />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold text-emerald-600">Bitiş</Label>
                          <div className="flex gap-1.5">
                            <Input type="color" className="w-9 h-8 p-1 cursor-pointer border-emerald-200" value={siteSettings.siteGradientTo || '#fff7ed'} onChange={(e) => setSiteSettings({ ...siteSettings, siteGradientTo: e.target.value })} />
                            <Input className="font-mono text-[9px] h-8" value={siteSettings.siteGradientTo || '#fff7ed'} onChange={(e) => setSiteSettings({ ...siteSettings, siteGradientTo: e.target.value })} />
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
                      <Input value={siteSettings.heroBackgroundImage || ''} onChange={(e) => setSiteSettings({ ...siteSettings, heroBackgroundImage: e.target.value })} placeholder="URL veya dosya yükleyin" className="flex-1 h-9 text-xs" />
                      <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('site-hero-upload')?.click()} className="h-9 h-9 px-2">
                        {uploadingSiteHeroImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      </Button>
                      <input id="site-hero-upload" type="file" accept="image/*" onChange={handleSiteHeroImageUpload} className="hidden" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-500">Alt Başlık Metni</Label>
                    <Input value={siteSettings.heroSubtitle || ''} onChange={(e) => setSiteSettings({ ...siteSettings, heroSubtitle: e.target.value })} placeholder="Fikirlerinizi paylaşın..." className="h-9 text-xs" />
                  </div>
                </div>

                <div className="flex items-center space-x-2 mt-2">
                  <Checkbox
                    id="siteHeroTransparent"
                    checked={siteSettings.isHeroTransparent}
                    onCheckedChange={(checked) => setSiteSettings(s => ({ ...s, isHeroTransparent: !!checked }))}
                  />
                  <Label htmlFor="siteHeroTransparent" className="cursor-pointer font-bold text-amber-700">Kapak Arka Planı (Zemin) Şeffaf Olsun</Label>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {['From', 'Via', 'To'].map((pos) => (
                    <div key={pos} className="space-y-1">
                      <Label className="text-[10px] font-bold text-gray-400">Gradyan {pos === 'From' ? 'Başlangıç' : pos === 'Via' ? 'Orta' : 'Bitiş'}</Label>
                      <div className="flex gap-1.5">
                        <input type="color" value={(siteSettings as any)[`heroGradient${pos}`] || (pos === 'From' ? '#facc15' : pos === 'Via' ? '#f472b6' : '#a855f7')} onChange={(e) => setSiteSettings({ ...siteSettings, [`heroGradient${pos}`]: e.target.value })} className="w-9 h-9 rounded cursor-pointer border border-gray-200" />
                        <Input value={(siteSettings as any)[`heroGradient${pos}`] || (pos === 'From' ? '#facc15' : pos === 'Via' ? '#f472b6' : '#a855f7')} onChange={(e) => setSiteSettings({ ...siteSettings, [`heroGradient${pos}`]: e.target.value })} className="h-9 text-[10px] font-mono flex-1" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <Type className="w-4 h-4" /> Başlık Ayarları
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-medium text-gray-500">Hizalama</Label>
                      <Select value={siteSettings.heroAlignment || 'left'} onValueChange={(v) => setSiteSettings({ ...siteSettings, heroAlignment: v })}>
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
                      <Select value={siteSettings.heroTitleFont || 'sans-serif'} onValueChange={(v) => setSiteSettings({ ...siteSettings, heroTitleFont: v })}>
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
                      <input type="color" value={siteSettings.heroTitleColor || '#ffffff'} onChange={(e) => setSiteSettings({ ...siteSettings, heroTitleColor: e.target.value })} className="w-full h-8 rounded cursor-pointer border border-gray-200" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-medium text-gray-500">Boyut</Label>
                      <Select value={siteSettings.heroTitleSize || '5xl'} onValueChange={(v) => setSiteSettings({ ...siteSettings, heroTitleSize: v })}>
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

                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-xs font-bold text-gray-700 mb-3">Alt Başlık Ayarları</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-medium text-gray-500">Font</Label>
                      <Select value={siteSettings.heroSubtitleFont || 'sans-serif'} onValueChange={(v) => setSiteSettings({ ...siteSettings, heroSubtitleFont: v })}>
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
                      <input type="color" value={siteSettings.heroSubtitleColor || '#ffffff'} onChange={(e) => setSiteSettings({ ...siteSettings, heroSubtitleColor: e.target.value })} className="w-full h-8 rounded cursor-pointer border border-gray-200" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-medium text-gray-500">Boyut</Label>
                      <Select value={siteSettings.heroSubtitleSize || 'xl'} onValueChange={(v) => setSiteSettings({ ...siteSettings, heroSubtitleSize: v })}>
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
                      <input type="color" value={siteSettings.navMenuBgColor || '#ffffff'} onChange={(e) => setSiteSettings({ ...siteSettings, navMenuBgColor: e.target.value })} className="w-10 h-10 rounded cursor-pointer border border-gray-200" />
                      <Input value={siteSettings.navMenuBgColor || '#ffffff'} onChange={(e) => setSiteSettings({ ...siteSettings, navMenuBgColor: e.target.value })} className="flex-1 font-mono text-sm" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Yazı Rengi</Label>
                    <div className="flex gap-2">
                      <input type="color" value={siteSettings.navMenuTextColor || '#111827'} onChange={(e) => setSiteSettings({ ...siteSettings, navMenuTextColor: e.target.value })} className="w-10 h-10 rounded cursor-pointer border border-gray-200" />
                      <Input value={siteSettings.navMenuTextColor || '#111827'} onChange={(e) => setSiteSettings({ ...siteSettings, navMenuTextColor: e.target.value })} className="flex-1 font-mono text-sm" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Font</Label>
                    <Select value={siteSettings.navMenuFont || 'sans-serif'} onValueChange={(v) => setSiteSettings({ ...siteSettings, navMenuFont: v })}>
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
                    <Select value={String(siteSettings.navMenuFontSize || 14)} onValueChange={(v) => setSiteSettings({ ...siteSettings, navMenuFontSize: parseInt(v) })}>
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
                    checked={siteSettings.navMenuMainBold}
                    onCheckedChange={(checked) => setSiteSettings(s => ({ ...s, navMenuMainBold: !!checked }))}
                  />
                  <Label htmlFor="navMenuMainBold" className="cursor-pointer font-bold text-indigo-700">Ana Kategoriler Kalın Olsun</Label>
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
              backgroundColor: siteSettings.siteBackgroundColor || '#f8fafc',
              backgroundImage: siteSettings.siteIsGradient
                ? `linear-gradient(135deg, ${siteSettings.siteGradientFrom || '#fffbeb'}, ${siteSettings.siteGradientVia || '#fefce8'}, ${siteSettings.siteGradientTo || '#fff7ed'})`
                : siteSettings.siteBackgroundImage ? `url("${siteSettings.siteBackgroundImage}")` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Duvar Panosu (Wall Board) Önizlemesi */}
            <div className="w-full max-w-4xl mx-auto rounded-2xl relative p-4 md:p-10 flex shadow-2xl overflow-hidden border-4 border-white/30"
              style={{
                backgroundColor: siteSettings.isWallTransparent ? 'transparent' : siteSettings.backgroundColor,
                backgroundImage: !siteSettings.isWallTransparent ? (siteSettings.isGradient ? `linear-gradient(to bottom right, ${siteSettings.gradientFrom || '#facc15'}, ${siteSettings.gradientVia || '#f472b6'}, ${siteSettings.gradientTo || '#a855f7'})` : `url("${siteSettings.backgroundImage}")`) : 'none',
                border: siteSettings.noBorder ? '0px' : `20px solid transparent`,
                borderImage: siteSettings.noBorder ? 'none' : `linear-gradient(to right, ${siteSettings.borderTopColor}, ${siteSettings.borderColor}, ${siteSettings.borderBottomColor}) 1`,
                minHeight: '450px',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {/* Dokulu kaplama */}
              {!siteSettings.isWallTransparent && siteSettings.backgroundImage && (
                <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply" style={{ backgroundImage: `url("${siteSettings.backgroundImage}")`, backgroundSize: '200px' }}></div>
              )}

              <div className="m-auto relative z-10 w-full">
                {/* Hero Önizlemesi */}
                <div
                  className="mb-8 p-6 rounded-2xl overflow-hidden relative shadow-lg group transition-all duration-500 border border-white/20"
                  style={{
                    backgroundImage: siteSettings.heroBackgroundImage
                      ? `url("${siteSettings.heroBackgroundImage}")`
                      : `linear-gradient(135deg, ${siteSettings.heroGradientFrom || '#facc15'}, ${siteSettings.heroGradientVia || '#f472b6'}, ${siteSettings.heroGradientTo || '#a855f7'})`,
                    backgroundSize: 'cover',
                    textAlign: (siteSettings.heroAlignment as any) || 'left'
                  }}
                >
                  <h4
                    className="font-bold mb-2 transition-all duration-300 drop-shadow-md"
                    style={{
                      fontFamily: siteSettings.heroTitleFont || 'sans-serif',
                      color: siteSettings.heroTitleColor || '#ffffff',
                      fontSize: siteSettings.heroTitleSize === '4xl' ? '1.5rem' : siteSettings.heroTitleSize === '5xl' ? '2rem' : '2.5rem'
                    }}
                  >
                    Ana Sayfa Başlığı
                  </h4>
                  <p
                    className="opacity-90 font-medium transition-all duration-300 drop-shadow-sm"
                    style={{
                      fontFamily: siteSettings.heroSubtitleFont || 'sans-serif',
                      color: siteSettings.heroSubtitleColor || '#ffffff',
                      fontSize: siteSettings.heroSubtitleSize === 'lg' ? '0.9rem' : siteSettings.heroSubtitleSize === 'xl' ? '1.1rem' : '1.3rem'
                    }}
                  >
                    {siteSettings.heroSubtitle || 'Harika fikirlerin buluşma noktası'}
                  </p>
                </div>

                <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/50 text-center scale-95 hover:scale-100 transition-transform duration-500">
                  {/* Kategori Menü Mockup */}
                  <div
                    className="flex gap-4 justify-center mb-6 py-3 px-4 rounded-full shadow-sm mx-auto w-fit"
                    style={{
                      backgroundColor: siteSettings.navMenuBgColor || '#ffffff',
                      fontFamily: siteSettings.navMenuFont || 'sans-serif',
                      fontSize: `${siteSettings.navMenuFontSize || 14}px`,
                      color: siteSettings.navMenuTextColor || '#111827'
                    }}
                  >
                    <span style={{ fontWeight: siteSettings.navMenuMainBold ? 'bold' : 'normal' }}>Gündem</span>
                    <span style={{ fontWeight: siteSettings.navMenuMainBold ? 'bold' : 'normal' }}>Haberler</span>
                    <span style={{ fontWeight: siteSettings.navMenuMainBold ? 'bold' : 'normal' }}>Spor</span>
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
                              className={`w-full flex items-center gap-3 px-4 py-2 text-sm rounded-lg transition-colors ${activeSection === child.id
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                }`}
                            >
                              <ChildIcon className="w-4 h-4" />
                              {child.label}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => setActiveSection(item.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeSection === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
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

              <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden flex flex-col min-h-[400px]">
                <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-700">Tüm Kategoriler (Ana Sayfa) Önizlemesi</h3>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
                      onClick={() => setShowPreview(!showPreview)}
                    >
                      {showPreview ? 'Önizlemeyi Kapat' : 'Önizlemeyi Yükle'}
                    </Button>
                    <a href="/" target="_blank" className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium">
                      Yeni Sekmede Aç <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
                <div className="flex-1 w-full bg-gray-50 p-4 min-h-[500px]">
                  {showPreview ? (
                    <div className="w-full h-[600px] border border-gray-300 rounded overflow-hidden shadow-inner bg-white">
                      <iframe src="/?preview=1" className="w-full h-full border-none" title="Ana Sayfa Önizleme" />
                    </div>
                  ) : (
                    <div className="w-full h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-white text-gray-400">
                      <LayoutGrid className="w-12 h-12 mb-3 opacity-20" />
                      <p className="text-sm">Önizlemeyi görmek için yukarıdaki butona tıklayın.</p>
                      <p className="text-xs mt-1">(Aynı anda hem admin hem ana sayfa açıkken oluşabilecek takılmaları önlemek için varsayılan olarak kapalıdır.)</p>
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
                                  <SelectItem value="top-right">Sayfa Sağ Üst (Sabit)</SelectItem>
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
                      <div className={`transition-all duration-500 z-10 ${siteSettings.calendarPosition === 'top-left' ? 'absolute top-4 left-4' :
                        siteSettings.calendarPosition === 'top-right' ? 'absolute top-4 right-4' :
                          siteSettings.calendarPosition === 'left' ? 'absolute top-20 left-4' :
                            'absolute top-20 right-4'
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

              {/* Search Input */}
              <div className="mb-4">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Duvar ara..."
                    value={wallSearch}
                    onChange={(e) => setWallSearch(e.target.value)}
                    className="pl-10"
                  />
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

                  // Filter by search (recursive)
                  const matchesSearch = (wall: any, searchTerm: string): boolean => {
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
                    if (!searchTerm.trim()) return wallList
                    return wallList.filter(w => matchesSearch(w, searchTerm))
                  }

                  const filteredRootWalls = filterWalls(rootWalls, wallSearch).sort((a, b) => {
                    if (a.name === 'Ana Duvar') return -1;
                    if (b.name === 'Ana Duvar') return 1;
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

                  // Recursive render function for walls
                  const renderWall = (wall: any, level: number = 0) => {
                    const isExpanded = expandedWalls.has(wall.id)
                    const hasChildren = wall.children && wall.children.length > 0
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
                              <span className={`font-medium ${isRoot ? 'text-lg' : 'text-base'}`}>
                                {!isRoot && '↳ '}{wall.name}
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
                              <Button variant="ghost" size="sm" onClick={() => openAddSubcategory(wall)} title="Alt Kategori Ekle" className="h-7 w-7 p-0">
                                <Plus className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => openEditWall(wall)} title="Düzenle" className="h-7 w-7 p-0">
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              {wall.name !== 'Ana Duvar' && (
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
                            {wall.children.map((child: any) => renderWall(child, level + 1))}
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
          )
          }

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
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteRole(role.id)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
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

          {/* Users Section */}
          {
            activeSection === 'users' && (
              <div>
                <div className="sticky top-0 z-30 bg-gray-50/95 py-5 mb-6 flex items-center justify-between border-b border-gray-200 shadow-sm flex-col md:flex-row gap-4 md:gap-0 -mx-8 -mt-8 px-8 backdrop-blur-sm">
                  <h2 className="text-2xl font-bold">Kullanıcı Yönetimi</h2>
                  <Button onClick={openAddUser} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Yeni Kullanıcı
                  </Button>
                </div>

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
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDeleteUser(user.id)}
                                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
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
                  </div>
                </div>

                {/* Grouped by Category */}
                <div className="space-y-4">
                  {(() => {
                    // Filter postits by search and status
                    const filteredPostits = postits.filter((postit) => {
                      const statusMatch =
                        postitStatusFilter === 'all' ? true :
                          postitStatusFilter === 'published' ? postit.isPublished :
                            postitStatusFilter === 'unpublished' ? !postit.isPublished :
                              postitStatusFilter === 'pending' ? !postit.isApproved : true;

                      if (!statusMatch) return false;

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
                                  <TableHead className="w-[25%] text-gray-200 font-semibold py-3 pl-4">İçerik</TableHead>
                                  <TableHead className="w-[15%] text-gray-200 font-semibold py-3">Kullanıcı</TableHead>
                                  <TableHead className="w-[10%] text-gray-200 font-semibold py-3">Renk</TableHead>
                                  <TableHead className="w-[10%] text-center text-gray-200 font-semibold py-3">Beğeni</TableHead>
                                  <TableHead className="w-[10%] text-center text-gray-200 font-semibold py-3">Görüntülenme</TableHead>
                                  <TableHead className="w-[10%] text-center text-gray-200 font-semibold py-3">Onaylı</TableHead>
                                  <TableHead className="w-[10%] text-center text-gray-200 font-semibold py-3">Yayında</TableHead>
                                  <TableHead className="w-[10%] text-gray-200 font-semibold py-3">Kayıt</TableHead>
                                  <TableHead className="w-[10%] text-gray-200 font-semibold py-3">Bitiş</TableHead>
                                  <TableHead className="w-[10%] text-gray-200 font-semibold py-3 pr-4">İşlemler</TableHead>
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
                                    <TableCell>{postit.user?.name ?? '-'}</TableCell>
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
                                    <TableCell className="text-center">
                                      <Checkbox
                                        checked={postit.isApproved}
                                        onCheckedChange={(checked) => handleToggleStatus(postit.id, 'isApproved', checked as boolean)}
                                        className="mx-auto"
                                      />
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <Checkbox
                                        checked={postit.isPublished}
                                        onCheckedChange={(checked) => handleToggleStatus(postit.id, 'isPublished', checked as boolean)}
                                        disabled={new Date(postit.expiresAt) < new Date()}
                                        className="mx-auto"
                                      />
                                    </TableCell>
                                    <TableCell>{new Date(postit.createdAt).toLocaleDateString('tr-TR')}</TableCell>
                                    <TableCell>{new Date(postit.expiresAt).toLocaleDateString('tr-TR')}</TableCell>
                                    <TableCell>
                                      <div className="flex gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => openEditPostit(postit)}>
                                          <Pencil className="w-4 h-4" />
                                        </Button>
                                        {((session?.user as any)?.role === 'SUPER_ADMIN') && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeletePostit(postit.id)}
                                            className="hover:bg-red-100 hover:text-red-600"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        )}
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
        </div>
      </main>

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
                background: appearanceForm.heroBackgroundImage
                  ? `url('${appearanceForm.heroBackgroundImage}') center/cover`
                  : `linear-gradient(to right, ${appearanceForm.heroGradientFrom}, ${appearanceForm.heroGradientVia}, ${appearanceForm.heroGradientTo})`
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
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Type className="w-4 h-4" /> Başlık Ayarları
                </h4>
                <div className="grid grid-cols-4 gap-4">
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
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium mb-3">Alt Başlık Ayarları</h4>
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
                  <Label>Kurdele Rengi</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={appearanceForm.ribbonColor || '#502bb1'}
                      onChange={(e) => setAppearanceForm({ ...appearanceForm, ribbonColor: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={appearanceForm.ribbonColor || '#502bb1'}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Ad Soyad</Label>
              <Input
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Şifre {editingItem && '(Boş bırakırsanız değişmez)'}</Label>
              <Input
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
              />
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

            <div className="space-y-4">
              <Label>Kullanıcı Grupları</Label>
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-3 border rounded-md bg-white">
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
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setShowUserModal(false)}>
              İptal
            </Button>
            <Button type="button" onClick={handleSaveUser}>Kaydet</Button>
          </DialogFooter>
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
                  <ListTree className="w-4 h-4" /> Kategori Düzenle
                </TabsTrigger>
                <TabsTrigger value="layout" className="flex items-center gap-2 flex-grow sm:flex-grow-0">
                  <LayoutGrid className="w-4 h-4" /> Pano Düzeni
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Duvar Adı</Label>
                  <Input
                    value={wallForm.name}
                    onChange={(e) => setWallForm({ ...wallForm, name: e.target.value })}
                  />
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
                    <Label>Yönetici</Label>
                    <div className="border rounded-md p-4 max-h-48 overflow-y-auto space-y-2 bg-gray-50">
                      {wallManagers.map((manager) => (
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
                            {manager.name} <span className="text-xs text-gray-500">({manager.role === 'SUPER_ADMIN' ? 'Süper Admin' : 'Yönetici'})</span>
                          </label>
                        </div>
                      ))}
                      {wallManagers.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-2">Henüz duvar yöneticisi bulunmuyor.</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Grup Yetkisi</Label>
                    <Select
                      value={wallForm.userGroupId || 'none'}
                      onValueChange={(value) => setWallForm({ ...wallForm, userGroupId: value === 'none' ? '' : value })}
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                  }`}
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
                      <ListTree className="w-5 h-5 text-indigo-500" /> Ana Sayfa Kategori Yönetimi
                    </h3>
                    <p className="text-sm text-gray-500">Ana sayfada gösterilecek kategorileri seçerek hiyerarşik yapıdan sıralayın.</p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-purple-800 block mb-1">Varsayılan Kurdele Rengi</Label>
                      <p className="text-xs text-purple-600">Site geneli için ana kategori kurdele rengini belirleyin. Özel renk seçilmeyen kategoriler bu rengi kullanır.</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <input type="color" value={siteSettings.ribbonColor || '#502bb1'} onChange={(e) => setSiteSettings({ ...siteSettings, ribbonColor: e.target.value })} className="w-10 h-10 rounded cursor-pointer border border-purple-200" />
                      <Input value={siteSettings.ribbonColor || '#502bb1'} onChange={(e) => setSiteSettings({ ...siteSettings, ribbonColor: e.target.value })} className="w-24 font-mono text-sm bg-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left: Hierarchical Catalog */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-700 bg-gray-50 px-3 py-2 rounded block border border-gray-100">Kategori Havuzu (Hiyerarşik)</Label>
                      <div className="border border-gray-100 rounded-md p-3 max-h-[400px] overflow-y-auto space-y-1 bg-white">
                        {(() => {
                          let homeArray = wallForm.name === 'Ana Duvar' ? siteSettings.homeCategoryIds : wallForm.homeCategoryIds;
                          if (typeof homeArray === 'string') { try { homeArray = JSON.parse(homeArray) } catch (e) { homeArray = [] } }
                          if (!Array.isArray(homeArray)) homeArray = [];
                          const allCats = walls.filter((w: any) => w.name !== 'Ana Duvar');

                          const buildHierarchy = (items: any[]) => {
                            const isSuperAdmin = (session?.user as any)?.role === 'SUPER_ADMIN';
                            let rootItems = [];

                            if (wallForm.name === 'Ana Duvar' || isSuperAdmin) {
                              rootItems = items.filter(i => !i.parentId);
                            } else {
                              rootItems = items.filter(i => i.parentId === (editingItem?.id || 'new'));
                            }

                            const findChildren = (parent: any) => {
                              const children = items.filter(i => i.parentId === parent.id)
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
                                      if (wallForm.name === 'Ana Duvar') {
                                        setSiteSettings({ ...siteSettings, homeCategoryIds: newArray });
                                      } else {
                                        setWallForm({ ...wallForm, homeCategoryIds: newArray });
                                      }
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
                          let homeArray = wallForm.name === 'Ana Duvar' ? siteSettings.homeCategoryIds : wallForm.homeCategoryIds;
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
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-gray-400 hover:text-indigo-600 focus:bg-indigo-50"
                                      disabled={index === 0}
                                      onClick={() => {
                                        const newArray = [...homeArray];
                                        const temp = newArray[index - 1];
                                        newArray[index - 1] = newArray[index];
                                        newArray[index] = temp;
                                        if (wallForm.name === 'Ana Duvar') setSiteSettings({ ...siteSettings, homeCategoryIds: newArray });
                                        else setWallForm({ ...wallForm, homeCategoryIds: newArray });
                                      }}
                                    >
                                      <ArrowUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-gray-400 hover:text-indigo-600 focus:bg-indigo-50"
                                      disabled={index === homeArray.length - 1}
                                      onClick={() => {
                                        const newArray = [...homeArray];
                                        const temp = newArray[index + 1];
                                        newArray[index + 1] = newArray[index];
                                        newArray[index] = temp;
                                        if (wallForm.name === 'Ana Duvar') setSiteSettings({ ...siteSettings, homeCategoryIds: newArray });
                                        else setWallForm({ ...wallForm, homeCategoryIds: newArray });
                                      }}
                                    >
                                      <ArrowDown className="h-4 w-4" />
                                    </Button>
                                    <div className="w-px h-5 bg-gray-200 mx-1 self-center" />
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-gray-400 hover:text-red-600 focus:bg-red-50 hover:bg-red-50"
                                      onClick={() => {
                                        const newArray = homeArray.filter((i: string) => i !== id);
                                        if (wallForm.name === 'Ana Duvar') setSiteSettings({ ...siteSettings, homeCategoryIds: newArray });
                                        else setWallForm({ ...wallForm, homeCategoryIds: newArray });
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                                  <Palette className="w-4 h-4 text-purple-400" />
                                  <span className="text-xs text-gray-500 flex-1">Özel Kurdele Rengi:</span>
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="color"
                                      value={tempCategoryRibbonColors[cat.id] || cat.ribbonColor || siteSettings.ribbonColor || '#502bb1'}
                                      onChange={(e) => setTempCategoryRibbonColors({ ...tempCategoryRibbonColors, [cat.id]: e.target.value })}
                                      className="w-6 h-6 rounded cursor-pointer border border-gray-200"
                                    />
                                    <span className="text-[10px] text-gray-400 font-mono hidden sm:inline-block">
                                      {tempCategoryRibbonColors[cat.id] || cat.ribbonColor || siteSettings.ribbonColor || '#502bb1'}
                                    </span>
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

                  <div className="flex justify-end pt-4 border-t mt-4">
                    <Button onClick={handleSaveHomeCategories} disabled={savingSettings} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md">
                      {savingSettings ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Settings className="w-4 h-4 mr-2" />}
                      Kategori Düzenini Kaydet
                    </Button>
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
                              <div className="absolute top-2 right-2 flex gap-1 z-10">
                                <Button
                                  type="button" variant="ghost" size="icon" className="h-7 w-7 text-gray-500 bg-white shadow-sm border" disabled={index === 0}
                                  onClick={() => {
                                    const newLayout = [...wallForm.customLayout];
                                    const temp = newLayout[index - 1]; newLayout[index - 1] = newLayout[index]; newLayout[index] = temp;
                                    setWallForm({ ...wallForm, customLayout: newLayout });
                                  }}
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  type="button" variant="ghost" size="icon" className="h-7 w-7 text-gray-500 bg-white shadow-sm border" disabled={index === wallForm.customLayout.length - 1}
                                  onClick={() => {
                                    const newLayout = [...wallForm.customLayout];
                                    const temp = newLayout[index + 1]; newLayout[index + 1] = newLayout[index]; newLayout[index] = temp;
                                    setWallForm({ ...wallForm, customLayout: newLayout });
                                  }}
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  type="button" variant="ghost" size="icon" className="h-7 w-7 text-red-600 bg-red-50 border border-red-100 hover:bg-red-100"
                                  onClick={() => {
                                    setWallForm(s => ({ ...s, customLayout: s.customLayout.filter((b: any) => b.id !== block.id) }))
                                  }}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-1">
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
                                <div className="space-y-1">
                                  <Label className="text-xs font-semibold">Kurdele Rengi</Label>
                                  <div className="flex gap-2">
                                    <input
                                      type="color"
                                      className="w-8 h-8 rounded shrink-0 p-0 border cursor-pointer"
                                      value={block.ribbonColor || '#000000'}
                                      onChange={(e) => {
                                        const newLayout = [...wallForm.customLayout];
                                        newLayout[index].ribbonColor = e.target.value;
                                        setWallForm({ ...wallForm, customLayout: newLayout });
                                      }}
                                    />
                                    <Input
                                      className="h-8 text-xs font-mono bg-white flex-1"
                                      value={block.ribbonColor || ''}
                                      onChange={(e) => {
                                        const newLayout = [...wallForm.customLayout];
                                        newLayout[index].ribbonColor = e.target.value;
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
                                            <h3 className="absolute inset-0 flex items-center justify-center text-xs md:text-sm font-black tracking-wide text-white px-2 text-center" style={{ fontFamily: "'Nunito', 'Segoe UI', system-ui, sans-serif", textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 -1px 1px rgba(255,255,255,0.4)' }}>
                                              {block.title}
                                            </h3>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="px-6 py-1 rounded-sm border-b-4 border-r-[3px] border-black/30 flex items-center gap-2 shadow-xl whitespace-nowrap" style={{ backgroundColor: block.ribbonColor || '#c40000' }}>
                                          <h3 className="text-lg md:text-xl font-black tracking-wide text-white" style={{ fontFamily: "'Nunito', 'Segoe UI', system-ui, sans-serif", textShadow: '0 2px 4px rgba(0,0,0,0.4), 0 -1px 1px rgba(255,255,255,0.2)' }}>
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
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0 border-0 bg-transparent rounded-2xl shadow-2xl">
          <div className="bg-white h-full flex flex-col sm:flex-row">

            {/* LEFT COLUMN - CONTENT & SETTINGS */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-gray-50/50">
              <div className="mb-6">
                <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-500 flex items-center gap-2">
                  <Pencil className="w-6 h-6 text-yellow-500" />
                  Not Düzenle
                </DialogTitle>
                <DialogDescription className="text-gray-500 mt-1">
                  Mevcut duyuruyu güncelleyin veya onay durumunu değiştirin.
                </DialogDescription>
              </div>

              <div className="space-y-6">
                {/* Category */}
                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-sm font-semibold text-gray-700">Kategori (Duvar) *</Label>
                  <Select
                    value={postitForm.categoryId}
                    onValueChange={(value) => setPostitForm({ ...postitForm, categoryId: value })}
                  >
                    <SelectTrigger className="bg-white border-gray-200 shadow-sm focus:ring-yellow-400">
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        const flatten = (cats: any[], depth = 0): any[] => {
                          return cats.reduce((acc, cat) => {
                            acc.push({ ...cat, depth })
                            if (cat.children) {
                              acc.push(...flatten(cat.children, depth + 1))
                            }
                            return acc
                          }, [])
                        }
                        const buildHierarchy = (items: any[]) => {
                          const rootItems = items.filter(i => !i.parentId)
                          const findChildren = (parent: any) => {
                            const children = items.filter(i => i.parentId === parent.id)
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
                <div className="space-y-1.5">
                  <Label htmlFor="content" className="text-sm font-semibold text-gray-700">İçerik *</Label>
                  <Textarea
                    id="content"
                    value={postitForm.content}
                    onChange={(e) => setPostitForm({ ...postitForm, content: e.target.value })}
                    placeholder="Aklınızdakileri buraya dökün..."
                    className="bg-white border-gray-200 shadow-sm focus:ring-yellow-400 resize-none rounded-xl"
                    rows={4}
                    maxLength={500}
                    required
                  />
                  <div className="flex justify-end p-1">
                    <span className={`text-xs ${postitForm.content.length > 450 ? 'text-orange-500 font-bold' : 'text-gray-400'}`}>
                      {postitForm.content.length}/500
                    </span>
                  </div>
                </div>

                {/* Expiration */}
                <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <div className="space-y-1.5">
                    <Label htmlFor="expires" className="text-xs font-semibold text-gray-500">Gösterim Süresi *</Label>
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
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Süre seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Gün</SelectItem>
                        <SelectItem value="3">3 Gün</SelectItem>
                        <SelectItem value="7">1 Hafta</SelectItem>
                        <SelectItem value="30">1 Ay</SelectItem>
                        <SelectItem value="custom">Tarihine kadar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-500">Bitiş Tarihi</Label>
                    <Input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={postitForm.expiresAtDate}
                      onChange={(e) => setPostitForm({ ...postitForm, expiresAtDate: e.target.value })}
                      required
                      readOnly={postitForm.expiresInDays !== 'custom'}
                      className={`h-9 ${postitForm.expiresInDays !== 'custom' ? 'bg-gray-50 cursor-not-allowed text-gray-500' : ''}`}
                    />
                  </div>
                </div>

                {/* Link */}
                <div className="space-y-1.5">
                  <Label htmlFor="link" className="text-sm font-semibold text-gray-700">Bağlantı URL (Opsiyonel)</Label>
                  <Input
                    id="link"
                    type="url"
                    value={postitForm.link}
                    onChange={(e) => setPostitForm({ ...postitForm, link: e.target.value })}
                    className="bg-white border-gray-200 shadow-sm focus:ring-yellow-400"
                    placeholder="https://example.com"
                  />
                </div>

                {/* Publish & Approve settings for Admins */}
                <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isApproved"
                      checked={postitForm.isApproved}
                      onCheckedChange={(checked) => setPostitForm({ ...postitForm, isApproved: checked === true })}
                    />
                    <label htmlFor="isApproved" className="text-sm font-semibold text-gray-700 cursor-pointer">
                      Onaylı
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isPublished"
                      checked={postitForm.isPublished}
                      onCheckedChange={(checked) => setPostitForm({ ...postitForm, isPublished: checked === true })}
                    />
                    <label htmlFor="isPublished" className="text-sm font-semibold text-gray-700 cursor-pointer">
                      Yayında
                    </label>
                  </div>
                </div>

                {/* Images */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-gray-500" />
                      Resimler
                    </Label>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{postitForm.imageUrls.length}/5</span>
                  </div>

                  {postitForm.imageUrls.length > 0 && (
                    <div className="grid grid-cols-5 gap-2 mt-2 mb-2">
                      {postitForm.imageUrls.map((url, index) => (
                        <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-sm transform transition duration-300 hover:scale-105">
                          <img src={url} alt={`Resim ${index + 1}`} className="w-full h-full object-cover" />
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

                  {postitForm.imageUrls.length < 5 && (
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full h-16 border-dashed border-2 flex flex-col gap-1 items-center justify-center text-gray-500 bg-gray-50 hover:text-gray-800 hover:bg-gray-100 hover:border-gray-400 rounded-lg transition-colors border-gray-200"
                        onClick={() => document.getElementById('admin-edit-image-upload')?.click()}
                        disabled={uploadingPostitImage}
                      >
                        {uploadingPostitImage ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        <span className="text-xs font-medium">Bırakın veya Seçin</span>
                      </Button>
                      <Input
                        id="admin-edit-image-upload"
                        type="file"
                        accept="image/*"
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
            <div className="w-full sm:w-[380px] bg-white border-l border-gray-100 p-6 md:p-8 overflow-y-auto flex flex-col justify-between">
              <div className="space-y-8">
                {/* Preview Block */}
                <div>
                  <Label className="text-sm font-bold text-gray-800 tracking-wide uppercase mb-3 block">Önizleme</Label>
                  <div className="p-8 rounded-2xl bg-[#E8E8E8] shadow-inner flex items-center justify-center border border-gray-200 pattern-isometric pattern-gray-200 pattern-size-4">
                    <div className={`
                      w-44 h-44 relative shadow-2xl transform rotate-2 hover:rotate-0 transition-all duration-300
                      flex flex-col items-center justify-center p-4 text-center group
                      ${colors.find(c => c.value === postitForm.color)?.bg || 'bg-yellow-200'}
                    `}>
                      <div className="absolute top-0 bottom-0 left-0 border-l-[3px] border-black/5 mix-blend-multiply pointer-events-none" />

                      {postitForm.pushpin && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 w-8 h-8 drop-shadow-lg group-hover:-translate-y-1 transition-transform">
                          <img src={pushpinOptions.find(p => p.value === postitForm.pushpin)?.image || '/pushpins/red.png'} alt="pin" className="w-full h-full object-contain" />
                        </div>
                      )}

                      <p className={`
                        text-sm opacity-80 overflow-hidden leading-relaxed
                        ${fonts.find(f => f.value === postitForm.font)?.class || 'font-handwriting'}
                      `}
                        style={{
                          WebkitLineClamp: 5,
                          display: '-webkit-box',
                          WebkitBoxOrient: 'vertical',
                          wordBreak: 'break-word'
                        }}
                      >
                        {postitForm.content || 'Aklınızdaki harika fikri buraya yazın...'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Color */}
                <div>
                  <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Kağıt Rengi</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {colors.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setPostitForm({ ...postitForm, color: color.value })}
                        className={`
                          ${color.bg} border-2 aspect-square rounded-full transition-all transform hover:scale-110 shadow-sm
                          ${postitForm.color === color.value ? 'border-gray-800 ring-2 ring-gray-800 ring-offset-2 scale-110' : 'border-transparent'}
                        `}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Font */}
                <div>
                  <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Yazı Karakteri</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {fonts.map((font) => (
                      <button
                        key={font.value}
                        type="button"
                        onClick={() => setPostitForm({ ...postitForm, font: font.value })}
                        className={`
                          h-9 rounded-lg border flex items-center justify-center transition-all bg-white
                          ${postitForm.font === font.value ? 'border-gray-800 ring-1 ring-gray-800 bg-gray-50 font-bold shadow-sm' : 'border-gray-200 text-gray-600 hover:border-gray-400'}
                          ${font.class} text-sm
                        `}
                      >
                        {font.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pin */}
                <div>
                  <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">İğne Modeli</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {pushpinOptions.map((pin) => (
                      <button
                        key={pin.value}
                        type="button"
                        onClick={() => setPostitForm({ ...postitForm, pushpin: pin.value })}
                        className={`
                          aspect-square rounded-xl bg-gray-50 border flex items-center justify-center transition-all group hover:bg-white hover:shadow-sm
                          ${postitForm.pushpin === pin.value ? 'border-gray-800 ring-1 ring-gray-800 bg-white shadow-sm' : 'border-gray-100'}
                        `}
                        title={pin.label}
                      >
                        <img
                          src={pin.image}
                          alt={pin.label}
                          className={`w-6 h-6 object-contain filter transition-transform group-hover:scale-110 ${postitForm.pushpin === pin.value ? 'drop-shadow-md' : 'drop-shadow-sm'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-white">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowPostitModal(false)}
                  className="text-gray-500 hover:text-gray-800 font-medium"
                >
                  İptal Et
                </Button>
                <Button
                  onClick={handleSavePostit}
                  className="bg-gray-900 hover:bg-black text-white px-6 font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  Kaydet
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Slider Modal */}
      <Dialog open={showSliderModal} onOpenChange={setShowSliderModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Slayder Düzenle' : 'Yeni Slayder Ekle'}</DialogTitle>
            <DialogDescription>
              En fazla 5 adet resim URL'si ekleyebilirsiniz. Bir duvar (kategori) seçerek onun sayfasında görünmesini sağlayın.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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

            <div className="space-y-3">
              <Label>Resim Linkleri veya Yükleme (Maksimum 5)</Label>
              {sliderForm.images.map((img, index) => (
                <div key={index} className="flex gap-2 items-center">
                  {img && (
                    <div className="w-10 h-10 flex-shrink-0 rounded overflow-hidden border border-gray-200">
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
                    />
                    {img && (
                      <Input
                        placeholder="Yönlendirme Linki (Tıklanınca Açılacak URL - Opsiyonel)"
                        value={sliderForm.links[index]}
                        onChange={(e) => {
                          const newLinks = [...sliderForm.links];
                          newLinks[index] = e.target.value;
                          setSliderForm({ ...sliderForm, links: newLinks });
                        }}
                      />
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingSliderImage}
                      onClick={() => document.getElementById(`slider-img-upload-${index}`)?.click()}
                      className="truncate"
                    >
                      {uploadingSliderImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />} Dosya Seç
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
    </div >
  )
}
