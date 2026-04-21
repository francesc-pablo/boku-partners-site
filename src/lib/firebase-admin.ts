import admin from 'firebase-admin';
import { App } from 'firebase-admin/app';

let app: App;

function initializeAdminSDK() {
  // New debug logging to help diagnose production environment issues.
  console.log('--- Firebase Admin SDK Initialization Check ---');
  console.log(`FIREBASE_ADMIN_PROJECT_ID is set: ${!!process.env.FIREBASE_ADMIN_PROJECT_ID}`);
  console.log(`FIREBASE_ADMIN_CLIENT_EMAIL is set: ${!!process.env.FIREBASE_ADMIN_CLIENT_EMAIL}`);
  console.log(`FIREBASE_ADMIN_PRIVATE_KEY is set: ${!!process.env.FIREBASE_ADMIN_PRIVATE_KEY ? 'Yes' : 'No (This is a secret, so we only check for its presence)'}`);
  console.log('--- End of Debugging Check ---');
  
  try {
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
  } catch (error: any) {
    console.error("FIREBASE ADMIN SDK INITIALIZATION ERROR:", error.message);
    throw new Error(
      'Firebase Admin SDK initialization failed. This is likely due to missing or incorrect environment variables on your production server. ' +
      'Please ensure that FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY are correctly set. ' +
      `Original error: ${error.message}`
    );
  }
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
