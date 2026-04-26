const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const articles = await prisma.article.findMany({
    where: {
      NOT: { images: null }
    },
    take: 5
  });
  articles.forEach(a => {
    if (a.images) console.log(a.images, typeof a.images[0]);
  });
}
main().finally(() => prisma.$disconnect());
