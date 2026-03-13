import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const ss = await prisma.siteSettings.findFirst()
  console.log("SiteSettings:\n useCustomLayout:", ss?.useCustomLayout, "\n customLayout:", ss?.customLayout)
  const cat = await prisma.category.findFirst({ where: { useCustomLayout: true } })
  console.log("\nCategory with custom layout:\n name:", cat?.name, "\n useCustomLayout:", cat?.useCustomLayout, "\n customLayout:", cat?.customLayout)
}
main().catch(console.error).finally(() => prisma.$disconnect())
