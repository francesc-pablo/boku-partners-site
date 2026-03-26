'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { KpiCard } from './kpi-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BalanceSheetChart, PnlChart, MonthlyCashChart } from './dashboard-charts';
import { DollarSign, TrendingUp, Wallet, Landmark, FileText, Activity, Users } from 'lucide-react';
import { format } from 'date-fns';

// TYPES
type DashboardData = {
  kpis: any;
  reports: any;
  charts: any;
  lists: any;
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

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
const formatDate = (dateString: string) => format(new Date(dateString), 'MMM d, yyyy');


export function ClientDashboard({ data }: { data: DashboardData }) {
  const kpis = data.kpis;
  const reports = data.reports;
  const charts = data.charts;
  const lists = data.lists;

  const { customers, invoices, vendors, bills } = lists;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Revenue" value={formatCurrency(kpis.totalIncome || 0)} icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} isLoading={false} />
        <KpiCard title="Net Income" value={formatCurrency(kpis.netIncome || 0)} icon={<Wallet className="h-4 w-4 text-muted-foreground" />} isLoading={false} />
        <KpiCard title="Cash Flow (Ops)" value={formatCurrency(kpis.netCashFromOps || 0)} icon={<Activity className="h-4 w-4 text-muted-foreground" />} isLoading={false} />
        <KpiCard title="Total Assets" value={formatCurrency(kpis.totalAssets || 0)} icon={<Landmark className="h-4 w-4 text-muted-foreground" />} isLoading={false} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Gross Profit" value={formatCurrency(kpis.grossProfit || 0)} icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />} isLoading={false} />
        <KpiCard title="Open Invoices" value={formatCurrency(kpis.totalOpenInvoices || 0)} icon={<FileText className="h-4 w-4 text-muted-foreground" />} isLoading={false} />
        <KpiCard title="Open Bills" value={formatCurrency(kpis.totalOpenBills || 0)} icon={<FileText className="h-4 w-4 text-muted-foreground" />} isLoading={false} />
        <KpiCard title="Total Customers" value={kpis.totalCustomers.toString()} icon={<Users className="h-4 w-4 text-muted-foreground" />} isLoading={false} />
      </div>

       <div className="grid gap-4 lg:grid-cols-1">
            <MonthlyCashChart data={charts.monthlyData} />
        </div>

      <div className="grid gap-4 lg:grid-cols-5">
         <div className="lg:col-span-3">
            <PnlChart data={charts.pnlChartData} />
         </div>
         <div className="lg:col-span-2">
            <BalanceSheetChart data={charts.assetBreakdown} />
         </div>
      </div>
      
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Recent Invoices</CardTitle>
                <CardDescription>Your 5 most recent invoices from QuickBooks.</CardDescription>
            </CardHeader>
            <CardContent>
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
                            invoices.slice(0, 5).map((invoice: Invoice) => (
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
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {customers.length > 0 ? (
                        customers.filter((c: Customer) => c.Balance > 0).sort((a: Customer,b: Customer) => b.Balance - a.Balance).slice(0, 5).map((customer: Customer) => (
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
                {customers.filter((c: Customer) => c.Balance > 0).length > 5 && (
                    <p className="text-center text-sm text-muted-foreground mt-4">
                        And {customers.filter((c: Customer) => c.Balance > 0).length - 5} more...
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
                            bills.slice(0, 5).map((bill: Bill) => (
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
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {vendors.length > 0 ? (
                    vendors.filter((v: Vendor) => v.Balance > 0).sort((a: Vendor, b: Vendor) => b.Balance - a.Balance).slice(0, 5).map((vendor: Vendor) => (
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
                {vendors.filter((v: Vendor) => v.Balance > 0).length > 5 && (
                    <p className="text-center text-sm text-muted-foreground mt-4">
                        And {vendors.filter((v: Vendor) => v.Balance > 0).length - 5} more...
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
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Account</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reports.pnlRows.map((row: any, index: number) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{row.name}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(parseFloat(row.value) || 0)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
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
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Account</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reports.balanceSheetRows.map((row: any, index: number) => (
                                 <TableRow key={index}>
                                    <TableCell className="font-medium">{row.name}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(parseFloat(row.value) || 0)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Cash Flow</CardTitle>
                    <CardDescription>Detailed cash flow statement.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Activity</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reports.cashFlowRows.map((row: any, index: number) => (
                                 <TableRow key={index}>
                                    <TableCell className="font-medium">{row.name}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(parseFloat(row.value) || 0)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
