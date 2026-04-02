import { SupportedLocale } from './blog-helpers';

// =============================================================================
// VS GOOGLE SHEETS API PAGE TRANSLATIONS
// =============================================================================

export const vsGoogleSheetsPage: Record<string, VsGoogleSheetsTranslations> = {
  en: {
    hero: {
      subheading: 'Comparison Guide',
      title: 'SpreadAPI vs Google Sheets API:',
      titleHighlight: 'Which Is Right for You?',
      description: "Both let you use spreadsheets programmatically. But they solve different problems in very different ways. Here's an honest comparison to help you choose.",
    },
    quickSummary: {
      title: 'Quick Summary',
      spreadapi: {
        name: 'SpreadAPI',
        bestFor: 'Best for: Using Excel calculations as API endpoints',
        pros: [
          'Works with native .xlsx files',
          '50-200ms response times',
          'MCP/AI integration built-in',
          'No Google account needed',
        ],
        cons: [
          'No real-time collaboration',
          'No data storage (calculation only)',
        ],
      },
      googleSheets: {
        name: 'Google Sheets API',
        bestFor: 'Best for: Reading/writing data in Google Sheets',
        pros: [
          'Free with Google account',
          'Real-time collaboration',
          'Huge ecosystem',
          'Data read/write capability',
        ],
        cons: [
          '60 req/min rate limit',
          '2-5 second response times',
        ],
      },
    },
    comparison: {
      title: 'Detailed',
      titleHighlight: 'Feature Comparison',
      headers: {
        feature: 'Feature',
        spreadapi: 'SpreadAPI',
        googleSheets: 'Google Sheets API',
      },
      rows: [
        ['Response time', '50-200ms', '2-5 seconds'],
        ['Rate limits', 'Plan-based (generous)', '60 read/min, 300/project'],
        ['File format', 'Native .xlsx', 'Google Sheets only'],
        ['Setup complexity', 'Upload \u2192 Publish', 'GCP project, OAuth, scopes'],
        ['Excel formula support', 'Full (500+ functions)', 'Partial (GSheets subset)'],
        ['VLOOKUP / INDEX-MATCH', 'Full support', 'Google Sheets version only'],
        ['AI / MCP integration', 'Built-in', 'Not available'],
        ['Typed API schema', 'Auto-generated', 'Manual'],
        ['On-premises option', 'Available', 'No'],
        ['Pricing', 'Free tier + paid plans', 'Free (with GCP quotas)'],
        ['Authentication', 'API key', 'OAuth 2.0 (complex)'],
        ['Batch operations', 'Yes', 'Yes'],
      ],
    },
    pricing: {
      title: 'Pricing:',
      titleHighlight: 'Google Sheets API Cost',
      titleSuffix: 'vs SpreadAPI',
      description: 'Google Sheets API is technically free, but the hidden costs add up when you need production reliability.',
      googleSheets: {
        name: 'Google Sheets API',
        price: '$0',
        priceSuffix: 'but...',
        items: [
          '60 requests/min rate limit',
          'Need Google Cloud project',
          'Must convert Excel to GSheets',
          '2-5s latency per request',
          'No SLA for free tier',
          'Quota increases require billing',
        ],
      },
      spreadapi: {
        name: 'SpreadAPI',
        price: 'Free',
        priceSuffix: 'to start',
        items: [
          '1 service on free tier',
          '50-200ms response time',
          'Native Excel support',
          'AI/MCP included',
          'Pro plans for more services',
        ],
        seeFullPricing: 'See full pricing',
      },
    },
    whenToChoose: {
      title: 'When to Choose',
      titleHighlight: 'Which',
      spreadapi: {
        title: 'Choose SpreadAPI when:',
        items: [
          'You need Excel formulas as an API',
          'Speed matters (sub-200ms)',
          'You want AI/MCP integration',
          'You already have .xlsx files',
          'Your team maintains logic in Excel',
          'You need on-premises deployment',
        ],
      },
      googleSheets: {
        title: 'Choose Google Sheets API when:',
        items: [
          'You need to read/write sheet data',
          'Real-time collaboration is key',
          "You're already in Google Workspace",
          'Low request volume (under 60/min)',
          "Latency isn't critical",
          'You need Google Drive integration',
        ],
      },
    },
    faqs: [
      {
        question: 'Is SpreadAPI faster than Google Sheets API?',
        answer: 'Yes. SpreadAPI responds in 50-200ms because the Excel engine stays warm in memory. Google Sheets API typically takes 2-5 seconds per request because it needs to open the spreadsheet file for each calculation.',
      },
      {
        question: 'Can I use my existing Excel files with SpreadAPI?',
        answer: 'Yes. Upload your .xlsx file as-is. Google Sheets API requires you to first convert your spreadsheet to Google Sheets format, which can break complex formulas and Excel-specific features.',
      },
      {
        question: 'What are Google Sheets API rate limits?',
        answer: "Google Sheets API allows 60 read requests per minute per user and 300 requests per minute per project. SpreadAPI offers significantly higher limits depending on your plan, starting from 1,000 calls/month on the free tier.",
      },
      {
        question: 'Does SpreadAPI support AI integration?',
        answer: 'Yes. SpreadAPI includes MCP (Model Context Protocol) support, allowing AI assistants like ChatGPT and Claude to call your spreadsheet calculations directly. Google Sheets API has no built-in AI integration.',
      },
      {
        question: 'Which is cheaper for spreadsheet API use?',
        answer: "SpreadAPI offers a free tier with 1 service. Google Sheets API is free but requires a Google Cloud project and has strict rate limits. For production use, SpreadAPI's pricing is typically lower when you factor in the infrastructure and rate limit costs of Google Sheets.",
      },
    ],
    faqTitle: 'Frequently Asked Questions',
    cta: {
      title: 'Ready to Try SpreadAPI?',
      description: 'Convert your first Excel spreadsheet to an API in 5 minutes. Free, no credit card.',
      button: 'Get Started Free',
    },
  },
  de: {
    hero: {
      subheading: 'Vergleichsleitfaden',
      title: 'SpreadAPI vs Google Sheets API:',
      titleHighlight: 'Welche Loesung passt zu Ihnen?',
      description: 'Beide ermoeglichen die programmatische Nutzung von Tabellenkalkulationen. Aber sie loesen unterschiedliche Probleme auf sehr unterschiedliche Weise. Hier ist ein ehrlicher Vergleich, der Ihnen bei der Entscheidung hilft.',
    },
    quickSummary: {
      title: 'Kurzuebersicht',
      spreadapi: {
        name: 'SpreadAPI',
        bestFor: 'Ideal fuer: Excel-Berechnungen als API-Endpunkte nutzen',
        pros: [
          'Funktioniert mit nativen .xlsx-Dateien',
          '50-200ms Antwortzeiten',
          'MCP/KI-Integration integriert',
          'Kein Google-Konto erforderlich',
        ],
        cons: [
          'Keine Echtzeit-Zusammenarbeit',
          'Keine Datenspeicherung (nur Berechnung)',
        ],
      },
      googleSheets: {
        name: 'Google Sheets API',
        bestFor: 'Ideal fuer: Daten in Google Sheets lesen/schreiben',
        pros: [
          'Kostenlos mit Google-Konto',
          'Echtzeit-Zusammenarbeit',
          'Grosses Oekosystem',
          'Daten lesen/schreiben',
        ],
        cons: [
          '60 Anfragen/Min. Rate-Limit',
          '2-5 Sekunden Antwortzeiten',
        ],
      },
    },
    comparison: {
      title: 'Detaillierter',
      titleHighlight: 'Funktionsvergleich',
      headers: {
        feature: 'Funktion',
        spreadapi: 'SpreadAPI',
        googleSheets: 'Google Sheets API',
      },
      rows: [
        ['Antwortzeit', '50-200ms', '2-5 Sekunden'],
        ['Rate-Limits', 'Plan-basiert (grosszuegig)', '60 Lese/Min., 300/Projekt'],
        ['Dateiformat', 'Natives .xlsx', 'Nur Google Sheets'],
        ['Setup-Komplexitaet', 'Hochladen \u2192 Veroeffentlichen', 'GCP-Projekt, OAuth, Scopes'],
        ['Excel-Formelunterstuetzung', 'Vollstaendig (500+ Funktionen)', 'Teilweise (GSheets-Subset)'],
        ['VLOOKUP / INDEX-MATCH', 'Volle Unterstuetzung', 'Nur Google Sheets-Version'],
        ['KI / MCP-Integration', 'Integriert', 'Nicht verfuegbar'],
        ['Typisiertes API-Schema', 'Automatisch generiert', 'Manuell'],
        ['On-Premises-Option', 'Verfuegbar', 'Nein'],
        ['Preise', 'Kostenlose Stufe + kostenpflichtige Plaene', 'Kostenlos (mit GCP-Kontingenten)'],
        ['Authentifizierung', 'API-Schluessel', 'OAuth 2.0 (komplex)'],
        ['Batch-Operationen', 'Ja', 'Ja'],
      ],
    },
    pricing: {
      title: 'Preise:',
      titleHighlight: 'Google Sheets API Kosten',
      titleSuffix: 'vs SpreadAPI',
      description: 'Google Sheets API ist technisch gesehen kostenlos, aber die versteckten Kosten summieren sich, wenn Sie Produktionszuverlaessigkeit benoetigen.',
      googleSheets: {
        name: 'Google Sheets API',
        price: '0 \u20AC',
        priceSuffix: 'aber...',
        items: [
          '60 Anfragen/Min. Rate-Limit',
          'Google Cloud-Projekt erforderlich',
          'Excel muss in GSheets konvertiert werden',
          '2-5s Latenz pro Anfrage',
          'Kein SLA fuer kostenlose Stufe',
          'Kontingenterhoehungen erfordern Abrechnung',
        ],
      },
      spreadapi: {
        name: 'SpreadAPI',
        price: 'Kostenlos',
        priceSuffix: 'zum Start',
        items: [
          '1 Service in der kostenlosen Stufe',
          '50-200ms Antwortzeit',
          'Native Excel-Unterstuetzung',
          'KI/MCP inklusive',
          'Pro-Plaene fuer mehr Services',
        ],
        seeFullPricing: 'Alle Preise ansehen',
      },
    },
    whenToChoose: {
      title: 'Wann Sie',
      titleHighlight: 'welche Loesung waehlen',
      spreadapi: {
        title: 'Waehlen Sie SpreadAPI, wenn:',
        items: [
          'Sie Excel-Formeln als API benoetigen',
          'Geschwindigkeit wichtig ist (unter 200ms)',
          'Sie KI/MCP-Integration wuenschen',
          'Sie bereits .xlsx-Dateien haben',
          'Ihr Team Logik in Excel pflegt',
          'Sie eine On-Premises-Bereitstellung benoetigen',
        ],
      },
      googleSheets: {
        title: 'Waehlen Sie Google Sheets API, wenn:',
        items: [
          'Sie Tabellendaten lesen/schreiben muessen',
          'Echtzeit-Zusammenarbeit entscheidend ist',
          'Sie bereits Google Workspace nutzen',
          'Geringes Anfragevolumen (unter 60/Min.)',
          'Latenz nicht kritisch ist',
          'Sie Google Drive-Integration benoetigen',
        ],
      },
    },
    faqs: [
      {
        question: 'Ist SpreadAPI schneller als Google Sheets API?',
        answer: 'Ja. SpreadAPI antwortet in 50-200ms, da die Excel-Engine im Arbeitsspeicher geladen bleibt. Google Sheets API benoetigt in der Regel 2-5 Sekunden pro Anfrage, da die Tabelle fuer jede Berechnung neu geoeffnet werden muss.',
      },
      {
        question: 'Kann ich meine bestehenden Excel-Dateien mit SpreadAPI verwenden?',
        answer: 'Ja. Laden Sie Ihre .xlsx-Datei unveraendert hoch. Google Sheets API erfordert, dass Sie Ihre Tabelle zuerst in das Google Sheets-Format konvertieren, was komplexe Formeln und Excel-spezifische Funktionen beschaedigen kann.',
      },
      {
        question: 'Welche Rate-Limits hat Google Sheets API?',
        answer: 'Google Sheets API erlaubt 60 Leseanfragen pro Minute pro Benutzer und 300 Anfragen pro Minute pro Projekt. SpreadAPI bietet je nach Plan deutlich hoehere Limits, beginnend bei 1.000 Aufrufen/Monat in der kostenlosen Stufe.',
      },
      {
        question: 'Unterstuetzt SpreadAPI KI-Integration?',
        answer: 'Ja. SpreadAPI beinhaltet MCP (Model Context Protocol)-Unterstuetzung, die es KI-Assistenten wie ChatGPT und Claude ermoeglicht, Ihre Tabellenberechnungen direkt aufzurufen. Google Sheets API bietet keine integrierte KI-Integration.',
      },
      {
        question: 'Was ist guenstiger fuer die Nutzung als Tabellen-API?',
        answer: 'SpreadAPI bietet eine kostenlose Stufe mit 1 Service. Google Sheets API ist kostenlos, erfordert jedoch ein Google Cloud-Projekt und hat strenge Rate-Limits. Fuer den Produktionseinsatz ist SpreadAPI in der Regel guenstiger, wenn man die Infrastruktur- und Rate-Limit-Kosten von Google Sheets einberechnet.',
      },
    ],
    faqTitle: 'Haeufig gestellte Fragen',
    cta: {
      title: 'Bereit, SpreadAPI auszuprobieren?',
      description: 'Konvertieren Sie Ihre erste Excel-Tabelle in 5 Minuten in eine API. Kostenlos, keine Kreditkarte erforderlich.',
      button: 'Kostenlos starten',
    },
  },
};

