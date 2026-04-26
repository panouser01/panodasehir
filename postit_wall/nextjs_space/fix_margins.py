import re

with open('app/page.tsx', 'r') as f:
    text = f.read()

# 1. Fix max-w-7xl constrain in Root Style Mode
old_root = """<div className={`relative flex items-center w-full mt-4 mb-2 z-10 transition-transform hover:scale-[1.02] duration-300 w-full max-w-7xl mx-auto px-4 md:px-8`}>"""
new_root = """<div className={`relative flex items-center w-full mt-4 mb-2 z-10 transition-transform hover:scale-[1.02] duration-300`}>"""
text = text.replace(old_root, new_root)


# 2. Fix inner container margin from md:ml-12 to md:ml-4
old_margin_root = """<div className={`relative inline-flex items-center justify-center group ${activeAlignment === 'left' ? 'md:ml-12 ml-4' : activeAlignment === 'right' ? 'md:mr-12 mr-4 mx-4' : 'mx-4'}`}>"""
new_margin_root = """<div className={`relative inline-flex items-center justify-center group ${activeAlignment === 'left' ? 'md:ml-4 ml-2' : activeAlignment === 'right' ? 'md:mr-4 mr-2 mx-2' : 'mx-4'}`}>"""
text = text.replace(old_margin_root, new_margin_root)


# 3. Fix inner container margin in OTT layout mapping 
old_margin_map = """<div className={`relative inline-flex items-center justify-center group ${catOttIsActive ? (activeAlignment === 'left' ? 'md:ml-12 ml-4' : activeAlignment === 'right' ? 'md:mr-12 mr-4 mx-4' : 'mx-4') : ''}`}>"""
new_margin_map = """<div className={`relative inline-flex items-center justify-center group ${catOttIsActive ? (activeAlignment === 'left' ? 'md:ml-4 ml-2' : activeAlignment === 'right' ? 'md:mr-4 mr-2 mx-2' : 'mx-4') : ''}`}>"""
text = text.replace(old_margin_map, new_margin_map)

# Also padding inside Title box is px-8 md:px-14 which creates gap
old_padding = """<div className={currentRibbonColor !== 'none' ? "relative px-8 md:px-14 py-3 rounded-sm border-b-[6px] border-r-4 border-black/30 shadow-xl flex flex-col sm:flex-row items-center gap-3 decoration-transparent" : `relative px-8 ${catOttIsActive ? 'py-1' : 'py-3'} flex flex-col sm:flex-row items-center gap-3 decoration-transparent hover:scale-[1.02] transition-transform`}"""
new_padding = """<div className={currentRibbonColor !== 'none' ? "relative px-8 md:px-14 py-3 rounded-sm border-b-[6px] border-r-4 border-black/30 shadow-xl flex flex-col sm:flex-row items-center gap-3 decoration-transparent" : `relative px-2 ${catOttIsActive ? 'py-1' : 'py-3'} flex flex-col sm:flex-row items-center gap-3 decoration-transparent hover:scale-[1.02] transition-transform`}"""
text = text.replace(old_padding, new_padding)

with open('app/page.tsx', 'w') as f:
    f.write(text)
