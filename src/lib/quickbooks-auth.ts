'use server';

import axios from 'axios';
import { doc, getDocs, collection, query, orderBy, limit, serverTimestamp, updateDoc, getFirestore } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';

// Ensure Firebase is initialized for server-side use
if (!getApps().length) {
  initializeApp(firebaseConfig);
}
const firestore = getFirestore();

export async function getValidAccessToken(clientId: string) {
  if (!clientId) {
      throw new Error('Client ID is required to get QuickBooks access token.');
  }

  const integrationCollectionRef = collection(firestore, 'clients', clientId, 'quickBooksIntegration');
  // Get the most recently created integration document.
  const q = query(integrationCollectionRef, orderBy('connectedAt', 'desc'), limit(1));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
      throw new Error('QuickBooks not connected for this client.');
  }
  
  const tokenDoc = snapshot.docs[0];
  let tokenData = tokenDoc.data();
  
  // Timestamps might be Firestore Timestamp objects, so we convert them to JS Dates
  const accessTokenExpiresAt = tokenData.accessTokenExpiresAt.toDate ? tokenData.accessTokenExpiresAt.toDate() : new Date(tokenData.accessTokenExpiresAt);
  
  if (Date.now() < accessTokenExpiresAt.getTime()) {
    return { accessToken: tokenData.accessToken, realmId: tokenData.realmId };
  }
  
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
              `${process.env.NEXT_PUBLIC_QB_CLIENT_ID}:${process.env.NEXT_PUBLIC_QB_CLIENT_SECRET}`
            ).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, refresh_token, expires_in, x_refresh_token_expires_in } = res.data;
    
    const newTokenData = {
        accessToken: access_token,
        refreshToken: refresh_token,
        accessTokenExpiresAt: new Date(Date.now() + expires_in * 1000),
        refreshTokenExpiresAt: new Date(Date.now() + x_refresh_token_expires_in * 1000),
        updatedAt: serverTimestamp()
    };

    await updateDoc(tokenDoc.ref, newTokenData);

    console.log('QuickBooks token refreshed successfully.');
    return { accessToken: newTokenData.accessToken, realmId: tokenData.realmId };

  } catch (error: any) {
    console.error("Failed to refresh QuickBooks token:", error.response?.data || error.message);
    throw new Error('Failed to refresh QuickBooks token. Please try reconnecting.');
  }
}
