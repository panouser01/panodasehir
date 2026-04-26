import re

with open('app/page.tsx', 'r') as f:
    content = f.read()

# Determine check function
check_fn = """
  // Helper to check if current user can add postits
  const checkCanAddPostit = (cat: any) => {
    if (userRole === 'SUPER_ADMIN') return true;
    if (!currentUserId) return false;
    if (cat?.userGroupId) {
      if (!userGroupIds.includes(cat.userGroupId)) {
        return false;
      }
    }
    return true;
  }
"""

if "const checkCanAddPostit" not in content:
    content = content.replace("  const getCanManage =", check_fn + "\n  const getCanManage =")

# Replace instances
# Instance 1: line 1449
# <div className="pointer-events-auto flex items-center pr-1">\n  <PostItForm

def replace_postit(match):
    prefix = match.group(1) # spaces before <div
    div_start = match.group(2) # <div className="pointer-events-auto flex items-center pr-1">
    postit_form = match.group(3) # <PostItForm ... />
    div_end = match.group(4) # </div>
    
    # We need to capture the target category.
    # In some uses, it's `defaultCategoryId={selectedCategory?.id || homeWall?.id!}`
    # In another, it's `defaultCategoryId={cat.id}`
    # Let's extract the defaultCategoryId
    cat_match = re.search(r'defaultCategoryId={([^}]+)}', postit_form)
    if cat_match:
        default_cat = cat_match.group(1).strip()
        if 'selectedCategory' in default_cat:
             target = "(selectedCategory || homeWall)"
        elif 'cat.id' in default_cat:
             target = "cat"
        else:
             target = default_cat
             
        replacement = f"{prefix}{{checkCanAddPostit({target}) && (\n{prefix}{div_start}\n{postit_form}\n{prefix}{div_end}\n{prefix})}}"
        return replacement
    return match.group(0)

# We want to match the whole block for <div className="pointer-events-auto flex items-center pr-1"> \n <PostItForm .... /> \n </div>
import re
pattern = re.compile(r'(^[ \t]*)(<div className="pointer-events-auto flex items-center pr-1">)[\s\n]*?(<PostItForm\s+.*?/>)[\s\n]*?(</div>)', re.MULTILINE | re.DOTALL)
content = pattern.sub(replace_postit, content)

with open('app/page.tsx', 'w') as f:
    f.write(content)
