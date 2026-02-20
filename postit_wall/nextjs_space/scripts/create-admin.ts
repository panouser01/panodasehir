import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@panodasehir.com'
  const password = 'Admin123!'
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  console.log(`Creating/Updating admin user: ${email}`)

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
    create: {
      email,
      name: 'Super Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  })

  console.log('Admin user created successfully:')
  console.log({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name
  })
}

main()
  .catch((e) => {
    console.error('Error creating admin user:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
