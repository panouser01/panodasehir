'use client'

import { PostItCard } from './postit-card'
import React, { useState, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'

interface PostIt {
  id: string
  content: string
  imageUrl?: string | null
  link?: string | null
  color: string
  font?: string
  pushpin?: string
  rotation: number
  user: {
    id: string
    name?: string | null
    email?: string | null
  }
  category: {
    id: string
    name: string
  }
  createdAt: Date | string
  PostItImage?: { url: string }[]
  likesCount?: number
  hasLiked?: boolean
  views?: number
}

interface PostItWallProps {
  initialPostits: PostIt[]
  canDelete?: boolean
  currentUserId?: string
  separatorAds?: any[]
}

import { useSearchParams } from 'next/navigation'

// Levenshtein distance based string similarity (Returns 0.0 to 1.0)
function stringSimilarity(s1: string, s2: string): number {
  if (!s1 || !s2) return 0;

  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  if (s1 === s2) return 1.0;

  // If one contains the other, we can consider that a good match as well
  if (s1.includes(s2) || s2.includes(s1)) return 1.0;

  const costs: number[] = new Array();
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) costs[j] = j;
      else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  const distance = costs[s2.length];
  const maxLen = Math.max(s1.length, s2.length);
  return (maxLen - distance) / parseFloat(maxLen.toString());
}

export function PostItWall({ initialPostits, canDelete, currentUserId, separatorAds = [] }: PostItWallProps) {
  const [postits, setPostits] = useState<PostIt[]>(initialPostits)
  const [isMounted, setIsMounted] = useState(false)
  const searchParams = useSearchParams()
  const searchQuery = searchParams?.get('q') || ''

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Update postits when initialPostits changes (e.g., category filter)
  useEffect(() => {
    setPostits(initialPostits)
  }, [initialPostits])

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/postits/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Silme işlemi başarısız')
      }

      setPostits(prev => prev.filter(p => p.id !== id))
      toast.success('Post-it silindi')
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Silme işlemi başarısız oldu')
      throw error
    }
  }

  // Filter based on search query (exact substring match or >= 60% similarity)
  const filteredPostits = postits.filter(postit => {
    if (!searchQuery) return true;
    const content = postit.content || '';
    const name = postit.user?.name || '';

    // Quick exact substring match check
    const lowerQuery = searchQuery.toLowerCase();
    const lowerContent = content.toLowerCase();
    const lowerName = name.toLowerCase();

    if (lowerContent.includes(lowerQuery) || lowerName.includes(lowerQuery)) {
      return true;
    }

    // Checking word by word for 60% similarity inside the content
    const words = lowerContent.split(/\s+/);
    for (const word of words) {
      if (stringSimilarity(word, lowerQuery) >= 0.60) {
        return true;
      }
    }

    return false;
  })

  // Fisher-Yates Shuffle
  const shuffle = (array: any[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Randomized post-its for a "scattered" wall feel
  const scatteredPostits = useMemo(() => {
    if (!isMounted) return filteredPostits;
    return shuffle(filteredPostits);
  }, [postits, searchQuery, isMounted]);

  if (filteredPostits?.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-center">
        <div>
          <p className="text-xl text-gray-500">Henüz hiç post-it yok</p>
          <p className="text-sm text-gray-400 mt-2">{searchQuery ? 'Aramanızla eşleşen post-it bulunamadı' : 'İlk post-it\'i siz oluşturun!'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 grid-flow-dense gap-6 p-4 md:p-8 items-start">
      {scatteredPostits?.map?.((postit, index) => {
        const hasImages = (postit.PostItImage && postit.PostItImage.length > 0) || !!postit.imageUrl;
        const isLongText = postit.content?.length > 150;

        // Dynamic spans to fill layout gaps efficiently
        let spanClass = "";
        if (hasImages && isLongText) {
          spanClass = "sm:col-span-2 sm:row-span-2 lg:col-span-3";
        } else if (hasImages) {
          spanClass = "sm:col-span-2 lg:col-span-2";
        } else if (isLongText) {
          spanClass = "sm:col-span-1 sm:row-span-2 lg:col-span-2";
        }

        const shouldRenderAd = separatorAds && separatorAds.length > 0 && index > 0 && index % 12 === 0;
        const ad = shouldRenderAd ? separatorAds[(Math.floor(index / 12) - 1) % separatorAds.length] : null;

        return (
          <React.Fragment key={postit.id}>
            {shouldRenderAd && ad && (
              <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-5 w-full flex justify-center py-4 my-2 order-none">
                <a href={ad.link} target="_blank" rel="noopener noreferrer" className="relative block w-full bg-white border border-gray-200 p-1 shadow-sm rounded-md transition-transform hover:scale-[1.01]">
                  <span className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded shadow z-10">Sponsorlu</span>
                  <img src={ad.imageUrl} alt="Sponsor" className="w-full max-h-[120px] md:max-h-[180px] object-cover rounded" />
                </a>
              </div>
            )}
            <div className={spanClass}>
              <PostItCard
                id={postit.id}
                content={postit.content}
                imageUrl={postit.imageUrl}
                images={postit.PostItImage?.map((img: any) => img.url) || []}
                link={postit.link}
                color={postit.color}
                font={postit.font}
                pushpin={postit.pushpin}
                rotation={postit.rotation}
                userName={postit?.user?.name ?? 'Anonim'}
                categoryName={postit?.category?.name ?? 'Genel'}
                createdAt={postit.createdAt instanceof Date ? postit.createdAt : new Date(postit.createdAt)}
                canDelete={canDelete ?? false}
                onDelete={handleDelete}
                initialLikesCount={postit.likesCount ?? 0}
                initialHasLiked={postit.hasLiked ?? false}
                initialViewsCount={postit.views ?? 0}
                currentUserId={currentUserId}
                isLarge={hasImages || isLongText}
              />
            </div>
          </React.Fragment>
        )
      })}
    </div>
  )
}
