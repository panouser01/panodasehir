
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function q() {
  const s = await p.siteSettings.findUnique({where:{id:'global'}});
  console.log('SiteSettings OTT Show Hero:', s.ottShowHeroSlider);
  const sl = await p.slider.findMany({where:{categoryId: 'cmmhvhwof0001w8q547vndb0c'}});
  console.log('Ana Duvar Sliders:', sl.length);
}
q().then(()=>p.$disconnect())
