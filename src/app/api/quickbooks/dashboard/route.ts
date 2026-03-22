import { NextResponse } from 'next/server';
import { getProfitAndLoss, getBalanceSheet, getCashFlow, getCustomers, getInvoices, getVendors, getBills } from '@/lib/quickbooks';

export async function GET() {
  // Use Promise.allSettled to prevent one failed request from blocking others
  const results = await Promise.allSettled([
    getProfitAndLoss(),
    getBalanceSheet(),
    getCashFlow(),
    getCustomers(),
    getInvoices(),
    getVendors(),
    getBills()
  ]);

  const [pnlRes, balanceRes, cashflowRes, customersRes, invoicesRes, vendorsRes, billsRes] = results;

  const getError = (res: PromiseSettledResult<any>) => {
    if (res.status === 'rejected' || (res.status === 'fulfilled' && res.value.error)) {
        const errorDetails = res.status === 'fulfilled' ? res.value : { error: 'An unknown error occurred.', status: 500 };
        return { error: errorDetails.error, status: errorDetails.status };
    }
    return null;
  }
  
  const pnlError = getError(pnlRes);
  if (pnlError) {
      return NextResponse.json({ error: `Profit & Loss Error: ${pnlError.error}` }, { status: pnlError.status });
  }

  const customersError = getError(customersRes);
   if (customersError) {
      return NextResponse.json({ error: `Customers Error: ${customersError.error}` }, { status: customersError.status });
  }

  const invoicesError = getError(invoicesRes);
   if (invoicesError) {
      return NextResponse.json({ error: `Invoices Error: ${invoicesError.error}` }, { status: invoicesError.status });
  }

  // Secondary requests: log errors but don't fail the whole request
  const balanceError = getError(balanceRes);
  if (balanceError) console.error("Balance Sheet Error:", balanceError.error);

  const cashflowError = getError(cashflowRes);
  if (cashflowError) console.error("Cash Flow Error:", cashflowError.error);

  const vendorsError = getError(vendorsRes);
  if (vendorsError) console.error("Vendors Error:", vendorsError.error);

  const billsError = getError(billsRes);
  if (billsError) console.error("Bills Error:", billsError.error);


  return NextResponse.json({
    pnl: pnlRes.status === 'fulfilled' ? pnlRes.value.data : null,
    balance: balanceRes.status === 'fulfilled' ? balanceRes.value.data : null,
    cashflow: cashflowRes.status === 'fulfilled' ? cashflowRes.value.data : null,
    customers: customersRes.status === 'fulfilled' ? customersRes.value.data : null,
    invoices: invoicesRes.status === 'fulfilled' ? invoicesRes.value.data : null,
    vendors: vendorsRes.status === 'fulfilled' ? vendorsRes.value.data : null,
    bills: billsRes.status === 'fulfilled' ? billsRes.value.data : null,
  });
}
