'use server';

import { qbApiRequest } from '@/lib/quickbooks-api';

export async function getDashboardData({
  token,
  realmId,
  startDate,
  endDate,
}: {
  token: string;
  realmId: string;
  startDate: string;
  endDate: string;
}) {

  const getReport = (reportName: string) => {
    const endpoint = `reports/${reportName}?start_date=${startDate}&end_date=${endDate}&summarize_column_by=Month`;
    return qbApiRequest({ token, realmId, endpoint });
  };
  
  const getBalanceSheet = () => {
    // Balance sheet is a snapshot, so end_date is more relevant, but we pass both for consistency.
    const endpoint = `reports/BalanceSheet?start_date=${startDate}&end_date=${endDate}&summarize_column_by=Month`;
    return qbApiRequest({ token, realmId, endpoint });
  }

  const [pnlRes, balanceRes, cashflowRes] =
    await Promise.allSettled([
      getReport('ProfitAndLoss'),
      getBalanceSheet(),
      getReport('CashFlow'),
    ]);
  
  const getData = (res: PromiseSettledResult<any>) => res.status === 'fulfilled' ? res.value : { error: res.reason?.message || 'Failed to fetch report' };

  return {
    pnl: getData(pnlRes),
    balance: getData(balanceRes),
    cashflow: getData(cashflowRes),
  };
}
