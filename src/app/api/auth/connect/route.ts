import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/session';

// This route is now called from the client with a bearer token
// to securely get the user's ID.
export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromRequest(req);
    
    // The state parameter is used to pass the userId to the callback
    const state = Buffer.from(JSON.stringify({ userId })).toString('base64');

    const authUrl =
      `https://appcenter.intuit.com/connect/oauth2` +
      `?client_id=${process.env.QB_CLIENT_ID}` +
      `&redirect_uri=${process.env.QB_REDIRECT_URI}` +
      `&response_type=code` +
      `&scope=com.intuit.quickbooks.accounting` +
      `&state=${state}`;
      
    return NextResponse.json({ url: authUrl });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
