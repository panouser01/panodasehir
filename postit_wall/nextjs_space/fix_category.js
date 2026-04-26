const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany({
    where: { 
      name: { contains: "Cumbal" }
    }
  });

  if (categories.length === 0) {
    console.log("No categories found with 'Cumbal'.");
    return;
  }
  
  console.log("Found categories:");
  categories.forEach(c => {
    console.log(`- ID: ${c.id}, Name: "${c.name}", ParentId: ${c.parentId}, isActive: ${c.isActive}`);
  });
  
  const parentWall = await prisma.category.findFirst({
    where: { name: "Alaçatı" }
  });
  
  if (parentWall) {
    console.log(`Parent Alaçatı ID is: ${parentWall.id}`);
    
    // Update the first matching one
    const target = categories[0];
    const updated = await prisma.category.update({
      where: { id: target.id },
      data: { parentId: parentWall.id, isActive: true }
    });
    console.log(`Updated successfully: ${target.name} is now under ${parentWall.name}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
