export function BreadcrumbSchema({ 
  title, 
  slug, 
  locale = 'en' 
}: { 
  title: string; 
  slug: string; 
  locale?: string;
}) {
  const baseUrl = 'https://spreadapi.io';
  const blogUrl = locale === 'en' ? `${baseUrl}/blog` : `${baseUrl}/blog/${locale}`;
  const postUrl = locale === 'en' ? `${baseUrl}/blog/${slug}` : `${baseUrl}/blog/${locale}/${slug}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": blogUrl
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": title,
        "item": postUrl
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}