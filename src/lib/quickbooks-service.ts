'use server';

import { qbApiRequest } from '@/lib/quickbooks-api';
import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns';

export async function getDashboardData({
  token,
  realmId,
}: {
  token: string;
  realmId: string;
}) {

  const getMonthlyPnl = async (months = 6) => {
    const today = new Date();
    const reportPromises = [];

    for (let i = months - 1; i >= 0; i--) {
        const targetDate = subMonths(today, i);
        const startDate = format(startOfMonth(targetDate), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(targetDate), 'yyyy-MM-dd');
        const monthName = format(targetDate, 'MMM');

        const endpoint = `reports/ProfitAndLoss?start_date=${startDate}&end_date=${endDate}&accounting_method=Cash`;
        reportPromises.push(qbApiRequest({ token, realmId, endpoint }).then(data => ({ data, monthName })));
    }
    
    // Use Promise.allSettled to ensure individual month failures don't block the whole dashboard
    const results = await Promise.allSettled(reportPromises);
    return results.map(res => res.status === 'fulfilled' ? res.value : { error: true, monthName: 'N/A', data: null });
  }

  const [pnlRes, balanceRes, cashflowRes, customersRes, invoicesRes, vendorsRes, billsRes, monthlyPnlRes] =
    await Promise.allSettled([
      qbApiRequest({ token, realmId, endpoint: 'reports/ProfitAndLoss' }),
      qbApiRequest({ token, realmId, endpoint: 'reports/BalanceSheet' }),
      qbApiRequest({ token, realmId, endpoint: 'reports/CashFlow' }),
      qbApiRequest({ token, realmId, endpoint: 'query?query=select * from Customer' }),
      qbApiRequest({ token, realmId, endpoint: 'query?query=select * from Invoice' }),
      qbApiRequest({ token, realmId, endpoint: 'query?query=select * from Vendor' }),
      qbApiRequest({ token, realmId, endpoint: 'query?query=select * from Bill' }),
      getMonthlyPnl(6)
    ]);
  
  const getData = (res: PromiseSettledResult<any>) => res.status === 'fulfilled' ? res.value : null;

  return {
    pnl: getData(pnlRes),
    balance: getData(balanceRes),
    cashflow: getData(cashflowRes),
    customers: getData(customersRes),
    invoices: getData(invoicesRes),
    vendors: getData(vendorsRes),
    bills: getData(billsRes),
    monthlyPnl: getData(monthlyPnlRes),
  };
}
