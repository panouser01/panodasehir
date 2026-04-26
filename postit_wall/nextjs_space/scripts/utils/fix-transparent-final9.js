const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    await prisma.siteSettings.upsert({
        where: { id: 'global' },
        update: {
            backgroundColor: '',
            backgroundImage: '',
            gradientFrom: '',
            gradientTo: '',
            gradientVia: '',
            isWallTransparent: true
        },
        create: {
            id: 'global',
        }
    });

    await prisma.category.updateMany({
        where: { name: 'Ana Duvar' },
        data: {
            backgroundColor: '',
            backgroundImage: '',
            gradientFrom: '',
            gradientTo: '',
            gradientVia: '',
            isWallTransparent: true
        }
    });

    console.log("update str");
}
main().finally(() => prisma.$disconnect());
