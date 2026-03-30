'use server';

import axios from 'axios';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export async function getValidAccessToken() {
  const tokenRef = doc(db, "quickbooks_tokens", "singleton_token");
  const tokenSnap = await getDoc(tokenRef);

  if (!tokenSnap.exists()) {
      throw new Error('QuickBooks not connected.');
  }

  let tokenData = tokenSnap.data();

  // If access token is still valid, return it
  if (Date.now() < tokenData.accessTokenExpiresAt) {
    return { accessToken: tokenData.accessToken, realmId: tokenData.realmId };
  }
  
  // If access token is expired, refresh it
  console.log('QuickBooks access token expired, refreshing...');
  try {
    const res = await axios.post(
      'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: tokenData.refreshToken,
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

    const { access_token, refresh_token, expires_in, x_refresh_token_expires_in } = res.data;
    
    const newTokenData = {
        ...tokenData,
        accessToken: access_token,
        refreshToken: refresh_token,
        accessTokenExpiresAt: Date.now() + expires_in * 1000,
        refreshTokenExpiresAt: Date.now() + x_refresh_token_expires_in * 1000,
    };

    await setDoc(tokenRef, newTokenData);

    console.log('QuickBooks token refreshed successfully.');
    return { accessToken: newTokenData.accessToken, realmId: newTokenData.realmId };

  } catch (error: any) {
    console.error("Failed to refresh QuickBooks token:", error.response?.data || error.message);
    // If refresh fails, it's a critical error. The user may need to reconnect.
    throw new Error('Failed to refresh QuickBooks token. Please try reconnecting.');
  }
}
