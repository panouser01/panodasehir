import re

content = open('app/page.tsx').read()

target1 = "import { getCachedCategories, filterActiveCategories, flattenCategories } from '@/lib/services/category.service'"
replacement1 = "import { getCachedCategories, filterActiveCategories, flattenCategories, filterViewableCategoriesByUser } from '@/lib/services/category.service'"

content = content.replace(target1, replacement1)

# Find where flattenCategories is called
# const activeCategoriesTree = filterActiveCategories(allCategories)
# const categories = flattenCategories(activeCategoriesTree as any)
target2 = """  const activeCategoriesTree = filterActiveCategories(allCategories)
  const categories = flattenCategories(activeCategoriesTree as any)"""
replacement2 = """  const activeCategoriesTree = filterActiveCategories(allCategories)
  const userRole = (session?.user as any)?.role;
  const userId = (session?.user as any)?.id;
  const viewableCategoriesTree = filterViewableCategoriesByUser(activeCategoriesTree as any, userRole, userId)
  const categories = flattenCategories(viewableCategoriesTree as any)"""

content = content.replace(target2, replacement2)

open('app/page.tsx', 'w').write(content)
print("Updated app/page.tsx")
