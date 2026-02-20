'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface Category {
  id: string
  name: string
  categoryFont?: string | null
  categoryColor?: string | null
  categoryBgColor?: string | null
  postCount: number
  children?: Category[]
}

interface CategoryFilterProps {
  categories: Category[]
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedCategory = searchParams?.get?.('category') ?? null
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  const handleCategoryChange = (categoryId: string | null) => {
    if (categoryId) {
      router.push(`/?category=${categoryId}`)
    } else {
      router.push('/')
    }
  }

  const toggleExpand = (categoryId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const isAnyChildSelected = (category: Category): boolean => {
    if (!category.children?.length) return false
    for (const child of category.children) {
      if (child.id === selectedCategory) return true
      if (isAnyChildSelected(child)) return true
    }
    return false
  }

  const getCategoryTotal = (cat: Category): number => {
    let total = cat.postCount || 0
    if (cat.children) {
      for (const child of cat.children) {
        total += getCategoryTotal(child)
      }
    }
    return total
  }

  const renderCategory = (category: Category, level: number = 0) => {
    const isSelected = selectedCategory === category.id
    const hasChildren = category.children && category.children.length > 0
    const isExpanded = expandedCategories.has(category.id)
    const hasCustomStyle = category.categoryFont || category.categoryColor || category.categoryBgColor
    const childSelected = isAnyChildSelected(category)
    const totalCount = getCategoryTotal(category)

    // Auto-expand if a child is selected
    if (childSelected && !isExpanded && !expandedCategories.has(category.id)) {
      setExpandedCategories(prev => new Set([...prev, category.id]))
    }

    return (
      <div key={category.id}>
        <div className="flex items-center">
          {hasChildren && (
            <button
              onClick={(e) => toggleExpand(category.id, e)}
              className="p-1 hover:bg-gray-100 rounded mr-1"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>
          )}
          {!hasChildren && level > 0 && (
            <span className="w-6" />
          )}
          <Button
            variant={isSelected ? 'default' : 'ghost'}
            size="sm"
            className={`flex-1 justify-start ${!isSelected && hasCustomStyle ? 'hover:opacity-80' : ''} ${level > 0 ? 'text-sm' : ''}`}
            onClick={() => handleCategoryChange(category.id)}
            style={!isSelected && hasCustomStyle ? {
              fontFamily: category.categoryFont || undefined,
              color: category.categoryColor || undefined,
              backgroundColor: category.categoryBgColor || undefined
            } : undefined}
          >
            {category.name}
            <span className="ml-auto text-xs text-muted-foreground bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full inline-block min-w-[20px] text-center">
              {totalCount}
            </span>
          </Button>
        </div>

        {hasChildren && isExpanded && (
          <div className={`ml-${level === 0 ? '4' : '6'} mt-1 space-y-1 border-l-2 border-gray-200 pl-2`}>
            {category.children!.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  const calculateTotalPostits = (cats: Category[]): number => {
    let total = 0
    for (const cat of cats) {
      total += (cat.postCount || 0)
      if (cat.children && cat.children.length > 0) {
        total += calculateTotalPostits(cat.children)
      }
    }
    return total
  }

  const totalPostits = calculateTotalPostits(categories)

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-lg mb-4">Kategoriler</h3>
      <Button
        variant={selectedCategory === null ? 'default' : 'ghost'}
        size="sm"
        className="w-full justify-start"
        onClick={() => handleCategoryChange(null)}
      >
        Tüm Kategoriler
        <span className="ml-auto text-xs text-muted-foreground bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full inline-block min-w-[20px] text-center">
          {totalPostits}
        </span>
      </Button>
      {categories?.map?.((category) => renderCategory(category))}
    </div>
  )
}
