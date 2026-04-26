const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Force boolean explicitly to work around any weird issues
    await prisma.category.updateMany({
        where: { name: 'Ana Duvar' },
        data: {
          isWallTransparent: true
        }
    });
    
    await prisma.siteSettings.updateMany({
        where: { id: 'global' },
        data: {
          isWallTransparent: true
        }
    });

}
main().finally(() => prisma.$disconnect());
