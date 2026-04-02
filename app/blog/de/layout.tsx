export default function BlogDeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: 'document.documentElement.lang="de"',
        }}
      />
      {children}
    </>
  );
}
