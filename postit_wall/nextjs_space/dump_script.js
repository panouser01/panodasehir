
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const sliders = await prisma.slider.findMany();
  console.log(JSON.stringify(sliders, null, 2));
}
run().then(() => prisma.$disconnect());
