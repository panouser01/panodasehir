import re

def main():
    file_path = "/home/izzetyasin/Desktop/Geliştirme/panodasehir/postit_wall/nextjs_space/app/admin/page.tsx"
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Step 1: Add new state selectedCopyParentId
    old_state = "  const [copyWallOptions, setCopyWallOptions] = useState({ copyPostits: false })"
    new_state = "  const [copyWallOptions, setCopyWallOptions] = useState({ copyPostits: false })\n  const [selectedCopyParentId, setSelectedCopyParentId] = useState<string>('root')"
    if "selectedCopyParentId" not in content:
        content = content.replace(old_state, new_state)

    # Step 2: Edit openCopyWallModal
    old_open = """  const openCopyWallModal = (wall: any) => {
    setWallToCopy(wall)
    setCopyWallOptions({ copyPostits: false })
    setShowCopyWallModal(true)
  }"""
    new_open = """  const openCopyWallModal = (wall: any) => {
    setWallToCopy(wall)
    setCopyWallOptions({ copyPostits: false })
    setSelectedCopyParentId(wall.parentId || 'root')
    setShowCopyWallModal(true)
  }"""
    content = content.replace(old_open, new_open)

    # Step 3: Edit handleCopyWallSubmit payload
    old_body = """        body: JSON.stringify({
          categoryId: wallToCopy.id,
          copyPostits: copyWallOptions.copyPostits
        })"""
    new_body = """        body: JSON.stringify({
          categoryId: wallToCopy.id,
          copyPostits: copyWallOptions.copyPostits,
          targetParentId: selectedCopyParentId === 'root' ? null : selectedCopyParentId
        })"""
    content = content.replace(old_body, new_body)

    # Step 4: Add Dropdown select to modal
    old_modal_html = """          <div className="py-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="copyPostits" """

    select_html = """          <div className="py-4 space-y-4">
            <div>
              <Label className="mb-2 block">Hedef Konum (Üst Kategori)</Label>
              <Select 
                value={selectedCopyParentId} 
                onValueChange={setSelectedCopyParentId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Bir üst duvar seçin" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="root">-- Ana Dizin (En Üst Seviye) --</SelectItem>
                  {(() => {
                    const flatten = (cats: any[], depth = 0): any[] => {
                      return cats.reduce((acc, cat) => {
                        acc.push({ ...cat, depth })
                        if (cat.children) acc.push(...flatten(cat.children, depth + 1))
                        return acc
                      }, [])
                    }
                    const buildHierarchy = (items: any[]) => {
                      const rootItems = items.filter(i => !i.parentId).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'tr-TR'))
                      const findChildren = (parent: any) => {
                        const children = items.filter(i => i.parentId === parent.id).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'tr-TR'))
                        if (children.length > 0) {
                          parent.children = children.map(c => findChildren(c))
                        }
                        return parent
                      }
                      return rootItems.map(r => findChildren({ ...r }))
                    }
                    
                    return flatten(buildHierarchy(walls)).map((w: any) => {
                      // Prevent copying into itself or its children
                      let isDescendant = false;
                      let current = w;
                      while (current) {
                        if (current.id === wallToCopy?.id) {
                          isDescendant = true;
                          break;
                        }
                        current = walls.find((p: any) => p.id === current.parentId);
                      }
                      
                      if (w.id === wallToCopy?.id || isDescendant) return null;

                      return (
                        <SelectItem key={w.id} value={w.id}>
                          {'— '.repeat(w.depth)}{w.name}
                        </SelectItem>
                      );
                    })
                  })()}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 pt-2 border-t">
              <Checkbox 
                id="copyPostits" """

    if "selectedCopyParentId" not in content and "Hedef Konum" not in content:
        # Prevent double adding
        content = content.replace(old_modal_html, select_html)

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

if __name__ == "__main__":
    main()
