'use client';

import { useUser } from '@/firebase';
import { usePortalUser } from '@/hooks/use-portal-user';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, PlusCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UserTable } from './_components/user-table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const { portalUser, isLoading: isPortalUserLoading, error } = usePortalUser(user?.uid);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const isLoading = isUserLoading || isPortalUserLoading;

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (portalUser?.role !== 'Admin') {
    return (
      <section className="container mx-auto flex flex-col items-center justify-center gap-4 text-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to view this page.
          </AlertDescription>
        </Alert>
        <Button asChild>
            <Link href="/clients">Return to Dashboard</Link>
        </Button>
      </section>
    );
  }
  
  if (error) {
     return (
      <section className="container mx-auto">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error.message}
          </AlertDescription>
        </Alert>
      </section>
    );
  }

  return (
    <>
      <section className="bg-secondary">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-headline font-bold">User Management</h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Manage user roles and access for your client account.
          </p>
        </div>
      </section>
      <section className="container mx-auto">
        <div className="flex justify-end mb-4">
            <Button onClick={() => setShowAddUserDialog(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add User
            </Button>
        </div>
        {portalUser && <UserTable adminUser={portalUser} showAddUserDialog={showAddUserDialog} setShowAddUserDialog={setShowAddUserDialog} />}
      </section>
    </>
  );
}
