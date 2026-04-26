const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
async function run() {
  const users = await prisma.user.findMany({ select: { id: true, name: true, nickname: true, email: true, permissions: true, role: true } })
  const filtered = users.filter((u) => JSON.stringify(u).toLowerCase().includes('depo'))
  console.log(JSON.stringify(filtered, null, 2))
}
run()
