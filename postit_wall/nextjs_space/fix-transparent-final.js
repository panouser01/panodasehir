const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    await prisma.category.updateMany({
        where: { name: 'Ana Duvar' },
        data: {
            backgroundColor: null,
            backgroundImage: null,
            gradientFrom: null,
            gradientTo: null,
            gradientVia: null,
            isWallTransparent: true,
            isGradient: false
        }
    });
    console.log("update ana");

    await prisma.siteSettings.upsert({
        where: { id: 'global' },
        update: {
            backgroundColor: null,
            backgroundImage: null,
            gradientFrom: null,
            gradientTo: null,
            gradientVia: null,
            isWallTransparent: true,
            isGradient: false
        },
        create: {
            id: 'global',
            backgroundColor: null,
            backgroundImage: null,
            gradientFrom: null,
            gradientTo: null,
            gradientVia: null,
            isWallTransparent: true,
            isGradient: false
        }
    });

    console.log("update site");
}
main().finally(() => prisma.$disconnect());
