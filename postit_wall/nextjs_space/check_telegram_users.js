const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { telegramChatId: { not: null } },
    select: { email: true, telegramChatId: true, role: true }
  });
  console.log("Users with Telegram connected:");
  console.log(users);
}

main().catch(console.error).finally(() => prisma.$disconnect());
