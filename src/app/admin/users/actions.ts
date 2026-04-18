'use server';

import { getApps, initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { firebaseConfig } from '@/firebase/config';
import { z } from 'zod';
import crypto from 'crypto';
import admin from 'firebase-admin';

// Initialize firebase-admin. This will use Application Default Credentials (ADC).
// In a Google Cloud environment (like App Hosting), these are available automatically.
// In a local environment, you must set the GOOGLE_APPLICATION_CREDENTIALS environment variable.
if (!admin.apps.length) {
  admin.initializeApp();
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

    // Use a secondary, temporary Firebase app to create the user.
    // This prevents the admin from being signed out.
    const tempAppName = `temp-app-${crypto.randomUUID()}`;
    const tempApp = initializeApp(firebaseConfig, tempAppName);
    const tempAuth = getAuth(tempApp);

    try {
        // 1. Create the user in Firebase Auth with a temporary random password.
        const tempPassword = crypto.randomBytes(20).toString('hex');
        const userCredential = await createUserWithEmailAndPassword(tempAuth, email, tempPassword);
        const newUserUid = userCredential.user.uid;

        // Return the UID and email to the client for Firestore writes
        return { success: true, newUserUid, email };

    } catch (e: any) {
        let errorMessage = e.message.replace('Firebase: ', '');
         if (e.code === 'auth/email-already-exists' || e.code === 'auth/email-already-in-use') {
            errorMessage = 'A user with this email address already exists in Firebase Authentication. Please use a different email or delete the existing user from the Firebase Console.';
        }
        return { success: false, message: `Failed to create auth user: ${errorMessage}` };
    } finally {
        // 5. Clean up the temporary Firebase app.
        await deleteApp(tempApp);
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
        return { success: false, message: `Failed to delete authentication user: ${error.message}` };
    }
}
