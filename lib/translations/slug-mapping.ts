// SEO-optimized URL slugs for each language
export const slugTranslations: Record<string, Record<string, string>> = {
  // Excel to API without uploads
  'excel-api-without-uploads-complete-guide': {
    en: 'excel-api-without-uploads-complete-guide',
    de: 'excel-geschaeftslogik-nicht-neu-programmieren',
    fr: 'excel-vers-api-sans-telechargements-guide-complet',
    es: 'excel-a-api-sin-cargas-guia-completa'
  },
  
  // MCP Protocol Guide
  'mcp-protocol-excel-developers-guide': {
    en: 'mcp-protocol-excel-developers-guide',
    de: 'mcp-protokoll-excel-entwickler-leitfaden',
    fr: 'protocole-mcp-guide-developpeurs-excel',
    es: 'protocolo-mcp-guia-desarrolladores-excel'
  },
  
  // ChatGPT Excel Integration
  'chatgpt-excel-integration-secure': {
    en: 'chatgpt-excel-integration-secure',
    de: 'chatgpt-excel-integration-sicher',
    fr: 'integration-chatgpt-excel-securisee',
    es: 'integracion-chatgpt-excel-segura'
  },
  
  // Excel API vs File Uploads
  'excel-api-vs-file-uploads': {
    en: 'excel-api-vs-file-uploads',
    de: 'excel-api-vs-datei-uploads',
    fr: 'api-excel-vs-telechargements-fichiers',
    es: 'api-excel-vs-carga-archivos'
  },
  
  // Building AI Agents
  'building-ai-agents-excel-tutorial': {
    en: 'building-ai-agents-excel-tutorial',
    de: 'ki-agenten-excel-tutorial-erstellen',
    fr: 'creer-agents-ia-excel-tutoriel',
    es: 'crear-agentes-ia-excel-tutorial'
  },
  
  // Excel Formulas vs JavaScript
  'excel-formulas-vs-javascript': {
    en: 'excel-formulas-vs-javascript',
    de: 'excel-formeln-vs-javascript',
    fr: 'formules-excel-vs-javascript',
    es: 'formulas-excel-vs-javascript'
  },
  
  // Excel API Response Times
  'excel-api-response-times-optimization': {
    en: 'excel-api-response-times-optimization',
    de: 'excel-api-antwortzeiten-optimierung',
    fr: 'optimisation-temps-reponse-api-excel',
    es: 'optimizacion-tiempos-respuesta-api-excel'
  },
  
  // Real Estate Mortgage Calculators
  'excel-apis-real-estate-mortgage-calculators': {
    en: 'excel-apis-real-estate-mortgage-calculators',
    de: 'excel-apis-immobilien-hypothekenrechner',
    fr: 'apis-excel-calculateurs-hypotheques-immobilier',
    es: 'apis-excel-calculadoras-hipotecas-inmobiliarias'
  },
  
  // SpreadAPI vs Google Sheets
  'spreadapi-vs-google-sheets-api': {
    en: 'spreadapi-vs-google-sheets-api',
    de: 'spreadapi-vs-google-sheets-api',
    fr: 'spreadapi-vs-api-google-sheets',
    es: 'spreadapi-vs-api-google-sheets'
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