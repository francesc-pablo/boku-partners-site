'use server';

import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET() {
  // A random nonce for CSRF protection.
  const state = JSON.stringify({
    nonce: crypto.randomUUID(),
  });
  
  const encodedState = encodeURIComponent(state);

  const authUrl =
    `https://appcenter.intuit.com/connect/oauth2` +
    `?client_id=${process.env.QB_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.QB_REDIRECT_URI!)}` +
    `&response_type=code` +
    `&scope=com.intuit.quickbooks.accounting` +
    `&state=${encodedState}`;

  const response = NextResponse.redirect(new URL(authUrl));

  // Store state in a secure, http-only cookie to be verified in the callback
  response.cookies.set('qb_oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10, // 10 minutes
  });

  return response;
}
