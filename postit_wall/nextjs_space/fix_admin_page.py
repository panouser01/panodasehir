import re

content = open('app/admin/page.tsx').read()

target = "                    <Label>Grup Yetkisi</Label>"
replacement = """                    <div className="flex items-center justify-between">
                      <Label>Grup Yetkisi</Label>
                      {wallForm.userGroupId && (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="viewRestricted"
                            checked={wallForm.isViewRestricted}
                            onCheckedChange={(checked) => setWallForm({ ...wallForm, isViewRestricted: !!checked })}
                          />
                          <label
                            htmlFor="viewRestricted"
                            className="text-xs font-medium leading-none cursor-pointer text-gray-600"
                          >
                            Görünümü de Yetkilendir
                          </label>
                        </div>
                      )}
                    </div>"""

if target in content:
    content = content.replace(target, replacement)
    open('app/admin/page.tsx', 'w').write(content)
    print("Updated admin page label")
else:
    print("Target not found")

