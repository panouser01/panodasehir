const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cats = await prisma.category.findMany({
    select: { name: true, isOttActive: true, ottCardBgColor: true, heroTitleColor: true }
  });
  console.log(cats);
}

main().catch(console.error).finally(() => prisma.$disconnect());
