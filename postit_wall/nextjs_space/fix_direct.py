import re

with open('app/page.tsx', 'r') as f:
    text = f.read()

# Fix md:ml-12 in direct postits
old1 = """<div className={`relative inline-flex items-center justify-center group ${ottSettings.categoryTitleAlignment === 'left' ? 'md:ml-12 ml-4' : ottSettings.categoryTitleAlignment === 'right' ? 'md:mr-12 mr-4 mx-4' : 'mx-4'}`}>"""
new1 = """<div className={`relative inline-flex items-center justify-center group ${ottSettings.categoryTitleAlignment === 'left' ? 'ml-4' : ottSettings.categoryTitleAlignment === 'right' ? 'mr-4 mx-2' : 'mx-4'}`}>"""
text = text.replace(old1, new1)

# Fix px-8 in direct postits inner container
old2 = """<div className={appearance.ribbonColor !== 'none' ? "relative px-8 md:px-14 py-3 rounded-sm border-b-[6px] border-r-4 border-black/30 shadow-xl flex flex-col sm:flex-row items-center gap-3 decoration-transparent bg-cover bg-center" : `relative px-8 py-1 flex flex-col sm:flex-row items-center gap-3 decoration-transparent hover:scale-[1.02] transition-transform`}"""
new2 = """<div className={appearance.ribbonColor !== 'none' ? "relative px-8 md:px-14 py-3 rounded-sm border-b-[6px] border-r-4 border-black/30 shadow-xl flex flex-col sm:flex-row items-center gap-3 decoration-transparent bg-cover bg-center" : `relative px-0 py-1 flex flex-col sm:flex-row items-center gap-3 decoration-transparent hover:scale-[1.02] transition-transform`}"""
text = text.replace(old2, new2)

with open('app/page.tsx', 'w') as f:
    f.write(text)
