import { getSortedPostsData } from '@/lib/blog';

export async function GET() {
  const posts = getSortedPostsData('en');
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spreadapi.io';

  const feedXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>SpreadAPI Blog - Excel API Insights</title>
    <description>Learn how to integrate Excel with AI, optimize API performance, and build powerful spreadsheet-based applications.</description>
    <link>${siteUrl}/blog</link>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/blog/feed.xml" rel="self" type="application/rss+xml"/>
    <generator>SpreadAPI</generator>
    <image>
      <url>${siteUrl}/logo.png</url>
      <title>SpreadAPI Blog</title>
      <link>${siteUrl}/blog</link>
    </image>
    ${posts.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.excerpt}]]></description>
      <link>${siteUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${post.slug}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <author>info@airrange.io (${post.author})</author>
      ${post.tags.map(tag => `<category>${tag}</category>`).join('\n      ')}
      <content:encoded><![CDATA[${post.excerpt}]]></content:encoded>
    </item>`).join('')}
  </channel>
</rss>`;

  return new Response(feedXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=7200',
    },
  });
}