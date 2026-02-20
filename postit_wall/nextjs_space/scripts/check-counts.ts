
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- Checking Category Post Counts ---')
    const categories = await prisma.category.findMany({
        select: { id: true, name: true, postCount: true, parentId: true }
    })

    categories.forEach(c => {
        console.log(`${c.name} (${c.id}): ${c.postCount} (Parent: ${c.parentId})`)
    })
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
