with open("app/api/categories/[id]/route.ts", "r", encoding="utf-8") as f:
    content = f.read()

setter = "    if (body.isStyleModeActive !== undefined) (updateData as any).isStyleModeActive = body.isStyleModeActive"
new_setter = setter + "\n    if (body.styleModeSettings !== undefined) (updateData as any).styleModeSettings = body.styleModeSettings"
content = content.replace(setter, new_setter)

with open("app/api/categories/[id]/route.ts", "w", encoding="utf-8") as f:
    f.write(content)
