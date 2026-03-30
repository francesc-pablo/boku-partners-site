'use client';

import { Button } from '@/components/ui/button';
import { ClientDashboard } from './_components/client-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useEffect, useState, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearchParams } from 'next/navigation';

function PageSkeleton() {
    return (
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
}

function ClientPageContent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const searchParams = useSearchParams();

  useEffect(() => {
    const qbError = searchParams.get('error');
    const qbErrorDetails = searchParams.get('details');
    const qbSuccess = searchParams.get('success');

    if (qbError) {
      setError(`QuickBooks Connection Failed. Error: ${qbError}. Details: ${qbErrorDetails || 'No additional details provided.'}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    if (qbSuccess) {
      setSuccess('Successfully connected to QuickBooks! Fetching your data...');
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    async function fetchDashboardData() {
      try {
        setLoading(true);
        const res = await fetch('/api/quickbooks/dashboard');

        if (res.status === 404) {
          const errorData = await res.json().catch(() => null);
          setData(null);
          // Only set this error if a more specific one from the redirect isn't already present
          if (!qbError) {
              setError(errorData?.error || 'QuickBooks not connected.');
          }
          return;
        }

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: 'Failed to parse error response from server.' }));
          let fullError = errorData.error || 'Failed to fetch dashboard data.';
          if (errorData.details) {
            fullError += `\n\nDETAILS: ${errorData.details}`;
          }
          throw new Error(fullError);
        }

        const dashboardData = await res.json();
        setData(dashboardData);
        setError(null); // Clear previous errors on successful fetch
        setSuccess(null); // Clear success message after data is loaded
      } catch (e: any) {
        if (!qbError) {
            setError(e.message);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [searchParams]);

  return (
    <>
      <section className="bg-secondary">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-headline font-bold">Client Portal</h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            View your QuickBooks financial data at a glance.
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
            {error && <Alert variant="destructive" className="max-w-2xl"><AlertTitle>Connection Error</AlertTitle><AlertDescription className="whitespace-pre-wrap">{error}</AlertDescription></Alert>}
            {success && !error && <Alert className="max-w-2xl"><AlertTitle>Success</AlertTitle><AlertDescription>{success}</AlertDescription></Alert>}

            <Card className="max-w-md mx-auto w-full">
                <CardHeader className="text-center">
                <CardTitle>Connect to QuickBooks</CardTitle>
                <CardDescription>
                    To view your financial dashboard, you need to connect your QuickBooks Online account.
                </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                <Button asChild>
                    <a href="/api/auth/connect">Connect to QuickBooks</a>
                </Button>
                </CardContent>
            </Card>
            <Alert className="max-w-2xl mx-auto w-full" variant="default">
                <AlertTitle className="text-lg">Setup Instructions</AlertTitle>
                <AlertDescription>
                    <ol className="list-decimal list-inside space-y-2 mt-2">
                        <li>Go to your <a href="https://developer.intuit.com/app/builder/myapps" target="_blank" rel="noopener noreferrer" className="underline font-semibold">Intuit Developer Dashboard</a>.</li>
                        <li>Under the "Production" keys, add the following URL to your list of Redirect URIs:
                            <div className="bg-background p-2 rounded-md my-2">
                                <p className="font-mono text-sm break-all">{window.location.origin}/api/auth/callback</p>
                            </div>
                        </li>
                        <li>Ensure your <code>.env.local</code> file contains your production Client ID and Secret.</li>
                    </ol>
                </AlertDescription>
            </Alert>
          </div>
        )}
      </section>
    </>
  );
}

export default function ClientsPage() {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <ClientPageContent />
        </Suspense>
    );
}
