'use server';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  console.log('--- QuickBooks Callback Initiated ---');

  const code = searchParams.get('code');
  const realmId = searchParams.get('realmId');
  const state = searchParams.get('state');

  console.log(`Received code: ${code ? 'Yes' : 'No'}`);
  console.log(`Received realmId: ${realmId || 'N/A'}`);
  console.log(`Received state from URL: ${state || 'N/A'}`);

  const savedState = cookies().get('qb_oauth_state')?.value;
  console.log(`Retrieved state from cookie: ${savedState || 'N/A'}`);
  
  if (!state || !savedState || state !== savedState) {
    console.error('State mismatch. Authentication failed.');
    console.error(`URL state: ${state}, Cookie state: ${savedState}`);
    console.log('--- QuickBooks Callback Finished (Error) ---');
    const errorUrl = new URL('/clients?error=invalid_state', req.url);
    errorUrl.searchParams.set('details', 'State parameter mismatch. Please try connecting again.');
    return NextResponse.redirect(errorUrl);
  }

  console.log('State validation successful.');

  // Clear the state cookie now that it has been used
  cookies().delete('qb_oauth_state');
  console.log('State cookie deleted.');

  if (!code || !realmId) {
    console.error('Missing code or realmId from callback.');
    const errorUrl = new URL('/clients?error=missing_params', req.url);
    return NextResponse.redirect(errorUrl);
  }

  try {
    console.log('Requesting access token from QuickBooks...');
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
    console.log('Successfully received access token.');

    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    const expiresAt = Date.now() + expires_in * 1000;

    const cookieOptions: Parameters<typeof cookies.set>[2] = {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 100 * 24 * 60 * 60, // ~100 days, aligns with refresh token expiry
    };

    console.log('Setting final authentication cookies.');
    // Set tokens in secure cookies
    cookies().set('qb_access_token', access_token, { ...cookieOptions, maxAge: expires_in });
    cookies().set('qb_refresh_token', refresh_token, cookieOptions);
    cookies().set('qb_realm_id', realmId, cookieOptions);
    cookies().set('qb_expires_at', expiresAt.toString(), cookieOptions);
    
    console.log('Redirecting to dashboard...');
    console.log('--- QuickBooks Callback Finished (Success) ---');
    // Redirect to the dashboard
    const url = new URL('/clients', req.url);
    return NextResponse.redirect(url);

  } catch (error) {
    console.error('QuickBooks callback error during token exchange:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('QuickBooks API Error Response:', error.response.data);
    }
    const url = new URL('/clients?error=callback_failed', req.url);
    if (axios.isAxiosError(error) && error.response) {
        url.searchParams.set('details', JSON.stringify(error.response.data));
    }
    console.log('--- QuickBooks Callback Finished (Error) ---');
    return NextResponse.redirect(url);
  }
}
