'use server';

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAdminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

const firestore = getAdminDb();


export async function GET(req: Request) {
    const { searchParams, origin } = new URL(req.url);
    const clientId = searchParams.get('clientId');
    const url = new URL('/clients', origin);

    try {
        const qbClientId = process.env.NEXT_PUBLIC_QB_CLIENT_ID;
        // Dynamically construct the redirect URI from the request origin
        const redirectUri = `${origin}/api/auth/callback`;
        
        if (!qbClientId) {
            throw new Error('QuickBooks Client ID is not configured. Please set NEXT_PUBLIC_QB_CLIENT_ID.');
        }

        if (!clientId) {
            throw new Error('Client ID is required to initiate QuickBooks connection.');
        }

        const state = crypto.randomUUID();

        // Store the state and clientId in Firestore to verify it in the callback
        await firestore.collection('oauth_states').add({
          state,
          clientId,
          createdAt: Timestamp.now(),
        });

        const authUrl =
          `https://appcenter.intuit.com/connect/oauth2` +
          `?client_id=${qbClientId}` +
          `&redirect_uri=${encodeURIComponent(redirectUri)}` +
          `&response_type=code` +
          `&scope=com.intuit.quickbooks.accounting` +
          `&state=${state}`;

        return NextResponse.redirect(new URL(authUrl));
    } catch (error: any) {
        console.error('[QB CONNECT ERROR]', error);
        url.searchParams.set('error', 'connect_failed');
        url.searchParams.set('details', error.message || 'Could not initiate connection.');
        return NextResponse.redirect(url);
    }
}
