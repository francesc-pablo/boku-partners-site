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
        <div className="h-full flex flex-col gap-4 p-4">
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-7 w-48 mb-2" />
                    <Skeleton className="h-5 w-72" />
                </div>
            </div>
             <Card>
                <CardHeader className="p-4 pb-2">
                    <Skeleton className="h-5 w-1/4 mb-1" />
                    <Skeleton className="h-3 w-2/4" />
                </CardHeader>
                <CardContent className="p-4 pt-2">
                    <div className="flex flex-col md:flex-row items-center gap-2">
                        <Skeleton className="h-9 w-full md:w-40" />
                        <Skeleton className="h-9 w-full md:w-40" />
                        <Skeleton className="h-9 w-24" />
                    </div>
                </CardContent>
            </Card>
            <div className="flex-1 min-h-0">
                <Skeleton className="h-full w-full" />
            </div>
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
  
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(2025, 6, 1));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  
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
    if (isConnected && !data) {
        fetchDashboardData();
    }
  }, [isConnected, data, fetchDashboardData]);

  const pageLoading = isPortalUserLoading || isQbLoading;

  if (pageLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="h-full flex flex-col gap-4 p-4">
        {!isConnected && (
            <div className="flex-1 flex items-center justify-center">
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
                    {error && <Alert variant="destructive" className="m-4 mt-0"><AlertTitle>Connection Error</AlertTitle><AlertDescription className="whitespace-pre-wrap">{error}</AlertDescription></Alert>}
                </Card>
            </div>
        )}

        {isConnected && (
            <>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Quickbooks</h1>
                        <p className="text-muted-foreground">View your QuickBooks financial data at a glance.</p>
                    </div>
                </div>
                <Card>
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-lg">Report Filters</CardTitle>
                        <CardDescription className="text-xs">Select a date range to view your financial reports.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-2 flex flex-col md:flex-row items-center gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                size="sm"
                                className={cn(
                                "w-full md:w-auto justify-start text-left font-normal text-xs",
                                !startDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-1 h-3.5 w-3.5" />
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
                                size="sm"
                                className={cn(
                                "w-full md:w-auto justify-start text-left font-normal text-xs",
                                !endDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-1 h-3.5 w-3.5" />
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
                        <Button onClick={fetchDashboardData} disabled={loading} size="sm" className="w-full md:w-auto text-xs">
                            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</> : 'Run Report'}
                        </Button>
                    </CardContent>
                </Card>
                
                {success && <Alert><AlertTitle>Success!</AlertTitle><AlertDescription>{success}</AlertDescription></Alert>}
                {error && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription className="whitespace-pre-wrap">{error}
                    {authError && (
                        <div className="mt-4">
                            <Button asChild>
                                <a href={`/api/auth/connect?clientId=${portalUser?.clientId}`}>Reconnect to QuickBooks</a>
                            </Button>
                        </div>
                    )}
                </AlertDescription></Alert>}

                <div className="flex-1 min-h-0">
                    {loading ? (
                         <div className="h-full flex flex-col">
                            <Skeleton className="h-full w-full" />
                        </div>
                    ) : data ? (
                        <ClientDashboard data={data} />
                    ) : (
                        <div className="text-center p-8 border rounded-lg h-full flex items-center justify-center">
                            <p>No data to display for the selected period. Run a report to see your data.</p>
                        </div>
                    )}
                </div>
            </>
        )}
    </div>
  );
}

export default function ClientsPage() {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <ClientPageContent />
        </Suspense>
    );
}
