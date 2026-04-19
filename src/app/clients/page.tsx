'use client';

import { ClientDashboard } from './_components/client-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useEffect, useState, Suspense, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearchParams } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { usePortalUser } from '@/hooks/use-portal-user';
import { collection, query, limit } from 'firebase/firestore';
import { getDashboardData } from './actions';
import { Button } from '@/components/ui/button';


function PageSkeleton() {
    return (
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-4 w-2/4" />
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <Skeleton className="h-10 w-[280px]" />
                        <Skeleton className="h-10 w-[280px]" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </CardContent>
            </Card>
            <Skeleton className="h-96" />
        </div>
    );
}

function ClientPageContent() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);
  
  const searchParams = useSearchParams();
  const firestore = useFirestore();

  const { user } = useUser();
  const { portalUser, isLoading: isPortalUserLoading } = usePortalUser(user?.uid);
  
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(new Date().getFullYear(), 0, 1));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  
  // Fetch the QuickBooks integration details for the current client
  const qbIntegrationQuery = useMemoFirebase(() => {
    if (!firestore || !portalUser?.clientId) return null;
    return query(collection(firestore, 'clients', portalUser.clientId, 'quickBooksIntegration'), limit(1));
  }, [firestore, portalUser?.clientId]);

  const { data: qbIntegration, isLoading: isQbLoading } = useCollection(qbIntegrationQuery);
  const isConnected = qbIntegration ? qbIntegration.length > 0 : false;
  
  const fetchDashboardData = useCallback(async () => {
    if (!startDate || !endDate || !portalUser?.clientId) return;

    setLoading(true);
    setError(null);
    setAuthError(false);
    try {
      const dashboardData = await getDashboardData({
          clientId: portalUser.clientId,
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd')
      });
      setData(dashboardData);
    } catch (e: any) {
        if (e.message.includes('Failed to refresh QuickBooks token')) {
            setError('Your connection to QuickBooks has expired. Please reconnect to continue.');
            setAuthError(true);
        } else {
            setError(e.message);
        }
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, portalUser?.clientId]);

  useEffect(() => {
    const qbError = searchParams.get('error');
    const qbErrorDetails = searchParams.get('details');
    const qbSuccess = searchParams.get('success');

    if (qbError) {
      setError(`QuickBooks Connection Failed: ${qbError}. ${qbErrorDetails || ''}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    if (qbSuccess) {
      setSuccess('Successfully connected to QuickBooks! Fetching your data...');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams]);

  useEffect(() => {
    // Auto-fetch data once connection status is confirmed
    if (isConnected && !data) {
        fetchDashboardData();
    }
  }, [isConnected, data, fetchDashboardData]);

  const pageLoading = isPortalUserLoading || isQbLoading;

  if (pageLoading) {
    return <PageSkeleton />;
  }

  return (
    <>
        {!isConnected && (
            <div className="flex flex-col items-center justify-center gap-8 text-center h-[60vh]">
            {error && <Alert variant="destructive" className="max-w-2xl"><AlertTitle>Connection Error</AlertTitle><AlertDescription className="whitespace-pre-wrap">{error}</AlertDescription></Alert>}
            
            <Card className="max-w-md mx-auto w-full">
                <CardHeader className="text-center">
                <CardTitle>Connect to QuickBooks</CardTitle>
                <CardDescription>
                    To view your financial dashboard, you need to connect your QuickBooks Online account.
                </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                <Button asChild>
                    <a href={`/api/auth/connect?clientId=${portalUser?.clientId}`}>Connect to QuickBooks</a>
                </Button>
                </CardContent>
            </Card>
          </div>
        )}

        {isConnected && (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Dashboard</h1>
                        <p className="text-muted-foreground">View your QuickBooks financial data at a glance.</p>
                    </div>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Report Filters</CardTitle>
                        <CardDescription>Select a date range to view your financial reports.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row items-center gap-4">
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                "w-[280px] justify-start text-left font-normal",
                                !startDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {startDate ? format(startDate, "PPP") : <span>Pick a start date</span>}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={startDate}
                                onSelect={setStartDate}
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                         <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                "w-[280px] justify-start text-left font-normal",
                                !endDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {endDate ? format(endDate, "PPP") : <span>Pick an end date</span>}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={endDate}
                                onSelect={setEndDate}
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <Button onClick={fetchDashboardData} disabled={loading}>
                            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</> : 'Run Report'}
                        </Button>
                    </CardContent>
                </Card>

                {success && <Alert><AlertTitle>Success!</AlertTitle><AlertDescription>{success}</AlertDescription></Alert>}
                {error && <Alert variant="destructive" className="max-w-2xl mx-auto"><AlertTitle>Error</AlertTitle><AlertDescription className="whitespace-pre-wrap">{error}
                    {authError && (
                        <div className="mt-4">
                            <Button asChild>
                                <a href={`/api/auth/connect?clientId=${portalUser?.clientId}`}>Reconnect to QuickBooks</a>
                            </Button>
                        </div>
                    )}
                </AlertDescription></Alert>}

                {loading ? <PageSkeleton /> : data ? <ClientDashboard data={data} /> : (
                    <div className="text-center p-8 border rounded-lg">
                        <p>No data to display for the selected period. Run a report to see your data.</p>
                    </div>
                )}
            </div>
        )}
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
