import re

with open("app/admin/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add back the TabsTrigger value="ott" right before TabsTrigger value="editor"
trigger_editor_pattern = r'(\{\(!editingItem \|\| editingItem\.name !== "Ana Duvar"\) && \(\s*<TabsTrigger\s*value="editor")'
ott_trigger = """                <TabsTrigger
                  value="ott"
                  className="flex items-center gap-2 flex-grow sm:flex-grow-0"
                >
                  <LayoutTemplate className="w-4 h-4" /> OTT Mod
                </TabsTrigger>
"""
if '<TabsTrigger\n                  value="ott"' not in content:
    content = re.sub(trigger_editor_pattern, ott_trigger + r'\1', content)

# 2. Extract the injected OTT content from inside TabsContent value="sliders"
sliders_pattern = r'<TabsContent value="sliders" className="space-y-4 pt-2">\s*\{wallForm\.name === "Ana Duvar"\s*\?\s*renderSliderSettings\(\)\s*:\s*\(\s*<>\s*\{renderWallSliderTabContent\(\)\}\s*<div className="mt-8 border-t-2 border-indigo-100 pt-8">\s*([\s\S]*?)\s*</div>\s*</>\s*\)\}\s*</TabsContent>'

match = re.search(sliders_pattern, content)
if not match:
    print("Could not find the modified sliders block!")
    exit(1)

ott_inner = match.group(1)

# Modify strings back
ott_inner = ott_inner.replace('<LayoutTemplate className="w-5 h-5" /> Slayder Görünüm', '<LayoutTemplate className="w-5 h-5" /> OTT Görünüm')
ott_inner = ott_inner.replace('Slayder Görüntüleme Türünü Aktif Et (Netflix Görünümü)', 'Görüntüleme türünü aktif et (OTT Mod)')

# 3. Restore TabsContent value="sliders" to its original format
original_sliders = """              <TabsContent value="sliders" className="space-y-4 pt-2">
                {wallForm.name === "Ana Duvar"
                  ? renderSliderSettings()
                  : renderWallSliderTabContent()}
              </TabsContent>"""

content = re.sub(sliders_pattern, original_sliders, content)

# 4. Insert the TabsContent value="ott" right before TabsContent value="editor"
editor_content_pattern = r'(<TabsContent value="editor" className="space-y-4 pt-4">)'
ott_content = f'              <TabsContent value="ott" className="space-y-4 pt-2">\n{ott_inner}\n              </TabsContent>\n\n'
content = re.sub(editor_content_pattern, ott_content + r'\1', content)

with open("app/admin/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Revert done!")
