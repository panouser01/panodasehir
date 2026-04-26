import re

with open("app/admin/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Make sure we don't double apply
if "styleModeSettings" in content:
    print("Already applied?")

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

style_start = content.find('<TabsContent value="style"')
style_end = content.find('</TabsContent>', style_start)

if style_start == -1 or style_end == -1:
    print("Could not find style block")
    exit(1)

style_block = content[style_start:style_end]

# In style_block, change `wallForm.ott*` to `wallForm.styleModeSettings.ott*`
# Change `{ ...wallForm, ott*` to `{ ...wallForm, styleModeSettings: { ...wallForm.styleModeSettings, ott* }`
# Example: 
# value={wallForm.ottItemsPerRow}  ->  value={wallForm.styleModeSettings?.itemsPerRow}
# onChange={(e) => setWallForm({ ...wallForm, ottItemsPerRow: parseInt(e.target.value) || 0, }) }
# ->
# onChange={(e) => setWallForm({ ...wallForm, styleModeSettings: { ...(wallForm.styleModeSettings || {}), itemsPerRow: parseInt(e.target.value) || 0 } }) }

# It's much simpler to just replace EVERY `wallForm.ott([A-Za-z0-9]+)` with `wallForm.styleModeSettings?.['\1']`
# But `onChange` is trickier because of the spread operator: `...wallForm, ottX:`
# Let's replace: `\.\.\.wallForm,\s+ott([A-Za-z0-9]+):` with `...wallForm, styleModeSettings: { ...(wallForm.styleModeSettings || {}), \1:`
# Wait, if there are multiple lines inside setWallForm... The user only assigns one property at a time in the UI!
# Let's check!
style_block = re.sub(r'wallForm\.ott([A-Za-z0-9_]+)', r"(wallForm.styleModeSettings?.['\1'])", style_block)

style_block = re.sub(r'\.\.\.wallForm,\s*ott([A-Za-z0-9_]+):', r"...wallForm, styleModeSettings: { ...(wallForm.styleModeSettings || {}), '\1':", style_block)
# Now we need to add the closing `}` to `setWallForm({ ... `
# The replacement above turns:
# setWallForm({ ...wallForm, ottItemsPerRow: val }) 
# into:
# setWallForm({ ...wallForm, styleModeSettings: { ...(wallForm.styleModeSettings || {}), 'ItemsPerRow': val })
# We are missing the final closing `}`!
# How to add it?
style_block = re.sub(r"(styleModeSettings: \{ \.\.\.\(wallForm\.styleModeSettings \|\| \{\}\), '[A-Za-z0-9_]+': [^}]+)(\})", r"\1 } }", style_block)

# Let's see if there's any `Boolean(wallForm.styleModeSettings?.['...'])` instead of just checked={...}
# Some Checkboxes have `checked={wallForm.ottShowHeroSlider}` -> `checked={Boolean(wallForm.styleModeSettings?.['ShowHeroSlider'])}`
style_block = re.sub(r'checked=\{\(wallForm\.styleModeSettings\?\.\[''([A-Za-z0-9_]+)''\]\)\}', r"checked={Boolean(wallForm.styleModeSettings?.['\1'])}", style_block)

content = content[:style_start] + style_block + content[style_end:]

with open("app/admin/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Replacement complete!")
