const fs = require('fs');
const path = require('path');

// Define link relationships between articles
const linkRelationships = {
  'claude-desktop-excel-integration-complete-guide': [
    {
      targetSlug: 'mcp-protocol-excel-developers-guide',
      anchorText: 'learn more about the MCP protocol',
      context: 'MCP (Model Context Protocol)'
    },
    {
      targetSlug: 'chatgpt-excel-integration-secure',
      anchorText: 'ChatGPT integration approach',
      context: 'ChatGPT Actions'
    },
    {
      targetSlug: 'excel-api-without-uploads-complete-guide',
      anchorText: 'Excel API without file uploads',
      context: 'Traditional AI-spreadsheet integrations'
    }
  ],
  'mcp-protocol-excel-developers-guide': [
    {
      targetSlug: 'claude-desktop-excel-integration-complete-guide',
      anchorText: 'Claude Desktop integration guide',
      context: 'practical implementation'
    },
    {
      targetSlug: 'building-ai-agents-excel-tutorial',
      anchorText: 'build AI agents with Excel',
      context: 'AI agents'
    }
  ],
  'chatgpt-excel-integration-secure': [
    {
      targetSlug: 'claude-desktop-excel-integration-complete-guide',
      anchorText: 'Claude Desktop alternative',
      context: 'alternative approaches'
    },
    {
      targetSlug: 'excel-api-without-uploads-complete-guide',
      anchorText: 'secure Excel API approach',
      context: 'without uploading files'
    }
  ],
  'excel-api-without-uploads-complete-guide': [
    {
      targetSlug: 'excel-api-response-times-optimization',
      anchorText: 'optimize API response times',
      context: 'performance'
    },
    {
      targetSlug: 'spreadapi-vs-google-sheets-api-comparison',
      anchorText: 'comparison with Google Sheets API',
      context: 'Google Sheets'
    }
  ],
  'building-ai-agents-excel-tutorial': [
    {
      targetSlug: 'mcp-protocol-excel-developers-guide',
      anchorText: 'MCP protocol for developers',
      context: 'Model Context Protocol'
    },
    {
      targetSlug: 'excel-goal-seek-api-ai-agents',
      anchorText: 'Goal Seek functionality',
      context: 'advanced Excel features'
    },
    {
      targetSlug: 'ai-excel-accuracy-no-hallucinations',
      anchorText: 'preventing AI hallucinations',
      context: 'accuracy'
    }
  ],
  'excel-formulas-vs-javascript': [
    {
      targetSlug: 'excel-api-performance-comparison',
      anchorText: 'performance comparison',
      context: 'performance implications'
    },
    {
      targetSlug: 'spreadsheet-api-developers-need',
      anchorText: 'why developers need spreadsheet APIs',
      context: 'spreadsheet APIs'
    }
  ],
  'excel-api-response-times-optimization': [
    {
      targetSlug: 'excel-api-performance-comparison',
      anchorText: 'detailed performance analysis',
      context: 'performance metrics'
    },
    {
      targetSlug: 'excel-api-without-uploads-complete-guide',
      anchorText: 'API architecture without uploads',
      context: 'architecture'
    }
  ],
  'spreadapi-vs-google-sheets-api-comparison': [
    {
      targetSlug: 'excel-api-without-uploads-complete-guide',
      anchorText: 'Excel API capabilities',
      context: 'Excel-specific features'
    },
    {
      targetSlug: 'spreadsheet-api-developers-need',
      anchorText: 'choosing the right spreadsheet API',
      context: 'API selection'
    }
  ],
  'excel-goal-seek-api-ai-agents': [
    {
      targetSlug: 'building-ai-agents-excel-tutorial',
      anchorText: 'complete AI agents tutorial',
      context: 'building AI agents'
    },
    {
      targetSlug: 'ai-excel-accuracy-no-hallucinations',
      anchorText: 'ensuring calculation accuracy',
      context: 'accuracy'
    }
  ],
  'ai-excel-accuracy-no-hallucinations': [
    {
      targetSlug: 'building-ai-agents-excel-tutorial',
      anchorText: 'build reliable AI agents',
      context: 'AI agents'
    },
    {
      targetSlug: 'excel-goal-seek-api-ai-agents',
      anchorText: 'Goal Seek for precise calculations',
      context: 'precise calculations'
    }
  ],
  'excel-api-real-estate-mortgage-calculators': [
    {
      targetSlug: 'claude-desktop-excel-integration-complete-guide',
      anchorText: 'integrate with Claude Desktop',
      context: 'AI assistance'
    },
    {
      targetSlug: 'excel-api-without-uploads-complete-guide',
      anchorText: 'secure API implementation',
      context: 'security'
    }
  ]
};

