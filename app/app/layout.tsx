import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - SpreadAPI',
  description: 'Manage your Excel APIs and services',
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}