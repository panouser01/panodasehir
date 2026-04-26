import re

with open("app/admin/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Extract the OTT content from <TabsContent value="ott">
ott_pattern = r'<TabsContent value="ott" className="space-y-4 pt-2">([\s\S]*?)</TabsContent>\s*<TabsContent value="editor"'
match = re.search(ott_pattern, content)
if not match:
    # it might be the reverted version
    pass

# We can also just extract OTT from the "ottSettings" block 
settings_pattern = r'\{wallForm\.isOttActive && \(\s*(<div className="space-y-4 border p-4 rounded-md bg-gray-50">[\s\S]*?</div>\s*)\)\}'
settings_match = re.search(settings_pattern, match.group(1) if match else content)
if not settings_match:
    print("Could not find OTT settings block!")
    exit(1)

settings_content = settings_match.group(1)

# Modify text in settings_content to rename OTT to Stil conceptually!
settings_content = settings_content.replace('OTT Kategori Satırı', 'Stil Modu Kategori Satırı')
settings_content = settings_content.replace('OTT Görünüm Ayarları', 'Stil Modu Görünüm Ayarları')
settings_content = settings_content.replace('OTT', 'Stil Modu')
settings_content = settings_content.replace('id="ott-', 'id="style-')
settings_content = settings_content.replace('htmlFor="ott-', 'htmlFor="style-')

style_pattern = r'(<TabsContent value="style" className="space-y-4 pt-4">\s*<div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">[\s\S]*?</div>\s*)(</TabsContent>)'

style_match = re.search(style_pattern, content)
if not style_match:
    print("Could not find Style content block inside TabsContent!")
    exit(1)

style_header = style_match.group(1)

# The new style block:
new_style_block = f"""{style_header}
                  {{wallForm.isStyleModeActive && (
                    <div className="mt-6 border-t-2 border-indigo-100 pt-6">
                      <h4 className="font-bold text-indigo-900 mb-4">Stil Modu İçin Gelişmiş Ayarlar</h4>
                      {settings_content}
                    </div>
                  )}}
              </TabsContent>"""

content = content[:style_match.start()] + new_style_block + content[style_match.end():]

with open("app/admin/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Done copying to Style Modu!")
