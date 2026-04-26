
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany();
  let found = null;
  for (const c of categories) {
    if (c.name.toLowerCase().includes('cumbal')) {
       console.log('FOUND MISSING WALL:', c.id, c.name, c.parentId);
       found = c;
    }
  }

  if (!found) {
    console.log("Still not found!");
    return;
  }

  const alacati = await prisma.category.findFirst({
    where: { name: "Alaçatı" }
  });

  if (alacati) {
    console.log('FOUND ALACATI PARENT:', alacati.id);
    await prisma.category.update({
      where: { id: found.id },
      data: { parentId: alacati.id, isActive: true }
    });
    console.log("Successfully moved!");
  } else {
    // If exact "Alaçatı" not found, let's search it
    for (const c of categories) {
      if (c.name.toLowerCase().includes('alaçatı') || c.name.toLowerCase().includes('alacati')) {
          console.log('Possible parent:', c.id, c.name);
          await prisma.category.update({
            where: { id: found.id },
            data: { parentId: c.id, isActive: true }
          });
          console.log("Successfully moved to possible parent!");
          break;
      }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
