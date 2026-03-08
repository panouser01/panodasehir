const isSet = (val) => val !== null && val !== undefined && val !== '';

const targetWall = null;
const homeWall = { isWallTransparent: true, backgroundColor: '#ffffff' };
const siteSettings = { isWallTransparent: false, backgroundColor: '#000000' };

const getProp = (prop, fallback) => {
    if (targetWall && isSet(targetWall[prop])) return targetWall[prop]
    if (homeWall && isSet(homeWall[prop])) return homeWall[prop]
    return fallback
}

const boardAppearance = {
    isWallTransparent: getProp('isWallTransparent', siteSettings?.isWallTransparent),
    isGradient: getProp('isGradient', siteSettings?.isGradient),
    backgroundColor: getProp('backgroundColor', siteSettings?.backgroundColor),
}

console.log(boardAppearance);

