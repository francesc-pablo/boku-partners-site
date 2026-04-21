'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import React from 'react';

const FirebaseClientProvider = dynamic(
  () => import('@/firebase/client-provider').then((mod) => mod.FirebaseClientProvider),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    ),
  }
);

export default function FirebaseClientProviderWrapper({ children }: { children: React.ReactNode }) {
    return <FirebaseClientProvider>{children}</FirebaseClientProvider>;
}
