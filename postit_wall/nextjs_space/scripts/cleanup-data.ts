
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- Database Cleanup Started ---')

    // 1. Cleanup Categories
    console.log('\n--- Cleaning Categories ---')
    const categories = await prisma.category.findMany({
        include: { _count: { select: { postits: true, children: true } } }
    })

    const categoriesByName: Record<string, typeof categories> = {}
    categories.forEach(c => {
        const name = c.name.trim()
        if (!categoriesByName[name]) categoriesByName[name] = []
        categoriesByName[name].push(c)
    })

    for (const [name, catList] of Object.entries(categoriesByName)) {
        if (catList.length > 1) {
            console.log(`Found ${catList.length} categories with name "${name}"`)

            // Sort by creation date (keep oldest) or by ID if dates are same.
            // Prefer ones with children/postits if dates are same?
            // Simple rule: Keep the one with most content or oldest.
            // Let's keep the one created first.
            catList.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

            const mainCategory = catList[0]
            const duplicates = catList.slice(1)

            console.log(` Keeping: ${mainCategory.id} (${mainCategory.name})`)

            for (const dup of duplicates) {
                console.log(` Processing duplicate: ${dup.id}`)

                // Move children
                await prisma.category.updateMany({
                    where: { parentId: dup.id },
                    data: { parentId: mainCategory.id }
                })

                // Move PostIts
                await prisma.postIt.updateMany({
                    where: { categoryId: dup.id },
                    data: { categoryId: mainCategory.id }
                })

                // Delete duplicate
                await prisma.category.delete({ where: { id: dup.id } })
                console.log(` Deleted duplicate category: ${dup.id}`)
            }

            // Update post count for main category
            const count = await prisma.postIt.count({
                where: {
                    categoryId: mainCategory.id,
                    isApproved: true,
                    expiresAt: { gt: new Date() }
                }
            })
            await prisma.category.update({
                where: { id: mainCategory.id },
                data: { postCount: count }
            })
            console.log(` Updated post count for ${mainCategory.name}: ${count}`)
        }
    }

    // 2. Cleanup PostIts
    console.log('\n--- Cleaning PostIts ---')
    const postits = await prisma.postIt.findMany()
    const postitsByKey: Record<string, typeof postits> = {}

    postits.forEach(p => {
        // Key by content + categoryId to identify duplicates in same category
        const key = `${p.content.trim()}|${p.categoryId}`
        if (!postitsByKey[key]) postitsByKey[key] = []
        postitsByKey[key].push(p)
    })

    for (const [key, pList] of Object.entries(postitsByKey)) {
        if (pList.length > 1) {
            console.log(`Found ${pList.length} duplicate post-its for content "${pList[0].content.substring(0, 20)}..." in category ${pList[0].categoryId}`)

            // Keep oldest
            pList.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
            const mainPostIt = pList[0]
            const duplicates = pList.slice(1)

            for (const dup of duplicates) {
                await prisma.postIt.delete({ where: { id: dup.id } })
                console.log(` Deleted duplicate post-it: ${dup.id}`)
            }
        }
    }

    // Recalculate all category counts just in case
    console.log('\n--- Syncing All Category Counts ---')
    const allCategories = await prisma.category.findMany()
    for (const cat of allCategories) {
        const count = await prisma.postIt.count({
            where: {
                categoryId: cat.id,
                isApproved: true,
                expiresAt: { gt: new Date() }
            }
        })
        if (cat.postCount !== count) {
            await prisma.category.update({
                where: { id: cat.id },
                data: { postCount: count }
            })
            console.log(` Updated ${cat.name}: ${cat.postCount} -> ${count}`)
        }
    }

    console.log('--- Cleanup Completed ---')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
