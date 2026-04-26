'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { ExternalLink, Trash2, Heart, Eye, MessageSquare, Send, Flag, Play, Share2, Sun, Moon, Cloud, CloudFog, CloudRain, CloudSnow, CloudLightning, X } from 'lucide-react'
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"
import { CustomLinkPreview } from './link-preview'
import { PostitShareButton } from './postit-share-button'
import { UserFollowButton } from './user-follow-button'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { stripHtml } from '@/lib/utils'
const getConditionStr = (code: number) => {
  if (code === 0 || code === 1) return 'sunny';
  if (code === 2 || code === 3) return 'cloudy';
  if (code >= 51 && code <= 67) return 'rainy';
  if (code >= 71 && code <= 77) return 'snowy';
  if (code >= 80 && code <= 82) return 'rainy';
  if (code >= 85 && code <= 86) return 'snowy';
  if (code >= 95 && code <= 99) return 'storm';
  if (code === 45 || code === 48) return 'foggy';
  return 'cloudy';
}

const getConditionDescTR = (code: number) => {
  if (code === 0) return 'Açık ve sıcak.';
  if (code === 1) return 'Güneşli hava etkili olacak.';
  if (code === 2) return 'Az bulutlu ve sıcak.';
  if (code === 3) return 'Parçalı bulutlu bir gün.';
  if (code >= 51 && code <= 67) return 'Öğleden sonra yer yer kısa süreli sağanak geçişleri bekleniyor.';
  if (code >= 71 && code <= 77) return 'Kar yağışlı bir gün.';
  if (code >= 80 && code <= 82) return 'Sağanak yağış bekleniyor.';
  if (code >= 85 && code <= 86) return 'Yoğun kar yağışlı.';
  if (code >= 95 && code <= 99) return 'Gök gürültülü sağanak geçişleri bekleniyor.';
  if (code === 45 || code === 48) return 'Yer yer yoğun sisli.';
  return 'Genellikle bulutlu.';
}

const getSuffix = (word: string) => {
  if (!word) return 'de';
  const match = word.toLocaleLowerCase('tr-TR').match(/[aıoueiöü]/g);
  const lastVowel = match ? match[match.length - 1] : 'e';
  const lastChar = word.toLocaleLowerCase('tr-TR').slice(-1);
  const isHardConsonant = ['f','s','t','k','ç','ş','h','p'].includes(lastChar);
  const isFront = ['e','i','ö','ü'].includes(lastVowel);
  if (isFront) return isHardConsonant ? 'te' : 'de';
  return isHardConsonant ? 'ta' : 'da';
};

const getWeatherUI = (weatherBg: string, iconSet: string = 'default', appearance: any = {}) => {
  if (!weatherBg) return { bg: '', icon: null, text: 'text-white', bgImage: null };
  const parts = weatherBg.split('_');
  const condition = parts[0];
  const isNight = parts.length > 1 && parts[1] === 'night';
  
  let bgColClass = "bg-slate-800";
  
  if (condition === 'sunny') {
    if (isNight) bgColClass = "bg-slate-900";
    else bgColClass = "bg-sky-500";
  } else if (condition === 'cloudy') {
    if (isNight) bgColClass = "bg-slate-800";
    else bgColClass = "bg-slate-600";
  } else if (condition === 'rainy' || condition === 'storm') {
    bgColClass = "bg-slate-700";
  } else if (condition === 'snowy' || condition === 'foggy') {
    bgColClass = "bg-slate-400";
  }
  
  const bg = `${bgColClass}`;

  const renderIcon = (defaultIcon: any, emoji: string) => {
    if (iconSet === 'emoji') {
       return <span className="text-[30cqmin] min-w-[32px] min-h-[32px] max-w-[120px] max-h-[120px] leading-none drop-shadow-md flex items-center justify-center">{emoji}</span>;
    } else if (iconSet === 'animated') {
       return <span className="text-[30cqmin] min-w-[32px] min-h-[32px] max-w-[120px] max-h-[120px] leading-none drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] animate-pulse flex items-center justify-center">{emoji}</span>;
    }
    return defaultIcon;
  };

  let bgImage = null;
  if (condition === 'sunny' && appearance?.weatherBgSunny) bgImage = appearance.weatherBgSunny;
  else if (condition === 'cloudy' && appearance?.weatherBgCloudy) bgImage = appearance.weatherBgCloudy;
  else if (condition === 'rainy' && appearance?.weatherBgRainy) bgImage = appearance.weatherBgRainy;
  else if (condition === 'snowy' && appearance?.weatherBgSnowy) bgImage = appearance.weatherBgSnowy;
  else if (condition === 'foggy' && appearance?.weatherBgFoggy) bgImage = appearance.weatherBgFoggy;
  else if ((condition === 'storm' || condition === 'stormy') && appearance?.weatherBgStormy) bgImage = appearance.weatherBgStormy;

  if (condition === 'sunny') {
    if (isNight) return { bg, text: 'text-indigo-100 drop-shadow-xl', bgImage, icon: renderIcon(<Moon className="w-[30cqmin] h-[30cqmin] min-w-[32px] min-h-[32px] max-w-[120px] max-h-[120px] text-blue-100 drop-shadow-[0_0_25px_rgba(255,255,255,0.7)]" fill="currentColor" />, '🌙') };
    return { bg, text: 'text-white drop-shadow-xl', bgImage, icon: renderIcon(<Sun className="w-[30cqmin] h-[30cqmin] min-w-[32px] min-h-[32px] max-w-[120px] max-h-[120px] text-yellow-300 drop-shadow-[0_0_35px_rgba(253,224,71,1)]" fill="currentColor" />, '☀️') };
  }
  if (condition === 'cloudy') {
    if (isNight) return { bg, text: 'text-indigo-50 drop-shadow-xl', bgImage, icon: renderIcon(<Cloud className="w-[30cqmin] h-[30cqmin] min-w-[32px] min-h-[32px] max-w-[120px] max-h-[120px] text-gray-200 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" fill="currentColor" />, '☁️') };
    return { bg, text: 'text-white drop-shadow-xl', bgImage, icon: renderIcon(<Cloud className="w-[30cqmin] h-[30cqmin] min-w-[32px] min-h-[32px] max-w-[120px] max-h-[120px] text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.9)]" fill="currentColor" />, '⛅') };
  }
  if (condition === 'rainy') {
    if (isNight) return { bg, text: 'text-blue-100 drop-shadow-xl', bgImage, icon: renderIcon(<CloudRain className="w-[30cqmin] h-[30cqmin] min-w-[32px] min-h-[32px] max-w-[120px] max-h-[120px] text-blue-200 drop-shadow-[0_0_25px_rgba(147,197,253,0.7)]" />, '🌧️') };
    return { bg, text: 'text-blue-50 drop-shadow-xl', bgImage, icon: renderIcon(<CloudRain className="w-[30cqmin] h-[30cqmin] min-w-[32px] min-h-[32px] max-w-[120px] max-h-[120px] text-white drop-shadow-[0_0_30px_rgba(255,255,255,1)]" />, '🌧️') };
  }
  if (condition === 'snowy') {
    if (isNight) return { bg, text: 'text-indigo-50 drop-shadow-xl', bgImage, icon: renderIcon(<CloudSnow className="w-[30cqmin] h-[30cqmin] min-w-[32px] min-h-[32px] max-w-[120px] max-h-[120px] text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.8)]" />, '❄️') };
    return { bg, text: 'text-white drop-shadow-xl', bgImage, icon: renderIcon(<CloudSnow className="w-[30cqmin] h-[30cqmin] min-w-[32px] min-h-[32px] max-w-[120px] max-h-[120px] text-white drop-shadow-[0_0_30px_rgba(255,255,255,1)]" fill="currentColor" />, '❄️') };
  }
  if (condition === 'foggy') {
    if (isNight) return { bg, text: 'text-gray-200 drop-shadow-xl', bgImage, icon: renderIcon(<CloudFog className="w-[30cqmin] h-[30cqmin] min-w-[32px] min-h-[32px] max-w-[120px] max-h-[120px] text-gray-300 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" />, '🌫️') };
    return { bg, text: 'text-white drop-shadow-xl', bgImage, icon: renderIcon(<CloudFog className="w-[30cqmin] h-[30cqmin] min-w-[32px] min-h-[32px] max-w-[120px] max-h-[120px] text-white drop-shadow-[0_0_30px_rgba(255,255,255,1)]" fill="currentColor" />, '🌫️') };
  }
  // storm
  return { bg, text: 'text-white drop-shadow-xl', bgImage, icon: renderIcon(<CloudLightning className="w-[30cqmin] h-[30cqmin] min-w-[32px] min-h-[32px] max-w-[120px] max-h-[120px] text-yellow-400 drop-shadow-[0_0_35px_rgba(250,204,21,0.9)]" />, '⛈️') };
}
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog'

