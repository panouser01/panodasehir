import { NextRequest, NextResponse } from 'next/server'
import { join } from 'path'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    const filePath = join(process.cwd(), 'public', 'uploads', ...params.path)
    
    if (!existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 })
    }

    const file = await readFile(filePath)
    
    // Determine content type
    const ext = filePath.split('.').pop()?.toLowerCase()
    let contentType = 'application/octet-stream'
    if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg'
    else if (ext === 'png') contentType = 'image/png'
    else if (ext === 'gif') contentType = 'image/gif'
    else if (ext === 'webp') contentType = 'image/webp'
    else if (ext === 'svg') contentType = 'image/svg+xml'
    else if (ext === 'mp4') contentType = 'video/mp4'

    return new NextResponse(file as unknown as BodyInit, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, immutable'
      }
    })
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
