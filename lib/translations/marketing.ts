import { SupportedLocale } from './blog-helpers';

// Marketing page translations
// Translations are kept similar in length to avoid layout issues

export const marketing = {
  en: {
    // Navigation
    nav: {
      howItWorks: 'How it Works',
      developers: 'Developers',
      automations: 'Automations',
      ai: 'AI',
      blog: 'Blog',
      getStarted: 'Get Started',
      home: 'Home',
    },
    // Footer
    footer: {
      product: 'Product',
      excelToApi: 'Excel to API',
      howItWorks: 'How it Works',
      forDevelopers: 'For Developers',
      forAutomations: 'For Automations',
      aiIntegration: 'AI Integration',
      documentation: 'Documentation',
      pricing: 'Pricing',
      company: 'Company',
      about: 'About',
      blog: 'Blog',
      contact: 'Contact',
      description: 'SpreadAPI bridges the gap between Excel and AI, turning decades of business logic into secure, instant APIs. Your spreadsheets become powerful calculation engines that AI can access without seeing proprietary formulas.',
      copyright: '© {year} Airrange.io. All rights reserved.',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
    },
    // Common buttons & labels
    common: {
      getStartedFree: 'Get Started Free',
      tryItFree: 'Try It Free',
      seeHowItWorks: 'See How It Works',
      viewDocs: 'View Documentation',
      learnMore: 'Learn More',
      example: 'Example',
    },
  },

  de: {
    nav: {
      howItWorks: 'So funktioniert\'s',
      developers: 'Entwickler',
      automations: 'Automation',
      ai: 'KI',
      blog: 'Blog',
      getStarted: 'Loslegen',
      home: 'Start',
    },
    footer: {
      product: 'Produkt',
      excelToApi: 'Excel zu API',
      howItWorks: 'So funktioniert\'s',
      forDevelopers: 'Für Entwickler',
      forAutomations: 'Für Automation',
      aiIntegration: 'KI-Integration',
      documentation: 'Dokumentation',
      pricing: 'Preise',
      company: 'Unternehmen',
      about: 'Über uns',
      blog: 'Blog',
      contact: 'Kontakt',
      description: 'SpreadAPI verbindet Excel mit KI und wandelt Ihre Geschäftslogik in sichere, sofortige APIs um. Ihre Tabellen werden zu Berechnungsmaschinen, auf die KI zugreifen kann, ohne Ihre Formeln zu sehen.',
      copyright: '© {year} Airrange.io. Alle Rechte vorbehalten.',
      privacyPolicy: 'Datenschutz',
      termsOfService: 'AGB',
    },
    common: {
      getStartedFree: 'Kostenlos starten',
      tryItFree: 'Kostenlos testen',
      seeHowItWorks: 'So funktioniert\'s',
      viewDocs: 'Dokumentation',
      learnMore: 'Mehr erfahren',
      example: 'Beispiel',
    },
  },

  fr: {
    nav: {
      howItWorks: 'Comment ça marche',
      developers: 'Développeurs',
      automations: 'Automations',
      ai: 'IA',
      blog: 'Blog',
      getStarted: 'Commencer',
      home: 'Accueil',
    },
    footer: {
      product: 'Produit',
      excelToApi: 'Excel vers API',
      howItWorks: 'Comment ça marche',
      forDevelopers: 'Pour Développeurs',
      forAutomations: 'Pour Automations',
      aiIntegration: 'Intégration IA',
      documentation: 'Documentation',
      pricing: 'Tarifs',
      company: 'Entreprise',
      about: 'À propos',
      blog: 'Blog',
      contact: 'Contact',
      description: 'SpreadAPI connecte Excel et l\'IA, transformant votre logique métier en APIs sécurisées et instantanées. Vos feuilles de calcul deviennent des moteurs de calcul accessibles par l\'IA sans voir vos formules.',
      copyright: '© {year} Airrange.io. Tous droits réservés.',
      privacyPolicy: 'Confidentialité',
      termsOfService: 'CGU',
    },
    common: {
      getStartedFree: 'Commencer gratuit',
      tryItFree: 'Essai gratuit',
      seeHowItWorks: 'Comment ça marche',
      viewDocs: 'Documentation',
      learnMore: 'En savoir plus',
      example: 'Exemple',
    },
  },

  es: {
    nav: {
      howItWorks: 'Cómo funciona',
      developers: 'Desarrolladores',
      automations: 'Automatización',
      ai: 'IA',
      blog: 'Blog',
      getStarted: 'Empezar',
      home: 'Inicio',
    },
    footer: {
      product: 'Producto',
      excelToApi: 'Excel a API',
      howItWorks: 'Cómo funciona',
      forDevelopers: 'Para Desarrolladores',
      forAutomations: 'Para Automatización',
      aiIntegration: 'Integración IA',
      documentation: 'Documentación',
      pricing: 'Precios',
      company: 'Empresa',
      about: 'Nosotros',
      blog: 'Blog',
      contact: 'Contacto',
      description: 'SpreadAPI conecta Excel con IA, convirtiendo su lógica de negocio en APIs seguras e instantáneas. Sus hojas de cálculo se convierten en motores de cálculo que la IA puede acceder sin ver sus fórmulas.',
      copyright: '© {year} Airrange.io. Todos los derechos reservados.',
      privacyPolicy: 'Privacidad',
      termsOfService: 'Términos',
    },
    common: {
      getStartedFree: 'Empezar gratis',
      tryItFree: 'Prueba gratis',
      seeHowItWorks: 'Cómo funciona',
      viewDocs: 'Documentación',
      learnMore: 'Saber más',
      example: 'Ejemplo',
    },
  },
} as const;

// Type for marketing translations (using a more flexible type)
export type MarketingTranslations = {
  nav: {
    howItWorks: string;
    developers: string;
    automations: string;
    ai: string;
    blog: string;
    getStarted: string;
    home: string;
  };
  footer: {
    product: string;
    excelToApi: string;
    howItWorks: string;
    forDevelopers: string;
    forAutomations: string;
    aiIntegration: string;
    documentation: string;
    pricing: string;
    company: string;
    about: string;
    blog: string;
    contact: string;
    description: string;
    copyright: string;
    privacyPolicy: string;
    termsOfService: string;
  };
  common: {
    getStartedFree: string;
    tryItFree: string;
    seeHowItWorks: string;
    viewDocs: string;
    learnMore: string;
    example: string;
  };
};

// Helper function to get translations for a locale
export function getMarketingTranslations(locale: SupportedLocale): MarketingTranslations {
  return (marketing[locale] || marketing.en) as MarketingTranslations;
}

// Helper to get marketing page URL for a locale
export function getMarketingUrl(page: string, locale: SupportedLocale = 'en'): string {
  if (locale === 'en') {
    return page ? `/${page}` : '/';
  }
  return page ? `/${locale}/${page}` : `/${locale}`;
}

// Get all alternate language URLs for a marketing page
export function getMarketingAlternates(page: string): Record<string, string> {
  const locales: SupportedLocale[] = ['en', 'de', 'fr', 'es'];
  const alternates: Record<string, string> = {};

  locales.forEach(locale => {
    alternates[locale] = getMarketingUrl(page, locale);
  });

  return alternates;
}
