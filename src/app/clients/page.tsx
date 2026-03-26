'use client';

import { Button } from '@/components/ui/button';
import { ClientDashboard } from './_components/client-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

export default function ClientsPage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
        setLoading(false);
        // User not logged in, they will be redirected by useAuth or see login prompts elsewhere.
        // For this page, we just stop loading.
        return;
    }

    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);
        const idToken = await user.getIdToken();
        const res = await fetch('/api/quickbooks/dashboard', {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });

        if (res.status === 404) {
          // This status code now indicates that QB is not connected for this user
          setData(null);
          return;
        }

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch dashboard data.');
        }

        const dashboardData = await res.json();
        setData(dashboardData);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [user, authLoading]);

  const handleConnect = async () => {
    if (!user) {
        setError("You must be logged in to connect to QuickBooks.");
        return;
    }
    setIsConnecting(true);
    try {
        const idToken = await user.getIdToken();
        const res = await fetch('/api/auth/connect', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${idToken}`,
            },
        });
        if (!res.ok) {
            throw new Error('Failed to get QuickBooks connection URL.');
        }
        const { url } = await res.json();
        window.location.href = url;
    } catch (e: any) {
        setError(e.message);
        setIsConnecting(false);
    }
  };
  
  const PageSkeleton = () => (
    <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-96" />
    </div>
  )

  return (
    <>
      <section className="bg-secondary">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-headline font-bold">Client Dashboard</h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            View your QuickBooks data at a glance.
          </p>
        </div>
      </section>

      <section className="container mx-auto">
        {loading || authLoading ? (
            <PageSkeleton />
        ) : !user ? (
            <Card className="max-w-md mx-auto w-full">
                <CardHeader className="text-center">
                <CardTitle>Please Log In</CardTitle>
                <CardDescription>
                    You need to be logged in to view your dashboard.
                </CardDescription>
                </CardHeader>
            </Card>
        ) : data ? (
          <ClientDashboard data={data} />
        ) : (
          <div className="flex flex-col items-center gap-8">
            {error && <p className="text-destructive text-center">{error}</p>}
            <Card className="max-w-md mx-auto w-full">
                <CardHeader className="text-center">
                <CardTitle>Connect to QuickBooks</CardTitle>
                <CardDescription>
                    To view your dashboard, you need to connect your QuickBooks Online account first.
                </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                <Button onClick={handleConnect} disabled={isConnecting}>
                    {isConnecting ? 'Connecting...' : 'Connect to QuickBooks'}
                </Button>
                </CardContent>
            </Card>
            <Alert className="max-w-2xl mx-auto w-full">
                <AlertTitle className="text-xl">Setup Instructions for Developers</AlertTitle>
                <AlertDescription>
                    To complete the connection, add the following URL to your Intuit Developer App's "Redirect URIs" list and to your `.env.local` file under `QB_REDIRECT_URI`.
                    <div className="bg-background p-4 rounded-md my-4">
                        <p className="font-mono text-sm break-all select-all">http://localhost:9002/api/auth/callback</p>
                    </div>
                    For production, you must replace `http://localhost:9002` with your actual domain.
                </AlertDescription>
            </Alert>
          </div>
        )}
      </section>
    </>
  );
}
