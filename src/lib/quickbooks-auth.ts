'use server';

import axios from 'axios';
import { adminFirestore } from '@/lib/firebase-admin';

interface QuickBooksConnection {
  userId: string;
  realmId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  createdAt: number;
}

const db = adminFirestore;
const connectionsCollection = db.collection('quickbooks_connections');

export async function getQuickbooksConnection(userId: string) {
  const doc = await connectionsCollection.doc(userId).get();
  if (!doc.exists) {
    return null;
  }
  return doc.data() as QuickBooksConnection;
}

export async function saveQuickbooksConnection({
  userId,
  realmId,
  accessToken,
  refreshToken,
  expiresAt,
}: {
  userId: string;
  realmId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}) {
  const connectionData: QuickBooksConnection = {
    userId,
    realmId,
    accessToken,
    refreshToken,
    expiresAt,
    createdAt: Date.now(),
  };
  await connectionsCollection.doc(userId).set(connectionData, { merge: true });
}

export async function getValidAccessToken(userId: string) {
  const connection = await getQuickbooksConnection(userId);

  if (!connection) {
    throw new Error('QuickBooks not connected for this user.');
  }

  // If token is not expired, return it
  if (Date.now() < connection.expiresAt) {
    return {
      accessToken: connection.accessToken,
      realmId: connection.realmId,
    };
  }

  // If token is expired, refresh it
  console.log('QuickBooks token expired, refreshing...');
  const res = await axios.post(
    'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
    new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: connection.refreshToken,
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

  const data = res.data;
  const newConnection = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  // Save the new tokens to the database
  await connectionsCollection.doc(userId).set(newConnection, { merge: true });

  console.log('QuickBooks token refreshed successfully.');
  return {
    accessToken: newConnection.accessToken,
    realmId: connection.realmId,
  };
}
