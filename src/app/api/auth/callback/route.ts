'use server';

import { NextResponse } from 'next/server';
import axios from 'axios';
import { getAdminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

const firestore = getAdminDb();

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get('code');
  const realmId = searchParams.get('realmId');
  const returnedState = searchParams.get('state');
  
  const errorUrl = new URL('/clients', origin);

  try {
    const qbClientId = process.env.NEXT_PUBLIC_QB_CLIENT_ID;
    const qbClientSecret = process.env.QB_CLIENT_SECRET; // Use server-only secret
    const redirectUri = `${origin}/api/auth/callback`; // Dynamic redirect URI

    if (!qbClientId || !qbClientSecret) {
        throw new Error('QuickBooks environment variables (client ID or secret) are not configured on the server.');
    }

    if (!returnedState) {
      throw new Error('State parameter is missing from the QuickBooks redirect.');
    }
    
    if (!code || !realmId) {
      throw new Error('Incomplete data from QuickBooks. Missing code or realmId.');
    }

    const q = firestore.collection('oauth_states').where('state', '==', returnedState);
    const querySnapshot = await q.get();

    if (querySnapshot.empty) {
      throw new Error('Invalid or expired state parameter. Please try connecting again.');
    }

    const stateDoc = querySnapshot.docs[0];
    const { clientId } = stateDoc.data();
    await stateDoc.ref.delete();

    if (!clientId) {
      throw new Error('Client ID not found in state document. Cannot connect QuickBooks account.');
    }

    const tokenResponse = await axios.post(
      'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
      {
        headers: {
          Authorization: 'Basic ' + Buffer.from(`${qbClientId}:${qbClientSecret}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, refresh_token, expires_in, x_refresh_token_expires_in, scope } = tokenResponse.data;
    
    if (!access_token || !refresh_token) {
        throw new Error("Token exchange failed. Did not receive access_token or refresh_token.");
    }
    
    const integrationCollectionRef = firestore.collection('clients').doc(clientId).collection('quickBooksIntegration');
    const newIntegrationDocRef = integrationCollectionRef.doc();
    
    // Create a new integration document.
    await newIntegrationDocRef.set({
      id: newIntegrationDocRef.id,
      clientId: clientId,
      accessToken: access_token,
      refreshToken: refresh_token,
      realmId: realmId,
      accessTokenExpiresAt: new Date(Date.now() + expires_in * 1000),
      refreshTokenExpiresAt: new Date(Date.now() + x_refresh_token_expires_in * 1000),
      scope: scope || 'com.intuit.quickbooks.accounting',
      connectedAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    // Update the client document to reflect the connection status.
    const clientRef = firestore.collection('clients').doc(clientId);
    await clientRef.update({ isQuickBooksConnected: true });

    const successUrl = new URL('/clients', origin);
    successUrl.searchParams.set('success', 'true');
    return NextResponse.redirect(successUrl);

  } catch (error: any) {
    console.error('❌ QUICKBOOKS CALLBACK ERROR:', error.response?.data || error.message);
    errorUrl.searchParams.set('error', 'callback_failed');
    
    let details = 'An internal server error occurred.';
    if (axios.isAxiosError(error) && error.response?.data) {
        details = `API Error: ${JSON.stringify(error.response.data)}`;
    } else if (error instanceof Error) {
        details = error.message;
    }
    
    errorUrl.searchParams.set('details', details);
    return NextResponse.redirect(errorUrl);
  }
}
