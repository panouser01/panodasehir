
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany();
  for (const c of categories) {
    if (c.name.toLowerCase().includes('cumbal')) {
       console.log('STATUS:', c.id, c.name, 'Parent:', c.parentId, 'isActive:', c.isActive);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
