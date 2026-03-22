'use server';

import axios from 'axios';
import { cookies } from 'next/headers';

const QB_API_BASE_URL = 'https://sandbox-quickbooks.api.intuit.com/v3/company';

async function makeQBRequest({
  endpoint,
  method = 'GET',
  body = null,
}: {
  endpoint: string;
  method?: 'GET' | 'POST';
  body?: any;
}) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('qb_access_token')?.value;
  const realmId = cookieStore.get('qb_realm_id')?.value;

  if (!accessToken || !realmId) {
    return { error: 'Not connected to QuickBooks. Please connect.', status: 401 };
  }
  
  const url = `${QB_API_BASE_URL}/${realmId}/${endpoint}${endpoint.includes('?') ? '&' : '?'}minorversion=65`;

  const makeRequest = (token: string) => {
    return axios({
        method,
        url,
        data: body,
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            ...(method === 'POST' && { 'Content-Type': 'application/json' }),
        },
    });
  };

  try {
    const response = await makeRequest(accessToken);
    return { data: response.data };
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      console.log('QuickBooks Access token expired. Please reconnect.');
      // Token is expired, clear cookies to force re-authentication
      cookieStore.delete('qb_access_token');
      cookieStore.delete('qb_realm_id');
      return { error: 'Your QuickBooks session has expired. Please connect again.', status: 401 };
    }
    console.error('QuickBooks API call failed:', error.response?.data || error.message);
    return { error: 'An unexpected error occurred with the QuickBooks API.', status: 500 };
  }
}

// Report functions
export async function getProfitAndLoss() {
  return makeQBRequest({ endpoint: 'reports/ProfitAndLoss' });
}

export async function getBalanceSheet() {
  return makeQBRequest({ endpoint: 'reports/BalanceSheet' });
}

export async function getCashFlow() {
  return makeQBRequest({ endpoint: 'reports/CashFlow' });
}

// Entity functions
export async function getCustomers() {
    return makeQBRequest({ endpoint: 'query?query=select * from Customer' });
}

export async function getInvoices() {
    return makeQBRequest({ endpoint: 'query?query=select * from Invoice' });
}
