const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const isSet = (val) => val !== null && val !== undefined && val !== '';

    const getProp = (obj1, obj2, prop, fallback) => {
        if (obj1 && isSet(obj1[prop])) return obj1[prop];
        if (obj2 && isSet(obj2[prop])) return obj2[prop];
        return fallback;
    }

    const categories = await prisma.category.findMany();
    const targetWall = categories.find(c => c.name === 'Ana Duvar'); 
    const homeWall = null; // simulate on Ana Duvar
    const siteSettings = await prisma.siteSettings.findUnique({ where: { id: 'global' } });

    console.log("targetWall.isWallTransparent =", targetWall?.isWallTransparent);
    console.log("homeWall.isWallTransparent =", homeWall?.isWallTransparent);
    console.log("siteSettings.isWallTransparent =", siteSettings?.isWallTransparent);

    const boardAppearance = {
        isWallTransparent: getProp(targetWall, homeWall, 'isWallTransparent', siteSettings?.isWallTransparent),
        isGradient: getProp(targetWall, homeWall, 'isGradient', siteSettings?.isGradient),
        backgroundColor: getProp(targetWall, homeWall, 'backgroundColor', siteSettings?.backgroundColor),
        backgroundImage: getProp(targetWall, homeWall, 'backgroundImage', siteSettings?.backgroundImage),
    }

    console.log("boardAppearance:", boardAppearance);
}
main().finally(() => prisma.$disconnect());
