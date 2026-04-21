import admin from 'firebase-admin';
import { App } from 'firebase-admin/app';

// This file is NOT marked with 'use server'. It's a server-side module.

let app: App;

/**
 * Ensures that the Firebase Admin SDK is initialized, but only once.
 */
function ensureAdminInitialized() {
  if (!admin.apps.length) {
    try {
      // In a managed environment like App Hosting or Cloud Functions,
      // this will automatically discover the credentials.
      app = admin.initializeApp();
    } catch (e) {
      console.error("Firebase Admin SDK initialization error:", e);
      // If initialization fails, it indicates a fundamental environment setup issue.
      throw new Error("Could not initialize Firebase Admin SDK. Ensure the environment is set up correctly with Application Default Credentials.");
    }
  } else {
    app = admin.app();
  }
}

// Initialize the SDK when this module is first loaded.
ensureAdminInitialized();

// Export the initialized services for use in other server-side modules.
export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
