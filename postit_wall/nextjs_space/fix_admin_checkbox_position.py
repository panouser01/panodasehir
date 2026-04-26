import re

with open('app/admin/page.tsx', 'r') as f:
    text = f.read()

# 1. OTT Mode Checkbox Move
ott_checkbox_block = """                          <div className="flex items-center space-x-2 mt-4 ml-2">
                            <Checkbox
                              id="ott-show-category-titles"
                              checked={wallForm.ottShowCategoryTitles}
                              onCheckedChange={(checked) =>
                                setWallForm({
                                  ...wallForm,
                                  ottShowCategoryTitles: !!checked,
                                })
                              }
                            />
                            <Label
                              htmlFor="ott-show-category-titles"
                              className="cursor-pointer text-sm"
                            >
                              Satırlar: Slayder Başlıklarını (Kategori İsimleri)
                              Göster
                            </Label>
                          </div>"""

# Remove from old position
text = text.replace(ott_checkbox_block, "")

# Insert before Kategori Başlığı Hizalaması block
ott_target = """                          {wallForm.ottShowCategoryTitles && (
                            <div className="space-y-4 pt-4 border-t border-gray-100">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                  <Label>Kategori Başlığı Hizalaması</Label>"""

ott_replacement = ott_checkbox_block + "\n\n" + ott_target
text = text.replace(ott_target, ott_replacement)

# 2. Style Mode Checkbox Move
smod_checkbox_block = """                          <div className="flex items-center space-x-2 mt-4 ml-2">
                            <Checkbox
                              id="smod-show-category-titles"
                              checked={!!(wallForm.styleModeSettings?.showCategoryTitles ?? wallForm.ottShowCategoryTitles)}
                              onCheckedChange={(checked) =>
                                setWallForm({
                                  ...wallForm, styleModeSettings: { ...(wallForm.styleModeSettings || {}), showCategoryTitles: !!checked,
                                 } })
                              }
                            />
                            <Label
                              htmlFor="smod-show-category-titles"
                              className="cursor-pointer text-sm"
                            >
                              Satırlar: Slayder Başlıklarını (Kategori İsimleri)
                              Göster
                            </Label>
                          </div>"""

# Remove from old position
text = text.replace(smod_checkbox_block, "")

# Insert before Kategori Başlığı Hizalaması block in Style Mode
smod_target = """                          {(wallForm.styleModeSettings?.showCategoryTitles ?? wallForm.ottShowCategoryTitles) && (
                            <div className="space-y-4 pt-4 border-t border-gray-100">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                  <Label>Kategori Başlığı Hizalaması</Label>"""

smod_replacement = smod_checkbox_block + "\n\n" + smod_target
text = text.replace(smod_target, smod_replacement)

with open('app/admin/page.tsx', 'w') as f:
    f.write(text)
