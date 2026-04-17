'use server';

import { redirect } from 'next/navigation';
import { getApps, initializeApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

// This file is now only for server-side actions that don't directly manipulate auth state,
// like password reset and logout.

// Initialize on the server for these actions
if (!getApps().length) {
    initializeApp(firebaseConfig);
}
const auth = getAuth();


export async function resetPassword(prevState: { message: string, success: boolean }, formData: FormData) {
  const email = formData.get('email') as string;
  try {
    await sendPasswordResetEmail(auth, email);
    return { message: 'Password reset email sent. Please check your inbox.', success: true };
  } catch (e: any) {
     return { message: e.message, success: false };
  }
}

export async function logout() {
    // This server action signs the user out and redirects to the login page.
    await auth.signOut();
    redirect('/login');
}
