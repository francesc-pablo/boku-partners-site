'use server';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { subMinutes } from 'date-fns';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const realmId = searchParams.get('realmId');
  const returnedState = searchParams.get('state');

  const errorUrl = new URL('/clients', req.url);

  if (!returnedState) {
    errorUrl.searchParams.set('error', 'missing_state');
    errorUrl.searchParams.set('details', 'QuickBooks did not return a state parameter. Authentication failed.');
    return NextResponse.redirect(errorUrl);
  }

  try {
    // Verify the state parameter against Firestore
    const q = query(collection(db, 'oauth_states'), where('state', '==', returnedState));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error("Invalid or expired state parameter.", { returnedState });
      errorUrl.searchParams.set('error', 'invalid_state');
      errorUrl.searchParams.set('details', 'Invalid or expired state parameter. Please try connecting again.');
      return NextResponse.redirect(errorUrl);
    }

    const doc = querySnapshot.docs[0];
    const docData = doc.data();

    // Optional: Check if the state is recent (e.g., created in the last 10 minutes)
    const tenMinutesAgo = subMinutes(new Date(), 10);
    if (docData.createdAt.toDate() < tenMinutesAgo) {
        await deleteDoc(doc.ref); // Clean up expired state
        console.error("Expired state parameter.", { returnedState });
        errorUrl.searchParams.set('error', 'expired_state');
        errorUrl.searchParams.set('details', 'Your connection request has expired. Please try again.');
        return NextResponse.redirect(errorUrl);
    }
    
    // Delete the state from Firestore so it can't be used again
    await deleteDoc(doc.ref);
    
    if (!code || !realmId) {
      errorUrl.searchParams.set('error', 'missing_params');
      errorUrl.searchParams.set('details', 'The connection was incomplete. Missing code or realmId from QuickBooks.');
      return NextResponse.redirect(errorUrl);
    }

    // Exchange the authorization code for access and refresh tokens
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

    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    const expiresAt = Date.now() + expires_in * 1000;

    const cookieOptions: Parameters<typeof cookies.set>[2] = {
        httpOnly: true,
        secure: true, // Set to true for production with HTTPS
        sameSite: 'lax',
        path: '/',
        maxAge: 100 * 24 * 60 * 60, // ~100 days, aligns with refresh token expiry
    };

    // Set tokens in secure cookies
    const cookieStore = cookies();
    cookieStore.set('qb_access_token', access_token, { ...cookieOptions, maxAge: expires_in });
    cookieStore.set('qb_refresh_token', refresh_token, cookieOptions);
    cookieStore.set('qb_realm_id', realmId, cookieOptions);
    cookieStore.set('qb_expires_at', expiresAt.toString(), cookieOptions);
    
    // Redirect to the dashboard on success
    const url = new URL('/clients', req.url);
    return NextResponse.redirect(url);

  } catch (error) {
    console.error('QuickBooks callback error:', error);
    const url = new URL('/clients', req.url);
    url.searchParams.set('error', 'callback_failed');
    if (axios.isAxiosError(error) && error.response) {
        url.searchParams.set('details', JSON.stringify(error.response.data));
    } else if (error instanceof Error) {
        url.searchParams.set('details', error.message);
    }
    return NextResponse.redirect(url);
  }
}
