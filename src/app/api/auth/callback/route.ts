'use server';

import axios from 'axios';
import { NextResponse } from 'next/server';
import { saveQuickbooksConnection } from '@/lib/quickbooks-auth';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const realmId = searchParams.get('realmId');
  const state = searchParams.get('state');

  if (!code || !realmId || !state) {
    return NextResponse.json({ error: 'Missing code, realmId, or state' }, { status: 400 });
  }

  try {
    const { userId } = JSON.parse(Buffer.from(state, 'base64').toString('ascii'));
    if (!userId) {
      throw new Error('Invalid state: userId missing');
    }

    const tokenResponse = await axios.post(
      'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code!,
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

    await saveQuickbooksConnection({
      userId,
      realmId,
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: Date.now() + expires_in * 1000,
    });
    
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
