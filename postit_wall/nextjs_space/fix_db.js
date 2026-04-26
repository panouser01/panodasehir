const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.siteSettings.update({
    where: { id: 'global' },
    data: {
      postitAppearance: {},
      ottCardBgColor: ''
    }
  });

  const allCats = await prisma.category.findMany();
  for (const cat of allCats) {
    if (cat.name !== 'Ana Duvar') {
       // Clear them out from other walls to test isolation
       /*
       await prisma.category.update({
         where: { id: cat.id },
         data: { ottCardBgColor: '' }
       });
       */
    }
  }

  console.log("Global settings cleared.");
}

main().catch(console).finally(() => prisma.$disconnect());
