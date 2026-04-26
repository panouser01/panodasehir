const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const s = await prisma.siteSettings.findUnique({ where: { id: 'global' }, select: { ottCardBgColor: true, postitAppearance: true } });
  console.log(JSON.stringify(s, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
