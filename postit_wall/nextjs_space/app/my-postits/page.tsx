'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'react-hot-toast'
import { Loader2, Edit, Eye, EyeOff, Trash2, Search, StickyNote, Calendar, Clock, X, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface PostIt {
  id: string
  content: string
  color: string
  font: string
  pushpin: string
  imageUrl: string | null
  link: string | null
  isApproved: boolean
  isPublished: boolean
  expiresAt: string
  createdAt: string
  category: {
    id: string
    name: string
  }
  PostItImage?: { url: string }[]
}

interface Category {
  id: string
  name: string
  children?: Category[]
  userGroupId?: string | null
}

const colorOptions = [
  { value: 'YELLOW', label: 'Sarı', bg: 'bg-yellow-200' },
  { value: 'PINK', label: 'Pembe', bg: 'bg-pink-200' },
  { value: 'BLUE', label: 'Mavi', bg: 'bg-blue-200' },
  { value: 'GREEN', label: 'Yeşil', bg: 'bg-green-200' },
  { value: 'ORANGE', label: 'Turuncu', bg: 'bg-orange-200' },
  { value: 'PURPLE', label: 'Mor', bg: 'bg-purple-200' },
]

const fontOptions = [
  { value: 'HANDWRITING', label: 'El Yazısı', class: 'font-handwriting' },
  { value: 'SERIF', label: 'Serif', class: 'font-serif' },
  { value: 'SANS', label: 'Sans', class: 'font-sans' },
  { value: 'MONO', label: 'Mono', class: 'font-mono' },
  { value: 'CURSIVE', label: 'Süslü', class: 'font-cursive' },
]

const pushpinOptions = [
  { value: 'RED', label: 'Kırmızı', image: '/pushpins/red.png' },
  { value: 'BLUE', label: 'Mavi', image: '/pushpins/blue.png' },
  { value: 'GOLD', label: 'Altın', image: '/pushpins/gold.png' },
  { value: 'GREEN', label: 'Yeşil', image: '/pushpins/green.png' },
  { value: 'PINK', label: 'Pembe', image: '/pushpins/pink.png' },
  { value: 'SILVER', label: 'Gümüş', image: '/pushpins/silver.png' },
]

export default function MyPostItsPage() {
  const { data: session, status } = useSession() || {}
  const userRole = (session?.user as any)?.role
  const userGroupId = (session?.user as any)?.userGroupId
  const router = useRouter()
  const [postits, setPostits] = useState<PostIt[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'unpublished'>('all')

  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingPost, setEditingPost] = useState<PostIt | null>(null)
  const [editForm, setEditForm] = useState<{
    content: string
    color: string
    font: string
    pushpin: string
    link: string
    categoryId: string
    imageUrl: string
    imageUrls: string[]
    createdAt: string
    expiresAt: string
  }>({
    content: '',
    color: 'YELLOW',
    font: 'HANDWRITING',
    pushpin: 'RED',
    link: '',
    categoryId: '',
    imageUrl: '',
    imageUrls: [],
    createdAt: '',
    expiresAt: ''
  })
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      loadPostits()
      loadCategories()
    }
  }, [session])

  const loadPostits = async () => {
    try {
      const res = await fetch('/api/my-postits')
      const data = await res.json()
      if (data.postits) {
        setPostits(data.postits)
      }
    } catch (error) {
      toast.error('Post-it\'ler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      if (data.categories) {
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const flattenCategories = (cats: Category[], depth = 0): (Category & { depth: number })[] => {
    let result: (Category & { depth: number })[] = []
    for (const cat of cats) {
      result.push({ ...cat, depth })
      if (cat.children && cat.children.length > 0) {
        result = result.concat(flattenCategories(cat.children, depth + 1))
      }
    }
    return result
  }

  const togglePublish = async (postId: string, currentStatus: boolean) => {
    // Optimistic update
    setPostits(prev => prev.map(p => p.id === postId ? { ...p, isPublished: !currentStatus } : p))
    try {
      const res = await fetch(`/api/my-postits/${postId}/toggle-publish`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !currentStatus })
      })

      if (!res.ok) {
        // Revert on failure
        setPostits(prev => prev.map(p => p.id === postId ? { ...p, isPublished: currentStatus } : p))
        const data = await res.json()
        throw new Error(data.error || 'Hata oluştu')
      }

      toast.success(currentStatus ? 'Post yayından kaldırıldı' : 'Post yayına alındı')
    } catch (error: any) {
      toast.error(error.message || 'Bir hata oluştu')
    }
  }

  // Handle Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (editForm.imageUrls.length >= 5) {
      toast.error('En fazla 5 resim ekleyebilirsiniz')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Dosya boyutu 10MB\'dan küçük olmalıdır')
      return
    }

    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/local', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Dosya yüklenemedi')
      }

      const { fileUrl } = await response.json()
      setEditForm(prev => ({
        ...prev,
        imageUrls: [...prev.imageUrls, fileUrl],
        imageUrl: fileUrl // Keep updating main image url for now
      }))
      toast.success('Resim yüklendi')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Resim yüklenirken hata oluştu')
    } finally {
      setUploadingImage(false)
      // Reset input
      e.target.value = ''
    }
  }

  const handleRemoveImage = (indexToRemove: number) => {
    setEditForm(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, index) => index !== indexToRemove)
    }))
  }

  const openEditModal = (post: PostIt) => {
    setEditingPost(post)

    // Determine initial images
    let initialImages: string[] = []
    if (post.PostItImage && post.PostItImage.length > 0) {
      initialImages = post.PostItImage.map(img => img.url)
    } else if (post.imageUrl) {
      initialImages = [post.imageUrl]
    }

    setEditForm({
      content: post.content,
      color: post.color,
      font: post.font,
      pushpin: post.pushpin,
      link: post.link || '',
      categoryId: post.category.id,
      imageUrl: post.imageUrl || '',
      imageUrls: initialImages,
      createdAt: new Date(new Date(post.createdAt).getTime() - new Date(post.createdAt).getTimezoneOffset() * 60000).toISOString().slice(0, 16),
      expiresAt: new Date(new Date(post.expiresAt).getTime() - new Date(post.expiresAt).getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!editingPost) return
    setSaving(true)

    try {
      const res = await fetch(`/api/my-postits/${editingPost.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          createdAt: new Date(editForm.createdAt).toISOString(),
          expiresAt: new Date(editForm.expiresAt).toISOString()
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Güncelleme başarısız')
      }

      toast.success('Post-it güncellendi')
      setShowEditModal(false)
      loadPostits()
    } catch (error: any) {
      toast.error(error.message || 'Bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Bu post-it\'i silmek istediğinize emin misiniz?')) return

    try {
      const res = await fetch(`/api/postits/${postId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Silme başarısız')
      toast.success('Post-it silindi')
      loadPostits()
    } catch (error) {
      toast.error('Silme işlemi başarısız')
    }
  }

  const filteredPostits = postits.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.category.name.toLowerCase().includes(searchTerm.toLowerCase())

    if (filterStatus === 'published') return matchesSearch && post.isPublished
    if (filterStatus === 'unpublished') return matchesSearch && !post.isPublished
    return matchesSearch
  })

  const getColorClass = (color: string) => {
    return colorOptions.find(c => c.value === color)?.bg || 'bg-yellow-200'
  }

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date()

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  const flatCategories = flattenCategories(categories)

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <StickyNote className="w-8 h-8 text-yellow-500" />
            Postlarım
          </h1>
          <p className="text-gray-600 mt-2">
            Oluşturduğunuz tüm post-it'leri görüntüleyin, düzenleyin ve yönetin.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="text-2xl font-bold text-gray-800">{postits.length}</div>
            <div className="text-sm text-gray-500">Toplam Post</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="text-2xl font-bold text-green-600">
              {postits.filter(p => p.isApproved && !isExpired(p.expiresAt)).length}
            </div>
            <div className="text-sm text-gray-500">Yayında</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="text-2xl font-bold text-orange-600">
              {postits.filter(p => !p.isApproved).length}
            </div>
            <div className="text-sm text-gray-500">Yayında Değil</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Post ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="published">Yayında</SelectItem>
                <SelectItem value="unpublished">Yayında Değil</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Post-it List */}
        {filteredPostits.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border">
            <StickyNote className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Henüz post-it oluşturmadınız.</p>
            <Button className="mt-4" onClick={() => router.push('/')}>
              İlk Post-it'i Oluştur
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPostits.map((post) => (
              <div
                key={post.id}
                className={`${getColorClass(post.color)} rounded-xl p-4 shadow-md relative`}
              >
                {/* Pushpin */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8">
                  <Image
                    src={pushpinOptions.find(p => p.value === post.pushpin)?.image || '/pushpins/red.png'}
                    alt="Pushpin"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>

                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  {isExpired(post.expiresAt) ? (
                    <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">Süresi Doldu</span>
                  ) : post.isPublished ? (
                    <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">Yayında</span>
                  ) : (
                    <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full">Kaldırıldı</span>
                  )}
                  {!post.isApproved && post.isPublished && (
                    <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded-full ml-1" title="Yönetici Onayı Bekliyor">Onay Bek.</span>
                  )}
                </div>

                {/* Content */}
                <div className="mt-4 mb-3">
                  <p className="text-gray-800 line-clamp-3">{post.content}</p>
                </div>

                {/* Image Preview */}
                {post.imageUrl && (
                  <div className="mb-3 rounded-lg overflow-hidden relative">
                    <div className="absolute top-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full z-10">
                      {post.PostItImage && post.PostItImage.length > 0 ? `+${post.PostItImage.length}` : '1'}
                    </div>
                    <Image
                      src={post.imageUrl}
                      alt="Post image"
                      width={200}
                      height={100}
                      className="w-full h-24 object-cover"
                    />
                  </div>
                )}

                {/* Meta */}
                <div className="text-xs text-gray-600 space-y-1 mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(post.createdAt).toLocaleDateString('tr-TR')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Bitiş: {new Date(post.expiresAt).toLocaleDateString('tr-TR')}
                  </div>
                  <div className="bg-white/50 px-2 py-1 rounded inline-block">
                    {post.category.name}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-black/10">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => openEditModal(post)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Düzenle
                  </Button>
                  <Button
                    variant={post.isPublished ? "outline" : "default"}
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => togglePublish(post.id, post.isPublished)}
                    disabled={isExpired(post.expiresAt)}
                  >
                    {post.isPublished ? (
                      <><EyeOff className="w-3 h-3 mr-1" /> Kaldır</>
                    ) : (
                      <><Eye className="w-3 h-3 mr-1" /> Yayınla</>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(post.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Post-it Düzenle</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>İçerik</Label>
              <Textarea
                value={editForm.content}
                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                maxLength={500}
                rows={4}
              />
              <p className="text-xs text-gray-500 text-right mt-1">
                {editForm.content.length}/500
              </p>
            </div>

            <div>
              <Label>Resimler (Maks. 5)</Label>
              {editForm.imageUrls.length > 0 && (
                <div className="grid grid-cols-5 gap-2 mt-2 mb-2">
                  {editForm.imageUrls.map((url, index) => (
                    <div key={index} className="relative group aspect-square rounded overflow-hidden border border-gray-200">
                      <img src={url} alt={`Resim ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {editForm.imageUrls.length < 5 && (
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full h-20 border-dashed border-2 flex flex-col gap-1 items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                    onClick={() => document.getElementById('edit-image-upload')?.click()}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <ImageIcon className="w-6 h-6" />
                    )}
                    <span>Resim Ekle ({editForm.imageUrls.length}/5)</span>
                  </Button>
                  <Input
                    id="edit-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            <div>
              <Label>Kategori</Label>
              <Select
                value={editForm.categoryId}
                onValueChange={(v) => setEditForm({ ...editForm, categoryId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {flatCategories.filter(cat => {
                    // Filter out restricted categories
                    if (cat.userGroupId) {
                      if (userRole !== 'SUPER_ADMIN' && userGroupId !== cat.userGroupId) {
                        return false
                      }
                    }
                    return true
                  }).map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span style={{ paddingLeft: `${cat.depth * 12}px` }}>
                        {cat.depth > 0 && '↳ '}{cat.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Renk</Label>
              <div className="grid grid-cols-6 gap-2 mt-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={`w-full aspect-square rounded-lg ${color.bg} border-2 transition-all ${editForm.color === color.value
                      ? 'border-gray-800 scale-110'
                      : 'border-transparent hover:scale-105'
                      }`}
                    onClick={() => setEditForm({ ...editForm, color: color.value })}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label>Yazı Tipi</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {fontOptions.map((font) => (
                  <button
                    key={font.value}
                    type="button"
                    onClick={() =>
                      setEditForm({ ...editForm, font: font.value })
                    }
                    className={`h-12 rounded border-2 bg-white flex items-center justify-center ${editForm.font === font.value
                      ? 'border-gray-800 ring-2 ring-gray-800'
                      : 'border-gray-300'
                      } hover:border-gray-600 transition ${font.class} text-sm`}
                  >
                    {font.label}
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
                    className={`w-full aspect-square rounded-lg border-2 p-1 transition-all bg-gray-100 ${editForm.pushpin === pin.value
                      ? 'border-gray-800 scale-110'
                      : 'border-transparent hover:scale-105'
                      }`}
                    onClick={() => setEditForm({ ...editForm, pushpin: pin.value })}
                    title={pin.label}
                  >
                    <Image src={pin.image} alt={pin.label} width={32} height={32} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Link (Opsiyonel)</Label>
              <Input
                type="url"
                value={editForm.link}
                onChange={(e) => setEditForm({ ...editForm, link: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Yayınlanma Tarihi</Label>
                <Input
                  type="datetime-local"
                  value={editForm.createdAt}
                  onChange={(e) => setEditForm({ ...editForm, createdAt: e.target.value })}
                />
              </div>
              <div>
                <Label>Bitiş Tarihi</Label>
                <Input
                  type="datetime-local"
                  value={editForm.expiresAt}
                  onChange={(e) => setEditForm({ ...editForm, expiresAt: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowEditModal(false)}
              >
                İptal
              </Button>
              <Button
                className="flex-1"
                onClick={handleSaveEdit}
                disabled={saving}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Kaydet
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
