const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.category.updateMany({ where: {}, data: { isWallTransparent: null }})
  .then(() => prisma.siteSettings.upsert({ 
    where: { id: 'global' }, 
    update: { isWallTransparent: true, backgroundImage: null }, 
    create: { id: 'global', isWallTransparent: true, backgroundImage: null }
  }))
  .then(() => console.log('ok'))
  .catch(console.error);
