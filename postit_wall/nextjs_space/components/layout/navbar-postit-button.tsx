'use client'

import { useState, useEffect } from 'react'
import { PostItForm } from '@/components/forms/postit-form'

interface NavbarPostItButtonProps {
    userGroupId?: string | null
    userRole?: string | null
    defaultCategoryId?: string
}

export function NavbarPostItButton({ userGroupId, userRole, defaultCategoryId }: NavbarPostItButtonProps) {
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

                    // Filter out root categories
                    const rootCategories = (data.categories || []).filter((c: any) => c.parentId === null)
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
            userGroupId={userGroupId}
            userRole={userRole}
            defaultCategoryId={defaultCategoryId}
        />
    )
}
