const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.user.update({
    where: { email: 'admin@panodasehir.com' },
    data: { emailVerified: new Date() }
  });
  console.log('Successfully verified user:', result.email);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
