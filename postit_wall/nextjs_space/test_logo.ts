import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    select: { name: true, logoUrl: true, id: true }
  })
  console.log("Root categories:", categories)
}

main().finally(() => prisma.$disconnect())
