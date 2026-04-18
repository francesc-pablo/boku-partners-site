'use server';

import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { getApps, initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { firebaseConfig } from '@/firebase/config';
import { z } from 'zod';
import crypto from 'crypto';


// Initialize main app instance if not already initialized
if (!getApps().length) {
    initializeApp(firebaseConfig);
}
const db = getFirestore();

async function isCallerAdmin(callerUid: string, clientId: string): Promise<boolean> {
    if (!callerUid || !clientId) return false;
    const portalUserRef = doc(db, 'clients', clientId, 'portalUsers', callerUid);
    const userDoc = await getDoc(portalUserRef);
    return userDoc.exists() && userDoc.data().role === 'Admin';
}

const CreateUserServerSchema = z.object({
  email: z.string().email(),
  clientId: z.string().min(1),
  callerUid: z.string().min(1),
});


export async function createUserByAdmin(formData: FormData) {
    const validatedFields = CreateUserServerSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { success: false, message: 'Invalid data for user creation on server.' };
    }

    const { email, clientId, callerUid } = validatedFields.data;

    if (!(await isCallerAdmin(callerUid, clientId))) {
        return { success: false, message: 'Permission denied. You must be an admin to create users.' };
    }

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
