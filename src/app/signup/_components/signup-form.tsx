'use client';

import { useActionState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signup } from '@/app/(auth)/actions';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { useFormStatus } from 'react-dom';


const initialState = {
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...</> : 'Create Account'}
    </Button>
  );
}

export function SignUpForm() {
  const [state, formAction] = useActionState(signup, initialState);
  const { toast } = useToast();
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  // Handle form submission errors
  useEffect(() => {
    if (state.message && state.message !== 'success') {
      toast({
        title: 'Error',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast]);

  // Redirect if user is logged in
  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/clients');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || user) {
    return (
        <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  return (
    <form action={formAction}>
      <Card>
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>Let's get you started. Your new account comes with Admin privileges.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Full Name</Label>
            <Input id="name" name="name" placeholder="John Doe" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input id="companyName" name="companyName" placeholder="Acme Inc." required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" name="email" type="email" placeholder="john.doe@acme.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required minLength={6} />
            <p className="text-xs text-muted-foreground">Password must be at least 6 characters long.</p>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <SubmitButton />
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
