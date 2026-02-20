
import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

const roles = [
    {
        name: 'SUPER_ADMIN',
        description: 'Süper Yönetici - Tüm sisteme tam erişim.'
    },
    {
        name: 'WALL_MANAGER',
        description: 'Duvar Yöneticisi - Belirli duvarları ve altındaki notları yönetebilir.'
    },
    {
        name: 'USER',
        description: 'Kullanıcı - Standart kullanıcı, not oluşturabilir ve kendi notlarını yönetebilir.'
    }
]

async function main() {
    console.log('Syncing roles...')

    for (const role of roles) {
        const existingRole = await prisma.userRole.findUnique({
            where: { name: role.name }
        })

        if (existingRole) {
            console.log(`Role ${role.name} already exists. Updating description...`)
            await prisma.userRole.update({
                where: { name: role.name },
                data: { description: role.description }
            })
        } else {
            console.log(`Creating role ${role.name}...`)
            await prisma.userRole.create({
                data: {
                    name: role.name,
                    description: role.description
                }
            })
        }
    }

    // Check unique roles currently in use by users (just in case schema changed or raw queries were used)
    // Since Role is an enum in schema, this is redundant but good for verification
    // But we can't easily select distinct enum values via findMany distinct in a way that gives us values not in enum if they somehow exist (which they shouldn't in SQL with enum constraint).

    console.log('Roles synced successfully.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
