import re

with open("app/admin/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# I reverted app/admin/page.tsx!

settings_start = content.find('{wallForm.isOttActive && (')
settings_end = content.find('                  )}\n                </div>', settings_start)
settings_end += len('                  )}')
settings_content = content[settings_start:settings_end]

settings_content = settings_content.replace('wallForm.isOttActive', 'wallForm.isStyleModeActive')
settings_content = settings_content.replace('OTT Görünüm Ayarları', 'Stil Modu Görünüm Ayarları')
settings_content = settings_content.replace(' OTT ', ' Stil Modu ')
settings_content = settings_content.replace('(OTT Mod)', '')
settings_content = settings_content.replace('id="ott-', 'id="smod-')
settings_content = settings_content.replace('htmlFor="ott-', 'htmlFor="smod-')
settings_content = settings_content.replace('OTT Kategori Satırı (Slider)', 'Stil Modu Kategori Satırı')

# Map all wallForm.ottX to wallForm.styleX
settings_content = re.sub(r'wallForm\.ott([A-Za-z0-9_]+)', r'wallForm.style\1', settings_content)
# Map all ...wallForm, ottX: to ...wallForm, styleX:
settings_content = re.sub(r'\.\.\.wallForm,\s*ott([A-Za-z0-9_]+):', r'...wallForm, style\1:', settings_content)

style_start = content.find('<TabsContent value="style"')
if style_start == -1:
    print("Error: Style tab not found")
    exit(1)

style_closing = content.find('</TabsContent>', style_start)
insertion_index = style_closing

new_style_addon = f"""
                  <div className="mt-6 border-t-2 border-indigo-200 pt-6 space-y-4">
                    <div className="bg-indigo-50/50 p-4 rounded-lg flex items-center justify-between mb-4 border border-indigo-100">
                      <div>
                        <h4 className="font-semibold text-indigo-900 flex items-center gap-2 mb-1">
                          Stil Modu Ek Görünüm Ayarları
                        </h4>
                        <p className="text-sm text-indigo-700">
                          Stil modu aktifken duvarın üst kısmındaki menüler, başlıklar ve kart yerleşim (kolon sayısı vs.) ayarlarını buradan yönetebilirsiniz.
                        </p>
                      </div>
                    </div>
                    {settings_content}
                  </div>
              """
# Replace ONLY what I added in the previous script!
# Wait! I didn't revert app/admin/page.tsx just now, I ran `tar -xzvf update-admin.tar.gz app/admin/page.tsx`!
# Let me extract it cleanly again to be 100% sure!
