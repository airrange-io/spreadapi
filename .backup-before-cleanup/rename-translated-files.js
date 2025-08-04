const fs = require('fs');
const path = require('path');

// Import the slug mappings
const slugMappings = {
  'ai-excel-accuracy-no-hallucinations': {
    de: 'ki-excel-genauigkeit-keine-halluzinationen',
    fr: 'ia-excel-precision-sans-hallucinations',
    es: 'ia-excel-precision-sin-alucinaciones'
  },
  'building-ai-agents-excel-tutorial': {
    de: 'ki-agenten-excel-tutorial-erstellen',
    fr: 'creer-agents-ia-excel-tutoriel',
    es: 'crear-agentes-ia-excel-tutorial'
  },
  'claude-desktop-excel-integration-complete-guide': {
    de: 'claude-desktop-excel-integration-vollstaendige-anleitung',
    fr: 'claude-desktop-excel-integration-guide-complet',
    es: 'claude-desktop-excel-integracion-guia-completa'
  },
  'excel-api-performance-comparison': {
    de: 'excel-api-leistungsvergleich',
    fr: 'comparaison-performance-api-excel',
    es: 'comparacion-rendimiento-api-excel'
  },
  'excel-api-real-estate-mortgage-calculators': {
    de: 'excel-api-immobilien-hypothekenrechner',
    fr: 'api-excel-calculateurs-hypotheques-immobilier',
    es: 'api-excel-calculadoras-hipotecas-inmobiliarias'
  },
  'excel-api-without-uploads-complete-guide': {
    de: 'excel-api-ohne-uploads-vollstaendige-anleitung',
    fr: 'api-excel-sans-telechargements-guide-complet',
    es: 'api-excel-sin-cargas-guia-completa'
  },
  'excel-formulas-vs-javascript': {
    de: 'excel-formeln-vs-javascript',
    fr: 'formules-excel-vs-javascript',
    es: 'formulas-excel-vs-javascript'
  },
  'excel-goal-seek-api-ai-agents': {
    de: 'excel-zielwertsuche-api-ki-agenten',
    fr: 'api-valeur-cible-excel-agents-ia',
    es: 'api-buscar-objetivo-excel-agentes-ia'
  },
  'spreadapi-vs-google-sheets-api-comparison': {
    de: 'spreadapi-vs-google-sheets-api-vergleich',
    fr: 'spreadapi-vs-api-google-sheets-comparaison',
    es: 'spreadapi-vs-api-google-sheets-comparacion'
  },
  'spreadsheet-api-developers-need': {
    de: 'tabellenkalkulation-api-entwickler-benoetigen',
    fr: 'api-tableur-besoins-developpeurs',
    es: 'api-hojas-calculo-necesitan-desarrolladores'
  }
};

const contentDir = path.join(__dirname, '..', 'content', 'blog');
let renamedCount = 0;

// Process each language
['de', 'es', 'fr'].forEach(lang => {
  const langDir = path.join(contentDir, lang);
  
  // Get all JSON files in the language directory
  const files = fs.readdirSync(langDir).filter(f => f.endsWith('.json'));
  
  files.forEach(file => {
    const englishSlug = file.replace('.json', '');
    
    // Check if we have a translation for this slug
    if (slugMappings[englishSlug] && slugMappings[englishSlug][lang]) {
      const newSlug = slugMappings[englishSlug][lang];
      const oldPath = path.join(langDir, file);
      const newPath = path.join(langDir, newSlug + '.json');
      
      // Only rename if the file hasn't been renamed already
      if (oldPath !== newPath && !fs.existsSync(newPath)) {
        fs.renameSync(oldPath, newPath);
        console.log(`Renamed: ${lang}/${file} → ${lang}/${newSlug}.json`);
        renamedCount++;
      }
    }
  });
});

console.log(`\n✅ Renamed ${renamedCount} files to use localized slugs`);