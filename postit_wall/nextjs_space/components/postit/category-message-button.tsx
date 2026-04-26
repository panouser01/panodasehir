'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import { MessageCircle, Send } from 'lucide-react'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

export function CategoryMessageButton({ categoryId, categoryName }: { categoryId: string, categoryName: string }) {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Only show if user is logged in
  if (!session) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/postits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: message,
          categoryId: categoryId,
          isDirectMessage: true,
          color: 'YELLOW',
          font: 'HANDWRITING',
          pushpin: 'BLUE',
          expiresInDays: '30'
        })
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Mesaj gönderilemedi')
      }

      toast.success('Mesajınız duvar sahibine başarıyla iletildi!')
      setIsOpen(false)
      setMessage('')
    } catch (error: any) {
      toast.error(error.message || 'Mesaj gönderilirken hata oluştu')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          className="flex items-center justify-center px-1.5 py-0.5 rounded-md bg-indigo-100/90 backdrop-blur-sm text-indigo-800 shadow-sm border border-indigo-400 hover:bg-indigo-200 transition-colors cursor-pointer pointer-events-auto"
          title="Duvar Sahibine Mesaj Gönder"
        >
          <MessageCircle className="w-3 h-3" />
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md z-[99999] bg-white border-0 shadow-2xl p-6 overflow-hidden">
        <div className="flex flex-col gap-1 mb-2 mt-4 md:mt-2">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <MessageCircle className="text-indigo-600" />
            Duvar Sahibine Mesaj
          </h3>
          <div className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100 inline-flex w-max items-center shadow-sm uppercase tracking-wide">
            {categoryName}
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-2 whitespace-normal text-left">
          Bu mesaj sadece duvar yöneticileri ve site yöneticileri tarafından okunabilir, panoda yayınlanmaz.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Mesajınızı buraya yazın..."
            className="w-full text-black h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
            maxLength={1000}
          />
          <div className="flex justify-end p-0">
            <span className={`text-xs ${message.length > 950 ? 'text-orange-500 font-bold' : 'text-gray-400'}`}>
              {message.length}/1000
            </span>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
              {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
