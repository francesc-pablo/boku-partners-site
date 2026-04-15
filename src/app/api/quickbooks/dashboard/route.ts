'use server';

import { NextResponse } from 'next/server';
import { getValidAccessToken } from '@/lib/quickbooks-auth';
import { getDashboardData } from '@/lib/quickbooks-service';
import { format } from 'date-fns';

export async function GET(req: Request) {
  try {
    const { accessToken, realmId } = await getValidAccessToken();
    const { searchParams } = new URL(req.url);

    const defaultStartDate = '2025-07-01';
    const defaultEndDate = format(new Date(), 'yyyy-MM-dd');

    const startDate = searchParams.get('startDate') || defaultStartDate;
    const endDate = searchParams.get('endDate') || defaultEndDate;
    
    const data = await getDashboardData({ token: accessToken, realmId, startDate, endDate });

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('[QB Dashboard API Error]', error);
    
    let errorMessage = 'An internal server error occurred while fetching dashboard data.';
    let errorDetails;

    if (error instanceof Error) {
        errorMessage = error.message;
        // Capture stack for server-side logging, but don't expose to client
    } else {
        errorMessage = String(error);
    }
    
    if (errorMessage.includes('QuickBooks not connected') || errorMessage.includes('Failed to refresh QuickBooks token')) {
        return NextResponse.json({ error: errorMessage }, { status: 404 });
    }
    
    return NextResponse.json({ error: 'An internal server error occurred while fetching dashboard data.', details: error.message }, { status: 500 });
  }
}
