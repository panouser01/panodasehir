import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const cats = await prisma.category.findMany({ select: { name: true, ribbonColor: true, isOttActive: true } });
  console.log(cats);
}
main()
