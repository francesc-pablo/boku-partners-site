import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { ConditionalLayout } from '@/components/layout/conditional-layout';
import FirebaseClientProviderWrapper from './firebase-client-provider-wrapper';

export const metadata: Metadata = {
  title: 'Boku Partners',
  description: 'Boku works alongside small and growing businesses to bring structure and clarity to finance, HR, and marketing operations.',
  icons: 'https://res.cloudinary.com/ddvlexmvj/image/upload/v1772409622/image1_u91apv.png',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('min-h-screen bg-background font-body antialiased')} suppressHydrationWarning>
        <FirebaseClientProviderWrapper>
          <ConditionalLayout>{children}</ConditionalLayout>
          <Toaster />
        </FirebaseClientProviderWrapper>
      </body>
    </html>
  );
}
