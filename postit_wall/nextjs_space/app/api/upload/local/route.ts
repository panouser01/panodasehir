
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { existsSync } from 'fs'
import sharp from 'sharp'

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

        if (file.size > 50 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'Dosya boyutu en fazla 50 MB olabilir.' },
                { status: 400 }
            )
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        
        // 1. Orijinal ispi temizle, yeni bir ad ver ve mutlaka .webp yap
        const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/\s+/g, '_').toLowerCase();
        let filename = `${uuidv4()}-${baseName}`
        const isImage = file.type.startsWith('image/')
        
        let finalBuffer = buffer as any
        
        if (isImage) {
            try {
                // 2. Sharp ile en boy oranını koruyarak 1200px genişliğe sığdır, WebP'ye %80 kalitede çevir.
                finalBuffer = await sharp(buffer)
                    .resize({ width: 1200, withoutEnlargement: true })
                    .webp({ quality: 80 })
                    .toBuffer()
                
                // Başarılıysa uzantı webp
                filename = `${filename}.webp`
            } catch (err) {
                // Eğer sharp işleyebileceğinden farklı formattaysa (örn ico vb.) orijinali kaydetmek için uzantıyı al
                const ext = path.extname(file.name)
                filename = `${filename}${ext}`
            }
        } else {
             const ext = path.extname(file.name)
             filename = `${filename}${ext}`
        }

        const uploadsDir = path.join(process.cwd(), 'public', 'uploads')

        if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true })
        }

        await writeFile(path.join(uploadsDir, filename), finalBuffer)

        return NextResponse.json({
            fileUrl: `/uploads/${filename}`,
            success: true
        })
    } catch (error: any) {
        console.error('Error uploading file:', error)
        return NextResponse.json(
            { error: `Dosya yüklenirken sunucu hatası oluştu: ${error.message || 'Bilinmeyen hata'}` },
            { status: 500 }
        )
    }
}
