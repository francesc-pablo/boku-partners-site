'use client';

import { Button } from '@/components/ui/button';
import { ClientDashboard } from './_components/client-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ClientsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Handle errors from the OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const qbError = urlParams.get('error');
    const qbErrorDetails = urlParams.get('details');
    const qbSuccess = urlParams.get('success');

    if (qbError) {
      let decodedDetails = qbErrorDetails;
      try {
        if (decodedDetails) {
          decodedDetails = JSON.stringify(JSON.parse(decodedDetails), null, 2);
        }
      } catch (e) {}

      setError(`QuickBooks Connection Failed. Error: ${qbError}. Details: ${decodedDetails || 'No additional details.'}`);
      // Clear the error from the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    if (qbSuccess) {
      setSuccess('Successfully connected to QuickBooks! Fetching your data...');
      window.history.replaceState({}, document.title, window.location.pathname);
    }


    async function fetchDashboardData() {
      try {
        setLoading(true);
        // Do not set error here, so the OAuth error remains visible
        // setError(null);
        const res = await fetch('/api/quickbooks/dashboard');

        if (res.status === 404) {
          setData(null);
          const errorData = await res.json().catch(() => null);
          if (errorData && errorData.error && !qbError) { // Don't overwrite the more specific OAuth error
              setError(errorData.error)
          }
          return;
        }

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch dashboard data.');
        }

        const dashboardData = await res.json();
        setData(dashboardData);
        setSuccess(null); // Clear success message after data is loaded
      } catch (e: any) {
        if (!qbError) { // Don't overwrite the more specific OAuth error
            setError(e.message);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const PageSkeleton = () => (
    <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-96" />
    </div>
  );

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
        {loading ? (
          <PageSkeleton />
        ) : data ? (
          <ClientDashboard data={data} />
        ) : (
          <div className="flex flex-col items-center gap-8">
            {error && <Alert variant="destructive"><AlertTitle>Connection Error</AlertTitle><AlertDescription className="whitespace-pre-wrap">{error}</AlertDescription></Alert>}
            {success && !error && <Alert><AlertTitle>Success</AlertTitle><AlertDescription>{success}</AlertDescription></Alert>}

            <Card className="max-w-md mx-auto w-full">
                <CardHeader className="text-center">
                <CardTitle>Connect to QuickBooks</CardTitle>
                <CardDescription>
                    To view your dashboard, you need to connect your QuickBooks Online account first.
                </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                <Button asChild>
                    <a href="/api/auth/connect">Connect to QuickBooks</a>
                </Button>
                </CardContent>
            </Card>
            <Alert className="max-w-2xl mx-auto w-full">
                <AlertTitle className="text-xl">Setup Instructions for Developers</AlertTitle>
                <AlertDescription>
                    To complete the connection, add your app's production redirect URI to your Intuit Developer App's "Redirect URIs" list and to your `.env.local` file under `QB_REDIRECT_URI`.
                    <div className="bg-background p-4 rounded-md my-4">
                        <p className="font-mono text-sm break-all">e.g., https://your-app-domain.com/api/auth/callback</p>
                    </div>
                    Ensure your `.env.local` file also contains your production Client ID and Secret.
                </AlertDescription>
            </Alert>
          </div>
        )}
      </section>
    </>
  );
}
