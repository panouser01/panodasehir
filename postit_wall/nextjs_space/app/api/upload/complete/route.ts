import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getFileUrl } from '@/lib/s3'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Giriş yapmalısınız' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { cloud_storage_path, isPublic } = body

    if (!cloud_storage_path) {
      return NextResponse.json(
        { error: 'Dosya yolu gereklidir' },
        { status: 400 }
      )
    }

    const fileUrl = await getFileUrl(cloud_storage_path, isPublic ?? false)

    return NextResponse.json({ fileUrl, cloud_storage_path })
  } catch (error) {
    console.error('Error completing upload:', error)
    return NextResponse.json(
      { error: 'Yükleme tamamlanırken hata oluştu' },
      { status: 500 }
    )
  }
}
