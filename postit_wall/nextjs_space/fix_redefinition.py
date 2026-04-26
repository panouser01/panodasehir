import re

content = open('app/page.tsx').read()

target = """  const activeCategoriesTree = filterActiveCategories(allCategories)
  const userRole = (session?.user as any)?.role;
  const userId = (session?.user as any)?.id;
  const viewableCategoriesTree = filterViewableCategoriesByUser(activeCategoriesTree as any, userRole, userId)
  const categories = flattenCategories(viewableCategoriesTree as any)"""

replacement = """  const activeCategoriesTree = filterActiveCategories(allCategories)
  const _userRole = (session?.user as any)?.role;
  const _userId = (session?.user as any)?.id;
  const viewableCategoriesTree = filterViewableCategoriesByUser(activeCategoriesTree as any, _userRole, _userId)
  const categories = flattenCategories(viewableCategoriesTree as any)"""

content = content.replace(target, replacement)
open('app/page.tsx', 'w').write(content)
