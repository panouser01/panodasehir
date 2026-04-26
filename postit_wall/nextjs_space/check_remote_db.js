const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cats = await prisma.category.findMany({
    where: { 
      OR: [
        { name: 'EĞİTİM' },
        { parent: { name: 'EĞİTİM' } }
      ]
    },
    select: { id: true, name: true, postitAppearance: true, parentId: true }
  });
  console.log(JSON.stringify(cats, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
