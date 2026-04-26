const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany();
  
  categories.forEach(c => {
    if (c.name.toLowerCase().includes("cumbal")) {
        console.log(`- ID: ${c.id}, Name: "${c.name}", ParentId: ${c.parentId}`);
    }
    if (c.name.toLowerCase().includes("adults")) {
        console.log(`- ID: ${c.id}, Name: "${c.name}", ParentId: ${c.parentId}`);
    }
  });

}

main().catch(console.error).finally(() => prisma.$disconnect());
