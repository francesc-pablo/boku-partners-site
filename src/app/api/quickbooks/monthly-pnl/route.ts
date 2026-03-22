'use server';

import { NextResponse } from 'next/server';
import { getMonthlyPnlCashRaw } from '@/lib/quickbooks';

export async function GET() {
  const result = await getMonthlyPnlCashRaw(6);

  if ((result as any).error) {
    return NextResponse.json({ error: (result as any).error }, { status: (result as any).status });
  }

  return NextResponse.json(result.data);
}
