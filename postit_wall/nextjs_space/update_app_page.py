with open("app/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# We need to change getOttValue to prefer styleModeSettings if `getOttValue('isStyleModeActive')` is true.
# Instead of modifying `getOttValue`, we can just modify how `ottSettings` is populated.
# Or modify `getOttValue` entirely! Let's see how `getOttValue` is defined.

marker_getott = "const getOttValue = (key: string, defaultVal: any) => {"
insert_getott = """const getOttValue = (key: string, defaultVal: any) => {
    // Determine active mode strictly
    const _isStyleActive = isWallPage 
      ? !!currentCategory?.isStyleModeActive 
      : (activeLocationMode === 'district' ? !!currentDistrictValues?.isStyleModeActive : !!currentCityValues?.isStyleModeActive);

    const isStyleModeProperty = key.startsWith('ott');

    // If style mode is active, check styleModeSettings first for 'ott...' keys
    if (_isStyleActive && isStyleModeProperty && key !== 'isOttActive' && key !== 'isStyleModeActive') {
      const styleKey = key.replace(/^ott/, '');
      const lowerStyleKey = styleKey.charAt(0).toLowerCase() + styleKey.slice(1);
      
      let styleSettings: any = null;
      if (isWallPage && currentCategory?.styleModeSettings) {
        styleSettings = currentCategory.styleModeSettings;
      } else if (!isWallPage) {
        if (activeLocationMode === 'district' && currentDistrictValues?.styleModeSettings) {
          styleSettings = currentDistrictValues.styleModeSettings;
        } else if (activeLocationMode === 'city' && currentCityValues?.styleModeSettings) {
          styleSettings = currentCityValues.styleModeSettings;
        }
      }

      if (typeof styleSettings === 'string') {
        try { styleSettings = JSON.parse(styleSettings); } catch (e) { styleSettings = {}; }
      }

      if (styleSettings && styleSettings[lowerStyleKey] !== undefined && styleSettings[lowerStyleKey] !== null && styleSettings[lowerStyleKey] !== "") {
        return styleSettings[lowerStyleKey];
      }
    }
"""

content = content.replace(marker_getott, insert_getott)

with open("app/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("App page updated!")
