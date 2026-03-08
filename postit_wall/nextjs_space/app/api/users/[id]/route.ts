import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import * as bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

// GET single user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if ((session?.user as any)?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Bu işlemi yapmaya yetkiniz yok' }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        userGroups: { select: { id: true, name: true } },
        _count: { select: { postits: true } }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Kullanıcı alınırken hata oluştu' }, { status: 500 })
  }
}

// UPDATE user (Super Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    const userRole = (session?.user as any)?.role
    const userId = (session?.user as any)?.id

    if (userRole !== 'SUPER_ADMIN' && userRole !== 'WALL_MANAGER') {
      return NextResponse.json({ error: 'Bu işlemi yapmaya yetkiniz yok' }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, role, password, userGroupIds } = body

    if (userRole === 'WALL_MANAGER') {
      // Wall manager cannot elevate privileges
      if (role && role !== 'USER') {
        return NextResponse.json({ error: 'Rol değiştirme yetkiniz yok' }, { status: 403 })
      }

      // Check if they have access to the target user
      const targetUser = await prisma.user.findUnique({
        where: { id: params.id },
        include: { userGroups: true, postits: true }
      })

      if (!targetUser) {
        return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
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

      // Is target user inside allowedGroupIds or managedCats?
      const inAllowedGroups = targetUser.userGroups.some(g => allowedGroupIds.has(g.id))
      const hasPostsInManagedCats = targetUser.postits.some(p => managedCats.has(p.categoryId))

      if (!inAllowedGroups && !hasPostsInManagedCats) {
        return NextResponse.json({ error: 'Bu kullanıcıyı düzenleme yetkiniz yok' }, { status: 403 })
      }

      // Cannot assign to an unallowed group
      if (userGroupIds && userGroupIds.length > 0) {
        const hasUnallowedGroup = userGroupIds.some((id: string) => !allowedGroupIds.has(id))
        if (hasUnallowedGroup) {
          return NextResponse.json({ error: 'Sadece yönettiğiniz duvarlara ait gruplara kullanıcı ekleyebilirsiniz' }, { status: 403 })
        }
      }
    }

    // Check if email is taken by another user
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: params.id }
        }
      })

      if (existingUser) {
        return NextResponse.json({ error: 'Bu email adresi başka bir kullanıcı tarafından kullanılıyor' }, { status: 400 })
      }
    }

    const updateData: any = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (role) updateData.role = role
    if (password) updateData.password = await bcrypt.hash(password, 10)

    if (userGroupIds !== undefined) {
      updateData.userGroups = {
        set: Array.isArray(userGroupIds) ? userGroupIds.map((id: string) => ({ id })) : []
      }
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Kullanıcı güncellenirken hata oluştu' }, { status: 500 })
  }
}

// DELETE user (Super Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    const userRole = (session?.user as any)?.role
    const userId = (session?.user as any)?.id

    if (userRole !== 'SUPER_ADMIN' && userRole !== 'WALL_MANAGER') {
      return NextResponse.json({ error: 'Bu işlemi yapmaya yetkiniz yok' }, { status: 403 })
    }

    if (userRole === 'WALL_MANAGER') {
      // Check if they have access to the target user
      const targetUser = await prisma.user.findUnique({
        where: { id: params.id },
        include: { userGroups: true, postits: true }
      })

      if (!targetUser) {
        return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
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

      const inAllowedGroups = targetUser.userGroups.some(g => allowedGroupIds.has(g.id))
      const hasPostsInManagedCats = targetUser.postits.some(p => managedCats.has(p.categoryId))

      if (!inAllowedGroups && !hasPostsInManagedCats) {
        return NextResponse.json({ error: 'Bu kullanıcıyı silme yetkiniz yok' }, { status: 403 })
      }
    }

    // Don't allow deleting yourself
    if ((session?.user as any)?.id === params.id) {
      return NextResponse.json({ error: 'Kendinizi silemezsiniz' }, { status: 400 })
    }

    await prisma.user.delete({ where: { id: params.id } })

    return NextResponse.json({ message: 'Kullanıcı silindi' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Kullanıcı silinirken hata oluştu' }, { status: 500 })
  }
}
