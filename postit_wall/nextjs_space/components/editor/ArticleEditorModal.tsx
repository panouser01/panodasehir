'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Wand2, Upload, Eye, EyeOff, FileText, Link, X, Image as ImageIcon, ExternalLink } from 'lucide-react'
import TipTapEditor from './TipTapEditor'
// @ts-ignore
import Microlink from '@microlink/react'
import { ArticleCommentsSection } from './ArticleCommentsSection'

interface ArticleEditorModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (articleData: any) => Promise<void>
  initialData?: any
  categoryId: string
  onTogglePublish?: () => Promise<void>
}

export default function ArticleEditorModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  categoryId,
  onTogglePublish
}: ArticleEditorModalProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [content, setContent] = useState(initialData?.content || '')
  const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnailUrl || '')
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [images, setImages] = useState<string[]>(initialData?.images || [])
  const [documents, setDocuments] = useState<{name: string, url: string}[]>(initialData?.documents || [])
  const [link, setLink] = useState<string>(initialData?.link || '')
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const [uploadingExtraImage, setUploadingExtraImage] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [previewDoc, setPreviewDoc] = useState<{name: string, url: string} | null>(null)

  // Handle mobile back button
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.hash !== '#article-editor' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      if (window.location.hash !== '#article-editor') {
        window.history.pushState(null, '', window.location.pathname + window.location.search + '#article-editor')
      }
      window.addEventListener('popstate', handlePopState)
    } else {
      if (window.location.hash === '#article-editor') {
        window.history.back()
      }
    }

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [isOpen, onClose])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/upload/local', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      if (res.ok) {
        setThumbnailUrl(data.url);
      } else {
        alert('Yükleme hatası: ' + data.error);
      }
    } catch (error) {
      console.error(error);
      alert('Görsel yüklenirken bir hata oluştu');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleExtraImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    if (images.length + e.target.files.length > 5) {
      alert('En fazla 5 adet resim ekleyebilirsiniz.');
      return;
    }
    setUploadingExtraImage(true);
    try {
      const newImages = [...images];
      for (let i = 0; i < e.target.files.length; i++) {
        if (newImages.length >= 5) break;
        const formData = new FormData();
        formData.append('file', e.target.files[i]);
        const res = await fetch('/api/upload/local', { method: 'POST', body: formData });
        if (res.ok) {
          const data = await res.json();
          newImages.push(data.fileUrl || data.url);
        }
      }
      setImages(newImages);
    } catch (err) {
      alert('Resim yüklenirken hata oluştu');
    } finally {
      setUploadingExtraImage(false);
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    if (documents.length + e.target.files.length > 5) {
      alert('En fazla 5 adet belge ekleyebilirsiniz.');
      return;
    }
    setUploadingDoc(true);
    try {
      const newDocs = [...documents];
      for (let i = 0; i < e.target.files.length; i++) {
        if (newDocs.length >= 5) break;
        const file = e.target.files[i];
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload/local', { method: 'POST', body: formData });
        if (res.ok) {
          const data = await res.json();
          newDocs.push({ name: file.name, url: data.fileUrl || data.url });
        }
      }
      setDocuments(newDocs);
    } catch (err) {
      alert('Belge yüklenirken hata oluştu');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Başlık ve içerik zorunludur.')
      return
    }

    try {
      setLoading(true)
      await onSave({
        id: initialData?.id,
        title,
        content,
        thumbnailUrl,
        categoryId,
        writeVersion: !!initialData, // Eski metni korumak için yeni versiyon flag'i
        images,
        documents,
        link
      })
      onClose()
    } catch (error) {
      console.error(error)
      alert('Kaydedilirken bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  const handleAiImprove = async () => {
    if (!title.trim()) {
      alert('AI önerisi alabilmek için lütfen önce bir başlık yazın.')
      return
    }
    try {
      setAiLoading(true)
      const res = await fetch('/api/articles/gemini/intro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || 'AI hatası');
      }
      
      const data = await res.json()
      if (data.suggestion) {
        setContent((prev: string) => data.suggestion + '<br/><br/>' + prev)
      }
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'AI önerisi alınırken bir hata oluştu.')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[1024px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center justify-between mt-2">
            <div>
              {initialData ? 'Metni Düzenle' : 'Yeni Metin Yaz'}
            </div>
            {!initialData && (
              <Button 
                variant="outline" 
                onClick={handleAiImprove}
                disabled={aiLoading}
                className="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 font-semibold flex items-center gap-2"
              >
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                Gemini AI ile Giriş Yazdır
              </Button>
            )}
          </DialogTitle>
          <DialogDescription>
            {initialData ? 'Mevcut içeriği düzenliyorsunuz. Değişiklikler yeni bir versiyon olarak kaydedilecektir.' : 'Panoya yeni bir zengin metin içeriği ekliyorsunuz.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 my-4">
          {initialData && onTogglePublish && (
            <button 
              type="button"
              onClick={async () => {
                setLoading(true)
                try {
                  await onTogglePublish();
                } finally {
                  setLoading(false)
                }
              }}
              className="absolute right-4 top-[52px] z-[9999] rounded-full bg-orange-600 text-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider shadow-lg transition-all hover:bg-orange-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none flex items-center gap-1.5"
            >
              {initialData.isPublished ? <EyeOff className="h-3 w-3 stroke-[3]" /> : <Eye className="h-3 w-3 stroke-[3]" />}
              {initialData.isPublished ? 'Yayından Kaldır' : 'Yayınla'}
            </button>
          )}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-md font-semibold">Metin Başlığı *</Label>
            <Input
              id="title"
              placeholder="Örn: Yapay Zekanın Geleceği"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg py-6"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnail" className="text-md font-semibold">Kapak Görseli URL veya Seçimi (Opsiyonel)</Label>
            <div className="flex items-center gap-3">
              <Input
                id="thumbnail"
                placeholder="Görsel urlsi örneğin: https://resim.com/foto.jpg"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                className="flex-1"
              />
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploadingImage}
                />
                <Button type="button" variant="outline" disabled={uploadingImage}>
                  {uploadingImage ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                  Yükle
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 p-4 border rounded-xl bg-slate-50">
              <Label className="text-sm font-semibold flex items-center gap-2"><ImageIcon className="w-4 h-4"/> Ek Görseller (Max 5)</Label>
              <div className="relative mb-2">
                <input type="file" multiple accept="image/*" onChange={handleExtraImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={uploadingExtraImage || images.length >= 5} />
                <Button type="button" variant="outline" className="w-full bg-white" disabled={uploadingExtraImage || images.length >= 5}>
                  {uploadingExtraImage ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />} Seç
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {images.map((img, i) => (
                  <div key={i} className="group relative w-[72px] h-[72px] border rounded-md overflow-hidden bg-white shadow-sm flex-shrink-0 cursor-pointer" onClick={() => setPreviewImage(img)}>
                    <img src={img} alt={`Ek görsel ${i+1}`} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setImages(images.filter((_, idx) => idx !== i)); }} 
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:scale-110"
                      title="Görseli Kaldır"
                    >
                      <X className="w-3 h-3"/>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 p-4 border rounded-xl bg-slate-50">
              <Label className="text-sm font-semibold flex items-center gap-2"><FileText className="w-4 h-4"/> Belgeler (Max 5)</Label>
              <div className="relative mb-2">
                <input type="file" multiple accept=".pdf,.doc,.docx,.txt" onChange={handleDocumentUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={uploadingDoc || documents.length >= 5} />
                <Button type="button" variant="outline" className="w-full bg-white" disabled={uploadingDoc || documents.length >= 5}>
                  {uploadingDoc ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />} Seç
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                {documents.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between bg-white px-3 py-2 border rounded-md shadow-sm text-xs group cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => setPreviewDoc(doc)}>
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="truncate w-[110px]" title={doc.name}>{doc.name}</span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setDocuments(documents.filter((_, idx) => idx !== i)); }} 
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Belgeyi Kaldır"
                    >
                      <X className="w-3.5 h-3.5"/>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 p-4 border rounded-xl bg-slate-50 relative flex flex-col overflow-hidden">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold flex items-center gap-2"><Link className="w-4 h-4"/> Harici Link</Label>
                {link && link.startsWith('http') && (
                  <a href={link} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-600 font-semibold hover:underline flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full border border-blue-100 transition-colors">
                    Linke Git <ExternalLink className="w-3 h-3"/>
                  </a>
                )}
              </div>
              <Input
                placeholder="https://..."
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="bg-white text-xs py-1"
              />
              <p className="text-[10px] text-gray-500">1 adet bağlantı adresi ekleyebilirsiniz.</p>
              
              {link && link.startsWith('http') && (
                <div className="mt-2 text-xs flex-1 border border-gray-100 rounded-md bg-white">
                  <Microlink url={link} size="small" style={{ width: '100%', borderRadius: '0.375rem', zIndex: 0 }} lazy />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-md font-semibold">Metin Detayı (İçerik) *</Label>
            <TipTapEditor
              content={content}
              onChange={setContent}
              placeholder="Buraya yazmaya başlayın..."
            />
          </div>
        </div>

        <DialogFooter className="bg-slate-50 -mx-6 px-6 py-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            İptal
          </Button>
          <Button onClick={handleSave} disabled={loading || !title.trim() || !content.trim()}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {initialData ? 'Değişiklikleri Kaydet (Versiyonla)' : 'Metni Yayımla'}
          </Button>
        </DialogFooter>

        {initialData && (
          <div className="border-t border-slate-200 mt-6 -mx-6 px-6 pt-8 pb-4 bg-slate-50/50">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <ArticleCommentsSection articleId={initialData.id} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>

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
          <div className="flex-1 w-full bg-gray-50 rounded-lg overflow-hidden border">
            {previewDoc.url.toLowerCase().endsWith('.doc') || previewDoc.url.toLowerCase().endsWith('.docx') ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
                <FileText className="w-16 h-16 text-blue-400 mb-4" />
                <h4 className="text-xl font-bold mb-2">Word Belgesi Önizlenemiyor</h4>
                <p className="text-gray-500 mb-6">Tarayıcılar Word dosyalarını (doc, docx) doğrudan gösteremez. Belgeyi cihazınıza indirebilirsiniz.</p>
                <Button onClick={() => window.open(previewDoc.url, '_blank')}>
                  Belgeyi İndir / Aç
                </Button>
              </div>
            ) : (
              <iframe 
                src={previewDoc.url} 
                className="w-full h-full border-0"
                title={previewDoc.name}
              />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  )
}
