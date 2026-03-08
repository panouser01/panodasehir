const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("update target")
}
main().finally(() => prisma.$disconnect());
