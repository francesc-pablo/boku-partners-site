'use server';

import { z } from 'zod';
import admin from 'firebase-admin';

// Initialize firebase-admin. This will use Application Default Credentials (ADC).
// In a Google Cloud environment (like App Hosting), these are available automatically.
if (!admin.apps.length) {
  try {
    admin.initializeApp();
  } catch (e: any) {
    console.error('Firebase Admin initialization error', e.stack);
  }
}

const CreateUserServerSchema = z.object({
  email: z.string().email(),
  clientId: z.string().min(1),
});


export async function createUserByAdmin(formData: FormData) {
    const validatedFields = CreateUserServerSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { success: false, message: 'Invalid data for user creation on server.' };
    }

    const { email } = validatedFields.data;

    try {
        // 1. Create the user in Firebase Auth using the Admin SDK.
        const userRecord = await admin.auth().createUser({
            email,
            emailVerified: false, // User will verify when they set password
        });
        const newUserUid = userRecord.uid;

        // Return the UID and email to the client for Firestore writes and password reset email
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
    if (!admin.apps.length) {
        return { success: false, message: 'Firebase Admin SDK not initialized.' };
    }
    try {
        await admin.auth().deleteUser(uid);
        return { success: true };
    } catch (error: any) {
        console.error(`Admin SDK user deletion error for UID ${uid}:`, error);
        const errorMessage = error.message || 'An unknown error occurred during user deletion on the server.';
        return { success: false, message: `Failed to delete authentication user: ${errorMessage}` };
    }
}
