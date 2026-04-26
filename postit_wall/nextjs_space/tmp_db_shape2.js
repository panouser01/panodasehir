const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.category.updateMany({
    where: { name: 'EĞİTİM' },
    data: { postitAppearance: { shapeType: "circle" } }
  });
  console.log("Update result:", result);
}
main().finally(() => prisma.$disconnect());
