import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const izmir = await prisma.city.findUnique({
        where: { name: 'İZMİR' }
    })
    if (!izmir) {
        console.error('İZMİR not found')
        return
    }
    const konak = await prisma.district.findFirst({
        where: { name: 'KONAK', cityId: izmir.id }
    })
    if (!konak) {
        console.error('KONAK not found')
        return
    }

    const result = await prisma.category.updateMany({
        data: {
            cityId: izmir.id,
            districtId: konak.id
        }
    })

    console.log(`Updated ${result.count} categories to İZMİR/KONAK`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })
