'use server';

import { NextResponse } from 'next/server';
import axios from 'axios';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { subMinutes } from 'date-fns';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const realmId = searchParams.get('realmId');
  const returnedState = searchParams.get('state');

  const errorUrl = new URL('/clients', req.url);

  // Debugging logs from user guide
  console.log("CALLBACK TRIGGERED");
  console.log("CODE:", code);
  console.log("REALM ID:", realmId);
  console.log("RETURNED STATE:", returnedState);
  
  if (!returnedState) {
    errorUrl.searchParams.set('error', 'missing_state');
    errorUrl.searchParams.set('details', 'QuickBooks did not return a state parameter. Authentication failed.');
    return NextResponse.redirect(errorUrl);
  }

  try {
    const q = query(collection(db, 'oauth_states'), where('state', '==', returnedState));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error("Invalid or expired state parameter.", { returnedState });
      errorUrl.searchParams.set('error', 'invalid_state');
      errorUrl.searchParams.set('details', 'Invalid or expired state parameter. Please try connecting again.');
      return NextResponse.redirect(errorUrl);
    }

    const stateDoc = querySnapshot.docs[0];
    const docData = stateDoc.data();

    const tenMinutesAgo = subMinutes(new Date(), 10);
    if (docData.createdAt.toDate() < tenMinutesAgo) {
        await deleteDoc(stateDoc.ref);
        console.error("Expired state parameter.", { returnedState });
        errorUrl.searchParams.set('error', 'expired_state');
        errorUrl.searchParams.set('details', 'Your connection request has expired. Please try again.');
        return NextResponse.redirect(errorUrl);
    }
    
    await deleteDoc(stateDoc.ref);
    console.log("State validated and deleted successfully.");
    
    if (!code || !realmId) {
      errorUrl.searchParams.set('error', 'missing_params');
      errorUrl.searchParams.set('details', 'The connection was incomplete. Missing code or realmId from QuickBooks.');
      return NextResponse.redirect(errorUrl);
    }

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

    console.log("TOKEN RESPONSE:", tokenResponse.data);
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
    console.log("Redirecting to client dashboard...");
    return NextResponse.redirect(url);

  } catch (error) {
    console.error('QuickBooks callback error:', error);
    const url = new URL('/clients', req.url);
    url.searchParams.set('error', 'callback_failed');
    if (axios.isAxiosError(error) && error.response) {
        console.error("QuickBooks API Error during token exchange:", error.response.data);
        url.searchParams.set('details', JSON.stringify(error.response.data));
    } else if (error instanceof Error) {
        url.searchParams.set('details', error.message);
    }
    return NextResponse.redirect(url);
  }
}
