
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const catId = 'cmnzr0oyb0009m1jyp6ko8qn3';
  
  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + 1); // 1 year from now

  const result = await prisma.postIt.updateMany({
    where: { categoryId: catId },
    data: { 
      isPublished: true, 
      isApproved: true,
      expiresAt: futureDate 
    }
  });

  console.log(`Updated ${result.count} postits to be published, approved, and expire in 1 year.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
