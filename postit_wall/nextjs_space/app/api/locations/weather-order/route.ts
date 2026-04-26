import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const body = await req.json();
    const { orderedCityIds } = body;

    if (!Array.isArray(orderedCityIds)) {
      return NextResponse.json({ error: 'Geçersiz veri formatı' }, { status: 400 });
    }

    // Prisma'da transaction kullanarak tüm şehirlerin sırasını güncelleyelim.
    const updatePromises = orderedCityIds.map((id: string, index: number) => {
      return prisma.city.update({
        where: { id },
        data: { weatherOrder: index }
      });
    });

    await prisma.$transaction(updatePromises);

    return NextResponse.json({ success: true, message: 'Sıralama güncellendi.' });
  } catch (error: any) {
    console.error('Weather order update error:', error);
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}