export interface VsGoogleSheetsTranslations {
  hero: {
    subheading: string;
    title: string;
    titleHighlight: string;
    description: string;
  };
  quickSummary: {
    title: string;
    spreadapi: {
      name: string;
      bestFor: string;
      pros: string[];
      cons: string[];
    };
    googleSheets: {
      name: string;
      bestFor: string;
      pros: string[];
      cons: string[];
    };
  };
  comparison: {
    title: string;
    titleHighlight: string;
    headers: {
      feature: string;
      spreadapi: string;
      googleSheets: string;
    };
    rows: string[][];
  };
  pricing: {
    title: string;
    titleHighlight: string;
    titleSuffix: string;
    description: string;
    googleSheets: {
      name: string;
      price: string;
      priceSuffix: string;
      items: string[];
    };
    spreadapi: {
      name: string;
      price: string;
      priceSuffix: string;
      items: string[];
      seeFullPricing: string;
    };
  };
  whenToChoose: {
    title: string;
    titleHighlight: string;
    spreadapi: {
      title: string;
      items: string[];
    };
    googleSheets: {
      title: string;
      items: string[];
    };
  };
  faqs: { question: string; answer: string }[];
  faqTitle: string;
  cta: {
    title: string;
    description: string;
    button: string;
  };
}

