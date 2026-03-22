'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { KpiCard } from './kpi-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BalanceSheetChart, PnlChart, MonthlyCashChart } from './dashboard-charts';
import { DollarSign, TrendingUp, Wallet, Landmark, FileText, Activity, Users } from 'lucide-react';
import { format } from 'date-fns';

// TYPES
type DashboardData = {
  pnl: any;
  balance: any;
  cashflow: any;
  customers: any;
  invoices: any;
  vendors: any;
  bills: any;
};

type Customer = {
  Id: string;
  DisplayName: string;
  PrimaryEmailAddr?: { Address: string };
  Balance: number;
};

type Invoice = {
    Id: string;
    DocNumber: string;
    TxnDate: string;
    CustomerRef: { name: string };
    TotalAmt: number;
    Balance: number;
};

type Vendor = {
  Id: string;
  DisplayName: string;
  PrimaryEmailAddr?: { Address: string };
  Balance: number;
};

type Bill = {
    Id: string;
    DocNumber: string;
    TxnDate: string;
    VendorRef: { name: string };
    TotalAmt: number;
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
    totalOpenInvoices: number;
    totalOpenBills: number;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
const formatDate = (dateString: string) => format(new Date(dateString), 'MMM d, yyyy');


// PARSING HELPERS
function flattenReportRows(rows: any[] | undefined): { name: string; value: string }[] {
    let flat: { name: string; value: string }[] = [];
    if (!rows) return flat;

    const rowsArray = Array.isArray(rows) ? rows : [rows];
  
    for (const row of rowsArray) {
      if (!row) continue;

      if (row.Header) {
        // This is a group row, e.g. "Income"
        const headerName = row.Header.ColData?.[0]?.value?.trim() || '';
        const summaryValue = row.Summary?.ColData?.[1]?.value || '0';
        if (headerName) {
            flat.push({ name: headerName, value: summaryValue });
        }
        
        // The summary might have its own name, e.g. "Total Income". Let's add that too.
        const summaryName = row.Summary?.ColData?.[0]?.value?.trim();
        if (summaryName && summaryName !== headerName) {
            flat.push({ name: summaryName, value: summaryValue });
        }

        if (row.Rows?.Row) {
          flat = flat.concat(flattenReportRows(row.Rows.Row));
        }
      } else if (row.ColData) {
        // This is a simple data row.
        const name = row.ColData?.[0]?.value?.trim() || '';
        const value = row.ColData?.[1]?.value || '0';
        if (name) {
            flat.push({ name, value });
        }
      }
    }
    return flat;
}

function parseQuickBooksData(data: DashboardData): ParsedData | null {
    if (!data.pnl || !data.customers || !data.invoices) return null;

    const pnlRows = flattenReportRows(data.pnl.Rows?.Row);
    const balanceRows = flattenReportRows(data.balance?.Rows?.Row);
    const cashflowRows = flattenReportRows(data.cashflow?.Rows?.Row);

    const getValue = (rows: {name: string, value: string}[], name: string) => {
        const row = rows.find(r => r.name === name);
        const rawValue = row?.value?.replace(/,/g, '') || '0';
        if (rawValue.startsWith('(') && rawValue.endsWith(')')) {
            return -parseFloat(rawValue.replace(/[()]/g, ''));
        }
        return parseFloat(rawValue);
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
    
    // Invoices
    const invoices: Invoice[] = data.invoices?.QueryResponse?.Invoice || [];
    const totalOpenInvoices = invoices.reduce((acc, inv) => acc + inv.Balance, 0);

    // Bills
    const bills: Bill[] = data.bills?.QueryResponse?.Bill || [];
    const totalOpenBills = bills.reduce((acc, bill) => acc + bill.Balance, 0);

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
        assetBreakdown,
        totalOpenInvoices,
        totalOpenBills
    };
}


export function ClientDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [pnlRows, setPnlRows] = useState<{name: string; value: string}[]>([]);
  const [balanceSheetRows, setBalanceSheetRows] = useState<{name: string; value: string}[]>([]);
  const [cashFlowRows, setCashFlowRows] = useState<{name: string; value: string}[]>([]);
  
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [monthlyLoading, setMonthlyLoading] = useState(true);

  const getValue = (rows: {name: string, value: string}[], name: string) => {
    const row = rows.find(r => r.name === name);
    const rawValue = row?.value?.replace(/,/g, '') || '0';
    if (rawValue.startsWith('(') && rawValue.endsWith(')')) {
        return -parseFloat(rawValue.replace(/[()]/g, ''));
    }
    return parseFloat(rawValue);
  }

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

        if(dashboardData.pnl) {
            setPnlRows(flattenReportRows(dashboardData.pnl.Rows?.Row));
        }
        if(dashboardData.balance) {
            setBalanceSheetRows(flattenReportRows(dashboardData.balance.Rows?.Row));
        }
        if(dashboardData.cashflow) {
            setCashFlowRows(flattenReportRows(dashboardData.cashflow.Rows?.Row));
        }

      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    
    async function fetchMonthlyData() {
        try {
            setMonthlyLoading(true);
            const res = await fetch('/api/quickbooks/monthly-pnl');
            if (!res.ok) {
                throw new Error('Failed to fetch monthly data');
            }
            const rawReports = await res.json();
            
            const parsedMonthlyData = rawReports.map((report: any) => {
                if (report.error || !report.data) {
                    return { name: report.monthName, 'Money In': 0, 'Money Out': 0 };
                }
                const pnlRows = flattenReportRows(report.data.Rows?.Row);
                const totalIncome = getValue(pnlRows, 'Total Income');
                const totalExpenses = getValue(pnlRows, 'Total Expenses');
                return {
                    name: report.monthName,
                    'Money In': totalIncome,
                    'Money Out': totalExpenses,
                };
            });

            setMonthlyData(parsedMonthlyData);

        } catch (e) {
            // silently fail for this chart for now
            console.error("Failed to load monthly cash flow chart", e);
        } finally {
            setMonthlyLoading(false);
        }
    }

    fetchDashboardData();
    fetchMonthlyData();
  }, []);

  const pnlChartData = parsedData ? [{
    name: 'P&L',
    'Income': parsedData.totalIncome,
    'Expenses': parsedData.totalExpenses,
  }] : [];

  const customers: Customer[] = data?.customers?.QueryResponse?.Customer || [];
  const invoices: Invoice[] = data?.invoices?.QueryResponse?.Invoice || [];
  const vendors: Vendor[] = data?.vendors?.QueryResponse?.Vendor || [];
  const bills: Bill[] = data?.bills?.QueryResponse?.Bill || [];


  return (
    <div className="space-y-6">
       {error && <p className="text-destructive text-center p-4 bg-destructive/10 rounded-md">Error: {error}</p>}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Revenue" value={loading ? '...' : formatCurrency(parsedData?.totalIncome || 0)} icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} isLoading={loading} />
        <KpiCard title="Net Income" value={loading ? '...' : formatCurrency(parsedData?.netIncome || 0)} icon={<Wallet className="h-4 w-4 text-muted-foreground" />} isLoading={loading} />
        <KpiCard title="Cash Flow (Ops)" value={loading ? '...' : formatCurrency(parsedData?.netCashFromOps || 0)} icon={<Activity className="h-4 w-4 text-muted-foreground" />} isLoading={loading} />
        <KpiCard title="Total Assets" value={loading ? '...' : formatCurrency(parsedData?.totalAssets || 0)} icon={<Landmark className="h-4 w-4 text-muted-foreground" />} isLoading={loading} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Gross Profit" value={loading ? '...' : formatCurrency(parsedData?.grossProfit || 0)} icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />} isLoading={loading} />
        <KpiCard title="Open Invoices" value={loading ? '...' : formatCurrency(parsedData?.totalOpenInvoices || 0)} icon={<FileText className="h-4 w-4 text-muted-foreground" />} isLoading={loading} />
        <KpiCard title="Open Bills" value={loading ? '...' : formatCurrency(parsedData?.totalOpenBills || 0)} icon={<FileText className="h-4 w-4 text-muted-foreground" />} isLoading={loading} />
        <KpiCard title="Total Customers" value={loading ? '...' : customers.length.toString()} icon={<Users className="h-4 w-4 text-muted-foreground" />} isLoading={loading} />
      </div>

       <div className="grid gap-4 lg:grid-cols-1">
            {monthlyLoading ? <Skeleton className="h-[380px] w-full" /> : <MonthlyCashChart data={monthlyData} />}
        </div>

      <div className="grid gap-4 lg:grid-cols-5">
         <div className="lg:col-span-3">
            {loading ? <Skeleton className="h-[380px] w-full" /> : <PnlChart data={pnlChartData} />}
         </div>
         <div className="lg:col-span-2">
            {loading ? <Skeleton className="h-[380px] w-full" /> : <BalanceSheetChart data={parsedData?.assetBreakdown || []} />}
         </div>
      </div>
      
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Recent Invoices</CardTitle>
                <CardDescription>Your 5 most recent invoices from QuickBooks.</CardDescription>
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
                                <TableHead>Invoice #</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.length > 0 ? (
                                invoices.slice(0, 5).map((invoice) => (
                                    <TableRow key={invoice.Id}>
                                        <TableCell className="font-medium">#{invoice.DocNumber}</TableCell>
                                        <TableCell>{invoice.CustomerRef.name}</TableCell>
                                        <TableCell>{formatDate(invoice.TxnDate)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(invoice.TotalAmt)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">
                                        No invoices found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
                 {invoices.length > 5 && (
                    <p className="text-center text-sm text-muted-foreground mt-4">
                        And {invoices.length - 5} more...
                    </p>
                )}
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Top Customers by Balance</CardTitle>
                <CardDescription>Your customers with the highest open balance.</CardDescription>
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
                    <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {customers.length > 0 ? (
                    customers.filter(c => c.Balance > 0).sort((a,b) => b.Balance - a.Balance).slice(0, 5).map((customer) => (
                        <TableRow key={customer.Id}>
                        <TableCell className="font-medium">{customer.DisplayName}</TableCell>
                        <TableCell className="text-right">{formatCurrency(customer.Balance)}</TableCell>
                        </TableRow>
                    ))
                    ) : (
                    <TableRow>
                        <TableCell colSpan={2} className="text-center h-24">
                        No customers found.
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
                </Table>
                )}
                {customers.filter(c => c.Balance > 0).length > 5 && (
                    <p className="text-center text-sm text-muted-foreground mt-4">
                        And {customers.filter(c => c.Balance > 0).length - 5} more...
                    </p>
                )}
            </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Recent Bills</CardTitle>
                <CardDescription>Your 5 most recent bills from QuickBooks.</CardDescription>
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
                                <TableHead>Bill #</TableHead>
                                <TableHead>Vendor</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bills.length > 0 ? (
                                bills.slice(0, 5).map((bill) => (
                                    <TableRow key={bill.Id}>
                                        <TableCell className="font-medium">#{bill.DocNumber}</TableCell>
                                        <TableCell>{bill.VendorRef.name}</TableCell>
                                        <TableCell>{formatDate(bill.TxnDate)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(bill.TotalAmt)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">
                                        No bills found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
                 {bills.length > 5 && (
                    <p className="text-center text-sm text-muted-foreground mt-4">
                        And {bills.length - 5} more...
                    </p>
                )}
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Top Vendors by Balance</CardTitle>
                <CardDescription>Your vendors with the highest open balance.</CardDescription>
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
                    <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {vendors.length > 0 ? (
                    vendors.filter(v => v.Balance > 0).sort((a,b) => b.Balance - a.Balance).slice(0, 5).map((vendor) => (
                        <TableRow key={vendor.Id}>
                        <TableCell className="font-medium">{vendor.DisplayName}</TableCell>
                        <TableCell className="text-right">{formatCurrency(vendor.Balance)}</TableCell>
                        </TableRow>
                    ))
                    ) : (
                    <TableRow>
                        <TableCell colSpan={2} className="text-center h-24">
                        No vendors found.
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
                </Table>
                )}
                {vendors.filter(v => v.Balance > 0).length > 5 && (
                    <p className="text-center text-sm text-muted-foreground mt-4">
                        And {vendors.filter(v => v.Balance > 0).length - 5} more...
                    </p>
                )}
            </CardContent>
        </Card>
      </div>

       <div className="grid gap-4 lg:grid-cols-1 mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>Profit &amp; Loss</CardTitle>
                    <CardDescription>Detailed profit and loss statement.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <Skeleton className="h-40 w-full" />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Account</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pnlRows.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{row.name}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(parseFloat(row.value) || 0)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
        <div className="grid gap-4 lg:grid-cols-2 mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>Balance Sheet</CardTitle>
                    <CardDescription>Detailed balance sheet statement.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <Skeleton className="h-40 w-full" />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Account</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {balanceSheetRows.map((row, index) => (
                                     <TableRow key={index}>
                                        <TableCell className="font-medium">{row.name}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(parseFloat(row.value) || 0)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Cash Flow</CardTitle>
                    <CardDescription>Detailed cash flow statement.</CardDescription>
                </CardHeader>
                <CardContent>
                     {loading ? (
                        <Skeleton className="h-40 w-full" />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Activity</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cashFlowRows.map((row, index) => (
                                     <TableRow key={index}>
                                        <TableCell className="font-medium">{row.name}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(parseFloat(row.value) || 0)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
