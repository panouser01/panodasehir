import os
import re

def patch_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Look for onClick wrapping the whole card, like:
    # <div className="absolute inset-0 z-10 cursor-pointer" onClick={() => {
    #    const postitBtn = document.getElementById(`postit-${postit.id}-front-cover`);
    #    if (postitBtn) postitBtn.click();
    # }}></div>
    
    # We will just do a regex replace to safely inject the navigation check!
    # Regex to find: cursor-pointer" onClick={() => {\n\s*const postitBtn
    pattern = r'(onClick=\{\(\)\s*=>\s*\{)(?!\s*if\s*\(\(postit\s*as\s*any\)\.isVirtualNav\))'

    replacement = r'\1\n                  if ((postit as any).isVirtualNav) { window.location.href = `/?category=${(postit as any).categoryTargetId}`; return; }'

    new_content = re.sub(pattern, replacement, content)
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Patched", filepath, new_content != content)

patch_file("components/postit/ott-slider.tsx")
patch_file("components/postit/postit-masonry-grid.tsx")
