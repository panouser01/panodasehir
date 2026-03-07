'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface Category {
  id: string
  name: string
  postCount: number
  children?: Category[]
}

interface CategoryFilterProps {
  categories: Category[]
  onSelect?: () => void
  settings?: any
}

export function CategoryFilter({ categories, onSelect, settings }: CategoryFilterProps) {
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
    if (onSelect) {
      onSelect()
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
    const childSelected = isAnyChildSelected(category)
    const totalCount = getCategoryTotal(category)

    // Auto-expand if a child is selected
    if (childSelected && !isExpanded && !expandedCategories.has(category.id)) {
      setExpandedCategories(prev => new Set([...prev, category.id]))
    }

    const isMainCategoryBold = level === 0 && settings?.navMenuMainBold

    return (
      <div key={category.id}>
        <div className="flex items-center">
          {hasChildren && (
            <button
              onClick={(e) => toggleExpand(category.id, e)}
              className="p-1 hover:bg-black/5 rounded mr-1 transition-colors"
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
            className={`flex-1 justify-start ${!isSelected && settings?.navMenuTextColor ? 'hover:opacity-80' : ''} ${level > 0 ? 'text-sm' : ''} ${isMainCategoryBold ? 'font-bold' : ''}`}
            onClick={() => handleCategoryChange(category.id)}
            style={{
              fontFamily: isSelected ? undefined : (settings?.navMenuFont || undefined),
              color: isSelected ? undefined : (settings?.navMenuTextColor || undefined),
              fontSize: settings?.navMenuFontSize ? `${settings.navMenuFontSize}px` : undefined
            }}
          >
            {category.name}
            <span
              className="ml-auto text-[10px] text-muted-foreground bg-black/5 px-2 py-0.5 rounded-full inline-block min-w-[20px] text-center"
              style={{ color: isSelected ? undefined : (settings?.navMenuTextColor ? `${settings.navMenuTextColor}99` : undefined) }}
            >
              {totalCount}
            </span>
          </Button>
        </div>

        {hasChildren && isExpanded && (
          <div className={`ml-${level === 0 ? '4' : '6'} mt-1 space-y-1 border-l border-gray-200/50 pl-2`}>
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
    <div className="space-y-2" style={{
      fontFamily: settings?.navMenuFont || 'inherit',
      fontSize: settings?.navMenuFontSize ? `${settings.navMenuFontSize}px` : 'inherit'
    }}>
      <h3 className="font-semibold text-lg mb-4" style={{
        color: settings?.navMenuTextColor || 'inherit',
        fontSize: settings?.navMenuFontSize ? `${Math.max(14, settings.navMenuFontSize + 4)}px` : 'inherit'
      }}>
        Kategoriler
      </h3>
      <Button
        variant={selectedCategory === null ? 'default' : 'ghost'}
        size="sm"
        className={`w-full justify-start ${settings?.navMenuMainBold ? 'font-bold' : ''}`}
        onClick={() => handleCategoryChange(null)}
        style={{
          color: selectedCategory === null ? undefined : (settings?.navMenuTextColor || 'inherit'),
          fontSize: settings?.navMenuFontSize ? `${settings.navMenuFontSize}px` : undefined
        }}
      >
        Tüm Kategoriler
        <span
          className="ml-auto text-[10px] text-muted-foreground bg-black/5 px-2 py-0.5 rounded-full inline-block min-w-[20px] text-center"
          style={{ color: selectedCategory === null ? undefined : (settings?.navMenuTextColor ? `${settings.navMenuTextColor}99` : undefined) }}
        >
          {totalPostits}
        </span>
      </Button>
      {categories?.filter(c => c.name !== 'Ana Duvar').map?.((category) => renderCategory(category))}
    </div>
  )
}
