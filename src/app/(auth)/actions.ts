'use server';

import { redirect } from 'next/navigation';
import { getApps, initializeApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore';

if (!getApps().length) {
    initializeApp(firebaseConfig);
}

const auth = getAuth();
const db = getFirestore();

export async function login(prevState: { message: string }, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (e: any) {
    return { message: e.message };
  }
  return redirect('/clients');
}

export async function signup(prevState: { message: string }, formData: FormData) {
  const name = formData.get('name') as string;
  const companyName = formData.get('companyName') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create a new client tenant
    const clientRef = await addDoc(collection(db, 'clients'), {
        name: companyName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });

    // Create the PortalUser document
    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ');
    
    const portalUserRef = doc(db, 'clients', clientRef.id, 'portalUsers', user.uid);
    await setDoc(portalUserRef, {
        id: user.uid,
        clientId: clientRef.id,
        email: user.email,
        role: 'Admin', // First user of a new client is an Admin
        firstName: firstName,
        lastName: lastName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });
    
    // Add user to the client lookup map
    const userClientMapRef = doc(db, 'user_to_client_map', user.uid);
    await setDoc(userClientMapRef, {
        clientId: clientRef.id
    });


  } catch (e: any) {
    if (e.code === 'auth/email-already-in-use') {
        return { message: 'This email address is already in use.' };
    }
    return { message: `An error occurred: ${e.message}` };
  }

  return redirect('/clients');
}


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
    // This is a client-side action in spirit. The form submission triggers this server action,
    // which then redirects. The actual sign-out happens on the client when the auth state listener fires.
    // For a pure server-side signout, you'd need to manage sessions differently.
    // In this setup, we just redirect the user.
    await auth.signOut();
    redirect('/login');
}
