import re

with open('app/page.tsx', 'r') as f:
    content = f.read()

# First, let's revert the changes around 1198.
# We need to find the place where `currentStyleActive` used to be.
# It was right before `return ( <> <div className="w-full rounded-sm relative shadow-2xl flex-1"`
# But I changed that class down below!
# Let's restore the whole layout wrapper first!

old_wrapper = """            <div
              className={`w-full rounded-sm relative shadow-2xl flex-1 ${categoryId ? (selectedCategory?.isStyleModeActive ? 'p-0 bg-transparent' : 'p-4 md:p-8') : (homeWall?.isStyleModeActive ? 'p-0 bg-transparent' : 'p-4 md:p-8')}`}
              style={categoryId ? (selectedCategory?.isStyleModeActive ? { backgroundColor: 'transparent', backgroundImage: 'none', boxShadow: 'none' } : {
                backgroundColor: boardAppearance.isWallTransparent
                  ? 'transparent'
                  : boardAppearance.backgroundColor || '#cca378',
                backgroundImage: boardAppearance.isWallTransparent
                  ? 'none'
                  : 'url("/patterns/cork.png")',
                backgroundSize: boardAppearance.isWallTransparent ? 'auto' : '300px',
              }) : (homeWall?.isStyleModeActive ? { backgroundColor: 'transparent', backgroundImage: 'none', boxShadow: 'none' } : {
                backgroundColor: boardAppearance.isWallTransparent
                  ? 'transparent'
                  : boardAppearance.backgroundColor || '#cca378',
                backgroundImage: boardAppearance.isWallTransparent
                  ? 'none'
                  : 'url("/patterns/cork.png")',
                backgroundSize: boardAppearance.isWallTransparent ? 'auto' : '300px',
              })}
            >"""

