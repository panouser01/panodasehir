with open("components/postit/postit-masonry-grid.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# We need to change how the visual ratio is applied!
import re

# Find:
"""
  const getRatioClass = () => {
    switch(imageRatio) {
      case '1/1': return 'aspect-square'
      case '4/3': return 'aspect-[4/3]'
      case '3/4': return 'aspect-[3/4]'
      case 'auto': return ''
      case '16/9':
      default: return 'aspect-video'
    }
  }
"""
pattern = r'const getRatioClass = \(\) => \{[^}]*?\n\s*\}'
content = re.sub(pattern, '', content)

# Now find where it's used:
# <div className={`w-full overflow-hidden relative bg-slate-100 cursor-pointer ${getRatioClass()}`}
img_div_pattern = r'<div\s+className=\{`w-full overflow-hidden relative bg-slate-100 cursor-pointer \$\{getRatioClass\(\)\}`\}'
img_replacement = r'<div className="w-full overflow-hidden relative bg-slate-100 cursor-pointer" style={{ aspectRatio: imageRatio === "auto" ? "auto" : imageRatio }}'

content = re.sub(img_div_pattern, img_replacement, content)

with open("components/postit/postit-masonry-grid.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Grid Ratio updated!")
