const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // If backgroundColor is explicitly '' it overrides siteSettings backgroundColor fallback
    await prisma.category.updateMany({
        where: { name: 'Ana Duvar' },
        data: {
          backgroundColor: null,
          backgroundImage: null,
          gradientFrom: null,
          gradientVia: null,
          gradientTo: null,
          borderColor: null,
          borderTopColor: null,
          borderBottomColor: null
        }
    });

    const category = await prisma.category.findFirst({ where: { name: 'Ana Duvar' } });
    console.log(category.backgroundColor, category.backgroundImage);
}
main().finally(() => prisma.$disconnect());
