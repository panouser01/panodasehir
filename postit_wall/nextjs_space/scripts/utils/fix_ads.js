const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const ads = await prisma.ad.findMany()
  for (const ad of ads) {
    if (ad.categoryId === null && (!ad.categoryIds || ad.categoryIds.length === 0)) {
      console.log(`Fixing ad ${ad.id} which has no category target...`)
      const walls = await prisma.category.findMany({ where: { isActive: true } })
      const allIds = ['root', ...walls.map(w => w.id)]
      await prisma.ad.update({
        where: { id: ad.id },
        data: { categoryIds: allIds }
      })
    }
  }
  console.log('Done fixing ads locally!')
}

main().catch(console.error).finally(()=>prisma.$disconnect())
