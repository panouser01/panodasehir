require('dotenv').config({ path: '/var/www/panodasehir/.env' });
const { notifySubscribers } = require('./.next/server/app/api/postits/route.js') || {};
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendTelegramMessage } = require('./lib/telegram.js') || {};

async function main() {
  const admin = await prisma.user.findFirst({
    where: { email: 'admin@panodasehir.com' }
  });
  const sub = admin?.wallSubscriptions?.[0];
  console.log("Token:", process.env.TELEGRAM_BOT_TOKEN ? "EXISTS" : "MISSING");
  
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_API_URL = `https://api.telegram.org/bot${token}/sendMessage`;
  console.log("TESTING NATIVE FETCH...");
  
  try {
    const res = await fetch(TELEGRAM_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: admin.telegramChatId,
        text: "TEST MESSAGE",
        parse_mode: "HTML",
      }),
    });
    const result = await res.json();
    console.log("Fetch Result:", result);
  } catch(e) { console.error("Fetch Exception:", e); }
}
main().catch(console.error).finally(() => prisma.$disconnect());
