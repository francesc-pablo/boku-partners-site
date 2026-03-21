'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { KpiCard } from './kpi-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BalanceSheetChart, PnlChart } from './dashboard-charts';
import { DollarSign, TrendingUp, Wallet, Landmark } from 'lucide-react';

// TYPES
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

type ParsedData = {
    totalIncome: number;
    totalExpenses: number;
    netIncome: number;
    grossProfit: number;
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    currentAssets: number;
    cash: number;
    netCashFromOps: number;
    assetBreakdown: {name: string, value: number}[];
}

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

// PARSING HELPERS
function flattenReportRows(rows: any[]): { name: string; value: string }[] {
    let flat: { name: string; value: string }[] = [];
    if (!rows) return flat;

    const rowsArray = Array.isArray(rows) ? rows : [rows];
  
    for (const row of rowsArray) {
      if (!row) continue;

      let name = '';
      let value = '0';

      if (row.Header) {
        name = row.Header.ColData?.[0]?.value.trim();
        value = row.Summary?.ColData?.[1]?.value || '0';
        flat.push({ name, value });
        if (row.Rows?.Row) {
          flat = flat.concat(flattenReportRows(row.Rows.Row));
        }
      } else if (row.ColData) {
        name = row.ColData?.[0]?.value.trim();
        value = row.ColData?.[1]?.value || '0';
        flat.push({ name, value });
      }
    }
    return flat;
}

function parseQuickBooksData(data: DashboardData): ParsedData | null {
    if (!data.pnl || !data.balance || !data.cashflow) return null;

    const pnlRows = flattenReportRows(data.pnl.Rows?.Row);
    const balanceRows = flattenReportRows(data.balance.Rows?.Row);
    const cashflowRows = flattenReportRows(data.cashflow.Rows?.Row);

    const getValue = (rows: {name: string, value: string}[], name: string) => {
        const row = rows.find(r => r.name === name);
        return parseFloat(row?.value || '0');
    }

    // P&L
    const totalIncome = getValue(pnlRows, 'Total Income');
    const grossProfit = getValue(pnlRows, 'Gross Profit');
    const totalExpenses = getValue(pnlRows, 'Total Expenses');
    const netIncome = getValue(pnlRows, 'Net Income');

    // Balance Sheet
    const cash = getValue(balanceRows, 'Total Bank Accounts');
    const currentAssets = getValue(balanceRows, 'Total Current Assets');
    const totalAssets = getValue(balanceRows, 'Total Assets');
    const totalLiabilities = getValue(balanceRows, 'Total Liabilities');
    const totalEquity = getValue(balanceRows, 'Total Equity');

    // Asset breakdown for chart
    const assetBreakdown = [
        { name: 'Bank Accounts', value: cash },
        { name: 'Other Current Assets', value: currentAssets - cash },
        { name: 'Fixed Assets', value: getValue(balanceRows, 'Total Fixed Assets') },
        { name: 'Other Assets', value: getValue(balanceRows, 'Total Other Assets') },
    ].filter(asset => asset.value > 0);


    // Cash Flow
    const netCashFromOps = getValue(cashflowRows, 'Net Cash Provided by Operating Activities');

    return {
        totalIncome,
        totalExpenses,
        netIncome,
        grossProfit,
        totalAssets,
        totalLiabilities,
        totalEquity,
        currentAssets,
        cash,
        netCashFromOps,
        assetBreakdown
    };
}


export function ClientDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
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
        const dashboardData: DashboardData = await res.json();
        setData(dashboardData);
        const parsed = parseQuickBooksData(dashboardData);
        setParsedData(parsed);

      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  const pnlChartData = parsedData ? [{
    name: 'P&L',
    'Income': parsedData.totalIncome,
    'Expenses': parsedData.totalExpenses,
  }] : [];

  const customers: Customer[] = data?.customers?.QueryResponse?.Customer || [];

  return (
    <div className="space-y-6">
       {error && <p className="text-destructive text-center p-4 bg-destructive/10 rounded-md">Error: {error}</p>}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Revenue" value={loading ? '...' : formatCurrency(parsedData?.totalIncome || 0)} icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} isLoading={loading} />
        <KpiCard title="Gross Profit" value={loading ? '...' : formatCurrency(parsedData?.grossProfit || 0)} icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />} isLoading={loading} />
        <KpiCard title="Net Income" value={loading ? '...' : formatCurrency(parsedData?.netIncome || 0)} icon={<Wallet className="h-4 w-4 text-muted-foreground" />} isLoading={loading} />
        <KpiCard title="Total Assets" value={loading ? '...' : formatCurrency(parsedData?.totalAssets || 0)} icon={<Landmark className="h-4 w-4 text-muted-foreground" />} isLoading={loading} />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
         <div className="lg:col-span-3">
            {loading ? <Skeleton className="h-[380px] w-full" /> : <PnlChart data={pnlChartData} />}
         </div>
         <div className="lg:col-span-2">
            {loading ? <Skeleton className="h-[380px] w-full" /> : <BalanceSheetChart data={parsedData?.assetBreakdown || []} />}
         </div>
      </div>
      
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
                customers.slice(0, 10).map((customer) => (
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
            {customers.length > 10 && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                    And {customers.length - 10} more...
                </p>
            )}
        </CardContent>
        </Card>
    </div>
  );
}
