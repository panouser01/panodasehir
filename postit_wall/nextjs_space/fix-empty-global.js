const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // If backgroundImage is explicitly '' it overrides global fallbacks leading to no image rendering.
    await prisma.siteSettings.updateMany({
        where: { id: 'global' },
        data: {
          backgroundImage: null,
        }
    });

}
main().finally(() => prisma.$disconnect());
