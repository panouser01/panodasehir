const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
Promise.all([
  prisma.category.findMany({ select: { name: true, postitAppearance: true, ottModalTextColor: true } }),
  prisma.siteSettings.findUnique({ where: { id: 'global' }})
]).then(([cats, site]) => { console.log(JSON.stringify({cats: cats.filter(c => ['DUYURULAR', 'SAĞLIK & YAŞAM'].includes(c.name)), global: site.postitAppearance, g_color: site.ottModalTextColor})); process.exit(0); });
