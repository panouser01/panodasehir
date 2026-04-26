import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Google Gemini API istemcisi
// Not: Sisteminizin .env dosyasında GEMINI_API_KEY bulunmalıdır.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Sistemde Gemini API anahtarı ayarlanmamış.' }, { status: 500 })
    }

    const { title } = await req.json()

    if (!title) {
      return NextResponse.json({ error: 'Başlık zorunludur' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `
    Aşağıdaki makale başlığı için sürükleyici ve ilgi çekici bir giriş paragrafı yaz:
    Başlık: "${title}"
    
    Lütfen yanıtını herhangi bir markdown etiketi olmadan sadece düz, profesyonel paragraflar halinde ver. Çok uzun olmasın, 3-4 cümle yeterli.
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // HTML formatına uygun hale getirelim (TipTap editor kullanıyoruz)
    const htmlSuggestion = `<p>${text.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')}</p>`

    return NextResponse.json({ suggestion: htmlSuggestion })

  } catch (error: any) {
    console.error('Error generating AI text:', error)
    return NextResponse.json(
      { error: 'AI isteği sırasında hata oluştu' },
      { status: 500 }
    )
  }
}
