import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const cat = await prisma.category.findMany({ where: { name: { contains: 'KÜLTÜR' } } });
  console.log(cat);
}
main()
