import os

with open('app/page.tsx', 'r') as f:
    content = f.read()

# 1. Subcategory title alignment (Line ~1221)
# Old was: ml-6 (24px)
# We need ml-[36px] and ensure pl-0 inside.
old_sub_container = 'relative inline-flex items-center justify-center group ${activeAlignment === "left" ? "ml-6"'
new_sub_container = 'relative inline-flex items-center justify-center group ${activeAlignment === "left" ? "ml-[36px]"'
content = content.replace(old_sub_container, new_sub_container)

# 2. Main category title alignment (Line ~1488)
old_main_container = 'relative inline-flex items-center justify-center group ${ottSettings.categoryTitleAlignment === "left" ? "ml-[36px]"' # Wait, my previous script put ml-[24px] or ml-6? Let's check what it is now.
# Actually I replaced ml-4 with ml-6, then ml-6 with ml-[24px]. Let's match the current state.
content = content.replace('ml-[24px]', 'ml-[36px]')
content = content.replace('ml-6', 'ml-[36px]')

# 3. Fix the internal padding of the ribbon to ensure pl-0 when aligned left
# Around line 1502
old_ribbon_padding = 'className={appearance.ribbonColor !== \'none\' ? "relative px-8 md:px-14 py-3'
new_ribbon_padding = 'className={appearance.ribbonColor !== \'none\' ? `relative ${ottSettings.categoryTitleAlignment === "left" ? "pl-0 pr-8 md:pr-14" : "px-8 md:px-14"} py-3'
content = content.replace(old_ribbon_padding, new_ribbon_padding)

with open('app/page.tsx', 'w') as f:
    f.write(content)

print("Alignment fixed to 36px with pl-0!")
