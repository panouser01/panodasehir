const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const cats = await prisma.category.findMany({
    where: { logoUrl: { not: null, not: '' } },
    select: { id: true, name: true, logoUrl: true }
  });
  console.log(JSON.stringify(cats, null, 2));
}
main().finally(() => prisma.$disconnect());
