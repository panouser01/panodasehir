import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { id: followingId } = params;

    const follower = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, nickname: true }
    });

    if (!follower) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    if (follower.id === followingId) {
       return NextResponse.json({ error: 'Kendinizi takip edemezsiniz' }, { status: 400 });
    }

    // Check if subscription exists
    const existingSub = await prisma.userSubscription.findUnique({
      where: {
        followerId_followingId: {
          followerId: follower.id,
          followingId: followingId
        }
      }
    });

    let isSubscribed = false;

    if (existingSub) {
      // Unsubscribe
      await prisma.userSubscription.delete({
        where: { id: existingSub.id }
      });
      isSubscribed = false;
    } else {
      // Subscribe
      await prisma.userSubscription.create({
        data: {
          followerId: follower.id,
          followingId: followingId
        }
      });
      isSubscribed = true;
    }

    return NextResponse.json({ success: true, isSubscribed });
  } catch (error) {
    console.error('Follow toggle error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ isSubscribed: false });
    }

    const follower = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!follower) {
      return NextResponse.json({ isSubscribed: false });
    }

    const followingId = params.id;

    const existingSub = await prisma.userSubscription.findUnique({
      where: {
        followerId_followingId: {
          followerId: follower.id,
          followingId: followingId
        }
      }
    });

    return NextResponse.json({ isSubscribed: !!existingSub });
  } catch (error) {
    console.error('Follow check error:', error);
    return NextResponse.json({ isSubscribed: false });
  }
}
