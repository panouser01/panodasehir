const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const anaDuvar = await prisma.category.findFirst({
        where: { name: 'Ana Duvar' },
        select: {
          id: true,
          isWallTransparent: true,
          isGradient: true,
          backgroundColor: true,
          backgroundImage: true,
        }
    });
    console.log('Ana Duvar in DB:', anaDuvar);
}
main().finally(() => prisma.$disconnect());
