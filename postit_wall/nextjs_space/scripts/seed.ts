import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Hash passwords
  const adminPassword = await bcrypt.hash('Admin123!', 10)
  const testPassword = await bcrypt.hash('johndoe123', 10)

  // Create Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@panodasehir.com' },
    update: {},
    create: {
      email: 'admin@panodasehir.com',
      password: adminPassword,
      name: 'Süper Admin',
      role: 'SUPER_ADMIN',
    },
  })
  console.log('✅ Super Admin created:', superAdmin.email)

  // Create Test User (required for testing)
  const testUser = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      password: testPassword,
      name: 'Test Kullanıcı',
      role: 'SUPER_ADMIN', // Admin privileges for testing
    },
  })
  console.log('✅ Test User created:', testUser.email)

  // Create Wall Managers
  const wallManager1 = await prisma.user.upsert({
    where: { email: 'teknoloji@panodasehir.com' },
    update: {},
    create: {
      email: 'teknoloji@panodasehir.com',
      password: await bcrypt.hash('Manager123!', 10),
      name: 'Teknoloji Yöneticisi',
      role: 'WALL_MANAGER',
    },
  })
  console.log('✅ Wall Manager created:', wallManager1.email)

  const wallManager2 = await prisma.user.upsert({
    where: { email: 'sanat@panodasehir.com' },
    update: {},
    create: {
      email: 'sanat@panodasehir.com',
      password: await bcrypt.hash('Manager123!', 10),
      name: 'Sanat Yöneticisi',
      role: 'WALL_MANAGER',
    },
  })
  console.log('✅ Wall Manager created:', wallManager2.email)

  // Create Regular Users
  const user1 = await prisma.user.upsert({
    where: { email: 'ahmet@example.com' },
    update: {},
    create: {
      email: 'ahmet@example.com',
      password: await bcrypt.hash('User123!', 10),
      name: 'Ahmet Yılmaz',
      role: 'USER',
    },
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'ayse@example.com' },
    update: {},
    create: {
      email: 'ayse@example.com',
      password: await bcrypt.hash('User123!', 10),
      name: 'Ayşe Kaya',
      role: 'USER',
    },
  })
  console.log('✅ Regular Users created')

  // Create Categories
  const categories = [
    { name: 'Genel', description: 'Genel konular ve paylaşımlar', managerId: null },
    { name: 'Teknoloji', description: 'Teknoloji, yazılım ve yenilikler', managerId: wallManager1.id },
    { name: 'Sanat', description: 'Sanat, müzik ve kültür', managerId: wallManager2.id },
    { name: 'Eğitim', description: 'Eğitim ve öğrenme kaynakları', managerId: null },
    { name: 'Sosyal', description: 'Sosyal etkinlikler ve buluşmalar', managerId: null },
    { name: 'Spor', description: 'Spor haberleri ve etkinlikler', managerId: null },
  ]

  const createdCategories = []
  for (const cat of categories) {
    // Check if category exists (root level, parentId is null)
    let category = await prisma.category.findFirst({
      where: { name: cat.name, parentId: null }
    })

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: cat.name,
          description: cat.description,
          wallManagers: cat.managerId ? { connect: { id: cat.managerId } } : undefined,
          parentId: null,
        },
      })
      console.log('✅ Category created:', category.name)
    } else {
      console.log('⏭️ Category exists:', category.name)
    }
    createdCategories.push(category)
  }

  // Create Sample Post-its
  const colors: Array<'YELLOW' | 'PINK' | 'BLUE' | 'GREEN' | 'ORANGE' | 'PURPLE'> = [
    'YELLOW',
    'PINK',
    'BLUE',
    'GREEN',
    'ORANGE',
    'PURPLE',
  ]

  const samplePostits = [
    {
      userId: user1.id,
      categoryId: createdCategories[0].id,
      content: 'Merhaba! Panoda Şehir uygulamasına hoş geldiniz 👋',
      color: 'YELLOW' as const,
      rotation: 3.5,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isApproved: true,
      isModerated: true,
    },
    {
      userId: user2.id,
      categoryId: createdCategories[1].id,
      content: 'Yapay zeka teknolojileri hızla gelişiyor. Sizin favoriniz hangisi? 🤖',
      color: 'BLUE' as const,
      rotation: -4.2,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      isApproved: true,
      isModerated: true,
    },
    {
      userId: user1.id,
      categoryId: createdCategories[2].id,
      content: 'Bu hafta sonu müze gezisi! Katılmak isteyen var mı? 🎨',
      color: 'PINK' as const,
      rotation: 5.8,
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      isApproved: true,
      isModerated: true,
    },
    {
      userId: superAdmin.id,
      categoryId: createdCategories[3].id,
      content: 'Ücretsiz online kurslar için kaynaklar paylaşalım! 📚',
      color: 'GREEN' as const,
      rotation: -2.5,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isApproved: true,
      isModerated: true,
    },
    {
      userId: user2.id,
      categoryId: createdCategories[4].id,
      content: 'Kahve molası! ☕ Herkes davetli, 15:00\'da kafeteryada buluşalım.',
      color: 'ORANGE' as const,
      rotation: 6.5,
      expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
      isApproved: true,
      isModerated: true,
    },
    {
      userId: user1.id,
      categoryId: createdCategories[5].id,
      content: 'Basketbol maçı sonuçları: Fenerbahçe 85 - Galatasaray 78 🏀',
      color: 'PURPLE' as const,
      rotation: -7.2,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      isApproved: true,
      isModerated: true,
    },
    {
      userId: user2.id,
      categoryId: createdCategories[0].id,
      content: 'Yeni başlayanlar için harika bir platform! Teşekkürler 🙏',
      color: 'YELLOW' as const,
      rotation: 4.8,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isApproved: true,
      isModerated: true,
    },
    {
      userId: user1.id,
      categoryId: createdCategories[1].id,
      content: 'NextJS 14 ile harika bir uygulama yaptım. Paylaşmak ister misiniz? 💻',
      color: 'BLUE' as const,
      rotation: -5.5,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      isApproved: true,
      isModerated: true,
    },
  ]

  for (const postit of samplePostits) {
    await prisma.postIt.create({
      data: postit,
    })
  }
  console.log('✅ Sample Post-its created')

  console.log('🎉 Seed completed successfully!')
  console.log('\n📧 Login credentials:')
  console.log('Super Admin: admin@panodasehir.com / Admin123!')
  console.log('Test User: john@doe.com / johndoe123')
  console.log('Wall Manager (Teknoloji): teknoloji@panodasehir.com / Manager123!')
  console.log('Wall Manager (Sanat): sanat@panodasehir.com / Manager123!')
  console.log('Regular User 1: ahmet@example.com / User123!')
  console.log('Regular User 2: ayse@example.com / User123!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
