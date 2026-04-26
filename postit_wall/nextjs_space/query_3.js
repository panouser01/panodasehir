const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cats = await prisma.category.findMany({
    where: { name: { in: ['Ana Duvar', 'Spor', 'Kültür & Sanat', 'Taste'] } },
    select: { name: true, ottCardBgColor: true, postitAppearance: true }
  });
  console.log(JSON.stringify(cats, null, 2));
}
main().finally(() => prisma.$disconnect());
