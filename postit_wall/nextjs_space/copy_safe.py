import re

with open("app/admin/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Extract settings from OTT block confidently
ott_start = content.find('<TabsContent value="ott"')
ott_end = content.find('<TabsContent value="editor"', ott_start)
ott_content = content[ott_start:ott_end]

settings_start = ott_content.find('{wallForm.isOttActive && (')
settings_end = ott_content.rfind(')}', settings_start) + 2
settings_content = ott_content[settings_start:settings_end]

# Extract only the inside of {wallForm.isOttActive && ( ... )}
# Length of '{wallForm.isOttActive && (' is 26
settings_content = settings_content[26:-2]

# Rename visual text for Stil Tab
settings_content = settings_content.replace('OTT Kategori Satırı (Slider)', 'Stil Modu Kategori Satırı')
settings_content = settings_content.replace('OTT Görünüm Ayarları', 'Stil Modu Görünüm Ayarları')
settings_content = settings_content.replace(' OTT ', ' Stil Modu ')
settings_content = settings_content.replace('(OTT Mod)', '')
settings_content = settings_content.replace('id="ott-', 'id="smod-')
settings_content = settings_content.replace('htmlFor="ott-', 'htmlFor="smod-')

# 2. Find exact insertion point for TabsContent value="style"
style_start = content.find('<TabsContent value="style"')
if style_start == -1:
    print("Error: Style tab not found")
    exit(1)

# Find the end of his block:
style_closing = content.find('</TabsContent>', style_start)

# We want to insert settings_content RIGHT BEFORE the closing `</TabsContent>` of the style block.
insertion_index = style_closing

new_style_addon = f"""
                  {{wallForm.isStyleModeActive && (
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
                  )}}
              """

content = content[:insertion_index] + new_style_addon + content[insertion_index:]

# Also remove "Ayrıca üst kısımdaki hikaye halkaları (kategoriler) bu görünümdeyken gizlenir." since it's customizable now
text_to_remove = "Ayrıca üst kısımdaki hikaye halkaları (kategoriler) bu görünümdeyken gizlenir."
content = content.replace(text_to_remove, "")

with open("app/admin/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Insertion successful with exact indexing!")
