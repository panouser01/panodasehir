import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const articles = await prisma.article.findMany({
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { id: true, title: true, images: true, documents: true }
    })
    console.log(JSON.stringify(articles, null, 2))
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
