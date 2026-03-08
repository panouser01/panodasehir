const isSet = (val) => val !== null && val !== undefined && val !== '';

const getProp = (obj1, obj2, prop, fallback) => {
    if (obj1 && isSet(obj1[prop])) return obj1[prop];
    if (obj2 && isSet(obj2[prop])) return obj2[prop];
    return fallback;
}

const targetWall = { isWallTransparent: true };
const homeWall = { isWallTransparent: false };
const siteSettings = { isWallTransparent: false };

console.log("TEST 1", getProp(targetWall, homeWall, 'isWallTransparent', siteSettings.isWallTransparent));
console.log("TEST 2", getProp({ isWallTransparent: false }, null, 'isWallTransparent', true));

