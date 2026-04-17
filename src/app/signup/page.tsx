'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { SignUpForm } from './_components/signup-form';

export default function SignUpPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    // If the user is authenticated (and no longer loading), redirect them to the clients page.
    if (!isUserLoading && user) {
      router.push('/clients');
    }
  }, [user, isUserLoading, router]);

  // Show a loading spinner while checking for user authentication state or during redirection.
  if (isUserLoading || user) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If no user is found after checking, show the signup form.
  return (
    <>
      <section className="bg-secondary">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-headline font-bold">Create Your Account</h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Join Boku Partners and take control of your business operations.
          </p>
        </div>
      </section>

      <section className="container mx-auto">
        <div className="max-w-md mx-auto">
          <SignUpForm />
        </div>
      </section>
    </>
  );
}
