'use client'

import { PostItCard } from './postit-card'
import { useState, useEffect } from 'react'
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
}

interface PostItWallProps {
  initialPostits: PostIt[]
  canDelete?: boolean
  currentUserId?: string
}

export function PostItWall({ initialPostits, canDelete, currentUserId }: PostItWallProps) {
  const [postits, setPostits] = useState(initialPostits)

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

  if (postits?.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-center">
        <div>
          <p className="text-xl text-gray-500">Henüz hiç post-it yok</p>
          <p className="text-sm text-gray-400 mt-2">İlk post-it'i siz oluşturun!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-8">
      {postits?.map?.((postit) => (
        <PostItCard
          key={postit.id}
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
        />
      ))}
    </div>
  )
}
