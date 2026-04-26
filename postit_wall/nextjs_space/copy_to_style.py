import re

with open("app/admin/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Extract the OTT settings from <TabsContent value="ott">
ott_pattern = r'<TabsContent value="ott" className="space-y-4 pt-2">([\s\S]*?)</TabsContent>\s*<TabsContent value="editor"'
match = re.search(ott_pattern, content)
if not match:
    print("Could not find OTT content block!")
    exit(1)

ott_content = match.group(1)

settings_pattern = r'\{wallForm\.isOttActive && \(\s*(<div className="space-y-4 border p-4 rounded-md bg-gray-50">[\s\S]*?</div>\s*)\)\}'
settings_match = re.search(settings_pattern, ott_content)
if not settings_match:
    print("Could not find OTT settings block!")
    exit(1)

settings_content = settings_match.group(1)

# Rename visual text for Stil Tab
settings_content = settings_content.replace('OTT Kategori Satırı (Slider)', 'Stil Modu Kategori Satırı')
settings_content = settings_content.replace('OTT Görünüm Ayarları', 'Stil Modu Görünüm Ayarları')
settings_content = settings_content.replace(' OTT ', ' Stil Modu ')
settings_content = settings_content.replace('(OTT Mod)', '')
settings_content = settings_content.replace('id="ott-', 'id="smod-')
settings_content = settings_content.replace('htmlFor="ott-', 'htmlFor="smod-')

# Fix text: "Ayrıca üst kısımdaki hikaye halkaları (kategoriler) bu görünümdeyken gizlenir."
# This is no longer completely true if the user enables it, so let's remove it!
text_to_remove = "Ayrıca üst kısımdaki hikaye halkaları (kategoriler) bu görünümdeyken gizlenir."
content = content.replace(text_to_remove, "")

# Find TabsContent value="style"
style_start_idx = content.find('<TabsContent value="style"')
if style_start_idx == -1:
    print("Could not find TabsContent value='style'")
    exit(1)

style_end_idx = content.find('</TabsContent>', style_start_idx) + len('</TabsContent>')

style_block = content[style_start_idx:style_end_idx]

# Split right before </TabsContent>
style_block_new = style_block[:-len('</TabsContent>')] + f"""
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
              </TabsContent>"""

content = content[:style_start_idx] + style_block_new + content[style_end_idx:]

with open("app/admin/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Done copying to Style Modu!")
