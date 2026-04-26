app_path = 'app/page.tsx'
with open(app_path, 'r') as f:
    app = f.read()

# Add catOttHeaderGlassy
app = app.replace(
    "const catOttShowCategoryTitles = cat.ottShowCategoryTitles !== undefined && cat.ottShowCategoryTitles !== null ? cat.ottShowCategoryTitles : ottSettings.showCategoryTitles;",
    "const catOttShowCategoryTitles = cat.ottShowCategoryTitles !== undefined && cat.ottShowCategoryTitles !== null ? cat.ottShowCategoryTitles : ottSettings.showCategoryTitles;\n                        const catOttHeaderGlassy = cat.ottCategoryHeaderGlassy !== undefined && cat.ottCategoryHeaderGlassy !== null ? cat.ottCategoryHeaderGlassy : ottSettings.categoryHeaderGlassy;"
)

# Replace Location 1 (Main direct postits - line 1476ish)
app = app.replace(
    "<div className={`relative flex items-center w-full ${appearance.ribbonColor === 'none' ? 'mt-3 mb-1' : 'mt-4 mb-2'} z-10 transition-transform hover:scale-[1.02] duration-300`}>",
    "<div className={`relative flex items-center w-full z-10 transition-transform hover:scale-[1.02] duration-300 ${ottSettings.categoryHeaderGlassy ? 'bg-white/10 backdrop-blur-md shadow-lg border border-white/20 rounded-xl py-2 px-4 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] mt-3 mb-2 mx-1' : (appearance.ribbonColor === 'none' ? 'mt-3 mb-1' : 'mt-4 mb-2')}`}>"
)

# Replace Location 2 (Main bottom limited postits - line 1951ish)
# Let's check how many times the replace actually happens by doing it with regex or count
import re
app = re.sub(
    r"<div className={`relative flex items-center w-full \$\{appearance\.ribbonColor === 'none' \? 'mt-3 mb-1' : 'mt-4 mb-2'\} z-10 transition-transform hover:scale-\[1.02\] duration-300`}>",
    r"<div className={`relative flex items-center w-full z-10 transition-transform hover:scale-[1.02] duration-300 ${ottSettings.categoryHeaderGlassy ? 'bg-white/10 backdrop-blur-md shadow-lg border border-white/20 rounded-xl py-2 px-4 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] mt-3 mb-2 mx-1' : (appearance.ribbonColor === 'none' ? 'mt-3 mb-1' : 'mt-4 mb-2')}`}>",
    app
)

# Replace Location 3 (Inside Accordion loops - line 1759ish)
app = app.replace(
    "<div className={`relative flex items-center w-full ${catOttIsActive ? (isTransparent ? 'mt-3 mb-1' : 'mt-4 mb-2') : 'mt-6 mb-8'} z-10 transition-transform hover:scale-[1.02] duration-300`}>",
    "<div className={`relative flex items-center w-full z-10 transition-transform hover:scale-[1.02] duration-300 ${catOttIsActive && catOttHeaderGlassy ? 'bg-white/10 backdrop-blur-md shadow-lg border border-white/20 rounded-xl py-2 px-4 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] mt-3 mb-2 mx-1' : (catOttIsActive ? (isTransparent ? 'mt-3 mb-1' : 'mt-4 mb-2') : 'mt-6 mb-8')}`}>"
)

with open(app_path, 'w') as f:
    f.write(app)

print("Updated app/page.tsx")