export function getVsGoogleSheetsTranslations(locale: SupportedLocale): VsGoogleSheetsTranslations {
  if (locale === 'de') {
    return vsGoogleSheetsPage.de;
  }
  return vsGoogleSheetsPage.en;
}

// =============================================================================
// SECURITY PAGE TRANSLATIONS
// =============================================================================

export const securityPage: Record<string, SecurityTranslations> = {
  en: {
    hero: {
      subheading: 'Trust & Transparency',
      title: 'Your Data,',
      titleHighlight: 'Protected',
      description: "We built SpreadAPI with a simple principle: collect only what's essential, protect everything we touch, and give you full control over your data.",
    },
    trustBadges: {
      soc2: 'Built on SOC 2 Type 2 Infrastructure',
      iso27001: 'ISO 27001 Certified Providers',
      tls: 'TLS 1.3 Encryption',
      gdpr: 'GDPR Compliant',
    },
    approach: {
      subheading: 'Our Philosophy',
      title: 'Less Data,',
      titleHighlight: 'More Security',
      description: "The best way to protect data is to not collect it in the first place. Here's what makes SpreadAPI different.",
      emailOnly: {
        title: 'Email Only',
        text: 'We store just your email address. No names, phone numbers, addresses, or tracking data.',
      },
      cache: {
        title: '15-Minute Cache',
        text: "Calculation results are cached briefly for performance, then automatically deleted. We don't keep your query data.",
      },
      formulas: {
        title: 'Formulas Stay Private',
        text: 'Your Excel formulas are never exposed. The API returns results only\u2014your business logic remains yours.',
      },
    },
    infrastructure: {
      subheading: 'Infrastructure',
      title: 'Built on',
      titleHighlight: 'Trusted Foundations',
      description: 'We chose infrastructure providers with rigorous security certifications so you benefit from their enterprise-grade security controls.',
      vercel: {
        name: 'Vercel',
        description: 'Application hosting with global edge network. Enterprise hosting available for customers with stricter requirements.',
        badges: ['SOC 2 Type 2', 'ISO 27001', 'GDPR'],
      },
      redis: {
        name: 'Redis Cloud',
        description: 'Database for metadata and caching',
        badges: ['SOC 2 Type 2', 'ISO 27001', 'ISO 27017', 'ISO 27018'],
      },
      hanko: {
        name: 'Hanko',
        description: 'Passwordless authentication',
        badges: ['FIDO Alliance', 'FIDO2 Certified', 'Open Source'],
      },
    },
    authentication: {
      subheading: 'Authentication',
      title: 'Phishing-Proof',
      titleHighlight: 'Login',
      description: 'We use passkeys instead of passwords. Your credentials are stored on your device, not our servers\u2014making phishing attacks impossible.',
      items: [
        'No passwords to steal or guess',
        'Passkeys only work on legitimate domains',
        'Cryptographically secure, device-bound',
      ],
    },
    encryption: {
      subheading: 'Encryption',
      title: 'Protected',
      titleHighlight: 'Everywhere',
      description: 'Your data is encrypted in transit and at rest. API tokens are hashed\u2014we never store the actual values.',
      items: [
        'TLS 1.3 for all connections',
        'AES-256 encryption at rest',
        'SHA-256 hashed API tokens',
      ],
    },
    compliance: {
      subheading: 'Compliance',
      title: 'Meeting',
      titleHighlight: 'Your Requirements',
      gdpr: {
        title: 'GDPR',
        text: 'Full GDPR compliance with data minimization, right to erasure, and data portability. DPA available upon request.',
      },
      healthcare: {
        title: 'Healthcare & Regulated Industries',
        text: 'Need HIPAA? We offer Enterprise hosting on HIPAA-ready infrastructure, or On-Premises deployment in your own compliant environment.',
      },
      certifiedProviders: {
        title: 'Certified Providers',
        text: 'All our infrastructure providers (Vercel, Redis Cloud) maintain SOC 2 Type 2 and ISO 27001 certifications with annual third-party audits.',
      },
    },
    onPremises: {
      subheading: 'Maximum Control',
      title: 'Need Complete Data Sovereignty?',
      description: 'Deploy SpreadAPI Runtime in your own infrastructure. Zero external connections, air-gap compatible for runtime execution, no vendor access to your data.',
      ctaPrimary: 'Learn About On-Premises',
      ctaSecondary: 'Contact Enterprise Team',
      features: {
        infrastructure: {
          title: 'Your Infrastructure',
          text: 'Data never leaves your network',
        },
        airGap: {
          title: 'Air-Gap Ready Runtime',
          text: 'No internet connection required for execution',
        },
        zeroVendor: {
          title: 'Zero Vendor Access',
          text: 'Full control, full privacy',
        },
      },
    },
    contact: {
      title: 'Questions About',
      titleHighlight: 'Security?',
      description: "We're happy to discuss your specific requirements, provide compliance documentation, or arrange a security review.",
      ctaPrimary: 'Contact Security Team',
      ctaSecondary: 'View Documentation',
    },
  },
  de: {
    hero: {
      subheading: 'Vertrauen & Transparenz',
      title: 'Ihre Daten,',
      titleHighlight: 'geschuetzt',
      description: 'Wir haben SpreadAPI mit einem einfachen Prinzip entwickelt: Nur das Noetigste erfassen, alles schuetzen, was wir verarbeiten, und Ihnen die volle Kontrolle ueber Ihre Daten geben.',
    },
    trustBadges: {
      soc2: 'Aufgebaut auf SOC 2 Type 2 Infrastruktur',
      iso27001: 'ISO 27001 zertifizierte Anbieter',
      tls: 'TLS 1.3 Verschluesselung',
      gdpr: 'DSGVO-konform',
    },
    approach: {
      subheading: 'Unsere Philosophie',
      title: 'Weniger Daten,',
      titleHighlight: 'mehr Sicherheit',
      description: 'Der beste Weg, Daten zu schuetzen, ist, sie gar nicht erst zu erheben. Das macht SpreadAPI anders.',
      emailOnly: {
        title: 'Nur E-Mail',
        text: 'Wir speichern ausschliesslich Ihre E-Mail-Adresse. Keine Namen, Telefonnummern, Adressen oder Tracking-Daten.',
      },
      cache: {
        title: '15-Minuten-Cache',
        text: 'Berechnungsergebnisse werden kurz fuer die Performance zwischengespeichert und dann automatisch geloescht. Wir speichern Ihre Abfragedaten nicht.',
      },
      formulas: {
        title: 'Formeln bleiben privat',
        text: 'Ihre Excel-Formeln werden nie offengelegt. Die API gibt nur Ergebnisse zurueck \u2013 Ihre Geschaeftslogik bleibt Ihre.',
      },
    },
    infrastructure: {
      subheading: 'Infrastruktur',
      title: 'Aufgebaut auf',
      titleHighlight: 'vertrauenswuerdigen Grundlagen',
      description: 'Wir haben Infrastrukturanbieter mit strengen Sicherheitszertifizierungen gewaehlt, damit Sie von deren Enterprise-Sicherheitskontrollen profitieren.',
      vercel: {
        name: 'Vercel',
        description: 'Anwendungshosting mit globalem Edge-Netzwerk. Enterprise-Hosting fuer Kunden mit strengeren Anforderungen verfuegbar.',
        badges: ['SOC 2 Type 2', 'ISO 27001', 'DSGVO'],
      },
      redis: {
        name: 'Redis Cloud',
        description: 'Datenbank fuer Metadaten und Caching',
        badges: ['SOC 2 Type 2', 'ISO 27001', 'ISO 27017', 'ISO 27018'],
      },
      hanko: {
        name: 'Hanko',
        description: 'Passwortlose Authentifizierung',
        badges: ['FIDO Alliance', 'FIDO2-zertifiziert', 'Open Source'],
      },
    },
    authentication: {
      subheading: 'Authentifizierung',
      title: 'Phishing-sicherer',
      titleHighlight: 'Login',
      description: 'Wir verwenden Passkeys statt Passwoerter. Ihre Anmeldedaten werden auf Ihrem Geraet gespeichert, nicht auf unseren Servern \u2013 Phishing-Angriffe sind damit unmoeglich.',
      items: [
        'Keine Passwoerter zum Stehlen oder Erraten',
        'Passkeys funktionieren nur auf legitimen Domains',
        'Kryptografisch sicher, geraetegebunden',
      ],
    },
    encryption: {
      subheading: 'Verschluesselung',
      title: 'Geschuetzt',
      titleHighlight: 'ueberall',
      description: 'Ihre Daten sind bei der Uebertragung und im Ruhezustand verschluesselt. API-Tokens werden gehasht \u2013 wir speichern nie die eigentlichen Werte.',
      items: [
        'TLS 1.3 fuer alle Verbindungen',
        'AES-256 Verschluesselung im Ruhezustand',
        'SHA-256 gehashte API-Tokens',
      ],
    },
    compliance: {
      subheading: 'Compliance',
      title: 'Erfuellung',
      titleHighlight: 'Ihrer Anforderungen',
      gdpr: {
        title: 'DSGVO',
        text: 'Vollstaendige DSGVO-Konformitaet mit Datenminimierung, Recht auf Loeschung und Datenportabilitaet. DPA auf Anfrage verfuegbar.',
      },
      healthcare: {
        title: 'Gesundheitswesen & regulierte Branchen',
        text: 'HIPAA benoetigt? Wir bieten Enterprise-Hosting auf HIPAA-faehiger Infrastruktur oder On-Premises-Bereitstellung in Ihrer eigenen konformen Umgebung.',
      },
      certifiedProviders: {
        title: 'Zertifizierte Anbieter',
        text: 'Alle unsere Infrastrukturanbieter (Vercel, Redis Cloud) verfuegen ueber SOC 2 Type 2 und ISO 27001 Zertifizierungen mit jaehrlichen Drittanbieter-Audits.',
      },
    },
    onPremises: {
      subheading: 'Maximale Kontrolle',
      title: 'Vollstaendige Datensouveraenitaet benoetigt?',
      description: 'Betreiben Sie SpreadAPI Runtime in Ihrer eigenen Infrastruktur. Keine externen Verbindungen, Air-Gap-kompatibel fuer die Laufzeitausfuehrung, kein Anbieterzugriff auf Ihre Daten.',
      ctaPrimary: 'Mehr ueber On-Premises erfahren',
      ctaSecondary: 'Enterprise-Team kontaktieren',
      features: {
        infrastructure: {
          title: 'Ihre Infrastruktur',
          text: 'Daten verlassen nie Ihr Netzwerk',
        },
        airGap: {
          title: 'Air-Gap-faehige Laufzeit',
          text: 'Keine Internetverbindung fuer die Ausfuehrung erforderlich',
        },
        zeroVendor: {
          title: 'Kein Anbieterzugriff',
          text: 'Volle Kontrolle, volle Privatsphaere',
        },
      },
    },
    contact: {
      title: 'Fragen zur',
      titleHighlight: 'Sicherheit?',
      description: 'Wir besprechen gerne Ihre spezifischen Anforderungen, stellen Compliance-Dokumentation bereit oder vereinbaren eine Sicherheitspruefung.',
      ctaPrimary: 'Sicherheitsteam kontaktieren',
      ctaSecondary: 'Dokumentation ansehen',
    },
  },
};

