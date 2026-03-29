'use server';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';
import crypto from 'crypto';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const realmId = searchParams.get('realmId');
  const state = searchParams.get('state');

  // Verify the stateless CSRF token
  if (!process.env.CSRF_SECRET) {
    throw new Error('CSRF_SECRET environment variable is not set.');
  }

  if (!state || !state.includes('.')) {
    const errorUrl = new URL('/clients', req.url);
    errorUrl.searchParams.set('error', 'invalid_state');
    errorUrl.searchParams.set('details', 'State parameter is missing or malformed.');
    return NextResponse.redirect(errorUrl);
  }

  const [nonce, signature] = state.split('.');
  const secret = process.env.CSRF_SECRET;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(nonce)
    .digest('hex');

  // Use timing-safe comparison to prevent timing attacks
  try {
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      const errorUrl = new URL('/clients', req.url);
      errorUrl.searchParams.set('error', 'invalid_state');
      errorUrl.searchParams.set('details', 'State signature mismatch.');
      return NextResponse.redirect(errorUrl);
    }
  } catch (e) {
      const errorUrl = new URL('/clients', req.url);
      errorUrl.searchParams.set('error', 'invalid_state');
      errorUrl.searchParams.set('details', 'Invalid state signature format.');
      return NextResponse.redirect(errorUrl);
  }
  
  if (!code || !realmId) {
    const errorUrl = new URL('/clients', req.url);
    errorUrl.searchParams.set('error', 'missing_params');
    return NextResponse.redirect(errorUrl);
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

    const cookieOptions: Parameters<typeof cookies.set>[2] = {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 100 * 24 * 60 * 60, // ~100 days, aligns with refresh token expiry
    };

    // Set tokens in secure cookies
    cookies().set('qb_access_token', access_token, { ...cookieOptions, maxAge: expires_in });
    cookies().set('qb_refresh_token', refresh_token, cookieOptions);
    cookies().set('qb_realm_id', realmId, cookieOptions);
    cookies().set('qb_expires_at', expiresAt.toString(), cookieOptions);
    
    // Redirect to the dashboard
    const url = new URL('/clients', req.url);
    return NextResponse.redirect(url);

  } catch (error) {
    console.error('QuickBooks callback error:', error);
    const url = new URL('/clients', req.url);
    url.searchParams.set('error', 'callback_failed');
    if (axios.isAxiosError(error) && error.response) {
        url.searchParams.set('details', JSON.stringify(error.response.data));
    }
    return NextResponse.redirect(url);
  }
}
