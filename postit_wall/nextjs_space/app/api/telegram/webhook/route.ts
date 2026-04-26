import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendTelegramMessage, answerCallbackQuery } from "@/lib/telegram";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Mesaj komutlarını dinleme (Örn: /start TOKEN)
    if (body.message && body.message.text) {
      const chatId = body.message.chat.id.toString();
      const text = body.message.text.trim();

      if (text.startsWith("/start ")) {
        const token = text.split(" ")[1];

        if (token) {
          // Token'ı kontrol et
          const user = await prisma.user.findUnique({
            where: { telegramConnectionToken: token },
          });

          if (!user) {
            await sendTelegramMessage(chatId, "❌ Geçersiz veya süresi dolmuş bir eşleştirme bağlantısı kullandınız.");
            return NextResponse.json({ ok: true });
          }

          if (user.telegramTokenExpiresAt && user.telegramTokenExpiresAt < new Date()) {
            await sendTelegramMessage(chatId, "❌ Bu bağlantının süresi dolmuş. Lütfen web panelinden yeni bir eşleştirme oluşturun.");
            return NextResponse.json({ ok: true });
          }

          // Kullanıcıyı eşleştir
          await prisma.user.update({
            where: { id: user.id },
            data: {
              telegramChatId: chatId,
              telegramConnectionToken: null,
              telegramTokenExpiresAt: null,
            },
          });

          await sendTelegramMessage(chatId, `✅ <b>Merhaba ${user.name || "Kullanıcı"}!</b>\n\nTelegram hesabınız başarıyla Panoda Şehir platformu ile eşleştirildi. Artık buradan bildirim alabilir ve yöneticisi olduğunuz panolardaki içerikleri onaylayabilirsiniz.`);
          return NextResponse.json({ ok: true });
        }
      } else if (text === "/start") {
         await sendTelegramMessage(chatId, "👋 Merhaba! Panoda Şehir botuna hoş geldiniz. Lütfen web panelindeki 'Telegram Bildirimleri' kısmından bağlantı bağlantısına tıklayarak hesabınızı eşleştirin.");
         return NextResponse.json({ ok: true });
      }

      // Başka mesaj komutları eklenebilir
    }

    // Inline Button Tıklamalarını Dinleme (Callback Query)
    if (body.callback_query && body.callback_query.data) {
      const callbackQuery = body.callback_query;
      const data = callbackQuery.data as string; // Örn: approve_postit_1234
      const chatId = callbackQuery.message.chat.id.toString();

      // İşlem yapan kullanıcıyı bul
      const user = await prisma.user.findFirst({
        where: { telegramChatId: chatId }
      });

      if (!user) {
        await answerCallbackQuery(callbackQuery.id, "❌ Yetkiniz yok veya hesabınız eşleştirilmemiş.", true);
        return NextResponse.json({ ok: true });
      }

      if (data.startsWith("approve_postit_")) {
        const postId = data.replace("approve_postit_", "");
        const post = await prisma.postIt.findUnique({ 
            where: { id: postId }, 
            include: { category: true, user: true } 
        });
        
        if (post) {
           await prisma.postIt.update({
             where: { id: postId },
             data: { isApproved: true }
           });
           await sendTelegramMessage(chatId, `✅ Postit onaylandı: <i>${post.content}</i>`);
           await answerCallbackQuery(callbackQuery.id, "Postit başarıyla onaylandı!");

           // Notify subscribers if published and not a direct message
           if (post.isPublished && !post.content.startsWith('[ÖZEL MESAJ]')) {
             try {
               const { notifySubscribers, notifyFollowers } = await import('@/lib/telegram');
               const authorName = post.user?.nickname || post.user?.name || 'Bir kullanıcı';
               const categoryName = post.category?.name || 'Bilinmiyor';
               const authorId = post.user?.id;
               
               await notifySubscribers(post.categoryId, categoryName, post.content, authorName, authorId);
               if (authorId) {
                 await notifyFollowers(authorId, authorName, post.content, categoryName, post.categoryId);
               }
             } catch (err) {
               console.error("Abone bildirim hatası (webhook):", err);
             }
           }
        } else {
           await answerCallbackQuery(callbackQuery.id, "Postit bulunamadı.", true);
        }

      } else if (data.startsWith("reject_postit_")) {
        const postId = data.replace("reject_postit_", "");
        const post = await prisma.postIt.findUnique({ where: { id: postId } });
        
        if (post) {
           await prisma.postIt.delete({
             where: { id: postId }
           });
           await sendTelegramMessage(chatId, `🗑️ Postit reddedildi ve silindi.`);
           await answerCallbackQuery(callbackQuery.id, "Postit reddedildi.");
        } else {
           await answerCallbackQuery(callbackQuery.id, "Postit bulunamadı.", true);
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook Hatası:", error);
    return NextResponse.json({ ok: false, error: "Sunucu hatası" }, { status: 500 });
  }
}
