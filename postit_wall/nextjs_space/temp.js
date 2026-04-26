const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.category.findMany({ select: { name: true, ottModalTextColor: true } }).then(docs => { console.log(JSON.stringify(docs.filter(d => ['DUYURULAR', 'SAĞLIK & YAŞAM'].includes(d.name)))); process.exit(0); })
