import admin from 'firebase-admin';
<<<<<<< HEAD
import { App } from 'firebase-admin/app';

let app: App;

function initializeAdminSDK() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    console.log("Initializing Firebase Admin with explicit credentials from environment variables.");
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
  }

  console.log("Initializing Firebase Admin with Application Default Credentials.");
  return admin.initializeApp();
}

function getAdminApp() {
  if (!app) {
    app = initializeAdminSDK();
  }
  return app;
}

export function getAdminAuth() {
  return getAdminApp().auth();
}

export function getAdminDb() {
  return getAdminApp().firestore();
}
=======

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
>>>>>>> e12348c6ac157baa544cc18bb67c031b9e88b544
