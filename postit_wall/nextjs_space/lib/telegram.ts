export const sendTelegramMessage = async (
  chatId: string,
  text: string,
  replyMarkup?: any
) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn("TELEGRAM_BOT_TOKEN tanımlı değil!");
    return null;
  }

  const TELEGRAM_API_URL = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    // Lazy load or dynamic import to avoid circular dependencies
    const { prisma } = await import('@/lib/db');
    
    // Check if user has opted out of telegram notifications
    const user = await prisma.user.findFirst({
      where: { telegramChatId: chatId },
      select: { receiveTelegram: true }
    });

    if (user && user.receiveTelegram === false) {
      console.log("Telegram messages disabled by user preference for chatId:", chatId);
      return null;
    }

    const res = await fetch(TELEGRAM_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "HTML",
        reply_markup: replyMarkup,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Telegram Error:", data);
    }
    return data;
  } catch (error) {
    console.error("Telegram gönderme hatası:", error);
    return null;
  }
};

export const answerCallbackQuery = async (
  callbackQueryId: string,
  text?: string,
  showAlert: boolean = false
) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return null;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text,
        show_alert: showAlert,
      }),
    });
    return await res.json();
  } catch (error) {
    console.error("Telegram answerCallbackQuery Error:", error);
    return null;
  }
};

export const notifySubscribers = async (categoryId: string, categoryName: string, postitContent: string, authorName: string, authorId?: string) => {
  try {
    // Lazy load prisma to avoid circular dependencies if any
    const { prisma } = await import('@/lib/db');
    
    // Find all users subscribed to this category. Fetch preferences for both Email & Telegram
    const query: any = {
      wallSubscriptions: { some: { categoryId: categoryId } }
    };
    if (authorId) {
      query.id = { not: authorId };
    }

    const subscribers = await prisma.user.findMany({
      where: query,
      select: { telegramChatId: true, receiveTelegram: true, email: true, receiveEmail: true }
    });
    
    if (subscribers.length === 0) return;
    
    // HTML Escape function for Telegram
    const escapeHtml = (text: string) => {
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    };

    const safeContent = escapeHtml(postitContent);
    const safeAuthor = escapeHtml(authorName);
    const safeCategory = escapeHtml(categoryName);
    
    const messageText = `🔔 <b>Yeni Bildirim!</b>\n\nAbone olduğunuz <b>${safeCategory}</b> duvarına ${safeAuthor} tarafından yeni bir post-it eklendi:\n\n<i>"${safeContent.length > 200 ? safeContent.substring(0, 200) + '...' : safeContent}"</i>\n\n<a href="https://panodasehir.com/?category=${categoryId}">Hemen İncele</a>`;
    
    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: "🔗 Duvara Git", url: `https://panodasehir.com/?category=${categoryId}` }
        ]
      ]
    };
    
    const { sendNotificationEmail } = await import('@/lib/mail');
    const promises = [];
    
    // Send message to each subscriber
    for (const sub of subscribers) {
      // 1. Email
      if (sub.email && sub.receiveEmail !== false) {
          promises.push(sendNotificationEmail(sub.email, `Yeni Bildirim - ${categoryName}`, messageText).catch(console.error));
      }
      // 2. Telegram
      if (sub.telegramChatId && sub.receiveTelegram !== false) {
        promises.push(sendTelegramMessage(sub.telegramChatId, messageText, inlineKeyboard).catch(console.error));
      }
    }
    
    // Await all promises so Next.js doesn't abort the fetch calls when request ends
    await Promise.all(promises);
  } catch (error) {
    console.error("Error notifying subscribers via Telegram:", error);
  }
};