import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'

interface PostItCardProps {
  id: string
  content: string
  detail?: string | null
  imageUrl?: string | null
  images?: string[]
  link?: string | null
  color: string
  font?: string
  pushpin?: string
  rotation: number
  userName: string
  userImage?: string | null
  authorId?: string
  categoryName: string
  createdAt: Date
  canDelete?: boolean
  onDelete?: (id: string) => void
  initialLikesCount?: number
  initialHasLiked?: boolean
  currentUserId?: string
  isLarge?: boolean
  initialViewsCount?: number
  initialSharesCount?: number
  onInteraction?: (isOpen: boolean) => void
  comments?: any[]
  triggerComponent?: React.ReactNode
  postitAppearance?: any
  ottModalBgType?: string
  ottModalBgColor?: string
  ottModalBgColorAlpha?: number
  ottModalBgImage?: string
  ottModalTextColor?: string
  ottCardRatio?: string
  textColor?: string | null
  textSize?: string | null
  isWeather?: boolean
  isVirtualNav?: boolean
  weatherTemp?: number
  weatherCondition?: string
  weatherBg?: string
  weatherDaily?: any
  weatherHourly?: any
  ottCardStyle?: string
}

const colorClasses: { [key: string]: string } = {
  YELLOW: 'bg-yellow-200 shadow-yellow-300/50',
  PINK: 'bg-pink-200 shadow-pink-300/50',
  BLUE: 'bg-blue-200 shadow-blue-300/50',
  GREEN: 'bg-green-200 shadow-green-300/50',
  ORANGE: 'bg-orange-200 shadow-orange-300/50',
  PURPLE: 'bg-purple-200 shadow-purple-300/50',
  WHITE: 'bg-white shadow-gray-200/50',
  DARK: 'bg-gray-900 border-gray-700 text-gray-100 shadow-gray-900/50',
  TRANSPARENT: 'bg-transparent shadow-none',
  GLASS: 'bg-white/30 backdrop-blur-md border border-white/40 shadow-xl',
}

const fontClasses: { [key: string]: string } = {
  HANDWRITING: 'font-handwriting',
  SERIF: 'font-serif',
  SANS: 'font-sans',
  MONO: 'font-mono',
  CURSIVE: 'font-cursive',
  SYSTEM: 'font-system',
  MODERN: 'font-modern',
  COMIC: 'font-comic',
}

const pushpinImages: { [key: string]: string } = {
  RED: '/pushpins/red.png',
  BLUE: '/pushpins/blue.png',
  GOLD: '/pushpins/gold.png',
  GREEN: '/pushpins/green.png',
  PINK: '/pushpins/pink.png',
  SILVER: '/pushpins/silver.png',
  BLACK: '/pushpins/clip.png',
  TAPE: '/pushpins/tape.png',
  NONE: '', // explicit missing
}

