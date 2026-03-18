import { cookies } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ClientDashboard } from './_components/client-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ClientsPage() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('qb_access_token');

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
          <Card className="max-w-md mx-auto">
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
        )}
      </section>
    </>
  );
}
