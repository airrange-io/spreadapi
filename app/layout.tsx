import type { Metadata, Viewport } from "next";
import { ConfigProvider, App } from 'antd';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import '@ant-design/v5-patch-for-react-19';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
import { AuthProvider } from '@/components/auth/AuthContext';
import { Reb2bScript } from './components/Reb2bScript';
import "./globals.css";
import "./mobile-performance.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'),
  title: "SpreadAPI | Spreadsheet calculations as a service",
  description: "High-performance spreadsheet API service",
  applicationName: "SpreadAPI",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SpreadAPI",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-title": "SpreadAPI",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  openGraph: {
    title: "SpreadAPI",
    description: "High-performance spreadsheet API service",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "SpreadAPI",
    description: "High-performance spreadsheet API service",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#502D80',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Reb2bScript />
        <ErrorBoundary>
          <AntdRegistry>
            <ConfigProvider
              theme={{
                token: {
                  colorPrimary: '#502D80',
                  colorBgContainer: '#ffffff',
                  colorText: '#000000',
                  colorTextSecondary: '#666666',
                  borderRadius: 8,
                },
              }}
            >
              <App>
                <AuthProvider>
                  {children}
                </AuthProvider>
                <SpeedInsights />
                <Analytics />
              </App>
            </ConfigProvider>
          </AntdRegistry>
        </ErrorBoundary>
      </body>
    </html>
  );
}