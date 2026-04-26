'use client'

import { useState, useEffect, useRef } from 'react'
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
import { Plus, Upload, Loader2, X, Image as ImageIcon, Play } from 'lucide-react'
import toast from 'react-hot-toast'
import TipTapSmallEditor from '@/components/editor/TipTapSmallEditor'
import { stripHtml } from '@/lib/utils'

interface Category {
  id: string
  name: string
  depth?: number
  userGroupId?: string | null
  [key: string]: any
}

interface PostItFormProps {
  categories: Category[]
  userGroupIds?: string[]
  userRole?: string | null
  defaultCategoryId?: string
  isMobileFab?: boolean
  customTrigger?: React.ReactNode
}

export function PostItForm({ 
  categories, 
  isMobileFab = false,
  customTrigger,
  defaultCategoryId,
  userGroupIds,
  userRole
}: PostItFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Find the first valid category for this user (for fallback)
  const firstValidCategory = categories?.find(cat => {
    if (cat.name === 'Ana Duvar') return false
    if (!cat.userGroupId) return true
    if (userRole === 'SUPER_ADMIN') return true
    return userGroupIds?.includes(cat.userGroupId)
  })?.id || ''

  const [formData, setFormData] = useState<{
    content: string
    detail: string
    imageUrls: string[]
    link: string
    color: string
    font: string
    pushpin: string
    categoryId: string
    expiresInDays: string
    expiresAtDate: string
    textSize: string
    textColor: string
  }>({
    content: '',
    detail: '',
    imageUrls: [],
    link: '',
    color: 'YELLOW',
    font: 'MODERN',
    pushpin: 'RED',
    categoryId: defaultCategoryId ?? firstValidCategory,
    expiresInDays: '1',
    expiresAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    textSize: 'text-base',
    textColor: '#1f2937',
  })

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
      // Allow fallback if user doesn't have permission for default
      setFormData(prev => ({ ...prev, categoryId: defaultCategoryId }))
    } else if (firstValidCategory) {
      setFormData(prev => ({ ...prev, categoryId: firstValidCategory }))
    }
  }, [defaultCategoryId, firstValidCategory])

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      // Find selected or default category
      // Use the prop defaultCategoryId as the primary source of truth for the "current wall" context
      const targetCatId = defaultCategoryId || formData.categoryId || firstValidCategory
      const targetCat = categories.find(c => c.id === targetCatId)

      // Permission check logic
      console.log('Permission Check:', {
        userRole,
        userGroupIds,
        targetCatName: targetCat?.name,
        targetCatUserGroupId: targetCat?.userGroupId
      })
      if (targetCat?.userGroupId) {
        if (userRole !== 'SUPER_ADMIN' && !userGroupIds?.includes(targetCat.userGroupId)) {
          toast.error('Bu duvara post-it ekleme yetkiniz yok (Grup Kısıtlaması).')
          return
        }
      }

      // Ensure the form data is correct before opening
      setFormData(prev => ({
        ...prev,
        categoryId: targetCatId,
        expiresInDays: '1',
        expiresAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }))
    }
    setOpen(isOpen)
  }
  const [uploadingImage, setUploadingImage] = useState(false)

  const colors = [
    { value: 'YELLOW', label: 'Sarı', class: 'bg-yellow-200' },
    { value: 'PINK', label: 'Pembe', class: 'bg-pink-200' },
    { value: 'BLUE', label: 'Mavi', class: 'bg-blue-200' },
    { value: 'GREEN', label: 'Yeşil', class: 'bg-green-200' },
    { value: 'ORANGE', label: 'Turuncu', class: 'bg-orange-200' },
    { value: 'PURPLE', label: 'Mor', class: 'bg-purple-200' },
    { value: 'WHITE', label: 'Beyaz', class: 'bg-white' },
    { value: 'DARK', label: 'Siyah', class: 'bg-gray-900 border-gray-700' },
    { value: 'TRANSPARENT', label: 'Şeffaf (Saydam)', class: 'bg-transparent border-dashed border-gray-400' },
    { value: 'GLASS', label: 'Buzlu Cam', class: 'bg-white/30 backdrop-blur-md border-white/40' },
  ]

  const fonts = [
    { value: 'HANDWRITING', label: 'El Yazısı', class: 'font-handwriting' },
    { value: 'SERIF', label: 'Serif', class: 'font-serif' },
    { value: 'SANS', label: 'Sans', class: 'font-sans' },
    { value: 'MONO', label: 'Mono', class: 'font-mono' },
    { value: 'CURSIVE', label: 'Cursive', class: 'font-cursive' },
    { value: 'SYSTEM', label: 'Sistem', class: 'font-system' },
    { value: 'MODERN', label: 'Modern', class: 'font-modern' },
    { value: 'COMIC', label: 'Eğlenceli', class: 'font-comic' },
  ]

  const pushpins = [
    { value: 'RED', label: 'Kırmızı', image: '/pushpins/red.png' },
    { value: 'BLUE', label: 'Mavi', image: '/pushpins/blue.png' },
    { value: 'GOLD', label: 'Altın', image: '/pushpins/gold.png' },
    { value: 'GREEN', label: 'Yeşil', image: '/pushpins/green.png' },
    { value: 'PINK', label: 'Pembe', image: '/pushpins/pink.png' },
    { value: 'SILVER', label: 'Gümüş', image: '/pushpins/silver.png' },
    { value: 'BLACK', label: 'Siyah Kıskaç', image: '/pushpins/clip.png' },
    { value: 'TAPE', label: 'Bant', image: '/pushpins/tape.png' },
    { value: 'NONE', label: 'İğnesiz', image: '' },
  ]

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (formData.imageUrls.length >= 10) {
      toast.error('En fazla 10 medya ekleyebilirsiniz')
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Dosya boyutu 50MB\'dan küçük olmalıdır')
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
      toast.error('İçerik (Özet) gereklidir')
      return
    }

    if (formData.content.length > 750) {
      toast.error('Özet en fazla 750 karakter olabilir')
      return
    }

    if (formData.detail && stripHtml(formData.detail).length > 2000) {
      toast.error('Detay en fazla 2000 karakter olabilir')
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
        detail: '',
        imageUrls: [],
        link: '',
        color: 'YELLOW',
        font: 'MODERN',
        pushpin: 'RED',
        categoryId: categories?.find(c => c.name !== 'Ana Duvar')?.id ?? '',
        expiresInDays: '1',
        expiresAtDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        textSize: 'text-base',
        textColor: '#1f2937',
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
        {customTrigger ? customTrigger : (isMobileFab ? (
          <Button size="icon" className="gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-amber-950 shadow-xl border-0 transition-all hover:scale-105 fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center">
            <Plus className="w-8 h-8" />
          </Button>
        ) : (
          <Button size="lg" className="gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-amber-950 font-semibold shadow-md border-0 transition-all hover:scale-105">
            <Plus className="w-5 h-5" />
            Yeni Post-it Ekle
          </Button>
        ))}
      </DialogTrigger>
      <DialogContent className="max-w-6xl w-[95vw] sm:w-full max-h-[90vh] overflow-hidden p-0 border border-white/20 bg-white/60 backdrop-blur-xl rounded-[24px] shadow-2xl">
        <div className="bg-white/95 h-[90vh] sm:h-[85vh] overflow-y-auto sm:overflow-hidden block sm:flex sm:flex-row min-h-0 w-full">

          {/* LEFT COLUMN - CONTENT & SETTINGS */}
          <div className="flex-1 p-6 sm:p-10 sm:overflow-y-auto bg-white sm:min-h-0 min-h-0 relative">
            <div className="mb-8">
              <DialogTitle className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
                <div className="bg-yellow-400 p-2 rounded-xl shadow-inner border border-yellow-300">
                  <Plus className="w-5 h-5 text-yellow-900" strokeWidth={3} />
                </div>
                Yeni Not Oluştur
              </DialogTitle>
              <DialogDescription className="text-slate-500 mt-2 text-[15px]">
                Duvarları renklendirecek sıradaki fikrinizi tasarlayın.
              </DialogDescription>
            </div>

            <form id="postit-form" onSubmit={handleSubmit} className="space-y-7">
              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-[13px] uppercase tracking-wider font-bold text-slate-500 ml-1">Kategori (Duvar) *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoryId: value })
                  }
                >
                  <SelectTrigger className="h-12 bg-slate-50/50 hover:bg-slate-100/50 border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] focus:ring-2 focus:ring-slate-900 rounded-2xl transition-all">
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.filter(cat => {
                      if (cat.name === 'Ana Duvar') return false // Hide Ana Duvar
                      if (!cat.userGroupId) return true // Public category
                      if (userRole === 'SUPER_ADMIN') return true // Super admin sees all
                      return userGroupIds?.includes(cat.userGroupId) // User must belong to group
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
              <div className="space-y-2">
                <Label htmlFor="content" className="text-[13px] uppercase tracking-wider font-bold text-slate-500 ml-1">Özet (İçerik) *</Label>
                {categories?.find(c => c.id === formData.categoryId)?.ottCardStyle === 'polaroid' || categories?.find(c => c.id === formData.categoryId)?.postitAppearance?.ottCardStyle === 'polaroid' ? (
                  <TipTapSmallEditor
                    content={formData.content}
                    onChange={(html) => setFormData({ ...formData, content: html })}
                    placeholder="İnsanların görmesini istediğiniz fikri buraya dökün..."
                    maxLength={750}
                  />
                ) : (
                  <>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      placeholder="İnsanların görmesini istediğiniz fikri buraya dökün..."
                      className="bg-slate-50/50 hover:bg-slate-100/50 border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] focus:ring-2 focus:ring-slate-900 resize-none rounded-[20px] transition-all p-4 text-base leading-relaxed"
                      rows={4}
                      maxLength={750}
                      required
                    />
                    <div className="flex justify-end p-1">
                      <span className={`text-xs ${formData.content.length > 700 ? 'text-orange-500 font-bold' : 'text-gray-400'}`}>
                        {formData?.content?.length ?? 0}/750
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Detail */}
              <div className="space-y-2">
                <Label htmlFor="detail" className="text-[13px] uppercase tracking-wider font-bold text-slate-500 ml-1">Detay (Genişletilmiş İçerik)</Label>
                <TipTapSmallEditor
                  content={formData.detail}
                  onChange={(html) => setFormData({ ...formData, detail: html })}
                  placeholder="Detaylı bilgi eklemek isterseniz buraya yazın..."
                  maxLength={2000}
                />
              </div>

              {/* Expiration */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50/60 p-5 rounded-[20px] border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
                <div className="space-y-2">
                  <Label htmlFor="expires" className="text-[12px] uppercase tracking-wider font-bold text-slate-500">Gösterim Süresi *</Label>
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
                    min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    value={formData.expiresAtDate}
                    onChange={(e) => setFormData({ ...formData, expiresAtDate: e.target.value })}
                    required
                    readOnly={formData.expiresInDays !== 'custom'}
                    className={`h-11 rounded-xl shadow-sm border-slate-200 transition-colors focus:ring-2 focus:ring-slate-900 ${formData.expiresInDays !== 'custom' ? 'bg-slate-100 cursor-not-allowed text-slate-400 border-slate-100' : 'bg-white hover:bg-slate-50'}`}
                  />
                </div>
              </div>

              {/* Link */}
              <div className="space-y-2">
                <Label htmlFor="link" className="text-[13px] uppercase tracking-wider font-bold text-slate-500 ml-1">Harici Bağlantı (Opsiyonel)</Label>
                <Input
                  id="link"
                  type="url"
                  value={formData.link}
                  onChange={(e) =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                  className="h-11 bg-slate-50/50 hover:bg-slate-100/50 border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] focus:ring-2 focus:ring-slate-900 rounded-[14px] transition-all px-4"
                  placeholder="https://örnek.com"
                />
              </div>

              {/* Images */}
              <div className="space-y-3 bg-slate-50/40 p-5 rounded-[24px] border border-slate-100/50 shadow-inner">
                <div className="flex items-center justify-between">
                  <Label htmlFor="image" className="text-[13px] uppercase tracking-wider font-bold text-slate-600 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-slate-400" />
                    Medya Galerisi
                  </Label>
                  <span className="text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1 rounded-full shadow-sm font-semibold">{formData.imageUrls.length}/10</span>
                </div>

                {formData.imageUrls.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 mt-2 mb-2">
                    {formData.imageUrls.map((url, index) => (
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

                {formData.imageUrls.length < 10 && (
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full h-16 border-dashed border-2 flex flex-col gap-1 items-center justify-center text-slate-500 bg-white hover:text-slate-800 hover:bg-slate-50 hover:border-slate-400 rounded-[14px] transition-colors border-slate-200 shadow-sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Upload className="w-5 h-5 mb-0.5" />
                      )}
                      <span className="text-[11px] uppercase tracking-wider font-bold">Bırakın veya Seçin</span>
                    </Button>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/mp4,video/webm"
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
                    ${colors.find(c => c.value === formData.color)?.class || 'bg-yellow-200'}
                  `}>
                    <div className="absolute top-0 bottom-0 left-0 border-l-[3px] border-black/5 mix-blend-multiply pointer-events-none" />

                    {formData.pushpin && formData.pushpin !== 'NONE' && (
                      <div className={`absolute ${formData.pushpin === 'TAPE' ? '-top-3' : '-top-4'} left-1/2 -translate-x-1/2 z-10 ${formData.pushpin === 'TAPE' ? 'w-16 h-8 opacity-80' : 'w-8 h-8'} drop-shadow-lg group-hover:-translate-y-1 transition-transform`}>
                        <img 
                          src={pushpins.find(p => p.value === formData.pushpin)?.image || '/pushpins/red.png'} 
                          alt="pin" 
                          className="w-full h-full object-contain" 
                          onError={(e) => {
                            // Fallback to red logic if custom pins are missing in public/ folder temporarily
                            (e.target as HTMLImageElement).src = '/pushpins/red.png'
                          }}
                        />
                      </div>
                    )}

                    <p className={`
                      opacity-80 overflow-hidden leading-relaxed
                      ${fonts.find(f => f.value === formData.font)?.class || 'font-handwriting'}
                    `}
                      style={{
                        color: formData.textColor,
                        fontSize: ({ 'text-xs': '0.75rem', 'text-sm': '0.875rem', 'text-base': '1rem', 'text-lg': '1.125rem', 'text-xl': '1.25rem', 'text-2xl': '1.5rem', 'text-3xl': '1.875rem' } as any)[formData.textSize] || '1rem',
                        WebkitLineClamp: 5,
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        wordBreak: 'break-word',
                      }}
                    >
                      {stripHtml(formData.content) || 'Aklınızdaki harika fikri buraya yazın...'}
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
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`
                        ${color.class} w-10 h-10 rounded-[14px] border-2 transition-all transform hover:scale-[1.15] shadow-sm
                        ${formData.color === color.value ? 'border-slate-800 ring-2 ring-slate-800 ring-offset-2 scale-110 shadow-md' : 'border-slate-200'}
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
                      onClick={() => setFormData({ ...formData, font: font.value })}
                      className={`
                        px-3.5 py-2 rounded-xl border flex items-center justify-center transition-all bg-white whitespace-nowrap shadow-sm
                        ${formData.font === font.value ? 'border-slate-800 ring-2 ring-slate-800 text-slate-900 font-bold shadow-md transform scale-[1.03]' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}
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
                      value={formData.textSize}
                      onValueChange={(value) => setFormData({ ...formData, textSize: value })}
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
                      <div className="absolute inset-0 m-auto w-full h-full rounded-full" style={{ backgroundColor: formData.textColor }}></div>
                      <input 
                        type="color" 
                        title="Metin Rengi"
                        value={formData.textColor} 
                        onChange={(e) => setFormData({...formData, textColor: e.target.value})} 
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
                  {pushpins.map((pin) => (
                    <button
                      key={pin.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, pushpin: pin.value })}
                      className={`
                        w-[46px] h-[46px] rounded-[14px] bg-white border flex items-center justify-center transition-all group hover:bg-slate-50 hover:shadow-md
                        ${formData.pushpin === pin.value ? 'border-slate-900 ring-2 ring-slate-900 shadow-sm scale-110' : 'border-slate-200 shadow-sm'}
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
                          className={`w-6 h-6 object-contain filter transition-transform group-hover:scale-125 ${formData.pushpin === pin.value ? 'drop-shadow-lg' : 'drop-shadow-md'}`}
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
                onClick={() => setOpen(false)}
                disabled={loading}
                className="text-slate-500 hover:text-slate-900 font-bold"
              >
                İptal Et
              </Button>
              <Button
                type="submit"
                form="postit-form"
                disabled={loading}
                className="bg-slate-900 hover:bg-black text-white px-8 py-6 h-12 rounded-2xl font-extrabold shadow-[0_8px_20px_-6px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_25px_-8px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 transition-all text-[15px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Gönderiliyor
                  </>
                ) : (
                  '✔ Panoya As ve Yayınla'
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
