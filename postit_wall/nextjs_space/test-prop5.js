const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const categories = await prisma.category.findMany();
    const isSet = (val) => val !== null && val !== undefined && val !== '';
    const selectedCategory = categories.find(c => c.name === 'Ana Duvar');
    const homeWall = categories.find(c => c.name === 'Ana Duvar') || null;
    const siteSettings = await prisma.siteSettings.findUnique({ where: { id: 'global' } });
    
    console.log("homeWall isset isWallTransparent: " + isSet(homeWall['isWallTransparent']));
    console.log("homeWall isWallTransparent: " + homeWall['isWallTransparent']);

    const getProp = (prop, fallback) => {
        if (selectedCategory && isSet(selectedCategory[prop])) return selectedCategory[prop]
        if (homeWall && isSet(homeWall[prop])) return homeWall[prop]
        console.log("used fallback for prop " + prop);
        return fallback
    }

    const boardAppearance = {
        isWallTransparent: getProp('isWallTransparent', siteSettings?.isWallTransparent),
    }

    console.log('board app', boardAppearance);
}
main().finally(() => prisma.$disconnect());
