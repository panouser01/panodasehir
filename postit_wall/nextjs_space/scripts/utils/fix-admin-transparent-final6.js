const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.category.updateMany({ where: { name: 'Ana Duvar' }, data: { backgroundColor: '', backgroundImage: '', isGradient: false, isWallTransparent: true }})
  .then(() => prisma.siteSettings.upsert({ 
    where: { id: 'global' }, 
    update: { isWallTransparent: true, backgroundColor: '', backgroundImage: '', isGradient: false }, 
    create: { id: 'global', isWallTransparent: true, backgroundColor: '', backgroundImage: '', isGradient: false }
  }))
  .then(() => console.log('ok'))
  .catch(console.error);
