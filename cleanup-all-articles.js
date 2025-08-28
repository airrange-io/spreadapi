#!/usr/bin/env node

/**
 * Blog Article Cleanup Script
 * Removes fake testimonials, fixes API examples, and shortens content
 */

const fs = require('fs').promises;
const path = require('path');

// Common fake elements to remove
const FAKE_TESTIMONIALS = [
  'Sarah Chen',
  'Marcus Rodriguez', 
  'Jennifer Park',
  'FinanceBot',
  'ConsultingCo',
  'TechCorp'
];

const FAKE_CASE_STUDIES = [
  '$2.3M pricing error',
  '2,3 Millionen',
  '2,3 millions',
  '2,3 millones',
  '150+ clients',
  '150 Kunden',
  '$50,000 spreadsheet',
  '50.000 $'
];

// Replacements needed
const REPLACEMENTS = {
  // Fix API patterns
  'new SpreadAPIService': 'await fetch',
  'spreadapi.execute': 'fetch(...).then(r => r.json())',
  'spreadAPI.calculate': 'fetch(...).then(r => r.json())',
  
  // Fix accuracy claims
  '100% accurate': 'matches Excel exactly',
  '100% genau': 'entspricht Excel exakt',
  '100% preciso': 'coincide con Excel exactamente',
  '100% précis': 'correspond exactement à Excel',
  
  // Remove hyperbole
  'revolutionary': 'modern',
  'game-changer': 'improvement',
  'revolutionär': 'modern',
  'révolutionnaire': 'moderne',
  
  // Fix claims
  'zero maintenance': 'minimal maintenance',
  'Zero maintenance': 'Minimal maintenance',
  'kein Wartungsaufwand': 'minimaler Wartungsaufwand',
  'cero mantenimiento': 'mantenimiento mínimo',
  'zéro maintenance': 'maintenance minimale'
};

async function cleanArticle(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const article = JSON.parse(content);
    
    // Clean the main content
    let cleanedContent = article.content;
    
    // Remove fake testimonials sections
    FAKE_TESTIMONIALS.forEach(name => {
      const testimonialPattern = new RegExp(`[^]*?["'].*?${name}.*?["'][^]*?—[^\\n]*\\n`, 'g');
      cleanedContent = cleanedContent.replace(testimonialPattern, '');
    });
    
    // Remove fake case studies
    FAKE_CASE_STUDIES.forEach(caseStudy => {
      const casePattern = new RegExp(`###[^#]*?${caseStudy.replace('$', '\\$')}[^#]*?(?=##|$)`, 'g');
      cleanedContent = cleanedContent.replace(casePattern, '');
    });
    
    // Remove P.S. notes
    cleanedContent = cleanedContent.replace(/\n\*P\.S\.[^*]*\*/g, '');
    
    // Apply replacements
    Object.entries(REPLACEMENTS).forEach(([old, replacement]) => {
      const regex = new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      cleanedContent = cleanedContent.replace(regex, replacement);
    });
    
    // Fix API examples to use correct endpoint
    cleanedContent = cleanedContent.replace(
      /new SpreadAPIService\([^)]+\)/g,
      "fetch('https://spreadapi.io/api/v1/services/SERVICE_ID/execute', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ inputs: params }) })"
    );
    
    // Remove emojis from professional content
    cleanedContent = cleanedContent.replace(/😫|😊|🤞|✅|❌|🔴|🟡|🟠|🟢/g, '');
    
    // Update the article
    article.content = cleanedContent;
    
    // Also clean excerpt and seoDescription
    if (article.excerpt) {
      article.excerpt = article.excerpt.replace(/100% accurate/g, 'accurate');
    }
    if (article.seoDescription) {
      article.seoDescription = article.seoDescription.replace(/100% accurate/g, 'accurate');
    }
    
    // Write back
    await fs.writeFile(filePath, JSON.stringify(article, null, 2));
    console.log(`✓ Cleaned: ${path.basename(filePath)}`);
    
  } catch (error) {
    console.error(`✗ Error cleaning ${filePath}:`, error.message);
  }
}

async function cleanAllArticles() {
  const blogDir = path.join(__dirname, 'content', 'blog');
  const languages = ['en', 'de', 'es', 'fr'];
  
  for (const lang of languages) {
    const langDir = path.join(blogDir, lang);
    console.log(`\nCleaning ${lang.toUpperCase()} articles...`);
    
    try {
      const files = await fs.readdir(langDir);
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      
      for (const file of jsonFiles) {
        await cleanArticle(path.join(langDir, file));
      }
    } catch (error) {
      console.error(`Error reading ${lang} directory:`, error.message);
    }
  }
}

// Run the cleanup
cleanAllArticles().then(() => {
  console.log('\n✅ Cleanup complete!');
}).catch(error => {
  console.error('Cleanup failed:', error);
  process.exit(1);
});