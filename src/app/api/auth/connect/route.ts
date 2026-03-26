import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function GET() {
  // Create a CSRF token to prevent cross-site request forgery attacks
  const state = crypto.randomBytes(16).toString('hex');
  cookies().set('qb_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    maxAge: 60 * 15, // 15 minutes
    path: '/',
  });

  const authUrl =
    `https://appcenter.intuit.com/connect/oauth2` +
    `?client_id=${process.env.QB_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.QB_REDIRECT_URI!)}` +
    `&response_type=code` +
    `&scope=com.intuit.quickbooks.accounting` +
    `&state=${state}`;

  return NextResponse.redirect(new URL(authUrl));
}
