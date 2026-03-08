const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    await prisma.siteSettings.upsert({
        where: { id: 'global' },
        update: {
            isWallTransparent: true,
            isGradient: false
        },
        create: {
            id: 'global',
            isWallTransparent: true,
            isGradient: false
        }
    });

    await prisma.category.updateMany({
        where: { name: 'Ana Duvar' },
        data: {
            isWallTransparent: true,
            isGradient: false
        }
    });

    console.log("update done");
}
main().finally(() => prisma.$disconnect());
