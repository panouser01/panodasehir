const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const categories = await prisma.category.findMany();
    const isSet = (val) => val !== null && val !== undefined && val !== '';
    const selectedCategory = categories.find(c => c.name === 'Ana Duvar');
    const homeWall = categories.find(c => c.name === 'Ana Duvar') || null;
    const siteSettings = await prisma.siteSettings.findUnique({ where: { id: 'global' } });
    
    console.log("selectedc", selectedCategory);
    
    const getProp = (prop, fallback) => {
        if (selectedCategory && isSet(selectedCategory[prop])) return selectedCategory[prop]
        if (homeWall && isSet(homeWall[prop])) return homeWall[prop]
        return fallback
    }

    const boardAppearance = {
        isWallTransparent: getProp('isWallTransparent', siteSettings?.isWallTransparent),
        isGradient: getProp('isGradient', siteSettings?.isGradient),
        backgroundColor: getProp('backgroundColor', siteSettings?.backgroundColor),
    }

    console.log('board app', boardAppearance);
}
main().finally(() => prisma.$disconnect());
