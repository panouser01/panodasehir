const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.siteSettings.findUnique({ where: { id: 'global' }}).then(s => { console.log(JSON.stringify(s.ottModalTextColor)); process.exit(0); })
