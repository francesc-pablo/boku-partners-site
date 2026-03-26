'use server';

import { headers } from 'next/headers';
import { adminAuth } from '@/lib/firebase-admin';

export async function getUserIdFromRequest(req: Request): Promise<string> {
  const authorization = headers().get('Authorization');
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new Error('Unauthorized: Missing or invalid authorization header.');
  }
  const idToken = authorization.split('Bearer ')[1];
  
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken.uid;
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    throw new Error('Unauthorized: Invalid token.');
  }
}
