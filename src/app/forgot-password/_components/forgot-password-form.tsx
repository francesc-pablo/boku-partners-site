'use client';

import { useState, FormEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase/client-provider';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


export function ForgotPasswordForm() {
  const { toast } = useToast();
  const auth = useAuth();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
        toast({ title: 'Error', description: 'Please enter your email address.', variant: 'destructive'});
        return;
    }
    setLoading(true);

    try {
        await sendPasswordResetEmail(auth, email);
        setSuccess(true);
    } catch (error: any) {
        toast({
            title: 'Error',
            description: error.message.replace('Firebase: ',''),
            variant: 'destructive',
        });
    } finally {
        setLoading(false);
    }
  };

  if (success) {
    return (
        <Alert>
            <AlertTitle>Check Your Email</AlertTitle>
            <AlertDescription>
                A password reset link has been sent to your email address. Please check your inbox and spam folder.
                 <div className='mt-4'>
                    <Button asChild>
                        <Link href="/login">Back to Login</Link>
                    </Button>
                </div>
            </AlertDescription>
        </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>No worries, we'll send you reset instructions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" name="email" type="email" placeholder="john.doe@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4">
            <Button type="submit" disabled={loading} className="w-full">
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : 'Send Reset Link'}
            </Button>
          <Button variant="link" asChild>
            <Link href="/login">Back to Login</Link>
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
