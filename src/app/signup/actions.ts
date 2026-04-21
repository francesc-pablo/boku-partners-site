'use server';

import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// A simple return type for the action
type ActionResult = {
    success: boolean;
    message: string;
};

export async function signUpUser(formData: FormData): Promise<ActionResult> {
    const adminAuth = getAdminAuth();
    const firestore = getAdminDb();

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const companyName = formData.get('companyName') as string;

    // Basic validation
    if (!email || !password || !firstName || !lastName || !companyName) {
        return { success: false, message: 'All fields are required.' };
    }
    if (password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters long.' };
    }

    try {
        // Step 1: Create the Firebase Auth user
        const userRecord = await adminAuth.createUser({
            email,
            password,
            displayName: `${firstName} ${lastName}`,
        });
        const uid = userRecord.uid;

        // Step 2: Create the Client document in a transaction/batch
        const clientRef = firestore.collection('clients').doc();
        const clientId = clientRef.id;

        const portalUserRef = firestore.collection('clients').doc(clientId).collection('portalUsers').doc(uid);
        const userClientMapRef = firestore.collection('user_to_client_map').doc(uid);
        
        const batch = firestore.batch();

        // Create Client
        batch.set(clientRef, {
            id: clientId,
            name: companyName,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
        });

        // Create PortalUser with 'Admin' role for their own client
        batch.set(portalUserRef, {
            id: uid,
            clientId: clientId,
            email: email,
            role: 'Admin', // Giving them Admin role for their own client space
            firstName: firstName,
            lastName: lastName,
            company: companyName,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
        });

        // Create user_to_client_map
        batch.set(userClientMapRef, {
            clientId: clientId,
        });

        await batch.commit();

        return { success: true, message: 'User created successfully.' };

    } catch (e: any) {
        let errorMessage = e.message.replace('Firebase: ', '');
        if (e.code === 'auth/email-already-exists') {
            errorMessage = 'A user with this email address already exists.';
        }
        console.error("Error during sign-up:", e);
        return { success: false, message: `Failed to create user: ${errorMessage}` };
    }
}
