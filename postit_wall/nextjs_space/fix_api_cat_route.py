import re

content = open('app/api/categories/route.ts').read()

target1 = "    const categoriesWithCounts = mapCounts(categories)"
replacement1 = """    const session = await getServerSession(authOptions)
    const userRole = (session?.user as any)?.role
    const userId = (session?.user as any)?.id
    const { filterViewableCategoriesByUser } = require('@/lib/services/category.service')

    const viewableCats = filterViewableCategoriesByUser(categories, userRole, userId)
    const categoriesWithCounts = mapCounts(viewableCats)"""

content = content.replace(target1, replacement1)

open('app/api/categories/route.ts', 'w').write(content)
print("Updated /api/categories/route.ts")
