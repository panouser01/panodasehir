const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cats = await prisma.category.findMany({
    where: { parentId: null, isActive: true },
    select: { name: true }
  });
  console.log("Root Categories in DB:", cats.map(c => c.name));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