export interface SecurityTranslations {
  hero: {
    subheading: string;
    title: string;
    titleHighlight: string;
    description: string;
  };
  trustBadges: {
    soc2: string;
    iso27001: string;
    tls: string;
    gdpr: string;
  };
  approach: {
    subheading: string;
    title: string;
    titleHighlight: string;
    description: string;
    emailOnly: { title: string; text: string };
    cache: { title: string; text: string };
    formulas: { title: string; text: string };
  };
  infrastructure: {
    subheading: string;
    title: string;
    titleHighlight: string;
    description: string;
    vercel: { name: string; description: string; badges: string[] };
    redis: { name: string; description: string; badges: string[] };
    hanko: { name: string; description: string; badges: string[] };
  };
  authentication: {
    subheading: string;
    title: string;
    titleHighlight: string;
    description: string;
    items: string[];
  };
  encryption: {
    subheading: string;
    title: string;
    titleHighlight: string;
    description: string;
    items: string[];
  };
  compliance: {
    subheading: string;
    title: string;
    titleHighlight: string;
    gdpr: { title: string; text: string };
    healthcare: { title: string; text: string };
    certifiedProviders: { title: string; text: string };
  };
  onPremises: {
    subheading: string;
    title: string;
    description: string;
    ctaPrimary: string;
    ctaSecondary: string;
    features: {
      infrastructure: { title: string; text: string };
      airGap: { title: string; text: string };
      zeroVendor: { title: string; text: string };
    };
  };
  contact: {
    title: string;
    titleHighlight: string;
    description: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
}

export function getSecurityTranslations(locale: SupportedLocale): SecurityTranslations {
  if (locale === 'de') {
    return securityPage.de;
  }
  return securityPage.en;
}
