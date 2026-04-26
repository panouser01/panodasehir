
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const catId = 'cmnzr0oyb0009m1jyp6ko8qn3';
  const postits = await prisma.postIt.findMany({
    where: { categoryId: catId }
  });
  
  console.log(`Found ${postits.length} postits directly under the wall.`);
  postits.forEach(p => {
     console.log(`- ID: ${p.id}, status/app/pub: ${p.status}/${p.isApproved}/${p.isPublished}, expires: ${p.expiresAt}`);
  });

  // What if postits were assigned somewhere else by mistake?
  // Let's search by content keywords:
  const orphans = await prisma.postIt.findMany({
    where: {
      OR: [
        { content: { contains: "Cumbalı" } },
        { content: { contains: "Adults Only" } }
      ]
    },
    include: { category: true }
  });

  console.log(`Found ${orphans.length} postits containing 'Cumbalı' or 'Adults'.`);
  orphans.forEach(p => {
     console.log(`- Orphan ID: ${p.id}, content: ${p.content.substring(0,30)}..., categoryId: ${p.categoryId}, CatName: ${p.category ? p.category.name : 'Unknown'}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
