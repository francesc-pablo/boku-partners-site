'use client';

import { useState, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useAuth } from '@/firebase';
import { PortalUser } from '@/hooks/use-portal-user';
import { collection, query, doc, setDoc, serverTimestamp, updateDoc, deleteDoc } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2, Edit, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { createUserByAdmin, deleteUser } from '../actions';
import { Skeleton } from '@/components/ui/skeleton';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


function UserTableSkeleton() {
    return (
        <div className="border rounded-lg">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {[...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
        </div>
    );
}

export function UserTable({ adminUser, showAddUserDialog, setShowAddUserDialog }: { adminUser: PortalUser, showAddUserDialog: boolean, setShowAddUserDialog: (show: boolean) => void }) {
  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();
  
  const [userToEdit, setUserToEdit] = useState<PortalUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<PortalUser | null>(null);
  const [isDeletePending, setIsDeletePending] = useState(false);
  const [isAddPending, setIsAddPending] = useState(false);
  const [isUpdatePending, setIsUpdatePending] = useState(false);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !adminUser.clientId) return null;
    return query(collection(firestore, 'clients', adminUser.clientId, 'portalUsers'));
  }, [firestore, adminUser.clientId]);

  const { data: users, isLoading } = useCollection<PortalUser>(usersQuery);
  

  const handleAddUserSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAddPending(true);

    const formData = new FormData(e.currentTarget);
    const { firstName, lastName, role, clientId } = Object.fromEntries(formData.entries());

    // 1. Call server action to create the auth user.
    const serverResult = await createUserByAdmin(formData);

    if (!serverResult.success || !serverResult.newUserUid || !serverResult.email) {
      toast({ title: 'Error', description: serverResult.message, variant: 'destructive' });
      setIsAddPending(false);
      return;
    }

    const { newUserUid, email } = serverResult;

    // 2. Perform client-side writes and email sending.
    const portalUserRef = doc(firestore, 'clients', clientId as string, 'portalUsers', newUserUid);
    const portalUserData = {
        id: newUserUid,
        clientId: clientId as string,
        email: email,
        role: role as 'Admin' | 'StandardUser',
        firstName: firstName as string,
        lastName: lastName as string,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    };
    
    // Using a promise chain to handle sequential operations and error handling
    setDoc(portalUserRef, portalUserData)
      .catch(err => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
              path: portalUserRef.path,
              operation: 'create',
              requestResourceData: portalUserData
          }));
          // Re-throw to break the promise chain
          throw new Error('Failed to create user profile in Firestore.'); 
      })
      .then(() => {
          const userClientMapRef = doc(firestore, 'user_to_client_map', newUserUid);
          const userClientMapData = { clientId: clientId as string };
          return setDoc(userClientMapRef, userClientMapData).catch(err => {
              errorEmitter.emit('permission-error', new FirestorePermissionError({
                  path: userClientMapRef.path,
                  operation: 'create',
                  requestResourceData: userClientMapData
              }));
              throw new Error('Failed to create user-to-client map.');
          });
      })
      .then(() => {
          return sendPasswordResetEmail(auth, email);
      })
      .then(() => {
          toast({ title: 'Success', description: 'User created successfully. They have been sent an email to set their password.' });
          setShowAddUserDialog(false);
      })
      .catch(err => {
          // This catches errors from the chain.
          // Permission errors are already emitted. The listener will throw them.
          // We only toast other, unexpected errors.
          if (!err.message.startsWith('Failed to create')) {
            toast({ title: 'An Error Occurred', description: err.message, variant: 'destructive' });
          }
      })
      .finally(() => {
          setIsAddPending(false);
      });
  };

  const handleUpdateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userToEdit) return;

    // Prevent admin from removing their own admin role if they are the last one.
    // This is a simple client-side check. A more robust solution would be a server-side check.
    if (userToEdit.id === adminUser.id && new FormData(e.currentTarget).get('role') !== 'Admin') {
      toast({ title: 'Error', description: "You cannot remove your own Admin role.", variant: 'destructive' });
      return;
    }

    setIsUpdatePending(true);

    const formData = new FormData(e.currentTarget);
    const updates = {
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        role: formData.get('role') as 'Admin' | 'StandardUser',
    };

    if (!updates.firstName || !updates.lastName) {
        toast({ title: 'Error', description: 'First and last name are required.', variant: 'destructive' });
        setIsUpdatePending(false);
        return;
    }

    const userRef = doc(firestore, 'clients', adminUser.clientId, 'portalUsers', userToEdit.id);

    updateDoc(userRef, updates)
        .then(() => {
            toast({ title: 'Success', description: 'User updated successfully.' });
            setUserToEdit(null);
        })
        .catch(error => {
            // Create and emit the contextual error for the listener to catch
            const contextualError = new FirestorePermissionError({
                path: userRef.path,
                operation: 'update',
                requestResourceData: updates,
            });
            errorEmitter.emit('permission-error', contextualError);
            // The global error listener will throw the error, so we don't need to toast it here.
        })
        .finally(() => {
            setIsUpdatePending(false);
        });
  };


  const handleDeleteConfirm = async () => {
    if (!userToDelete || !firestore || !adminUser.clientId) return;

    if (userToDelete.id === adminUser.id) {
        toast({ title: 'Error', description: 'You cannot delete your own account.', variant: 'destructive' });
        return;
    }
    
    setIsDeletePending(true);

    try {
        // 1. Delete the auth user first via server action.
        const authDeleteResult = await deleteUser(userToDelete.id);

        if (!authDeleteResult.success) {
            throw new Error(authDeleteResult.message || 'Failed to delete authentication user.');
        }

        // 2. If auth user is deleted, delete the Firestore documents.
        const userRef = doc(firestore, 'clients', adminUser.clientId, 'portalUsers', userToDelete.id);
        await deleteDoc(userRef);
        
        const userClientMapRef = doc(firestore, 'user_to_client_map', userToDelete.id);
        await deleteDoc(userClientMapRef);

        toast({
            title: 'Success',
            description: `User ${userToDelete.firstName} ${userToDelete.lastName} has been completely removed from the system.`,
        });

    } catch (error: any) {
        toast({ title: 'Deletion Error', description: error.message, variant: 'destructive' });
    } finally {
        setUserToDelete(null);
        setIsDeletePending(false);
    }
  };

  if (isLoading) {
    return <UserTableSkeleton />;
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users && users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>{user.role}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                     {user.id !== adminUser.id && (
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setUserToEdit(user)}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit User</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setUserToDelete(user)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete User</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                     )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No other users found in this client account.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

       {/* Add User Dialog */}
        <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
            <DialogContent>
                <form onSubmit={handleAddUserSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                        <DialogDescription>
                            Create a new user account. They will receive an email to set their password.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <input type="hidden" name="clientId" value={adminUser.clientId} />

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="add-firstName" className="text-right">First Name</Label>
                            <Input id="add-firstName" name="firstName" className="col-span-3" required/>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="add-lastName" className="text-right">Last Name</Label>
                            <Input id="add-lastName" name="lastName" className="col-span-3" required/>
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="add-email" className="text-right">Email</Label>
                            <Input id="add-email" name="email" type="email" className="col-span-3" required/>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="add-role" className="text-right">Role</Label>
                             <Select name="role" defaultValue="StandardUser">
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Admin">Admin</SelectItem>
                                    <SelectItem value="StandardUser">Standard User</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                         <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isAddPending}>
                            {isAddPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Adding User...</> : 'Add User'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>


        {/* Edit User Dialog */}
        <Dialog open={!!userToEdit} onOpenChange={(isOpen) => !isOpen && setUserToEdit(null)}>
            <DialogContent>
                <form onSubmit={handleUpdateSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                            Update the user's profile information and role.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="firstName" className="text-right">First Name</Label>
                            <Input id="firstName" name="firstName" defaultValue={userToEdit?.firstName} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="lastName" className="text-right">Last Name</Label>
                            <Input id="lastName" name="lastName" defaultValue={userToEdit?.lastName} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="role" className="text-right">Role</Label>
                             <Select name="role" defaultValue={userToEdit?.role}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Admin">Admin</SelectItem>
                                    <SelectItem value="StandardUser">Standard User</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                         <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isUpdatePending}>
                            {isUpdatePending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Saving...</> : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>


      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={(isOpen) => !isOpen && setUserToDelete(null)}>
        <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action will permanently delete the user <span className="font-bold">{userToDelete?.firstName} {userToDelete?.lastName}</span> and their authentication account. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction asChild>
                         <Button onClick={handleDeleteConfirm} variant="destructive" disabled={isDeletePending}>
                            {isDeletePending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Deleting...</> : 'Yes, delete user'}
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
