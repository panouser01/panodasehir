const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Resetting all postitAppearances to default (null)...");
  
  const result = await prisma.category.updateMany({
    data: {
      postitAppearance: null,
    }
  });

  console.log(`Successfully reset ${result.count} categories.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
