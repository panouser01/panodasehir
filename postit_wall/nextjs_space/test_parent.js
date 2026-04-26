const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cats = await prisma.category.findMany({
    select: { name: true, parentId: true, id: true }
  });
  console.log(cats);
}

main().catch(console.error).finally(() => prisma.$disconnect());
