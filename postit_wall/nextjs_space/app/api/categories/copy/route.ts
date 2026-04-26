import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { revalidateTag } from 'next/cache'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

async function canManageCategory(userId: string, userRole: string, categoryId: string): Promise<boolean> {
  if (userRole === 'SUPER_ADMIN') return true
  if (userRole !== 'WALL_MANAGER') return false

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { parent: true }
  })

  if (!category) return false

  let currentCat: any = category
  while (currentCat) {
    if (currentCat.wallManagers?.some((m: any) => m.id === userId)) return true
    currentCat = currentCat.parent
  }

  return false
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 })
    }
    
    const userRole = (session.user as any).role
    const userId = (session.user as any).id
    
    if (userRole !== 'SUPER_ADMIN' && userRole !== 'WALL_MANAGER') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
    }

    const body = await request.json()
    const { categoryId, copyPostits, targetParentId } = body

    if (!categoryId) {
      return NextResponse.json({ error: 'Kategori ID eksik' }, { status: 400 })
    }

    // Check manage permission on the original category
    const hasPerm = await canManageCategory(userId, userRole, categoryId)
    if (!hasPerm) {
      return NextResponse.json({ error: 'Bu duvarı kopyalama yetkiniz yok' }, { status: 403 })
    }

    if (targetParentId === null && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Ana dizine duvar kopyalamak için Super Admin olmalısınız' }, { status: 403 })
    }

    if (targetParentId) {
      const hasTargetPerm = await canManageCategory(userId, userRole, targetParentId)
      if (!hasTargetPerm) {
        return NextResponse.json({ error: 'Hedef dizine duvar kopyalama yetkiniz yok' }, { status: 403 })
      }
    }

    // Start long-running transaction for deep copy
    const copiedCategory = await prisma.$transaction(async (tx) => {
      const initialCat = await tx.category.findUnique({ where: { id: categoryId } });
      if (!initialCat) throw new Error('Orijinal kategori bulunamadı');

      // If user is WALL_MANAGER, they cannot copy a root category generally unless allowed
      // But we will allow them to copy what they manage.

      async function recursiveCopy(originalId: string, parentId: string | null, isFirst: boolean) {
        const catToCopy = await tx.category.findUnique({ 
          where: { id: originalId },
          include: {
            calendarEntries: true,
          }
        });
        
        if (!catToCopy) return null;

        const newCatData: any = { ...catToCopy };
        
        // Remove fields that should not be copied directly
        delete newCatData.id;
        delete newCatData.createdAt;
        delete newCatData.updatedAt;
        delete newCatData.calendarEntries;
        
        // DO NOT COPY PERMISSIONS per requested rules
        delete newCatData.userGroupId;
        
        newCatData.parentId = parentId;
        
        if (isFirst) {
          newCatData.name = `${newCatData.name} (Kopya)`;
          // To put it near the original
          if (newCatData.order !== undefined && newCatData.order !== null) {
              newCatData.order = newCatData.order + 1; 
          }
        }

        const createdCat = await tx.category.create({ data: newCatData });

        // Clone Calendar Entries if any
        if (catToCopy.calendarEntries && catToCopy.calendarEntries.length > 0) {
          await tx.wallCalendarEntry.createMany({
            data: catToCopy.calendarEntries.map(ce => ({
              categoryId: createdCat.id,
              calendarCategoryId: ce.calendarCategoryId,
              date: ce.date,
              content: ce.content
            }))
          });
        }

        // Clone Post-its if requested
        if (copyPostits) {
          const postits = await tx.postIt.findMany({ 
            where: { categoryId: originalId }, 
            include: { PostItImage: true } 
          });
          
          for (const p of postits) {
            const newP: any = { ...p };
            delete newP.id;
            delete newP.createdAt;
            delete newP.updatedAt;
            delete newP.PostItImage;
            
            newP.categoryId = createdCat.id;
            newP.views = 0;
            newP.sharesCount = 0;
            newP.reportCount = 0;
            newP.reportedBy = null;
            newP.hasBeenPublished = false;
            
            const createdPostIt = await tx.postIt.create({ data: newP });
            
            if (p.PostItImage && p.PostItImage.length > 0) {
              await tx.postItImage.createMany({
                data: p.PostItImage.map(pi => ({
                  id: randomUUID(),
                  url: pi.url,
                  postItId: createdPostIt.id,
                }))
              });
            }
          }
        }

        // Recursively clone child categories
        const children = await tx.category.findMany({ where: { parentId: originalId } });
        for (const child of children) {
          await recursiveCopy(child.id, createdCat.id, false);
        }

        return createdCat;
      }

      return await recursiveCopy(categoryId, targetParentId !== undefined ? targetParentId : initialCat.parentId, true);
      
    }, {
      maxWait: 5000,
      timeout: 30000 // Deep copies might take time
    });

    revalidateTag('all-categories-tree')
    return NextResponse.json({ success: true, category: copiedCategory }, { status: 200 })

  } catch (error) {
    console.error('Error copying category:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Kategori kopyalanırken bir hata oluştu' },
      { status: 500 }
    )
  }
}
