'use server';

import axios from 'axios';
import { cookies, headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const realmId = searchParams.get('realmId');
  const state = searchParams.get('state');

  if (state !== '123') {
    return NextResponse.json({ error: 'Invalid state parameter' }, { status: 400 });
  }

  if (!code || !realmId) {
    return NextResponse.json({ error: 'Missing code or realmId' }, { status: 400 });
  }

  const headersList = headers();
  const host = headersList.get('x-forwarded-host') || headersList.get('host');
  const protocol = headersList.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https');
  const redirectUri = `${protocol}://${host}/api/auth/callback`;

  try {
    const response = await axios.post(
      'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code!,
        redirect_uri: redirectUri,
      }),
      {
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(
              `${process.env.QB_CLIENT_ID}:${process.env.QB_CLIENT_SECRET}`
            ).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token } = response.data; // We no longer use the refresh_token

    const cookieStore = cookies();
    const cookieOptions = { 
        secure: protocol === 'https', 
        path: '/', 
        sameSite: 'lax' as const 
    };

    cookieStore.set('qb_access_token', access_token, cookieOptions);
    cookieStore.set('qb_realm_id', realmId, cookieOptions);
    
    return NextResponse.redirect(`${protocol}://${host}/clients`);

  } catch (error) {
    console.error('QuickBooks callback error:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('QuickBooks API Error Response:', error.response.data);
    }
    return NextResponse.json({ error: 'Failed to exchange authorization code for token.' }, { status: 500 });
  }
}
