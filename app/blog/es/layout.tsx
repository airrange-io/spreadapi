export default function BlogEsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: 'document.documentElement.lang="es"',
        }}
      />
      {children}
    </>
  );
}
