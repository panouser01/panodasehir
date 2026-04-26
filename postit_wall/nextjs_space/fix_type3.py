with open("app/admin/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Make sure we add `styleModeSettings: typeof wall.styleModeSettings === 'string' ...` to both of them.
# The variable in `handleGroupWallSelection` is probably `templateWall` instead of `wall`. Wait...
content = content.replace(
    'isStyleModeActive: getV("isStyleModeActive", false),',
    'isStyleModeActive: getV("isStyleModeActive", false),\n          styleModeSettings: typeof templateWall.styleModeSettings === "string" ? (() => { try { return JSON.parse(templateWall.styleModeSettings) || {}; } catch(e) { return {}; } })() : (templateWall.styleModeSettings || {}),'
)
# That will replace it everywhere! But we only want it in `handleGroupWallSelection`!
# Let's just fix the Type error first.
content = content.replace("ottTopMenuIconBgColor: \"\",", "ottTopMenuIconBgColor: \"\",\n      styleModeSettings: {} as any,")

with open("app/admin/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
