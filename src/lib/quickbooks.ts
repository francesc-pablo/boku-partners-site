'use server';

import axios from 'axios';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const QB_API_BASE_URL = 'https://sandbox-quickbooks.api.intuit.com/v3/company';
const QB_OAUTH_URL = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const response = await axios.post(
      QB_OAUTH_URL,
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
      {
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(
              `${process.env.QB_CLIENT_ID}:${process.env.QB_CLIENT_SECRET}`
            ).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, refresh_token: new_refresh_token } = response.data;
    
    const cookieStore = cookies();
    const cookieOptions = { secure: true, httpOnly: true, path: '/', sameSite: 'lax' as const };
    cookieStore.set('qb_access_token', access_token, cookieOptions);
    cookieStore.set('qb_refresh_token', new_refresh_token, cookieOptions);

    return access_token;
  } catch (error) {
    console.error('Failed to refresh access token:', error);
    
    const cookieStore = cookies();
    cookieStore.delete('qb_access_token');
    cookieStore.delete('qb_refresh_token');
    cookieStore.delete('qb_realm_id');

    return null;
  }
}

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
  let accessToken = cookieStore.get('qb_access_token')?.value;
  const refreshToken = cookieStore.get('qb_refresh_token')?.value;
  const realmId = cookieStore.get('qb_realm_id')?.value;

  if (!refreshToken || !realmId) {
    return { error: 'Not connected to QuickBooks.', status: 401 };
  }

  if (!accessToken) {
    accessToken = await refreshAccessToken(refreshToken);
    if (!accessToken) {
        return { error: 'Could not refresh QuickBooks token. Please reconnect.', status: 401 };
    }
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
      console.log('Access token expired, attempting to refresh...');
      const newAccessToken = await refreshAccessToken(refreshToken);
      if (newAccessToken) {
        try {
          const retryResponse = await makeRequest(newAccessToken);
          return { data: retryResponse.data };
        } catch (retryError: any) {
          console.error('QuickBooks API call failed after token refresh:', retryError.response?.data || retryError.message);
          return { error: 'QuickBooks API call failed after token refresh.', status: 500 };
        }
      } else {
        return { error: 'Could not refresh QuickBooks token. Please reconnect.', status: 401 };
      }
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

export async function getCustomers() {
    return makeQBRequest({ endpoint: 'query?query=select * from Customer' });
}
