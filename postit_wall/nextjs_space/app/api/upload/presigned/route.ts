import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generatePresignedUploadUrl } from '@/lib/s3'

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
    const { fileName, contentType, isPublic } = body

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: 'Dosya adı ve türü gereklidir' },
        { status: 400 }
      )
    }

    const { uploadUrl, cloud_storage_path } = await generatePresignedUploadUrl(
      fileName,
      contentType,
      isPublic ?? false
    )

    return NextResponse.json({ uploadUrl, cloud_storage_path })
  } catch (error) {
    console.error('Error generating presigned URL:', error)
    return NextResponse.json(
      { error: 'Yükleme URL\'si oluşturulurken hata oluştu' },
      { status: 500 }
    )
  }
}
