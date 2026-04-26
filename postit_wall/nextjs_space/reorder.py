import re

with open('app/admin/page.tsx', 'r') as f:
    text = f.read()

# We need to capture from `<div className="space-y-2">\n                                   <Label>Zemin Tipi</Label>` 
# down to the end of the Zemin Ayarları block.

start_str = '''                                 <div className="space-y-2">
                                   <Label>Zemin Tipi</Label>
                                   <Select
                                     value={wallForm.ottCardBgType || 'postit'}
                                     onValueChange={(val) => setWallForm({ ...wallForm, ottCardBgType: val })}
                                   >
                                     <SelectTrigger><SelectValue placeholder="Postit Rengi (Varsayılan)" /></SelectTrigger>
                                     <SelectContent>
                                       <SelectItem value="postit">Postit Rengi (Postit Oluşturulurken Gelen Renk)</SelectItem>
                                       <SelectItem value="transparent">Şeffaf (Transparan)</SelectItem>
                                       <SelectItem value="color">Özel Renk Seç</SelectItem>
                                       <SelectItem value="gradient">3 Renk Gradyan Seç</SelectItem>
                                       <SelectItem value="image">Arkaplan Resmi Ekle</SelectItem>
                                     </SelectContent>
                                   </Select>
                                 </div>'''

# The font block
font_block = '''                                 <div className="space-y-4 pt-4 mt-2 border-t border-gray-100">
                                   <div className="space-y-2">
                                     <Label>Postit (Hücre) Yazı Rengi</Label>
                                     <div className="flex gap-2">
                                       <Input
                                         type="color"
                                         value={wallForm.postitAppearance?.textColor || '#ffffff'}
                                         onChange={(e) => setWallForm({ ...wallForm, postitAppearance: { ...(wallForm.postitAppearance || {}), textColor: e.target.value } })}
                                         className="w-12 h-10 p-1 cursor-pointer"
                                       />
                                       <div className="flex-1 flex gap-2">
                                        <Input
                                          value={wallForm.postitAppearance?.textColor || ''}
                                          onChange={(e) => setWallForm({ ...wallForm, postitAppearance: { ...(wallForm.postitAppearance || {}), textColor: e.target.value } })}
                                          placeholder="Varsayılan için boş bırakın"
                                          className="font-mono text-sm"
                                        />
                                        <Button type="button" variant="outline" onClick={() => setWallForm({ ...wallForm, postitAppearance: { ...(wallForm.postitAppearance || {}), textColor: '' } })}>Sıfırla</Button>
                                       </div>
                                     </div>
                                   </div>

                                   <div className="space-y-2">
                                     <Label>Postit (Hücre) Yazı Fontu</Label>
                                     <Select
                                       value={wallForm.postitAppearance?.font || ''}
                                       onValueChange={(val) => setWallForm({ ...wallForm, postitAppearance: { ...(wallForm.postitAppearance || {}), font: val } })}
                                     >
                                       <SelectTrigger className="bg-white"><SelectValue placeholder="Varsayılan (Tema fontu)" /></SelectTrigger>
                                       <SelectContent>
                                         <SelectItem value="font-sans">Modern (Sans)</SelectItem>
                                         <SelectItem value="font-serif">Klasik (Serif)</SelectItem>
                                         <SelectItem value="font-handwriting">El Yazısı (Kalam)</SelectItem>
                                         <SelectItem value="font-mono">Daktilo (Mono)</SelectItem>
                                         <SelectItem value="font-comic">Eğlenceli (Comic)</SelectItem>
                                       </SelectContent>
                                     </Select>
                                   </div>

                                   <div className="space-y-2">
                                     <Label>Postit (Hücre) Yazı Boyutu</Label>
                                     <Select
                                       value={wallForm.postitAppearance?.textSize || ''}
                                       onValueChange={(val) => setWallForm({ ...wallForm, postitAppearance: { ...(wallForm.postitAppearance || {}), textSize: val } })}
                                     >
                                       <SelectTrigger className="bg-white"><SelectValue placeholder="Varsayılan Boyut" /></SelectTrigger>
                                       <SelectContent>
                                         <SelectItem value="text-xs">Çok Küçük</SelectItem>
                                         <SelectItem value="text-sm">Küçük</SelectItem>
                                         <SelectItem value="text-base">Normal</SelectItem>
                                         <SelectItem value="text-lg">Büyük</SelectItem>
                                         <SelectItem value="text-xl">Çok Büyük</SelectItem>
                                         <SelectItem value="text-2xl">Ekstra Büyük</SelectItem>
                                         <SelectItem value="text-3xl">Dev</SelectItem>
                                       </SelectContent>
                                     </Select>
                                   </div>
                                 </div>'''

