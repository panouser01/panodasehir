import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const postit = await prisma.postIt.update({
      where: { id: params.id },
      data: {
        sharesCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ success: true, sharesCount: postit.sharesCount });
  } catch (error) {
    console.error('Error incrementing share count:', error);
    return NextResponse.json({ error: 'Paylaşım sayısı artırılamadı' }, { status: 500 });
  }
}
