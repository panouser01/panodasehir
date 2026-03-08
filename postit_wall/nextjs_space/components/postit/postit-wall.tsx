'use client'

import { PostItCard } from './postit-card'
import { useState, useEffect, useMemo } from 'react'
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
}

interface PostItWallProps {
  initialPostits: PostIt[]
  canDelete?: boolean
  currentUserId?: string
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

export function PostItWall({ initialPostits, canDelete, currentUserId }: PostItWallProps) {
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

  // Randomized order for a scattered look, only on client to avoid hydration mismatch
  const scatteredPostits = useMemo(() => {
    if (!isMounted) return filteredPostits;
    return [...filteredPostits].sort(() => Math.random() - 0.5);
  }, [postits, searchQuery, isMounted]); // Re-shuffle when data, search or mounting changes

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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 grid-flow-dense gap-4 p-4 md:p-8 items-start">
      {scatteredPostits?.map?.((postit) => {
        const hasImages = (postit.PostItImage && postit.PostItImage.length > 0) || !!postit.imageUrl;
        return (
          <div key={postit.id} className={hasImages ? "sm:col-span-2 lg:col-span-3" : ""}>
            <PostItCard
              id={postit.id}
              content={postit.content}
              imageUrl={postit.imageUrl}
              images={postit.PostItImage?.map(img => img.url) || []}
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
              currentUserId={currentUserId}
              isLarge={hasImages}
            />
          </div>
        )
      })}
    </div>
  )
}