// Helper function to add a link to content
function addLinkToContent(content, link, baseUrl = '') {
  const { targetSlug, anchorText, context } = link;
  const url = `/blog/${targetSlug}`;
  const markdownLink = `[${anchorText}](${url})`;
  
  // Find the context in the content and add the link
  // Look for the context phrase and add the link nearby
  const contextIndex = content.indexOf(context);
  if (contextIndex !== -1) {
    // Find a good spot to insert the link after the context
    let insertIndex = contextIndex + context.length;
    
    // Look for the next sentence or paragraph break
    const nextPeriod = content.indexOf('.', insertIndex);
    const nextNewline = content.indexOf('\n', insertIndex);
    
    if (nextPeriod !== -1 && (nextNewline === -1 || nextPeriod < nextNewline)) {
      insertIndex = nextPeriod;
    }
    
    // Check if a link already exists nearby
    const nearbyContent = content.substring(contextIndex - 100, insertIndex + 100);
    if (!nearbyContent.includes(`](${url})`) && !nearbyContent.includes(markdownLink)) {
      // Insert the link
      const before = content.substring(0, insertIndex);
      const after = content.substring(insertIndex);
      
      // Add the link in a natural way
      if (after.startsWith('.')) {
        return before + `. For more details, ${markdownLink}` + after;
      } else if (after.startsWith('\n')) {
        return before + ` - ${markdownLink}` + after;
      } else {
        return before + ` (${markdownLink})` + after;
      }
    }
  }
  
  return content;
}

// Process all English articles
const blogDir = path.join(__dirname, '..', 'content', 'blog', 'en');
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.json'));

let updatedCount = 0;

files.forEach(file => {
  const filePath = path.join(blogDir, file);
  const slug = file.replace('.json', '');
  
  // Skip if no links defined for this article
  if (!linkRelationships[slug]) {
    return;
  }
  
  // Read the article
  const article = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let content = article.content;
  let modified = false;
  
  // Add each link
  linkRelationships[slug].forEach(link => {
    const newContent = addLinkToContent(content, link);
    if (newContent !== content) {
      content = newContent;
      modified = true;
      console.log(`Added link to ${link.targetSlug} in ${slug}`);
    }
  });
  
  // Save if modified
  if (modified) {
    article.content = content;
    fs.writeFileSync(filePath, JSON.stringify(article, null, 2));
    updatedCount++;
  }
});

console.log(`\nUpdated ${updatedCount} articles with internal links`);

// Also add a "Related Articles" section to each article if not present
files.forEach(file => {
  const filePath = path.join(blogDir, file);
  const article = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  // Check if article already has a related articles section
  if (!article.content.includes('## Related Articles') && !article.content.includes('## Related Reading')) {
    // Add related articles section at the end
    const relatedSection = '\n\n## Related Articles\n\nExplore more Excel API and AI integration guides:\n\n';
    
    // Find related articles based on tags
    const relatedLinks = [];
    const currentTags = article.tags || [];
    
    files.forEach(otherFile => {
      if (otherFile === file) return;
      
      const otherArticle = JSON.parse(fs.readFileSync(path.join(blogDir, otherFile), 'utf8'));
      const otherTags = otherArticle.tags || [];
      
      // Check for common tags
      const commonTags = currentTags.filter(tag => otherTags.includes(tag));
      if (commonTags.length > 0) {
        const otherSlug = otherFile.replace('.json', '');
        relatedLinks.push(`- [${otherArticle.title}](/blog/${otherSlug})`);
      }
    });
    
    // Add top 3 related articles
    if (relatedLinks.length > 0) {
      article.content += relatedSection + relatedLinks.slice(0, 3).join('\n');
      fs.writeFileSync(filePath, JSON.stringify(article, null, 2));
      console.log(`Added related articles section to ${file}`);
    }
  }
});

console.log('\nInternal linking complete!');