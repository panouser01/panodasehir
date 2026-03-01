'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Upload, Loader2, X, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'

interface Category {
  id: string
  name: string
  depth?: number
  userGroupId?: string | null
  [key: string]: any
}

interface PostItFormProps {
  categories: Category[]
  userGroupId?: string | null
  userRole?: string | null
  defaultCategoryId?: string
}

export function PostItForm({ categories, userGroupId, userRole, defaultCategoryId }: PostItFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Open modal if action=create is in URL
  useEffect(() => {
    if (searchParams?.get('action') === 'create') {
      setOpen(true)
      // Clean up the URL
      const params = new URLSearchParams(searchParams.toString())
      params.delete('action')
      const newPath = window.location.pathname + (params.toString() ? `?${params.toString()}` : '')
      window.history.replaceState(null, '', newPath)
    }
  }, [searchParams])

  // Sync categoryId with defaultCategoryId when it changes (navigation)
  useEffect(() => {
    if (defaultCategoryId) {
      setFormData(prev => ({ ...prev, categoryId: defaultCategoryId }))
    }
  }, [defaultCategoryId])

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      // Find selected or default category
      // Use the prop defaultCategoryId as the primary source of truth for the "current wall" context
      const targetCatId = defaultCategoryId || formData.categoryId
      const targetCat = categories.find(c => c.id === targetCatId)

      // Permission check logic
      console.log('Permission Check:', {
        userRole,
        userGroupId,
        targetCatName: targetCat?.name,
        targetCatUserGroupId: targetCat?.userGroupId
      })
      if (targetCat?.userGroupId) {
        if (userRole !== 'SUPER_ADMIN' && userGroupId !== targetCat.userGroupId) {
          toast.error('Bu duvara post-it ekleme yetkiniz yok (Grup Kısıtlaması)')
          return
        }
      }

      // Ensure the form data is correct before opening
      setFormData(prev => ({
        ...prev,
        categoryId: defaultCategoryId || prev.categoryId,
        expiresInDays: '1',
        expiresAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }))
    }
    setOpen(isOpen)
  }
  const [uploadingImage, setUploadingImage] = useState(false)

  const [formData, setFormData] = useState<{
    content: string
    imageUrls: string[]
    link: string
    color: string
    font: string
    pushpin: string
    categoryId: string
    expiresInDays: string
    expiresAtDate: string
  }>({
    content: '',
    imageUrls: [],
    link: '',
    color: 'YELLOW',
    font: 'HANDWRITING',
    pushpin: 'RED',
    categoryId: defaultCategoryId ?? categories?.[0]?.id ?? '',
    expiresInDays: '1',
    expiresAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  })

  const colors = [
    { value: 'YELLOW', label: 'Sarı', class: 'bg-yellow-200' },
    { value: 'PINK', label: 'Pembe', class: 'bg-pink-200' },
    { value: 'BLUE', label: 'Mavi', class: 'bg-blue-200' },
    { value: 'GREEN', label: 'Yeşil', class: 'bg-green-200' },
    { value: 'ORANGE', label: 'Turuncu', class: 'bg-orange-200' },
    { value: 'PURPLE', label: 'Mor', class: 'bg-purple-200' },
  ]

  const fonts = [
    { value: 'HANDWRITING', label: 'El Yazısı', class: 'font-handwriting' },
    { value: 'SERIF', label: 'Serif', class: 'font-serif' },
    { value: 'SANS', label: 'Sans', class: 'font-sans' },
    { value: 'MONO', label: 'Mono', class: 'font-mono' },
    { value: 'CURSIVE', label: 'Cursive', class: 'font-cursive' },
  ]

  const pushpins = [
    { value: 'RED', label: 'Kırmızı', image: '/pushpins/red.png' },
    { value: 'BLUE', label: 'Mavi', image: '/pushpins/blue.png' },
    { value: 'GOLD', label: 'Altın', image: '/pushpins/gold.png' },
    { value: 'GREEN', label: 'Yeşil', image: '/pushpins/green.png' },
    { value: 'PINK', label: 'Pembe', image: '/pushpins/pink.png' },
    { value: 'SILVER', label: 'Gümüş', image: '/pushpins/silver.png' },
  ]

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (formData.imageUrls.length >= 5) {
      toast.error('En fazla 5 resim ekleyebilirsiniz')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dosya boyutu 5MB\'dan küçük olmalıdır')
      return
    }

    setUploadingImage(true)
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
      setFormData(prev => ({
        ...prev,
        imageUrls: [...prev.imageUrls, fileUrl]
      }))
      toast.success('Resim yüklendi')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Resim yüklenirken hata oluştu')
    } finally {
      setUploadingImage(false)
      // Reset input value to allow uploading same file again if deleted
      e.target.value = ''
    }
  }

  const handleRemoveImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, index) => index !== indexToRemove)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.content.trim()) {
      toast.error('İçerik gereklidir')
      return
    }

    if (formData.content.length > 500) {
      toast.error('İçerik en fazla 500 karakter olabilir')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/postits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error ?? 'Post-it oluşturulamadı')
      }

      toast.success('Post-it oluşturuldu!')
      setOpen(false)
      setFormData({
        content: '',
        imageUrls: [],
        link: '',
        color: 'YELLOW',
        font: 'HANDWRITING',
        pushpin: 'RED',
        categoryId: categories?.[0]?.id ?? '',
        expiresInDays: '1',
        expiresAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      })
      router.refresh()
    } catch (error: any) {
      console.error('Submit error:', error)
      toast.error(error?.message ?? 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Plus className="w-5 h-5" />
          Yeni Post-it
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yeni Post-it Oluştur</DialogTitle>
          <DialogDescription>
            Duvarınıza yeni bir post-it ekleyin
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="content">İçerik *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              placeholder="Mesajınızı yazın... (max 500 karakter)"
              rows={5}
              maxLength={500}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData?.content?.length ?? 0}/500
            </p>
          </div>

          <div>
            <Label htmlFor="category">Kategori *</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) =>
                setFormData({ ...formData, categoryId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Kategori seçin" />
              </SelectTrigger>
              <SelectContent>
                {categories?.filter(cat => {
                  if (!cat.userGroupId) return true // Public category
                  if (userRole === 'SUPER_ADMIN') return true // Super admin sees all
                  return userGroupId === cat.userGroupId // User must belong to group
                }).map((cat) => {
                  const prefix = cat.depth ? '└'.padStart(cat.depth * 2, ' ') + ' ' : ''
                  return (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span style={{ paddingLeft: (cat.depth ?? 0) * 12 }}>
                        {cat.depth ? '↳ ' : ''}{cat.name}
                      </span>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Renk *</Label>
            <div className="grid grid-cols-6 gap-2 mt-2">
              {colors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, color: color.value })
                  }
                  className={`${color.class} h-12 rounded border-2 ${formData.color === color.value
                    ? 'border-gray-800 ring-2 ring-gray-800'
                    : 'border-gray-300'
                    } hover:border-gray-600 transition`}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          <div>
            <Label>Yazı Tipi</Label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {fonts.map((font) => (
                <button
                  key={font.value}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, font: font.value })
                  }
                  className={`h-12 rounded border-2 bg-white ${formData.font === font.value
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
            <Label>İğne Modeli</Label>
            <div className="grid grid-cols-6 gap-2 mt-2">
              {pushpins.map((pin) => (
                <button
                  key={pin.value}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, pushpin: pin.value })
                  }
                  className={`h-16 rounded border-2 bg-gray-50 ${formData.pushpin === pin.value
                    ? 'border-gray-800 ring-2 ring-gray-800'
                    : 'border-gray-300'
                    } hover:border-gray-600 transition flex flex-col items-center justify-center p-1`}
                  title={pin.label}
                >
                  <img
                    src={pin.image}
                    alt={pin.label}
                    className="w-8 h-8 object-contain"
                  />
                  <span className="text-xs text-gray-600 mt-1">{pin.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expires">Süre *</Label>
              <Select
                value={formData.expiresInDays}
                onValueChange={(value) => {
                  const daysMap: { [key: string]: number } = {
                    '1': 1,
                    '3': 3,
                    '7': 7,
                    '30': 30
                  }
                  const newFormData = { ...formData, expiresInDays: value }
                  if (value !== 'custom') {
                    const days = daysMap[value] || 1
                    newFormData.expiresAtDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                  }
                  setFormData(newFormData)
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
                min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                value={formData.expiresAtDate}
                onChange={(e) => setFormData({ ...formData, expiresAtDate: e.target.value })}
                required
                readOnly={formData.expiresInDays !== 'custom'}
                className={formData.expiresInDays !== 'custom' ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="image">Resimler (Maks. 5)</Label>

            {/* Image List */}
            {formData.imageUrls.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mt-2 mb-2">
                {formData.imageUrls.map((url, index) => (
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

            {formData.imageUrls.length < 5 && (
              <div className="flex items-center gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full h-20 border-dashed border-2 flex flex-col gap-1 items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <ImageIcon className="w-6 h-6" />
                  )}
                  <span>Resim Ekle ({formData.imageUrls.length}/5)</span>
                </Button>
                <Input
                  id="image-upload"
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
            <Label htmlFor="link">Link (Opsiyonel)</Label>
            <Input
              id="link"
              type="url"
              value={formData.link}
              onChange={(e) =>
                setFormData({ ...formData, link: e.target.value })
              }
              placeholder="https://example.com"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                'Post-it Oluştur'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
