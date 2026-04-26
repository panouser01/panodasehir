import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const anaduvar = await prisma.category.findFirst({
    where: { name: 'Ana Duvar' },
    select: { postitAppearance: true, id: true }
  })
  
  const siteSettings = await prisma.siteSettings.findUnique({
    where: { id: 'global' },
    select: { postitAppearance: true }
  })
  
  console.log('--- ANA DUVAR CATEGORY DB ---')
  console.log(anaduvar)
  
  console.log('--- SITE SETTINGS DB ---')
  console.log(siteSettings)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
