import { NextResponse } from 'next/server';

export async function GET() {
  const authUrl = `https://appcenter.intuit.com/connect/oauth2?client_id=${process.env.QB_CLIENT_ID}&redirect_uri=${process.env.QB_REDIRECT_URI}&response_type=code&scope=com.intuit.quickbooks.accounting&state=123`;
  return NextResponse.redirect(authUrl);
}
