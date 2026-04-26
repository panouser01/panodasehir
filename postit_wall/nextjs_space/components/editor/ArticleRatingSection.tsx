'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { toast } from 'react-hot-toast'

export function ArticleRatingSection({ articleId, initialAverage, onRated }: { articleId: string, initialAverage?: number, onRated?: (newAvg: number) => void }) {
  const [hoveredStar, setHoveredStar] = useState<number>(0)
  const [rating, setRating] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasRated, setHasRated] = useState(false)

  const handleRate = async (value: number) => {
    if (isSubmitting || hasRated) return
    
    setRating(value)
    try {
      setIsSubmitting(true)
      const res = await fetch(`/api/articles/${articleId}/rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: value })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        toast.success(`Puanınız (${value} yıldız) kaydedildi! Teşekkürler.`)
        setHasRated(true)
        if (onRated && data.newAverage) {
          onRated(data.newAverage)
        }
      } else {
        toast.error(data.error || 'Puan kaydedilemedi')
        if (data.error === 'Bu metne zaten oy verdiniz') {
          setHasRated(true)
          setRating(value)
        } else {
          setRating(0) // reset visual
        }
      }
    } catch(err) {
      toast.error('Bağlantı hatası')
      setRating(0)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full flex flex-col sm:flex-row items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm gap-4">
      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-2">
          Değerlendirin
        </h3>
        <p className="text-sm text-slate-500">
          {hasRated ? 'Geri bildiriminiz için teşekkürler!' : 'Bu metni ne kadar faydalı buldunuz?'}
        </p>
      </div>

      <div className="flex items-center gap-1.5" onMouseLeave={() => setHoveredStar(0)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            disabled={isSubmitting || hasRated}
            onMouseEnter={() => setHoveredStar(star)}
            onClick={() => handleRate(star)}
            className={`p-1.5 rounded-full transition-all duration-200 ${
              (hoveredStar || rating) >= star 
                ? 'text-yellow-500 scale-110' 
                : 'text-slate-300 hover:text-yellow-400'
            } ${hasRated ? 'cursor-default opacity-80' : 'cursor-pointer hover:bg-yellow-50'}`}
          >
            <Star className={`w-8 h-8 md:w-10 md:h-10 ${(hoveredStar || rating) >= star ? 'fill-current' : ''}`} />
          </button>
        ))}
        {hasRated && (
           <div className="ml-3 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
             Kaydedildi
           </div>
        )}
      </div>
    </div>
  )
}
