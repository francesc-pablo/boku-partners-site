import admin from 'firebase-admin';
import { App } from 'firebase-admin/app';
import { firebaseConfig } from '@/firebase/config';

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

    // Check if running in a development environment to provide a more helpful error.
    if (process.env.NODE_ENV !== 'production' && (error.message.includes('Could not load the default credentials') || error.message.includes('Unable to detect a Project Id'))) {
        const devErrorMessage = `
********************************************************************************
Firebase Admin SDK initialization failed for local development.
This is because your local server environment is not authenticated.

To fix this, you need to provide service account credentials via a .env.local file.

1. Create a file named .env.local in the root of your project.
2. Go to your Firebase Project Settings > Service accounts:
   https://console.firebase.google.com/project/${firebaseConfig.projectId}/settings/serviceaccounts/adminsdk
3. Click "Generate new private key" to download the JSON credentials file.
4. Copy the following values from the JSON file into your .env.local file:

   FIREBASE_ADMIN_PROJECT_ID="${firebaseConfig.projectId}"
   FIREBASE_ADMIN_CLIENT_EMAIL="<your-client-email>"
   FIREBASE_ADMIN_PRIVATE_KEY="<your-private-key>"

   IMPORTANT: For the private key, copy the entire string, including "-----BEGIN..." and "...END-----", and wrap it in double quotes.

5. You will also need your QuickBooks client secret for the integration to work:
   QB_CLIENT_SECRET="<your-quickbooks-client-secret>"

6. After creating the .env.local file, restart your development server.
********************************************************************************
Original error: ${error.message}
`;
        throw new Error(devErrorMessage);
    }
    
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
