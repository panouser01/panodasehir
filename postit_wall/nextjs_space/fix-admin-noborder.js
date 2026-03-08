const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.category.updateMany({ where: { name: 'Ana Duvar' }, data: { noBorder: true, borderColor: '', borderTopColor: '', borderBottomColor: '' }})
  .then(() => prisma.siteSettings.upsert({ 
    where: { id: 'global' }, 
    update: { noBorder: true, borderColor: '', borderTopColor: '', borderBottomColor: '' }, 
    create: { id: 'global', noBorder: true, borderColor: '', borderTopColor: '', borderBottomColor: '' }
  }))
  .then(() => console.log('ok'))
  .catch(console.error);
