import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Fetching locations from API...')

    const res = await fetch('https://turkiyeapi.dev/api/v1/provinces')
    const body = await res.json() as any

    if (body.status !== 'OK') {
        throw new Error('API request failed')
    }

    const provinces = body.data

    for (const province of provinces) {
        const cityName = province.name

        // Create or find city
        let city = await prisma.city.findFirst({
            where: { name: cityName }
        })

        if (!city) {
            city = await prisma.city.create({
                data: { name: cityName }
            })
            console.log(`City created: ${cityName}`)
        } else {
            console.log(`City exists: ${cityName}`)
        }

        // Process districts
        const districts = province.districts || []
        for (const district of districts) {
            const districtName = district.name

            const existingDistrict = await prisma.district.findFirst({
                where: { name: districtName, cityId: city.id }
            })

            if (!existingDistrict) {
                await prisma.district.create({
                    data: {
                        name: districtName,
                        cityId: city.id
                    }
                })
                console.log(`  District created: ${districtName} (${cityName})`)
            }
        }
    }

    console.log('Locations seeded successfully!')
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
