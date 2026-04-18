'use server';

import { z } from 'zod';
import admin from 'firebase-admin';

// This function ensures the Firebase Admin SDK is initialized.
// It's idempotent, meaning it's safe to call multiple times.
function ensureAdminInitialized() {
  // In a managed environment like App Hosting, the SDK will automatically
  // discover the necessary credentials. We only need to initialize if no
  // app has been initialized yet. We are removing the try/catch to potentially
  // surface a more detailed underlying error.
  if (!admin.apps.length) {
    admin.initializeApp();
  }
}

const CreateUserServerSchema = z.object({
  email: z.string().email(),
  clientId: z.string().min(1),
});


export async function createUserByAdmin(formData: FormData) {
    ensureAdminInitialized(); // Ensure SDK is ready before proceeding

    const validatedFields = CreateUserServerSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { success: false, message: 'Invalid data for user creation on server.' };
    }

    const { email } = validatedFields.data;

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
