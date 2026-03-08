const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const res = await prisma.category.updateMany({
        where: { name: 'Ana Duvar' },
        data: {
            isWallTransparent: true,
            isGradient: false
        }
    });
    console.log('Ana Duvar updated', res);
}
main().finally(() => prisma.$disconnect());
