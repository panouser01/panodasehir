import re

with open("app/admin/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update initial `wallForm` state in load and create
load_marker = 'isStyleModeActive: getV("isStyleModeActive", false),'
load_insert = """isStyleModeActive: getV("isStyleModeActive", false),
      styleModeSettings: typeof wall.styleModeSettings === "string" 
        ? (() => { try { return JSON.parse(wall.styleModeSettings) || {}; } catch(e) { return {}; } })() 
        : (wall.styleModeSettings || {}),"""
if content.count(load_marker) == 1:
    content = content.replace(load_marker, load_insert)

add_marker = "isStyleModeActive: false,"
add_insert = "isStyleModeActive: false,\n      styleModeSettings: {},"
if content.count(add_marker) == 1:
    content = content.replace(add_marker, add_insert)

save_marker = "isStyleModeActive: wallForm.isStyleModeActive,"
save_insert = "isStyleModeActive: wallForm.isStyleModeActive,\n        styleModeSettings: wallForm.styleModeSettings,"
if content.count(save_marker) == 1:
    content = content.replace(save_marker, save_insert)


# Now extract settings_content from OTT block
settings_start = content.find('{wallForm.isOttActive && (')
settings_end = content.find('                  )}\n                </div>', settings_start)
settings_end += len('                  )}') # Exclude the wrapper div closing!
settings_content = content[settings_start:settings_end]

# Customize for Style mode
settings_content = settings_content.replace('wallForm.isOttActive', 'wallForm.isStyleModeActive')
settings_content = settings_content.replace('OTT Görünüm Ayarları', 'Stil Modu Görünüm Ayarları')
settings_content = settings_content.replace(' OTT ', ' Stil Modu ')
settings_content = settings_content.replace('(OTT Mod)', '')
settings_content = settings_content.replace('id="ott-', 'id="smod-')
settings_content = settings_content.replace('htmlFor="ott-', 'htmlFor="smod-')
settings_content = settings_content.replace('OTT Kategori Satırı (Slider)', 'Stil Modu Kategori Satırı')

# Now carefully replace bindings to `wallForm.styleModeSettings`
# value={wallForm.ottX} -> value={wallForm.styleModeSettings?.ottX || ''}
# Wait, let's just keep the parameter names the same (`ottItemsPerRow`) inside the JSON, so we don't have to change the frontend properties or parse them, just accessing them from `styleModeSettings`.
# i.e., { itemsPerRow: 4 }
# Let's map `ott([A-Z])([a-z0-9A-Z_]+)` to `\l\1\2`
def lowercase_first(match):
    s = match.group(1)
    return s[0].lower() + s[1:]

settings_content = re.sub(r'wallForm\.ott([A-Za-z0-9_]+)', lambda m: f"(wallForm.styleModeSettings?.['{lowercase_first(m)}'])", settings_content)

settings_content = re.sub(r'\.\.\.wallForm,\s*ott([A-Za-z0-9_]+):', lambda m: f"...wallForm, styleModeSettings: {{ ...(wallForm.styleModeSettings || {{}}), '{lowercase_first(m)}':", settings_content)

# Fix the closing braces for `onChange={(e) => setWallForm({ ...wallForm, styleModeSettings: { ..., 'x': val }) }`
settings_content = re.sub(r"(styleModeSettings: \{ \.\.\.\(wallForm\.styleModeSettings \|\| \{\}\), '[A-Za-z0-9_]+': [^}]+)(\})", r"\1 } }", settings_content)

# Checkboxes: `checked={wallForm.styleModeSettings?.['X']}`
settings_content = re.sub(r'checked=\{\(wallForm\.styleModeSettings\?\.\[''([A-Za-z0-9_]+)''\]\)\}', r"checked={Boolean(wallForm.styleModeSettings?.['\1'])}", settings_content)

# Find exact insertion point for TabsContent value="style"
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

content = content[:insertion_index] + new_style_addon + content[insertion_index:]

text_to_remove = "Ayrıca üst kısımdaki hikaye halkaları (kategoriler) bu görünümdeyken gizlenir."
content = content.replace(text_to_remove, "")

with open("app/admin/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Insertion successful with separation!")
