import { AuthedLayout } from '@/components/layout/authed-layout';

export default function ClientsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthedLayout>{children}</AuthedLayout>;
}
