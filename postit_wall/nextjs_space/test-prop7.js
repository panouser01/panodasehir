const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
   const homeWall = await prisma.category.findFirst({ where: { name: 'Ana Duvar' } });
   console.log("homeWall", homeWall.isWallTransparent);

   const siteSettings = await prisma.siteSettings.findFirst({ where: { id: 'global' } });
   console.log("siteSettings", siteSettings.isWallTransparent);
}
main().finally(() => prisma.$disconnect());
