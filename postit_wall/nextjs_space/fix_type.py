with open("app/admin/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# I need to add `styleModeSettings?: any;` to wallForm state!
marker = 'isStyleModeActive: false,'
insert = 'isStyleModeActive: false,\n    styleModeSettings: {} as any,'
content = content.replace(marker, insert)

with open("app/admin/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Type fixed!")
