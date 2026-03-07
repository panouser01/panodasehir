const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const anaDuvar = await prisma.category.findFirst({
        where: { name: 'Ana Duvar' }
    });
    console.log('Ana Duvar isWallTransparent (Category DB):', anaDuvar?.isWallTransparent);

    const siteSettings = await prisma.siteSettings.findUnique({
        where: { id: 'global' }
    });
    console.log('siteSettings isWallTransparent (SiteSettings DB):', siteSettings?.isWallTransparent);
}
main().finally(() => prisma.$disconnect());
