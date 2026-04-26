'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'react-hot-toast'
import { Loader2, User, Building2, Phone, CreditCard, Mail, Lock, Save, Eye, EyeOff, MapPin, Bell, Camera } from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  name: string | null
  image: string | null
  nickname: string | null
  companyName: string | null
  phone: string | null
  taxId: string | null
  role: string
  createdAt: string
  cityId: string | null
  districtId: string | null
  telegramChatId: string | null
  telegramConnectionToken: string | null
  telegramTokenExpiresAt: string | null
  receiveEmail: boolean
  receiveTelegram: boolean
  showAvatarInPostit: boolean
  _count: {
    postits: number
  }
  wallSubscriptions?: {
    id: string
    categoryId: string
    category: {
      id: string
      name: string
      icon?: string | null
    }
  }[]
  following?: {
    id: string
    followingId: string
    following: {
      id: string
      name: string | null
      nickname: string | null
      image: string | null
    }
  }[]
}

interface City {
  id: string
  name: string
}

interface District {
  id: string
  name: string
  cityId: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession() || {}
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [telegramConnecting, setTelegramConnecting] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  // Profile form
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    companyName: '',
    phone: '',
    taxId: '',
    email: '',
    cityId: '',
    districtId: '',
    receiveEmail: true,
    receiveTelegram: true,
    showAvatarInPostit: true,
    image: ''
  })

  // Location data
  const [cities, setCities] = useState<City[]>([])
  const [districts, setDistricts] = useState<District[]>([])

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      loadProfile()
    }
  }, [session])

  const loadProfile = async () => {
    try {
      const [profileRes, locationsRes] = await Promise.all([
        fetch('/api/profile'),
        fetch('/api/locations')
      ])

      const profileData = await profileRes.json()
      const locationsData = await locationsRes.json()

      if (locationsData.cities) setCities(locationsData.cities)
      if (locationsData.districts) setDistricts(locationsData.districts)

      if (profileData.user) {
        setProfile(profileData.user)
        setFormData({
          name: profileData.user.name || '',
          nickname: profileData.user.nickname || '',
          companyName: profileData.user.companyName || '',
          phone: profileData.user.phone || '',
          taxId: profileData.user.taxId || '',
          email: profileData.user.email || '',
          cityId: profileData.user.cityId || '',
          districtId: profileData.user.districtId || '',
          receiveEmail: profileData.user.receiveEmail ?? true,
          receiveTelegram: profileData.user.receiveTelegram ?? true,
          showAvatarInPostit: profileData.user.showAvatarInPostit ?? true,
          image: profileData.user.image || ''
        })
      }
    } catch (error) {
      toast.error('Profil yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload = { ...formData };
      if (!payload.image) delete (payload as any).image;

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Güncelleme başarısız')
      }

      toast.success('Profil bilgileri güncellendi')
      loadProfile()
    } catch (error: any) {
      toast.error(error.message || 'Bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Dosya boyutu çok büyük (Max 50MB)')
      return
    }

    const toastId = toast.loading('Fotoğraf yükleniyor...')
    try {
      const uploadData = new FormData()
      uploadData.append('file', file)

      const res = await fetch('/api/upload/local', {
        method: 'POST',
        body: uploadData
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Yükleme başarısız')
      }

      setFormData(prev => ({ ...prev, image: data.fileUrl }))
      toast.success('Fotoğraf yüklendi', { id: toastId })
    } catch (error: any) {
      toast.error(error.message, { id: toastId })
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Şifreler eşleşmiyor')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır')
      return
    }

    setSavingPassword(true)

    try {
      const res = await fetch('/api/profile/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordForm)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Şifre değiştirme başarısız')
      }

      toast.success('Şifre başarıyla değiştirildi')
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error: any) {
      toast.error(error.message || 'Bir hata oluştu')
    } finally {
      setSavingPassword(false)
    }
  }

  const handleConnectTelegram = async () => {
    setTelegramConnecting(true)
    try {
      const res = await fetch('/api/telegram/connect', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Bağlantı oluşturulamadı')
      
      toast.success('Bağlantı tokenı oluşturuldu')
      setProfile(prev => prev ? { ...prev, telegramConnectionToken: data.token, telegramTokenExpiresAt: data.expiresAt } : null)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setTelegramConnecting(false)
    }
  }

  const handleDisconnectTelegram = async () => {
    try {
      const res = await fetch('/api/telegram/connect', { method: 'DELETE' })
      if (!res.ok) throw new Error('Bağlantı kaldırılamadı')
      toast.success('Telegram bağlantısı kaldırıldı')
      setProfile(prev => prev ? { ...prev, telegramChatId: null, telegramConnectionToken: null, telegramTokenExpiresAt: null } : null)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleUnsubscribe = async (categoryId: string) => {
    try {
      const res = await fetch(`/api/walls/${categoryId}/subscribe`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'İşlem başarısız')
      toast.success(data.message)
      // Remove from list immediately to reflect UI state
      setProfile(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          wallSubscriptions: prev.wallSubscriptions?.filter(sub => sub.categoryId !== categoryId)
        }
      })
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleUserUnsubscribe = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/follow`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'İşlem başarısız')
      toast.success("Takipten çıkıldı")
      
      setProfile(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          following: prev.following?.filter(sub => sub.followingId !== userId)
        }
      })
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'Süper Admin'
      case 'WALL_MANAGER': return 'Duvar Yöneticisi'
      default: return 'Kullanıcı'
    }
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <User className="w-8 h-8 text-purple-500" />
            Profil Bilgilerim
          </h1>
          <p className="text-gray-600 mt-2">
            Kişisel ve firma bilgilerinizi görüntüleyin ve düzenleyin.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="text-2xl font-bold text-purple-600">
              {profile?._count?.postits || 0}
            </div>
            <div className="text-sm text-gray-500">Toplam Post</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="text-lg font-semibold text-gray-800">
              {profile && getRoleLabel(profile.role)}
            </div>
            <div className="text-sm text-gray-500">Rol</div>
          </div>
        </div>

        {/* Subscriptions */}
        {profile?.wallSubscriptions && profile.wallSubscriptions.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5 text-yellow-500" />
              Abone Olduğum Duvarlar
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile.wallSubscriptions.map(sub => (
                <div key={sub.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-purple-200 transition-colors">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800">{sub.category.name}</span>
                    <span className="text-xs text-gray-500">Yeni bildirimler için abone</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200 shrink-0"
                    onClick={() => handleUnsubscribe(sub.categoryId)}
                  >
                    Takipten Çık
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {profile?.following && profile.following.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-500" />
              Takip Ettiğim Kullanıcılar
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile.following.map(sub => (
                <div key={sub.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-purple-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold overflow-hidden shrink-0">
                      {sub.following.image ? (
                        <img src={sub.following.image} alt={sub.following.name || ''} className="object-cover w-full h-full" />
                      ) : (
                        (sub.following.nickname || sub.following.name || 'A')[0].toUpperCase()
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">{sub.following.nickname || sub.following.name || 'Anonim'}</span>
                      <span className="text-xs text-gray-500">Kullanıcı gönderileri takip ediliyor</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200 shrink-0 ml-2"
                    onClick={() => handleUserUnsubscribe(sub.followingId)}
                  >
                    Takipten Çık
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <User className="w-5 h-5" />
            Kişisel Bilgiler
          </h2>

          <div className="flex flex-col items-center justify-center mb-8 gap-4">
            <div className="relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-purple-100 bg-gray-100 flex items-center justify-center">
                {formData.image ? (
                  <img src={formData.image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <Label 
                htmlFor="avatar-upload" 
                className="absolute bottom-0 right-0 w-8 h-8 sm:w-10 sm:h-10 bg-purple-600 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-purple-700 shadow-lg border-2 border-white transition-transform hover:scale-105"
                title="Fotoğraf Yükle"
              >
                <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
              </Label>
              <Input 
                id="avatar-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload}
              />
            </div>
            
            <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
              <input
                type="checkbox"
                id="showAvatarInPostit"
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                checked={formData.showAvatarInPostit}
                onChange={(e) => setFormData({ ...formData, showAvatarInPostit: e.target.checked })}
              />
              <Label htmlFor="showAvatarInPostit" className="font-normal cursor-pointer text-sm text-gray-600">
                Profil fotoğrafımı yazdığım postitlerde göster
              </Label>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  Adı Soyadı
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Adınız Soyadınız"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="nickname" className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  Takma Ad (Nickname)
                </Label>
                <Input
                  id="nickname"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  placeholder="Kullanıcı Takma Adı"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  E-posta Adresi
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ornek@email.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="companyName" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  Firma Adı
                </Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Firma adınız"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  Telefon Numarası
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0532 123 45 67"
                  className="mt-1"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="taxId" className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  T.C. Kimlik / Vergi No
                </Label>
                <Input
                  id="taxId"
                  value={formData.taxId}
                  onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                  placeholder="T.C. Kimlik veya Vergi Numarası"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  İl
                </Label>
                <Select
                  value={formData.cityId || 'none'}
                  onValueChange={(value) => {
                    setFormData({
                      ...formData,
                      cityId: value === 'none' ? '' : value,
                      districtId: '' // Reset district when city changes
                    })
                  }}
                >
                  <SelectTrigger className="mt-1">
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

              <div>
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  İlçe
                </Label>
                <Select
                  value={formData.districtId || 'none'}
                  onValueChange={(value) => setFormData({ ...formData, districtId: value === 'none' ? '' : value })}
                  disabled={!formData.cityId}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="İlçe seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">İlçe Yok</SelectItem>
                    {formData.cityId && districts
                      .filter(d => d.cityId === formData.cityId)
                      .map(district => (
                        <SelectItem key={district.id} value={district.id}>{district.name}</SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2 space-y-4 pt-4 border-t mt-2">
                <h3 className="font-medium text-sm text-gray-700">Bildirim Tercihleri</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="unsubscribeEmail"
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                    checked={!formData.receiveEmail}
                    onChange={(e) => setFormData({ ...formData, receiveEmail: !e.target.checked })}
                  />
                  <Label htmlFor="unsubscribeEmail" className="font-normal cursor-pointer">
                    Panodasehir den &quot;Mail almak istemiyorum&quot;
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="unsubscribeTelegram"
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                    checked={!formData.receiveTelegram}
                    onChange={(e) => setFormData({ ...formData, receiveTelegram: !e.target.checked })}
                  />
                  <Label htmlFor="unsubscribeTelegram" className="font-normal cursor-pointer">
                    Bildirim Almak İstemiyorum (Telegram mesajları kapatılır)
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={saving} className="gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Bilgileri Kaydet
              </Button>
            </div>
          </form>
        </div>

        {/* Telegram Connection Form */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-blue-500"><path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-18 8.019c-.93.414-1.22 1.638-.553 2.409l4.5 5.174 2.146 6.012a2.001 2.001 0 0 0 3.731.258l2.972-5.945 4.318 4.318c.84.84 2.29.351 2.476-.827l3.053-17.683a2.243 2.243 0 0 0-3.621-2.031v-.001h.001z"/><path d="m11 11 4-4"/></svg>
            Telegram Bildirimleri
          </h2>

          <div className="space-y-4">
            {profile?.telegramChatId ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <h3 className="font-semibold text-green-800">✅ Telegram Hesabınız Bağlı</h3>
                  <p className="text-sm text-green-600">Platform üzerindeki bildirimleri ve onay taleplerini anında Telegram üzerinden alabilirsiniz.</p>
                </div>
                <Button type="button" variant="destructive" size="sm" onClick={handleDisconnectTelegram} className="mt-3 sm:mt-0">
                  Bağlantıyı Kaldır
                </Button>
              </div>
            ) : profile?.telegramConnectionToken ? (
               <div className="flex flex-col items-center p-6 bg-blue-50 rounded-lg border border-blue-200 text-center">
                  <h3 className="font-semibold text-blue-800 mb-2">Eşleştirme Bekleniyor</h3>
                  <p className="text-sm text-blue-700 mb-4">Lütfen Telegram botumuza giderek aşağıdaki kodu mesaj olarak gönderin veya Bota Git butonuna tıklayın:</p>
                  
                  <div className="bg-white px-4 py-2 rounded font-mono text-lg font-bold border border-blue-300 shadow-sm mb-4">
                    /start {profile.telegramConnectionToken}
                  </div>
                  
                  <div className="flex gap-4">
                     <a href={`https://t.me/Panodasehir_bot?start=${profile.telegramConnectionToken}`} target="_blank" rel="noopener noreferrer">
                        <Button type="button" className="bg-[#0088cc] hover:bg-[#0077b5] text-white">Bota Git</Button>
                     </a>
                     <Button type="button" variant="outline" onClick={handleDisconnectTelegram}>İptal Et</Button>
                  </div>
                  <p className="text-xs text-blue-500 mt-4">Not: Bu bağlantının süresi 15 dakika içinde dolacaktır.</p>
               </div>
            ) : (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-4">
                    Telegram hesabınızı bağlayarak yeni postit ve yorumlardan anında haberdar olabilir, yetkili olduğunuz ağlardaki onay bekleyen içerikleri Telegram üzerinden yönetebilirsiniz.
                  </p>
                  <Button type="button" onClick={handleConnectTelegram} disabled={telegramConnecting} className="bg-[#0088cc] hover:bg-[#0077b5] text-white gap-2">
                    {telegramConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Telegram Hesabını Bağla
                  </Button>
                </div>
            )}
          </div>
        </div>

        {/* Password Change Form */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Şifre Değiştir
          </h2>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Mevcut Şifre</Label>
              <div className="relative mt-1">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Mevcut şifreniz"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Google ile giriş yaptıysanız bu alanı boş bırakabilirsiniz.
              </p>
            </div>

            <div>
              <Label htmlFor="newPassword">Yeni Şifre</Label>
              <div className="relative mt-1">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Yeni şifreniz (en az 6 karakter)"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
              <div className="relative mt-1">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Yeni şifrenizi tekrar girin"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={savingPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                variant="outline"
                className="gap-2"
              >
                {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                Şifreyi Değiştir
              </Button>
            </div>
          </form>
        </div>

        {/* Account Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Hesap oluşturulma tarihi: {profile && new Date(profile.createdAt).toLocaleDateString('tr-TR')}
        </div>
      </div>
    </div>
  )
}
