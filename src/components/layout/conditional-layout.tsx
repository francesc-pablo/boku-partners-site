'use client';

import { usePathname } from 'next/navigation';
import { AuthedLayout } from '@/components/layout/authed-layout';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import React from 'react';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthedRoute = pathname.startsWith('/clients') || pathname.startsWith('/admin');

  if (isAuthedRoute) {
    return <AuthedLayout>{children}</AuthedLayout>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
