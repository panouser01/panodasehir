import re

admin_path = 'app/admin/page.tsx'
with open(admin_path, 'r') as f:
    admin = f.read()

# Default states
admin = admin.replace(
    "ottTopMenuMarqueeSpeed: 30,",
    "ottTopMenuMarqueeSpeed: 30, ottCategoryHeaderGlassy: false,"
)

# Parsed Settings
admin = admin.replace(
    "ottCategoryTitleSize: getV('ottCategoryTitleSize', '2xl'),",
    "ottCategoryTitleSize: getV('ottCategoryTitleSize', '2xl'),\n        ottCategoryHeaderGlassy: getV('ottCategoryHeaderGlassy', false),"
)

# Wall Form
admin = admin.replace(
    "ottCategoryTitleSize: getV('ottCategoryTitleSize', '2xl'),",
    "ottCategoryTitleSize: getV('ottCategoryTitleSize', '2xl'),\n      ottCategoryHeaderGlassy: getB('ottCategoryHeaderGlassy', false),"
)

# Save API conversion
admin = admin.replace(
    "ottCategoryTitleSize: wallForm.ottCategoryTitleSize,",
    "ottCategoryTitleSize: wallForm.ottCategoryTitleSize,\n        ottCategoryHeaderGlassy: wallForm.ottCategoryHeaderGlassy,"
)

# UI Elements
# For section 1 "renderSiteGorseli" (which is global app settings)
site_ui = """                                       <div className="flex items-center space-x-2">
                                         <Checkbox 
                                           id="style-ott-category-header-glassy"
                                           checked={parsedSettings.ottCategoryHeaderGlassy ?? false}
                                           onCheckedChange={(checked) => handleSettingChange('ottCategoryHeaderGlassy', !!checked)}
                                         />
                                         <Label htmlFor="style-ott-category-header-glassy" className="cursor-pointer text-sm font-medium">Kategori başlıkları saydam buton üstünde</Label>
                                       </div>\n"""

admin = admin.replace(
    '<Label htmlFor="style-ott-show-category-titles" className="cursor-pointer text-sm font-medium text-amber-700">Başlıkları Göster (Kategori/Duvar İsmi)</Label>\n                                       </div>',
    '<Label htmlFor="style-ott-show-category-titles" className="cursor-pointer text-sm font-medium text-amber-700">Başlıkları Göster (Kategori/Duvar İsmi)</Label>\n                                       </div>\n' + site_ui
)

# For section 2 "renderWallGorseli" (Wall Settings)
wall_ui = """                                       <div className="flex items-center space-x-2">
                                         <Checkbox 
                                           id="wall-ott-category-header-glassy"
                                           checked={wallForm.ottCategoryHeaderGlassy ?? false}
                                           onCheckedChange={(checked) => setWallForm({ ...wallForm, ottCategoryHeaderGlassy: !!checked })}
                                         />
                                         <Label htmlFor="wall-ott-category-header-glassy" className="cursor-pointer text-sm font-medium">Kategori başlıkları saydam buton üstünde</Label>
                                       </div>\n"""

admin = admin.replace(
    '<Label htmlFor="wall-ott-show-category-titles" className="cursor-pointer text-sm font-medium text-amber-700">Başlıkları Göster (Kategori/Duvar İsmi)</Label>\n                                       </div>',
    '<Label htmlFor="wall-ott-show-category-titles" className="cursor-pointer text-sm font-medium text-amber-700">Başlıkları Göster (Kategori/Duvar İsmi)</Label>\n                                       </div>\n' + wall_ui
)

with open(admin_path, 'w') as f:
    f.write(admin)

print("Updated app/admin/page.tsx variables and UI")
