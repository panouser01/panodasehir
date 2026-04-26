import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!token) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN tanımlı değil." }, { status: 400 });
  }
  
  try {
    const url = new URL(req.url);
    const webhookUrl = `${url.protocol}//${url.host}/api/telegram/webhook`;

    const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${webhookUrl}`);
    const data = await res.json();
    
    return NextResponse.json({
      success: true,
      webhookUrl: webhookUrl,
      telegramResponse: data
    });
  } catch (error) {
    console.error("Webhook ayarlama hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
