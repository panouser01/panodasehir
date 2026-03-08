const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.category.updateMany({ where: { name: 'Ana Duvar' }, data: { backgroundColor: null, backgroundImage: null, isGradient: null }})
  .then(() => prisma.siteSettings.upsert({ 
    where: { id: 'global' }, 
    update: { isWallTransparent: true, backgroundColor: null, backgroundImage: null, isGradient: null }, 
    create: { id: 'global', isWallTransparent: true, backgroundColor: null, backgroundImage: null, isGradient: null }
  }))
  .then(() => console.log('ok'))
  .catch(console.error);
