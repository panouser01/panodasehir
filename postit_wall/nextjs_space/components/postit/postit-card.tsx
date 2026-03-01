'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { ExternalLink, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

interface PostItCardProps {
  id: string
  content: string
  imageUrl?: string | null
  images?: string[]
  link?: string | null
  color: string
  font?: string
  pushpin?: string
  rotation: number
  userName: string
  categoryName: string
  createdAt: Date
  canDelete?: boolean
  onDelete?: (id: string) => void
}

const colorClasses: { [key: string]: string } = {
  YELLOW: 'bg-yellow-200 shadow-yellow-300/50',
  PINK: 'bg-pink-200 shadow-pink-300/50',
  BLUE: 'bg-blue-200 shadow-blue-300/50',
  GREEN: 'bg-green-200 shadow-green-300/50',
  ORANGE: 'bg-orange-200 shadow-orange-300/50',
  PURPLE: 'bg-purple-200 shadow-purple-300/50',
}

const fontClasses: { [key: string]: string } = {
  HANDWRITING: 'font-handwriting',
  SERIF: 'font-serif',
  SANS: 'font-sans',
  MONO: 'font-mono',
  CURSIVE: 'font-cursive',
}

const pushpinImages: { [key: string]: string } = {
  RED: '/pushpins/red.png',
  BLUE: '/pushpins/blue.png',
  GOLD: '/pushpins/gold.png',
  GREEN: '/pushpins/green.png',
  PINK: '/pushpins/pink.png',
  SILVER: '/pushpins/silver.png',
}

export function PostItCard({
  id,
  content,
  imageUrl,
  images = [],
  link,
  color,
  font = 'HANDWRITING',
  pushpin = 'RED',
  rotation,
  userName,
  categoryName,
  createdAt,
  canDelete,
  onDelete,
}: PostItCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [transitionEffect, setTransitionEffect] = useState<'flip-left' | 'flip-right' | 'fade'>('flip-left')

  const effects: ('flip-left' | 'flip-right' | 'fade')[] = ['flip-left', 'flip-right', 'fade']

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

  // Use provided images array, or fallback to imageUrl if array is empty but imageUrl exists
  const displayImages = images && images.length > 0 ? images : (imageUrl ? [imageUrl] : [])
  const hasMultipleImages = displayImages.length > 1

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
    <Dialog>
      <DialogTrigger asChild>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
          style={{ rotate: `${rotation}deg` }}
          className="relative cursor-pointer"
        >
          {/* Pushpin */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
            <Image
              src={pushpinImages[pushpin] ?? pushpinImages.RED}
              alt="Pin"
              width={40}
              height={40}
              className="drop-shadow-md"
            />
          </div>

          {/* Post-it Card */}
          <div
            className={`${colorClasses[color] ?? colorClasses.YELLOW
              } p-6 pt-8 rounded-sm shadow-lg hover:shadow-xl transition-shadow duration-200 min-h-[200px] max-w-[280px] h-full flex flex-col`}
          >
            {/* Image Thumbnail (Automatic Slider if multiple) */}
            {displayImages.length > 0 && (
              <div
                className="relative w-full aspect-video mb-4 rounded bg-gray-100 overflow-hidden shadow-inner"
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
                    style={{ ...motionProps.style, backfaceVisibility: 'hidden' }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={displayImages[currentImageIndex]}
                      alt={`Post-it image ${currentImageIndex + 1}`}
                      fill
                      className="object-cover"
                    />
                  </motion.div>
                </AnimatePresence>
                {hasMultipleImages && (
                  <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full z-10 font-sans backdrop-blur-sm border border-white/20">
                    {currentImageIndex + 1} / {displayImages.length}
                  </div>
                )}
              </div>
            )}

            {/* Content */}
            <p className={`text-gray-800 text-lg mb-4 whitespace-pre-wrap break-words flex-grow ${fontClasses[font] ?? fontClasses.HANDWRITING}`}>
              {content}
            </p>

            {/* Link */}
            {link && (
              <div onClick={(e) => e.stopPropagation()}>
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm mb-3 underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span className="break-all">Link</span>
                </a>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-400/30 text-xs text-gray-600 mt-auto">
              <div>
                <p className="font-semibold">{userName}</p>
                <p className="text-gray-500">{categoryName}</p>
              </div>
              {canDelete && (
                <div onClick={(e) => e.stopPropagation()}>
                  <Button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </DialogTrigger>

      <DialogContent className={`${colorClasses[color] ?? colorClasses.YELLOW} max-w-3xl max-h-[90vh] overflow-y-auto border-none shadow-2xl p-0 gap-0`}>
        <div className="p-8 sm:p-12 relative">

          {/* Pushpin for the modal too */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 hidden sm:block">
            <Image
              src={pushpinImages[pushpin] ?? pushpinImages.RED}
              alt="Pin"
              width={60}
              height={60}
              className="drop-shadow-lg"
            />
          </div>

          <div className="flex flex-col gap-6">
            {/* Images: Carousel or Single */}
            {hasMultipleImages ? (
              <div className="w-full px-8">
                <Carousel className="w-full">
                  <CarouselContent>
                    {displayImages.map((imgUrl, index) => (
                      <CarouselItem key={index}>
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-sm bg-black/5">
                          <Image
                            src={imgUrl}
                            alt={`Post-it image ${index + 1}`}
                            fill
                            className="object-contain"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="-left-4 bg-white/50 hover:bg-white" />
                  <CarouselNext className="-right-4 bg-white/50 hover:bg-white" />
                </Carousel>
              </div>
            ) : (
              mainImage && (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-sm bg-black/5">
                  <Image
                    src={mainImage}
                    alt="Post-it image"
                    fill
                    className="object-contain"
                  />
                </div>
              )
            )}

            {/* Content */}
            <div className={`text-gray-900 text-xl sm:text-2xl whitespace-pre-wrap break-words leading-relaxed ${fontClasses[font] ?? fontClasses.HANDWRITING}`}>
              {content}
            </div>

            {/* Sub-info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pt-6 border-t border-black/10 text-sm text-gray-700 mt-4">
              <div className="flex flex-col gap-1">
                <div className="font-bold text-lg">{userName}</div>
                <div className="opacity-80">{categoryName} • {createdAt.toLocaleDateString('tr-TR')}</div>
              </div>

              {link && (
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-medium bg-white/50 px-4 py-2 rounded-full hover:bg-white/80 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Bağlantıyı Ziyaret Et</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
