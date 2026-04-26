import re

with open("app/admin/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update initial `wallForm` state in load and create
load_marker = "isStyleModeActive: getV(\"isStyleModeActive\", false),"

# How `styleModeSettings` should map:
load_insert = """
      isStyleModeActive: getV("isStyleModeActive", false),
      styleModeSettings: typeof wall.styleModeSettings === "string" 
        ? (() => { try { return JSON.parse(wall.styleModeSettings) || {}; } catch(e) { return {}; } })() 
        : (wall.styleModeSettings || {}),
"""
content = content.replace(load_marker, load_insert)

# 2. Update `wallForm` in `openAddWall`
add_marker = "isStyleModeActive: false,"
add_insert = "isStyleModeActive: false,\n      styleModeSettings: {},"
content = content.replace(add_marker, add_insert)

# 3. Update `payload` in `handleSaveWall`
save_marker = "isStyleModeActive: wallForm.isStyleModeActive,"
save_insert = "isStyleModeActive: wallForm.isStyleModeActive,\n        styleModeSettings: wallForm.styleModeSettings,"
content = content.replace(save_marker, save_insert)

# Now, we must fix the UI fields!
# The UI currently has `value={wallForm.ottItemsPerRow}` and `onChange={(e) => setWallForm({ ...wallForm, ottItemsPerRow: ...})}`
# But ONLY IN THE STIL MODU block!
# How do I find the STIL MODU block uniquely? It's inside `<TabsContent value="style"`.
style_start = content.find('<TabsContent value="style"')
style_end = content.find('</TabsContent>', style_start)
style_block = content[style_start:style_end]

# We must replace `wallForm.ott` with `wallForm.styleModeSettings.ott` or just `wallForm.styleModeSettings?.itemsPerRow` etc.
# Wait, I mapped them as `ottItemsPerRow`, `ottCardRatio` previously! Let's just create generic regex!

# `wallForm.ottX` -> `(wallForm.styleModeSettings?.X)` and `{ ...wallForm, styleModeSettings: { ...wallForm.styleModeSettings, X: val } }`
import re

def replacer(match):
    full_string = match.group(0)
    # It matches `value={wallForm.ottItemsPerRow}` -> `value={wallForm.styleModeSettings?.itemsPerRow || ''}`
    # It matches `onChange={(e) => setWallForm({ ...wallForm, ottItemsPerRow: parseInt(e.target.value) || 0 })}` 
    # Wait, regex is too complex for onChange!
    pass

with open("fix_admin_style_part1.py", "w") as f: f.write("ok")
