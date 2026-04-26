'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Star, Wand2, Edit, Plus, FileText, ChevronRight, Eye, Heart, MessageSquare, Share2, Paperclip, Link as LinkIcon, Image as ImageIcon, ExternalLink, X } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
// @ts-ignore
import Microlink from '@microlink/react'
import ArticleEditorModal from './ArticleEditorModal'
import ArticleCommentsModal from './ArticleCommentsModal'
import { ArticleCommentsSection } from './ArticleCommentsSection'
import { ArticleRatingSection } from './ArticleRatingSection'
import { ArticleShareButton } from './ArticleShareButton'

interface ArticleGridProps {
  categoryId: string
  categoryName?: string
  postitAppearance?: any
  userRole?: string
  userId?: string
  canEdit?: boolean
}

export default function ArticleGrid({ categoryId, categoryName, postitAppearance, userRole, userId, canEdit: serverCanEdit = false }: ArticleGridProps) {
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingArticle, setEditingArticle] = useState<any>(null)
  
  // Read mode (guest/viewer)
  const [isReadModalOpen, setIsReadModalOpen] = useState(false)
  const [readingArticle, setReadingArticle] = useState<any>(null)
  
  // Comments mode
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false)
  const [commentingArticle, setCommentingArticle] = useState<any>(null)

  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [previewDoc, setPreviewDoc] = useState<{name: string, url: string} | null>(null)

  // Handle mobile back button for Read Modal
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.hash !== '#article-view' && isReadModalOpen) {
        setIsReadModalOpen(false)
      }
    }

    if (isReadModalOpen) {
      document.body.style.overflow = 'hidden' // Lock scroll
      if (window.location.hash !== '#article-view') {
        window.history.pushState(null, '', window.location.pathname + window.location.search + '#article-view')
      }
      window.addEventListener('popstate', handlePopState)
    } else {
      document.body.style.overflow = '' // Unlock scroll
      if (window.location.hash === '#article-view') {
        window.history.back()
      }
    }

    return () => {
      document.body.style.overflow = '' // Cleanup
      window.removeEventListener('popstate', handlePopState)
    }
  }, [isReadModalOpen])

  const handleInteract = async (e: React.MouseEvent, article: any, type: string) => {
    e.stopPropagation()
    
    // Optimizasyon: state'in her zaman en güncel halini almak için fonksiyonel update yapıyoruz
    setArticles(prev => prev.map(a => {
      if (a.id === article.id) {
        return {
          ...a,
          views: type === 'view' ? (a.views || 0) + 1 : a.views,
          likesCount: type === 'like' ? (a.likesCount || 0) + 1 : a.likesCount,
          commentsCount: type === 'comment' ? (a.commentsCount || 0) + 1 : a.commentsCount,
          sharesCount: type === 'share' ? (a.sharesCount || 0) + 1 : a.sharesCount,
        }
      }
      return a
    }))

    try {
      const res = await fetch(`/api/articles/${article.id}/interact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      })
      
      if (!res.ok) {
        const errData = await res.json()
        import('react-hot-toast').then(m => m.toast.error(errData.error || 'Bu işlemi yapmak için yetkiniz yok veya giriş yapmadınız.'))
        
        // Hata durumunda eklediğimiz sayıyı geri alıyoruz
        setArticles(prev => prev.map(a => {
          if (a.id === article.id) {
            return {
              ...a,
              views: type === 'view' ? Math.max(0, (a.views || 0) - 1) : a.views,
              likesCount: type === 'like' ? Math.max(0, (a.likesCount || 0) - 1) : a.likesCount,
              commentsCount: type === 'comment' ? Math.max(0, (a.commentsCount || 0) - 1) : a.commentsCount,
              sharesCount: type === 'share' ? Math.max(0, (a.sharesCount || 0) - 1) : a.sharesCount,
            }
          }
          return a
        }))
        return
      }

      if (type === 'share') {
        const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/?category=${categoryId}&article=${article.id}`
        navigator.clipboard.writeText(url)
        import('react-hot-toast').then(m => m.toast.success('Makale linki kopyalandı!'))
      } else if (type === 'like') {
        import('react-hot-toast').then(m => m.toast.success('Beğenildi!'))
      }
    } catch (err) {
      console.error(err)
      // Ağ hatasında da geri alıyoruz
      setArticles(prev => prev.map(a => {
        if (a.id === article.id) {
          return {
            ...a,
            views: type === 'view' ? Math.max(0, (a.views || 0) - 1) : a.views,
            likesCount: type === 'like' ? Math.max(0, (a.likesCount || 0) - 1) : a.likesCount,
            commentsCount: type === 'comment' ? Math.max(0, (a.commentsCount || 0) - 1) : a.commentsCount,
            sharesCount: type === 'share' ? Math.max(0, (a.sharesCount || 0) - 1) : a.sharesCount,
          }
        }
        return a
      }))
    }
  }

  const canEdit = serverCanEdit || userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'EDITOR' || userRole === 'AUTHOR'

  const itemsPerRow = postitAppearance?.editorItemsPerRow || 3
  const imageRatio = postitAppearance?.editorImageRatio || '16/9'
  const cardBgColor = postitAppearance?.editorCardBgColor || '#ffffff'
  const titleColor = postitAppearance?.editorTitleColor || '#111827'
  const titleFont = postitAppearance?.editorTitleFont || 'sans-serif'
  const titleSize = postitAppearance?.editorTitleSize || 'xl'
  const starColor = postitAppearance?.editorStarColor || '#facc15'
  const cardStyle = postitAppearance?.editorCardStyle || 'modern' // modern, flat, bordered, glass

  const fetchArticles = async () => {
    try {
      const res = await fetch(`/api/articles?categoryId=${categoryId}&isPublished=true&t=${Date.now()}`)
      if (res.ok) {
        const data = await res.json()
        setArticles(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (categoryId) {
      fetchArticles()
    }
  }, [categoryId])

  const handleSaveArticle = async (articleData: any) => {
    try {
      const isUpdate = !!articleData.id
      const url = isUpdate ? `/api/articles/${articleData.id}` : '/api/articles'
      const method = isUpdate ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(articleData)
      })

      if (res.ok) {
        fetchArticles()
      } else {
        throw new Error('Kaydedilemedi')
      }
    } catch (err) {
      throw err
    }
  }

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !currentStatus })
      })
      if (!res.ok) throw new Error('Güncellenemedi')
      import('react-hot-toast').then(m => m.toast.success(currentStatus ? 'Yayın başarıyla kaldırıldı' : 'Metin yayınlandı'))
      fetchArticles()
    } catch (err) {
      import('react-hot-toast').then(m => m.toast.error('İşlem başarısız'))
    }
  }

  const handleArticleClick = (article: any) => {
    // Sadece görüntülendiğinde views sayısını artır, ama prevent default/stopPropagation ile çakışmayacak sahte event yollayalım
    if (!readingArticle || readingArticle.id !== article.id) {
      handleInteract({ stopPropagation: () => {} } as any, article, 'view')
    }

    if (canEdit) {
      setEditingArticle(article)
      setIsEditorOpen(true)
    } else {
      setReadingArticle(article)
      setIsReadModalOpen(true)
    }
  }

  const getGridCols = () => {
    switch(itemsPerRow) {
      case 1: return 'grid-cols-1'
      case 2: return 'grid-cols-1 md:grid-cols-2'
      case 4: return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4'
      case 5: return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
      case 3:
      default: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
    }
  }

  const getRatioClass = () => {
    switch(imageRatio) {
      case '1/1': return 'aspect-square'
      case '4/3': return 'aspect-[4/3]'
      case '3/4': return 'aspect-[3/4]'
      case 'auto': return ''
      case '16/9':
      default: return 'aspect-video'
    }
  }

  const getFontFamily = () => {
    switch (titleFont) {
      case 'serif': return '"Playfair Display", ui-serif, Georgia, serif'
      case 'handwriting': return '"Caveat", cursive'
      case 'london': return '"London Presley", sans-serif'
      case 'puerto': return '"Puerto", sans-serif'
      case 'retosta': return '"Retosta", sans-serif'
      case 'sans-serif':
      default: return 'inherit'
    }
  }
  
  const getCardStyleClass = () => {
    switch (cardStyle) {
      case 'flat': return 'border-none shadow-none rounded-none'
      case 'bordered': return 'border-2 border-slate-900 shadow-[4px_4px_0_0_rgba(0,0,0,1)] rounded-xl'
      case 'glass': return 'bg-white/40 backdrop-blur-md border border-white/40 shadow-xl rounded-2xl'
      case 'modern':
      default: return 'border-gray-100 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1'
    }
  }

  return (
    <div className="w-full flex-col flex items-center mb-8 px-4 sm:px-0">
      
      {/* Create Button Header for Admins */}
      {canEdit && (
        <div className="w-full flex justify-start mb-6 max-w-7xl">
          <button
            onClick={() => {
              setEditingArticle(null)
              setIsEditorOpen(true)
            }}
            className="group flex flex-col sm:flex-row items-center gap-3 bg-white hover:bg-slate-50 border border-slate-200 px-6 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <div className="bg-pink-100 p-2 rounded-xl group-hover:bg-pink-200 transition-colors">
              <Plus className="w-5 h-5 text-pink-700" strokeWidth={2.5} />
            </div>
            <div className="text-left">
              <span className="block font-black text-slate-800 uppercase tracking-wider text-sm">Yeni Metin Yaz</span>
              <span className="hidden sm:block text-xs font-semibold text-slate-400">Okunabilir editör modunda yayınla</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 ml-2 group-hover:text-pink-500 transition-colors" />
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="w-full flex justify-center py-20 text-slate-400">
          <div className="flex flex-col items-center gap-2">
            <svg className="animate-spin h-8 w-8 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span className="text-sm font-semibold uppercase tracking-widest mt-2">Makaleler Yükleniyor...</span>
          </div>
        </div>
      ) : articles.length === 0 ? (
        <div className="w-full text-center py-20 bg-white/50 backdrop-blur border border-dashed border-slate-300 rounded-3xl max-w-4xl opacity-80 mt-4">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-slate-600">Henüz Yayımlanmış Metin Yok</h3>
          <p className="text-slate-500 mt-1">Bu kategori (duvar) için henüz bir okuma metni girilmemiş.</p>
        </div>
      ) : (
        <div className={`grid ${getGridCols()} gap-6 lg:gap-8 w-full max-w-[1400px]`}>
          {articles.map((article) => (
            <div 
              key={article.id}
              onClick={() => handleArticleClick(article)}
              className={`flex flex-col cursor-pointer transition-all duration-300 ${getCardStyleClass()}`}
              style={{ backgroundColor: cardStyle !== 'glass' ? cardBgColor : undefined }}
            >
              <div className={`w-full overflow-hidden relative bg-slate-100 ${getRatioClass()}`}>
                {article.thumbnailUrl ? (
                  <img src={article.thumbnailUrl} alt={article.title} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-pink-100 flex items-center justify-center">
                    <FileText className="w-12 h-12 text-indigo-300 opacity-50" />
                  </div>
                )}
                {/* Author Badge */}
                {article.author?.name && (
                  <div className="absolute bottom-3 left-3 bg-white/10 backdrop-blur-md text-xs font-bold text-slate-800 px-3 py-1.5 rounded-full shadow-sm truncate max-w-[80%] flex items-center gap-2">
                    {article.author?.image && (
                      <img src={article.author.image} alt={article.author.name} className="w-5 h-5 rounded-full border border-slate-200" />
                    )}
                    <span className="truncate">{article.author.name}</span>
                  </div>
                )}
              </div>
              <div className="p-6 flex flex-col flex-1 justify-between">
                <div>
                  {/* Category Name Tag removed from here and moved to bottom */}

                  <h3 
                    className={`font-bold leading-snug mb-3 line-clamp-3`}
                    style={{ 
                      color: titleColor,
                      fontFamily: getFontFamily(),
                      fontSize: `var(--text-${titleSize}, 1.5rem)`, // approx
                    }}
                  >
                    {article.title}
                  </h3>
                  
                  {/* Intro/Summary Text if exists */}
                  <div 
                    className="text-slate-500 text-sm line-clamp-3 mb-4 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: article.seoSummary || article.content.substring(0, 150) + '...' }}
                  />
                </div>

                <div className="flex flex-col gap-3 pt-4 border-t border-slate-100 mt-auto">
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">
                    <div className="truncate pr-2">#{categoryName || 'Kategori'}</div>
                    <div className="shrink-0">{new Date(article.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                  </div>
                  {/* Stats */}
                  <div className="flex items-center justify-between text-slate-600 px-1">
                    <button onClick={(e) => { e.stopPropagation(); handleArticleClick(article); }} className="flex items-center gap-1.5 hover:text-blue-500 transition-colors cursor-pointer" title="Görüntüleme (Tıklayarak okuyun)">
                      <Eye className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="font-bold text-sm">{article.views || 0}</span>
                    </button>
                    <button onClick={(e) => handleInteract(e, article, 'like')} className="flex items-center gap-1.5 hover:text-pink-500 transition-colors" title="Beğen">
                      <Heart className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="font-bold text-sm">{article.likesCount || 0}</span>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setCommentingArticle(article); setIsCommentsModalOpen(true); }} className="flex items-center gap-1.5 hover:text-green-500 transition-colors cursor-pointer" title="Yorumlar ve Sorular">
                      <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="font-bold text-sm">{article.commentsCount || 0}</span>
                    </button>
                    <ArticleShareButton 
                      articleId={article.id} 
                      categoryId={categoryId} 
                      initialShareCount={article.sharesCount || 0} 
                      onShare={() => handleInteract({ preventDefault: () => {}, stopPropagation: () => {} } as any, article, 'share')}
                    />
                  </div>

                  {/* Rating / Stars and Date */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5" style={{ color: starColor }}>
                      <Star className="w-5 h-5 fill-current" />
                      <span className="font-extrabold text-slate-700 text-lg">{article.averageRating > 0 ? article.averageRating.toFixed(1) : 'Yeni'}</span>
                    </div>

                    <div className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full shrink-0">
                      {new Date(article.createdAt).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {isEditorOpen && (
        <ArticleEditorModal
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false)
            setEditingArticle(null)
          }}
          onSave={handleSaveArticle}
          initialData={editingArticle}
          categoryId={categoryId}
          onTogglePublish={async () => {
            if (editingArticle) {
              await handleTogglePublish(editingArticle.id, editingArticle.isPublished)
              setIsEditorOpen(false)
              setEditingArticle(null)
            }
          }}
        />
      )}

      {/* ReadOnly Modal */}
      {isReadModalOpen && readingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm shadow-2xl">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-full relative shrink-0 bg-white border-b border-slate-100 p-6 sm:px-10 sm:pt-10 sm:pb-6">
              <button 
                onClick={() => setIsReadModalOpen(false)}
                className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-full p-2 transition-colors"
                title="Kapat"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>

              <div className="w-full">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 leading-tight pr-12" style={{ fontFamily: getFontFamily() }}>
                  {readingArticle.title}
                </h2>
                
                <div className="flex flex-wrap items-center gap-4 mt-6 text-slate-500 text-sm font-medium">
                  {readingArticle.author?.name && (
                    <div className="flex items-center gap-2">
                      {readingArticle.author.image ? (
                        <img src={readingArticle.author.image} alt={readingArticle.author.name} className="w-8 h-8 rounded-full shadow-sm" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-bold">
                          {readingArticle.author.name.charAt(0)}
                        </div>
                      )}
                      <span className="text-slate-700 font-semibold">{readingArticle.author.name}</span>
                    </div>
                  )}
                  
                  {readingArticle.author?.name && <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>}
                  
                  <span className="text-slate-500">{new Date(readingArticle.createdAt).toLocaleDateString('tr-TR')}</span>
                  
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                  
                  <span className="flex items-center gap-1.5 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-yellow-200/50">
                    <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                    {readingArticle.averageRating > 0 ? readingArticle.averageRating.toFixed(1) : 'Yeni'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-white">
              <div 
                className="prose prose-lg prose-slate max-w-none text-slate-800 leading-loose"
                dangerouslySetInnerHTML={{ __html: readingArticle.content }}
              />

              {/* Attachments Section */}
              {(readingArticle.images?.length > 0 || readingArticle.documents?.length > 0 || readingArticle.link) && (
                <div className="mt-12 border-t border-slate-100 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Paperclip className="w-5 h-5 text-indigo-500" />
                    Ekler
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Images */}
                    {readingArticle.images?.length > 0 && (
                      <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <Label className="text-sm font-semibold flex items-center gap-2 text-slate-700"><ImageIcon className="w-4 h-4 text-slate-500"/> Görseller</Label>
                        <div className="flex flex-wrap gap-2">
                          {readingArticle.images.map((img: string, i: number) => (
                            <div key={i} className="group relative w-20 h-20 border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm flex-shrink-0 cursor-pointer hover:ring-2 ring-indigo-500/50 transition-all" onClick={() => setPreviewImage(img)}>
                              <img src={img} alt={`Görsel ${i+1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Documents */}
                    {readingArticle.documents?.length > 0 && (
                      <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <Label className="text-sm font-semibold flex items-center gap-2 text-slate-700"><FileText className="w-4 h-4 text-slate-500"/> Belgeler</Label>
                        <div className="flex flex-col gap-2">
                          {readingArticle.documents.map((doc: {name: string, url: string}, i: number) => (
                            <div key={i} className="flex items-center justify-between bg-white px-3 py-2.5 border border-slate-200 rounded-lg shadow-sm text-sm group cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all" onClick={() => setPreviewDoc(doc)}>
                              <div className="flex items-center gap-3 overflow-hidden">
                                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md shrink-0">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <span className="truncate font-medium text-slate-700 group-hover:text-indigo-600 transition-colors" title={doc.name}>{doc.name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Link */}
                    {readingArticle.link && (
                      <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 lg:col-span-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-semibold flex items-center gap-2 text-slate-700"><LinkIcon className="w-4 h-4 text-slate-500"/> İlgili Bağlantı</Label>
                          {readingArticle.link.startsWith('http') && (
                            <a href={readingArticle.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 font-semibold hover:bg-blue-100 flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200 transition-colors">
                              Bağlantıya Git <ExternalLink className="w-3.5 h-3.5"/>
                            </a>
                          )}
                        </div>
                        {readingArticle.link.startsWith('http') ? (
                           <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                             <Microlink url={readingArticle.link} size="large" style={{ width: '100%', border: 'none', borderRadius: '0' }} lazy />
                           </div>
                        ) : (
                          <div className="text-sm text-slate-600 bg-white p-3 rounded-lg border border-slate-200 break-all">
                            {readingArticle.link}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Interaction Sections: Rating and Comments/Questions */}
              <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <ArticleRatingSection 
                  articleId={readingArticle.id} 
                  initialAverage={readingArticle.averageRating}
                  onRated={(newAvg) => {
                    setReadingArticle({...readingArticle, averageRating: newAvg})
                    setArticles(prev => prev.map(a => a.id === readingArticle.id ? {...a, averageRating: newAvg} : a))
                  }}
                />
                
                <div className="border border-slate-200 rounded-3xl p-6 sm:p-8 bg-white shadow-sm">
                  <ArticleCommentsSection articleId={readingArticle.id} />
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-5xl p-0 bg-transparent border-none shadow-none flex justify-center items-center [&>button]:hidden [&>div]:border-none z-[99999]">
          {previewImage && (
            <div className="relative w-full h-full flex justify-center items-center" onClick={() => setPreviewImage(null)}>
              <button 
                onClick={() => setPreviewImage(null)}
                className="absolute top-2 right-2 md:-right-12 md:-top-12 p-2 bg-black/60 hover:bg-black/90 text-white rounded-full transition-colors z-50"
                title="Kapat"
              >
                <X className="w-6 h-6" />
              </button>
              <img 
                src={previewImage} 
                alt="Büyük Görüntü" 
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl cursor-default"
                onClick={(e) => e.stopPropagation()} 
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Document Preview Modal */}
      <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-5xl h-[90vh] bg-white flex flex-col p-4 z-[99999] gap-2 [&>button]:hidden">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-semibold text-lg truncate pr-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              {previewDoc?.name}
            </h3>
            <button 
              onClick={() => setPreviewDoc(null)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900 shrink-0"
              title="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {previewDoc && (
            <div className="flex-1 w-full bg-slate-50 py-4 px-2 sm:px-4 rounded-b-lg overflow-hidden flex flex-col justify-center items-center">
              {previewDoc.url.toLowerCase().endsWith('.doc') || previewDoc.url.toLowerCase().endsWith('.docx') ? (
                <div className="text-center">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4 font-medium">Tarayıcı Word belgelerini önizleyemez.</p>
                  <a href={previewDoc.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
                    Belgeyi İndir / Aç
                  </a>
                </div>
              ) : (
                <iframe src={previewDoc.url} className="w-full h-full rounded shadow-sm border border-slate-200" title={previewDoc.name} />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Comments Modal */}
      {isCommentsModalOpen && commentingArticle && (
        <ArticleCommentsModal
          isOpen={isCommentsModalOpen}
          onClose={() => {
            setIsCommentsModalOpen(false)
            setCommentingArticle(null)
            fetchArticles() // To update comment counts
          }}
          articleId={commentingArticle.id}
          articleTitle={commentingArticle.title}
        />
      )}

    </div>
  )
}
