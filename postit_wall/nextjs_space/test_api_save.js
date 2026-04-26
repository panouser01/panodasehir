const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testSave() {
  const cat = await prisma.category.findFirst({where: {name: 'Ana Duvar'}});
  const id = cat.id;
  
  // Try calling the HTTP endpoint via a mock or just calling the route handler natively?
  // It's a Next.js app, let's just make an HTTP request to the running Next.js dev server.
  // Oh wait, is the dev server running? Let's check with curl.
}
testSave();
