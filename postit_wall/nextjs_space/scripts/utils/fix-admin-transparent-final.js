const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.category.updateMany({ where: {}, data: { isWallTransparent: null }})
  .then(() => prisma.siteSettings.upsert({ 
    where: { id: 'global' }, 
    update: { isWallTransparent: true, backgroundImage: '' }, 
    create: { id: 'global', isWallTransparent: true, backgroundImage: '' }
  }))
  .then(() => console.log('ok'))
  .catch(console.error);
