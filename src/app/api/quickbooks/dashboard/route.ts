import { NextResponse } from 'next/server';
import { getProfitAndLoss, getBalanceSheet, getCashFlow, getCustomers, getInvoices } from '@/lib/quickbooks';

export async function GET() {
  // Use Promise.allSettled to prevent one failed request from blocking others
  const results = await Promise.allSettled([
    getProfitAndLoss(),
    getBalanceSheet(),
    getCashFlow(),
    getCustomers(),
    getInvoices()
  ]);

  const [pnlRes, balanceRes, cashflowRes, customersRes, invoicesRes] = results;

  const getError = (res: PromiseSettledResult<any>) => {
    if (res.status === 'rejected' || (res.status === 'fulfilled' && res.value.error)) {
        return res.status === 'fulfilled' ? res.value : { error: 'An unknown error occurred.', status: 500 };
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

  // Balance Sheet and Cash Flow are secondary, so we can check for them but not fail the whole request
  const balanceError = getError(balanceRes);
  if (balanceError) console.error("Balance Sheet Error:", balanceError.error);

  const cashflowError = getError(cashflowRes);
  if (cashflowError) console.error("Cash Flow Error:", cashflowError.error);

  return NextResponse.json({
    pnl: pnlRes.status === 'fulfilled' ? pnlRes.value.data : null,
    balance: balanceRes.status === 'fulfilled' ? balanceRes.value.data : null,
    cashflow: cashflowRes.status === 'fulfilled' ? cashflowRes.value.data : null,
    customers: customersRes.status === 'fulfilled' ? customersRes.value.data : null,
    invoices: invoicesRes.status === 'fulfilled' ? invoicesRes.value.data : null,
  });
}
