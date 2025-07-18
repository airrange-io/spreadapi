export const metadata = {
  title: 'SpreadAPI',
  description: 'Spreadsheet API Service',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}