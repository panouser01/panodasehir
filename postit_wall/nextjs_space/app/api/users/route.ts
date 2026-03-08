import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import * as bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

// GET all users (Super Admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    const userRole = (session?.user as any)?.role
    const userId = (session?.user as any)?.id

    if (userRole !== 'SUPER_ADMIN' && userRole !== 'WALL_MANAGER') {
      return NextResponse.json(
        { error: 'Bu işlemi yapmaya yetkiniz yok' },
        { status: 403 }
      )
    }

    let userFilter = {}
    if (userRole === 'WALL_MANAGER') {
      // Find what they manage
      const allCategories = await prisma.category.findMany({
        select: { id: true, parentId: true, wallManagers: { select: { id: true } }, userGroupId: true }
      })
      const managedCats = new Set<string>()
      const allowedGroupIds = new Set<string>()

      allCategories.forEach(cat => {
        if (cat.wallManagers?.some(m => m.id === userId)) {
          managedCats.add(cat.id)
          if (cat.userGroupId) allowedGroupIds.add(cat.userGroupId)
        }
      })

      let added = true
      while (added) {
        added = false
        allCategories.forEach(cat => {
          if (cat.parentId && managedCats.has(cat.parentId) && !managedCats.has(cat.id)) {
            managedCats.add(cat.id)
            if (cat.userGroupId) allowedGroupIds.add(cat.userGroupId)
            added = true
          }
        })
      }

      // We should only show users that have these allowedGroupIds or posted in their governed walls
      userFilter = {
        OR: [
          {
            userGroups: {
              some: {
                id: { in: Array.from(allowedGroupIds) }
              }
            }
          },
          {
            postits: {
              some: {
                categoryId: { in: Array.from(managedCats) }
              }
            }
          }
        ]
      }
    }

    const users = await prisma.user.findMany({
      where: userFilter,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        userGroups: {
          select: {
            id: true,
            name: true
          }
        },
        createdAt: true,
        _count: {
          select: {
            postits: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Kullanıcılar alınırken hata oluştu' },
      { status: 500 }
    )
  }
}

// CREATE user (Super Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    const userRole = (session?.user as any)?.role
    const userId = (session?.user as any)?.id

    if (userRole !== 'SUPER_ADMIN' && userRole !== 'WALL_MANAGER') {
      return NextResponse.json(
        { error: 'Bu işlemi yapmaya yetkiniz yok' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { email, name, password, role, userGroupIds } = body

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Email, ad ve şifre gereklidir' },
        { status: 400 }
      )
    }

    if (userRole === 'WALL_MANAGER') {
      // Wall manager cannot create admin/super_admin or other roles normally (force USER or WALL_USER)
      if (role && role !== 'USER' && role !== 'WALL_USER') {
        return NextResponse.json({ error: 'Sadece yetkiniz olan bir kullanıcı tipi oluşturabilirsiniz' }, { status: 403 })
      }

      const allCategories = await prisma.category.findMany({
        select: { id: true, parentId: true, wallManagers: { select: { id: true } }, userGroupId: true }
      })
      const managedCats = new Set<string>()
      const allowedGroupIds = new Set<string>()

      allCategories.forEach(cat => {
        if (cat.wallManagers?.some(m => m.id === userId)) {
          managedCats.add(cat.id)
          if (cat.userGroupId) allowedGroupIds.add(cat.userGroupId)
        }
      })

      let added = true
      while (added) {
        added = false
        allCategories.forEach(cat => {
          if (cat.parentId && managedCats.has(cat.parentId) && !managedCats.has(cat.id)) {
            managedCats.add(cat.id)
            if (cat.userGroupId) allowedGroupIds.add(cat.userGroupId)
            added = true
          }
        })
      }

      // Map group id check
      if (userGroupIds && userGroupIds.length > 0) {
        const hasUnallowedGroup = userGroupIds.some((id: string) => !allowedGroupIds.has(id))
        if (hasUnallowedGroup) {
          return NextResponse.json({ error: 'Sadece yönettiğiniz duvarlara ait gruplara kullanıcı ekleyebilirsiniz' }, { status: 403 })
        }
      }
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu email adresi zaten kullanımda' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: userRole === 'WALL_MANAGER' ? (role === 'WALL_USER' ? 'WALL_USER' : 'USER') : (role || 'USER'),
        userGroups: userGroupIds && userGroupIds.length > 0 ? {
          connect: userGroupIds.map((id: string) => ({ id }))
        } : undefined
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        userGroups: {
          select: {
            id: true,
            name: true
          }
        },
        createdAt: true
      }
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Kullanıcı oluşturulurken hata oluştu' },
      { status: 500 }
    )
  }
}
