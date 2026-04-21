'use client';

import { useUser } from '@/firebase';
import { usePortalUser } from '@/hooks/use-portal-user';
import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { UserTable } from './_components/user-table';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AdminUsersPage() {
  const { user } = useUser();
  const { portalUser } = usePortalUser(user?.uid);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);

  // The AuthedLayout now handles loading, auth checks, and redirection.
  // We only need to check for the admin role here to render the page content.
  if (portalUser?.role !== 'Admin') {
    return (
      <Alert variant="destructive">
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You do not have permission to view this page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-end">
            <Button onClick={() => setShowAddUserDialog(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add User
            </Button>
        </div>
        {portalUser && <UserTable adminUser={portalUser} showAddUserDialog={showAddUserDialog} setShowAddUserDialog={setShowAddUserDialog} />}
    </div>
  );
}
