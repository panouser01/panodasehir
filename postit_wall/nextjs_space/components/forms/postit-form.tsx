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
    categoryId: defaultCategoryId ?? categories?.find(c => c.name !== 'Ana Duvar')?.id ?? '',
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

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Dosya boyutu 10MB\'dan küçük olmalıdır')
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
        categoryId: categories?.find(c => c.name !== 'Ana Duvar')?.id ?? '',
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
        <Button size="lg" className="gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-amber-950 font-semibold shadow-md border-0 transition-all hover:scale-105">
          <Plus className="w-5 h-5" />
          Yeni Post-it
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0 border-0 bg-transparent rounded-2xl shadow-2xl">
        <div className="bg-white h-full flex flex-col sm:flex-row">
          
          {/* LEFT COLUMN - CONTENT & SETTINGS */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-gray-50/50">
            <div className="mb-6">
              <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-500 flex items-center gap-2">
                <Plus className="w-6 h-6 text-yellow-500" />
                Yeni Post-it Oluştur
              </DialogTitle>
              <DialogDescription className="text-gray-500 mt-1">
                Duvarınızı renklendirecek yeni bir not ekleyin.
              </DialogDescription>
            </div>

            <form id="postit-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Category */}
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-sm font-semibold text-gray-700">Kategori (Duvar) *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoryId: value })
                  }
                >
                  <SelectTrigger className="bg-white border-gray-200 shadow-sm focus:ring-yellow-400">
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.filter(cat => {
                      if (cat.name === 'Ana Duvar') return false // Hide Ana Duvar
                      if (!cat.userGroupId) return true // Public category
                      if (userRole === 'SUPER_ADMIN') return true // Super admin sees all
                      return userGroupId === cat.userGroupId // User must belong to group
                    }).map((cat) => {
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

              {/* Content */}
              <div className="space-y-1.5">
                <Label htmlFor="content" className="text-sm font-semibold text-gray-700">İçerik *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Aklınızdakileri buraya dökün..."
                  className="bg-white border-gray-200 shadow-sm focus:ring-yellow-400 resize-none rounded-xl"
                  rows={4}
                  maxLength={500}
                  required
                />
                <div className="flex justify-end p-1">
                  <span className={`text-xs ${formData.content.length > 450 ? 'text-orange-500 font-bold' : 'text-gray-400'}`}>
                    {formData?.content?.length ?? 0}/500
                  </span>
                </div>
              </div>

              {/* Expiration */}
              <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="space-y-1.5">
                  <Label htmlFor="expires" className="text-xs font-semibold text-gray-500">Gösterim Süresi *</Label>
                  <Select
                    value={formData.expiresInDays}
                    onValueChange={(value) => {
                      const daysMap: { [key: string]: number } = {
                        '1': 1, '3': 3, '7': 7, '30': 30
                      }
                      const newFormData = { ...formData, expiresInDays: value }
                      if (value !== 'custom') {
                        const days = daysMap[value] || 1
                        newFormData.expiresAtDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                      }
                      setFormData(newFormData)
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
                    min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    value={formData.expiresAtDate}
                    onChange={(e) => setFormData({ ...formData, expiresAtDate: e.target.value })}
                    required
                    readOnly={formData.expiresInDays !== 'custom'}
                    className={`h-9 ${formData.expiresInDays !== 'custom' ? 'bg-gray-50 cursor-not-allowed text-gray-500' : ''}`}
                  />
                </div>
              </div>

              {/* Link */}
              <div className="space-y-1.5">
                <Label htmlFor="link" className="text-sm font-semibold text-gray-700">Bağlantı URL (Opsiyonel)</Label>
                <Input
                  id="link"
                  type="url"
                  value={formData.link}
                  onChange={(e) =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                  className="bg-white border-gray-200 shadow-sm focus:ring-yellow-400"
                  placeholder="https://example.com"
                />
              </div>

              {/* Images */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="image" className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-gray-500" />
                    Resimler
                  </Label>
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{formData.imageUrls.length}/5</span>
                </div>

                {formData.imageUrls.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 mt-2 mb-2">
                    {formData.imageUrls.map((url, index) => (
                      <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-sm transform transition duration-300 hover:scale-105">
                        <img src={url} alt={`Resim ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
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

                {formData.imageUrls.length < 5 && (
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full h-16 border-dashed border-2 flex flex-col gap-1 items-center justify-center text-gray-500 bg-gray-50 hover:text-gray-800 hover:bg-gray-100 hover:border-gray-400 rounded-lg transition-colors border-gray-200"
                      onClick={() => document.getElementById('image-upload')?.click()}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      <span className="text-xs font-medium">Bırakın veya Seçin</span>
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
            </form>
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
                    ${colors.find(c => c.value === formData.color)?.class || 'bg-yellow-200'}
                  `}>
                    <div className="absolute top-0 bottom-0 left-0 border-l-[3px] border-black/5 mix-blend-multiply pointer-events-none" />
                    
                    {formData.pushpin && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 w-8 h-8 drop-shadow-lg group-hover:-translate-y-1 transition-transform">
                        <img src={pushpins.find(p => p.value === formData.pushpin)?.image || '/pushpins/red.png'} alt="pin" className="w-full h-full object-contain" />
                      </div>
                    )}
                    
                    <p className={`
                      text-sm opacity-80 overflow-hidden leading-relaxed
                      ${fonts.find(f => f.value === formData.font)?.class || 'font-handwriting'}
                    `}
                    style={{
                      WebkitLineClamp: 5,
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      wordBreak: 'break-word'
                    }}
                    >
                      {formData.content || 'Aklınızdaki harika fikri buraya yazın...'}
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
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`
                        ${color.class} aspect-square rounded-full border-2 transition-all transform hover:scale-110 shadow-sm
                        ${formData.color === color.value ? 'border-gray-800 ring-2 ring-gray-800 ring-offset-2 scale-110' : 'border-transparent'}
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
                      onClick={() => setFormData({ ...formData, font: font.value })}
                      className={`
                        h-9 rounded-lg border flex items-center justify-center transition-all bg-white
                        ${formData.font === font.value ? 'border-gray-800 ring-1 ring-gray-800 bg-gray-50 font-bold shadow-sm' : 'border-gray-200 text-gray-600 hover:border-gray-400'}
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
                  {pushpins.map((pin) => (
                    <button
                      key={pin.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, pushpin: pin.value })}
                      className={`
                        aspect-square rounded-xl bg-gray-50 border flex items-center justify-center transition-all group hover:bg-white hover:shadow-sm
                        ${formData.pushpin === pin.value ? 'border-gray-800 ring-1 ring-gray-800 bg-white shadow-sm' : 'border-gray-100'}
                      `}
                      title={pin.label}
                    >
                      <img
                        src={pin.image}
                        alt={pin.label}
                        className={`w-6 h-6 object-contain filter transition-transform group-hover:scale-110 ${formData.pushpin === pin.value ? 'drop-shadow-md' : 'drop-shadow-sm'}`}
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
                onClick={() => setOpen(false)}
                disabled={loading}
                className="text-gray-500 hover:text-gray-800 font-medium"
              >
                İptal Et
              </Button>
              <Button 
                type="submit" 
                form="postit-form"
                disabled={loading}
                className="bg-gray-900 hover:bg-black text-white px-6 font-medium shadow-lg hover:shadow-xl transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gönderiliyor
                  </>
                ) : (
                  'Panoya As'
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
