// SEO keywords and phrases for each language
export const seoKeywords = {
  en: {
    primary: [
      'excel api',
      'spreadsheet api',
      'excel to api',
      'excel rest api',
      'spreadsheet web service'
    ],
    secondary: [
      'excel calculation api',
      'excel formulas api',
      'spreadsheet automation',
      'excel integration',
      'excel web service'
    ],
    longtail: [
      'convert excel to rest api',
      'excel spreadsheet api service',
      'excel calculation engine api',
      'use excel formulas in api',
      'excel business logic api'
    ],
    ai: [
      'chatgpt excel integration',
      'claude mcp excel',
      'ai spreadsheet api',
      'llm excel calculations',
      'ai excel automation'
    ]
  },
  
  de: {
    primary: [
      'excel api',
      'tabellenkalkulation api',
      'excel zu api',
      'excel rest api',
      'spreadsheet webservice'
    ],
    secondary: [
      'excel berechnung api',
      'excel formeln api',
      'tabellen automatisierung',
      'excel integration',
      'excel webdienst'
    ],
    longtail: [
      'excel in rest api umwandeln',
      'excel tabellenkalkulation api dienst',
      'excel berechnungsengine api',
      'excel formeln in api verwenden',
      'excel geschäftslogik api'
    ],
    ai: [
      'chatgpt excel integration',
      'claude mcp excel',
      'ki tabellenkalkulation api',
      'llm excel berechnungen',
      'ki excel automatisierung'
    ]
  },
  
  fr: {
    primary: [
      'api excel',
      'api feuille de calcul',
      'excel vers api',
      'api rest excel',
      'service web tableur'
    ],
    secondary: [
      'api calcul excel',
      'api formules excel',
      'automatisation tableur',
      'intégration excel',
      'service web excel'
    ],
    longtail: [
      'convertir excel en api rest',
      'service api feuille de calcul excel',
      'api moteur de calcul excel',
      'utiliser formules excel dans api',
      'api logique métier excel'
    ],
    ai: [
      'intégration chatgpt excel',
      'claude mcp excel',
      'api tableur ia',
      'calculs excel llm',
      'automatisation excel ia'
    ]
  },
  
  es: {
    primary: [
      'api de excel',
      'api hoja de cálculo',
      'excel a api',
      'api rest excel',
      'servicio web hoja cálculo'
    ],
    secondary: [
      'api cálculo excel',
      'api fórmulas excel',
      'automatización hojas cálculo',
      'integración excel',
      'servicio web excel'
    ],
    longtail: [
      'convertir excel a api rest',
      'servicio api hoja de cálculo excel',
      'api motor de cálculo excel',
      'usar fórmulas excel en api',
      'api lógica negocio excel'
    ],
    ai: [
      'integración chatgpt excel',
      'claude mcp excel',
      'api hoja cálculo ia',
      'cálculos excel llm',
      'automatización excel ia'
    ]
  }
};

// Get optimized title with keywords
export function getOptimizedTitle(baseTitle: string, locale: string, keywords: string[]): string {
  // Include 1-2 primary keywords naturally in title
  return baseTitle;
}

// Get optimized meta description
export function getOptimizedDescription(baseDesc: string, locale: string): string {
  // Include 2-3 keywords naturally in description
  return baseDesc;
}

// Get focus keywords for a specific topic and locale
export function getFocusKeywords(topic: string, locale: string): string[] {
  const keywords = seoKeywords[locale] || seoKeywords.en;
  
  // Return relevant keywords based on topic
  if (topic.includes('ai') || topic.includes('chatgpt') || topic.includes('claude')) {
    return [...keywords.ai, ...keywords.primary.slice(0, 2)];
  }
  
  if (topic.includes('api')) {
    return [...keywords.primary, ...keywords.secondary.slice(0, 2)];
  }
  
  return [...keywords.primary.slice(0, 3), ...keywords.longtail.slice(0, 2)];
}