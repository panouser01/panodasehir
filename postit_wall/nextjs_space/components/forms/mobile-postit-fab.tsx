'use client'

import { useSession } from 'next-auth/react'
import { PostItForm } from '@/components/forms/postit-form'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export function MobilePostItFab() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    let mounted = true
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (mounted && data.categories) {
           const flattenCategories = (cats: any[], depth: number = 0): any[] => {
              const result: any[] = []
              for (const cat of cats) {
                  result.push({ ...cat, depth })
                  if (cat.children?.length > 0) {
                      result.push(...flattenCategories(cat.children, depth + 1))
                  }
              }
              return result
          }
          const rootCategories = data.categories.filter((c: any) => c.parentId === null)
          setCategories(flattenCategories(rootCategories))
        }
      })
      .catch(e => console.error(e))
    return () => { mounted = false }
  }, [])

  const userRole = (session?.user as any)?.role;
  const userGroupIds = (session?.user as any)?.userGroupIds || [];
  const selectedCatId = searchParams?.get('category');
  
  let canShow = true;
  if (!session) {
    canShow = false;
  } else if (userRole !== 'SUPER_ADMIN' && selectedCatId && categories.length > 0) {
    const selectedCat = categories.find(c => c.id === selectedCatId);
    if (selectedCat && selectedCat.userGroupId) {
      if (!userGroupIds.includes(selectedCat.userGroupId)) {
        canShow = false;
      }
    }
  }

  if (!canShow) return null

  return (
    <div className="sm:hidden block z-50">
      <PostItForm
        categories={categories}
        userGroupIds={(session?.user as any)?.userGroupIds}
        userRole={(session?.user as any)?.role}
        defaultCategoryId={searchParams?.get('category') || undefined}
        isMobileFab={true}
      />
    </div>
  )
}
