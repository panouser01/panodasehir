import os
import re

schema_path = 'prisma/schema.prisma'
with open(schema_path, 'r') as f:
    schema = f.read()

if 'ottCategoryHeaderGlassy' not in schema:
    schema = schema.replace(
        'ottCategoryTitleSize      String?             @default("2xl")',
        'ottCategoryTitleSize      String?             @default("2xl")\n  ottCategoryHeaderGlassy   Boolean?            @default(false)'
    )
    schema = schema.replace(
        'ottCategoryTitleSize         String?  @default("2xl")',
        'ottCategoryTitleSize         String?  @default("2xl")\n  ottCategoryHeaderGlassy      Boolean? @default(false)'
    )
    with open(schema_path, 'w') as f:
        f.write(schema)
    print("Schema updated.")

api_paths = [
    ('app/api/categories/route.ts', "ottCategoryTitleSize: body.ottCategoryTitleSize || '2xl',", "ottCategoryTitleSize: body.ottCategoryTitleSize || '2xl',\n        ottCategoryHeaderGlassy: body.ottCategoryHeaderGlassy !== undefined ? body.ottCategoryHeaderGlassy : false,"),
    ('app/api/categories/[id]/route.ts', "if (body.ottCategoryTitleSize !== undefined) updateData.ottCategoryTitleSize = body.ottCategoryTitleSize", "if (body.ottCategoryTitleSize !== undefined) updateData.ottCategoryTitleSize = body.ottCategoryTitleSize\n    if (body.ottCategoryHeaderGlassy !== undefined) updateData.ottCategoryHeaderGlassy = body.ottCategoryHeaderGlassy"),
    ('app/api/settings/route.ts', "if (data.ottCategoryTitleSize !== undefined) updateData.ottCategoryTitleSize = data.ottCategoryTitleSize", "if (data.ottCategoryTitleSize !== undefined) updateData.ottCategoryTitleSize = data.ottCategoryTitleSize\n        if (data.ottCategoryHeaderGlassy !== undefined) updateData.ottCategoryHeaderGlassy = data.ottCategoryHeaderGlassy")
]

for path, search, replace in api_paths:
    with open(path, 'r') as f:
        content = f.read()
    if 'ottCategoryHeaderGlassy' not in content:
        content = content.replace(search, replace)
        with open(path, 'w') as f:
            f.write(content)
        print(f"Updated {path}")

# Admin page
admin_path = 'app/admin/page.tsx'
with open(admin_path, 'r') as f:
    admin = f.read()

# Add to OTT panel in admin page
admin_search_wall = '''<div className="flex flex-col gap-1.5 ml-8 mt-2 opacity-80 border-l-2 border-indigo-500/30 pl-3">
                                  <label className="flex items-center gap-3">
                                    <input
                                      type="checkbox"
                                      checked={formData.ottShowHeroSlider ?? true}'''
admin_replace_wall = '''<label className="flex items-center gap-3 mb-2">
                                    <input
                                      type="checkbox"
                                      checked={formData.ottCategoryHeaderGlassy}
                                      onChange={(e) => handleNestedChange('ottCategoryHeaderGlassy', e.target.checked)}
                                      className="checkbox checkbox-sm checkbox-primary rounded-md"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Kategori başlıkları saydam buton üstünde</span>
                                  </label>\n''' + '<div className="flex flex-col gap-1.5 ml-8 mt-2 opacity-80 border-l-2 border-indigo-500/30 pl-3">\n                                  <label className="flex items-center gap-3">\n                                    <input\n                                      type="checkbox"\n                                      checked={formData.ottShowHeroSlider ?? true}'

admin_search_site = '''<div className="flex flex-col gap-1.5 ml-8 mt-2 opacity-80 border-l-2 border-indigo-500/30 pl-3">
                              <label className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={siteSettings.ottShowHeroSlider ?? true}'''
admin_replace_site = '''<label className="flex items-center gap-3 mb-2">
                                <input
                                  type="checkbox"
                                  checked={siteSettings.ottCategoryHeaderGlassy}
                                  onChange={(e) => setSiteSettings(prev => ({ ...prev, ottCategoryHeaderGlassy: e.target.checked }))}
                                  className="checkbox checkbox-sm checkbox-primary rounded-md"
                                />
                                <span className="text-sm font-medium text-gray-700">Kategori başlıkları saydam buton üstünde</span>
                              </label>\n''' + '<div className="flex flex-col gap-1.5 ml-8 mt-2 opacity-80 border-l-2 border-indigo-500/30 pl-3">\n                              <label className="flex items-center gap-3">\n                                <input\n                                  type="checkbox"\n                                  checked={siteSettings.ottShowHeroSlider ?? true}'

if 'ottCategoryHeaderGlassy' not in admin:
    if admin_search_wall in admin and admin_search_site in admin:
        admin = admin.replace(admin_search_wall, admin_replace_wall)
        admin = admin.replace(admin_search_site, admin_replace_site)
        with open(admin_path, 'w') as f:
            f.write(admin)
        print("Updated app/admin/page.tsx")
    else:
        print("Could not find insertion point in app/admin/page.tsx")

