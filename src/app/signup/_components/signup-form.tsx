'use client';

import { useState, FormEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { signUpUser } from '../actions';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export function SignUpForm() {
  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await signUpUser(formData);

    if (result.success) {
      toast({
        title: 'Success!',
        description: 'Your account has been created. Logging you in...',
      });
      
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;

      try {
        await signInWithEmailAndPassword(auth, email, password);
        // The router push will happen in the /login page logic due to auth state change,
        // but we can push them to clients page directly after successful login.
        router.push('/clients');
      } catch(e: any) {
        toast({
            title: 'Login Failed',
            description: `Your account was created, but auto-login failed. Please go to the login page. Error: ${e.message}`,
            variant: 'destructive',
        });
        setLoading(false);
      }

    } else {
      toast({
        title: 'Sign-up Error',
        description: result.message,
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
        <Card>
            <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>Enter your details to create your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" name="firstName" placeholder="John" required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" name="lastName" placeholder="Doe" required />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input id="companyName" name="companyName" placeholder="Acme Inc." required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" name="email" type="email" placeholder="john.doe@example.com" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" placeholder="••••••••" required />
                </div>
            </CardContent>
            <CardFooter className='flex-col gap-4'>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...</> : 'Sign Up'}
                </Button>
                <Button variant="link" asChild>
                    <Link href="/login">Already have an account? Login</Link>
                </Button>
            </CardFooter>
        </Card>
    </form>
  );
}
