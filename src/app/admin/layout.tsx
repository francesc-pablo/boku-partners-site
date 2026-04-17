import { AuthedLayout } from '@/components/layout/authed-layout';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthedLayout>{children}</AuthedLayout>;
}
