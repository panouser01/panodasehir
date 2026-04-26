import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import * as bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/mail';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const {
      companyType,
      storeName,
      storeLogo,
      storeSlogan,
      username,
      password,
      contactFirstName,
      contactLastName,
      contactPhone,
      contactEmail,
      address,
      cityId,
      districtId,
      taxOffice,
      taxId,
      iban,
      taxPlateUrl,
      signatureCircularUrl,
      idCardFrontUrl,
      idCardBackUrl,
      registryNumber,
      tradeRegistryGazetteUrl,
      selectedWallIds
    } = data;

    // Basit doğrulama (Gerekirse Yup/Zod eklenebilir)
    if (!companyType || !storeName || !username || !password || !contactFirstName || !contactEmail || !taxId) {
      return NextResponse.json({ error: 'Eksik veya hatalı alanlar mevcut.' }, { status: 400 });
    }

    // Kullanıcı adının sistemde (User veya MerchantApplication) olup olmadığını kontrol edelim
    const existingUser = await prisma.user.findUnique({
      where: { email: username } // Eğer mail üzerinden login yapıyorlarsa
    });

    const existingMerchant = await prisma.merchantApplication.findUnique({
      where: { username }
    });

    if (existingMerchant) {
      return NextResponse.json({ error: 'Bu kullanıcı adı zaten bir başvuru tarafından alınmış.' }, { status: 400 });
    }

    // Şifreyi şifreleyelim
    const passwordHash = await bcrypt.hash(password, 10);

    // Başvuruyu veritabanına kaydet
    const newApp = await prisma.merchantApplication.create({
      data: {
        companyType,
        storeName,
        storeLogo: storeLogo || null,
        storeSlogan: storeSlogan || null,
        username,
        passwordHash,
        contactFirstName,
        contactLastName,
        contactPhone,
        contactEmail,
        address,
        cityId,
        districtId,
        taxOffice,
        taxId,
        iban,
        taxPlateUrl: taxPlateUrl || null,
        signatureCircularUrl: signatureCircularUrl || null,
        idCardFrontUrl: idCardFrontUrl || null,
        idCardBackUrl: idCardBackUrl || null,
        registryNumber: registryNumber || null,
        tradeRegistryGazetteUrl: tradeRegistryGazetteUrl || null,
        selectedWallIds: selectedWallIds || [],
        status: 'PENDING'
      }
    });

    // Doğrulama tokeni oluşturalım (firma mailinin onaylanması için)
    const token = crypto.randomBytes(32).toString('hex');
    await prisma.verificationToken.create({
      data: {
        identifier: contactEmail,
        token,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    });

    // Doğrulama mailini gönderelim
    try {
      await sendVerificationEmail(contactEmail, token);
    } catch (mailError) {
      console.error('Mail sending error (Merchant Registration):', mailError);
    }

    return NextResponse.json({ success: true, message: 'Başvurunuz başarıyla alındı. Lütfen e-postanıza gönderilen doğrulama linkine tıklayın.', applicationId: newApp.id });

  } catch (error) {
    console.error('Merchant Registration Error:', error);
    return NextResponse.json({ error: 'Kayıt işlemi sırasında bir hata oluştu.' }, { status: 500 });
  }
}
