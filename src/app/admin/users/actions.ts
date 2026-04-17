'use server';

import { revalidatePath } from 'next/cache';
import { doc, getDoc, updateDoc, deleteDoc, setDoc, serverTimestamp, getFirestore } from 'firebase/firestore';
import { getApps, initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { firebaseConfig } from '@/firebase/config';
import { z } from 'zod';
import crypto from 'crypto';


// Initialize main app instance if not already initialized
if (!getApps().length) {
    initializeApp(firebaseConfig);
}
const db = getFirestore();
const mainAuth = getAuth();

async function isCallerAdmin(callerUid: string, clientId: string): Promise<boolean> {
    if (!callerUid || !clientId) return false;
    const portalUserRef = doc(db, 'clients', clientId, 'portalUsers', callerUid);
    const userDoc = await getDoc(portalUserRef);
    return userDoc.exists() && userDoc.data().role === 'Admin';
}

const CreateUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  role: z.enum(['Admin', 'StandardUser']),
  clientId: z.string().min(1),
  callerUid: z.string().min(1),
});


export async function createUserByAdmin(prevState: any, formData: FormData) {
    const validatedFields = CreateUserSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { message: 'Invalid data.', error: true, errors: validatedFields.error.flatten().fieldErrors };
    }

    const { email, firstName, lastName, role, clientId, callerUid } = validatedFields.data;

    if (!(await isCallerAdmin(callerUid, clientId))) {
        return { message: 'Permission denied. You must be an admin to create users.', error: true };
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

        // 2. Create the PortalUser document in Firestore.
        const portalUserRef = doc(db, 'clients', clientId, 'portalUsers', newUserUid);
        await setDoc(portalUserRef, {
            id: newUserUid,
            clientId: clientId,
            email: email,
            role: role,
            firstName: firstName,
            lastName: lastName,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        // 3. Create the user-to-client mapping document.
        const userClientMapRef = doc(db, 'user_to_client_map', newUserUid);
        await setDoc(userClientMapRef, {
            clientId: clientId
        });

        // 4. Send a password reset email to the new user so they can set their own password.
        await sendPasswordResetEmail(mainAuth, email);

        revalidatePath('/admin/users');
        return { message: 'User created successfully. They have been sent an email to set their password.', error: false };
    } catch (e: any) {
        let errorMessage = e.message.replace('Firebase: ', '');
         if (e.code === 'auth/email-already-exists' || e.code === 'auth/email-already-in-use') {
            errorMessage = 'A user with this email address already exists in Firebase Authentication. Please use a different email or delete the existing user from the Firebase Console.';
        }
        return { message: `Failed to create user: ${errorMessage}`, error: true };
    } finally {
        // 5. Clean up the temporary Firebase app.
        await deleteApp(tempApp);
    }
}


const UpdateUserSchema = z.object({
  userId: z.string().min(1),
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  role: z.enum(['Admin', 'StandardUser']),
  clientId: z.string().min(1),
  callerUid: z.string().min(1),
});

export async function updateUser(prevState: any, formData: FormData) {
    const validatedFields = UpdateUserSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { message: 'Invalid data.', error: true, errors: validatedFields.error.flatten().fieldErrors };
    }
    
    const { userId, firstName, lastName, role, clientId, callerUid } = validatedFields.data;

    if (!(await isCallerAdmin(callerUid, clientId))) {
        return { message: 'Permission denied. You must be an admin to update users.', error: true };
    }
    
    // Prevent admin from removing their own admin role if they are the last one.
    if (userId === callerUid && role !== 'Admin') {
        return { message: "You cannot remove your own Admin role.", error: true };
    }

    try {
        const userRef = doc(db, 'clients', clientId, 'portalUsers', userId);
        await updateDoc(userRef, {
            firstName,
            lastName,
            role,
        });
        revalidatePath('/admin/users');
        return { message: 'User updated successfully.', error: false };
    } catch (e: any) {
        return { message: `Failed to update user: ${e.message}`, error: true };
    }
}


const DeleteUserSchema = z.object({
  userIdToDelete: z.string().min(1),
  clientId: z.string().min(1),
  callerUid: z.string().min(1),
});

export async function deleteUserFromClient(prevState: any, formData: FormData) {
    const validatedFields = DeleteUserSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { message: 'Invalid data provided.', error: true };
    }

    const { userIdToDelete, clientId, callerUid } = validatedFields.data;

    if (userIdToDelete === callerUid) {
        return { message: 'You cannot delete your own account.', error: true };
    }

    if (!(await isCallerAdmin(callerUid, clientId))) {
        return { message: 'Permission denied. You must be an admin to delete users.', error: true };
    }

    try {
        // Delete the portalUser document
        const userRef = doc(db, 'clients', clientId, 'portalUsers', userIdToDelete);
        await deleteDoc(userRef);
        
        // Delete the user-to-client map document
        const userClientMapRef = doc(db, 'user_to_client_map', userIdToDelete);
        await deleteDoc(userClientMapRef);

        revalidatePath('/admin/users');
        return { message: 'User removed from client successfully. NOTE: The user\'s authentication account is NOT deleted and must be removed from the Firebase Console manually.', error: false };
    } catch (e: any) {
        return { message: `Failed to delete user: ${e.message}`, error: true };
    }
}
