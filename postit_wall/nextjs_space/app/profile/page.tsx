'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'react-hot-toast'
import { Loader2, User, Building2, Phone, CreditCard, Mail, Lock, Save, Eye, EyeOff, MapPin } from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  name: string | null
  companyName: string | null
  phone: string | null
  taxId: string | null
  role: string
  createdAt: string
  cityId: string | null
  districtId: string | null
  _count: {
    postits: number
  }
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
  const [profile, setProfile] = useState<UserProfile | null>(null)

  // Profile form
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    phone: '',
    taxId: '',
    email: '',
    cityId: '',
    districtId: ''
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
          companyName: profileData.user.companyName || '',
          phone: profileData.user.phone || '',
          taxId: profileData.user.taxId || '',
          email: profileData.user.email || '',
          cityId: profileData.user.cityId || '',
          districtId: profileData.user.districtId || ''
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
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
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

        {/* Profile Form */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <User className="w-5 h-5" />
            Kişisel Bilgiler
          </h2>

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
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={saving} className="gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Bilgileri Kaydet
              </Button>
            </div>
          </form>
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
