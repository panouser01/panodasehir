import re

with open("app/admin/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 0. Add `styleModeSettings?: any` to `useState`
marker_state = 'isStyleModeActive: false,'
insert_state = 'isStyleModeActive: false,\n    styleModeSettings: {} as any,'
if content.count(marker_state) == 1:
    content = content.replace(marker_state, insert_state)

# 1. Update Load in `handleGroupWallSelection` (uses `templateWall`)
content = re.sub(
    r'(ottTopMenuIconBgColor:\s*getV\("ottTopMenuIconBgColor",\s*""\),)',
    r'\1\n          styleModeSettings: typeof templateWall.styleModeSettings === "string" ? (() => { try { return JSON.parse(templateWall.styleModeSettings) || {}; } catch(e) { return {}; } })() : (templateWall.styleModeSettings || {}),',
    content,
    count=1
)

# 2. Update Load in `openEditWall` (uses `wall`)
content = re.sub(
    r'(ottTopMenuIconBgColor:\s*getV\("ottTopMenuIconBgColor",\s*""\),)',
    r'\1\n      styleModeSettings: typeof wall.styleModeSettings === "string" ? (() => { try { return JSON.parse(wall.styleModeSettings) || {}; } catch(e) { return {}; } })() : (wall.styleModeSettings || {}),',
    content
)

# 3. Update Add in `openAddWall`
add_marker = "isEditorModeActive: false,\n      ottTopMenuIconBgColor: \"\","
add_insert = "isEditorModeActive: false,\n      ottTopMenuIconBgColor: \"\",\n      styleModeSettings: {},"
content = content.replace(add_marker, add_insert)

# 4. Update Save in `handleSaveWall`
save_marker = "isStyleModeActive: wallForm.isStyleModeActive,"
save_insert = "isStyleModeActive: wallForm.isStyleModeActive,\n        styleModeSettings: wallForm.styleModeSettings,"
content = content.replace(save_marker, save_insert)

# Extract OTT content securely
settings_start = content.find('{wallForm.isOttActive && (')
settings_end = content.find('                  )}\n                </div>', settings_start)
settings_end += len('                  )}')
settings_content = content[settings_start:settings_end]

# Customize for Style mode
settings_content = settings_content.replace('wallForm.isOttActive', 'wallForm.isStyleModeActive')
settings_content = settings_content.replace('OTT Görünüm Ayarları', 'Stil Modu Görünüm Ayarları')
settings_content = settings_content.replace(' OTT ', ' Stil Modu ')
settings_content = settings_content.replace('(OTT Mod)', '')
settings_content = settings_content.replace('id="ott-', 'id="smod-')
settings_content = settings_content.replace('htmlFor="ott-', 'htmlFor="smod-')
settings_content = settings_content.replace('OTT Kategori Satırı (Slider)', 'Stil Modu Kategori Satırı')

# Using custom replacer function for correct JSX binding without brackets syntax errors
def replacer_value(m):
    key = m.group(1)
    lower_key = key[0].lower() + key[1:]
    return f"(wallForm.styleModeSettings?.{lower_key} ?? wallForm.ott{key})"

settings_content = re.sub(r'wallForm\.ott([A-Za-z0-9A-Z_]+)', replacer_value, settings_content)

def replacer_set(m):
    key = m.group(1)
    lower_key = key[0].lower() + key[1:]
    return f"...wallForm, styleModeSettings: {{ ...(wallForm.styleModeSettings || {{}}), {lower_key}:"

settings_content = re.sub(r'\.\.\.wallForm,\s*ott([A-Za-z0-9A-Z_]+):', replacer_set, settings_content)

settings_content = re.sub(r'(setWallForm\(\{\s*\.\.\.wallForm,\s*styleModeSettings:\s*\{\s*\.\.\.\(wallForm\.styleModeSettings \|\| \{\}\),\s*[a-zA-Z0-9_]+:\s*[^}]+)(\})', r'\1 } }', settings_content)

# Checkboxes use checked={!!(wallForm.styleModeSettings?.x ?? ...)}
settings_content = re.sub(r'checked=\{\(wallForm\.styleModeSettings\?\.([a-zA-Z0-9_]+)', r'checked={!!(wallForm.styleModeSettings?.\1', settings_content)

style_start = content.find('<TabsContent value="style"')
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

content = content[:insertion_index] + new_style_addon + content[insertion_index:]
content = content.replace("Ayrıca üst kısımdaki hikaye halkaları (kategoriler) bu görünümdeyken gizlenir.", "")

with open("app/admin/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Created completely bulletproof file!")
