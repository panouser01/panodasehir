const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const cats = await prisma.category.findMany({ where: { title: { contains: 'hava', mode: 'insensitive' } } });
  console.log(cats);
}
main().catch(console.error).finally(() => prisma.$disconnect());
