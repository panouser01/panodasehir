import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { moderateContent } from '@/lib/moderation'
import { sendTelegramMessage } from '@/lib/telegram'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 })
    }

    const { content, postItId } = await request.json()
    if (!content || !postItId) {
      return NextResponse.json({ error: 'İçerik ve postItId gereklidir' }, { status: 400 })
    }

    const moderation = await moderateContent(content)
    if (!moderation.isApproved) {
      return NextResponse.json({ error: 'Uygunsuz içerik engellendi', reason: moderation.reason }, { status: 400 })
    }

    const comment = await prisma.postItComment.create({
      data: {
        content,
        postItId,
        userId: (session.user as any).id
      },
      include: {
        user: { select: { id: true, name: true, nickname: true, image: true } }
      }
    })

    // Bildirim: Postit sahibine mesaj gönder
    try {
      const postOwner = await prisma.postIt.findUnique({
        where: { id: postItId },
        include: { 
          category: { select: { id: true, name: true } },
          user: { select: { id: true, telegramChatId: true, receiveTelegram: true, email: true, receiveEmail: true } } 
        }
      });

      const currentUserId = (session.user as any).id;
      if (postOwner?.user && postOwner.user.id !== currentUserId) {
         const msg = `💬 <b>Postitinize yeni bir yorum geldi!</b>\n\n` +
                     `<b>Postitiniz:</b> <i>${postOwner.content.substring(0, 30)}...</i>\n` +
                     `<b>Yazan:</b> ${comment.user.name || 'Bir kullanıcı'}\n` +
                     `<b>Yorum:</b> ${comment.content}\n`;
         
         const { sendNotificationEmail } = await import('@/lib/mail');
         
         if (postOwner.user.email && postOwner.user.receiveEmail !== false) {
             await sendNotificationEmail(postOwner.user.email, "Yeni Yorum: Postitinize yorum yapıldı", msg).catch(console.error);
         }
         if (postOwner.user.telegramChatId && postOwner.user.receiveTelegram !== false) {
             await sendTelegramMessage(postOwner.user.telegramChatId, msg).catch(console.error);
         }
      }

      // Ayrıca, duvarın (kategorinin) takipçilerine de bildir (telegram için)
      if (postOwner?.category) {
        const { notifySubscribersOnComment } = await import('@/lib/telegram');
        await notifySubscribersOnComment(
          postOwner.category.id,
          postOwner.category.name,
          postOwner.content,
          comment.content,
          comment.user.name || 'Bir kullanıcı',
          currentUserId
        );
      }
    } catch (err) {
      console.error("Yorum bildirim hatası:", err);
    }

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error('Yorum eklenirken hata:', error)
    return NextResponse.json({ error: 'Yorum eklenemedi' }, { status: 500 })
  }
}
