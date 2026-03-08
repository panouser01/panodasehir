import { PrismaClient, PostItColor, PostItFont, PushpinStyle } from '@prisma/client'

const prisma = new PrismaClient()

const colors = Object.values(PostItColor)
const fonts = Object.values(PostItFont)
const pushpins = Object.values(PushpinStyle)

function randomChoice<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}

const sampleContents = [
    "Güzel bir gün umuduyla, herkese iyi çalışmalar dilerim.",
    "Projelerimiz hızla ilerliyor, emeklerinize sağlık.",
    "Bu hafta vizyona girecek filmler harika görünüyor.",
    "Şehrimizin tarihi mekanlarını keşfetmek için harika bir hafta sonu.",
    "Yeni açılan kütüphaneyi gören oldu mu?",
    "Tebrikler takım! Çok iyi bir iş çıkardık, hedeflere ulaştık.",
    "Yarınki konser etkinliğine gelecek arkadaşlarla buluşalım.",
    "Lütfen sokak hayvanlarına bir kap su bırakmayı unutmayalım.",
    "Fikirlerinizi benimle paylaşmaktan çekinmeyin, beraber gelişelim.",
    "Bugün hava çok güzel, sahilde yürüyüş yapmayı planlıyorum.",
    "Yaklaşan etkinlikler için gönüllüler aranıyor.",
    "Gençlik merkezinde bu akşam tiyatro gösterisi var.",
    "Çevre temizliği kampanyasına hep birlikte destek olalım.",
    "Yerel üreticilerden alışveriş yaparak ekonomimize katkı sağlayalım.",
    "Okuduğum bu harika kitabı mutlaka tavsiye ederim."
]

async function main() {
    const users = await prisma.user.findMany()
    const categories = await prisma.category.findMany()

    if (categories.length === 0) {
        console.log("No categories found. Creating a default category...")
        const defaultCat = await prisma.category.create({
            data: { name: "Genel Duvar" }
        })
        categories.push(defaultCat)
    }

    if (users.length === 0) {
        console.log("No users found to create post-its for.")
        return
    }

    let totalCreated = 0

    for (const user of users) {
        console.log(`Creating post-its for user: ${user.email || user.id}`)
        const postitsToCreate = []

        for (let i = 0; i < 10; i++) {
            const expiresInDays = Math.floor(Math.random() * 30) + 1
            const expiresAt = new Date()
            expiresAt.setDate(expiresAt.getDate() + expiresInDays)

            postitsToCreate.push({
                userId: user.id,
                categoryId: randomChoice(categories).id,
                content: randomChoice(sampleContents),
                color: randomChoice(colors),
                font: randomChoice(fonts),
                pushpin: randomChoice(pushpins),
                rotation: (Math.random() * 10) - 5, // -5 to +5 degrees
                expiresAt: expiresAt,
                isApproved: true,
                isPublished: true,
                isModerated: true
            })
        }

        await prisma.postIt.createMany({
            data: postitsToCreate
        })

        totalCreated += 10
    }

    console.log(`\nSuccessfully created ${totalCreated} random post-its across ${users.length} users.`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
