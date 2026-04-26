import re

with open('app/page.tsx', 'r') as f:
    text = f.read()

# 1. Root Wall Alignment (Style Mode)
old_root = """<div className={`relative inline-flex items-center justify-center group ${activeAlignment === 'left' ? 'md:ml-4 ml-2' : activeAlignment === 'right' ? 'md:mr-4 mr-2 mx-2' : 'mx-4'}`}>
                          <div className="flex items-center gap-3 relative z-30">
                            <div className={`relative px-4 py-1 flex flex-col sm:flex-row items-center gap-3 decoration-transparent hover:scale-[1.02] transition-transform`}>"""

new_root = """<div className={`relative inline-flex items-center justify-center group ${activeAlignment === 'left' ? 'ml-4' : activeAlignment === 'right' ? 'mr-4 mx-2' : 'mx-4'}`}>
                          <div className="flex items-center gap-3 relative z-30">
                            <div className={`relative px-0 py-1 flex flex-col sm:flex-row items-center gap-3 decoration-transparent hover:scale-[1.02] transition-transform`}>"""
text = text.replace(old_root, new_root)


# 2. OTT Sub-Categories Alignment
old_ott = """<div className={`relative inline-flex items-center justify-center group ${catOttIsActive ? (activeAlignment === 'left' ? 'md:ml-4 ml-2' : activeAlignment === 'right' ? 'md:mr-4 mr-2 mx-2' : 'mx-4') : ''}`}>"""
new_ott = """<div className={`relative inline-flex items-center justify-center group ${catOttIsActive ? (activeAlignment === 'left' ? 'ml-4' : activeAlignment === 'right' ? 'mr-4 mx-2' : 'mx-4') : ''}`}>"""
text = text.replace(old_ott, new_ott)

old_ott_padding = """<div className={currentRibbonColor !== 'none' ? "relative px-8 md:px-14 py-3 rounded-sm border-b-[6px] border-r-4 border-black/30 shadow-xl flex flex-col sm:flex-row items-center gap-3 decoration-transparent" : `relative px-2 ${catOttIsActive ? 'py-1' : 'py-3'} flex flex-col sm:flex-row items-center gap-3 decoration-transparent hover:scale-[1.02] transition-transform`}"""

new_ott_padding = """<div className={currentRibbonColor !== 'none' ? "relative px-8 md:px-14 py-3 rounded-sm border-b-[6px] border-r-4 border-black/30 shadow-xl flex flex-col sm:flex-row items-center gap-3 decoration-transparent" : `relative px-0 ${catOttIsActive ? 'py-1' : 'py-3'} flex flex-col sm:flex-row items-center gap-3 decoration-transparent hover:scale-[1.02] transition-transform`}"""
text = text.replace(old_ott_padding, new_ott_padding)

with open('app/page.tsx', 'w') as f:
    f.write(text)
