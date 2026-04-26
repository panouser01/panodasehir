import os
import re

with open("components/postit/ott-slider.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Patch `className="object-cover"` in standard `<Image>`
content = content.replace(
    'className="object-cover transition-transform hover:scale-105 duration-500"',
    'className={`${(postit as any).isVirtualNav ? \'object-contain p-4\' : \'object-cover\'} transition-transform hover:scale-105 duration-500`}'
)

content = content.replace(
    'className="object-cover transition-transform group-hover:scale-105 duration-700 scale-[1.01]"',
    'className={`${(postit as any).isVirtualNav ? \'object-contain p-4\' : \'object-cover\'} transition-transform group-hover:scale-105 duration-700 scale-[1.01]`}'
)

content = content.replace(
    'className={`object-cover`} alt=""',
    'className={`${(postit as any).isVirtualNav ? \'object-contain p-4\' : \'object-cover\'}`} alt=""'
)

# 2. Patch backgroundImage size in `cover` style:
# target: backgroundSize: (postit.isWeather && weatherUI?.bgImage && (!ottCardBgType || ottCardBgType === 'postit')) ? 'cover' : ((ottCardBgType === 'image' && postitAppearance?.ottCardBgImageSize) ? postitAppearance.ottCardBgImageSize : 'cover'),
# We just replace the final `: 'cover'` with `: ((postit as any).isVirtualNav ? 'contain' : 'cover')`
# Actually let's just do a regex
target_bg_size = "backgroundSize: (postit.isWeather && weatherUI?.bgImage && (!ottCardBgType || ottCardBgType === 'postit')) ? 'cover' : ((ottCardBgType === 'image' && postitAppearance?.ottCardBgImageSize) ? postitAppearance.ottCardBgImageSize : 'cover'),"
replacement_bg_size = "backgroundSize: (postit.isWeather && weatherUI?.bgImage && (!ottCardBgType || ottCardBgType === 'postit')) ? 'cover' : ((ottCardBgType === 'image' && postitAppearance?.ottCardBgImageSize) ? postitAppearance.ottCardBgImageSize : ((postit as any).isVirtualNav ? 'contain' : 'cover')),"
content = content.replace(target_bg_size, replacement_bg_size)

# 3. Patch backgroundPosition in `cover` style:
target_bg_pos = "backgroundPosition: (postit.isWeather && weatherUI?.bgImage && (!ottCardBgType || ottCardBgType === 'postit')) ? 'center' : ((ottCardBgType === 'image' && postitAppearance?.ottCardBgImagePosition) ? postitAppearance.ottCardBgImagePosition : 'top'),"
replacement_bg_pos = "backgroundPosition: (postit.isWeather && weatherUI?.bgImage && (!ottCardBgType || ottCardBgType === 'postit')) ? 'center' : ((ottCardBgType === 'image' && postitAppearance?.ottCardBgImagePosition) ? postitAppearance.ottCardBgImagePosition : ((postit as any).isVirtualNav ? 'center' : 'top')),"
content = content.replace(target_bg_pos, replacement_bg_pos)

with open("components/postit/ott-slider.tsx", "w", encoding="utf-8") as f:
    f.write(content)

with open("components/postit/postit-masonry-grid.tsx", "r", encoding="utf-8") as f:
    content2 = f.read()

# Masonry Grid has similar structure
content2 = content2.replace(
    'className="object-cover"',
    'className={`${(postit as any).isVirtualNav ? \'object-contain p-4\' : \'object-cover\'}`}'
)

with open("components/postit/postit-masonry-grid.tsx", "w", encoding="utf-8") as f:
    f.write(content2)

print("Check patch")
