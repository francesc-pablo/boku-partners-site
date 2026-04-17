'use client';

import { useState, FormEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export function SignUpForm() {
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();

  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

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
      
      // On success, the useUser hook in signup/page.tsx will detect the change
      // and handle the redirection.
    } catch (e: any) {
      let errorMessage = e.message.replace('Firebase: ', '');
      if (e.code === 'auth/email-already-in-use') {
          errorMessage = 'This email address is already in use.';
      }
      toast({
        title: 'Sign Up Error',
        description: errorMessage,
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp}>
      <Card>
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>Let's get you started. Your new account comes with Admin privileges.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Full Name</Label>
            <Input id="name" name="name" placeholder="John Doe" required value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input id="companyName" name="companyName" placeholder="Acme Inc." required value={companyName} onChange={e => setCompanyName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" name="email" type="email" placeholder="john.doe@acme.com" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} />
            <p className="text-xs text-muted-foreground">Password must be at least 6 characters long.</p>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...</> : 'Create Account'}
          </Button>
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </form>
  );
}
