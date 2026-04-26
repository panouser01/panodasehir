const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    await prisma.category.updateMany({
        where: { name: 'Ana Duvar' },
        data: {
            backgroundColor: '',
            backgroundImage: '',
            gradientFrom: '',
            gradientTo: '',
            gradientVia: '',
            isWallTransparent: true,
            isGradient: false
        }
    });
    console.log("update ana");

    await prisma.siteSettings.upsert({
        where: { id: 'global' },
        update: {
            backgroundColor: '',
            backgroundImage: '',
            gradientFrom: '',
            gradientTo: '',
            gradientVia: '',
            isWallTransparent: true,
            isGradient: false
        },
        create: {
            id: 'global',
            backgroundColor: '',
            backgroundImage: '',
            gradientFrom: '',
            gradientTo: '',
            gradientVia: '',
            isWallTransparent: true,
            isGradient: false
        }
    });

    console.log("update site");
}
main().finally(() => prisma.$disconnect());
