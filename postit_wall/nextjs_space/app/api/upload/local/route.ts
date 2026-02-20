
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { existsSync } from 'fs'

// @ts-ignore
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json(
                { error: 'Dosya yüklenmedi' },
                { status: 400 }
            )
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        const filename = `${uuidv4()}-${file.name.replace(/\s/g, '_')}`
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads')

        if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true })
        }

        // Cast buffer to any or Uint8Array to satisfy the type checker (Node fs accepts Buffer)
        await writeFile(path.join(uploadsDir, filename), buffer as any)

        return NextResponse.json({
            fileUrl: `/uploads/${filename}`,
            success: true
        })
    } catch (error) {
        console.error('Error uploading file:', error)
        return NextResponse.json(
            { error: 'Dosya yüklenirken hata oluştu' },
            { status: 500 }
        )
    }
}
