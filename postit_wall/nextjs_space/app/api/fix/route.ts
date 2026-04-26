import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
export const dynamic = 'force-dynamic';
export async function GET() {
  await prisma.siteSettings.updateMany({
    data: { backgroundColor: '#cca378', siteBackgroundColor: '#fffbeb' }
  });
  await prisma.category.updateMany({
    where: { name: 'Ana Duvar' },
    data: { noBorder: true, noInnerBorder: true, backgroundColor: '#cca378', siteBackgroundColor: '#fffbeb' }
  });
  return NextResponse.json({ success: true });
}
