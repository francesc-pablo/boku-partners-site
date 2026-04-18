'use server';

import admin from 'firebase-admin';

// This function ensures the Firebase Admin SDK is initialized.
// It's idempotent, meaning it's safe to call multiple times.
function ensureAdminInitialized() {
  if (!admin.apps.length) {
    admin.initializeApp();
  }
}

export async function createUserByAdmin(formData: FormData) {
    ensureAdminInitialized();

    const email = formData.get('email') as string;
    // Note: Zod validation temporarily removed for debugging.

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

export async function deleteUser(uid: string) {
    ensureAdminInitialized(); // Ensure SDK is ready before proceeding
    
    try {
        await admin.auth().deleteUser(uid);
        return { success: true };
    } catch (error: any) {
        console.error(`Admin SDK user deletion error for UID ${uid}:`, error);
        // Return the specific error message from Firebase to the client.
        const errorMessage = error.message || 'An unknown error occurred during user deletion on the server.';
        return { success: false, message: `Failed to delete authentication user: ${errorMessage}` };
    }
}
