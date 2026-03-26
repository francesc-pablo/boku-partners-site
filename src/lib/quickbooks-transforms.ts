'use server';

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

const getValue = (rows: {name: string, value: string}[], name: string) => {
    const row = rows.find(r => r.name === name);
    const rawValue = row?.value?.replace(/,/g, '') || '0';
    if (rawValue.startsWith('(') && rawValue.endsWith(')')) {
        return -parseFloat(rawValue.replace(/[()]/g, ''));
    }
    return parseFloat(rawValue);
}


export async function parseQuickBooksData(data: any) {
    if (!data.pnl || !data.customers || !data.invoices) return null;

    const pnlRows = flattenReportRows(data.pnl.Rows?.Row);
    const balanceRows = flattenReportRows(data.balance?.Rows?.Row);
    const cashflowRows = flattenReportRows(data.cashflow?.Rows?.Row);

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
    const invoices = data.invoices?.QueryResponse?.Invoice || [];
    const totalOpenInvoices = invoices.reduce((acc: any, inv: any) => acc + inv.Balance, 0);

    // Bills
    const bills = data.bills?.QueryResponse?.Bill || [];
    const totalOpenBills = bills.reduce((acc: any, bill: any) => acc + bill.Balance, 0);

    // Monthly PNL Chart Data
    const monthlyData = (data.monthlyPnl || []).map((report: any) => {
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

    const customers = data.customers?.QueryResponse?.Customer || [];
    const vendors = data.vendors?.QueryResponse?.Vendor || [];

    return {
        kpis: {
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
            totalOpenBills,
            totalCustomers: customers.length,
        },
        reports: {
            pnlRows,
            balanceSheetRows,
            cashFlowRows,
        },
        charts: {
            pnlChartData: [{
                name: 'P&L',
                'Income': totalIncome,
                'Expenses': totalExpenses,
            }],
            assetBreakdown,
            monthlyData,
        },
        lists: {
            invoices,
            customers,
            vendors,
            bills,
        }
    };
}
