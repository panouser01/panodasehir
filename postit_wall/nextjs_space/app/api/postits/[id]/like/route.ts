import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { sendTelegramMessage } from '@/lib/telegram'

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { id } = params
        const userId = (session.user as any).id

        const postIt = await prisma.postIt.findUnique({
            where: { id },
            include: { user: { select: { id: true, telegramChatId: true, receiveTelegram: true, email: true, receiveEmail: true } } }
        })

        if (!postIt) {
            return new NextResponse('Not Found', { status: 404 })
        }

        const existingLike = await prisma.postItLike.findFirst({
            where: {
                postItId: id,
                userId: userId
            }
        })

        if (existingLike) {
            await prisma.postItLike.delete({
                where: {
                    id: existingLike.id
                }
            })
            return NextResponse.json({ liked: false })
        } else {
            await prisma.postItLike.create({
                data: {
                    postItId: id,
                    userId: userId
                }
            })
            
            // Notification for Like
            if (postIt.user && postIt.user.id !== userId) {
                try {
                    const liker = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
                    const msg = `❤️ <b>Postitinize yeni bir beğeni geldi!</b>\n\n` +
                                `<b>Postitiniz:</b> <i>${postIt.content.substring(0, 30)}...</i>\n` +
                                `<b>Beğenen:</b> ${liker?.name || 'Bir kullanıcı'}\n`;
                    
                    const { sendNotificationEmail } = await import('@/lib/mail');
                    if (postIt.user.email && postIt.user.receiveEmail !== false) {
                        await sendNotificationEmail(postIt.user.email, "Postitiniz beğenildi", msg).catch(console.error);
                    }
                    if (postIt.user.telegramChatId && postIt.user.receiveTelegram !== false) {
                        await sendTelegramMessage(postIt.user.telegramChatId, msg).catch(console.error);
                    }
                } catch (err) {
                    console.error("Beğeni bildirimi hatası:", err);
                }
            }

            return NextResponse.json({ liked: true })
        }
    } catch (error) {
        console.error('Error in like postit:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
