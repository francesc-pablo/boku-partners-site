'use client';

import { useState, FormEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/firebase/client-provider';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export function LoginForm() {
  const { toast } = useToast();
  const auth = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // On success, the useUser hook in login/page.tsx will detect the change
      // and handle the redirection. We don't need to do anything here.
      // The loading state will be handled by the parent page showing a spinner.
    } catch (error: any) {
      toast({
        title: 'Login Error',
        description: error.message.replace('Firebase: ', ''),
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
        <Card>
            <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>Enter your credentials to access your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" name="email" type="email" placeholder="john.doe@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link href="/forgot-password" passHref className='text-sm text-primary hover:underline'>
                            Forgot password?
                        </Link>
                    </div>
                    <Input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
            </CardContent>
            <CardFooter className='flex-col gap-4'>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...</> : 'Login'}
                </Button>
            </CardFooter>
        </Card>
    </form>
  );
}
