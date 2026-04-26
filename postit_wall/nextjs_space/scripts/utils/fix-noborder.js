const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    await prisma.category.updateMany({
        where: { name: 'Ana Duvar' },
        data: {
          noBorder: true
        }
    });

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
    console.log("update noBorder empty");
}
main().finally(() => prisma.$disconnect());
