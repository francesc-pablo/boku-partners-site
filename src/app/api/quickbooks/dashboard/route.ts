'use server';

import { NextResponse } from 'next/server';
import { getValidAccessToken } from '@/lib/quickbooks-auth';
import { getDashboardData } from '@/lib/quickbooks-service';
import { parseQuickBooksData } from '@/lib/quickbooks-transforms';

export async function GET() {
  try {
    const { accessToken, realmId } = await getValidAccessToken();
    const rawData = await getDashboardData({ token: accessToken, realmId });

    if (!rawData.pnl) {
       return NextResponse.json({ error: 'Failed to fetch essential QuickBooks data.' }, { status: 500 });
    }
    
    const processedData = parseQuickBooksData(rawData);

    return NextResponse.json(processedData);

  } catch (error: any) {
    console.error('[QB Dashboard API Error]', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes('QuickBooks not connected') || errorMessage.includes('Failed to refresh QuickBooks token')) {
        return NextResponse.json({ error: errorMessage }, { status: 404 });
    }
    
    return NextResponse.json({ error: 'An internal server error occurred while fetching dashboard data.', details: errorMessage }, { status: 500 });
  }
}
