const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const c = await prisma.category.findFirst({ where: { name: 'Ana Duvar' } });
  const s = await prisma.siteSettings.findUnique({ where: { id: 'global' } });
  console.log("Category DB:", c.postitAppearance);
  console.log("SiteSettings DB:", s.postitAppearance);
}

main().finally(() => prisma.$disconnect());
