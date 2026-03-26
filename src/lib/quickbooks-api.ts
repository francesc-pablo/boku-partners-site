'use server';

import axios from 'axios';

const QB_BASE_URL = 'https://quickbooks.api.intuit.com';

export async function qbApiRequest({
  token,
  realmId,
  endpoint,
  method = 'GET',
  body = null
}: {
  token: string;
  realmId: string;
  endpoint: string;
  method?: 'GET' | 'POST';
  body?: any;
}) {
  const url = `${QB_BASE_URL}/v3/company/${realmId}/${endpoint}${endpoint.includes('?') ? '&' : '?'}minorversion=65`;

  try {
    const response = await axios({
      method,
      url,
      data: body,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        ...(method === 'POST' && { 'Content-Type': 'application/json' }),
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('QuickBooks API Request Error:', JSON.stringify(error.response.data, null, 2));
      // Re-throw a more specific error to be handled by the caller
      throw new Error(`QuickBooks API Error: ${error.response.status} ${JSON.stringify(error.response.data)}`);
    }
    // Re-throw generic errors
    throw error;
  }
}
