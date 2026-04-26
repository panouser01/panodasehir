const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const p = await prisma.postIt.findFirst({ where: { content: { contains: 'Rammstein' } }});
  console.log(p.imageUrl);
}
main().catch(console.error).finally(() => prisma.$disconnect());
