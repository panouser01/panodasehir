import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json(
        { error: 'Bu işlem için giriş yapmalısınız' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const categoryId = params.id;

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Duvar ID gerekli' },
        { status: 400 }
      );
    }

    // Check if subscription already exists
    const existingSub = await prisma.wallSubscription.findUnique({
      where: {
        userId_categoryId: {
          userId,
          categoryId
        }
      }
    });

    if (existingSub) {
      // Unsubscribe
      await prisma.wallSubscription.delete({
        where: { id: existingSub.id }
      });
      return NextResponse.json({ subscribed: false, message: 'Abonelik iptal edildi' });
    } else {
      // Subscribe
      await prisma.wallSubscription.create({
        data: {
          userId,
          categoryId
        }
      });
      return NextResponse.json({ subscribed: true, message: 'Abonelik oluşturuldu' });
    }

  } catch (error) {
    console.error('API /walls/subscribe error:', error);
    return NextResponse.json(
      { error: 'İşlem sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ subscribed: false }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const categoryId = params.id;

    const existingSub = await prisma.wallSubscription.findUnique({
      where: {
        userId_categoryId: {
          userId,
          categoryId
        }
      }
    });

    return NextResponse.json({ subscribed: !!existingSub });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

