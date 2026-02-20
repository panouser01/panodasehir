import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function updateEmails() {
  try {
    await prisma.user.updateMany({
      where: { email: 'admin@postit.com' },
      data: { email: 'admin@panodasehir.com' }
    })
    await prisma.user.updateMany({
      where: { email: 'teknoloji@postit.com' },
      data: { email: 'teknoloji@panodasehir.com' }
    })
    await prisma.user.updateMany({
      where: { email: 'sanat@postit.com' },
      data: { email: 'sanat@panodasehir.com' }
    })
    console.log('✅ Emails updated successfully')
    const users = await prisma.user.findMany({ select: { email: true, name: true, role: true } })
    console.log('Updated users:', users)
  } catch (e) {
    console.error('Error:', e)
  } finally {
    await prisma.$disconnect()
  }
}
updateEmails()
