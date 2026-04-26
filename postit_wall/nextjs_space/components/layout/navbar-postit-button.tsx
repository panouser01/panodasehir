'use client'

import { useState, useEffect } from 'react'
import { PostItForm } from '@/components/forms/postit-form'

interface NavbarPostItButtonProps {
    userGroupIds?: string[]
    userRole?: string | null
    defaultCategoryId?: string
}

export function NavbarPostItButton({ userGroupIds, userRole, defaultCategoryId }: NavbarPostItButtonProps) {
    const [categories, setCategories] = useState<any[]>([])

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/categories')
                if (res.ok) {
                    const data = await res.json()

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

                    // Filter active and non-expired categories recursively
                    const filterActive = (cats: any[]): any[] => {
                        const now = new Date();
                        return cats.filter((c: any) => {
                          const isExpired = c.expirationDate && new Date(c.expirationDate) < now;
                          return c.isActive !== false && !isExpired;
                        }).map((c: any) => ({
                          ...c,
                          children: c.children ? filterActive(c.children) : []
                        }));
                    };

                    const activeCategories = filterActive(data.categories || [])
                    // Filter out root categories
                    const rootCategories = activeCategories.filter((c: any) => c.parentId === null)
                    setCategories(flattenCategories(rootCategories))
                }
            } catch (e) {
                console.error('Kategoriler alınırken hata oluştu', e)
            }
        }

        fetchCategories()
    }, [])

    return (
        <PostItForm
            categories={categories}
            userGroupIds={userGroupIds}
            userRole={userRole}
            defaultCategoryId={defaultCategoryId}
        />
    )
}
