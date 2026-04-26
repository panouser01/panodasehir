import re

def main():
    file_path = "/home/izzetyasin/Desktop/Geliştirme/panodasehir/postit_wall/nextjs_space/app/admin/page.tsx"
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Add state variables
    state_vars = """  const [showMovePostitModal, setShowMovePostitModal] = useState(false)
  const [showCopyWallModal, setShowCopyWallModal] = useState(false)
  const [wallToCopy, setWallToCopy] = useState<any>(null)
  const [copyWallOptions, setCopyWallOptions] = useState({ copyPostits: false })
  const [isCopyingWall, setIsCopyingWall] = useState(false)"""
    content = content.replace("  const [showMovePostitModal, setShowMovePostitModal] = useState(false)", state_vars)

    # Add openCopyWallModal and handleCopyWallSubmit
    logic = """  const openMovePostitModal = (postit: any) => {
    setPostitToMove(postit)
    setSelectedPostitNewCategoryId(postit.categoryId) // default to current wall
    setShowMovePostitModal(true)
  }

  const openCopyWallModal = (wall: any) => {
    setWallToCopy(wall)
    setCopyWallOptions({ copyPostits: false })
    setShowCopyWallModal(true)
  }

  const handleCopyWallSubmit = async () => {
    if (!wallToCopy) return;
    setIsCopyingWall(true);
    try {
      const response = await fetch(`/api/categories/copy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryId: wallToCopy.id,
          copyPostits: copyWallOptions.copyPostits
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Duvar kopyalanırken hata oluştu');
      }

      toast.success('Duvar başarıyla kopyalandı');
      setShowCopyWallModal(false);
      setWallToCopy(null);
      loadData(); // reload walls
    } catch (e: any) {
      toast.error(e?.message || 'Bir hata oluştu');
    } finally {
      setIsCopyingWall(false);
    }
  }"""
    # Just to locate openMovePostitModal correctly:
    old_logic = """  const openMovePostitModal = (postit: any) => {
    setPostitToMove(postit)
    setSelectedPostitNewCategoryId(postit.categoryId) // default to current wall
    setShowMovePostitModal(true)
  }"""
    content = content.replace(old_logic, logic)

    # Add Copy Button (with <Copy /> icon from lucide-react, I assume it's imported, but let's check)
    button_html = """                              {wall.name !== 'Ana Duvar' && (
                                <Button variant="ghost" size="sm" onClick={() => openMoveWallModal(wall)} title="Başka Duvara Taşı" className="h-7 w-7 p-0">
                                  <MoveRight className="w-3.5 h-3.5 text-blue-600" />
                                </Button>
                              )}
                              {wall.name !== 'Ana Duvar' && (
                                <Button variant="ghost" size="sm" onClick={() => openCopyWallModal(wall)} title="Duvarı Kopyala" className="h-7 w-7 p-0">
                                  <Copy className="w-3.5 h-3.5 text-green-600" />
                                </Button>
                              )}"""
    old_button_html = """                              {wall.name !== 'Ana Duvar' && (
                                <Button variant="ghost" size="sm" onClick={() => openMoveWallModal(wall)} title="Başka Duvara Taşı" className="h-7 w-7 p-0">
                                  <MoveRight className="w-3.5 h-3.5 text-blue-600" />
                                </Button>
                              )}"""
    content = content.replace(old_button_html, button_html)

    # Add Modal HTML
    modal_html = """      <Dialog open={showMovePostitModal} onOpenChange={setShowMovePostitModal}>"""
    new_modal_html = """      <Dialog open={showCopyWallModal} onOpenChange={setShowCopyWallModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Duvarı Kopyala</DialogTitle>
            <DialogDescription>
              <strong>{wallToCopy?.name}</strong> isimli duvarı alt duvarlarıyla birlikte kopyalamak üzeresiniz.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="copyPostits" 
                checked={copyWallOptions.copyPostits} 
                onCheckedChange={(checked) => setCopyWallOptions(prev => ({ ...prev, copyPostits: !!checked }))}
              />
              <Label htmlFor="copyPostits" className="cursor-pointer">
                Duvar içindeki tüm notları (Post-it'leri) da kopyala
              </Label>
            </div>
            <p className="text-xs text-gray-500 mt-2 ml-6">
              Not: Alt duvarlar otomatik olarak kopyalanacaktır. Yetkilendirmeler yeni kopyaya aktarılmaz.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCopyWallModal(false)} disabled={isCopyingWall}>İptal</Button>
            <Button onClick={handleCopyWallSubmit} disabled={isCopyingWall} className="bg-green-600 hover:bg-green-700 text-white">
              {isCopyingWall ? 'Kopyalanıyor...' : 'Kopyala'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showMovePostitModal} onOpenChange={setShowMovePostitModal}>"""
    content = content.replace(modal_html, new_modal_html)

    # Add Checkbox, Copy import if needed
    if "import { Checkbox }" not in content and "Check" not in content[:2000]:
       # They probably have Checkbox somewhere, or it's from @/components/ui/checkbox. It should be imported. Let's check imports.
       pass # In Nextjs typical shadcn they usually export Checkbox in ui/checkbox. It is used already for category forms. "import { Checkbox } from '@/components/ui/checkbox'"
    
    if " Copy," not in content and "{ Copy" not in content and " Copy " not in content:
        content = content.replace("MoveRight,", "MoveRight, Copy,")

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

if __name__ == "__main__":
    main()
