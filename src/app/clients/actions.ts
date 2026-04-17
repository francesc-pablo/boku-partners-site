'use server';

import { getValidAccessToken } from '@/lib/quickbooks-auth';
import { qbApiRequest } from '@/lib/quickbooks-api';

interface GetDashboardDataParams {
    clientId: string;
    startDate: string;
    endDate: string;
}

export async function getDashboardData({
  clientId,
  startDate,
  endDate,
}: GetDashboardDataParams) {

  // This action runs on the server, so it's safe to get tokens here.
  const { accessToken, realmId } = await getValidAccessToken(clientId);

  const getReport = (reportName: string) => {
    const endpoint = `reports/${reportName}?start_date=${startDate}&end_date=${endDate}&summarize_column_by=Month`;
    return qbApiRequest({ token: accessToken, realmId, endpoint });
  };
  
  const getBalanceSheet = () => {
    // Balance sheet is a snapshot, so end_date is more relevant, but we pass both for consistency.
    const endpoint = `reports/BalanceSheet?start_date=${startDate}&end_date=${endDate}&summarize_column_by=Month`;
    return qbApiRequest({ token: accessToken, realmId, endpoint });
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
