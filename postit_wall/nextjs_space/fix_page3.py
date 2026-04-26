with open('app/page.tsx', 'r') as f:
    text = f.read()

old_masonry_inside = """                              <div className={`relative z-10 w-full h-full flex flex-col items-center ${catStyleModeActive ? '' : 'p-2'}`}>
                                {catStyleModeActive ? (
                                  <PostitMasonryGrid
                                    postits={catPostits as any}
                                    postitAppearance={(() => {
                                      const raw = cat.postitAppearance;
                                      if (typeof raw === 'string') {
                                        try { return JSON.parse(raw); } catch(e){ return null; }
                                      }
                                      return raw ? JSON.parse(JSON.stringify(raw)) : null;
                                    })()}
                                    itemsPerRow={catOttItemsPerRow}
                                    cardRatio={catOttCardRatio}
                                  />
                                ) : cat.isEditorModeActive ? ("""

new_masonry_inside = """                              <div className="relative z-10 w-full p-2 h-full flex flex-col items-center">
                                {cat.isEditorModeActive ? ("""

text = text.replace(old_masonry_inside, new_masonry_inside)

with open('app/page.tsx', 'w') as f:
    f.write(text)
