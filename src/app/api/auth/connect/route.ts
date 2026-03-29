'use server';

import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET() {
  if (!process.env.CSRF_SECRET) {
    throw new Error('CSRF_SECRET environment variable is not set.');
  }

  // Create a stateless CSRF token by signing a nonce
  const nonce = crypto.randomBytes(16).toString('hex');
  const secret = process.env.CSRF_SECRET;

  const signature = crypto
    .createHmac('sha256', secret)
    .update(nonce)
    .digest('hex');
  
  const state = `${nonce}.${signature}`;

  const authUrl =
    `https://appcenter.intuit.com/connect/oauth2` +
    `?client_id=${process.env.QB_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.QB_REDIRECT_URI!)}` +
    `&response_type=code` +
    `&scope=com.intuit.quickbooks.accounting` +
    `&state=${state}`;

  return NextResponse.redirect(new URL(authUrl));
}
