import re
import os

with open("app/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Chunk 1: Stop flattening, only use direct children when isAutoGrouped = true
target1 = """                if (wallSettingsIds.length === 0 && ottGroupBySubwalls) {
                  const getDescendantIds = (cat: any): string[] => {
                    const ids: string[] = [];
                    if (cat.children && cat.children.length > 0) {
                      cat.children.forEach((child: any) => {
                        ids.push(child.id);
                        ids.push(...getDescendantIds(child));
                      });
                    }
                    return ids;
                  };

                  const currentCat = selectedCategory || homeWall;
                  if (currentCat) {
                    const descIds = getDescendantIds(currentCat);
                    if (descIds.length > 0) {
                      wallSettingsIds = descIds;
                      isAutoGrouped = true;
                    }
                  }
                }"""

replacement1 = """                if (wallSettingsIds.length === 0 && ottGroupBySubwalls) {
                  const currentCat = selectedCategory || homeWall;
                  if (currentCat && currentCat.children && currentCat.children.length > 0) {
                    wallSettingsIds = currentCat.children.map((child: any) => child.id);
                    isAutoGrouped = true;
                  }
                }"""

# Chunk 2: Wrap mapping loop in a self-evaluating function with recursive renderCategoryTree
target2 = """                      {wallSettingsIds.map((catId: string, index: number) => {"""

replacement2 = """                      {(() => {
                        const renderCategoryTree = (catId: string, level: number, index: number): React.ReactNode => {"""


target3 = """                        return (
                          <React.Fragment key={cat.id}>"""

# We need to adjust `activeTitleSize` based on `level` !
# It is defined around: const activeTitleSize = ... 'text-3xl md:text-5xl';
# Also we need to change how the Fragment is laid out.
replacement3 = """                        // Adjust scale based on hierarchy level
                        let renderTitleSize = activeTitleSize;
                        if (isAutoGrouped) {
                            if (level === 1) renderTitleSize = 'text-2xl md:text-4xl';
                            else if (level >= 2) renderTitleSize = 'text-xl md:text-3xl';
                        }
                        
                        return (
                          <React.Fragment key={`${cat.id}-${level}`}>"""

# Fix `activeTitleSize` variable usage in the ribbon:
target4 = """<h2 className={`${activeTitleSize} tracking-normal mb-0`}"""
replacement4 = """<h2 className={`${renderTitleSize} tracking-normal mb-0`}"""


# Update the ending of the mapping logic:
target5 = """                                  )
                                )}
                              </div>
                            </div>
                            }
                          />
                            
                            {/* Separator Ad */}"""

replacement5 = """                                  )
                                )}
                                
                                {/* RECURSIVE CHILDS */}
                                {isAutoGrouped && cat.children && cat.children.length > 0 && (
                                   <div className={`w-full mt-6 mb-4 flex flex-col gap-2 ${level === 0 ? 'pl-2 md:pl-6 border-l-4 border-black/10' : 'pl-2 md:pl-4 border-l-2 border-black/10'}`}>
                                      {cat.children.map((child: any, childIdx: number) => renderCategoryTree(child.id, level + 1, childIdx))}
                                   </div>
                                )}
                              </div>
                            </div>
                            }
                          />
                            
                            {/* Separator Ad ONLY ON TOP LEVEL */}"""

target6 = """                            {separatorAds.length > 0 && ((index + 1) % ((separatorAds[index % separatorAds.length] as any).frequency || 1) === 0) && ("""
replacement6 = """                            {level === 0 && separatorAds.length > 0 && ((index + 1) % ((separatorAds[index % separatorAds.length] as any).frequency || 1) === 0) && ("""

target7 = """                          </React.Fragment>
                        )
                      })}"""
replacement7 = """                          </React.Fragment>
                        );
                      }; // end renderCategoryTree
                      return wallSettingsIds.map((catId: string, index: number) => renderCategoryTree(catId, 0, index));
                    })()}"""


def apply_patch():
    c = content.replace(target1, replacement1)
    if c == content: print("Failed patch 1"); return
    c2 = c.replace(target2, replacement2)
    if c2 == c: print("Failed patch 2"); return
    c3 = c2.replace(target3, replacement3)
    if c3 == c2: print("Failed patch 3"); return
    c4 = c3.replace(target4, replacement4)
    if c4 == c3: print("Failed patch 4"); return
    c5 = c4.replace(target5, replacement5)
    if c5 == c4: print("Failed patch 5"); return
    c6 = c5.replace(target6, replacement6)
    if c6 == c5: print("Failed patch 6"); return
    c7 = c6.replace(target7, replacement7)
    if c7 == c6: print("Failed patch 7"); return
    
    with open("app/page.tsx", "w", encoding="utf-8") as fw:
        fw.write(c7)
    print("Patch applied successfully!")

apply_patch()
