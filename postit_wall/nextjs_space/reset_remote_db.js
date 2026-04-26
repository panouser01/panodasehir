const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.category.updateMany({
    where: { 
      OR: [
        { name: 'EĞİTİM' },
        { parent: { name: 'EĞİTİM' } }
      ]
    },
    data: { 
      postitAppearance: null,
      customLayout: null
    }
  });
  console.log("Affected rows resetting postitAppearance:", result.count);
}

main().catch(console.error).finally(() => prisma.$disconnect());
