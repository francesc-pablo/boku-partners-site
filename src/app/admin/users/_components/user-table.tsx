'use client';

import { useState, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { PortalUser } from '@/hooks/use-portal-user';
import { collection, query } from 'firebase/firestore';
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
import { useActionState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { updateUser, deleteUserFromClient } from '../actions';
import { Skeleton } from '@/components/ui/skeleton';

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

function SubmitButton({ children, pendingText }: { children: React.ReactNode; pendingText: string }) {
    const [pending, setPending] = useState(false);
    // This is a bit of a hack to show pending state without useFormStatus
    // because we are in a parent component of the form.
    useEffect(() => {
        const form = document.querySelector('form');
        const observer = new MutationObserver(() => {
            const isSubmitting = form?.hasAttribute('data-submitting');
            setPending(!!isSubmitting);
        });
        if(form) {
            observer.observe(form, { attributes: true });
        }
        return () => observer.disconnect();
    }, []);

    return (
        <Button type="submit" disabled={pending}>
            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {pendingText}</> : children}
        </Button>
    );
}


export function UserTable({ adminUser }: { adminUser: PortalUser }) {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [userToEdit, setUserToEdit] = useState<PortalUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<PortalUser | null>(null);

  const [updateState, updateAction, isUpdatePending] = useActionState(updateUser, { message: '', error: false });
  const [deleteState, deleteAction, isDeletePending] = useActionState(deleteUserFromClient, { message: '', error: false });

  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !adminUser.clientId) return null;
    return query(collection(firestore, 'clients', adminUser.clientId, 'portalUsers'));
  }, [firestore, adminUser.clientId]);

  const { data: users, isLoading } = useCollection<PortalUser>(usersQuery);
  
  useEffect(() => {
      if (updateState.message) {
          toast({ title: updateState.error ? 'Error' : 'Success', description: updateState.message, variant: updateState.error ? 'destructive' : 'default' });
          if(!updateState.error) setUserToEdit(null);
      }
  }, [updateState, toast]);

  useEffect(() => {
      if (deleteState.message) {
          toast({ title: deleteState.error ? 'Error' : 'Success', description: deleteState.message, variant: deleteState.error ? 'destructive' : 'default' });
          if(!deleteState.error) setUserToDelete(null);
      }
  }, [deleteState, toast]);

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

        {/* Edit User Dialog */}
        <Dialog open={!!userToEdit} onOpenChange={(isOpen) => !isOpen && setUserToEdit(null)}>
            <DialogContent>
                <form action={updateAction}>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                            Update the user's profile information and role.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <input type="hidden" name="userId" value={userToEdit?.id} />
                        <input type="hidden" name="clientId" value={adminUser.clientId} />
                        <input type="hidden" name="callerUid" value={adminUser.id} />

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="firstName" className="text-right">First Name</Label>
                            <Input id="firstName" name="firstName" defaultValue={userToEdit?.firstName} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="lastName" className="text-right">Last Name</Label>
                            <Input id="lastName" name="lastName" defaultValue={userToEdit?.lastName} className="col-span-3" />
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
            <form action={deleteAction}>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action will remove the user <span className="font-bold">{userToDelete?.firstName} {userToDelete?.lastName}</span> from this client account. It will not delete their authentication account. This action cannot be undone.
                    </AlertDialogDescription>
                     <input type="hidden" name="userIdToDelete" value={userToDelete?.id} />
                     <input type="hidden" name="clientId" value={adminUser.clientId} />
                     <input type="hidden" name="callerUid" value={adminUser.id} />
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction asChild>
                         <Button type="submit" variant="destructive" disabled={isDeletePending}>
                            {isDeletePending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Deleting...</> : 'Yes, delete user'}
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

    