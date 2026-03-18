'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function UpdateProfileForm() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleUpdate = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const promises = [];
      if (displayName !== user.displayName) {
        promises.push(updateProfile(user, { displayName }));
      }
      if (email !== user.email) {
        promises.push(updateEmail(user, email));
      }

      if (promises.length > 0) {
        await Promise.all(promises);
        toast({ title: 'Profile updated successfully!' });
      } else {
        toast({ title: 'No changes to update.' });
      }

    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="displayName">Full Name</Label>
        <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="John Doe" />
      </div>
      <div>
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john.doe@example.com" />
      </div>
      <Button onClick={handleUpdate} disabled={loading || !user} className="w-full">
        {loading ? 'Updating...' : 'Update Profile'}
      </Button>
    </div>
  );
}

function ChangePasswordForm() {
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleUpdate = async () => {
    if (!user) return;
    if (password !== confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (password.length > 0 && password.length < 6) {
        toast({ title: 'Password must be at least 6 characters long', variant: 'destructive' });
        return;
    }
    if (password.length === 0) {
        toast({ title: 'Please enter a new password', variant: 'destructive' });
        return;
    }

    setLoading(true);
    try {
      await updatePassword(user, password);
      toast({ title: 'Password updated successfully!' });
      setPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="new-password">New Password</Label>
        <Input id="new-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
      </div>
      <div>
        <Label htmlFor="confirm-password">Confirm New Password</Label>
        <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
      </div>
      <Button onClick={handleUpdate} disabled={loading || !user} className="w-full">
        {loading ? 'Updating...' : 'Change Password'}
      </Button>
    </div>
  );
}


export function AccountForms() {
    const { userProfile } = useAuth();
    return (
        <div className="grid md:grid-cols-2 gap-16 max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Profile Details</CardTitle>
                            <CardDescription>Update your name and email address.</CardDescription>
                        </div>
                        {userProfile?.role && <Badge variant={userProfile.role === 'admin' ? 'default' : 'secondary'}>{userProfile.role}</Badge>}
                    </div>
                </CardHeader>
                <CardContent>
                    <UpdateProfileForm />
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your account password.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChangePasswordForm />
                </CardContent>
            </Card>
        </div>
    )
}