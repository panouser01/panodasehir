
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const result = await prisma.slider.deleteMany({
    where: { categoryId: 'cmmhvhwof0001w8q547vndb0c' }
  });
  console.log('DELETED CORRUPTED ANA DUVAR SLIDERS:', result.count);
}
run().then(() => prisma.$disconnect());
