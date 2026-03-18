'use server';

import axios from 'axios';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const QB_API_BASE_URL = 'https://sandbox-quickbooks.api.intuit.com/v3/company';
const QB_OAUTH_URL = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';

async function refreshAccessToken(refreshToken: string) {
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
    
    // Clear invalid tokens
    const cookieStore = cookies();
    cookieStore.delete('qb_access_token');
    cookieStore.delete('qb_refresh_token');
    cookieStore.delete('qb_realm_id');

    return null;
  }
}

export async function makeApiCall(endpoint: string, query: string) {
    const cookieStore = cookies();
    let accessToken = cookieStore.get('qb_access_token')?.value;
    const refreshToken = cookieStore.get('qb_refresh_token')?.value;
    const realmId = cookieStore.get('qb_realm_id')?.value;

    if (!accessToken || !refreshToken || !realmId) {
        return NextResponse.json({ error: 'Not connected to QuickBooks.' }, { status: 401 });
    }

    const makeRequest = (token: string) => {
        return axios.get(
            `${QB_API_BASE_URL}/${realmId}/${endpoint}?query=${encodeURIComponent(query)}&minorversion=65`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            }
        );
    };

    try {
        const response = await makeRequest(accessToken);
        return NextResponse.json(response.data);
    } catch (error: any) {
        if (error.response && error.response.status === 401) {
            const newAccessToken = await refreshAccessToken(refreshToken);
            if (newAccessToken) {
                try {
                    const retryResponse = await makeRequest(newAccessToken);
                    return NextResponse.json(retryResponse.data);
                } catch (retryError: any) {
                    console.error('QuickBooks API call failed after token refresh:', retryError.response?.data || retryError.message);
                    return NextResponse.json({ error: 'QuickBooks API call failed after token refresh.' }, { status: 500 });
                }
            } else {
                return NextResponse.json({ error: 'Could not refresh QuickBooks token. Please reconnect.' }, { status: 401 });
            }
        }
        console.error('QuickBooks API call failed:', error.response?.data || error.message);
        return NextResponse.json({ error: 'An unexpected error occurred with the QuickBooks API.' }, { status: 500 });
    }
}
