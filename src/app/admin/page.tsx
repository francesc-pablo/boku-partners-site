'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminDashboard } from './_components/admin-dashboard';

export default function AdminPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (userProfile?.role !== 'admin') {
        router.push('/clients'); // or a dedicated '/unauthorized' page
      }
    }
  }, [user, userProfile, loading, router]);

  if (loading || !user || userProfile?.role !== 'admin') {
    return (
      <section className="container mx-auto py-12">
        <div className="space-y-8 max-w-6xl mx-auto">
          <Skeleton className="h-12 w-1/4" />
          <Skeleton className="h-96 w-full" />
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="bg-secondary">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-headline font-bold">Admin Dashboard</h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Manage users and system settings.
          </p>
        </div>
      </section>

      <section className="container mx-auto">
        <AdminDashboard />
      </section>
    </>
  );
}
