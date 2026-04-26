const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const res = await prisma.siteSettings.updateMany({
        where: { id: 'global' },
        data: {
          isWallTransparent: true,
          isGradient: false
        }
    });
    console.log('SiteSettings updated', res);
}
main().finally(() => prisma.$disconnect());
