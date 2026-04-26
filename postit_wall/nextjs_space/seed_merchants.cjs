const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const city = await prisma.city.findFirst()
  const district = await prisma.district.findFirst()

  if (!city || !district) {
    console.log("No city/district found")
    return
  }

  const pwHash = await bcrypt.hash('123456', 10)

  for (let i = 1; i <= 6; i++) {
    await prisma.merchantApplication.create({
      data: {
        companyType: 'SOLE',
        storeName: `Doğrulanmış Mağaza ${i}`,
        username: `dogrulanmis${i}`,
        passwordHash: pwHash,
        contactFirstName: `İsim${i}`,
        contactLastName: `Soyisim${i}`,
        contactPhone: `555111000${i}`,
        contactEmail: `onayli${i}@test.com`,
        emailVerified: new Date(),
        address: 'Test Mah. Test Sok.',
        cityId: city.id,
        districtId: district.id,
        taxOffice: 'Test Vergi D.',
        taxId: `1111111111${i}`,
        iban: 'TR123456789012345678901234'
      }
    })
  }

  for (let i = 1; i <= 4; i++) {
    await prisma.merchantApplication.create({
      data: {
        companyType: 'CORP',
        storeName: `Onay Bekleyen Mağaza ${i}`,
        username: `onaybekleyen${i}`,
        passwordHash: pwHash,
        contactFirstName: `Bİsim${i}`,
        contactLastName: `BSoyisim${i}`,
        contactPhone: `555222000${i}`,
        contactEmail: `bekleyen${i}@test.com`,
        emailVerified: null,
        address: 'Test Mah. Test Sok.',
        cityId: city.id,
        districtId: district.id,
        taxOffice: 'Test Vergi D.',
        taxId: `2222222222${i}`,
        iban: 'TR123456789012345678901234'
      }
    })
  }

  console.log("Created 10 merchants successfully!")
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
