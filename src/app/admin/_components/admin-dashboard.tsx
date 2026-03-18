'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, onSnapshot, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { firestore } from '@/firebase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: any;
}

export function AdminDashboard() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usersCollection = collection(firestore, 'users');
    const unsubscribe = onSnapshot(usersCollection, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching users:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
        <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Admin Notice</AlertTitle>
            <AlertDescription>
                User management (adding, editing, deleting) must be done securely through the Firebase Console. The actions below are placeholders for that reason. To make a user an admin, edit their 'role' field to 'admin' in Firestore.
            </AlertDescription>
        </Alert>
        <Card>
            <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>A list of all users in the system.</CardDescription>
              </div>
               <Button asChild>
                    <Link href="/signup">Add New User</Link>
                </Button>
            </div>
            </CardHeader>
            <CardContent>
            {loading ? (
                <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                </div>
            ) : (
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {users.length > 0 ? (
                    users.map((user) => (
                    <TableRow key={user.uid}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell><Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role}</Badge></TableCell>
                        <TableCell className="text-right space-x-2">
                            <Button variant="outline" size="sm" disabled>Edit</Button>
                            <Button variant="destructive" size="sm" disabled>Delete</Button>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
                        No users found.
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
            )}
            </CardContent>
        </Card>
    </div>
  );
}