const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const existingCat = await prisma.category.findFirst({
    where: { name: 'Hava Durumu' }
  });

  if (!existingCat) {
    const newCat = await prisma.category.create({
      data: {
        name: 'Hava Durumu',
        description: 'Türkiye İllerinin Güncel Hava Durumu',
        isSystem: true,
        isActive: true,
        hideWallTitle: false,
        backgroundColor: '#ebf8ff',
        backgroundImage: '',
        icon: '⛅'
      }
    });
    console.log('Created Hava Durumu Category:', newCat.id);
  } else {
    const updated = await prisma.category.update({
      where: { id: existingCat.id },
      data: {
        isSystem: true,
        icon: existingCat.icon || '⛅',
      }
    });
    console.log('Updated existing Hava Durumu Category to System wall:', updated.id);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
