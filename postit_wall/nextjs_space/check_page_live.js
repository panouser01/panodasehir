const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const testID = "cmnzr0oyb0009m1jyp6ko8qn3"; // ID of Alaçatı Cumbalı
async function main() {
  const cat = await prisma.category.findUnique({ where: { id: testID } });
  console.log("DB Cat:", cat ? cat.name : "Not found");
}

main().catch(console.error).finally(() => prisma.$disconnect());
