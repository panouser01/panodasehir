const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.siteSettings.upsert({
    where: { id: "global" },
    update: { postitAppearance: { shapeType: "circle" } },
    create: { id: "global", postitAppearance: { shapeType: "circle" } }
  });
  
  await prisma.category.updateMany({
    where: { name: "Ana Duvar" },
    data: { postitAppearance: { shapeType: "circle" } }
  });

  const res = await prisma.siteSettings.findUnique({ where: { id: "global" } });
  console.log("Updated SiteSettings: ", res.postitAppearance);
}

main().finally(async () => {
  await prisma.$disconnect();
});
