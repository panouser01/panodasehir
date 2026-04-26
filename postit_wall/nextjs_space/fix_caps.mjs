import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const cats = await prisma.category.findMany()
  console.log("Categories:")
  for (const cat of cats) {
    if (cat.name === cat.name.toUpperCase() && cat.name.match(/[A-Z]/)) {
      console.log(`Uppercase found: ${cat.name} (ID: ${cat.id})`)
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