new_wrapper = """            {(() => {
              const currentStyleActive = categoryId ? selectedCategory?.isStyleModeActive : homeWall?.isStyleModeActive;
              if (currentStyleActive) {
                const styleSettings = categoryId ? (selectedCategory?.styleModeSettings || homeWall?.styleModeSettings) : homeWall?.styleModeSettings;
                const activeAlignment = styleSettings?.categoryTitleAlignment || 'left';
                const activeTitleSizeRaw = styleSettings?.categoryTitleSize || '3xl';
                const sizeMap: Record<string, string> = { 'xl': 'text-xl md:text-2xl', '2xl': 'text-2xl md:text-3xl', '3xl': 'text-3xl md:text-4xl', '4xl': 'text-4xl md:text-5xl', '5xl': 'text-5xl md:text-6xl' };
                const activeTitleSize = sizeMap[activeTitleSizeRaw] || 'text-3xl md:text-5xl';
                const activeTitleColor = styleSettings?.categoryTitleColor || '#1f2937';
                const targetId = categoryId ? selectedCategory?.id : homeWall?.id;
                const canManageNow = getCanManage(targetId!, categoryId ? selectedCategory?.userGroupId : homeWall?.userGroupId);
                const activeTitleFontRaw = styleSettings?.categoryTitleFont || 'sans-serif';
                const activeTitleFont = activeTitleFontRaw === 'handwriting' ? "'Caveat', cursive" : activeTitleFontRaw === 'calibri' ? "'Calibri', sans-serif" : activeTitleFontRaw === 'arial' ? "Arial, sans-serif" : activeTitleFontRaw === 'sans-serif-generic' ? "sans-serif" : activeTitleFontRaw === 'cursive' ? "'Patrick Hand', cursive" : activeTitleFontRaw === 'monospace' ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' : "'Nunito', 'Segoe UI', system-ui, sans-serif";
                
                return (
                  <div className="w-full flex-1">
                    {/* Style Mode Category Title */}
                    {(styleSettings?.showCategoryTitles !== false) && (categoryId || homeWall) && (
                      <div className={`relative flex items-center w-full mt-4 mb-2 z-10 transition-transform hover:scale-[1.02] duration-300`}>
                        {styleSettings?.separatorStyle !== 'none' && (
                          <div className={`flex-grow border-b-[3px] ml-4 opacity-80 ${activeAlignment === 'left' ? 'hidden' : 'block'}`} style={{ borderBottomStyle: (styleSettings?.separatorStyle || 'solid') as any, borderColor: (styleSettings?.separatorColor || '#cbd5e1').split(',')[0], borderImage: (styleSettings?.separatorColor || '').includes(',') ? `linear-gradient(to left, ${(styleSettings?.separatorColor || '#cbd5e1').split(',')[0]}, ${(styleSettings?.separatorColor || '#cbd5e1').split(',')[1]}) 1` : undefined, WebkitMaskImage: (styleSettings?.separatorColor || '').includes(',') ? undefined : `linear-gradient(to left, black 0%, transparent 100%)`, maskImage: (styleSettings?.separatorColor || '').includes(',') ? undefined : `linear-gradient(to left, black 0%, transparent 100%)` }} />
                        )}
                        <div className={`relative inline-flex items-center justify-center group ${activeAlignment === 'left' ? 'md:ml-12 ml-4' : activeAlignment === 'right' ? 'md:mr-12 mr-4 mx-4' : 'mx-4'}`}>
                          <div className="flex items-center gap-3 relative z-30">
                            <div className={`relative px-4 py-1 flex flex-col sm:flex-row items-center gap-3 decoration-transparent hover:scale-[1.02] transition-transform`}>
                               <div className="flex flex-row items-center gap-2 relative z-10 pointer-events-none">
                                  <div className="pointer-events-auto flex items-center pr-1">
                                    <PostItForm 
                                      categories={categories}
                                      defaultCategoryId={categoryId || homeWall?.id!}
                                      userGroupIds={(session?.user as any)?.userGroupIds}
                                      userRole={(session?.user as any)?.role}
                                      customTrigger={
                                        <div className="bg-gradient-to-br from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 shadow-md border border-yellow-300 p-1 sm:p-1.5 rounded-lg cursor-pointer flex items-center justify-center hover:scale-110 transition-transform duration-300 mt-0.5" title="Kategoriye Post-it Ekle">
                                          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-950" strokeWidth={3} />
                                        </div>
                                      }
                                    />
                                  </div>
                                  <h2 className={`${activeTitleSize} font-bold tracking-normal mb-0 drop-shadow-sm`} style={{ color: activeTitleColor, fontFamily: activeTitleFont }}>
                                    {categoryId ? selectedCategory?.name : homeWall?.name}
                                  </h2>
                               </div>
                            </div>
                          </div>
                        </div>
                        {styleSettings?.separatorStyle !== 'none' && (
                          <div className={`flex-grow border-b-[3px] mr-4 opacity-80 ${activeAlignment === 'right' ? 'hidden' : 'block'}`} style={{ borderBottomStyle: (styleSettings?.separatorStyle || 'solid') as any, borderColor: (styleSettings?.separatorColor || '#cbd5e1').split(',')[0], borderImage: (styleSettings?.separatorColor || '').includes(',') ? `linear-gradient(to right, ${(styleSettings?.separatorColor || '#cbd5e1').split(',')[0]}, ${(styleSettings?.separatorColor || '#cbd5e1').split(',')[1]}) 1` : undefined, WebkitMaskImage: (styleSettings?.separatorColor || '').includes(',') ? undefined : `linear-gradient(to right, black 0%, transparent 100%)`, maskImage: (styleSettings?.separatorColor || '').includes(',') ? undefined : `linear-gradient(to right, black 0%, transparent 100%)` }} />
                        )}
                      </div>
                    )}
                    <PostitMasonryGrid postits={organicPostits} postitAppearance={appearance.postitAppearance} itemsPerRow={ottSettings.itemsPerRow} cardRatio={ottSettings.cardRatio} />
                  </div>
                );
              }

              return (
              <>
            <div
              className="w-full rounded-sm relative p-4 md:p-8 shadow-2xl flex-1"
              style={{
                backgroundColor: boardAppearance.isWallTransparent
                  ? 'transparent'
                  : boardAppearance.backgroundColor || '#cca378',
                backgroundImage: boardAppearance.isWallTransparent
                  ? 'none'
                  : 'url("/patterns/cork.png")',
                backgroundSize: boardAppearance.isWallTransparent ? 'auto' : '300px',
              }}
            >"""

content = content.replace(old_wrapper, new_wrapper)

with open('app/page.tsx', 'w') as f:
    f.write(content)

