'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { KpiCard } from './kpi-card';
import { RevenueChart } from './revenue-chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type DashboardData = {
  pnl: any;
  balance: any;
  cashflow: any;
  customers: any;
};

type Customer = {
  Id: string;
  DisplayName: string;
  PrimaryEmailAddr?: { Address: string };
  PrimaryPhone?: { FreeFormNumber: string };
  Balance: number;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

function extractPnlValue(pnl: any, name: string): number {
  if (!pnl?.Rows?.Row) return 0;

  const findRow = (rows: any[], target: string): any => {
    for (const row of rows) {
      const rowName = row.Header?.ColData?.[0]?.value || row.ColData?.[0]?.value;
      if (rowName?.trim() === target.trim()) {
        return row;
      }
      if (row.Rows?.Row) {
        const found = findRow(row.Rows.Row, target);
        if (found) return found;
      }
    }
    return null;
  };
  
  const row = findRow(pnl.Rows.Row, name);

  if (row) {
    const value = row.Summary?.ColData?.[1]?.value || row.ColData?.[1]?.value;
    return parseFloat(value || '0');
  }

  return 0;
}

export function ClientDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/quickbooks/dashboard');
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch dashboard data from QuickBooks.');
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
  }, []);

  const totalIncome = data?.pnl ? extractPnlValue(data.pnl, 'Total Income') : 0;
  const totalExpenses = data?.pnl ? extractPnlValue(data.pnl, 'Total Expenses') : 0;
  const netIncome = data?.pnl ? extractPnlValue(data.pnl, 'Net Income') : 0;

  const chartData = [
    { name: 'Total Income', value: totalIncome },
    { name: 'Total Expenses', value: totalExpenses },
  ];

  const customers: Customer[] = data?.customers?.QueryResponse?.Customer || [];

  return (
    <div className="space-y-6">
       {error && <p className="text-destructive text-center p-4 bg-destructive/10 rounded-md">Error: {error}</p>}

      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard title="Total Revenue" value={formatCurrency(totalIncome)} isLoading={loading} />
        <KpiCard title="Total Expenses" value={formatCurrency(totalExpenses)} isLoading={loading} />
        <KpiCard title="Net Income" value={formatCurrency(netIncome)} isLoading={loading} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
         {loading ? <Skeleton className="h-[430px] w-full" /> : <RevenueChart data={chartData} />}
         <Card>
            <CardHeader>
              <CardTitle>Customers</CardTitle>
              <CardDescription>A list of your customers from QuickBooks.</CardDescription>
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
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.length > 0 ? (
                    customers.slice(0, 5).map((customer) => (
                      <TableRow key={customer.Id}>
                        <TableCell className="font-medium">{customer.DisplayName}</TableCell>
                        <TableCell>{customer.PrimaryEmailAddr?.Address || 'N/A'}</TableCell>
                        <TableCell className="text-right">{formatCurrency(customer.Balance)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center h-24">
                        No customers found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              )}
               {customers.length > 5 && (
                  <p className="text-center text-sm text-muted-foreground mt-4">
                      And {customers.length - 5} more...
                  </p>
              )}
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
