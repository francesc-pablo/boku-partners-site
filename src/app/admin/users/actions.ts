'use server';

import { revalidatePath } from 'next/cache';
import { doc, getDoc, updateDoc, deleteDoc, getFirestore } from 'firebase/firestore';
import { getApps, initializeApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import { z } from 'zod';

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
    