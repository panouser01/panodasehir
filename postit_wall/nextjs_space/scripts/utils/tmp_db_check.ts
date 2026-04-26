const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const globalSettings = await prisma.siteSettings.findUnique({
    where: { id: 'global' }
  })
  console.log("Global Settings postitAppearance: ", globalSettings?.postitAppearance)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
