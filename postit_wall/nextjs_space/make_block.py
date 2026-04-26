block = """
                             <div className="border border-gray-200 mt-6 p-4 rounded-md bg-indigo-50/30">
                               <h4 className="font-semibold text-indigo-800 flex items-center gap-2 mb-4">
                                 Stil Modu OTT (Satır/Slayder) İleri Düzey Parametreleri
                               </h4>
                               <div className="space-y-4">
                                   <div className="space-y-2">
                                     <Label>Satır Başına Öğe Sayısı</Label>
                                     <Input 
                                       type="number" 
                                       value={parsedSettings.ottItemsPerRow || ''} 
                                       onChange={(e) => handleSettingChange('ottItemsPerRow', parseInt(e.target.value) || 0)}
                                       placeholder="Örn: 4"
                                     />
                                   </div>
                                   <div className="space-y-2">
                                     <Label>Kart Oranı (Örn: 16/9, 2/3)</Label>
                                     <Input 
                                       value={parsedSettings.ottCardRatio || ''} 
                                       onChange={(e) => handleSettingChange('ottCardRatio', e.target.value)}
                                       placeholder="16/9"
                                     />
                                   </div>
                                   <div className="space-y-2">
                                      <Label>Oto Kaydırma Hızı (Saniye - Örn: 1.5, 2.5)</Label>
                                      <Input 
                                       type="number"
                                       step="0.1"
                                       value={parsedSettings.ottAutoScrollSpeed === 0 ? '' : (parsedSettings.ottAutoScrollSpeed || '')}
                                       onChange={(e) => handleSettingChange('ottAutoScrollSpeed', parseFloat(e.target.value) || 0)}
                                       placeholder="0 (Kapalı) veya örn: 2.5"
                                      />
                                   </div>
                                   
                                   <div className="border-t pt-4 mt-6">
                                     <h4 className="font-semibold text-gray-700 mb-4">Tasarım Anatomisi Ayarları</h4>
                                     <div className="space-y-4">
                                       <div className="flex items-center space-x-2">
                                         <Checkbox 
                                           id="style-ott-show-hero-slider"
                                           checked={parsedSettings.ottShowHeroSlider ?? true}
                                           onCheckedChange={(checked) => handleSettingChange('ottShowHeroSlider', !!checked)}
                                         />
                                         <Label htmlFor="style-ott-show-hero-slider" className="cursor-pointer text-sm font-medium text-amber-700">En Üst Kısım: Slayder (Hero) Bölümünü ve Logoyu Göster</Label>
                                       </div>

                                       <div className="flex items-center space-x-2">
                                         <Checkbox 
                                           id="style-ott-show-top-menu"
                                           checked={parsedSettings.ottShowTopMenu ?? true}
                                           onCheckedChange={(checked) => handleSettingChange('ottShowTopMenu', !!checked)}
                                         />
                                         <Label htmlFor="style-ott-show-top-menu" className="cursor-pointer text-sm">Üst Kısım: Yuvarlak Kategori Menüsünü Göster (Instagram Hikayeleri Tarzı)</Label>
                                       </div>

                                       {(parsedSettings.ottShowTopMenu !== false) && (
                                         <div className="space-y-2 pl-6">
                                           <Label>Üst Menü İkon Şekli</Label>
                                           <Select
                                             value={parsedSettings.ottTopMenuShape || 'circle'}
                                             onValueChange={(val) => handleSettingChange('ottTopMenuShape', val)}
                                           >
                                             <SelectTrigger>
                                               <SelectValue placeholder="Şekil Seçin" />
                                             </SelectTrigger>
                                             <SelectContent>
                                               <SelectItem value="circle">Dairesel (Instagram Stili)</SelectItem>
                                               <SelectItem value="square">Oval / Kare (Netflix Stili)</SelectItem>
                                             </SelectContent>
                                           </Select>

                                           <div className="pt-2 space-y-2">
                                             <Label>İkon İç Arkaplan Zemin Rengi</Label>
                                             <div className="flex gap-2">
                                               <Input
                                                 type="color"
                                                 value={parsedSettings.ottTopMenuIconBgColor || '#ffffff'}
                                                 onChange={(e) => handleSettingChange('ottTopMenuIconBgColor', e.target.value)}
                                                 className="w-12 h-10 p-1 cursor-pointer"
                                               />
                                               <Input
                                                 value={parsedSettings.ottTopMenuIconBgColor || ''}
                                                 onChange={(e) => handleSettingChange('ottTopMenuIconBgColor', e.target.value)}
                                                 placeholder="Transparan için boş bırakın"
                                                 className="flex-1 font-mono text-sm"
                                               />
                                               <Button
                                                 type="button"
                                                 variant="outline"
                                                 onClick={() => handleSettingChange('ottTopMenuIconBgColor', '')}
                                                 title="Transparan Yap"
                                                 className="px-3"
                                               >
                                                 Sıfırla
                                               </Button>
                                             </div>
                                           </div>

                                           <div className="pt-4 border-t border-gray-100 flex items-center space-x-2">
                                             <Checkbox 
                                               id="style-ott-top-menu-marquee-active"
                                               checked={!!parsedSettings.ottTopMenuMarqueeActive}
                                               onCheckedChange={(checked) => handleSettingChange('ottTopMenuMarqueeActive', !!checked)}
                                             />
                                             <Label htmlFor="style-ott-top-menu-marquee-active" className="cursor-pointer text-sm">Menüyü Kayan Yazı (Marquee) Olarak Oynat</Label>
                                           </div>

                                           {parsedSettings.ottTopMenuMarqueeActive && (
                                             <div className="pt-2 space-y-2">
                                               <Label>Kayma Hızı (Saniye) (Daha düşük sayı = Daha hızlı)</Label>
                                               <Input
                                                 type="number"
                                                 value={parsedSettings.ottTopMenuMarqueeSpeed || 30}
                                                 onChange={(e) => handleSettingChange('ottTopMenuMarqueeSpeed', parseFloat(e.target.value) || 30)}
                                                 placeholder="Örn: 30"
                                                 className="w-full sm:w-1/3"
                                               />
                                             </div>
                                           )}
                                         </div>
                                       )}

                                       <div className="flex items-center space-x-2">
                                         <Checkbox 
                                           id="style-ott-show-category-titles"
                                           checked={parsedSettings.ottShowCategoryTitles ?? true}
                                           onCheckedChange={(checked) => handleSettingChange('ottShowCategoryTitles', !!checked)}
                                         />
                                         <Label htmlFor="style-ott-show-category-titles" className="cursor-pointer text-sm">Satırlar: Slayder Başlıklarını (Kategori İsimleri) Göster</Label>
                                       </div>

                                       <div className="space-y-4 py-4 border-t border-b border-gray-100 my-4">
                                         <div className="space-y-2">
                                           <Label>OTT Kategori Satırı (Slider) Arkaplan Rengi</Label>
                                           <div className="flex gap-2">
                                             <Input
                                               type="color"
                                               value={parsedSettings.ottTopMenuLabelBgColor || '#ffffff'}
                                               onChange={(e) => handleSettingChange('ottTopMenuLabelBgColor', e.target.value)}
                                               className="w-12 h-10 p-1 cursor-pointer"
                                             />
                                             <Input
                                               value={parsedSettings.ottTopMenuLabelBgColor || ''}
                                               onChange={(e) => handleSettingChange('ottTopMenuLabelBgColor', e.target.value)}
                                               placeholder="Varsayılan Yarı Saydam (Boş Bırakılabilir)"
                                               className="flex-1 font-mono text-sm"
                                             />
                                           </div>
                                         </div>
                                         <div className="flex items-center space-x-2 pt-2">
                                           <Checkbox 
                                             id="style-ott-show-row-border"
                                             checked={!!parsedSettings.ottShowRowBorder}
                                             onCheckedChange={(checked) => handleSettingChange('ottShowRowBorder', !!checked)}
                                           />
                                           <Label htmlFor="style-ott-show-row-border" className="cursor-pointer text-sm">OTT Kategori Satırı (Slider) Etrafında Border (Çerçeve) Göster</Label>
                                         </div>
                                       </div>
                                     </div>
                                   </div>
                               </div>
                             </div>
"""

with open("app/admin/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

target = """)}

                          </div>
                      </div>"""

if target in content:
    content = content.replace(target, ")}\n" + block + "                          </div>\n                      </div>")
    with open("app/admin/page.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Success")
else:
    print("Not found")