bg_block = '''                                 {wallForm.ottCardBgType === 'color' && (
                                   <div className="space-y-2">
                                     <Label>Özel Zemin Rengi</Label>
                                     <div className="flex gap-2">
                                       <Input
                                         type="color"
                                         value={wallForm.ottCardBgColor || '#ffffff'}
                                         onChange={(e) => setWallForm({ ...wallForm, ottCardBgColor: e.target.value })}
                                         className="w-12 h-10 p-1 cursor-pointer"
                                       />
                                       <Input
                                         value={wallForm.ottCardBgColor || ''}
                                         onChange={(e) => setWallForm({ ...wallForm, ottCardBgColor: e.target.value })}
                                         placeholder="Örn: #ffffff veya rgb(255,255,255)"
                                         className="flex-1 font-mono text-sm"
                                       />
                                     </div>
                                   </div>
                                 )}

                                 {wallForm.ottCardBgType === 'gradient' && (
                                   <div className="space-y-2">
                                     <Label>3 Renk Gradyan (Başlangıç - Orta - Bitiş)</Label>
                                     <div className="flex gap-2">
                                       <Input
                                         type="color"
                                         value={(wallForm.ottCardBgColor?.includes(',') ? wallForm.ottCardBgColor.split(',')[0] : '#facc15')}
                                         onChange={(e) => {
                                           const parts = wallForm.ottCardBgColor?.includes(',') ? wallForm.ottCardBgColor.split(',') : ['#facc15', '#f472b6', '#a855f7'];
                                           parts[0] = e.target.value;
                                           setWallForm({ ...wallForm, ottCardBgColor: parts.join(',') })
                                         }}
                                         className="w-12 h-10 p-1 cursor-pointer"
                                         title="Başlangıç Rengi"
                                       />
                                       <Input
                                         type="color"
                                         value={(wallForm.ottCardBgColor?.includes(',') ? wallForm.ottCardBgColor.split(',')[1] : '#f472b6')}
                                         onChange={(e) => {
                                           const parts = wallForm.ottCardBgColor?.includes(',') ? wallForm.ottCardBgColor.split(',') : ['#facc15', '#f472b6', '#a855f7'];
                                           parts[1] = e.target.value;
                                           setWallForm({ ...wallForm, ottCardBgColor: parts.join(',') })
                                         }}
                                         className="w-12 h-10 p-1 cursor-pointer flex-1"
                                         title="Orta Renk"
                                       />
                                       <Input
                                         type="color"
                                         value={(wallForm.ottCardBgColor?.includes(',') ? wallForm.ottCardBgColor.split(',')[2] : '#a855f7')}
                                         onChange={(e) => {
                                           const parts = wallForm.ottCardBgColor?.includes(',') ? wallForm.ottCardBgColor.split(',') : ['#facc15', '#f472b6', '#a855f7'];
                                           parts[2] = e.target.value;
                                           setWallForm({ ...wallForm, ottCardBgColor: parts.join(',') })
                                         }}
                                         className="w-12 h-10 p-1 cursor-pointer flex-1"
                                         title="Bitiş Rengi"
                                       />
                                     </div>
                                   </div>
                                 )}

                                 {wallForm.ottCardBgType === 'image' && (
                                   <div className="space-y-2">
                                     <Label>Zemin Arkaplan Resmi</Label>
                                     <div className="flex gap-4 items-center">
                                       <Button
                                         type="button"
                                         variant="outline"
                                         onClick={() => document.getElementById('ott-bg-upload')?.click()}
                                         disabled={uploadingOttBgImage}
                                       >
                                         {uploadingOttBgImage ? 'Yükleniyor...' : 'Resim Yükle'}
                                       </Button>
                                       <input 
                                         id="ott-bg-upload" 
                                         type="file" 
                                         accept="image/*" 
                                         onChange={handleOttBgImageUpload} 
                                         className="hidden" 
                                       />
                                       {wallForm.ottCardBgImage && (
                                         <div className="relative group">
                                           <img src={wallForm.ottCardBgImage} alt="Zemin" className="w-16 h-16 object-cover rounded-lg border shadow-sm" />
                                           <button
                                             type="button"
                                             onClick={() => setWallForm({ ...wallForm, ottCardBgImage: '' })}
                                             className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                           >
                                             <X className="w-3 h-3" />
                                           </button>
                                         </div>
                                       )}
                                     </div>
                                     {wallForm.ottCardBgImage && (
                                       <div className="grid grid-cols-2 gap-4 mt-4 bg-gray-50/50 p-4 rounded-lg border">
                                         <div className="space-y-2">
                                           <Label>Resim Boyutlandırma</Label>
                                           <Select
                                             value={wallForm.postitAppearance?.ottCardBgImageSize || 'cover'}
                                             onValueChange={(val) => setWallForm({ ...wallForm, postitAppearance: { ...(wallForm.postitAppearance || {}), ottCardBgImageSize: val } })}
                                           >
                                             <SelectTrigger className="bg-white"><SelectValue placeholder="Seçiniz" /></SelectTrigger>
                                             <SelectContent>
                                               <SelectItem value="cover">Tamamı Kapla (Cover)</SelectItem>
                                               <SelectItem value="contain">Sığdır (Contain)</SelectItem>
                                               <SelectItem value="100% 100%">Kenarları Yasla (Uzat)</SelectItem>
                                               <SelectItem value="auto">Orjinal Boyut</SelectItem>
                                             </SelectContent>
                                           </Select>
                                         </div>
                                         <div className="space-y-2">
                                           <Label>Resim Hizalama</Label>
                                           <Select
                                             value={wallForm.postitAppearance?.ottCardBgImagePosition || 'center'}
                                             onValueChange={(val) => setWallForm({ ...wallForm, postitAppearance: { ...(wallForm.postitAppearance || {}), ottCardBgImagePosition: val } })}
                                           >
                                             <SelectTrigger className="bg-white"><SelectValue placeholder="Seçiniz" /></SelectTrigger>
                                             <SelectContent>
                                               <SelectItem value="center">Tam Merkez</SelectItem>
                                               <SelectItem value="top center">Üst Merkez</SelectItem>
                                               <SelectItem value="bottom center">Alt Merkez</SelectItem>
                                               <SelectItem value="left center">Sol Merkez</SelectItem>
                                               <SelectItem value="right center">Sağ Merkez</SelectItem>
                                             </SelectContent>
                                           </Select>
                                         </div>
                                       </div>
                                     )}
                                   </div>
                                 )}'''

# Replace it
target_str = start_str + "\n\n" + font_block + "\n\n" + bg_block
replacement_str = start_str + "\n\n                                 <div className=\"space-y-4\">\n" + bg_block + "\n                                 </div>\n\n" + font_block

if target_str in text:
    text = text.replace(target_str, replacement_str)
    with open('app/admin/page.tsx', 'w') as f:
        f.write(text)
    print("Replaced successfully!")
else:
    print("Target string not found!")

