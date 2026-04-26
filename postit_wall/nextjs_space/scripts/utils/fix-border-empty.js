const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    await prisma.category.updateMany({
        where: { name: 'Ana Duvar' },
        data: {
          borderColor: '',
          borderTopColor: '',
          borderBottomColor: ''
        }
    });

    await prisma.siteSettings.upsert({
        where: { id: 'global' },
        update: {
          borderColor: '',
          borderTopColor: '',
          borderBottomColor: ''
        },
        create: {
          id: 'global'
        }
    });
    console.log("update borders empty");
}
main().finally(() => prisma.$disconnect());
