import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const anaduvar = await prisma.category.findFirst({
    where: { name: 'Ana Duvar' }
  })
  console.log("Category DB postitAppearance:", anaduvar?.postitAppearance)
  
  const siteSettings = await prisma.siteSettings.findUnique({
    where: { id: 'global' }
  })
  console.log("SiteSettings DB postitAppearance:", siteSettings?.postitAppearance)
}
main().finally(() => prisma.$disconnect())
