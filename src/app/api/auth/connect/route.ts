'use server';

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function GET() {
  try {
    const state = crypto.randomUUID();

    // Store the state in Firestore to verify it in the callback
    await addDoc(collection(db, 'oauth_states'), {
      state,
      createdAt: serverTimestamp(),
    });

    const authUrl =
      `https://appcenter.intuit.com/connect/oauth2` +
      `?client_id=${process.env.QB_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(process.env.QB_REDIRECT_URI!)}` +
      `&response_type=code` +
      `&scope=com.intuit.quickbooks.accounting` +
      `&state=${state}`;

    return NextResponse.redirect(new URL(authUrl));
  } catch (error: any) {
    console.error('[QB CONNECT ERROR]', error);
    const url = new URL('/clients', 'http://localhost:9002'); // Base URL is required
    url.searchParams.set('error', 'connect_failed');
    url.searchParams.set('details', error.message || 'Could not initiate connection.');
    return NextResponse.redirect(url);
  }
}
