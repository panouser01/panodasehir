'use client'

import { useState, useEffect } from 'react'
import { Bell, BellRing, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useSession } from 'next-auth/react'

interface CategorySubscribeButtonProps {
  categoryId: string
  className?: string
  initialIsSubscribed?: boolean
  variant?: 'large' | 'badge'
}

export function CategorySubscribeButton({ categoryId, className = '', initialIsSubscribed = false, variant = 'large' }: CategorySubscribeButtonProps) {
  const { data: session } = useSession()
  const [isSubscribed, setIsSubscribed] = useState(initialIsSubscribed)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user) {
      setLoading(false)
      return
    }

    const checkSubscription = async () => {
      try {
        const res = await fetch(`/api/walls/${categoryId}/subscribe`)
        const data = await res.json()
        setIsSubscribed(data.subscribed)
      } catch (error) {
        console.error('Error checking subscription', error)
      } finally {
        setLoading(false)
      }
    }

    checkSubscription()
  }, [categoryId, session])

  const toggleSubscription = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!session?.user) {
      toast.error('Abone olmak için giriş yapmalısınız')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/walls/${categoryId}/subscribe`, { method: 'POST' })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || 'İşlem başarısız')
      
      setIsSubscribed(data.subscribed)
      toast.success(data.message)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (variant === 'badge') {
    if (loading) {
      return (
        <div className={`flex items-center justify-center px-1.5 py-0.5 rounded-md bg-purple-100/90 text-purple-800 shadow-sm border border-purple-500 opacity-50 cursor-not-allowed ${className}`}>
           <Loader2 className="w-3 h-3 animate-spin" />
        </div>
      )
    }

    return (
      <div 
        role="button"
        tabIndex={0}
        onClick={toggleSubscription}
        className={`flex items-center justify-center px-1.5 py-0.5 rounded-md text-purple-800 shadow-sm transition-colors border border-purple-500 cursor-pointer pointer-events-auto hover:bg-purple-200 ${isSubscribed ? 'bg-purple-300' : 'bg-purple-100/90'} ${className}`}
        title={isSubscribed ? "Abonelikten Çık" : "Yeni Bildirimler İçin Abone Ol"}
      >
        {isSubscribed ? (
          <BellRing className="w-3 h-3 text-purple-900" />
        ) : (
          <Bell className="w-3 h-3" />
        )}
      </div>
    )
  }

  // Large default variant
  if (loading) {
    return (
      <button disabled className={`opacity-50 cursor-not-allowed ${className}`}>
        <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin text-white/70" />
      </button>
    )
  }

  return (
    <button
      onClick={toggleSubscription}
      title={isSubscribed ? "Abonelikten Çık" : "Yeni Bildirimler İçin Abone Ol"}
      className={`transition-all duration-300 hover:scale-110 active:scale-95 group relative ${className}`}
    >
      {isSubscribed ? (
        <BellRing className="w-6 h-6 md:w-8 md:h-8 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] filter group-hover:text-yellow-300" />
      ) : (
        <Bell className="w-6 h-6 md:w-8 md:h-8 text-white/80 drop-shadow-md group-hover:text-white" />
      )}
      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-max px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        {isSubscribed ? "Abonelikten Çık" : "Abone Ol"}
      </span>
    </button>
  )
}
