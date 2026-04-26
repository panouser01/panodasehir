import nodemailer from 'nodemailer'
import { prisma as db } from './db'
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_PORT === '465', // 465 ise true, değilse false
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    // Kurumsal e-posta veya SSL sertifikasında sorun olursa diye
    rejectUnauthorized: false
  }
})

export async function sendVerificationEmail(email: string, token: string) {
  // Canlı sunucuda bazen .env dosyasında NEXTAUTH_URL localhost kalabiliyor.
  // Bu yüzden canlı ortam varsayılanını elle belirtmek en güvenlisi.
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://panodasehir.com' 
    : (process.env.NEXTAUTH_URL || 'http://localhost:3000')

  const verifyUrl = `${baseUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`

  let finalLogoUrl = await getSiteLogoUrl(baseUrl)

  const mailOptions = {
    from: `"Panodaşehir" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Panodaşehir - E-posta Adresinizi Onaylayın',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${finalLogoUrl}" alt="Panoda Şehir Logo" style="max-width: 150px; max-height: 80px; width: auto; height: auto;" />
        </div>
        <h2 style="color: #333; text-align: center; margin-top: 0;">Panodaşehir'e Hoş Geldiniz!</h2>
        <p style="color: #555; text-align: center; font-size: 16px;">
          Hesabınızı güvenle kullanmaya başlamak için lütfen e-posta adresinizi onaylayın.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #facc15; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
            E-postamı Onayla
          </a>
        </div>
        <p style="color: #777; font-size: 14px; text-align: center;">
          Bu buton çalışmazsa, aşağıdaki bağlantıyı kopyalayıp tarayıcınıza yapıştırabilirsiniz:<br/>
          <a href="${verifyUrl}" style="color: #2563eb; word-break: break-all;">${verifyUrl}</a>
        </p>
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
          Bu bağlantı 24 saat geçerlidir. Eğer bu kayıt işlemini siz yapmadıysanız lütfen bu e-postayı dikkate almayın.
        </p>
      </div>
    `,
  }

  try {
    const user = await db.user.findFirst({
      where: { email: email },
      select: { receiveEmail: true }
    });

    if (user && user.receiveEmail === false) {
      console.log("Email sending disabled by user preference (Verification):", email);
      return;
    }
  } catch(e) {
    console.error("Error checking receiveEmail preference:", e);
  }

  await transporter.sendMail(mailOptions)
}

async function getSiteLogoUrl(baseUrl: string): Promise<string> {
  let finalLogoUrl = `${baseUrl}/pushpin.png`
  try {
    let rootCatWithLogo = await db.category.findFirst({
      where: { name: 'Ana Duvar', logoUrl: { not: null } }
    })
    if (!rootCatWithLogo || !rootCatWithLogo.logoUrl || rootCatWithLogo.logoUrl.trim() === '') {
      rootCatWithLogo = await db.category.findFirst({
        where: { logoUrl: { contains: 'logopano2.webp' } }
      })
    }
    if (rootCatWithLogo && rootCatWithLogo.logoUrl && rootCatWithLogo.logoUrl.trim() !== '') {
      finalLogoUrl = rootCatWithLogo.logoUrl.startsWith('http') 
        ? rootCatWithLogo.logoUrl 
        : `${baseUrl}${rootCatWithLogo.logoUrl}`
    }
  } catch (err) {
    console.error("Logo fetch error:", err)
  }
  return finalLogoUrl
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://panodasehir.com' 
    : (process.env.NEXTAUTH_URL || 'http://localhost:3000')

  const resetUrl = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`
  const finalLogoUrl = await getSiteLogoUrl(baseUrl)

  const mailOptions = {
    from: `"Panodaşehir" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Panodaşehir - Şifre Sıfırlama İsteği',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${finalLogoUrl}" alt="Panoda Şehir Logo" style="max-width: 150px; max-height: 80px; width: auto; height: auto;" />
        </div>
        <h2 style="color: #333; text-align: center; margin-top: 0;">Şifre Sıfırlama İstediğinizi Aldık</h2>
        <p style="color: #555; text-align: center; font-size: 16px;">
          Hesabınızın şifresini sıfırlamak için lütfen aşağıdaki butona tıklayın:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #facc15; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
            Şifremi Sıfırla
          </a>
        </div>
        <p style="color: #777; font-size: 14px; text-align: center;">
          Bu buton çalışmazsa, aşağıdaki bağlantıyı kopyalayıp tarayıcınıza yapıştırabilirsiniz:<br/>
          <a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${resetUrl}</a>
        </p>
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
          Bu bağlantı 1 saat geçerlidir. Eğer bu isteği siz yapmadıysanız lütfen bu e-postayı dikkate almayın ve şifrenizi değiştirmeyin.
        </p>
      </div>
    `,
  }

  try {
    const user = await db.user.findFirst({
      where: { email: email },
      select: { receiveEmail: true }
    });

    if (user && user.receiveEmail === false) {
      console.log("Email sending disabled by user preference (Password Reset):", email);
      return;
    }
  } catch(e) {
    console.error("Error checking receiveEmail preference:", e);
  }
  await transporter.sendMail(mailOptions)
}

export async function sendNotificationEmail(email: string, subject: string, htmlContent: string) {
  try {
    const user = await db.user.findFirst({
      where: { email: email },
      select: { receiveEmail: true }
    });

    if (user && user.receiveEmail === false) {
      console.log("Email sending disabled by user preference (Notification):", email);
      return;
    }
  } catch(e) {
    console.error("Error checking receiveEmail preference:", e);
  }

  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://panodasehir.com' 
    : (process.env.NEXTAUTH_URL || 'http://localhost:3000');
    
  const finalLogoUrl = await getSiteLogoUrl(baseUrl);
  
  // Convert basic Telegram HTML and newlines to email compatible HTML
  const formattedHtml = htmlContent.replace(/\n/g, '<br/>');

  const mailOptions = {
    from: `"Panodaşehir Bildirim" <noreply@panodasehir.com>`,
    to: email,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${finalLogoUrl}" alt="Panoda Şehir Logo" style="max-width: 150px; max-height: 80px; width: auto; height: auto;" />
        </div>
        <div style="color: #333; font-size: 16px; line-height: 1.6; background: #f9fafb; padding: 20px; border-radius: 8px;">
          ${formattedHtml}
        </div>
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
          Bu e-posta size Panodaşehir platformundan bildirim amacıyla gönderilmiştir.<br/><br/>
          E-posta veya Telegram bildirimlerinizi istediğiniz zaman platform üzerindeki "Profil" sayfanızdan açıp kapatabilirsiniz.
        </p>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions);
}
