
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Starting category post count sync...')

    const categories = await prisma.category.findMany()
    console.log(`Found ${categories.length} categories. calculating counts...`)

    for (const category of categories) {
        // Count active approved post-its for this category (direct children only)
        // Note: The UI displays recursive counts, but the schema stores per-category count.
        // Let's store the DIRECT count in the category. The UI can sum up children if needed,
        // or we can store the recursive count?
        // The implementation plan said "store the count of active, approved post-its directly on the Category model".
        // Usually this means direct post-its. Recursive summing is done in UI or via another field.
        // Let's store direct count. The recursive logic is already in `calculateTotalPostits` in frontend.

        const count = await prisma.postIt.count({
            where: {
                categoryId: category.id,
                isApproved: true,
                expiresAt: {
                    gt: new Date()
                }
            }
        })

        if (category.postCount !== count) {
            console.log(`Updating category ${category.name} (${category.id}): ${category.postCount} -> ${count}`)
            await prisma.category.update({
                where: { id: category.id },
                data: { postCount: count }
            })
        }
    }

    console.log('Sync completed.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
