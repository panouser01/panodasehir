
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- Analyze Duplicates ---')

    // 1. Analyze Users
    console.log('\n--- Users ---')
    const users = await prisma.user.findMany()
    const usersByName: Record<string, typeof users> = {}
    users.forEach(u => {
        const name = u.name || 'Unknown'
        if (!usersByName[name]) usersByName[name] = []
        usersByName[name].push(u)
    })

    Object.entries(usersByName).forEach(([name, userList]) => {
        if (userList.length > 1) {
            console.log(`Duplicate User Name: "${name}" (${userList.length} records)`)
            userList.forEach(u => console.log(`  - ID: ${u.id}, Email: ${u.email}, Role: ${u.role}`))
        }
    })

    // 2. Analyze Categories
    console.log('\n--- Categories ---')
    const categories = await prisma.category.findMany({
        include: { _count: { select: { postits: true, children: true } } }
    })
    const categoriesByName: Record<string, typeof categories> = {}
    categories.forEach(c => {
        // Group by name (trimed) to find potential duplicates
        const name = c.name.trim()
        if (!categoriesByName[name]) categoriesByName[name] = []
        categoriesByName[name].push(c)
    })

    Object.entries(categoriesByName).forEach(([name, catList]) => {
        if (catList.length > 1) {
            console.log(`Duplicate Category Name: "${name}" (${catList.length} records)`)
            catList.forEach(c => console.log(`  - ID: ${c.id}, Parent: ${c.parentId}, PostIts: ${c._count.postits}, Children: ${c._count.children}, PostCountField: ${c.postCount}`))
        }
    })

    // 3. Analyze PostIts
    console.log('\n--- PostIts ---')
    const postits = await prisma.postIt.findMany({
        select: { id: true, content: true, userId: true, categoryId: true, isApproved: true }
    })
    // Check for exact content duplicates
    const postitsByContent: Record<string, typeof postits> = {}
    postits.forEach(p => {
        const content = p.content.trim()
        if (!postitsByContent[content]) postitsByContent[content] = []
        postitsByContent[content].push(p)
    })

    Object.entries(postitsByContent).forEach(([content, pList]) => {
        if (pList.length > 1) {
            console.log(`Duplicate PostIt Content: "${content.substring(0, 50)}..." (${pList.length} records)`)
            pList.forEach(p => console.log(`  - ID: ${p.id}, User: ${p.userId}, Category: ${p.categoryId}, Approved: ${p.isApproved}`))
        }
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