export const notifyFollowers = async (authorId: string, authorName: string, postitContent: string, categoryName: string, categoryId: string) => {
  try {
    const { prisma } = await import('@/lib/db');
    
    // Find followers. Fetch preferences for both Email & Telegram
    const followers = await prisma.userSubscription.findMany({
      where: {
        followingId: authorId
      },
      include: {
        follower: {
          select: { telegramChatId: true, receiveTelegram: true, email: true, receiveEmail: true }
        }
      }
    });
    
    if (followers.length === 0) return;
    
    // HTML Escape function for Telegram
    const escapeHtml = (text: string) => {
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    };

    const safeContent = escapeHtml(postitContent);
    const safeAuthor = escapeHtml(authorName);
    const safeCategory = escapeHtml(categoryName);
    
    const messageText = `👤 <b>Takip Bildirimi!</b>\n\nTakip ettiğiniz <b>${safeAuthor}</b> kullanıcısı <b>${safeCategory}</b> duvarında yeni bir post-it paylaştı:\n\n<i>"${safeContent.length > 200 ? safeContent.substring(0, 200) + '...' : safeContent}"</i>\n\n<a href="https://panodasehir.com/?category=${categoryId}">Hemen İncele</a>`;
    
    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: "🔗 İncele", url: `https://panodasehir.com/?category=${categoryId}` }
        ]
      ]
    };
    
    const { sendNotificationEmail } = await import('@/lib/mail');
    const promises = [];
    
    for (const sub of followers) {
      // 1. Email
      if (sub.follower.email && sub.follower.receiveEmail !== false) {
          promises.push(sendNotificationEmail(sub.follower.email, `Takip Bildirimi - ${safeAuthor}`, messageText).catch(console.error));
      }
      // 2. Telegram
      if (sub.follower.telegramChatId && sub.follower.receiveTelegram !== false) {
        promises.push(sendTelegramMessage(sub.follower.telegramChatId, messageText, inlineKeyboard).catch(console.error));
      }
    }
    
    await Promise.all(promises);
  } catch (error) {
    console.error("Error notifying followers via Telegram:", error);
  }
};

export const notifySubscribersOnComment = async (categoryId: string, categoryName: string, postitContent: string, commentContent: string, commentAuthorName: string, authorId?: string) => {
  try {
    const { prisma } = await import('@/lib/db');
    
    // Find all users subscribed to this category
    const query: any = {
      wallSubscriptions: { some: { categoryId: categoryId } }
    };
    
    // Postit sahibini dışarıda bırakmak isteyebiliriz, fakat postit sahibine özel mesaj zaten app/api/comments/route.ts içinde gidiyor
    // Yine de yorumu yapanın kendisine gitmemesi için authorId exclude edilir:
    if (authorId) {
      query.id = { not: authorId };
    }

    const subscribers = await prisma.user.findMany({
      where: query,
      select: { id: true, telegramChatId: true, receiveTelegram: true }
    });
    
    if (subscribers.length === 0) return;
    
    const escapeHtml = (text: string) => {
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    };

    const safePostitContent = escapeHtml(postitContent);
    const safeComment = escapeHtml(commentContent);
    const safeAuthor = escapeHtml(commentAuthorName);
    const safeCategory = escapeHtml(categoryName);
    
    const messageText = `💬 <b>Yorum Bildirimi!</b>\n\nAbone olduğunuz <b>${safeCategory}</b> duvarındaki bir postite, <b>${safeAuthor}</b> tarafından yorum yapıldı:\n\n<b>Postit:</b> <i>"${safePostitContent.length > 50 ? safePostitContent.substring(0, 50) + '...' : safePostitContent}"</i>\n\n<b>Yorum:</b> <i>"${safeComment.length > 150 ? safeComment.substring(0, 150) + '...' : safeComment}"</i>\n\n<a href="https://panodasehir.com/?category=${categoryId}">Hemen İncele</a>`;
    
    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: "🔗 Duvara Git", url: `https://panodasehir.com/?category=${categoryId}` }
        ]
      ]
    };
    
    const promises = [];
    
    // Send message to each subscriber
    for (const sub of subscribers) {
      // 1. Telegram
      if (sub.telegramChatId && sub.receiveTelegram !== false) {
        promises.push(sendTelegramMessage(sub.telegramChatId, messageText, inlineKeyboard).catch(console.error));
      }
    }
    
    await Promise.all(promises);
  } catch (error) {
    console.error("Error notifying subscribers of comment via Telegram:", error);
  }
};
