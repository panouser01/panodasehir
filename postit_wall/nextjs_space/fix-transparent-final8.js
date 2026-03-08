const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    await prisma.siteSettings.upsert({
        where: { id: 'global' },
        update: {
            backgroundColor: null,
            backgroundImage: null,
            gradientFrom: null,
            gradientTo: null,
            gradientVia: null
        },
        create: {
            id: 'global',
        }
    });

    await prisma.category.updateMany({
        where: { name: 'Ana Duvar' },
        data: {
            backgroundColor: null,
            backgroundImage: null,
            gradientFrom: null,
            gradientTo: null,
            gradientVia: null
        }
    });

    console.log("update str");
}
main().finally(() => prisma.$disconnect());
