import sys

file_path = "app/admin/page.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# REMOVE from renderWallGorseli
old_virtual_block_wall = """                    <div className="flex items-center space-x-2 pt-2">
                        <Checkbox 
                          id="show-virtual"
                          checked={wallForm.showVirtualPostitsIfEmpty !== false}
                          onCheckedChange={(checked) => setWallForm({ ...wallForm, showVirtualPostitsIfEmpty: !!checked })}
                        />
                        <div className="flex flex-col">
                          <Label htmlFor="show-virtual" className="text-sm font-semibold text-gray-700 cursor-pointer">
                            Duvar Boşsa Sanal Postit Ekle
                          </Label>
                          <span className="text-[10px] text-gray-500">Duvarda postit yoksa alt duvarları sanal birer karta dönüştürür.</span>
                        </div>
                    </div>

"""
content = content.replace(old_virtual_block_wall, "")

# ADD to renderWallGorseli inside Duvar Arka Planı (Zemin) - Duvara Özel
gradient_end_wall = """                        </div>
                      </div>
                    )}
                  </div>
                </div>"""

new_gradient_end_wall = """                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 pt-2 p-4 bg-gray-50 rounded-lg border border-gray-100 mt-4">
                  <Checkbox 
                    id="show-virtual-wall"
                    checked={wallForm.showVirtualPostitsIfEmpty !== false}
                    onCheckedChange={(checked) => setWallForm({ ...wallForm, showVirtualPostitsIfEmpty: !!checked })}
                  />
                  <div className="flex flex-col">
                    <Label htmlFor="show-virtual-wall" className="text-sm font-semibold text-gray-800 cursor-pointer">
                      Duvar Boşsa Sanal Postit Ekle
                    </Label>
                    <span className="text-xs text-gray-500 mt-1">Duvarda postit yoksa alt duvarları sanal birer karta dönüştürür.</span>
                  </div>
                </div>"""

content = content.replace(gradient_end_wall, new_gradient_end_wall, 1)

# REMOVE from renderSiteGorseli
old_virtual_block_site = """                    <div className="flex items-center space-x-2 pt-2">
                        <Checkbox 
                          id="show-virtual-site"
                          checked={wallForm.showVirtualPostitsIfEmpty !== false}
                          onCheckedChange={(checked) => setWallForm({ ...wallForm, showVirtualPostitsIfEmpty: !!checked })}
                        />
                        <div className="flex flex-col">
                          <Label htmlFor="show-virtual-site" className="text-sm font-semibold text-gray-700 cursor-pointer">
                            Duvar Boşsa Sanal Postit Ekle
                          </Label>
                          <span className="text-[10px] text-gray-500">Duvarda postit yoksa alt duvarları sanal birer karta dönüştürür.</span>
                        </div>
                    </div>

"""
content = content.replace(old_virtual_block_site, "")

# ADD to renderSiteGorseli inside Site Genel Arka Planı
# It has exactly the same gradient_end signature!
new_gradient_end_site = """                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 pt-2 p-4 bg-gray-50 rounded-lg border border-gray-100 mt-4">
                  <Checkbox 
                    id="show-virtual-site-ground"
                    checked={wallForm.showVirtualPostitsIfEmpty !== false}
                    onCheckedChange={(checked) => setWallForm({ ...wallForm, showVirtualPostitsIfEmpty: !!checked })}
                  />
                  <div className="flex flex-col">
                    <Label htmlFor="show-virtual-site-ground" className="text-sm font-semibold text-gray-800 cursor-pointer">
                      Duvar Boşsa Sanal Postit Ekle
                    </Label>
                    <span className="text-xs text-gray-500 mt-1">Duvarda postit yoksa alt duvarları sanal birer karta dönüştürür.</span>
                  </div>
                </div>"""

# Replace the next occurrence which should be the renderSiteGorseli one
content = content.replace(gradient_end_wall, new_gradient_end_site, 1)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
