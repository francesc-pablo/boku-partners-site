'use server';

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function GET() {
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
}
