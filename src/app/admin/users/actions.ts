'use server';

import admin from 'firebase-admin';

// This function ensures the Firebase Admin SDK is initialized.
// It's idempotent, meaning it's safe to call multiple times.
function ensureAdminInitialized() {
  if (!admin.apps.length) {
    // In a managed environment like App Hosting, initializeApp() with no arguments
    // should automatically discover credentials.
    admin.initializeApp();
  }
}

export async function createUserByAdmin(formData: FormData) {
    ensureAdminInitialized();

    const email = formData.get('email') as string;

    if (!email) {
        return { success: false, message: 'Email is required.' };
    }

    try {
        // Create the user in Firebase Auth using the Admin SDK.
        const userRecord = await admin.auth().createUser({
            email,
            emailVerified: false, // User will verify when they set password
        });
        const newUserUid = userRecord.uid;

        // Return the UID and email to the client for subsequent Firestore writes
        return { success: true, newUserUid, email };

    } catch (e: any) {
        let errorMessage = e.message.replace('Firebase: ', '');
         if (e.code === 'auth/email-already-exists' || e.code === 'auth/email-already-in-use') {
            errorMessage = 'A user with this email address already exists in Firebase Authentication. Please use a different email or delete the existing user from the Firebase Console.';
        }
        return { success: false, message: `Failed to create auth user: ${errorMessage}` };
    }
}
