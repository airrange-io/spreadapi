import { getSortedPostsData } from '@/lib/blog';

export async function GET() {
  const posts = getSortedPostsData();
  const siteUrl = 'https://spreadapi.com';

  const feed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>SpreadAPI Blog - Excel API Integration Insights</title>
    <link>${siteUrl}/blog</link>
    <description>Excel meets AI: Technical insights, tutorials, and best practices for building intelligent spreadsheet applications with SpreadAPI.</description>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/blog/rss.xml" rel="self" type="application/rss+xml" />
    <generator>SpreadAPI</generator>
    <webMaster>team@airrange.io (SpreadAPI Team)</webMaster>
    <copyright>© ${new Date().getFullYear()} Airrange.io. All rights reserved.</copyright>
    <category>Technology</category>
    <category>Software Development</category>
    <category>APIs</category>
    
    ${posts.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${post.slug}</guid>
      <description><![CDATA[${post.excerpt}]]></description>
      <content:encoded><![CDATA[${post.content}]]></content:encoded>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <author>team@airrange.io (${post.author})</author>
      ${post.tags.map(tag => `<category>${tag}</category>`).join('\n      ')}
    </item>`).join('')}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}