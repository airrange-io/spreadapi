export default function BlogFrLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: 'document.documentElement.lang="fr"',
        }}
      />
      {children}
    </>
  );
}
