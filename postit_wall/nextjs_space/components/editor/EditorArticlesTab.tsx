import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Edit, Trash2, Calendar, BookOpen, Loader2 } from 'lucide-react'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { toast } from 'react-hot-toast'
import ArticleEditorModal from './ArticleEditorModal'

export default function EditorArticlesTab() {
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingArticle, setEditingArticle] = useState<any>(null)
  
  const loadArticles = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      const res = await fetch('/api/articles')
      if (res.ok) {
        const data = await res.json()
        setArticles(data)
      }
    } catch (err) {
      console.error(err)
      toast.error('Yayınlar yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadArticles()
  }, [])

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Bu yayını silmek istediğinize emin misiniz?')) return
    try {
      const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Silinemedi')
      toast.success('Yayın başarıyla silindi')
      loadArticles(false)
    } catch (err) {
      toast.error('Silme işlemi başarısız')
    }
  }

  const handleTogglePublish = async (id: string, currentStatus: boolean, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !currentStatus })
      })
      if (!res.ok) throw new Error('Güncellenemedi')
      toast.success(currentStatus ? 'Yayın başarıyla kaldırıldı' : 'Metin yayınlandı')
      loadArticles(false)
    } catch (err) {
      toast.error('İşlem başarısız')
    }
  }

  // Gruplama işlemi (Duvarlara göre)
  const groupedArticles = articles.reduce((acc, article) => {
    const categoryName = article.category?.name || 'Kategorisiz / Silinmiş Duvar'
    if (!acc[categoryName]) {
      acc[categoryName] = []
    }
    acc[categoryName].push(article)
    return acc
  }, {} as Record<string, any[]>)

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-600" /> Editör Mod Yayınları
        </h2>
        <p className="text-gray-500 mt-2">Duvarlara göre oluşturulmuş tüm makale ve yazıları buradan yönetebilirsiniz.</p>
      </div>

      {Object.keys(groupedArticles).length === 0 ? (
        <Card>
          <CardContent className="h-40 flex items-center justify-center text-gray-500">
            Henüz hiç yayın bulunmuyor.
          </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" className="space-y-4">
          {Object.keys(groupedArticles).sort().map(categoryName => (
            <AccordionItem key={categoryName} value={categoryName} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <AccordionTrigger className="bg-gray-50 px-6 py-4 hover:bg-gray-100 hover:no-underline font-semibold text-gray-800 text-lg flex justify-between items-center w-full">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
                  {categoryName}
                  <span className="text-sm font-normal text-gray-500 ml-2 bg-gray-200 px-2 py-0.5 rounded-full">
                    {groupedArticles[categoryName].length} yayın
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="pt-0 pb-0 flex flex-col">
                <div className="divide-y divide-gray-100">
                  {groupedArticles[categoryName].map((article: any) => (
                    <div key={article.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-lg text-gray-900 truncate mb-1">{article.title}</h4>
                        <p className="text-sm text-gray-500 line-clamp-1 mb-2">
                          {article.content ? article.content.replace(/<[^>]*>?/gm, '').substring(0, 120) + '...' : 'İçerik yok.'}
                        </p>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-400 items-center">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(article.createdAt).toLocaleDateString('tr-TR')}</span>
                          <span>•</span>
                          <span className="font-medium">{article.author?.nickname || article.author?.name || 'Bilinmiyor'}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${article.isPublished ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {article.isPublished ? 'YAYINDA' : 'TASLAK'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button variant="outline" size="sm" onClick={(e) => handleTogglePublish(article.id, article.isPublished, e)} className="flex items-center gap-2 bg-white min-w-[140px] justify-start">
                          {article.isPublished ? <EyeOff className="w-4 h-4 text-orange-500" /> : <Eye className="w-4 h-4 text-green-500" />}
                          {article.isPublished ? 'Yayından Kaldır' : 'Yayınla'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setEditingArticle(article)} className="flex items-center gap-2 bg-white">
                          <Edit className="w-4 h-4" /> Düzenle
                        </Button>
                        <Button variant="outline" size="sm" onClick={(e) => handleDelete(article.id, e)} className="text-red-500 hover:text-red-600 hover:bg-red-50 flex items-center gap-2 bg-white" title="Sil">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Editor Modal */}
      {editingArticle && (
        <ArticleEditorModal
          isOpen={true}
          onClose={() => setEditingArticle(null)}
          categoryId={editingArticle.categoryId}
          initialData={editingArticle}
          onTogglePublish={async () => {
             if(editingArticle) {
                 await handleTogglePublish(editingArticle.id, editingArticle.isPublished, { stopPropagation: () => {} } as any)
                 setEditingArticle(null)
             }
          }}
          onSave={async () => {
            setEditingArticle(null)
            loadArticles(false)
          }}
        />
      )}
    </div>
  )
}
