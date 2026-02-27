import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        let settings = await prisma.siteSettings.findUnique({
            where: { id: 'global' }
        })

        if (!settings) {
            settings = await prisma.siteSettings.create({
                data: { id: 'global' }
            })
        }

        return NextResponse.json({ settings })
    } catch (error) {
        console.error('Error fetching settings:', error)
        return NextResponse.json(
            { error: 'Ayarlar alınırken hata oluştu' },
            { status: 500 }
        )
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        // Allow SUPER_ADMIN or WALL_MANAGER to update settings
        const role = (session?.user as any)?.role
        if (role !== 'SUPER_ADMIN' && role !== 'WALL_MANAGER') {
            return NextResponse.json(
                { error: 'Bu işlem için yetkiniz yok' },
                { status: 403 }
            )
        }

        const data = await request.json()

        const updateData: any = {}
        if (data.backgroundColor !== undefined) updateData.backgroundColor = data.backgroundColor
        if (data.backgroundImage !== undefined) updateData.backgroundImage = data.backgroundImage
        if (data.borderColor !== undefined) updateData.borderColor = data.borderColor
        if (data.borderTopColor !== undefined) updateData.borderTopColor = data.borderTopColor
        if (data.borderBottomColor !== undefined) updateData.borderBottomColor = data.borderBottomColor
        if (data.noBorder !== undefined) updateData.noBorder = data.noBorder
        if (data.isGradient !== undefined) updateData.isGradient = data.isGradient
        if (data.gradientFrom !== undefined) updateData.gradientFrom = data.gradientFrom
        if (data.gradientVia !== undefined) updateData.gradientVia = data.gradientVia
        if (data.gradientTo !== undefined) updateData.gradientTo = data.gradientTo

        if (data.heroBackgroundImage !== undefined) updateData.heroBackgroundImage = data.heroBackgroundImage || null
        if (data.heroSubtitle !== undefined) updateData.heroSubtitle = data.heroSubtitle || null
        if (data.heroTitleFont !== undefined) updateData.heroTitleFont = data.heroTitleFont
        if (data.heroTitleColor !== undefined) updateData.heroTitleColor = data.heroTitleColor
        if (data.heroTitleSize !== undefined) updateData.heroTitleSize = data.heroTitleSize
        if (data.heroSubtitleFont !== undefined) updateData.heroSubtitleFont = data.heroSubtitleFont
        if (data.heroSubtitleColor !== undefined) updateData.heroSubtitleColor = data.heroSubtitleColor
        if (data.heroSubtitleSize !== undefined) updateData.heroSubtitleSize = data.heroSubtitleSize
        if (data.heroGradientFrom !== undefined) updateData.heroGradientFrom = data.heroGradientFrom
        if (data.heroGradientVia !== undefined) updateData.heroGradientVia = data.heroGradientVia
        if (data.heroGradientTo !== undefined) updateData.heroGradientTo = data.heroGradientTo
        if (data.heroAlignment !== undefined) updateData.heroAlignment = data.heroAlignment
        if (data.siteIsGradient !== undefined) updateData.siteIsGradient = data.siteIsGradient
        if (data.siteGradientFrom !== undefined) updateData.siteGradientFrom = data.siteGradientFrom
        if (data.siteGradientVia !== undefined) updateData.siteGradientVia = data.siteGradientVia
        if (data.siteGradientTo !== undefined) updateData.siteGradientTo = data.siteGradientTo
        if (data.siteBackgroundColor !== undefined) updateData.siteBackgroundColor = data.siteBackgroundColor

        const settings = await prisma.siteSettings.upsert({
            where: { id: 'global' },
            update: updateData,
            create: {
                id: 'global',
                ...updateData
            }
        })

        return NextResponse.json({ settings })
    } catch (error) {
        console.error('Error updating settings:', error)
        return NextResponse.json(
            { error: 'Ayarlar güncellenirken hata oluştu' },
            { status: 500 }
        )
    }
}
