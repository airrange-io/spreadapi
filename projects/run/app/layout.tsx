export const metadata = {
  title: 'spreadapi.run',
  description: 'High-performance API endpoint for SpreadAPI services',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
