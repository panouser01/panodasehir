import re

with open("app/admin/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Remove TabsTrigger for ott
trigger_pattern = r'<TabsTrigger\s*value="ott"\s*className="flex items-center gap-2 flex-grow sm:flex-grow-0"\s*>\s*<LayoutTemplate className="w-4 h-4" /> OTT Mod\s*</TabsTrigger>'
content = re.sub(trigger_pattern, '', content)

# 2. Extract TabsContent for ott
ott_content_pattern = r'<TabsContent value="ott" className="space-y-4 pt-2">([\s\S]*?)</TabsContent>\s*<TabsContent value="editor" className="space-y-4 pt-4">'
match = re.search(ott_content_pattern, content)
if not match:
    print("Could not find TabsContent for ott!")
    exit(1)

ott_inner = match.group(1)

# Remove the OTT TabsContent block
content = content.replace(f'<TabsContent value="ott" className="space-y-4 pt-2">{ott_inner}</TabsContent>', '')

# Modify the OTT inner text slightly to rename it
ott_inner = ott_inner.replace('<LayoutTemplate className="w-5 h-5" /> OTT Görünüm', '<LayoutTemplate className="w-5 h-5" /> Slayder Görünüm')
ott_inner = ott_inner.replace('Görüntüleme türünü aktif et (OTT Mod)', 'Slayder Görüntüleme Türünü Aktif Et (Netflix Görünümü)')

# 3. Inject it inside the <TabsContent value="sliders"> block
# We want to change:
#               <TabsContent value="sliders" className="space-y-4 pt-2">
#                 {wallForm.name === "Ana Duvar"
#                   ? renderSliderSettings()
#                   : renderWallSliderTabContent()}
#               </TabsContent>
# Into:
#               <TabsContent value="sliders" className="space-y-4 pt-2">
#                 {wallForm.name === "Ana Duvar"
#                   ? renderSliderSettings()
#                   : (
#                     <>
#                       {renderWallSliderTabContent()}
#                       <div className="mt-8 border-t-2 border-indigo-100 pt-8">
#                         {ott_inner}
#                       </div>
#                     </>
#                   )}
#               </TabsContent>

replacement = f"""              <TabsContent value="sliders" className="space-y-4 pt-2">
                {{wallForm.name === "Ana Duvar"
                  ? renderSliderSettings()
                  : (
                    <>
                      {{renderWallSliderTabContent()}}
                      <div className="mt-8 border-t-2 border-indigo-100 pt-8">
                        {ott_inner}
                      </div>
                    </>
                  )}}
              </TabsContent>"""

sliders_pattern = r'<TabsContent value="sliders" className="space-y-4 pt-2">\s*\{wallForm\.name === "Ana Duvar"\s*\?\s*renderSliderSettings\(\)\s*:\s*renderWallSliderTabContent\(\)\}\s*</TabsContent>'

content = re.sub(sliders_pattern, replacement, content)

with open("app/admin/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Done!")
