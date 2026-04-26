const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cats = await prisma.category.findMany({
    select: { name: true, postitAppearance: true }
  });
  console.log(JSON.stringify(cats.slice(0, 5), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
