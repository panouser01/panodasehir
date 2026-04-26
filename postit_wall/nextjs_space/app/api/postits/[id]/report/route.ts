import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendTelegramMessage } from '@/lib/telegram'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Raporlamak için giriş yapmalısınız' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const postItId = params.id

    // Fetch current post
    const postIt = await prisma.postIt.findUnique({
      where: { id: postItId }
    })

    if (!postIt) {
      return NextResponse.json({ error: 'Post-it bulunamadı' }, { status: 404 })
    }

    const reportedBy = Array.isArray(postIt.reportedBy) ? postIt.reportedBy : []

    // Check if use already reported
    if (reportedBy.includes(userId)) {
      return NextResponse.json({ error: 'Bu panoyu zaten raporladınız' }, { status: 400 })
    }

    const newReportedBy = [...reportedBy, userId]
    const newReportCount = postIt.reportCount + 1

    // If reportCount >= 3, automatically hide the post-it by setting isApproved: false
    const shouldHide = newReportCount >= 3

    await prisma.postIt.update({
      where: { id: postItId },
      data: {
        reportCount: newReportCount,
        reportedBy: newReportedBy,
        isApproved: shouldHide ? false : postIt.isApproved,
      }
    })

    // Notification
    try {
      if (postIt.categoryId) {
        const managers = await prisma.user.findMany({
          where: {
            OR: [
              { role: 'SUPER_ADMIN' },
              { managedCategories: { some: { id: postIt.categoryId } } }
            ]
          },
          select: { telegramChatId: true, receiveTelegram: true, email: true, receiveEmail: true }
        });

        const { sendNotificationEmail } = await import('@/lib/mail');

        for (const manager of managers) {
             const inlineKeyboard = {
                inline_keyboard: [
                  [
                    { text: "✅ Temize Çıkar (Onayla)", callback_data: `approve_postit_${postIt.id}` },
                    { text: "🗑️ İçeriği Sil", callback_data: `reject_postit_${postIt.id}` }
                  ]
                ]
             };
             const messageText = `🚨 <b>YENİ ŞİKAYET BİLDİRİMİ!</b>\n\n` +
                                 `<b>Kategori ID:</b> ${postIt.categoryId}\n` +
                                 `<b>Şikayet Sayısı:</b> ${newReportCount}/3\n` +
                                 `<b>Durum:</b> ${shouldHide ? '🛑 3 Şikayete Ulaştı! Otomatik YAYINDAN KALDIRILDI.' : '⚠️ Yayında.'}\n\n` +
                                 `<b>İçerik:</b> ${postIt.content}\n\n` +
                                 `Aşağıdaki butonları kullanarak panoyu geri açabilir veya kalıcı olarak silebilirsiniz.`;
             
             if (manager.email && manager.receiveEmail !== false) {
                 await sendNotificationEmail(manager.email, "Şikayet Bildirimi", messageText).catch(console.error);
             }
             if (manager.telegramChatId && manager.receiveTelegram !== false) {
                 await sendTelegramMessage(manager.telegramChatId, messageText, inlineKeyboard);
             }
        }
      }
    } catch (err) {
      console.error("Telegram bildirim hatası (Report):", err);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Raporunuz alındı. Topluluğumuzu koruduğunuz için teşekkürler.',
      hidden: shouldHide 
    })

  } catch (error) {
    console.error('Report error:', error)
    return NextResponse.json({ error: 'İşlem sırasında bir hata oluştu' }, { status: 500 })
  }
}
