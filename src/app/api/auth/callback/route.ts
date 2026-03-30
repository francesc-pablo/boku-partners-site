'use server';

import { NextResponse } from 'next/server';
import axios from 'axios';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const realmId = searchParams.get('realmId');
  const returnedState = searchParams.get('state');
  
  const errorUrl = new URL('/clients', req.url);

  try {
    console.log("CALLBACK TRIGGERED");
    console.log("CODE:", code);
    console.log("REALM ID:", realmId);
    console.log("RETURNED STATE:", returnedState);

    if (!returnedState) {
      throw new Error('State parameter is missing from the QuickBooks redirect.');
    }
    
    if (!code || !realmId) {
      throw new Error('Incomplete data from QuickBooks. Missing code or realmId.');
    }

    const q = query(collection(db, 'oauth_states'), where('state', '==', returnedState));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error("Invalid or expired state parameter.", { returnedState });
      throw new Error('Invalid or expired state parameter. Please try connecting again.');
    }

    const stateDoc = querySnapshot.docs[0];
    await deleteDoc(stateDoc.ref);
    console.log("State validated and deleted successfully.");

    console.log("Exchanging authorization code for tokens...");
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

    console.log("TOKEN RESPONSE:", JSON.stringify(tokenResponse.data, null, 2));
    const { access_token, refresh_token, expires_in, x_refresh_token_expires_in } = tokenResponse.data;
    
    if (!access_token || !refresh_token) {
        throw new Error("Token exchange failed. Did not receive access_token or refresh_token.");
    }
    
    const tokenData = {
      accessToken: access_token,
      refreshToken: refresh_token,
      realmId: realmId,
      accessTokenExpiresAt: Date.now() + expires_in * 1000,
      refreshTokenExpiresAt: Date.now() + x_refresh_token_expires_in * 1000,
    };
    
    console.log("Saving token data to Firestore...");
    const tokenRef = doc(db, "quickbooks_tokens", "singleton_token");
    await setDoc(tokenRef, tokenData);
    console.log("Token data saved successfully to Firestore.");
    
    const url = new URL('/clients', req.url);
    url.searchParams.set('success', 'true');
    console.log("Redirecting to client dashboard...");
    return NextResponse.redirect(url);

  } catch (error: any) {
    console.error('❌ QUICKBOOKS CALLBACK ERROR:', error.response?.data || error.message);
    errorUrl.searchParams.set('error', 'callback_failed');
    
    let details = 'An internal server error occurred.';
    if (axios.isAxiosError(error)) {
        details = JSON.stringify(error.response?.data) || error.message;
    } else if (error instanceof Error) {
        details = error.message;
    }
    
    errorUrl.searchParams.set('details', details);
    return NextResponse.redirect(errorUrl);
  }
}
