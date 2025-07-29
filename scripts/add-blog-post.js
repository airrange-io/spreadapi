#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createBlogPost() {
  console.log('🚀 SpreadAPI Blog Post Creator\n');

  const title = await question('Post title: ');
  const slug = title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  const category = await question('Category (Technical Guide/AI Integration/Tutorial/Performance): ');
  const tags = await question('Tags (comma-separated): ');
  const excerpt = await question('Excerpt (1-2 sentences): ');
  const seoTitle = await question('SEO Title (optional, press enter to use title): ') || title;
  const seoDescription = await question('SEO Description (optional, press enter to use excerpt): ') || excerpt;

  console.log('\nPaste your content (Markdown format). Type "DONE" on a new line when finished:\n');

  let content = '';
  let line;
  while ((line = await question('')) !== 'DONE') {
    content += line + '\n';
  }

  const date = new Date().toISOString().split('T')[0];
  const wordCount = content.split(/\s+/g).length;
  const readingTime = Math.ceil(wordCount / 200);

  const blogPost = {
    title,
    date,
    author: 'SpreadAPI Team',
    category,
    tags: tags.split(',').map(tag => tag.trim()),
    seoTitle,
    seoDescription,
    excerpt,
    content: content.trim()
  };

  const filename = `${slug}.json`;
  const filepath = path.join(__dirname, '..', 'content', 'blog', filename);

  fs.writeFileSync(filepath, JSON.stringify(blogPost, null, 2));

  console.log(`\n✅ Blog post created: ${filepath}`);
  console.log(`📊 Stats: ${wordCount} words, ~${readingTime} min read`);
  console.log(`🔗 URL will be: /blog/${slug}`);

  rl.close();
}

createBlogPost().catch(console.error);