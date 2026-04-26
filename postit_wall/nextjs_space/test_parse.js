const doc = {
  isStyleModeActive: true,
  styleModeSettings: '{"cardRatio": "1/1", "showTopMenu": false}',
  ottCardRatio: "9/12",
  ottShowTopMenu: true
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
               return styleSettings[lowerStyleKey];
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
console.log("Show Top Menu:", getOttValue("ottShowTopMenu", "default"));
console.log("Items Per Row:", getOttValue("ottItemsPerRow", "default"));
