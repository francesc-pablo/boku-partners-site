import admin from 'firebase-admin';

// This file should not have 'use server'

if (!admin.apps.length) {
  try {
    // When deployed to a Google Cloud environment, the SDK will automatically
    // discover the service account credentials. We provide the projectId explicitly
    // to ensure the SDK can target the correct project, which can resolve
    // metadata discovery issues that lead to authentication failures.
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
    // As a fallback for local development where ADC might not be set up,
    // we can try to use the service account details from env vars.
    try {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
      if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey,
          }),
        });
        console.log('Initialized Firebase Admin with fallback credentials.');
      }
    } catch (fallbackError) {
      console.error('Firebase admin fallback initialization failed:', fallbackError);
    }
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
