'use server';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const realmId = searchParams.get('realmId');
  const returnedState = searchParams.get('state');
  
  const cookieStore = cookies();
  const storedState = cookieStore.get('qb_oauth_state')?.value;

  console.log("Returned state:", returnedState);
  console.log("Stored cookie:", storedState);

  // It's crucial to delete the state cookie after using it for security.
  cookieStore.delete('qb_oauth_state');

  const errorUrl = new URL('/clients', req.url);

  if (!storedState) {
    errorUrl.searchParams.set('error', 'invalid_state');
    errorUrl.searchParams.set('details', 'Your browser did not send the required security cookie. Please try clearing your cookies and connecting again.');
    return NextResponse.redirect(errorUrl);
  }

  if (!returnedState) {
    errorUrl.searchParams.set('error', 'invalid_state');
    errorUrl.searchParams.set('details', 'QuickBooks did not return the required security parameter. Please try connecting again.');
    return NextResponse.redirect(errorUrl);
  }

  // Compare the state returned from QuickBooks with the one stored in the cookie.
  if (decodeURIComponent(returnedState) !== storedState) {
    console.error("CSRF Warning: State parameter mismatch.", {
      returned: decodeURIComponent(returnedState),
      stored: storedState,
    });
    errorUrl.searchParams.set('error', 'invalid_state');
    errorUrl.searchParams.set('details', 'State parameter mismatch. Please try connecting again.');
    return NextResponse.redirect(errorUrl);
  }
  
  if (!code || !realmId) {
    errorUrl.searchParams.set('error', 'missing_params');
    errorUrl.searchParams.set('details', 'The connection was incomplete. Missing code or realmId from QuickBooks.');
    return NextResponse.redirect(errorUrl);
  }

  try {
    // Exchange the authorization code for access and refresh tokens
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

    const cookieOptions: Parameters<typeof cookies.set>[2] = {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 100 * 24 * 60 * 60, // ~100 days, aligns with refresh token expiry
    };

    // Set tokens in secure cookies
    cookieStore.set('qb_access_token', access_token, { ...cookieOptions, maxAge: expires_in });
    cookieStore.set('qb_refresh_token', refresh_token, cookieOptions);
    cookieStore.set('qb_realm_id', realmId, cookieOptions);
    cookieStore.set('qb_expires_at', expiresAt.toString(), cookieOptions);
    
    // Redirect to the dashboard on success
    const url = new URL('/clients', req.url);
    return NextResponse.redirect(url);

  } catch (error) {
    console.error('QuickBooks callback error:', error);
    const url = new URL('/clients', req.url);
    url.searchParams.set('error', 'callback_failed');
    if (axios.isAxiosError(error) && error.response) {
        url.searchParams.set('details', JSON.stringify(error.response.data));
    } else if (error instanceof Error) {
        url.searchParams.set('details', error.message);
    }
    return NextResponse.redirect(url);
  }
}
