'use client'

import { useState, useEffect } from 'react'
import { Loader2, MessageSquare, HelpCircle, Trash2, Calendar } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'

export function ArticleCommentsSection({ articleId }: { articleId: string }) {
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [isQuestion, setIsQuestion] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [replyToId, setReplyToId] = useState<string | null>(null)

  const loadComments = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/articles/${articleId}/comments`)
      if (res.ok) {
        const data = await res.json()
        setComments(data)
      }
    } catch(err) {
      toast.error('Yorumlar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (articleId) {
      loadComments() // Initial fetch
      
      const intervalId = setInterval(() => {
         loadComments()
      }, 15000)

      return () => clearInterval(intervalId)
    }
  }, [articleId])

  const handleDelete = async (commentId: string) => {
    if(!confirm('Bunu silmek istediğinize emin misiniz?')) return
    try {
      const res = await fetch(`/api/articles/${articleId}/comments?commentId=${commentId}`, { method: 'DELETE' })
      if(res.ok) {
        toast.success('Başarıyla silindi')
        loadComments()
      } else {
        toast.error('Silinemedi')
      }
    } catch(err) {
      toast.error('Hata oluştu')
    }
  }

  const handleSubmit = async (parentId: string | null = null) => {
    if(!newComment.trim()) return
    try {
      setSubmitting(true)
      const res = await fetch(`/api/articles/${articleId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment, isQuestion, parentId })
      })
      if(res.ok) {
        toast.success(parentId ? 'Yanıtınız gönderildi' : (isQuestion ? 'Sorunuz gönderildi' : 'Yorumunuz eklendi'))
        setNewComment('')
        setIsQuestion(false)
        setReplyToId(null)
        loadComments()
      } else {
        const errData = await res.json()
        toast.error(errData.error || 'Kaydedilemedi (giriş yapmanız gerekebilir)')
      }
    } catch(err) {
      toast.error('Bağlantı hatası')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full">
      <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-indigo-500" />
        Soru ve Yorumlar
      </h3>

      <div className="mb-8 border border-slate-200 rounded-xl p-4 bg-slate-50">
        <div className="flex flex-col gap-3">
          <textarea
            className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            rows={3}
            placeholder="Yorumunuzu veya sorunuzu buraya yazın..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isQuestion}
                onChange={(e) => setIsQuestion(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
              />
              Bu bir soru mu?
            </label>
            <Button onClick={() => handleSubmit()} disabled={submitting || !newComment.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <MessageSquare className="w-4 h-4 mr-2" />}
              Gönder
            </Button>
          </div>
        </div>
      </div>

      {loading && comments.length === 0 ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : comments.length === 0 ? (
        <div className="py-10 text-center flex flex-col items-center border border-dashed border-slate-300 rounded-xl bg-slate-50">
          <MessageSquare className="w-10 h-10 text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">Bu yazı için henüz yorum veya soru bulunmuyor.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="flex flex-col gap-3">
              <div className={`p-4 rounded-xl border ${c.isQuestion ? 'bg-pink-50 border-pink-100' : 'bg-white border-slate-200'} relative shadow-sm`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <img src={c.user?.image || "/img/user.png"} alt="" className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                    <div>
                      <div className="text-sm font-bold text-slate-800">{c.user?.nickname || c.user?.name || 'Anonim'}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> {new Date(c.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setReplyToId(replyToId === c.id ? null : c.id)} className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 h-8 px-3 text-xs font-semibold">
                      Yanıtla
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 px-2 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-3 pl-12">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2 ${c.isQuestion ? 'bg-pink-100 text-pink-700' : 'bg-slate-100 text-slate-600'}`}>
                    {c.isQuestion ? <><HelpCircle className="w-3 h-3"/> SORU</> : <><MessageSquare className="w-3 h-3"/> YORUM</>}
                  </span>
                  <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">{c.content}</p>
                </div>
              </div>

              {/* Replies */}
              {c.replies && c.replies.length > 0 && (
                <div className="pl-8 md:pl-12 flex flex-col gap-3">
                  {c.replies.map((reply: any) => (
                    <div key={reply.id} className="p-3 rounded-xl border bg-slate-50 border-slate-200 relative shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <img src={reply.user?.image || "/img/user.png"} alt="" className="w-7 h-7 rounded-full object-cover border border-slate-200" />
                          <div>
                            <div className="text-xs font-bold text-slate-800">{reply.user?.nickname || reply.user?.name || 'Anonim'}</div>
                            <div className="text-[10px] text-slate-500">
                              {new Date(reply.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute:'2-digit' })}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(reply.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 h-6 px-1.5 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <div className="pl-9">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-widest bg-blue-100 text-blue-700 uppercase mb-1">
                          YANIT
                        </span>
                        <p className="text-slate-600 text-[13px] whitespace-pre-wrap leading-relaxed">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Form */}
              {replyToId === c.id && (
                <div className="pl-8 md:pl-12 mt-1">
                  <div className="border border-indigo-200 rounded-xl p-3 bg-indigo-50/50 shadow-inner">
                    <textarea
                      className="w-full border border-indigo-100 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-400 outline-none bg-white"
                      rows={2}
                      placeholder={`${c.user?.nickname || c.user?.name || 'Kullanıcı'} hedefine yanıtınız...`}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      autoFocus
                    />
                    <div className="flex justify-end mt-2">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => { setReplyToId(null); setNewComment(''); }} className="text-slate-500 hover:text-slate-700">İptal</Button>
                        <Button size="sm" onClick={() => handleSubmit(c.id)} disabled={submitting || !newComment.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                          Gönder
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
