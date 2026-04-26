import { prisma } from '@/lib/db'
import { unstable_cache } from 'next/cache'

export type CategoryWithChildren = {
  id: string
  name: string
  isActive?: boolean
  expirationDate?: Date | null
  postitAppearance?: any
  customLayout?: any
  children?: CategoryWithChildren[]
  [key: string]: any // To accommodate other Prisma fields seamlessly
}

export const getCachedCategories = unstable_cache(
  async () => {
    return await prisma.category.findMany({
      include: {
        children: {
          include: {
            children: {
              include: {
                children: {
                  include: {
                    children: {
                      orderBy: [
                        { order: 'asc' },
                        { name: 'asc' }
                      ]
                    }
                  },
                  orderBy: [
                    { order: 'asc' },
                    { name: 'asc' }
                  ]
                }
              },
              orderBy: [
                { order: 'asc' },
                { name: 'asc' }
              ]
            }
          },
          orderBy: [
            { order: 'asc' },
            { name: 'asc' }
          ]
        }
      },
      where: {
        parentId: null
      },
      orderBy: [
        { order: 'asc' },
        { name: 'asc' }
      ]
    })
  },
  ['all-categories-tree'],
  { revalidate: 300, tags: ['all-categories-tree'] } // Cache for 5 minutes but explicitly bust on save
)

export const filterActiveCategories = (cats: CategoryWithChildren[]): CategoryWithChildren[] => {
  const now = new Date()
  return cats.filter(c => {
    const isExpired = c.expirationDate && new Date(c.expirationDate) < now
    return c.isActive !== false && !isExpired
  }).map(c => ({
    ...c,
    children: c.children ? filterActiveCategories(c.children) : []
  }))
}

export const flattenCategories = (cats: CategoryWithChildren[], depth: number = 0): any[] => {
  const result: any[] = []
  for (const cat of cats) {
    result.push({ 
      ...cat, 
      postitAppearance: cat.postitAppearance,
      customLayout: cat.customLayout,
      depth 
    })
    if (cat.children && cat.children.length > 0) {
      result.push(...flattenCategories(cat.children, depth + 1))
    }
  }
  return result
}
