import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { origin } = new URL(req.url);
  const redirectUri = `${origin}/api/auth/callback`;

  // The console log is no longer needed as the URI is displayed on the page.

  const authUrl = `https://appcenter.intuit.com/connect/oauth2?client_id=${process.env.QB_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=com.intuit.quickbooks.accounting&state=123`;
  return NextResponse.redirect(authUrl);
}
