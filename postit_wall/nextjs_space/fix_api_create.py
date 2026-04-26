with open("app/api/categories/route.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Add to destructuring
destructure_marker = "ottModalTextColor,"
destructure_insert = "ottModalTextColor,\n    styleModeSettings,"
if content.count(destructure_marker) == 1:
    content = content.replace(destructure_marker, destructure_insert)

# Add to data mapping
data_marker = "ottModalTextColor: ottModalTextColor || null,"
data_insert = "ottModalTextColor: ottModalTextColor || null,\n        styleModeSettings: styleModeSettings || {},"
if content.count(data_marker) == 1:
    content = content.replace(data_marker, data_insert)

with open("app/api/categories/route.ts", "w", encoding="utf-8") as f:
    f.write(content)

print("Created route updated")
