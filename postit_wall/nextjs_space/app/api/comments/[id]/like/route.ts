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
      return NextResponse.json({ error: 'Beğenmek için giriş yapmalısınız' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const commentId = params.id

    // Check if comment exists to notify the owner
    const comment = await prisma.postItComment.findUnique({
      where: { id: commentId },
      include: { user: { select: { id: true, telegramChatId: true, receiveTelegram: true, email: true, receiveEmail: true } } }
    });

    if (!comment) {
      return NextResponse.json({ error: 'Yorum bulunamadı' }, { status: 404 })
    }

    // Check if like exists
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId
        }
      }
    })

    if (existingLike) {
      // Unlike
      await prisma.commentLike.delete({
        where: {
          id: existingLike.id
        }
      })
      return NextResponse.json({ liked: false })
    } else {
      // Like
      await prisma.commentLike.create({
        data: {
          userId,
          commentId
        }
      })

      // Send notification
      try {
        if (comment.user && comment.user.id !== userId) {
            const msg = `❤️ <b>Yorumunuz Beğenildi!</b>\n\n` +
                        `Birisi <b>Panoda Şehir</b> üzerindeki şu yorumunuza kalp bıraktı:\n\n` +
                        `<i>"${comment.content}"</i>`;
            
            const { sendNotificationEmail } = await import('@/lib/mail');
            
            if (comment.user.email && comment.user.receiveEmail !== false) {
                await sendNotificationEmail(comment.user.email, "Yorumunuz Beğenildi", msg).catch(console.error);
            }
            if (comment.user.telegramChatId && comment.user.receiveTelegram !== false) {
                await sendTelegramMessage(comment.user.telegramChatId, msg).catch(console.error);
            }
        }
      } catch (err) {
          console.error("Yorum beğeni bildirim hatası:", err)
      }

      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error('Comment like error:', error)
    return NextResponse.json({ error: 'İşlem başarısız' }, { status: 500 })
  }
}
