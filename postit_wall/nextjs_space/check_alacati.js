
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const alacatiList = await prisma.category.findMany({
    where: { name: "Alaçatı" },
    include: { parent: true }
  });
  
  console.log("Found Alaçatı nodes:");
  alacatiList.forEach(a => {
    console.log(`- ID: ${a.id}, Parent: ${a.parent ? a.parent.name : 'root'}`);
  });

  const hotel = await prisma.category.findFirst({
    where: { name: { contains: "Cumbal" } },
    include: { parent: true }
  });
  if (hotel) {
     console.log(`Hotel currently under: ${hotel.parent ? hotel.parent.name : 'root'} (Parent ID: ${hotel.parentId})`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
