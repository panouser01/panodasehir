const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.category.updateMany({ where: { name: 'Ana Duvar' }, data: { isWallTransparent: true }})
  .then(() => console.log('ok'))
  .catch(console.error);
