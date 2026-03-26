import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/session';
import { getValidAccessToken } from '@/lib/quickbooks-auth';
import { getDashboardData } from '@/lib/quickbooks-service';
import { parseQuickBooksData } from '@/lib/quickbooks-transforms';

export async function GET(req: Request) {
  try {
    const userId = await getUserIdFromRequest(req);
    const { accessToken, realmId } = await getValidAccessToken(userId);
    const rawData = await getDashboardData({ token: accessToken, realmId });

    if (!rawData.pnl) {
       return NextResponse.json({ error: 'Failed to fetch essential QuickBooks data.' }, { status: 500 });
    }
    
    const processedData = parseQuickBooksData(rawData);

    return NextResponse.json(processedData);

  } catch (error: any) {
    console.error('[QB Dashboard API Error]', error.message);
    // If the error is "QuickBooks not connected", send a specific status
    if (error.message.includes('QuickBooks not connected')) {
        return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
