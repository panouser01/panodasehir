const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    await prisma.siteSettings.upsert({
        where: { id: 'global' },
        update: {
            noBorder: true
        },
        create: {
            id: 'global',
            noBorder: true
        }
    });

    await prisma.category.updateMany({
        where: { name: 'Ana Duvar' },
        data: {
            noBorder: true
        }
    });

    console.log("update str");
}
main().finally(() => prisma.$disconnect());
