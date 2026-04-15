'use client';

import { Button } from '@/components/ui/button';
import { ClientDashboard } from './_components/client-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useEffect, useState, Suspense, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearchParams } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

function PageSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                 <Skeleton className="h-10" />
                 <Skeleton className="h-10" />
                 <Skeleton className="h-10" />
            </div>
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
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

  const [startDate, setStartDate] = useState<Date | undefined>(new Date(2025, 6, 1));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  
  const [isConnected, setIsConnected] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    if (!startDate || !endDate) return;

    setLoading(true);
    setError(null);

    const start = format(startDate, 'yyyy-MM-dd');
    const end = format(endDate, 'yyyy-MM-dd');

    try {
      const res = await fetch(`/api/quickbooks/dashboard?startDate=${start}&endDate=${end}`);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || errorData.error || 'Failed to fetch data.');
      }
      
      const dashboardData = await res.json();
      setData(dashboardData);
      setIsConnected(true);
    } catch (e: any) {
      if (e.message.includes('QuickBooks not connected')) {
          setIsConnected(false);
          setData(null);
      } else {
          setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

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
      fetchDashboardData();
    } else {
        // Initial check to see if we are already connected
        const checkConnection = async () => {
             setLoading(true);
             try {
                const res = await fetch(`/api/quickbooks/dashboard?startDate=${format(startDate!, 'yyyy-MM-dd')}&endDate=${format(endDate!, 'yyyy-MM-dd')}`);
                 if (res.status === 404) {
                     setIsConnected(false);
                     setData(null);
                     return;
                 }
                 if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.details || errorData.error || 'Failed to check connection status.');
                 }
                 const dashboardData = await res.json();
                 setData(dashboardData);
                 setIsConnected(true);
             } catch (e: any) {
                 if (e.message.includes('QuickBooks not connected')) {
                     setIsConnected(false);
                     setData(null);
                 } else {
                     setError(e.message);
                 }
             } finally {
                 setLoading(false);
             }
        };
        checkConnection();
    }
  }, [searchParams, fetchDashboardData, startDate, endDate]);

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
        {loading && !data && <PageSkeleton />}

        {!loading && !isConnected && (
            <div className="flex flex-col items-center gap-8">
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
                    <a href="/api/auth/connect">Connect to QuickBooks</a>
                </Button>
                </CardContent>
            </Card>
          </div>
        )}

        {isConnected && (
            <div className="space-y-6">
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
                            {loading ? 'Loading...' : 'Run Report'}
                        </Button>
                    </CardContent>
                </Card>

                {error && <Alert variant="destructive" className="max-w-2xl mx-auto"><AlertTitle>Error</AlertTitle><AlertDescription className="whitespace-pre-wrap">{error}</AlertDescription></Alert>}

                {loading ? <PageSkeleton /> : data ? <ClientDashboard data={data} /> : (
                    <div className="text-center p-8 border rounded-lg">
                        <p>No data to display for the selected period.</p>
                    </div>
                )}
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
