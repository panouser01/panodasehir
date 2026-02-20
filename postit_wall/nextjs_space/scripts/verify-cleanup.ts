
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- Verifying Database Integrity ---')

    const categories = await prisma.category.findMany()
    const duplicateCategories = categories.filter((c, i, arr) => arr.findIndex(t => t.name === c.name) !== i)
    console.log(`Duplicate Categories: ${duplicateCategories.length}`)

    const postits = await prisma.postIt.findMany()
    const duplicatePostIts = postits.filter((p, i, arr) => arr.findIndex(t => t.content === p.content && t.categoryId === p.categoryId) !== i)
    console.log(`Duplicate PostIts (same content & category): ${duplicatePostIts.length}`)

    // Check post counts
    let invalidCounts = 0
    for (const cat of categories) {
        const count = await prisma.postIt.count({
            where: { categoryId: cat.id, isApproved: true, expiresAt: { gt: new Date() } }
        })
        if (cat.postCount !== count) {
            console.log(`Mismatch for ${cat.name}: stored ${cat.postCount}, actual ${count}`)
            invalidCounts++
        }
    }
    console.log(`Categories with invalid post counts: ${invalidCounts}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
