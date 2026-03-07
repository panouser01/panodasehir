'use client'

import { useEffect, useState } from 'react'
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
import { RichEditor } from '@/components/ui/rich-editor'
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
  const [stats, setStats] = useState({ users: 0, postits: 0, pendingPostits: 0, walls: 0 })
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard')
  const [calendarCategories, setCalendarCategories] = useState<any[]>([])
  const [showCalendarCategoryModal, setShowCalendarCategoryModal] = useState(false)
  const [calendarCategoryForm, setCalendarCategoryForm] = useState({ name: '', order: 0, globalEntries: [] as any[] })
  const [selectedGlobalCalendarDate, setSelectedGlobalCalendarDate] = useState<string>(new Date().toISOString().split('T')[0])

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
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'USER', userGroupId: '' })
  const [wallForm, setWallForm] = useState({
    name: '',
    description: '',
    wallManagerId: '',
    userGroupId: '',
    parentId: '',
    cityId: '',
    districtId: '',
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
    calendarEntries: [] as any[]
  })
  const [postitForm, setPostitForm] = useState({ content: '', categoryId: '', color: 'YELLOW', font: 'HANDWRITING', pushpin: 'RED', link: '', isApproved: false, isPublished: true, imageUrl: '', imageUrls: [] as string[], expiresInDays: 'custom', expiresAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] })
  const [uploadingPostitImage, setUploadingPostitImage] = useState(false)
  const [roleForm, setRoleForm] = useState({ name: '', description: '' })
  const [sliderForm, setSliderForm] = useState({ categoryId: '', images: ['', '', '', '', ''], links: ['', '', '', '', ''], backgroundColor: '#f8f9fa', backgroundImage: '', isGradient: false, heroGradientFrom: '#facc15', heroGradientVia: '#f472b6', heroGradientTo: '#a855f7', isActive: true })
  const [userGroupForm, setUserGroupForm] = useState({ name: '', description: '' })

  // Postit search and filter states
  const [postitSearch, setPostitSearch] = useState('')
  const [postitStatusFilter, setPostitStatusFilter] = useState<'all' | 'published' | 'unpublished' | 'pending'>('pending')
  const [userSearch, setUserSearch] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['appearance']))

  // Wall search and hierarchy states
  const [wallSearch, setWallSearch] = useState('')
  const [expandedWalls, setExpandedWalls] = useState<Set<string>>(new Set())
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
    categoryFont: 'sans-serif',
    categoryColor: '#1f2937',
    categoryBgColor: '#ffffff'
  })
  const [editingAppearanceWall, setEditingAppearanceWall] = useState<any>(null)
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
    aboutContent: '',
    contactContent: '',
    termsContent: '',
    privacyContent: '',
    cookiesContent: '',
    helpContent: '',
    kvkkContent: '',
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
  const [uploadingAppearanceImage, setUploadingAppearanceImage] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    const role = (session?.user as any)?.role
    if (status === 'authenticated' && role !== 'SUPER_ADMIN' && role !== 'WALL_MANAGER') {
      toast.error('Bu sayfaya erişim yetkiniz yok')
      router.push('/')
      return
    }

    if (status === 'authenticated') {
      loadData()
    }
  }, [status, session, router])

  const loadData = async () => {
    try {
      setLoading(true)
      const [usersRes, postitsRes, wallsRes, rolesRes, slidersRes, locationsRes, settingsRes] = await Promise.all([
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

      const usersData = await usersRes.json()
      const postitsData = await postitsRes.json()
      const wallsData = await wallsRes.json()
      const rolesData = await rolesRes.json()
      const slidersData = await slidersRes.json()
      const locationsData = await locationsRes.json()
      const settingsData = await settingsRes.json()
      const calendarCategoriesData = await (await fetch('/api/calendar-categories')).json()

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

      if (userRole === 'WALL_MANAGER') {
        const managedIds = new Set<string>()
        allWalls.forEach((cat: any) => {
          if (cat.wallManagerId === currentUserId) {
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
      setUserForm({ name: '', email: '', password: '', role: 'USER', userGroupId: '' })
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
        wallManagerId: wallForm.wallManagerId || null,
        userGroupId: wallForm.userGroupId || null,
        parentId: wallForm.parentId || null,
        cityId: wallForm.cityId || null,
        districtId: wallForm.districtId || null,
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
        calendarEntries: wallForm.calendarEntries || []
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
      setEditingItem(data.category) // Keep modal editing the saved/newly created item
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
    if (!confirm('Bu notu silmek istediğinizden emin misiniz?')) return
    try {
      const response = await fetch(`/api/postits/${postitId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Silme başarısız')
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
      setSliderForm({ categoryId: '', images: ['', '', '', '', ''], links: ['', '', '', '', ''], backgroundColor: '#f8f9fa', backgroundImage: '', isGradient: false, heroGradientFrom: '#facc15', heroGradientVia: '#f472b6', heroGradientTo: '#a855f7', isActive: true })
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
    setUserForm({ name: user.name, email: user.email, password: '', role: user.role, userGroupId: user.userGroupId || '' })
    setShowUserModal(true)
  }

  const openEditWall = (wall: any) => {
    setEditingItem(wall)
    setWallForm({
      name: wall.name,
      description: wall.description || '',
      wallManagerId: wall.wallManagerId || '',
      userGroupId: wall.userGroupId || '',
      parentId: wall.parentId || '',
      cityId: wall.cityId || '',
      districtId: wall.districtId || '',
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
      calendarEntries: wall.calendarEntries || []
    })
    setShowWallModal(true)
  }

  const openAddSubcategory = (parentWall: any) => {
    setEditingItem(null)
    setParentWallForSubcategory(parentWall)
    setWallForm({
      name: '',
      description: '',
      wallManagerId: '',
      userGroupId: '',
      parentId: parentWall.id,
      cityId: '',
      districtId: '',
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
      calendarEntries: []
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
    setUserForm({ name: '', email: '', password: '', role: 'USER', userGroupId: '' })
    setShowUserModal(true)
  }

  const openAddWall = () => {
    setEditingItem(null)
    setParentWallForSubcategory(null)
    setWallForm({
      name: '',
      description: '',
      wallManagerId: '',
      userGroupId: '',
      parentId: '',
      cityId: '',
      districtId: '',
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
      calendarEntries: []
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
      isActive: slider.isActive
    })
    setShowSliderModal(true)
  }

  const openAddSlider = () => {
    setEditingItem(null)
    setSliderForm({ categoryId: '', images: ['', '', '', '', ''], links: ['', '', '', '', ''], backgroundColor: '#f8f9fa', backgroundImage: '', isGradient: false, heroGradientFrom: '#facc15', heroGradientVia: '#f472b6', heroGradientTo: '#a855f7', isActive: true })
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
      categoryBgColor: wall.categoryBgColor || '#ffffff'
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
        setCalendarCategoryForm({ name: '', order: 0, globalEntries: [] })
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
    setCalendarCategoryForm({ name: '', order: 0, globalEntries: [] })
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
    setCalendarCategoryForm({ name: cat.name, order: cat.order, globalEntries: parsedEntries })
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
      label: 'Site Görünümü',
      icon: Palette,
      children: [
        { id: 'settings', label: 'Site Görseli', icon: Settings },
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
    { id: 'sliders', label: 'Slayder Ayarları', icon: ImageIcon },
    { id: 'users', label: 'Kullanıcılar', icon: Users },
    { id: 'roles', label: 'Yetki Türü Tanımla', icon: Shield },
    { id: 'groups', label: 'Kullanıcı Grupları', icon: UserGroupIcon },
    { id: 'postits', label: 'Notlar', icon: StickyNote },
  ].filter(item => {
    if (role === 'SUPER_ADMIN') return true
    if (role === 'WALL_MANAGER') {
      return ['dashboard', 'walls', 'postits'].includes(item.id)
    }
    return false
  })

  const wallManagers = users.filter(u => u.role === 'WALL_MANAGER' || u.role === 'SUPER_ADMIN')
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

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">📌 Panoda Şehir</h1>
          <p className="text-sm text-gray-400">Admin Paneli</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
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
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
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
      <main className="flex-1 p-8 overflow-auto">
        {/* Dashboard */}
        {activeSection === 'dashboard' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-gray-500 mb-2">Toplam Kullanıcı</div>
                <div className="text-3xl font-bold">{stats.users}</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-gray-500 mb-2">Toplam Duvar</div>
                <div className="text-3xl font-bold">{stats.walls}</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-gray-500 mb-2">Onay Bekleyenler</div>
                <div className="text-3xl font-bold text-yellow-600">{stats.pendingPostits}</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-gray-500 mb-2">Onaylı Post-itler</div>
                <div className="text-3xl font-bold text-green-600">{stats.postits}</div>
              </div>
            </div>
          </div>
        )}

        {/* Site Settings */}
        {activeSection === 'settings' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Site Görünümü Ayarları</h2>
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
              <div className="space-y-6 bg-white p-6 rounded-lg shadow border">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Post-it Pano Görünümü (Mantar Pano)</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 pt-2 pb-2">
                      <Checkbox
                        id="isWallTransparent"
                        checked={siteSettings.isWallTransparent}
                        onCheckedChange={(checked) => setSiteSettings(s => ({ ...s, isWallTransparent: !!checked }))}
                      />
                      <Label htmlFor="isWallTransparent" className="cursor-pointer font-bold text-blue-600">Arka Plan Transparan Olsun</Label>
                    </div>

                    <div className={siteSettings.isWallTransparent ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}>
                      <div className="flex items-center space-x-2 pt-2 pb-2">
                        <Checkbox
                          id="siteIsGradient"
                          checked={siteSettings.isGradient}
                          onCheckedChange={(checked) => setSiteSettings(s => ({ ...s, isGradient: !!checked }))}
                        />
                        <Label htmlFor="siteIsGradient" className="cursor-pointer font-semibold">Panoda Renk Kullan</Label>
                      </div>

                      {!siteSettings.isGradient ? (
                        <div className="space-y-2">
                          <Label>Arka Plan Rengi</Label>
                          <div className="flex gap-2">
                            <Input type="color" className="w-12 p-1 h-10 cursor-pointer" value={siteSettings.backgroundColor} onChange={e => setSiteSettings(s => ({ ...s, backgroundColor: e.target.value }))} />
                            <Input value={siteSettings.backgroundColor} onChange={e => setSiteSettings(s => ({ ...s, backgroundColor: e.target.value }))} />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <div className="space-y-2">
                            <Label className="text-xs">Başlangıç</Label>
                            <div className="flex gap-1">
                              <Input type="color" className="w-10 h-8 p-1 cursor-pointer" value={siteSettings.gradientFrom || '#facc15'} onChange={(e) => setSiteSettings({ ...siteSettings, gradientFrom: e.target.value })} />
                              <Input className="font-mono text-xs h-8" value={siteSettings.gradientFrom || '#facc15'} onChange={(e) => setSiteSettings({ ...siteSettings, gradientFrom: e.target.value })} />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Orta</Label>
                            <div className="flex gap-1">
                              <Input type="color" className="w-10 h-8 p-1 cursor-pointer" value={siteSettings.gradientVia || '#f472b6'} onChange={(e) => setSiteSettings({ ...siteSettings, gradientVia: e.target.value })} />
                              <Input className="font-mono text-xs h-8" value={siteSettings.gradientVia || '#f472b6'} onChange={(e) => setSiteSettings({ ...siteSettings, gradientVia: e.target.value })} />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Bitiş</Label>
                            <div className="flex gap-1">
                              <Input type="color" className="w-10 h-8 p-1 cursor-pointer" value={siteSettings.gradientTo || '#a855f7'} onChange={(e) => setSiteSettings({ ...siteSettings, gradientTo: e.target.value })} />
                              <Input className="font-mono text-xs h-8" value={siteSettings.gradientTo || '#a855f7'} onChange={(e) => setSiteSettings({ ...siteSettings, gradientTo: e.target.value })} />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Arka Plan Dokusu Resmi (Mantarımsı transparan doku) URL</Label>
                        <div className="flex gap-2">
                          <Input value={siteSettings.backgroundImage} placeholder="https://www.transparenttextures.com/patterns/cork-board.png" onChange={e => setSiteSettings(s => ({ ...s, backgroundImage: e.target.value }))} />
                          <div className="flex-shrink-0">
                            <Button
                              type="button"
                              variant="outline"
                              disabled={uploadingSiteImage}
                              onClick={() => document.getElementById('site-bg-upload')?.click()}
                            >
                              {uploadingSiteImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            </Button>
                            <input
                              id="site-bg-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleSiteImageUpload}
                              className="hidden"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 pt-4 pb-2">
                        <Checkbox
                          id="noBorder"
                          checked={siteSettings.noBorder}
                          onCheckedChange={(checked) => setSiteSettings(s => ({ ...s, noBorder: !!checked }))}
                        />
                        <label
                          htmlFor="noBorder"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          Çerçeve Yok
                        </label>
                      </div>

                      <div className={`grid grid-cols-2 gap-4 ${siteSettings.noBorder ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="space-y-2">
                          <Label>Dış Çerçeve (Sağ) Rengi</Label>
                          <div className="flex gap-2">
                            <Input type="color" className="w-12 p-1 h-10 cursor-pointer" value={siteSettings.borderColor} onChange={e => setSiteSettings(s => ({ ...s, borderColor: e.target.value }))} />
                            <Input value={siteSettings.borderColor} onChange={e => setSiteSettings(s => ({ ...s, borderColor: e.target.value }))} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Üst ve Sol Çerçeve Rengi</Label>
                          <div className="flex gap-2">
                            <Input type="color" className="w-12 p-1 h-10 cursor-pointer" value={siteSettings.borderTopColor} onChange={e => setSiteSettings(s => ({ ...s, borderTopColor: e.target.value }))} />
                            <Input value={siteSettings.borderTopColor} onChange={e => setSiteSettings(s => ({ ...s, borderTopColor: e.target.value }))} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Alt Çerçeve Rengi</Label>
                          <div className="flex gap-2">
                            <Input type="color" className="w-12 p-1 h-10 cursor-pointer" value={siteSettings.borderBottomColor} onChange={e => setSiteSettings(s => ({ ...s, borderBottomColor: e.target.value }))} />
                            <Input value={siteSettings.borderBottomColor} onChange={e => setSiteSettings(s => ({ ...s, borderBottomColor: e.target.value }))} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 bg-white p-6 rounded-lg shadow border mt-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Site Genel Arka Planı (Zemin)</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Zemin Resmi (opsiyonel)</Label>
                        <div className="flex gap-2">
                          <Input
                            value={siteSettings.siteBackgroundImage || ''}
                            onChange={(e) => setSiteSettings({ ...siteSettings, siteBackgroundImage: e.target.value })}
                            placeholder="URL veya dosya yükleyin"
                          />
                          <div className="flex-shrink-0">
                            <Button
                              type="button"
                              variant="outline"
                              disabled={uploadingSiteBackgroundImage}
                              onClick={() => document.getElementById('site-global-bg-upload')?.click()}
                            >
                              {uploadingSiteBackgroundImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            </Button>
                            <input
                              id="site-global-bg-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleSiteBackgroundImageUpload}
                              className="hidden"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">Sitenin genel arka planında görüntülenecek zemin görseli.</p>
                      </div>

                      <div className="flex items-center space-x-2 pt-2 pb-2">
                        <Checkbox
                          id="siteGroundIsGradient"
                          checked={siteSettings.siteIsGradient}
                          onCheckedChange={(checked) => setSiteSettings(s => ({ ...s, siteIsGradient: !!checked }))}
                        />
                        <Label htmlFor="siteGroundIsGradient" className="cursor-pointer font-semibold">Zeminde Renk/Gradyan Kullan</Label>
                      </div>

                      {!siteSettings.siteIsGradient ? (
                        <div className="space-y-2">
                          <Label>Arka Plan Rengi</Label>
                          <div className="flex gap-2">
                            <Input type="color" className="w-12 p-1 h-10 cursor-pointer" value={siteSettings.siteBackgroundColor || '#fffbeb'} onChange={e => setSiteSettings(s => ({ ...s, siteBackgroundColor: e.target.value }))} />
                            <Input value={siteSettings.siteBackgroundColor || '#fffbeb'} onChange={e => setSiteSettings(s => ({ ...s, siteBackgroundColor: e.target.value }))} />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <div className="space-y-2">
                            <Label className="text-xs">Başlangıç</Label>
                            <div className="flex gap-1">
                              <Input type="color" className="w-10 h-8 p-1 cursor-pointer" value={siteSettings.siteGradientFrom || '#fffbeb'} onChange={(e) => setSiteSettings({ ...siteSettings, siteGradientFrom: e.target.value })} />
                              <Input className="font-mono text-xs h-8" value={siteSettings.siteGradientFrom || '#fffbeb'} onChange={(e) => setSiteSettings({ ...siteSettings, siteGradientFrom: e.target.value })} />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Orta</Label>
                            <div className="flex gap-1">
                              <Input type="color" className="w-10 h-8 p-1 cursor-pointer" value={siteSettings.siteGradientVia || '#fefce8'} onChange={(e) => setSiteSettings({ ...siteSettings, siteGradientVia: e.target.value })} />
                              <Input className="font-mono text-xs h-8" value={siteSettings.siteGradientVia || '#fefce8'} onChange={(e) => setSiteSettings({ ...siteSettings, siteGradientVia: e.target.value })} />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Bitiş</Label>
                            <div className="flex gap-1">
                              <Input type="color" className="w-10 h-8 p-1 cursor-pointer" value={siteSettings.siteGradientTo || '#fff7ed'} onChange={(e) => setSiteSettings({ ...siteSettings, siteGradientTo: e.target.value })} />
                              <Input className="font-mono text-xs h-8" value={siteSettings.siteGradientTo || '#fff7ed'} onChange={(e) => setSiteSettings({ ...siteSettings, siteGradientTo: e.target.value })} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              <div className="space-y-6 bg-white p-6 rounded-lg shadow border mt-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Ana Sayfa Kapak (Hero) Görünümü</h3>
                  <div className="space-y-4">

                    {/* Hero Settings */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Zemin Resmi (opsiyonel)</Label>
                        <div className="flex gap-2">
                          <Input
                            value={siteSettings.heroBackgroundImage || ''}
                            onChange={(e) => setSiteSettings({ ...siteSettings, heroBackgroundImage: e.target.value })}
                            placeholder="URL veya dosya yükleyin"
                          />
                          <div className="flex-shrink-0">
                            <Button
                              type="button"
                              variant="outline"
                              disabled={uploadingSiteHeroImage}
                              onClick={() => document.getElementById('site-hero-upload')?.click()}
                            >
                              {uploadingSiteHeroImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            </Button>
                            <input
                              id="site-hero-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleSiteHeroImageUpload}
                              className="hidden"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">Resim varsa gradyan kullanılmaz</p>
                      </div>

                      <div className="space-y-2">
                        <Label>Alt Başlık Metni</Label>
                        <Input
                          value={siteSettings.heroSubtitle || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, heroSubtitle: e.target.value })}
                          placeholder="Fikirlerinizi paylaşın..."
                        />
                      </div>
                    </div>

                    {/* Gradient Colors */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Gradyan Başlangıç</Label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={siteSettings.heroGradientFrom || '#facc15'}
                            onChange={(e) => setSiteSettings({ ...siteSettings, heroGradientFrom: e.target.value })}
                            className="w-10 h-10 rounded cursor-pointer"
                          />
                          <Input
                            value={siteSettings.heroGradientFrom || '#facc15'}
                            onChange={(e) => setSiteSettings({ ...siteSettings, heroGradientFrom: e.target.value })}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Gradyan Orta</Label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={siteSettings.heroGradientVia || '#f472b6'}
                            onChange={(e) => setSiteSettings({ ...siteSettings, heroGradientVia: e.target.value })}
                            className="w-10 h-10 rounded cursor-pointer"
                          />
                          <Input
                            value={siteSettings.heroGradientVia || '#f472b6'}
                            onChange={(e) => setSiteSettings({ ...siteSettings, heroGradientVia: e.target.value })}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Gradyan Bitiş</Label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={siteSettings.heroGradientTo || '#a855f7'}
                            onChange={(e) => setSiteSettings({ ...siteSettings, heroGradientTo: e.target.value })}
                            className="w-10 h-10 rounded cursor-pointer"
                          />
                          <Input
                            value={siteSettings.heroGradientTo || '#a855f7'}
                            onChange={(e) => setSiteSettings({ ...siteSettings, heroGradientTo: e.target.value })}
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
                            value={siteSettings.heroAlignment || 'left'}
                            onValueChange={(value) => setSiteSettings({ ...siteSettings, heroAlignment: value })}
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
                            value={siteSettings.heroTitleFont || 'sans-serif'}
                            onValueChange={(value) => setSiteSettings({ ...siteSettings, heroTitleFont: value })}
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
                              value={siteSettings.heroTitleColor || '#ffffff'}
                              onChange={(e) => setSiteSettings({ ...siteSettings, heroTitleColor: e.target.value })}
                              className="w-10 h-10 rounded cursor-pointer"
                            />
                            <Input
                              value={siteSettings.heroTitleColor || '#ffffff'}
                              onChange={(e) => setSiteSettings({ ...siteSettings, heroTitleColor: e.target.value })}
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Boyut</Label>
                          <Select
                            value={siteSettings.heroTitleSize || '5xl'}
                            onValueChange={(value) => setSiteSettings({ ...siteSettings, heroTitleSize: value })}
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
                            value={siteSettings.heroSubtitleFont || 'sans-serif'}
                            onValueChange={(value) => setSiteSettings({ ...siteSettings, heroSubtitleFont: value })}
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
                              value={siteSettings.heroSubtitleColor || '#ffffff'}
                              onChange={(e) => setSiteSettings({ ...siteSettings, heroSubtitleColor: e.target.value })}
                              className="w-10 h-10 rounded cursor-pointer"
                            />
                            <Input
                              value={siteSettings.heroSubtitleColor || '#ffffff'}
                              onChange={(e) => setSiteSettings({ ...siteSettings, heroSubtitleColor: e.target.value })}
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Boyut</Label>
                          <Select
                            value={siteSettings.heroSubtitleSize || 'xl'}
                            onValueChange={(value) => setSiteSettings({ ...siteSettings, heroSubtitleSize: value })}
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

                    {/* Nav Menu Settings */}
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Menu className="w-4 h-4" /> Kategori Menü Görünümü
                      </h4>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>Menü Zemini</Label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={siteSettings.navMenuBgColor || '#ffffff'}
                              onChange={(e) => setSiteSettings({ ...siteSettings, navMenuBgColor: e.target.value })}
                              className="w-10 h-10 rounded cursor-pointer"
                            />
                            <Input
                              value={siteSettings.navMenuBgColor || '#ffffff'}
                              onChange={(e) => setSiteSettings({ ...siteSettings, navMenuBgColor: e.target.value })}
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Yazı Rengi</Label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={siteSettings.navMenuTextColor || '#111827'}
                              onChange={(e) => setSiteSettings({ ...siteSettings, navMenuTextColor: e.target.value })}
                              className="w-10 h-10 rounded cursor-pointer"
                            />
                            <Input
                              value={siteSettings.navMenuTextColor || '#111827'}
                              onChange={(e) => setSiteSettings({ ...siteSettings, navMenuTextColor: e.target.value })}
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Font</Label>
                          <Select
                            value={siteSettings.navMenuFont || 'sans-serif'}
                            onValueChange={(value) => setSiteSettings({ ...siteSettings, navMenuFont: value })}
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
                          <Label>Yazı Boyutu (px)</Label>
                          <Select
                            value={String(siteSettings.navMenuFontSize || 14)}
                            onValueChange={(value) => setSiteSettings({ ...siteSettings, navMenuFontSize: parseInt(value) })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[12, 13, 14, 15, 16, 17, 18, 20, 22, 24].map(size => (
                                <SelectItem key={size} value={String(size)}>{size}px</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2 flex flex-col justify-end">
                          <div className="flex items-center space-x-2 py-2">
                            <Checkbox
                              id="navMenuMainBold"
                              checked={siteSettings.navMenuMainBold}
                              onCheckedChange={(checked) => setSiteSettings(s => ({ ...s, navMenuMainBold: !!checked }))}
                            />
                            <Label htmlFor="navMenuMainBold" className="cursor-pointer">Ana Kategoriler Kalın</Label>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label className="block mb-2 text-sm text-gray-700">Canlı Önizleme</Label>
              <div className="w-full flex-1 rounded-sm relative p-4 md:p-8 flex"
                style={{
                  backgroundColor: siteSettings.backgroundColor,
                  backgroundImage: `url("${siteSettings.backgroundImage}")`,
                  border: siteSettings.noBorder ? '0px' : `18px solid ${siteSettings.borderColor}`,
                  borderBottomColor: siteSettings.noBorder ? 'transparent' : siteSettings.borderBottomColor,
                  borderRightColor: siteSettings.noBorder ? 'transparent' : siteSettings.borderBottomColor,
                  borderTopColor: siteSettings.noBorder ? 'transparent' : siteSettings.borderTopColor,
                  borderLeftColor: siteSettings.noBorder ? 'transparent' : siteSettings.borderTopColor,
                  boxShadow: 'inset 0 0 30px rgba(0,0,0,0.6), 0 15px 25px rgba(0,0,0,0.15)',
                  minHeight: '400px'
                }}
              >
                <p className="m-auto text-xl opacity-50 bg-white/40 px-4 py-2 rounded shadow">Pano Detay Alanı</p>
              </div>
            </div>
          </div>
        )}

        {/* Info Pages Placeholder */}
        {['about', 'contact', 'terms', 'privacy', 'cookies', 'help', 'kvkk'].includes(activeSection) && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
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

            <div className="bg-white p-6 rounded-lg shadow border">
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Popüler Kategorileri Yönet</h2>
              <Button onClick={handleSaveSiteSettings} disabled={savingSettings}>
                {savingSettings && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Düzeni Kaydet
              </Button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
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
                  <div className="p-8 text-center text-gray-400 border-2 border-dashed rounded-lg">
                    Henüz bir link eklenmemiş. "Ekle" butonunu kullanarak yeni linkler tanımlayabilirsiniz.
                  </div>
                ) : (
                  siteSettings.popularLinks.map((link, idx) => (
                    <div key={idx} className="flex gap-4 items-end bg-gray-50 p-4 rounded-lg border">
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Keşfet Bölümünü Yönet</h2>
              <Button onClick={handleSaveSiteSettings} disabled={savingSettings}>
                {savingSettings && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Düzeni Kaydet
              </Button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
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
                  <div className="p-8 text-center text-gray-400 border-2 border-dashed rounded-lg">
                    Henüz bir link eklenmemiş. "Ekle" butonunu kullanarak yeni linkler tanımlayabilirsiniz.
                  </div>
                ) : (
                  siteSettings.discoverLinks.map((link, idx) => (
                    <div key={idx} className="flex gap-4 items-end bg-gray-50 p-4 rounded-lg border">
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Sosyal Medya Hesaplarını Yönet</h2>
              <Button onClick={handleSaveSiteSettings} disabled={savingSettings}>
                {savingSettings && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Ayarları Kaydet
              </Button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
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
                  <div className="p-8 text-center text-gray-400 border-2 border-dashed rounded-lg">
                    Henüz bir hesap eklenmemiş. "Ekle" butonunu kullanarak bağlantılarınızı ekleyebilirsiniz.
                  </div>
                ) : (
                  siteSettings.socialLinks.map((link, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row gap-4 items-end bg-gray-50 p-4 rounded-lg border">
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
            <div className="flex justify-between items-center mb-6">
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
              <div className="space-y-6 bg-white p-6 rounded-lg shadow border">
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

            <div className="mt-8 bg-white p-6 rounded-lg shadow border">
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

              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Sıra</TableHead>
                      <TableHead>Başlık Adı</TableHead>
                      <TableHead className="w-32">Durum</TableHead>
                      <TableHead className="w-24 text-right">İşlemler</TableHead>
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
              <div className="space-y-2">
                <Label htmlFor="catOrder">Görüntüleme Sırası</Label>
                <Input
                  id="catOrder"
                  type="number"
                  value={calendarCategoryForm.order}
                  onChange={(e) => setCalendarCategoryForm({ ...calendarCategoryForm, order: parseInt(e.target.value) || 0 })}
                />
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
            <div className="flex items-center justify-between mb-6">
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
                  if (w.wallManagerId === currentUserId) {
                    managedCats.add(w.id)
                  }
                })
                // If they manage a child but not the parent, the child acts as a root
                if (role === 'WALL_MANAGER') {
                  rootWalls = walls.filter(w =>
                    (w.wallManagerId === currentUserId) &&
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
                    wall.wallManager?.name?.toLowerCase().includes(searchLower)
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

                const filteredRootWalls = filterWalls(rootWalls, wallSearch)

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
                    <div key={wall.id} className={isRoot ? 'bg-white rounded-lg shadow-md overflow-hidden' : ''}>
                      {/* Wall Row */}
                      <div
                        className={`flex items-center justify-between p-3 hover:bg-gray-50 ${!isRoot ? 'border-l-2 border-gray-200' : ''}`}
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
                            {wall.name !== 'Ana Sayfa Duvarı' && (
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">İl İlçe Tanımlama</h2>
                <div className="flex gap-2">
                  <Button onClick={() => openAddLocation('CITY')} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="w-4 h-4" />
                    Yeni İl Ekle
                  </Button>
                  <Button onClick={() => openAddLocation('DISTRICT')} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="w-4 h-4" />
                    Yeni İlçe Ekle
                  </Button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden p-4">
                {/* Location list grouped by City */}
                <div className="space-y-4">
                  {cities.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Henüz hiç il tanımlanmamış.
                    </div>
                  ) : (
                    cities.map((city) => (
                      <div key={city.id} className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{city.name}</h3>
                            <span className="text-sm bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                              {(city._count?.districts) || 0} ilçe
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEditLocation(city, 'CITY')} className="h-8 w-8 p-0">
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteLocation(city.id, 'CITY')} className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                          {districts.filter(d => d.cityId === city.id).map(district => (
                            <div key={district.id} className="bg-white border rounded p-2 flex items-center justify-between group hover:border-blue-300">
                              <span className="text-sm">{district.name}</span>
                              <div className="flex bg-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openEditLocation(district, 'DISTRICT')} className="text-gray-500 hover:text-blue-600 p-1">
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button onClick={() => handleDeleteLocation(district.id, 'DISTRICT')} className="text-gray-500 hover:text-red-600 p-1">
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            onClick={() => openAddLocation('DISTRICT', city.id)}
                            className="bg-gray-50 border border-dashed rounded p-2 flex items-center justify-center text-sm text-gray-500 hover:text-green-600 hover:border-green-300 hover:bg-green-50"
                          >
                            <Plus className="w-4 h-4 mr-1" /> İlçe Ekle
                          </button>
                        </div>
                      </div>
                    ))
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Slayder Yönetimi</h2>
                <Button onClick={openAddSlider} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Yeni Slayder
                </Button>
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Resim Sayısı</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sliders.length > 0 ? (
                      sliders.map((slider) => (
                        <TableRow key={slider.id}>
                          <TableCell className="font-medium">{slider.categoryId ? slider.category?.name : 'Ana Sayfa (Varsayılan)'}</TableCell>
                          <TableCell>{slider.images?.length || 0} resim</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${slider.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {slider.isActive ? 'Aktif' : 'Pasif'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => openEditSlider(slider)}>
                                <Pencil className="w-4 h-4" />
                              </Button>
                              {slider.categoryId && slider.category && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openAppearanceSettings(slider.category)}
                                  title="Kategori Görünüm Ayarları"
                                  className="hover:bg-purple-100 hover:text-purple-600"
                                >
                                  <Palette className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteSlider(slider.id)}
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
                          Henüz slayder eklenmemiş.
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Yetki Türü Tanımla</h2>
                <Button onClick={openAddRole} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Yeni Rol Ekle
                </Button>
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rol Adı</TableHead>
                      <TableHead>Açıklama</TableHead>
                      <TableHead>İşlemler</TableHead>
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Kullanıcı Grupları</h2>
                <Button onClick={openAddUserGroup} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Yeni Grup
                </Button>
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Grup Adı</TableHead>
                      <TableHead>Açıklama</TableHead>
                      <TableHead>Kullanıcı Sayısı</TableHead>
                      <TableHead>İşlemler</TableHead>
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
              <div className="flex items-center justify-between mb-6">
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
                          <TableHeader>
                            <TableRow>
                              <TableHead>Ad</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Yönettiği Duvarlar</TableHead>
                              <TableHead>Not Sayısı</TableHead>
                              <TableHead>İşlemler</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {usersByRole[roleName].map((user) => {
                              const managedWalls = walls.filter(w => w.wallManagerId === user.id)
                              return (
                                <TableRow key={user.id}>
                                  <TableCell className="font-medium">{user.name}</TableCell>
                                  <TableCell>{user.email}</TableCell>
                                  <TableCell>
                                    {managedWalls.length > 0 ? (
                                      <div className="flex flex-wrap gap-1">
                                        {managedWalls.map(w => (
                                          <span key={w.id} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                                            {w.name}
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
              <div className="flex items-center justify-between mb-6">
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
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[30%]">İçerik</TableHead>
                                <TableHead className="w-[15%]">Kullanıcı</TableHead>
                                <TableHead className="w-[10%]">Renk</TableHead>
                                <TableHead className="w-[10%] text-center">Onaylı</TableHead>
                                <TableHead className="w-[10%] text-center">Yayında</TableHead>
                                <TableHead className="w-[12%]">Kayıt Tarihi</TableHead>
                                <TableHead className="w-[13%]">Son Görüntülenme</TableHead>
                                <TableHead className="w-[10%]">İşlemler</TableHead>
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
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeletePostit(postit.id)}
                                        className="hover:bg-red-100 hover:text-red-600"
                                      >
                                        <Trash2 className="w-4 h-4" />
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
              <div className="grid grid-cols-3 gap-4">
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
            <Button variant="outline" onClick={() => setShowLocationModal(false)}>
              İptal
            </Button>
            <Button onClick={handleSaveLocation}>Kaydet</Button>
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
            <Button variant="outline" onClick={() => setShowRoleModal(false)}>
              İptal
            </Button>
            <Button onClick={handleSaveRole}>Kaydet</Button>
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
            <Button variant="outline" onClick={() => setShowUserGroupModal(false)}>
              İptal
            </Button>
            <Button onClick={handleSaveUserGroup}>Kaydet</Button>
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
                    roles.map((role) => (
                      <SelectItem key={role.id} value={role.name}>
                        <div className="flex flex-col items-start py-1">
                          <span className="font-medium">{role.name}</span>
                          {role.description && (
                            <span className="text-xs text-muted-foreground text-left max-w-[300px] whitespace-normal">
                              {role.description}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <>
                      <SelectItem value="USER">Standart Kullanıcı</SelectItem>
                      <SelectItem value="WALL_MANAGER">Duvar Yöneticisi</SelectItem>
                      <SelectItem value="SUPER_ADMIN">Süper Admin</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Kullanıcı Grubu</Label>
              <Select
                value={userForm.userGroupId || 'none'}
                onValueChange={(value) => setUserForm({ ...userForm, userGroupId: value === 'none' ? '' : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Grup seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Grup Yok</SelectItem>
                  {userGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      <div className="flex flex-col items-start py-1">
                        <span className="font-medium">{group.name}</span>
                        {group.description && (
                          <span className="text-xs text-muted-foreground text-left max-w-[300px] whitespace-normal">
                            {group.description}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserModal(false)}>
              İptal
            </Button>
            <Button onClick={handleSaveUser}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showWallModal} onOpenChange={setShowWallModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
          <div className="space-y-4 py-4">
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

            <div className="grid grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label>Yönetici</Label>
              <Select
                value={wallForm.wallManagerId}
                onValueChange={(value) => setWallForm({ ...wallForm, wallManagerId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Yönetici seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">Yönetici Yok</SelectItem>
                  {wallManagers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.name} ({manager.role === 'SUPER_ADMIN' ? 'Süper Admin' : 'Yönetici'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

            <div className="space-y-4 border-t pt-4">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Palette className="w-4 h-4" /> Duvar Başlık Görünümü (Hero)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Alt Başlık</Label>
                  <Input
                    value={wallForm.heroSubtitle}
                    onChange={(e) => setWallForm({ ...wallForm, heroSubtitle: e.target.value })}
                    placeholder="Duvar sayfasında görünecek alt başlık"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ana Başlık Fontu</Label>
                  <Select
                    value={wallForm.heroTitleFont || 'sans-serif'}
                    onValueChange={(value) => setWallForm({ ...wallForm, heroTitleFont: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sans-serif">Sans Serif</SelectItem>
                      <SelectItem value="serif">Serif</SelectItem>
                      <SelectItem value="Patrick Hand, cursive">El Yazısı</SelectItem>
                      <SelectItem value="Dancing Script, cursive">Süslü</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Başlık Rengi</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      className="w-10 h-10 p-1"
                      value={wallForm.heroTitleColor}
                      onChange={(e) => setWallForm({ ...wallForm, heroTitleColor: e.target.value })}
                    />
                    <Input
                      className="text-xs font-mono"
                      value={wallForm.heroTitleColor}
                      onChange={(e) => setWallForm({ ...wallForm, heroTitleColor: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Başlık Boyutu</Label>
                  <Select
                    value={wallForm.heroTitleSize}
                    onValueChange={(value) => setWallForm({ ...wallForm, heroTitleSize: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3xl">3XL</SelectItem>
                      <SelectItem value="4xl">4XL</SelectItem>
                      <SelectItem value="5xl">5XL</SelectItem>
                      <SelectItem value="6xl">6XL</SelectItem>
                      <SelectItem value="7xl">7XL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Alt Başlık Fontu</Label>
                  <Select
                    value={wallForm.heroSubtitleFont}
                    onValueChange={(value) => setWallForm({ ...wallForm, heroSubtitleFont: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sans-serif">Sans Serif</SelectItem>
                      <SelectItem value="serif">Serif</SelectItem>
                      <SelectItem value="Patrick Hand, cursive">El Yazısı</SelectItem>
                      <SelectItem value="Dancing Script, cursive">Süslü</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Alt Başlık Rengi</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      className="w-10 h-10 p-1"
                      value={wallForm.heroSubtitleColor}
                      onChange={(e) => setWallForm({ ...wallForm, heroSubtitleColor: e.target.value })}
                    />
                    <Input
                      className="text-xs font-mono"
                      value={wallForm.heroSubtitleColor}
                      onChange={(e) => setWallForm({ ...wallForm, heroSubtitleColor: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Gradyan Başlangıç</Label>
                  <Input
                    type="color"
                    className="w-full h-10 p-1"
                    value={wallForm.heroGradientFrom}
                    onChange={(e) => setWallForm({ ...wallForm, heroGradientFrom: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gradyan Orta</Label>
                  <Input
                    type="color"
                    className="w-full h-10 p-1"
                    value={wallForm.heroGradientVia}
                    onChange={(e) => setWallForm({ ...wallForm, heroGradientVia: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gradyan Bitiş</Label>
                  <Input
                    type="color"
                    className="w-full h-10 p-1"
                    value={wallForm.heroGradientTo}
                    onChange={(e) => setWallForm({ ...wallForm, heroGradientTo: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Calendar Areas Section */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Label className="text-base font-semibold">Takvim Alanları</Label>
                  <Input
                    type="date"
                    className="w-auto h-8 text-sm"
                    value={selectedCalendarDate}
                    onChange={(e) => setSelectedCalendarDate(e.target.value)}
                  />
                </div>
                <Button type="button" variant="outline" size="sm" onClick={handleAddCalendarEntry} className="gap-1">
                  <Plus className="w-3 h-3" /> Ekle
                </Button>
              </div>

              <div className="space-y-4">
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
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWallModal(false)}>
              İptal
            </Button>
            <Button onClick={handleSaveWall}>Kaydet</Button>
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Not Düzenle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>İçerik</Label>
              <Textarea
                value={postitForm.content}
                onChange={(e) => setPostitForm({ ...postitForm, content: e.target.value })}
                maxLength={500}
                rows={4}
              />
              <p className="text-xs text-gray-500 text-right mt-1">
                {postitForm.content.length}/500
              </p>
            </div>

            <div>
              <Label>Resimler (Maks. 5)</Label>
              {postitForm.imageUrls.length > 0 && (
                <div className="grid grid-cols-5 gap-2 mt-2 mb-2">
                  {postitForm.imageUrls.map((url, index) => (
                    <div key={index} className="relative group aspect-square rounded overflow-hidden border border-gray-200">
                      <img src={url} alt={`Resim ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePostitImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
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
                    className="w-full h-20 border-dashed border-2 flex flex-col gap-1 items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                    onClick={() => document.getElementById('admin-edit-image-upload')?.click()}
                    disabled={uploadingPostitImage}
                  >
                    {uploadingPostitImage ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <ImageIcon className="w-6 h-6" />
                    )}
                    <span>Resim Ekle ({postitForm.imageUrls.length}/5)</span>
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

            <div>
              <Label>Kategori</Label>
              <Select
                value={postitForm.categoryId}
                onValueChange={(value) => setPostitForm({ ...postitForm, categoryId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {/* Flatten categories for dropdown */}
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

            <div>
              <Label>Renk</Label>
              <div className="grid grid-cols-6 gap-2 mt-2">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={`w-full aspect-square rounded-lg ${color.bg} border-2 transition-all ${postitForm.color === color.value
                      ? 'border-gray-800 scale-110'
                      : 'border-transparent hover:scale-105'
                      }`}
                    onClick={() => setPostitForm({ ...postitForm, color: color.value })}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label>Yazı Tipi</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {fonts.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() =>
                      setPostitForm({ ...postitForm, font: f.value })
                    }
                    className={`h-12 rounded border-2 bg-white flex items-center justify-center ${postitForm.font === f.value
                      ? 'border-gray-800 ring-2 ring-gray-800'
                      : 'border-gray-300'
                      } hover:border-gray-600 transition ${f.class} text-sm`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>İğne</Label>
              <div className="grid grid-cols-6 gap-2 mt-2">
                {pushpinOptions.map((pin) => (
                  <button
                    key={pin.value}
                    type="button"
                    className={`w-full aspect-square rounded-lg border-2 p-1 transition-all bg-gray-100 ${postitForm.pushpin === pin.value
                      ? 'border-gray-800 scale-110'
                      : 'border-transparent hover:scale-105'
                      }`}
                    onClick={() => setPostitForm({ ...postitForm, pushpin: pin.value })}
                    title={pin.label}
                  >
                    <Image src={pin.image} alt={pin.label} width={32} height={32} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expires">Süre</Label>
                <Select
                  value={postitForm.expiresInDays}
                  onValueChange={(value) => {
                    const daysMap: { [key: string]: number } = {
                      '1': 1,
                      '3': 3,
                      '7': 7,
                      '30': 30
                    }
                    const newForm = { ...postitForm, expiresInDays: value }
                    if (value !== 'custom') {
                      const days = daysMap[value] || 1
                      newForm.expiresAtDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                    }
                    setPostitForm(newForm)
                  }}
                >
                  <SelectTrigger>
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

              <div>
                <Label>Son Görüntüleme Tarihi</Label>
                <Input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={postitForm.expiresAtDate}
                  onChange={(e) => setPostitForm({ ...postitForm, expiresAtDate: e.target.value })}
                  required
                  readOnly={postitForm.expiresInDays !== 'custom'}
                  className={postitForm.expiresInDays !== 'custom' ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}
                />
              </div>
            </div>

            <div>
              <Label>Link (Opsiyonel)</Label>
              <Input
                type="url"
                value={postitForm.link}
                onChange={(e) => setPostitForm({ ...postitForm, link: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="flex gap-6 mt-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isApproved"
                  checked={postitForm.isApproved}
                  onCheckedChange={(checked) => setPostitForm({ ...postitForm, isApproved: checked === true })}
                />
                <Label htmlFor="isApproved">Onaylı</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isPublished"
                  checked={postitForm.isPublished}
                  onCheckedChange={(checked) => setPostitForm({ ...postitForm, isPublished: checked === true })}
                />
                <Label htmlFor="isPublished">Yayında</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPostitModal(false)}>
              İptal
            </Button>
            <Button onClick={handleSavePostit}>Kaydet</Button>
          </DialogFooter>
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
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isGradient"
                  checked={sliderForm.isGradient}
                  onCheckedChange={(checked) => setSliderForm({ ...sliderForm, isGradient: !!checked })}
                />
                <Label htmlFor="isGradient" className="cursor-pointer font-semibold">Hero Gradyan Renk Kullan</Label>
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
                <p className="text-xs text-gray-500">Resim varsa, seçilen arkaplan rengi veya gradyan kullanılmaz.</p>
              </div>

              {!sliderForm.isGradient ? (
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
              ) : (
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
              )}
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
