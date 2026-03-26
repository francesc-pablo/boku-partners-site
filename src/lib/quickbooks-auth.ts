'use server';

import axios from 'axios';
import { cookies } from 'next/headers';

export async function getValidAccessToken() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('qb_access_token')?.value;
  const refreshToken = cookieStore.get('qb_refresh_token')?.value;
  const realmId = cookieStore.get('qb_realm_id')?.value;
  const expiresAt = parseInt(cookieStore.get('qb_expires_at')?.value || '0');

  if (!refreshToken || !realmId) {
    throw new Error('QuickBooks not connected.');
  }

  // If token is valid, return it
  if (accessToken && Date.now() < expiresAt) {
    return { accessToken, realmId };
  }
  
  // If token is expired or missing, refresh it
  console.log('QuickBooks token expired or missing, refreshing...');
  try {
    const res = await axios.post(
      'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
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

    const { access_token: newAccessToken, refresh_token: newRefreshToken, expires_in } = res.data;
    const newExpiresAt = Date.now() + expires_in * 1000;
    
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        path: '/',
        maxAge: 100 * 24 * 60 * 60, // ~100 days
    };

    // Set new tokens in secure, httpOnly cookies
    cookieStore.set('qb_access_token', newAccessToken, { ...cookieOptions, maxAge: expires_in });
    cookieStore.set('qb_refresh_token', newRefreshToken, cookieOptions);
    cookieStore.set('qb_expires_at', newExpiresAt.toString(), cookieOptions);

    console.log('QuickBooks token refreshed successfully.');
    return { accessToken: newAccessToken, realmId };
  } catch (error) {
    console.error("Failed to refresh QuickBooks token", error);
    // If refresh fails, clear cookies to force re-authentication
    cookieStore.delete('qb_access_token');
    cookieStore.delete('qb_refresh_token');
    cookieStore.delete('qb_realm_id');
    cookieStore.delete('qb_expires_at');
    throw new Error('Failed to refresh token. Please reconnect QuickBooks.');
  }
}
