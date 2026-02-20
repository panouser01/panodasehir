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
import {
  Loader2,
  Trash2,
  StickyNote,
  Plus,
  Pencil,
  Eye,
  EyeOff,
  Home,
  LayoutGrid,
  ChevronDown,
  ChevronRight,
  Search,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function WallManagerPage() {
  const { data: session, status } = useSession() || {}
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [managedWalls, setManagedWalls] = useState<any[]>([])
  const [selectedWallId, setSelectedWallId] = useState<string>('')
  const [postits, setPostits] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [expandedWalls, setExpandedWalls] = useState<Set<string>>(new Set())

  // Modal states
  const [showPostitModal, setShowPostitModal] = useState(false)
  const [editingPostit, setEditingPostit] = useState<any>(null)
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false)
  const [parentForSubcategory, setParentForSubcategory] = useState<any>(null)

  // Form state
  const [postitForm, setPostitForm] = useState({
    content: '',
    categoryId: '',
    color: 'YELLOW',
    font: 'HANDWRITING',
    link: '',
    isApproved: false,
  })
  
  const [subcategoryForm, setSubcategoryForm] = useState({
    name: '',
    description: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    const userRole = (session?.user as any)?.role
    if (status === 'authenticated' && userRole !== 'WALL_MANAGER' && userRole !== 'SUPER_ADMIN') {
      toast.error('Bu sayfaya erişim yetkiniz yok')
      router.push('/')
      return
    }

    if (status === 'authenticated') {
      loadWalls()
    }
  }, [status, session, router])

  useEffect(() => {
    if (selectedWallId) {
      loadPostits(selectedWallId)
    }
  }, [selectedWallId])

  const loadWalls = async () => {
    try {
      setLoading(true)
      const userId = (session?.user as any)?.id

      const categoriesRes = await fetch('/api/categories')
      const categoriesData = await categoriesRes.json()
      const allCategories = categoriesData?.categories ?? []
      setCategories(allCategories)

      // Filter walls managed by current user (directly) - these are the root walls
      const directlyManaged = allCategories.filter(
        (cat: any) => cat?.wallManagerId === userId && !cat?.parentId
      )

      // Also include children of directly managed walls
      const myWalls = directlyManaged.map((wall: any) => {
        // Get children from the wall object or find them in allCategories
        const children = wall.children || allCategories.filter(
          (cat: any) => cat?.parentId === wall.id
        )
        return {
          ...wall,
          children
        }
      })

      setManagedWalls(myWalls)

      if (myWalls.length > 0 && !selectedWallId) {
        setSelectedWallId(myWalls[0].id)
      }
    } catch (error) {
      console.error('Error loading walls:', error)
      toast.error('Duvarlar yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }
  
  const handleCreateSubcategory = async () => {
    if (!parentForSubcategory || !subcategoryForm.name.trim()) {
      toast.error('Alt kategori adı gereklidir')
      return
    }
    
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: subcategoryForm.name,
          description: subcategoryForm.description,
          parentId: parentForSubcategory.id,
        }),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Alt kategori oluşturulamadı')
      }
      
      toast.success('Alt kategori oluşturuldu')
      setShowSubcategoryModal(false)
      setSubcategoryForm({ name: '', description: '' })
      setParentForSubcategory(null)
      loadWalls()
    } catch (error: any) {
      toast.error(error.message || 'Alt kategori oluşturulamadı')
    }
  }
  
  const openAddSubcategory = (wall: any) => {
    setParentForSubcategory(wall)
    setSubcategoryForm({ name: '', description: '' })
    setShowSubcategoryModal(true)
  }
  
  const toggleWallExpand = (wallId: string) => {
    setExpandedWalls(prev => {
      const newSet = new Set(prev)
      if (newSet.has(wallId)) {
        newSet.delete(wallId)
      } else {
        newSet.add(wallId)
      }
      return newSet
    })
  }
  
  // Get all accessible category IDs (for wall manager to select when creating/editing posts)
  const getAccessibleCategories = () => {
    const ids: any[] = []
    managedWalls.forEach(wall => {
      ids.push(wall)
      if (wall.children) {
        wall.children.forEach((child: any) => ids.push(child))
      }
    })
    return ids
  }

  const loadPostits = async (wallId: string) => {
    try {
      const postitsRes = await fetch(
        `/api/postits?categoryId=${wallId}&includeUnapproved=true`
      )
      const postitsData = await postitsRes.json()
      setPostits(postitsData?.postits ?? [])
    } catch (error) {
      console.error('Error loading postits:', error)
      toast.error('Notlar yüklenirken hata oluştu')
    }
  }

  const handleTogglePublish = async (postitId: string, isApproved: boolean) => {
    try {
      const response = await fetch(`/api/postits/${postitId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved }),
      })

      if (!response.ok) throw new Error('Güncelleme başarısız')

      toast.success(isApproved ? 'Not yayına alındı' : 'Not yayından kaldırıldı')
      loadPostits(selectedWallId)
    } catch (error) {
      toast.error('Not güncellenemedi')
    }
  }

  const handleDeletePostit = async (postitId: string) => {
    if (!confirm('Bu notu silmek istediğinizden emin misiniz?')) return
    try {
      const response = await fetch(`/api/postits/${postitId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Silme başarısız')

      toast.success('Not silindi')
      loadPostits(selectedWallId)
    } catch (error) {
      toast.error('Not silinemedi')
    }
  }

  const handleSavePostit = async () => {
    try {
      if (editingPostit) {
        // Update existing
        const response = await fetch(`/api/postits/${editingPostit.id}/approve`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: postitForm.content,
            categoryId: postitForm.categoryId,
            color: postitForm.color,
            font: postitForm.font,
            link: postitForm.link,
            isApproved: postitForm.isApproved,
          }),
        })
        if (!response.ok) throw new Error('Güncelleme başarısız')
        toast.success('Not güncellendi')
      } else {
        // Create new post-it
        const response = await fetch('/api/postits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: postitForm.content,
            categoryId: postitForm.categoryId || selectedWallId,
            color: postitForm.color,
            font: postitForm.font,
            link: postitForm.link || undefined,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          }),
        })
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Ekleme başarısız')
        }
        toast.success('Not eklendi')
      }

      setShowPostitModal(false)
      setEditingPostit(null)
      setPostitForm({ content: '', categoryId: '', color: 'YELLOW', font: 'HANDWRITING', link: '', isApproved: false })
      loadPostits(selectedWallId)
    } catch (error: any) {
      toast.error(error.message || 'Not kaydedilemedi')
    }
  }

  const openAddPostit = () => {
    setEditingPostit(null)
    setPostitForm({
      content: '',
      categoryId: selectedWallId,
      color: 'YELLOW',
      font: 'HANDWRITING',
      link: '',
      isApproved: false,
    })
    setShowPostitModal(true)
  }

  const openEditPostit = (postit: any) => {
    setEditingPostit(postit)
    setPostitForm({
      content: postit.content || '',
      categoryId: postit.categoryId || '',
      color: postit.color || 'YELLOW',
      font: postit.font || 'HANDWRITING',
      link: postit.link || '',
      isApproved: postit.isApproved || false,
    })
    setShowPostitModal(true)
  }

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

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (managedWalls.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <LayoutGrid className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Atanmış Duvar Bulunamadı</h2>
          <p className="text-gray-600 mb-4">
            Size henüz bir duvar atanmamış. Lütfen yöneticinizle iletişime geçin.
          </p>
          <Button onClick={() => router.push('/')}>Ana Sayfaya Dön</Button>
        </div>
      </div>
    )
  }

  // Find selected wall (could be parent or child)
  const findSelectedWall = () => {
    for (const wall of managedWalls) {
      if (wall.id === selectedWallId) return wall
      if (wall.children) {
        const child = wall.children.find((c: any) => c.id === selectedWallId)
        if (child) return child
      }
    }
    return managedWalls[0]
  }
  
  const selectedWall = findSelectedWall()
  const approvedCount = postits.filter((p) => p.isApproved).length
  const pendingCount = postits.filter((p) => !p.isApproved).length

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">📌 Panoda Şehir</h1>
          <p className="text-sm text-gray-400">Duvar Yöneticisi</p>
        </div>

        <div className="p-4 border-b border-gray-700 flex-1 overflow-y-auto">
          <p className="text-xs text-gray-400 mb-2">Yönettiğiniz Duvarlar</p>
          <div className="space-y-1">
            {managedWalls.map((wall) => {
              const hasChildren = wall.children && wall.children.length > 0
              const isExpanded = expandedWalls.has(wall.id)
              const isSelected = selectedWallId === wall.id
              
              return (
                <div key={wall.id}>
                  <div className="flex items-center gap-1">
                    {hasChildren && (
                      <button
                        onClick={() => toggleWallExpand(wall.id)}
                        className="p-1 text-gray-400 hover:text-white"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                      </button>
                    )}
                    {!hasChildren && <div className="w-5" />}
                    <button
                      onClick={() => setSelectedWallId(wall.id)}
                      className={`flex-1 flex items-center gap-2 px-2 py-2 rounded-lg transition-colors text-sm ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                      <span className="flex-1 text-left truncate">{wall.name}</span>
                      <span className="text-xs opacity-70">{wall._count?.postits || 0}</span>
                    </button>
                    <button
                      onClick={() => openAddSubcategory(wall)}
                      className="p-1 text-gray-400 hover:text-white"
                      title="Alt kategori ekle"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  
                  {/* Children */}
                  {hasChildren && isExpanded && (
                    <div className="ml-6 mt-1 space-y-1">
                      {wall.children.map((child: any) => (
                        <button
                          key={child.id}
                          onClick={() => setSelectedWallId(child.id)}
                          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors text-sm ${
                            selectedWallId === child.id
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-400 hover:bg-gray-800 hover:text-gray-300'
                          }`}
                        >
                          <span className="text-xs">↳</span>
                          <span className="flex-1 text-left truncate">{child.name}</span>
                          <span className="text-xs opacity-70">{child._count?.postits || 0}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">{selectedWall?.name} Duvarı</h2>
            <p className="text-gray-600">{selectedWall?.description || 'Bu duvarı yönetiyorsunuz'}</p>
          </div>
          <Button onClick={openAddPostit} className="gap-2">
            <Plus className="w-4 h-4" />
            Yeni Not Ekle
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <StickyNote className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Not</p>
                <p className="text-2xl font-bold">{postits.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Yayında</p>
                <p className="text-2xl font-bold">{approvedCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <EyeOff className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Beklemede</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Not Listesi</h3>
          </div>
          {postits.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <StickyNote className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Bu duvarda henüz not yok</p>
              <Button variant="link" onClick={openAddPostit}>
                İlk notu ekleyin
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>İçerik</TableHead>
                  <TableHead>Yazan</TableHead>
                  <TableHead>Renk</TableHead>
                  <TableHead className="text-center">Yayında</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {postits.map((postit) => (
                  <TableRow key={postit.id}>
                    <TableCell className="max-w-xs">
                      <p className="truncate">{postit.content}</p>
                      {postit.imageUrl && (
                        <span className="text-xs text-blue-600">🖼️ Resim</span>
                      )}
                      {postit.link && (
                        <span className="text-xs text-green-600 ml-1">🔗 Link</span>
                      )}
                    </TableCell>
                    <TableCell>{postit.user?.name ?? '-'}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-block w-6 h-6 rounded ${
                          postit.color === 'YELLOW'
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
                        onCheckedChange={(checked) =>
                          handleTogglePublish(postit.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(postit.createdAt).toLocaleDateString('tr-TR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditPostit(postit)}
                        >
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
      </main>

      {/* Post-it Modal */}
      <Dialog open={showPostitModal} onOpenChange={setShowPostitModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPostit ? 'Not Düzenle' : 'Yeni Not Ekle'}</DialogTitle>
            <DialogDescription>
              {editingPostit ? 'Not bilgilerini düzenleyin' : 'Duvara yeni bir not ekleyin'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="postitContent">İçerik</Label>
              <Textarea
                id="postitContent"
                value={postitForm.content}
                onChange={(e) =>
                  setPostitForm({ ...postitForm, content: e.target.value })
                }
                placeholder="Not içeriği (max 500 karakter)"
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 text-right">
                {postitForm.content.length}/500
              </p>
            </div>

            {managedWalls.length > 1 && (
              <div className="space-y-2">
                <Label>Duvar</Label>
                <Select
                  value={postitForm.categoryId || selectedWallId}
                  onValueChange={(value) =>
                    setPostitForm({ ...postitForm, categoryId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Duvar seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {managedWalls.map((wall) => (
                      <SelectItem key={wall.id} value={wall.id}>
                        {wall.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Renk</Label>
              <div className="flex gap-2 flex-wrap">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() =>
                      setPostitForm({ ...postitForm, color: color.value })
                    }
                    className={`w-8 h-8 rounded-full ${color.bg} border-2 transition-all ${
                      postitForm.color === color.value
                        ? 'border-gray-800 scale-110'
                        : 'border-transparent'
                    }`}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Yazı Tipi</Label>
              <div className="grid grid-cols-5 gap-2">
                {fonts.map((font) => (
                  <button
                    key={font.value}
                    type="button"
                    onClick={() =>
                      setPostitForm({ ...postitForm, font: font.value })
                    }
                    className={`h-10 rounded border-2 bg-white text-sm ${
                      postitForm.font === font.value
                        ? 'border-gray-800 ring-1 ring-gray-800'
                        : 'border-gray-300'
                    } hover:border-gray-600 transition ${font.class}`}
                  >
                    {font.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="postitLink">Link (opsiyonel)</Label>
              <Input
                id="postitLink"
                value={postitForm.link}
                onChange={(e) =>
                  setPostitForm({ ...postitForm, link: e.target.value })
                }
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Checkbox
                id="postitPublished"
                checked={postitForm.isApproved}
                onCheckedChange={(checked) =>
                  setPostitForm({ ...postitForm, isApproved: checked as boolean })
                }
              />
              <Label htmlFor="postitPublished" className="cursor-pointer">
                <span className="font-medium">Yayına Al</span>
                <p className="text-sm text-gray-500">Bu not ana sayfada görünsün</p>
              </Label>
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
      
      {/* Subcategory Modal */}
      <Dialog open={showSubcategoryModal} onOpenChange={setShowSubcategoryModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alt Kategori Oluştur</DialogTitle>
            <DialogDescription>
              "{parentForSubcategory?.name}" altında yeni bir alt kategori oluşturun
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subcatName">Alt Kategori Adı</Label>
              <Input
                id="subcatName"
                value={subcategoryForm.name}
                onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })}
                placeholder="Örn: Mobil Uygulamalar"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subcatDesc">Açıklama (opsiyonel)</Label>
              <Textarea
                id="subcatDesc"
                value={subcategoryForm.description}
                onChange={(e) => setSubcategoryForm({ ...subcategoryForm, description: e.target.value })}
                placeholder="Alt kategori hakkında kısa açıklama"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowSubcategoryModal(false)
              setParentForSubcategory(null)
            }}>
              İptal
            </Button>
            <Button onClick={handleCreateSubcategory}>Oluştur</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
