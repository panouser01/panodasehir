const isSet = (val) => val !== null && val !== undefined && val !== '';

const getProp = (obj1, obj2, prop, fallback) => {
    if (obj1 && isSet(obj1[prop])) return obj1[prop];
    if (obj2 && isSet(obj2[prop])) return obj2[prop];
    return fallback;
}

const targetWall = { isWallTransparent: true, backgroundColor: '#ffffff' };
const homeWall = null;
const siteSettings = { isWallTransparent: false, backgroundColor: '#000000' };

console.log("getProp test", getProp(targetWall, homeWall, 'isWallTransparent', siteSettings.isWallTransparent));
console.log("isset targetWall gradient", isSet(targetWall?.gradientFrom) || isSet(targetWall?.backgroundColor));

