import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function resetAdminPassword() {
    const email = 'admin@panodasehir.com'
    const newPassword = 'admin'
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    try {
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                role: 'SUPER_ADMIN'
            },
            create: {
                email,
                name: 'Admin',
                password: hashedPassword,
                role: 'SUPER_ADMIN'
            }
        })

        console.log(`Successfully reset password for ${user.email}`)
        console.log(`New password is: ${newPassword}`)
    } catch (error) {
        console.error('Error resetting password:', error)
    } finally {
        await prisma.$disconnect()
    }
}

resetAdminPassword()
