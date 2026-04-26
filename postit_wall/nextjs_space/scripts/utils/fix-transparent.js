const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const categories = await prisma.category.findMany();
    console.log(categories.filter(c => c.isWallTransparent));
}
main().finally(() => prisma.$disconnect());
