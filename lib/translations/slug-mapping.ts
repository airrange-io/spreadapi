// SEO-optimized URL slugs for each language
export const slugTranslations: Record<string, Record<string, string>> = {
  // AI Excel Accuracy
  'ai-excel-accuracy-no-hallucinations': {
    en: 'ai-excel-accuracy-no-hallucinations',
    de: 'ki-excel-genauigkeit-keine-halluzinationen',
    fr: 'ia-excel-precision-sans-hallucinations',
    es: 'ia-excel-precision-sin-alucinaciones'
  },

  // Building AI Agents
  'building-ai-agents-excel-tutorial': {
    en: 'building-ai-agents-excel-tutorial',
    de: 'ki-agenten-excel-tutorial-erstellen',
    fr: 'creer-agents-ia-excel-tutoriel',
    es: 'crear-agentes-ia-excel-tutorial'
  },

  // ChatGPT Excel Integration
  'chatgpt-excel-integration-secure': {
    en: 'chatgpt-excel-integration-secure',
    de: 'chatgpt-excel-integration-sicher',
    fr: 'chatgpt-excel-integration-securisee',
    es: 'chatgpt-excel-integracion-segura'
  },

  // Claude Desktop Excel Integration
  'claude-desktop-excel-integration-complete-guide': {
    en: 'claude-desktop-excel-integration-complete-guide',
    de: 'claude-desktop-excel-integration-vollstaendige-anleitung',
    fr: 'claude-desktop-excel-integration-guide-complet',
    es: 'claude-desktop-excel-integracion-guia-completa'
  },

  // Excel API Performance Comparison
  'excel-api-performance-comparison': {
    en: 'excel-api-performance-comparison',
    de: 'excel-api-leistungsvergleich',
    fr: 'comparaison-performance-api-excel',
    es: 'comparacion-rendimiento-api-excel'
  },

  // Real Estate Mortgage Calculators
  'excel-api-real-estate-mortgage-calculators': {
    en: 'excel-api-real-estate-mortgage-calculators',
    de: 'excel-api-immobilien-hypothekenrechner',
    fr: 'api-excel-calculateurs-hypotheques-immobilier',
    es: 'api-excel-calculadoras-hipotecas-inmobiliarias'
  },

  // Excel API Response Times
  'excel-api-response-times-optimization': {
    en: 'excel-api-response-times-optimization',
    de: 'excel-api-antwortzeiten-optimierung',
    fr: 'optimisation-temps-reponse-api-excel',
    es: 'optimizacion-tiempos-respuesta-api-excel'
  },

  // Excel API Without Uploads
  'excel-api-without-uploads-complete-guide': {
    en: 'excel-api-without-uploads-complete-guide',
    de: 'excel-api-ohne-uploads-vollstaendige-anleitung',
    fr: 'api-excel-sans-telechargements-guide-complet',
    es: 'api-excel-sin-cargas-guia-completa'
  },

  // Excel Formulas vs JavaScript
  'excel-formulas-vs-javascript': {
    en: 'excel-formulas-vs-javascript',
    de: 'excel-formeln-vs-javascript',
    fr: 'formules-excel-vs-javascript',
    es: 'formulas-excel-vs-javascript'
  },

  // Excel Goal Seek API
  'excel-goal-seek-api-ai-agents': {
    en: 'excel-goal-seek-api-ai-agents',
    de: 'excel-zielwertsuche-api-ki-agenten',
    fr: 'api-valeur-cible-excel-agents-ia',
    es: 'api-buscar-objetivo-excel-agentes-ia'
  },

  // MCP Protocol Guide
  'mcp-protocol-excel-developers-guide': {
    en: 'mcp-protocol-excel-developers-guide',
    de: 'mcp-protokoll-excel-entwickler-leitfaden',
    fr: 'protocole-mcp-guide-developpeurs-excel',
    es: 'protocolo-mcp-guia-desarrolladores-excel'
  },

  // SpreadAPI vs Google Sheets
  'spreadapi-vs-google-sheets-api-comparison': {
    en: 'spreadapi-vs-google-sheets-api-comparison',
    de: 'spreadapi-vs-google-sheets-api-vergleich',
    fr: 'spreadapi-vs-api-google-sheets-comparaison',
    es: 'spreadapi-vs-api-google-sheets-comparacion'
  },

  // Spreadsheet API Developers Need
  'spreadsheet-api-developers-need': {
    en: 'spreadsheet-api-developers-need',
    de: 'tabellenkalkulation-api-entwickler-benoetigen',
    fr: 'api-tableur-besoins-developpeurs',
    es: 'api-hojas-calculo-necesitan-desarrolladores'
  },

  // On-Premises Excel API Data Sovereignty
  'on-premises-excel-api-data-sovereignty': {
    en: 'on-premises-excel-api-data-sovereignty',
    de: 'on-premises-excel-api-datensouveraenitaet',
    fr: 'api-excel-on-premises-souverainete-donnees',
    es: 'api-excel-on-premises-soberania-datos'
  }
};

// Reverse lookup: get original slug from translated slug
export function getOriginalSlug(translatedSlug: string, locale: string): string | null {
  for (const [originalSlug, translations] of Object.entries(slugTranslations)) {
    if (translations[locale] === translatedSlug) {
      return originalSlug;
    }
  }
  return null;
}

// Get all translated versions of a slug
export function getSlugTranslations(slug: string): Record<string, string> {
  return slugTranslations[slug] || { en: slug };
}

// Check if a translation exists for a slug in a specific locale
export function hasTranslation(slug: string, locale: string): boolean {
  return slugTranslations[slug]?.[locale] !== undefined;
}

// Get available locales for a slug
export function getAvailableLocales(slug: string): string[] {
  const translations = slugTranslations[slug];
  return translations ? Object.keys(translations) : ['en'];
}