import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const realmId = searchParams.get('realmId');
  const state = searchParams.get('state');

  const savedState = cookies().get('qb_oauth_state')?.value;
  
  if (!state || !savedState || state !== savedState) {
    return NextResponse.json({ error: 'Invalid state parameter. Authentication failed.' }, { status: 401 });
  }

  // Clear the state cookie now that it has been used
  cookies().delete('qb_oauth_state');

  if (!code || !realmId) {
    return NextResponse.json({ error: 'Authorization denied or missing required parameters.' }, { status: 400 });
  }

  try {
    const tokenResponse = await axios.post(
      'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.QB_REDIRECT_URI!,
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

    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    const expiresAt = Date.now() + expires_in * 1000;

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        path: '/',
        maxAge: 100 * 24 * 60 * 60, // ~100 days, aligns with refresh token expiry
    };

    // Set tokens in secure, httpOnly cookies
    cookies().set('qb_access_token', access_token, { ...cookieOptions, maxAge: expires_in });
    cookies().set('qb_refresh_token', refresh_token, cookieOptions);
    cookies().set('qb_realm_id', realmId, cookieOptions);
    cookies().set('qb_expires_at', expiresAt.toString(), cookieOptions);
    
    // Redirect to the dashboard
    const url = new URL('/clients', req.url);
    return NextResponse.redirect(url);

  } catch (error) {
    console.error('QuickBooks callback error:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('QuickBooks API Error Response:', error.response.data);
    }
    const url = new URL('/clients?error=callback_failed', req.url);
    return NextResponse.redirect(url);
  }
}
