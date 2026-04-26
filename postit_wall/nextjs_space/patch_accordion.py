import os

with open("app/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

target1 = """                        return (
                          <div key={cat.id} className={catOttIsActive ? "flex flex-col gap-1" : "space-y-4"}>
                            {(!catOttIsActive || catOttShowCategoryTitles) && ("""

replacement1 = """                        return (
                          <CategoryAccordionWrapper
                            key={cat.id}
                            className={catOttIsActive ? "flex flex-col gap-1" : "space-y-4"}
                            isAutoGrouped={isAutoGrouped}
                            defaultOpen={false}
                            headerNode={
                              (!catOttIsActive || catOttShowCategoryTitles) ? ("""

target2 = """                               )}
                            </div>
                            )}

                            <div
                              className={`relative flex overflow-hidden transition-all duration-300 ${catOttIsActive && ottSettings.topMenuLabelHasBorder ? 'shadow-[inset_0_0_20px_rgba(0,0,0,0.4),0_6px_12px_rgba(0,0,0,0.2)] rounded-sm' : (!catOttIsActive && !cat.noInnerBorder && !cat.isInnerTransparent ? 'shadow-[inset_0_0_20px_rgba(0,0,0,0.4),0_6px_12px_rgba(0,0,0,0.2)] rounded-sm' : '')} z-10 flex-1 w-full`}"""

replacement2 = """                               )}
                            </div>
                              ) : <div className="h-2" />
                            }
                            contentNode={
                            <div
                              className={`relative flex overflow-hidden transition-all duration-300 ${catOttIsActive && ottSettings.topMenuLabelHasBorder ? 'shadow-[inset_0_0_20px_rgba(0,0,0,0.4),0_6px_12px_rgba(0,0,0,0.2)] rounded-sm' : (!catOttIsActive && !cat.noInnerBorder && !cat.isInnerTransparent ? 'shadow-[inset_0_0_20px_rgba(0,0,0,0.4),0_6px_12px_rgba(0,0,0,0.2)] rounded-sm' : '')} z-10 flex-1 w-full`}"""

target3 = """                                    />
                                  )
                                )}
                              </div>
                            </div>
                            
                            {/* Separator Ad */}"""

replacement3 = """                                    />
                                  )
                                )}
                              </div>
                            </div>
                            }
                          />
                        );
                        // The return above closes CategoryAccordionWrapper

                        // Below separator ad is taken out of map rendering? Wait, we can just leave it after wrapper but in map!
                        // Actually, map needs to return ONE root element.
                        // Wait, map returns `<CategoryAccordionWrapper>` now. Where does separator ad go?!
                        // Let's wrap both in a Fragment."""

# Instead of target3 above, let's just do a clean regex or find.
# The original structure:
# return (
#   <div key> -> WE CHANGE THIS TO <React.Fragment key> BUT wait React.Fragment is hard to style if we have className.
#   Actually, the map needs to return one element.
#   So wrapping `CategoryAccordionWrapper` and `SeparatorAd` in a <div>.

print("Fixing app/page.tsx")
