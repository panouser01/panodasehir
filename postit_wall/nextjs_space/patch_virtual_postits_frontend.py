import re

def main():
    admin_file = "/home/izzetyasin/Desktop/Geliştirme/panodasehir/postit_wall/nextjs_space/app/admin/page.tsx"
    with open(admin_file, "r", encoding="utf-8") as f:
        content = f.read()

    # Add to state type & initializations
    content = content.replace(
        "isOttActive: false, ottItemsPerRow: 4, ottCardRatio: '9/13', ottAutoScrollSpeed: 0,",
        "isOttActive: false, ottItemsPerRow: 4, ottCardRatio: '9/13', ottAutoScrollSpeed: 0, showVirtualPostitsIfEmpty: true,"
    )
    content = content.replace(
        "isOttActive: wallForm.isOttActive,",
        "isOttActive: wallForm.isOttActive,\n        showVirtualPostitsIfEmpty: wallForm.showVirtualPostitsIfEmpty,"
    )
    content = content.replace(
        "isOttActive: getB('isOttActive', false),",
        "isOttActive: getB('isOttActive', false),\n      showVirtualPostitsIfEmpty: getB('showVirtualPostitsIfEmpty', true),"
    )
    content = content.replace(
        "isOttActive: false,",
        "isOttActive: false,\n      showVirtualPostitsIfEmpty: true,"
    )

    checkbox_html = """                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="showVirtualPostitsIfEmpty" 
                        checked={wallForm.showVirtualPostitsIfEmpty} 
                        onCheckedChange={(checked) => setWallForm({ ...wallForm, showVirtualPostitsIfEmpty: !!checked })}
                      />
                      <Label htmlFor="showVirtualPostitsIfEmpty" className="cursor-pointer">
                        Duvar Boşsa Sanal Postit Ekle
                      </Label>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">
                      Seçili ise duvarın içinde postit yokken alt duvarlar kart halinde gösterilir.
                    </p>
                  </div>"""

    # We will inject the Checkbox right before OTT Ayarları or somewhere in "Görünüm Ayarları" tab.
    # We can inject it before the `<div className="space-y-4 pt-4 border-t">` where `isOttActive` check is, or near `hideWallTitle`.
    # Let's target the exact string containing `isOttActive` to put it right before OTT configs or after `hideGlobalElements`.
    
    # Or just replace the `isOttActive` block start wrapper to include it before.
    old_ott_header = """                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                        id="isOttActive" """
                        
    new_ott_header = """                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <div className="flex flex-col space-y-2 mb-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="showVirtualPostitsIfEmpty" 
                          checked={wallForm.showVirtualPostitsIfEmpty !== false} 
                          onCheckedChange={(checked) => setWallForm({ ...wallForm, showVirtualPostitsIfEmpty: !!checked })}
                        />
                        <Label htmlFor="showVirtualPostitsIfEmpty" className="cursor-pointer font-medium">
                          Duvar Boşsa Sanal Postit Ekle
                        </Label>
                      </div>
                      <p className="text-xs text-gray-500 ml-6">
                        Eğer duvarda hiç postit yoksa alt duvarları sanal birer postitmiş gibi gösterir. Kapatılırsa duvar tamamen boş görünür.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                        id="isOttActive" """

    if "showVirtualPostitsIfEmpty" not in content and "isOttActive" in content:
        # Just in case we didn't match the state in the big block above
        pass
    
    content = content.replace(old_ott_header, new_ott_header)

    with open(admin_file, "w", encoding="utf-8") as f:
        f.write(content)

    # Next, update app/page.tsx
    page_file = "/home/izzetyasin/Desktop/Geliştirme/panodasehir/postit_wall/nextjs_space/app/page.tsx"
    with open(page_file, "r", encoding="utf-8") as f:
        p_content = f.read()
    
    old_cond = "if (limitedDirectPostits.length === 0 && virtualGenCat && virtualGenCat.children && virtualGenCat.children.length > 0) {"
    new_cond = "if (limitedDirectPostits.length === 0 && virtualGenCat && virtualGenCat.children && virtualGenCat.children.length > 0 && virtualGenCat.showVirtualPostitsIfEmpty !== false) {"
    
    p_content = p_content.replace(old_cond, new_cond)

    with open(page_file, "w", encoding="utf-8") as f:
        f.write(p_content)

if __name__ == "__main__":
    main()