export function PostItCard({
  id,
  content,
  detail,
  imageUrl,
  images = [],
  link,
  color,
  font = 'HANDWRITING',
  pushpin = 'RED',
  rotation,
  userName,
  userImage,
  authorId,
  categoryName,
  createdAt,
  canDelete,
  onDelete,
  initialLikesCount = 0,
  initialHasLiked = false,
  currentUserId,
  isLarge,
  initialViewsCount = 0,
  initialSharesCount = 0,
  onInteraction,
  comments = [],
  triggerComponent,
  postitAppearance,
  ottModalBgType,
  ottModalBgColor,
  ottModalBgColorAlpha,
  ottModalBgImage,
  ottModalTextColor,
  ottCardRatio,
  textColor,
  textSize,
  isWeather,
  isVirtualNav,
  weatherTemp,
  weatherCondition,
  weatherBg,
  weatherDaily,
  weatherHourly,
  ottCardStyle,
}: PostItCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [viewsCount, setViewsCount] = useState(initialViewsCount)
  const [hasLiked, setHasLiked] = useState(initialHasLiked)
  const [hasViewed, setHasViewed] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [transitionEffect, setTransitionEffect] = useState<'flip-left' | 'flip-right' | 'fade'>('flip-left')
  const [isOpen, setIsOpen] = useState(false)
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null)

  const [carouselApi, setCarouselApi] = useState<CarouselApi>()

  const rawBgAlpha = ottModalBgColorAlpha ?? 100;
  const processHexAlpha = (hex: string | undefined | null, alpha: number) => {
      if (!hex || !hex.startsWith("#")) return hex;
      if (alpha >= 100) return hex;
      // Handle comma separated for gradients
      if (hex.includes(",")) {
          return hex.split(",").map(part => {
              const p = part.trim();
              if (p.startsWith("#") && p.length === 7) return p + Math.round((alpha / 100) * 255).toString(16).padStart(2, "0");
              if (p.startsWith("#") && p.length === 9) return p.slice(0,7) + Math.round((alpha / 100) * 255).toString(16).padStart(2, "0");
              return p;
          }).join(",");
      }
      const a = Math.round((alpha / 100) * 255).toString(16).padStart(2, "0");
      return hex.substring(0,7) + a;
  };
  const finalOttModalBgColor = processHexAlpha(ottModalBgColor, rawBgAlpha);
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    if (!carouselApi) {
      return
    }
    setCurrentSlide(carouselApi.selectedScrollSnap())
    carouselApi.on("select", () => {
      setCurrentSlide(carouselApi.selectedScrollSnap())
    })
  }, [carouselApi])

  const cleanContent = stripHtml(content)

  const [commentsList, setCommentsList] = useState(comments)
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isReporting, setIsReporting] = useState(false)

  const effects: ('flip-left' | 'flip-right' | 'fade')[] = ['flip-left', 'flip-right', 'fade']

  const handleOpenChange = async (open: boolean) => {
    if (open) {
      const isVideo = displayImages.length === 1 && displayImages[0]?.match(/\.(mp4|webm|ogg)$/i);
      if (link && displayImages.length === 1 && !isVideo) {
        window.open(link, (link.includes('panodasehir.com') || link.startsWith('/')) ? '_self' : '_blank');
        return;
      }
      setIsOpen(true);
      if (typeof window !== 'undefined') {
        window.history.pushState({ modal_id: id }, '');
      }
      onInteraction?.(open);
      
      if (!hasViewed) {
        setHasViewed(true)
        setViewsCount((prev) => prev + 1)
        try {
          await fetch(`/api/postits/${id}/view`, { method: 'POST' })
        } catch (error) {
          console.error('View increment error', error)
        }
      }
    } else {
      setIsOpen(false);
      onInteraction?.(false);
      if (typeof window !== 'undefined' && window.history.state?.modal_id === id) {
        window.history.back();
      }
    }
  }

  useEffect(() => {
    const handlePopState = () => {
      if (isOpen) {
        setIsOpen(false);
        onInteraction?.(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isOpen, onInteraction]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!currentUserId) {
      toast.error('Beğenmek için giriş yapmalısınız')
      return;
    }
    if (isLiking) return;

    setIsLiking(true)
    const previousHasLiked = hasLiked;
    const previousLikesCount = likesCount;

    // Optimistic update
    setHasLiked(!hasLiked)
    setLikesCount((prev) => hasLiked ? prev - 1 : prev + 1)

    try {
      const response = await fetch(`/api/postits/${id}/like`, {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error('Bir hata oluştu')
      }
      const data = await response.json()
      setHasLiked(data.liked)
      // Actual count might need a refetch, but we just stick to optimistic for now
      // unless we want to query the exact count. 
    } catch (error) {
      console.error('Like error:', error)
      toast.error('İşlem başarısız')
      // Revert
      setHasLiked(previousHasLiked)
      setLikesCount(previousLikesCount)
    } finally {
      setIsLiking(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    setIsDeleting(true)
    try {
      await onDelete(id)
    } catch (error) {
      console.error('Delete error:', error)
      setIsDeleting(false)
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === `#postit-${id}-front-cover`) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`postit-${id}-front-cover`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          el.click()
        }
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [id])

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const url = window.location.href.split('#')[0] + '#postit-' + id + '-front-cover'
      await navigator.clipboard.writeText(url)
      toast.success('Link kopyalandı')
    } catch (err) {
      toast.error('Kopyalanamadı')
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUserId) {
      toast.error('Yorum yapmak için giriş yapmalısınız')
      return;
    }
    if (!newComment.trim()) return;

    setIsSubmittingComment(true)
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postItId: id, content: newComment.trim() })
      })

      if (!response.ok) {
        throw new Error('Yorum eklenemedi')
      }

      const data = await response.json()
      setCommentsList(prev => [data.comment, ...prev])
      setNewComment('')
      toast.success('Yorum eklendi')
    } catch (error) {
      console.error('Comment error:', error)
      toast.error('Yorum eklenirken hata oluştu')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Silinemedi')
      setCommentsList(prev => prev.filter(c => c.id !== commentId))
      toast.success('Yorum silindi')
    } catch (error) {
      toast.error('Yorum silinirken hata oluştu')
    }
  }

  const handleReport = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!currentUserId) {
      toast.error('Şikayet etmek için giriş yapmalısınız')
      return;
    }
    
    // Quick confirmation
    if (!window.confirm('Bu notu spam veya uygunsuz içerik olarak bildirmek istiyor musunuz?')) return;

    setIsReporting(true)
    try {
      const response = await fetch(`/api/postits/${id}/report`, { method: 'POST' })
      const data = await response.json()
      
      if (!response.ok) throw new Error(data.error || 'Şikayet edilemedi')
      
      toast.success(data.message || 'Şikayetiniz alındı')
      
      if (data.hidden && onDelete) {
         // Optionally remove it from view if it reached the auto-hide threshold
         onDelete(id)
      }
    } catch (error: any) {
      toast.error(error.message || 'Şikayet edilirken hata oluştu')
    } finally {
      setIsReporting(false)
    }
  }

  // Use provided images array, or fallback to imageUrl if array is empty but imageUrl exists
  const displayImages = images && images.length > 0 ? images : (imageUrl ? [imageUrl] : [])
  const hasMultipleImages = displayImages.length > 1

  const weatherUI = isWeather ? getWeatherUI(weatherBg || '', postitAppearance?.weatherIconSet, postitAppearance) : null;

  // Auto-play thumbnail slider if multiple images with random delays
  useEffect(() => {
    if (!hasMultipleImages) return

    // Randomized delay and interval to prevent synchronized transitions
    const initialDelay = Math.random() * 3000
    const intervalTime = 3000 + Math.random() * 2000

    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => {
          // Select a random effect for the next transition
          const nextEffect = effects[Math.floor(Math.random() * effects.length)]
          setTransitionEffect(nextEffect)
          return (prev + 1) % displayImages.length
        })
      }, intervalTime)
      return () => clearInterval(interval)
    }, initialDelay)

    return () => clearTimeout(timeout)
  }, [hasMultipleImages, displayImages.length])

  const mainImage = displayImages[currentImageIndex] || displayImages[0]
  const hasMedia = Boolean(hasMultipleImages || mainImage || (link && displayImages.length === 0 && !isWeather));

  // Get motion props based on current effect
  const getMotionProps = () => {
    switch (transitionEffect) {
      case 'flip-left':
        return {
          initial: { rotateY: 90, opacity: 0 },
          animate: { rotateY: 0, opacity: 1 },
          exit: { rotateY: -90, opacity: 0 },
          style: { transformOrigin: 'left center' }
        }
      case 'flip-right':
        return {
          initial: { rotateY: -90, opacity: 0 },
          animate: { rotateY: 0, opacity: 1 },
          exit: { rotateY: 90, opacity: 0 },
          style: { transformOrigin: 'right center' }
        }
      default: // fade
        return {
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 1.05 },
          style: { transformOrigin: 'center center' }
        }
    }
  }

  const motionProps = getMotionProps()

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {triggerComponent ? (
          triggerComponent
        ) : (
          <motion.div
            id={`postit-${id}-front-cover`}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '100px' }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            style={{ rotate: postitAppearance?.animationStyle === 'flat' ? '0deg' : `${rotation}deg` }}
            className="relative cursor-pointer"
          >
            {/* Pushpin */}
            {pushpin !== 'NONE' && (
              <div className={`absolute ${pushpin === 'TAPE' ? '-top-3' : '-top-5'} left-1/2 -translate-x-1/2 z-10 ${pushpin === 'TAPE' ? 'opacity-80' : ''}`}>
                <Image
                  src={pushpinImages[pushpin] ?? pushpinImages.RED}
                  alt="Pin"
                  width={pushpin === 'TAPE' ? 60 : 45}
                  height={pushpin === 'TAPE' ? 30 : 45}
                  className="drop-shadow-md"
                />
              </div>
            )}

            {/* User Avatar Badge (Top Left) */}
            {userImage && (
              <div className="absolute top-3 left-3 z-20 pointer-events-none">
                <Image src={userImage} width={32} height={32} unoptimized={userImage.startsWith('data:')} alt={userName} className="w-8 h-8 rounded-full object-cover border-2 border-white/80 shadow-md opacity-90 transition-opacity" />
              </div>
            )}

            <div
              className={`${(postitAppearance?.shapeType === 'custom' || postitAppearance?.shapeType === 'transparent') ? 'bg-transparent shadow-none border-none' : (isWeather && weatherUI ? weatherUI.bg : (colorClasses[color] ?? colorClasses.YELLOW))} 
                p-5 pt-8 transition-all duration-300 min-h-[180px] w-full h-full flex flex-col relative overflow-hidden
                ${isLarge || displayImages.length > 0 ? 'max-w-[800px]' : 'max-w-[400px]'}
                ${(!postitAppearance || !postitAppearance.shapeType || postitAppearance?.shapeType === 'default') ? 'rounded-md shadow-md hover:shadow-xl' : ''}
                ${postitAppearance?.shapeType === 'square' ? 'rounded-none shadow-md hover:shadow-xl' : ''}
                ${postitAppearance?.shapeType === 'circle' ? 'rounded-full aspect-square justify-center items-center pt-10 px-10 pb-6 text-center shadow-lg hover:shadow-xl' : ''}
                ${postitAppearance?.shapeType === 'paper_tear' ? 'rounded-b-2xl rounded-t-sm border-b-4 shadow-lg hover:shadow-xl' : ''}
                ${postitAppearance?.shapeType === 'custom' ? '!p-8 drop-shadow-xl' : ''}
              `}
              style={(postitAppearance?.shapeType === 'custom' && postitAppearance?.backgroundImage) ? {
                backgroundImage: `url(${postitAppearance.backgroundImage})`,
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center'
              } : (isWeather && weatherUI?.bgImage ? {
                backgroundImage: `url('${weatherUI.bgImage}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              } : {})}
            >
              {(postitAppearance?.ottCellBorderEnabled === true || postitAppearance?.ottCellBorderEnabled === 'true') && (
                <div 
                  className="absolute inset-0 pointer-events-none z-[5] transition-all duration-300"
                  style={{
                    borderStyle: postitAppearance?.ottCellBorderStyle || 'solid',
                    borderColor: postitAppearance?.ottCellBorderColor || '#000000',
                    borderWidth: postitAppearance?.ottCellBorderWidth || '1px',
                    borderRadius: postitAppearance?.ottCellBorderRadius || '0px',
                    boxSizing: 'border-box'
                  }}
                />
              )}
              <div className={`relative z-10 flex flex-col h-full ${isWeather ? 'text-white' : ''} ${weatherUI?.bgImage ? 'bg-black/30 backdrop-blur-[2px] rounded-xl' : ''}`}>
              {/* Image Thumbnail (Automatic Slider if multiple) */}
              {displayImages.length > 0 && (
                <div
                  className="relative w-full aspect-video mb-4 rounded bg-transparent overflow-hidden"
                  style={{ perspective: '1200px' }}
                >
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      key={currentImageIndex}
                      {...motionProps}
                      transition={{
                        duration: 0.8,
                        ease: [0.4, 0, 0.2, 1]
                      }}
                      style={{ ...motionProps.style }}
                      className="absolute inset-0"
                    >
                      {displayImages[currentImageIndex]?.match(/\.(mp4|webm|ogg)$/i) ? (
                        <div className="relative w-full h-full group/video">
                          <video
                            src={`${displayImages[currentImageIndex]}#t=0.1`}
                            className="object-contain object-top w-full h-full block"
                            preload="metadata"
                            muted
                            playsInline
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover/video:opacity-100 transition-opacity">
                            <Play className="w-12 h-12 text-white/80 fill-white/80" />
                          </div>
                        </div>
                      ) : (
                        <Image
                          src={displayImages[currentImageIndex]}
                          alt={`Post-it medya ${currentImageIndex + 1}`}
                          fill
                          className="object-contain object-top"
                          style={{ transform: 'scale(1.03)', willChange: 'transform' }}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                  {hasMultipleImages && (
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full z-10 font-sans backdrop-blur-sm border border-white/20">
                      {currentImageIndex + 1} / {displayImages.length}
                    </div>
                  )}
                </div>
              )}

              {/* Content */}
            {/* Sub-info / Byline */}
            <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 mb-2 border-b ${ottModalTextColor || postitAppearance?.textColor ? 'border-current opacity-90' : 'border-black/5 text-gray-700'} text-sm`}>
              <div className="flex items-center gap-3">
                  {userImage ? (
                    <Image src={userImage} width={36} height={36} unoptimized={userImage.startsWith('data:')} alt={userName} className="w-9 h-9 rounded-full object-cover shrink-0 border border-black/10 shadow-sm" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center shrink-0 shadow-sm">
                      <span className="text-black/60 text-sm font-bold">{userName.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <div className="flex flex-col">
                     <div className="font-bold flex items-center gap-2">
                        {userName} 
                        {authorId && <UserFollowButton userId={authorId} variant="icon" />}
                     </div>
                     <div className={`text-xs ${ottModalTextColor || postitAppearance?.textColor ? 'opacity-70' : 'text-gray-500'}`}>{categoryName} • {createdAt.toLocaleDateString('tr-TR')}</div>
                  </div>
              </div>

              <div className="flex items-center gap-2">
                {link && (
                  <a
                    href={link}
                    target={(link.includes('panodasehir.com') || link.startsWith('/')) ? '_self' : '_blank'}
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center justify-center text-blue-600 hover:text-blue-800 font-medium bg-white/60 w-8 h-8 rounded-full shadow-sm hover:bg-white transition-colors"
                    title="Bağlantıyı Ziyaret Et"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {canDelete && (
                  <Button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    variant="destructive"
                    size="icon"
                    className="flex shrink-0 items-center justify-center rounded-full shadow-sm hover:bg-red-700 transition-colors w-8 h-8"
                    title="Notu Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                {!canDelete && currentUserId && (
                  <Button
                    onClick={handleReport}
                    disabled={isReporting}
                    variant="outline"
                    size="icon"
                    className="flex shrink-0 items-center justify-center rounded-full border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors w-8 h-8 bg-white/80 shadow-sm"
                    title="Şikayet Et"
                  >
                    <Flag className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>

              <div
                className={`mb-3 flex-grow flex flex-col ${
                  displayImages.length === 0 && !link && !isWeather
                    ? 'justify-center items-center text-center' 
                    : 'justify-start'
                } ${isWeather ? 'justify-center items-center h-full' : ''}`}
              >
                {isWeather && weatherUI ? (
                  <div style={{ containerType: 'size' }} className={`flex flex-col w-full h-full justify-start items-center p-2 sm:p-4 text-white relative z-10 ${weatherUI?.bgImage ? 'bg-black/30 rounded-xl backdrop-blur-sm' : ''}`}>
                    <h3 style={{ fontSize: 'clamp(14px, 7cqmin, 26px)' }} className="font-bold text-center tracking-wide mb-3 drop-shadow-md">
                      {content}&apos;{getSuffix(content)} Haftalık<br/>Hava Durumu Tahmini
                    </h3>
                    
                    {weatherDaily && weatherDaily.time && (
                      <div className="grid grid-cols-5 w-full h-full gap-0 sm:gap-1 drop-shadow-md mt-1">
                        {weatherDaily.time.slice(0, 5).map((dateStr: string, index: number) => {
                           const dateObj = new Date(dateStr);
                           const dayNum = dateObj.getDate();
                           const monthName = dateObj.toLocaleDateString('tr-TR', { month: 'long' });
                           const dayName = dateObj.toLocaleDateString('tr-TR', { weekday: 'long' });
                           
                           const min = Math.round(weatherDaily.temperature_2m_min[index]);
                           const max = Math.round(weatherDaily.temperature_2m_max[index]);
                           const code = weatherDaily.weather_code[index];
                           const dayStr = getConditionStr(code);
                           const dIcon = getWeatherUI(dayStr + '_day', postitAppearance?.weatherIconSet, postitAppearance).icon;
                           
                           return (
                             <div key={dateStr} className="flex flex-col items-center justify-start text-center border-r border-white/30 last:border-0 px-1 sm:px-2 w-full h-full tracking-tight">
                               <span style={{ fontSize: 'clamp(15px, 6cqmin, 24px)' }} className="font-bold leading-none">{dayNum}</span>
                               <span style={{ fontSize: 'clamp(9px, 3.5cqmin, 16px)' }} className="font-bold opacity-90 leading-tight mt-1 capitalize">{monthName}</span>
                               <span style={{ fontSize: 'clamp(9px, 3.5cqmin, 16px)' }} className="font-bold opacity-90 leading-tight capitalize">{dayName}</span>
                               
                               <div className="my-2 sm:my-3 scale-[0.4] sm:scale-[0.55] h-8 sm:h-12 flex items-center justify-center shrink-0">
                                  {dIcon}
                               </div>
                               
                               <span style={{ fontSize: 'clamp(8px, 3.2cqmin, 13px)' }} className="font-medium opacity-90 leading-none sm:leading-tight flex-grow flex items-start justify-center mt-1 w-full text-center">
                                  {getConditionDescTR(code)}
                               </span>
                               
                               <div className="mt-auto flex flex-col items-center gap-[2px] w-full pt-2">
                                 <span style={{ fontSize: 'clamp(12px, 5cqmin, 22px)' }} className="font-bold">{max}°C</span>
                                 <span style={{ fontSize: 'clamp(10px, 4cqmin, 16px)' }} className="font-semibold opacity-80 mb-1">{min}°C</span>
                               </div>
                             </div>
                           )
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <p 
                    className={`whitespace-pre-wrap break-words w-full ${fontClasses[postitAppearance?.font || ''] || postitAppearance?.font || fontClasses[font || ''] || fontClasses.HANDWRITING}`}
                    style={{ 
                      color: textColor || postitAppearance?.textColor || 'rgb(31, 41, 55)',
                      fontSize: ({ 'text-xs': '0.75rem', 'text-sm': '0.875rem', 'text-base': '1rem', 'text-lg': '1.125rem', 'text-xl': '1.25rem', 'text-2xl': '1.5rem', 'text-3xl': '1.875rem' } as any)[textSize || postitAppearance?.textSize] || (displayImages.length === 0 && !link ? '1.5rem' : '1rem')
                    }}
                  >
                    {cleanContent}
                  </p>
                )}
              </div>

              {/* Link Preview (Unclickable in front view to trigger modal instead) */}
              {(link && displayImages.length === 0) && (
                <div className="mb-4 overflow-hidden rounded-md border border-gray-300/40 relative z-10 bg-white/50 shadow-sm hover:shadow-md transition-shadow pointer-events-none flex justify-center items-center">
                  {link.match(/\.(jpeg|jpg|gif|png|webp|avif)$/i) ? (
                     <Image src={link} width={600} height={400} style={{ width: '100%', height: 'auto', maxHeight: '300px' }} unoptimized={link.startsWith('data:')} className="object-cover block" alt="Bağlantı Görseli" />
                  ) : (
                    <CustomLinkPreview url={link} compact={isLarge} />
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-400/30 mt-auto text-gray-600" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <div className="flex items-center gap-1.5 w-full">
                    {userImage ? (
                      <Image src={userImage} width={24} height={24} unoptimized={userImage.startsWith('data:')} alt={userName} className="w-5 h-5 md:w-6 md:h-6 rounded-full object-cover shrink-0 border border-black/10" />
                    ) : (
                      <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-black/10 flex items-center justify-center shrink-0">
                        <span className="text-black/60 text-[10px] md:text-xs font-bold leading-none">{userName.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                    <p className="font-semibold text-sm truncate">{userName}</p>
                    {authorId && <UserFollowButton userId={authorId} variant="icon" />}
                  </div>
                  <p className="text-gray-500 text-xs leading-tight">{categoryName}</p>
                </div>

                {!isVirtualNav && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Eye className="w-6 h-6" />
                      <span className="font-medium text-sm font-sans">{viewsCount}</span>
                    </div>

                    <div
                      id={`postit-${id}-like-btn`}
                      onClick={(e) => { e.stopPropagation(); handleLike(e); }}
                      onPointerDown={(e) => e.stopPropagation()}
                      className={`flex items-center gap-1.5 cursor-pointer transition-colors ml-1 ${hasLiked ? 'text-red-500' : 'hover:text-red-500'}`}
                    >
                      <Heart className={`w-6 h-6 ${hasLiked ? 'fill-red-500' : ''}`} />
                      <span className="font-medium text-sm font-sans">{likesCount}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-gray-500 ml-1" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
                      <MessageSquare className="w-6 h-6" />
                      <span className="font-medium text-sm font-sans">{commentsList.length}</span>
                    </div>

                    <div onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
                      <PostitShareButton 
                        postitId={id} 
                        className="hover:text-blue-500 ml-1" 
                        iconClassName="w-6 h-6"
                        initialShareCount={initialSharesCount}
                      />
                    </div>

                    {canDelete && (
                      <div onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
                        <Button
                          onClick={handleDelete}
                          disabled={isDeleting}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-1 hover:bg-red-100 hover:text-red-600"
                        >
                          <Trash2 className="w-6 h-6" />
                        </Button>
                      </div>
                    )}

                    {!canDelete && currentUserId && (
                      <div
                        onClick={(e) => { e.stopPropagation(); handleReport(e); }}
                        onPointerDown={(e) => e.stopPropagation()}
                        className={`flex items-center justify-center w-8 h-8 cursor-pointer text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-md transition-colors ${isReporting ? 'opacity-50' : ''}`}
                        title="Şikayet Et"
                      >
                        <Flag className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                )}
              </div>
              </div> {/* End relative z-10 */}
            </div>
          </motion.div>
        )}
      </DialogTrigger>

      {triggerComponent && (
        <div className="hidden">
          <button id={`postit-${id}-like-btn`} onClick={handleLike}></button>
        </div>
      )}

      <DialogContent 
        className={`${ottCardStyle === 'polaroid' ? (ottModalBgType === 'transparent' ? 'bg-transparent' : 'bg-white rounded-xl border border-gray-100 shadow-2xl') : (isWeather && weatherUI && (!ottModalBgType || ottModalBgType === 'postit') ? weatherUI.bg : ((!ottModalBgType || ottModalBgType === 'postit') ? (colorClasses[color] ?? colorClasses.YELLOW) : 'bg-transparent'))} !left-3 !right-3 !translate-x-0 !w-auto !max-w-none max-h-[95dvh] rounded-2xl md:!left-[50%] md:!right-auto md:!translate-x-[-50%] ${hasMedia ? 'md:!w-[90%] lg:!w-[80%] xl:!w-[75%] md:!max-w-5xl lg:!max-w-6xl xl:!max-w-[70rem]' : 'md:!w-[90%] lg:!w-[80%] md:!max-w-4xl lg:!max-w-3xl'} md:h-auto md:max-h-[85vh] lg:max-h-[80vh] flex flex-col overflow-hidden ${ottCardStyle === 'polaroid' ? '' : 'border-none'} shadow-2xl p-0 gap-0`}
        style={{
          backgroundColor: ottCardStyle === 'polaroid' ? (ottModalBgType === 'transparent' ? 'transparent' : (finalOttModalBgColor || undefined)) : (ottModalBgType === 'transparent' ? 'transparent' : ottModalBgType === 'semi-transparent' ? 'rgba(255, 255, 255, 0.7)' : ottModalBgType === 'color' ? (finalOttModalBgColor || 'transparent') : (ottModalBgType === 'image' || ottModalBgType === 'gradient') ? 'transparent' : undefined),
          backgroundImage: (isWeather && weatherUI?.bgImage && (!ottModalBgType || ottModalBgType === 'postit')) ? `url(${weatherUI.bgImage})` : ((ottModalBgType === 'gradient' && finalOttModalBgColor) ? `linear-gradient(to right, ${finalOttModalBgColor.split(',')[0]}, ${finalOttModalBgColor.split(',')[1] || finalOttModalBgColor.split(',')[0]}, ${finalOttModalBgColor.split(',')[2] || finalOttModalBgColor.split(',')[0]})` : (ottModalBgType === 'image' && ottModalBgImage ? `url(${ottModalBgImage})` : undefined)),
          backgroundSize: (isWeather && weatherUI?.bgImage && (!ottModalBgType || ottModalBgType === 'postit')) ? 'cover' : ((ottModalBgType === 'image' && postitAppearance?.ottModalBgImageSize) ? postitAppearance.ottModalBgImageSize : 'cover'),
          backgroundPosition: (isWeather && weatherUI?.bgImage && (!ottModalBgType || ottModalBgType === 'postit')) ? 'center' : ((ottModalBgType === 'image' && postitAppearance?.ottModalBgImagePosition) ? postitAppearance.ottModalBgImagePosition : 'center'),
          backgroundRepeat: 'no-repeat',
          backdropFilter: (ottModalBgType === 'transparent' || ottModalBgType === 'semi-transparent') ? 'blur(8px)' : 'none'
        }}
      >
        <div className={`flex flex-col ${hasMedia ? 'md:flex-row' : ''} w-full h-auto max-h-[95dvh] md:max-h-[85vh] lg:max-h-[80vh] overflow-x-hidden ${hasMedia ? 'md:overflow-hidden' : 'overflow-y-auto'} custom-scrollbar relative ${isWeather && weatherUI ? weatherUI.text : (ottModalTextColor || postitAppearance?.textColor ? '' : (ottCardStyle === 'polaroid' ? 'text-slate-900' : 'text-gray-800'))} ${(isWeather && weatherUI?.bgImage && (!ottModalBgType || ottModalBgType === 'postit')) ? 'bg-black/30 backdrop-blur-sm' : ''} ${ottCardStyle === 'polaroid' && (!ottModalBgColor && ottModalBgType !== 'transparent' && ottModalBgType !== 'image' && ottModalBgType !== 'gradient' && ottModalBgType !== 'color') ? 'bg-white' : ''}`} style={(!isWeather || !weatherUI) ? { backgroundColor: ottModalBgType === 'image' ? 'rgba(255,255,255,0.7)' : 'transparent', color: ottModalTextColor || postitAppearance?.textColor || undefined } : undefined}>
          {/* Pushpin for the modal too (hide in OTT mode) */}
          {!triggerComponent && (
            <div className={`absolute -top-4 ${hasMedia ? 'left-[30%] lg:left-[35%]' : 'left-1/2 md:left-[35%]'} -translate-x-1/2 z-10 hidden sm:block`}>
              <Image
                src={pushpinImages[pushpin] ?? pushpinImages.RED}
                alt="Pin"
                width={60}
                height={60}
                className="drop-shadow-lg"
              />
            </div>
          )}

          {/* Left Media Column (if any) */}
          {hasMedia && (
            <div className="w-full md:w-[50%] lg:w-[55%] xl:w-[60%] shrink-0 flex flex-col items-center justify-center bg-black/[0.03] dark:bg-white/[0.03] border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10 relative md:h-[85vh] lg:h-[80vh] max-h-[60vh] md:max-h-full overflow-y-auto overflow-x-hidden custom-scrollbar">
              <div className="w-full p-2 sm:p-4 my-auto flex flex-col items-center justify-center gap-4">
            {/* Images: Carousel or Single */}
            {hasMultipleImages ? (
              <div className="w-full px-2">
                <Carousel className="w-full" setApi={setCarouselApi}>
                  <CarouselContent>
                    {displayImages.map((imgUrl, index) => (
                      <CarouselItem key={index}>
                        <div className="relative w-full flex items-center justify-center rounded-xl overflow-hidden bg-transparent mb-1">
                          {imgUrl?.match(/\.(mp4|webm|ogg)$/i) ? (
                              <video
                                src={`${imgUrl}#t=0.1`}
                                className="max-w-full max-h-[45vh] md:max-h-[80vh] lg:max-h-[75vh] w-auto h-auto object-contain block rounded-lg overflow-hidden"
                                preload="metadata"
                                controls
                                playsInline
                              />
                          ) : (
                              <div className="relative max-w-full max-h-[45vh] md:max-h-[80vh] lg:max-h-[75vh] inline-flex items-center justify-center rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity" onClick={() => {
                                if (link) {
                                   if (link.includes('panodasehir.com') || link.startsWith('/')) {
                                      window.location.href = link;
                                   } else {
                                      window.open(link, '_blank', 'noopener,noreferrer');
                                   }
                                } else {
                                   setFullscreenImage(imgUrl);
                                }
                              }}>
                                <img
                                  src={imgUrl}
                                  alt=""
                                  className="max-w-full max-h-[45vh] md:max-h-[80vh] lg:max-h-[75vh] w-auto h-auto object-contain block"
                                  style={{ transform: 'scale(1.03)', willChange: 'transform' }}
                                />
                              </div>
                          )}
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
                <div className="flex justify-center gap-1.5 mt-3 mb-1">
                  {displayImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); carouselApi?.scrollTo(i); }}
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-4 opacity-100' : 'w-1.5 opacity-30'} ${ottModalTextColor || postitAppearance?.textColor ? 'bg-current' : 'bg-gray-800'}`}
                      aria-label={`Slayt ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              mainImage && (
                  <div className="relative w-full flex flex-col items-center justify-center rounded-xl overflow-hidden bg-transparent mb-1">
                    {mainImage?.match(/\.(mp4|webm|ogg)$/i) ? (
                        <video
                          src={`${mainImage}#t=0.1`}
                          className="max-w-full max-h-[45vh] md:max-h-[80vh] lg:max-h-[75vh] w-auto h-auto object-contain block rounded-lg overflow-hidden"
                          preload="metadata"
                          controls
                          playsInline
                        />
                    ) : (
                        <div className="relative max-w-full max-h-[45vh] md:max-h-[80vh] lg:max-h-[75vh] inline-flex items-center justify-center rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity" onClick={() => {
                            if (link) {
                               if (link.includes('panodasehir.com') || link.startsWith('/')) {
                                  window.location.href = link;
                               } else {
                                  window.open(link, '_blank', 'noopener,noreferrer');
                               }
                            } else {
                               setFullscreenImage(mainImage);
                            }
                          }}>
                            <img
                              src={mainImage}
                              alt=""
                              className="max-w-full max-h-[45vh] md:max-h-[80vh] lg:max-h-[75vh] w-auto h-auto object-contain block"
                              style={{ transform: 'scale(1.03)', willChange: 'transform' }}
                            />
                        </div>
                    )}
                </div>
              )
            )}
            {/* Link Preview inside Detail View (Hidden if there are images) */}
            {(link && displayImages.length === 0) && (
              <div className="overflow-hidden rounded-xl border border-gray-300/40 bg-black/5 shadow-inner flex justify-center">
                {link.match(/\.(jpeg|jpg|gif|png|webp|avif|bmp)$/i) ? (
                   <img src={link} style={{ maxHeight: '60vh', maxWidth: '100%', objectFit: 'contain' }} className="block mx-auto rounded-2xl cursor-pointer hover:opacity-90 transition-opacity p-2" alt="Bağlantı Görseli" onClick={() => setFullscreenImage(link)} />
                ) : (
                  <CustomLinkPreview url={link} compact={false} />
                )}
              </div>
            )}
              </div>
            </div>
          )}

          {/* Right Content & Comments Column */}
          <div className={`w-full flex-1 flex flex-col relative z-0 ${hasMedia ? 'md:h-[85vh] lg:h-[80vh] overflow-y-auto overflow-x-hidden custom-scrollbar bg-white/20' : ''}`}>
            <div className={`flex-none flex flex-col p-3 sm:p-4 md:p-6 gap-4 w-full relative z-0 min-h-min ${hasMedia ? 'max-w-2xl mx-0' : 'max-w-3xl mx-auto'}`}>
            {/* Content */}
            {/* Sub-info / Byline */}
            <div className={`flex flex-row items-center gap-3 mb-2 ${ottModalTextColor || postitAppearance?.textColor ? 'opacity-90' : 'text-gray-700'} text-sm`}>
              <div className="flex items-center gap-3">
                  {userImage ? (
                    <Image src={userImage} width={36} height={36} unoptimized={userImage.startsWith('data:')} alt={userName} className="w-9 h-9 rounded-full object-cover shrink-0 border border-black/10 shadow-sm" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center shrink-0 shadow-sm">
                      <span className="text-black/60 text-sm font-bold">{userName.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <div className="flex flex-col">
                     <div className="font-bold flex items-center gap-2">
                        {userName} 
                        {authorId && <UserFollowButton userId={authorId} variant="icon" />}
                     </div>
                     <div className={`text-xs ${ottModalTextColor || postitAppearance?.textColor ? 'opacity-70' : 'text-gray-500'}`}>{categoryName} • {createdAt.toLocaleDateString('tr-TR')}</div>
                  </div>
              </div>

            </div>

            {isWeather && weatherUI ? (
                <div style={{ color: ottModalTextColor || postitAppearance?.textColor || 'white' }} className="flex flex-col items-center justify-start text-center gap-2 sm:gap-6 drop-shadow-2xl sm:py-4 mx-auto w-full relative z-10 flex-grow mb-8">
                   <h3 style={{ fontSize: 'clamp(20px, 3.5vw, 36px)' }} className="font-extrabold text-center tracking-wide mb-3 md:mb-5 drop-shadow-md">
                      {content}&apos;{getSuffix(content)} Haftalık<br/>Hava Durumu Tahmini
                   </h3>

                   <p className="w-full text-center font-medium opacity-90 mb-6 md:mb-10 leading-relaxed px-2 md:px-12 mx-auto drop-shadow-sm" style={{ fontSize: 'clamp(14px, 2vw, 18px)' }}>
                     Şu an {content} genelinde hava {weatherCondition?.toLocaleLowerCase('tr-TR')}, sıcaklık ise {Math.round(weatherTemp ?? 0)}°C seviyelerinde. Önümüzdeki 5 gün boyunca beklenen detaylı hava durumu tahmin tablosu aşağıdadır.
                   </p>
                   
                   {weatherDaily && weatherDaily.time && (
                     <div className="w-full flex flex-col px-0 md:px-4">
                        <div className="grid grid-cols-5 gap-1 md:gap-3 w-full drop-shadow-xl p-2 sm:p-4 bg-black/10 rounded-2xl border border-white/10">
                           {weatherDaily.time.slice(0, 5).map((dateStr: string, index: number) => {
                              const dateObj = new Date(dateStr);
                              const dayNum = dateObj.getDate();
                              const monthName = dateObj.toLocaleDateString('tr-TR', { month: 'long' });
                              const dayName = dateObj.toLocaleDateString('tr-TR', { weekday: 'long' });
                              
                              const min = Math.round(weatherDaily.temperature_2m_min[index]);
                              const max = Math.round(weatherDaily.temperature_2m_max[index]);
                              const code = weatherDaily.weather_code[index];
                              const dayStr = getConditionStr(code);
                              const dIcon = getWeatherUI(dayStr + '_day', postitAppearance?.weatherIconSet, postitAppearance).icon;
                              
                              return (
                                <div key={dateStr} className="flex flex-col items-center justify-start text-center border-r border-current/30 last:border-0 px-1 sm:px-3 h-full tracking-tight">
                                  <span style={{ fontSize: 'clamp(18px, 3vw, 32px)' }} className="font-bold leading-none mb-1">{dayNum}</span>
                                  <span style={{ fontSize: 'clamp(11px, 1.5vw, 18px)' }} className="font-bold opacity-90 leading-tight capitalize">{monthName}</span>
                                  <span style={{ fontSize: 'clamp(11px, 1.5vw, 18px)' }} className="font-bold opacity-90 leading-tight capitalize">{dayName}</span>
                                  
                                  <div className="my-2 sm:my-4 flex items-center justify-center shrink-0 w-full [&>*]:!w-10 [&>*]:!h-10 md:[&>*]:!w-16 md:[&>*]:!h-16 [&>*]:!min-w-0 [&>*]:!min-h-0 [&>*]:!max-w-none [&>*]:!max-h-none [&>span]:!text-[40px] md:[&>span]:!text-[64px]">
                                     {dIcon}
                                  </div>
                                  
                                  <span style={{ fontSize: 'clamp(10px, 1.4vw, 16px)' }} className="font-medium opacity-90 leading-relaxed flex-grow flex items-start justify-center">
                                     {getConditionDescTR(code)}
                                  </span>
                                  
                                  <div className="mt-auto flex flex-col items-center gap-1 w-full pt-4">
                                    <span style={{ fontSize: 'clamp(16px, 2.5vw, 24px)' }} className="font-bold">{max}°C</span>
                                    <span style={{ fontSize: 'clamp(12px, 1.8vw, 18px)' }} className="font-semibold opacity-80">{min}°C</span>
                                  </div>
                                </div>
                              )
                           })}
                        </div>
                     </div>
                   )}
                </div>
            ) : isWeather ? (
              <div className="flex flex-col items-center justify-center text-center gap-4 py-8 bg-black/20 rounded-2xl mx-auto w-full max-w-md text-white mb-8">
                <h3 className="text-3xl font-bold uppercase tracking-wider">{content}</h3>
                <div className="text-7xl font-black">{weatherTemp}°C</div>
                <p className="text-2xl font-medium">{weatherCondition}</p>
              </div>
            ) : (ottCardStyle === 'magazine' || ottCardStyle === 'cover' || ottCardStyle === 'polaroid') ? (
               <div className="flex flex-col mb-4">
                 {cleanContent && (
                   <div className={`whitespace-pre-wrap leading-normal font-medium mt-2 ${postitAppearance?.magazineTextFont === 'london' ? 'font-london' : postitAppearance?.magazineTextFont === 'puerto' ? 'font-puerto' : postitAppearance?.magazineTextFont === 'retosta' ? 'font-retosta' : postitAppearance?.magazineTextFont === 'serif' ? 'font-serif' : postitAppearance?.magazineTextFont === 'handwriting' ? 'font-handwriting' : 'font-sans'}`}
                      style={{ 
                          color: postitAppearance?.magazineTextColor || ottModalTextColor || '#334155',
                          fontSize: ({ 'text-sm': '0.875rem', 'text-base': '1rem', 'text-lg': '1.125rem', 'text-xl': '1.25rem', 'text-2xl': '1.5rem', 'text-3xl': '1.875rem', 'text-4xl': '2.25rem' } as any)[postitAppearance?.ottModalTextSize] || 'clamp(14px, 2vw, 18px)'
                      }}>
                     {cleanContent}
                   </div>
                 )}
                 {detail && (
                   <div className={`${cleanContent ? 'mt-4 pt-4 border-t border-slate-200/50' : 'mt-2'}`} dangerouslySetInnerHTML={{ __html: detail }} />
                 )}
               </div>
            ) : (
              <div className="flex flex-col mb-4">
                {cleanContent && (
                  <div 
                    className={`whitespace-pre-wrap break-words leading-relaxed ${fontClasses[postitAppearance?.ottModalFont || ''] || postitAppearance?.ottModalFont || fontClasses[font || ''] || fontClasses.HANDWRITING}`}
                    style={{ 
                      color: ottModalTextColor || postitAppearance?.textColor || 'rgb(17, 24, 39)',
                      fontSize: ({ 'text-sm': '0.875rem', 'text-base': '1rem', 'text-lg': '1.125rem', 'text-xl': '1.25rem', 'text-2xl': '1.5rem', 'text-3xl': '1.875rem', 'text-4xl': '2.25rem' } as any)[postitAppearance?.ottModalTextSize] || '1.25rem'
                    }}
                  >
                    {cleanContent}
                  </div>
                )}
                
                {detail && (
                  <div 
                    className={`${cleanContent ? 'mt-6 pt-6 border-t border-slate-200/50' : ''}`}
                    style={{ 
                      color: ottModalTextColor || postitAppearance?.textColor || 'rgb(17, 24, 39)'
                    }}
                    dangerouslySetInnerHTML={{ __html: detail }} 
                  />
                )}
              </div>
            )}
             {(link || canDelete || (!canDelete && currentUserId)) && (
               <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-slate-200/50">
                {link && (
                  <a
                    href={link}
                    target={(link.includes('panodasehir.com') || link.startsWith('/')) ? '_self' : '_blank'}
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center justify-center text-blue-600 hover:text-blue-800 font-medium bg-white/60 w-8 h-8 rounded-full shadow-sm hover:bg-white transition-colors"
                    title="Bağlantıyı Ziyaret Et"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {canDelete && (
                  <Button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    variant="destructive"
                    size="icon"
                    className="flex shrink-0 items-center justify-center rounded-full shadow-sm hover:bg-red-700 transition-colors w-8 h-8"
                    title="Notu Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                {!canDelete && currentUserId && (
                  <Button
                    onClick={handleReport}
                    disabled={isReporting}
                    variant="outline"
                    size="icon"
                    className="flex shrink-0 items-center justify-center rounded-full border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors w-8 h-8 bg-white/80 shadow-sm"
                    title="Şikayet Et"
                  >
                    <Flag className="w-3 h-3" />
                  </Button>
                )}
              </div>
            )}

            {/* End Content Inner */}
            </div>
            
            {/* Comments Section (Bottom Column) */}
            <div id="comments-section" className={`w-full shrink-0 flex flex-col mt-auto ${commentsList.length > 0 ? 'p-3 sm:p-4 md:p-6' : 'px-3 sm:px-4 md:px-6 py-3 sm:py-4'} ${ottModalTextColor || postitAppearance?.textColor ? 'bg-black/[0.12] shadow-[inset_0_1px_15px_rgba(0,0,0,0.15)] border-t border-white/10' : 'bg-black/[0.04] shadow-[inset_0_2px_15px_-5px_rgba(0,0,0,0.05)] border-t border-black/10'}`}>
              <div className={`w-full flex flex-col ${hasMedia ? 'max-w-2xl mx-0' : 'max-w-3xl mx-auto'}`}>
            {commentsList.length > 0 && (
              <div className="flex-none flex flex-col gap-5 mb-6">
                  {commentsList.map((comment: any) => (
                    <div key={comment.id} className="bg-white/40 p-3 rounded-lg flex flex-col gap-1 shadow-sm font-sans">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs uppercase overflow-hidden shrink-0">
                            {comment.user?.image ? (
                              <Image src={comment.user.image} alt={comment.user.name || ''} width={24} height={24} className="object-cover w-full h-full" />
                            ) : (
                              (comment.user?.nickname || comment.user?.name || 'A')[0]
                            )}
                          </div>
                          <span className={`font-bold text-sm ${ottModalTextColor || postitAppearance?.textColor ? '' : 'text-gray-800'}`}>{comment.user?.nickname || comment.user?.name || 'Anonim'}</span>
                          <span className={`text-xs ${ottModalTextColor || postitAppearance?.textColor ? 'opacity-70' : 'text-gray-500'}`}>{new Date(comment.createdAt).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => {
                              if (!currentUserId) {
                                toast.error('Beğenmek için giriş yapmalısınız');
                                return;
                              }
                              setCommentsList(prev => prev.map((c: any) => {
                                if (c.id === comment.id) {
                                  const hasLiked = c.likes?.length > 0;
                                  return {
                                    ...c,
                                    _count: { ...c._count, likes: hasLiked ? Math.max(0, (c._count?.likes || 0) - 1) : (c._count?.likes || 0) + 1 },
                                    likes: hasLiked ? [] : [{ userId: currentUserId }]
                                  }
                                }
                                return c;
                              }));
                              fetch(`/api/comments/${comment.id}/like`, { method: 'POST' }).catch(() => toast.error('İşlem başarısız'));
                            }}
                            className={`flex items-center gap-1 transition-colors p-1 ${comment.likes?.length > 0 ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                            title="Yorumu beğen"
                          >
                            <Heart className={`w-3.5 h-3.5 ${comment.likes?.length > 0 ? 'fill-red-500' : ''}`} />
                            {(comment._count?.likes || 0) > 0 && <span className="text-xs">{comment._count.likes}</span>}
                          </button>
                          {(currentUserId === comment?.user?.id || canDelete) && (
                            <button 
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-red-400 hover:text-red-600 transition-colors p-1 flex items-center gap-1"
                              title="Yorumu sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className={`mt-1 text-sm md:ml-8 whitespace-pre-wrap ${ottModalTextColor || postitAppearance?.textColor ? '' : 'text-gray-700'}`}>{comment.content}</p>
                    </div>
                  ))}
              </div>
            )}
              
              <div className={`w-full relative z-10 mt-1`}>
                <form onSubmit={handleAddComment} className={`flex items-center gap-2 p-1.5 md:p-2 rounded-full transition-all duration-300 ${ottModalTextColor || postitAppearance?.textColor ? 'bg-white/10 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.25)] focus-within:bg-white/15 focus-within:border-indigo-400/60 focus-within:shadow-[0_0_25px_rgba(99,102,241,0.4)]' : 'bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12),0_4px_10px_rgba(0,0,0,0.06)] border border-gray-300/80 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100/50 pb-1.5 pt-1.5 md:pb-2 md:pt-2'} `}>
                  <div className="flex-1 px-4 md:px-5">
                    <Input 
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={currentUserId ? "Düşüncelerini buraya yaz..." : "Yorum yapmak için giriş yapın"}
                      disabled={!currentUserId || isSubmittingComment}
                      className={`bg-transparent border-none shadow-none focus-visible:ring-0 px-0 text-[16px] md:text-base !ring-0 !outline-none ${ottModalTextColor || postitAppearance?.textColor ? 'text-white placeholder:text-white/60' : 'text-gray-900 placeholder:text-gray-400'}`}
                      autoComplete="off"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    size="icon"
                    disabled={!currentUserId || !newComment.trim() || isSubmittingComment}
                    className={`shrink-0 rounded-full w-10 h-10 md:w-11 md:h-11 transition-all duration-300 ease-out border-0 ${(!currentUserId || !newComment.trim()) ? (ottModalTextColor || postitAppearance?.textColor ? 'bg-white/5 text-white/30 hover:bg-white/5 cursor-not-allowed' : 'bg-gray-100 text-gray-400 hover:bg-gray-100 cursor-not-allowed') : (ottModalTextColor || postitAppearance?.textColor ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] hover:shadow-[0_0_25px_rgba(99,102,241,0.7)] hover:scale-105 active:scale-95' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-[0_5px_15px_rgba(79,70,229,0.4)] hover:scale-105 active:scale-95')}`}
                    title="Gönder"
                  >
                    <Send className={`w-4 h-4 md:w-5 md:h-5 ${newComment.trim() ? 'ml-0.5' : ''}`} />
                  </Button>
                </form>
              </div>
              </div>
            </div>
          </div>
          </div>

        {/* Fullscreen Image Lightbox uses its own Dialog to bypass CSS transforms and trap issues */}
        {fullscreenImage && (
          <DialogPrimitive.Root open={!!fullscreenImage} onOpenChange={(open) => { if (!open) setFullscreenImage(null) }}>
            <DialogPrimitive.Portal>
              <DialogPrimitive.Overlay className="fixed inset-0 z-[100000] bg-black/95 backdrop-blur-md" />
              <DialogPrimitive.Content 
                className="fixed inset-0 z-[100001] w-full h-full flex items-center justify-center p-0 outline-none border-none"
                aria-describedby="fullscreen-image-description"
                aria-label="Tam Ekran Resim Görüntüleyici"
              >
                <div id="fullscreen-image-description" className="sr-only">Tam ekran resim görüntüleyici</div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setFullscreenImage(null); }}
                  className="absolute top-4 right-4 md:top-8 md:right-8 text-white hover:text-gray-300 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all z-[100002] focus:outline-none"
                  aria-label="Kapat"
                >
                  <X className="w-8 h-8" />
                </button>
                <div className="w-screen h-[100dvh] flex items-center justify-center overflow-hidden" onClick={(e) => e.stopPropagation()}>
                  <TransformWrapper
                    initialScale={1}
                    minScale={1}
                    maxScale={4}
                    wheel={{ step: 0.1 }}
                    pinch={{ step: 5 }}
                  >
                    <TransformComponent wrapperClass="!w-screen !h-[100dvh]" contentClass="!w-screen !h-[100dvh] flex items-center justify-center">
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative max-w-[100vw] max-h-[100dvh] inline-flex items-center justify-center cursor-grab active:cursor-grabbing rounded-[8px] overflow-hidden border-none outline-none ring-0 shadow-none m-0 p-0"
                      >
                        <img 
                          src={fullscreenImage}
                          alt="Fullscreen Preview"
                          className="max-w-[100vw] max-h-[100dvh] object-contain block pointer-events-none"
                          style={{ transform: 'scale(1.03)', willChange: 'transform' }}
                        />
                      </motion.div>
                    </TransformComponent>
                  </TransformWrapper>
                </div>
              </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
          </DialogPrimitive.Root>
        )}

      </DialogContent>
    </Dialog>

  )
}
