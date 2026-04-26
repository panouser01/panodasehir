import os
import re

with open("app/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace Imports
content = content.replace(
    "import { CategoryAccordionWrapper } from '@/components/postit/category-accordion-wrapper'",
    "import { AccordionProvider, AccordionToggle, AccordionContent } from '@/components/postit/category-accordion-wrapper'"
)

# Part 1: Replace CategoryAccordionWrapper root element and headerNode
# Search for:
target1 = """                          <CategoryAccordionWrapper
                            isAutoGrouped={isAutoGrouped}
                            className={catOttIsActive ? "flex flex-col gap-1" : "space-y-4"}
                            headerNode={
                              (!catOttIsActive || catOttShowCategoryTitles) ? ("""

replacement1 = """                          <AccordionProvider
                            isAutoGrouped={isAutoGrouped}
                            className={catOttIsActive ? "flex flex-col gap-1 z-30 relative" : "space-y-4 z-30 relative"}
                          >
                            {(!catOttIsActive || catOttShowCategoryTitles) && ("""

content = content.replace(target1, replacement1)

# Part 2: Adjust <a href> index layering
target2 = """                                    <a href={`/?category=${cat.id}&from=${categoryId || 'root'}`} className="absolute inset-0 z-0" aria-label={cat.name}></a>
                                    <div className="flex flex-row items-center gap-2 relative z-10 pointer-events-none">"""

replacement2 = """                                    <a href={`/?category=${cat.id}&from=${categoryId || 'root'}`} className="absolute inset-0 z-0 cursor-pointer" aria-label={cat.name}></a>
                                    <div className="flex flex-row items-center gap-2 relative z-10 pointer-events-none">"""
content = content.replace(target2, replacement2)

# Part 3: Inject <AccordionToggle /> before <h2>
target3 = """                                          <PostItForm 
                                            categories={categories}
                                            defaultCategoryId={cat.id}
                                            userGroupIds={(session?.user as any)?.userGroupIds}
                                            userRole={(session?.user as any)?.role}
                                            customTrigger={
                                              <div className="bg-gradient-to-br from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 shadow-md border border-yellow-300 p-1 sm:p-1.5 rounded-lg cursor-pointer flex items-center justify-center hover:scale-110 transition-transform duration-300 mt-0.5" title={`${cat.name} Kategorisine Post-it Ekle`}>
                                                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-950" strokeWidth={3} />
                                              </div>
                                            }
                                          />
                                        </div>
                                      )}
                                      <h2 className={`${renderTitleSize} tracking-normal mb-0`}"""

replacement3 = """                                          <PostItForm 
                                            categories={categories}
                                            defaultCategoryId={cat.id}
                                            userGroupIds={(session?.user as any)?.userGroupIds}
                                            userRole={(session?.user as any)?.role}
                                            customTrigger={
                                              <div className="bg-gradient-to-br from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 shadow-md border border-yellow-300 p-1 sm:p-1.5 rounded-lg cursor-pointer flex items-center justify-center hover:scale-110 transition-transform duration-300 mt-0.5" title={`${cat.name} Kategorisine Post-it Ekle`}>
                                                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-950" strokeWidth={3} />
                                              </div>
                                            }
                                          />
                                        </div>
                                      )}
                                      <AccordionToggle />
                                      <h2 className={`${renderTitleSize} tracking-normal mb-0 pointer-events-auto cursor-pointer`}
                                        onClick={() => { window.location.href = `/?category=${cat.id}&from=${categoryId || 'root'}`; }}"""
content = content.replace(target3, replacement3)

# Part 4: Adjust closing tags to replace contentNode
target4 = """                                  ) : null
                                }
                            contentNode={
                              <div className="w-full">
                                {/************************/}
                                {/* Category Map Listing */}"""

replacement4 = """                                  )}
                              </AccordionContent>
                            )}
                            <AccordionContent>
                              <div className="w-full relative z-20">
                                {/************************/}
                                {/* Category Map Listing */}"""
content = content.replace(target4, replacement4)

# Part 5: Close AccordionProvider instead of CategoryAccordionWrapper
target5 = """                                )}
                              </div>
                            </div>
                            }
                          />
                            
                            {/* Separator Ad ONLY ON TOP LEVEL */}"""

replacement5 = """                                )}
                              </div>
                            </div>
                            </AccordionContent>
                          </AccordionProvider>
                            
                            {/* Separator Ad ONLY ON TOP LEVEL */}"""
content = content.replace(target5, replacement5)

with open("app/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Replacement applied")
