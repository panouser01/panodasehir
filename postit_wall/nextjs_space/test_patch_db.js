const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const c = await prisma.category.findFirst({ where: { name: 'EĞİTİM' } });
  console.log("Before:", c.postitAppearance);
  
  const res = await prisma.category.update({
    where: { id: c.id },
    data: {
      postitAppearance: { backgroundImage: "/api/test", shapeType: "custom" }
    }
  });
  console.log("After:", res.postitAppearance);
}

main().catch(console.error).finally(() => prisma.$disconnect());
