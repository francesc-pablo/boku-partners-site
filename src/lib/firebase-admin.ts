import admin from 'firebase-admin';

// This file should not have 'use server'

if (!admin.apps.length) {
  try {
    // When deployed to a Google Cloud environment, the SDK will automatically
    // discover the service account credentials. For local development, you'll
    // need to set the GOOGLE_APPLICATION_CREDENTIALS environment variable.
    // As a fallback, we can use the individual environment variables.
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
       admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        }),
      });
    } else {
      // This will rely on GOOGLE_APPLICATION_CREDENTIALS or default credentials
      admin.initializeApp();
    }
   
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
