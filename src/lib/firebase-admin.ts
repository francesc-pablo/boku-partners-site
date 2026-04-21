import admin from 'firebase-admin';
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
