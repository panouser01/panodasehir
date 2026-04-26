'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Public_Sans } from 'next/font/google'
const publicSans = Public_Sans({ subsets: ['latin'], weight: ['800', '900'] })

export default function MerchantRegisterPage() {
  const router = useRouter()
  const [cities, setCities] = useState<any[]>([])
  const [districts, setDistricts] = useState<any[]>([])

  const [merchantSoleCityId, setMerchantSoleCityId] = useState('')
  const [merchantSoleDistrictId, setMerchantSoleDistrictId] = useState('')
  const [merchantCorpCityId, setMerchantCorpCityId] = useState('')
  const [merchantCorpDistrictId, setMerchantCorpDistrictId] = useState('')

  const [categories, setCategories] = useState<any[]>([])
  const [selectedWalls, setSelectedWalls] = useState<string[]>([])


  const [isSubmitting, setIsSubmitting] = useState(false);

  const uploadFile = async (file: File) => {
    if (!file || file.size === 0) return null;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload/local', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        return data.url || data.fileUrl || data.filepath;
      }
    } catch(e) {
      console.error(e);
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, type: 'SOLE' | 'CORP') => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formElement = e.currentTarget;
      const data = new FormData(formElement);
      const payload: any = { companyType: type, selectedWallIds: selectedWalls };
      
      if (type === 'SOLE') {
        payload.cityId = merchantSoleCityId;
        payload.districtId = merchantSoleDistrictId;
      } else {
        payload.cityId = merchantCorpCityId;
        payload.districtId = merchantCorpDistrictId;
      }

      for (const [key, value] of Array.from(data.entries())) {
        if (value instanceof File && value.size > 0 && value.name) {
          const uploadedUrl = await uploadFile(value);
          payload[key] = uploadedUrl;
        } else if (typeof value === 'string') {
          payload[key] = value;
        }
      }

      const res = await fetch('/api/auth/merchant-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const result = await res.json();
      if (res.ok) {
        alert(result.message || 'Başvurunuz başarıyla alındı!');
        router.push('/');
      } else {
        alert(result.error || 'Kayıt sırasında hata oluştu.');
      }
    } catch (err) {
      console.error('Submit error', err);
      alert('Sistemsel bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };


  useEffect(() => {
    fetch('/api/locations')
      .then(res => res.json())
      .then(data => {
        setCities(data?.cities ?? [])
        setDistricts(data?.districts ?? [])
      })
      .catch(console.error)

    fetch('/api/categories', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        const fetchedCats = data?.categories ?? [];
        
        // Benzersiz elemanları tut (API zaten hepsini flat/düz liste olarak veriyor ve kendi içlerinde children barındırıyor)
        // Her ihtimale karşı mükerrer kaydı id üzerinden engelleyelim
        const uniqueCatsMap = new Map();
        fetchedCats.forEach((c: any) => uniqueCatsMap.set(c.id, c));
        const uniqueCats = Array.from(uniqueCatsMap.values());

        // Hava durumu, Ana Duvar gibi sistem duvarlarını ve Özel Duvar (Gizlilik) işaretli olanları filtrele
        const filteredCats = uniqueCats.filter((c: any) => 
          c.name.toLowerCase() !== 'hava durumu' && 
          c.name.toLowerCase() !== 'ana duvar' && 
          c.isSystem !== true &&
          c.isPrivate !== true // Özel duvarlar gelmez
        );
        
        setCategories(filteredCats);
      })
      .catch(console.error)
  }, [])

  const toggleWall = (catId: string) => {
    setSelectedWalls(prev => prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId])
  }

  const mainCategories = categories
    .filter(c => !c.parentId && c.isActive)
    .sort((a, b) => a.name.localeCompare(b.name, 'tr-TR'));

  const renderWallSelection = () => {
    // Recursive function for deep subcategories
    const renderSubcategories = (parentId: string, level: number = 1) => {
      const subs = categories
        .filter(c => c.parentId === parentId && c.isActive)
        .sort((a, b) => a.name.localeCompare(b.name, 'tr-TR'));

      if (subs.length === 0) return null;

      // Adjust margin and border based on level depth
      const plClass = level === 1 ? "pl-4" : "pl-3";
      const mlClass = level === 1 ? "ml-7" : "ml-4";
      const mtClass = level === 1 ? "mt-3" : "mt-2";

      return (
        <div className={`${mtClass} ${mlClass} space-y-2.5 border-l-2 border-gray-100 ${plClass} py-1`}>
          {subs.map(sub => (
            <div key={sub.id} className="flex flex-col">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="flex h-4 items-center">
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 rounded border-gray-300 text-purple-600 focus:ring-purple-600 focus:ring-offset-0 transition-colors"
                    checked={selectedWalls.includes(sub.id)}
                    onChange={() => toggleWall(sub.id)}
                  />
                </div>
                <div className="flex-1">
                  <span className="text-sm text-gray-600 group-hover:text-purple-700 transition-colors">{sub.name}</span>
                </div>
              </label>
              {renderSubcategories(sub.id, level + 1)}
            </div>
          ))}
        </div>
      );
    };

    return (
      <div className="mt-8 border-t border-gray-100 pt-8">
        <h3 className="text-lg font-semibold text-gray-800 pb-2 mb-4">Paylaşım Yapılacak Duvarlar (Kategoriler)</h3>
        <p className="text-sm text-gray-500 mb-6">İşletmenizin gönderi (post-it) paylaşmak istediği hedef duvarları seçiniz. İlgili ana kategoriyi ve dilerseniz alt kategorilerini tüm derinlikleri ile işaretleyebilirsiniz.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-4 border border-gray-100 rounded-xl bg-gray-50/50 shadow-inner">
          {mainCategories.length === 0 && <p className="text-sm text-gray-500 col-span-1 md:col-span-2 text-center py-8">Kategori yükleniyor veya bulunamadı...</p>}
          {mainCategories.map(main => (
            <div key={main.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm transition-shadow hover:shadow-md flex flex-col h-fit">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="flex h-5 items-center mt-0.5">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 focus:ring-offset-0 transition-colors"
                    checked={selectedWalls.includes(main.id)}
                    onChange={() => toggleWall(main.id)}
                  />
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors block">{main.name}</span>
                  {main.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{main.description}</p>}
                </div>
              </label>
              
              {renderSubcategories(main.id, 1)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 flex items-center justify-center bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50 px-4">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="flex flex-col items-center justify-center mb-4">
              <h1 className={`${publicSans.className} text-3xl font-bold bg-red-600 text-white px-4 py-1.5 rounded-lg shadow-sm tracking-tight mb-2`}>
                Panoda Şehir
              </h1>
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded lowercase tracking-wider">işletme / Kurumsal</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Firma Kayıt Başvurusu</h2>
            <p className="text-gray-600 mt-2">Sistemde onaylanmak üzere işletmenizin veya şahıs şirketinizin profilini oluşturun.</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <Tabs defaultValue="sole" className="w-full">
              <div className="px-6 pt-6 border-b border-gray-100 bg-gray-50/50">
                <TabsList className="grid w-full grid-cols-2 max-w-md h-12 border border-gray-200">
                  <TabsTrigger value="sole" className="text-sm md:text-base rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Şahıs Şirketi</TabsTrigger>
                  <TabsTrigger value="corp" className="text-sm md:text-base rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Limited / Anonim Şirket</TabsTrigger>
                </TabsList>
              </div>

              {/* ŞAHIS ŞİRKETİ */}
              <TabsContent value="sole" className="p-6 md:p-8 m-0 outline-none"><form onSubmit={(e) => handleSubmit(e, "SOLE")}>
                <div className="max-w-4xl space-y-8">
                  {/* Genel Bilgiler */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Mekan/Platform Bilgileri</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Mağaza Adı (Görünen Ad) <span className="text-red-500">*</span></Label>
                        <Input name="storeName" placeholder="Örn: Ahmet'in Yeri" />
                      </div>
                      <div className="space-y-2">
                        <Label>Mağaza Logosu</Label>
                        <Input name="storeLogo" type="file" accept="image/*" />
                      </div>
                      <div className="space-y-2">
                        <Label>Mağaza Sloganı / Spot Cümle</Label>
                        <Input name="storeSlogan" placeholder="Örn: Lezzetin Tek Adresi" />
                      </div>
                      <div className="space-y-2">
                        <Label>Kullanıcı Adı <span className="text-red-500">*</span></Label>
                        <Input name="username" placeholder="ahmet_mekan_uye" />
                      </div>
                      <div className="space-y-2">
                        <Label>Şifre <span className="text-red-500">*</span></Label>
                        <Input name="password" type="password" placeholder="********" />
                      </div>
                    </div>
                  </div>

                  {/* İrtibat Bilgileri */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Yetkili/İrtibat Bilgileri</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Yetkili Adı <span className="text-red-500">*</span></Label>
                        <Input name="contactFirstName" placeholder="Ahmet" />
                      </div>
                      <div className="space-y-2">
                        <Label>Yetkili Soyadı <span className="text-red-500">*</span></Label>
                        <Input name="contactLastName" placeholder="Yılmaz" />
                      </div>
                      <div className="space-y-2">
                        <Label>Telefon Numarası <span className="text-red-500">*</span></Label>
                        <Input name="contactPhone" placeholder="05XX XXX XX XX" />
                      </div>
                      <div className="space-y-2">
                        <Label>Mail Adresi <span className="text-red-500">*</span></Label>
                        <Input name="contactEmail" type="email" placeholder="ornek@mail.com" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Adres Bilgisi <span className="text-red-500">*</span></Label>
                        <Textarea name="address" placeholder="Tam adresinizi giriniz..." rows={3} />
                      </div>
                      <div className="space-y-2">
                        <Label>Şehir <span className="text-red-500">*</span></Label>
                        <Select value={merchantSoleCityId || 'none'} onValueChange={(val) => { setMerchantSoleCityId(val === 'none' ? '' : val); setMerchantSoleDistrictId(''); }}>
                          <SelectTrigger className="bg-white"><SelectValue placeholder="Şehir seçin" /></SelectTrigger>
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
                          <SelectTrigger className="bg-white"><SelectValue placeholder="İlçe seçin" /></SelectTrigger>
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
                        <Input name="taxOffice" placeholder="Vergi Dairesi Adı" />
                      </div>
                      <div className="space-y-2">
                        <Label>TC Kimlik No / Vergi Numarası <span className="text-red-500">*</span></Label>
                        <Input name="taxId" placeholder="11 Haneli TC Kimlik veya Vergi No" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Banka IBAN Numarası <span className="text-red-500">*</span></Label>
                        <Input name="iban" placeholder="TRXX XXXX XXXX XXXX XXXX XXXX XX" />
                      </div>
                      
                      <div className="space-y-2 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <Label>Vergi Levhası (PDF/JPEG) <span className="text-red-500">*</span></Label>
                        <Input name="taxPlateUrl" className="bg-white" type="file" />
                      </div>
                      <div className="space-y-2 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <Label>İmza Sirküsü (PDF/JPEG) <span className="text-red-500">*</span></Label>
                        <Input name="signatureCircularUrl" className="bg-white" type="file" />
                      </div>
                      <div className="space-y-2 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <Label>Kimlik Ön Yüz (PDF/JPEG) <span className="text-red-500">*</span></Label>
                        <Input name="idCardFrontUrl" className="bg-white" type="file" />
                      </div>
                      <div className="space-y-2 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <Label>Kimlik Arka Yüz (PDF/JPEG) <span className="text-red-500">*</span></Label>
                        <Input name="idCardBackUrl" className="bg-white" type="file" />
                      </div>
                    </div>
                  </div>
                  
                  {renderWallSelection()}
                  
                  <div className="flex justify-end pt-6 border-t border-gray-100 mt-6">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white min-w-[200px] h-12 text-lg rounded-xl shadow-lg shadow-blue-200" type="submit" disabled={isSubmitting}>{isSubmitting ? "Gönderiliyor..." : "Başvuruyu Gönder"}</Button>
                  </div>
                </div>
              </form></TabsContent>

              {/* LİMİTED/ANONİM ŞİRKET */}
              <TabsContent value="corp" className="p-6 md:p-8 m-0 outline-none"><form onSubmit={(e) => handleSubmit(e, "CORP")}>
                <div className="max-w-4xl space-y-8">
                  {/* Genel Bilgiler */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Mekan/Platform Bilgileri</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Mağaza Adı (Görünen Ad) <span className="text-red-500">*</span></Label>
                        <Input name="storeName" placeholder="Örn: Lezzet Dünyası" />
                      </div>
                      <div className="space-y-2">
                        <Label>Mağaza Logosu</Label>
                        <Input name="storeLogo" type="file" accept="image/*" />
                      </div>
                      <div className="space-y-2">
                        <Label>Mağaza Sloganı / Spot Cümle</Label>
                        <Input name="storeSlogan" placeholder="Örn: En İyi Lezzet" />
                      </div>
                      <div className="space-y-2">
                        <Label>Kullanıcı Adı <span className="text-red-500">*</span></Label>
                        <Input name="username" placeholder="lezzet_dunyasi_uye" />
                      </div>
                      <div className="space-y-2">
                        <Label>Şifre <span className="text-red-500">*</span></Label>
                        <Input name="password" type="password" placeholder="********" />
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
                        <Input className="bg-white mt-1" placeholder="Örn: Mehmet Yılmaz" />
                      </div>
                      <div className="space-y-2">
                        <Label>Firma Telefon Numarası <span className="text-red-500">*</span></Label>
                        <Input name="contactPhone" placeholder="0850 XXX XX XX" />
                      </div>
                      <div className="space-y-2">
                        <Label>Mail Adresi <span className="text-red-500">*</span></Label>
                        <Input name="contactEmail" type="email" placeholder="ornek@firma.com.tr" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Firma Adresi <span className="text-red-500">*</span></Label>
                        <Textarea placeholder="Faturada yazan resmi firma adresini giriniz..." rows={3} />
                      </div>
                      <div className="space-y-2">
                        <Label>Şehir <span className="text-red-500">*</span></Label>
                        <Select value={merchantCorpCityId || 'none'} onValueChange={(val) => { setMerchantCorpCityId(val === 'none' ? '' : val); setMerchantCorpDistrictId(''); }}>
                          <SelectTrigger className="bg-white"><SelectValue placeholder="Şehir seçin" /></SelectTrigger>
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
                          <SelectTrigger className="bg-white"><SelectValue placeholder="İlçe seçin" /></SelectTrigger>
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
                        <Input name="taxOffice" placeholder="Vergi Dairesi Adı" />
                      </div>
                      <div className="space-y-2">
                        <Label>Vergi Numarası (10 Haneli) <span className="text-red-500">*</span></Label>
                        <Input placeholder="Vergi No" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Banka IBAN Numarası <span className="text-red-500">*</span></Label>
                        <Input name="iban" placeholder="TRXX XXXX XXXX XXXX XXXX XXXX XX" />
                      </div>
                      
                      <div className="space-y-2 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <Label>Vergi Levhası (PDF/JPEG) <span className="text-red-500">*</span></Label>
                        <Input name="taxPlateUrl" className="bg-white" type="file" />
                      </div>
                      <div className="space-y-2 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <Label>İmza Sirküsü (Yetkili) <span className="text-red-500">*</span></Label>
                        <Input name="signatureCircularUrl" className="bg-white" type="file" />
                      </div>
                      <div className="space-y-2 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <Label>Ticaret Odası Faaliyet Belgesi <span className="text-red-500">*</span></Label>
                        <Input className="bg-white" type="file" />
                      </div>
                    </div>
                  </div>

                  {renderWallSelection()}

                  <div className="flex justify-end pt-6 border-t border-gray-100 mt-6">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white min-w-[200px] h-12 text-lg rounded-xl shadow-lg shadow-blue-200" type="submit" disabled={isSubmitting}>{isSubmitting ? "Gönderiliyor..." : "Başvuruyu Gönder"}</Button>
                  </div>
                </div>
              </form></TabsContent>
            </Tabs>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <Link href="/signup">
              <Button variant="ghost" className="w-full max-w-sm text-gray-500 hover:text-gray-800">
                ← Bireysel Kullanıcı Kaydına Geri Dön
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
