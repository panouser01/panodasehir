
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function q() {
  const sl = await p.slider.findMany({where:{categoryId: 'cmmhvhwof0001w8q547vndb0c'}});
  console.log('Ana Duvar Sliders:', sl);
}
q().then(()=>p.$disconnect())
