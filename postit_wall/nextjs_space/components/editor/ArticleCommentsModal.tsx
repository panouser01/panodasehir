import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ArticleCommentsSection } from './ArticleCommentsSection'

export default function ArticleCommentsModal({ isOpen, onClose, articleId, articleTitle }: { isOpen: boolean, onClose: () => void, articleId: string, articleTitle: string }) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex flex-col gap-1 mb-2 border-b pb-4">
            <div>Etkileşim Yönetimi</div>
            <div className="text-sm font-normal text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap" title={articleTitle}>📄 {articleTitle}</div>
          </DialogTitle>
        </DialogHeader>

        <ArticleCommentsSection articleId={articleId} />
      </DialogContent>
    </Dialog>
  )
}
