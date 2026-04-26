const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.category.updateMany({
    where: { name: 'Belediyelerimiz' },
    data: { name: 'Belediyeler' }
  });
  console.log("Update result:", result);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
