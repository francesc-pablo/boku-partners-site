import { cookies, headers } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ClientDashboard } from './_components/client-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ClientsPage() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('qb_access_token');

  // Dynamically determine the redirect URI
  const headersList = headers();
  const host = headersList.get('host');
  // Use 'https' in production/studio, 'http' for localhost
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  const redirectUri = `${protocol}://${host}/api/auth/callback`;


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
                        This URL is specific to your current development environment. You will also need to add your production URL (`https://www.bokupartners.com/api/auth/callback`) and any localhost URLs (`http://localhost:9002/api/auth/callback`) to your Intuit settings.
                    </p>
                </CardContent>
            </Card>
          </div>
        )}
      </section>
    </>
  );
}
