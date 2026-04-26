const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const categories = await prisma.category.findMany({ select: { id: true, name: true, isWallTransparent: true } });
    console.log(categories);
    const siteSettings = await prisma.siteSettings.findUnique({ where: { id: 'global' } });
    console.log(siteSettings);
}
main().finally(() => prisma.$disconnect());
