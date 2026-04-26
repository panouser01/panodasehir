const doc = {
  isStyleModeActive: true,
  styleModeSettings: '{"cardRatio": "9/16"}',
  ottCardRatio: "9/12",
  ottShowTopMenu: true,
  ottItemsPerRow: 5
};

const getOttValue = (key, defaultValue) => {
    const isStyleModeActiveProperty = key === 'isStyleModeActive' || key === 'isOttActive';
    
    let current = doc;
    while (current) {
      if (!isStyleModeActiveProperty && current.isStyleModeActive) {
        let styleSettings = current.styleModeSettings;
        if (typeof styleSettings === 'string') {
           try { styleSettings = JSON.parse(styleSettings); } catch(e) { styleSettings = {} }
        }
        if (styleSettings) {
           const styleKey = key.replace(/^ott/, '');
           const lowerStyleKey = styleKey.charAt(0).toLowerCase() + styleKey.slice(1);
           if (styleSettings[lowerStyleKey] !== undefined && styleSettings[lowerStyleKey] !== null && styleSettings[lowerStyleKey] !== '') {
               return styleSettings[lowerStyleKey]; // THIS CAUSES THE FUNCTION TO RETURN EARLY!
           }
        }
      }

      const val = current[key];
      if (val !== undefined && val !== null && val !== '') return val;
      break;
    }
    return defaultValue;
}

console.log("Card Ratio:", getOttValue("ottCardRatio", "default"));
console.log("Items Per:", getOttValue("ottItemsPerRow", "default"));
console.log("Show:", getOttValue("ottShowTopMenu", "default"));

