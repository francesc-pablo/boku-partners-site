'use server';

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getSdks } from '@/firebase';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';

// Ensure Firebase is initialized
if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const { firestore } = getSdks();


export async function GET(req: Request) {
    const { searchParams, origin } = new URL(req.url);
    const clientId = searchParams.get('clientId');

  try {
    if (!clientId) {
        throw new Error('Client ID is required to initiate QuickBooks connection.');
    }

    const state = crypto.randomUUID();

    // Store the state and clientId in Firestore to verify it in the callback
    await addDoc(collection(firestore, 'oauth_states'), {
      state,
      clientId,
      createdAt: serverTimestamp(),
    });

    const authUrl =
      `https://appcenter.intuit.com/connect/oauth2` +
      `?client_id=${process.env.NEXT_PUBLIC_QB_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_QB_REDIRECT_URI!)}` +
      `&response_type=code` +
      `&scope=com.intuit.quickbooks.accounting` +
      `&state=${state}`;

    return NextResponse.redirect(new URL(authUrl));
  } catch (error: any) {
    console.error('[QB CONNECT ERROR]', error);
    const url = new URL('/clients', origin);
    url.searchParams.set('error', 'connect_failed');
    url.searchParams.set('details', error.message || 'Could not initiate connection.');
    return NextResponse.redirect(url);
  }
}
