import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateAllWalls() {
  try {
    const result = await prisma.category.updateMany({
      data: {
        ottCardRatio: '9/13',
      },
    });
    console.log(`Updated ${result.count} categories/walls to use ottCardRatio: '9/13'`);
  } catch (error) {
    console.error('Error updating walls:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAllWalls();
