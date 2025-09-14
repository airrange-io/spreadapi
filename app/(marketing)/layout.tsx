import { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://spreadapi.io'),
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}