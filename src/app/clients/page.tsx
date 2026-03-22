'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ClientDashboard } from './_components/client-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';

export default function ClientsPage() {
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined);
  const [redirectUri, setRedirectUri] = useState('');

  // This effect runs on the client to get cookie and dynamic host
  useEffect(() => {
    // Manually get cookie on client-side
    const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
    };
    setAccessToken(getCookie('qb_access_token'));

    // Dynamically determine the redirect URI
    if (typeof window !== 'undefined') {
      const host = window.location.host;
      const protocol = window.location.protocol;
      setRedirectUri(`${protocol}//${host}/api/auth/callback`);
    }
  }, []);

  return (
    <>
      <section className="bg-secondary">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-headline font-bold">Client Dashboard</h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            View your QuickBooks data at a glance.
          </p>
        </div>
      </section>

      <section className="container mx-auto">
        {accessToken ? (
          <ClientDashboard />
        ) : (
          <div className="flex flex-col items-center gap-8">
            <Card className="max-w-md mx-auto w-full">
                <CardHeader className="text-center">
                <CardTitle>Connect to QuickBooks</CardTitle>
                <CardDescription>
                    To view your dashboard, you need to connect your QuickBooks Online account first.
                </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                <Button asChild>
                    <Link href="/api/auth/connect">Connect to QuickBooks</Link>
                </Button>
                </CardContent>
            </Card>
            {redirectUri && (
                 <Card className="max-w-2xl mx-auto w-full bg-secondary">
                    <CardHeader>
                        <CardTitle className="text-xl">Setup Instructions for Developers</CardTitle>
                        <CardDescription>
                            To complete the connection, add the following URL to your Intuit Developer App's "Redirect URIs" list.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-background p-4 rounded-md">
                            <p className="font-mono text-sm break-all select-all">{redirectUri}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">
                           The URI above is dynamically generated for your current development environment. For your live site, you will need to add your production redirect URI to your Intuit app settings as well.
                        </p>
                    </CardContent>
                </Card>
            )}
          </div>
        )}
      </section>
    </>
  );
}
