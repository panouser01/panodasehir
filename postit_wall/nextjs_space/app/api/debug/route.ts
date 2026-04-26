import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
export const dynamic = 'force-dynamic';
export async function GET() {
  const anaDuvar = await prisma.category.findFirst({ where: { name: 'Ana Duvar' } });
  const siteSettings = await prisma.siteSettings.findUnique({ where: { id: 'global' } });
  return NextResponse.json({ anaDuvar, siteSettings });
}
