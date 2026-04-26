const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cats = await prisma.category.findMany({
    where: {
      name: {
        contains: 'Belediye'
      }
    }
  });
  console.log("Found Categories with 'Belediye':", JSON.stringify(cats, null, 2));

  const allSystemCats = await prisma.category.findMany({
    where: {
      isSystem: true
    },
    select: {
      name: true,
      isSystem: true
    }
  });
  console.log("\nAll system categories:", JSON.stringify(allSystemCats, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
