import re

with open("app/admin/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update load
load_marker = 'isStyleModeActive: getV("isStyleModeActive", false),'
load_insert = """isStyleModeActive: getV("isStyleModeActive", false),
      styleModeSettings: typeof wall.styleModeSettings === "string" 
        ? (() => { try { return JSON.parse(wall.styleModeSettings) || {}; } catch(e) { return {}; } })() 
        : (wall.styleModeSettings || {}),"""
if content.count(load_marker) == 1:
    content = content.replace(load_marker, load_insert)

# 2. Update Add
add_marker = "isStyleModeActive: false,"
add_insert = "isStyleModeActive: false,\n      styleModeSettings: {},"
if content.count(add_marker) == 1:
    content = content.replace(add_marker, add_insert)

# 3. Update Save
save_marker = "isStyleModeActive: wallForm.isStyleModeActive,"
save_insert = "isStyleModeActive: wallForm.isStyleModeActive,\n        styleModeSettings: wallForm.styleModeSettings,"
if content.count(save_marker) == 1:
    content = content.replace(save_marker, save_insert)

# Extract OTT content safely
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

# Using custom replacer function for correct JSX binding without brackets syntax errors
def replacer_value(m):
    # m.group(1) is like "ShowHeroSlider" or "ItemsPerRow"
    key = m.group(1)
    lower_key = key[0].lower() + key[1:]
    return f"(wallForm.styleModeSettings?.{lower_key} ?? wallForm.ott{key})"

settings_content = re.sub(r'wallForm\.ott([A-Za-z0-9A-Z_]+)', replacer_value, settings_content)

def replacer_set(m):
    key = m.group(1)
    lower_key = key[0].lower() + key[1:]
    # This must map: `...wallForm, ottItemsPerRow:` to `...wallForm, styleModeSettings: { ...wallForm.styleModeSettings, itemsPerRow:`
    return f"...wallForm, styleModeSettings: {{ ...wallForm.styleModeSettings, {lower_key}:"

settings_content = re.sub(r'\.\.\.wallForm,\s*ott([A-Za-z0-9A-Z_]+):', replacer_set, settings_content)

# We must add an extra closing `}` after the onChange values!
# We look for lines that have `e.target.value) || 0,` and add ` }`
# Wait, this regex is safer: `(setWallForm\(\{ \.\.\.wallForm, styleModeSettings: \{ \.\.\.wallForm\.styleModeSettings, [a-zA-Z0-9_]+: [^}]+)(\})`
settings_content = re.sub(r'(setWallForm\(\{\s*\.\.\.wallForm,\s*styleModeSettings:\s*\{\s*\.\.\.wallForm\.styleModeSettings,\s*[a-zA-Z0-9_]+:\s*[^}]+)(\})', r'\1 } }', settings_content)

# Checkboxes use checked={wallForm.ottX} which we replaced with checked={(wallForm.styleModeSettings?.x ?? wallForm.ottX)}
# That is already valid JSX! `checked={(wallForm.styleModeSettings?.showHeroSlider ?? wallForm.ottShowHeroSlider)}`
# Wait, let's verify if `checked={!!(wallForm.styleModeSettings?.showHeroSlider ?? wallForm.ottShowHeroSlider)}` is safer for checked prop.
settings_content = re.sub(r'checked=\{\(wallForm\.styleModeSettings\?\.([a-zA-Z0-9_]+)', r'checked={!!(wallForm.styleModeSettings?.\1', settings_content)

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
content = content.replace("Ayrıca üst kısımdaki hikaye halkaları (kategoriler) bu görünümdeyken gizlenir.", "")

with open("app/admin/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Isolated styling correctly applied to app/admin/page.tsx")
