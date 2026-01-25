import { SupportedLocale } from './blog-helpers';

// Marketing page translations
// Translations are kept similar in length to avoid layout issues

// Homepage translations - comprehensive content for the main marketing page
export const homepage = {
  en: {
    hero: {
      subheading: 'Headless Spreadsheets for AI & Automation',
      title1: 'Turn Excel Into Live APIs.',
      title2: 'Let AI Talk to Spreadsheets',
      description: 'Convert spreadsheets into secure, real-time web services. Give AI assistants, automation tools, and developers direct access — without hallucinations or broken logic.',
      cta: 'Create your first free Excel API',
    },
    painPoints: {
      title1: 'Why AI Struggles with',
      title2: 'Spreadsheet Math',
      subtitle: "We asked AI about its spreadsheet skills — here's what it honestly told us.",
      card1: {
        title: '"I Can\'t Run Your Formulas"',
        text: "I see your formulas and Excel's results, but I can't execute them. I work with saved values, not live calculations.",
        author: '- Claude, ChatGPT & Gemini',
      },
      card2: {
        title: '"I Only Know 50-100 Functions"',
        text: "Basic math? Sure. But Excel has hundreds more - XIRR, YIELD, array formulas? I'll miss edge cases.",
        author: '- Claude, being honest',
      },
      card3: {
        title: '"My Errors Compound Fast"',
        text: "One small mistake in cell A1? By row 1000, I'm completely off. Error propagation is my nightmare.",
        author: '- Every AI Model',
      },
      card4: {
        title: '"I Take Forever to Calculate"',
        text: '1000+ formulas? That\'s 2-15 minutes of dependency mapping. Excel does it in 1-2 seconds.',
        author: '- Every AI Model',
      },
      card5: {
        title: '"Complex Models? 20% Accuracy"',
        text: 'With 1000+ formulas, I have 20-40% chance of getting it right. SpreadAPI? Always 100%.',
        author: '- Claude & ChatGPT',
      },
      card6: {
        title: '"I Can\'t Handle Dependencies"',
        text: 'Cell A depends on B, B on C... I spend most time figuring out order, not calculating.',
        author: '- Gemini',
      },
      link: 'Click here to see more AI limitations →',
    },
    solution: {
      title1: "Here's How We Help AI",
      title2: 'Excel at Spreadsheet Math',
      description: 'Transform your spreadsheets into real-time APIs that AI can call — no guessing, no hallucinations, just accurate results powered by your Excel logic. Whether it\'s simple calculations or complex chains of nested formulas, your Excel logic is executed exactly as you built it. The result: clean, reliable JSON that AI assistants, developers, and automation tools can work with — instantly and securely.',
    },
    feature1: {
      title1: 'AI Sales Agents',
      title2: 'Creating Complex Excel Quotes',
      description: 'Your AI sales assistant can now generate accurate quotes using your actual Excel pricing models. No more approximations or hallucinations — just precise calculations from your trusted spreadsheets, accessible through a simple API.',
      point1: '100% Accurate Calculations',
      point2: 'Your Business Logic Protected',
      point3: 'Works with Any AI Assistant',
      chatCustomer: 'I need a quote for 500 units with our enterprise discount, shipped to 3 locations in California',
      chatAI: "I've calculated your quote using our Excel pricing model:",
      basePrice: 'Base Price (500 × $47.99):',
      enterpriseDiscount: 'Enterprise Discount (15%):',
      volumeDiscount: 'Volume Discount (500+):',
      shipping: 'CA Shipping (3 locations):',
      salesTax: 'CA Sales Tax (7.25%):',
      totalQuote: 'Total Quote:',
      calcNote: 'Calculated by Excel in 47ms • 100% accurate',
      downloadPdf: 'Download PDF',
    },
    feature2: {
      title1: 'Automation Tools',
      title2: 'Running Your Excel Logic',
      description: 'Tools like Zapier, Make, and n8n can now trigger calculations in your Excel models with live inputs and return real results — instantly. No logic reimplementation. No formula rewrites. Just exact Excel behavior delivered as a secure, real-time API.',
      point1: 'Plug & play with any workflow tool',
      point2: 'Returns only clean JSON, never shows formulas',
      point3: 'Handles any Excel complexity — IFs, XLOOKUPs, ARRAY functions, VAT logic, pricing',
    },
    feature3: {
      title1: '"Just convert this Excel to code"',
      title2: ', they said.',
      description: "It's one of the most common dev requests — turning business-critical spreadsheets into code. But nested IFs, lookup chains, and constantly changing logic quickly turn it into a maintenance nightmare. With SpreadAPI, developers don't need to rebuild spreadsheet logic — they can run it directly, through a secure and versioned API.",
      point1Title: '100% Formula Accuracy',
      point1Text: "VLOOKUP, SUMIFS, financial functions - they all work exactly as designed. Because it's real Excel, not a JavaScript approximation.",
      point2Title: 'Business Users Keep Control',
      point2Text: 'When formulas change, they update the Excel. Your API instantly reflects the changes. No code deployment needed.',
      link: 'Read: Why reimplementing Excel always fails →',
    },
    differentiators: {
      subheading: "Why We're Different",
      title1: 'Give AI & Tools',
      title2: 'Excel Superpowers',
      description: 'Transform your spreadsheets into powerful APIs that can be called by applications, AI assistants, or integrated into any workflow. Your Excel expertise becomes instantly accessible.',
      card1: {
        title: 'Predictable Every Time',
        text: 'AI gives different answers each time. But Excel? Excel actually calculates. Every. Single. Time.',
      },
      card2: {
        title: '500+ Excel Functions',
        text: 'VLOOKUP, XLOOKUP, array formulas, financial functions - 500+ functions work exactly as in Excel',
      },
      card3: {
        title: 'Real-Time Calculations',
        text: '50ms response times with intelligent caching and pre-warmed Excel engines',
      },
      card4: {
        title: 'No Files Sent to OpenAI/Anthropic',
        text: 'Your Excel stays on SpreadAPI servers. AI only sees the specific inputs and outputs you define',
      },
      card5: {
        title: 'AI-Ready with MCP',
        text: 'Native Model Context Protocol support for seamless ChatGPT and Claude integration',
      },
      card6: {
        title: 'Zero Learning Curve',
        text: 'Your team keeps using Excel as always. AI gets superpowers. No training needed',
      },
    },
    editableAreas: {
      title1: 'Editable Areas',
      title2: 'Give AI Controlled Access',
      description: 'Define exactly what parts of your spreadsheet AI can access. Grant read-only access to outputs, or let AI modify specific input cells or even formulas within designated areas. You stay in control while AI does the work.',
      feature1Title: 'Granular Permissions',
      feature1Text: 'Control exactly what AI can see and modify. Set permissions for values, formulas, formatting, and structure — keeping your core business logic secure.',
      feature2Title: 'Formula Intelligence',
      feature2Text: 'AI can not only read values but understand and even optimize your Excel formulas. Enable what-if scenarios and let AI experiment within safe boundaries.',
      legendEdit: 'AI can modify values',
      legendRead: 'AI can read only',
      legendProtected: 'No AI access',
    },
    tools: {
      title1: 'Works With',
      title2: 'Every AI Platform',
      title3: 'and Automation Tool',
      description: 'SpreadAPI works with Claude, ChatGPT, and any AI assistant through our MCP server. Connect via REST API, webhooks, or integrate with Zapier, Make, and n8n. Your Excel calculations become accessible everywhere.',
      cta: 'Start Building',
    },
    useCases: {
      subheading: 'Use Cases',
      title1: 'What',
      title2: 'Game-Changing Technology',
      title3: 'Enables',
      case1: {
        title: 'Financial Advisors',
        text: 'Run complex what-if scenarios using actual Excel models. AI analyzes options without errors.',
      },
      case2: {
        title: 'Business Analysts',
        text: 'Automate report generation from spreadsheet data. AI extracts insights from your calculations.',
      },
      case3: {
        title: 'AI Assistants',
        text: 'Optimize spreadsheet formulas automatically. AI suggests improvements while preserving logic.',
      },
      case4: {
        title: 'Sales Teams',
        text: 'Generate accurate quotes instantly. AI uses your pricing models to create perfect proposals.',
      },
      case5: {
        title: 'Operations',
        text: 'Complex resource planning with Excel. AI optimizes allocation using your business rules.',
      },
      case6: {
        title: 'Developers',
        text: 'Skip rebuilding Excel logic in code. Use spreadsheets as calculation engines via API.',
      },
    },
    faq: {
      subheading: 'Developer FAQ',
      title1: 'Technical Questions',
      title2: 'Answered',
      description: 'Deep dive into the technical details. Built by developers, for developers.',
    },
    contact: {
      subheading: 'Contact',
      title1: 'Get Started',
      title2: 'in Minutes',
      text: "Questions about SpreadAPI? We're here to help at",
    },
  },

  de: {
    hero: {
      subheading: 'Headless Spreadsheets für KI & Automatisierung',
      title1: 'Excel wird zur Live-API.',
      title2: 'KI spricht jetzt Tabellenkalkulation',
      description: 'Verwandeln Sie Excel-Tabellen in sichere Echtzeit-Webservices. KI-Assistenten, Automatisierungstools und Entwickler erhalten direkten Zugriff — ohne Halluzinationen oder fehlerhafte Logik.',
      cta: 'Jetzt Excel-API kostenlos erstellen',
    },
    painPoints: {
      title1: 'Warum KI an',
      title2: 'Excel-Berechnungen scheitert',
      subtitle: 'Wir haben KI zu ihren Tabellenkenntnissen befragt — hier ist ihre ehrliche Antwort.',
      card1: {
        title: '„Ich kann Ihre Formeln nicht ausführen"',
        text: 'Ich sehe Ihre Formeln und Excels Ergebnisse, aber ich kann sie nicht berechnen. Ich arbeite mit gespeicherten Werten, nicht mit Live-Berechnungen.',
        author: '- Claude, ChatGPT & Gemini',
      },
      card2: {
        title: '„Ich kenne nur 50-100 Funktionen"',
        text: 'Grundrechenarten? Klar. Aber Excel hat Hunderte mehr — XINTZINSFUSS, RENDITE, Array-Formeln? Da übersehe ich Randfälle.',
        author: '- Claude, ganz ehrlich',
      },
      card3: {
        title: '„Meine Fehler potenzieren sich"',
        text: 'Ein kleiner Fehler in Zelle A1? In Zeile 1000 liege ich völlig daneben. Fehlerfortpflanzung ist mein Albtraum.',
        author: '- Jedes KI-Modell',
      },
      card4: {
        title: '„Ich brauche ewig zum Rechnen"',
        text: '1000+ Formeln? Das sind 2-15 Minuten Abhängigkeitsanalyse. Excel schafft das in 1-2 Sekunden.',
        author: '- Jedes KI-Modell',
      },
      card5: {
        title: '„Komplexe Modelle? 20% Genauigkeit"',
        text: 'Bei 1000+ Formeln liegt meine Trefferquote bei 20-40%. SpreadAPI? Immer 100%.',
        author: '- Claude & ChatGPT',
      },
      card6: {
        title: '„Abhängigkeiten überfordern mich"',
        text: 'Zelle A hängt von B ab, B von C... Ich verbringe die meiste Zeit damit, die Reihenfolge herauszufinden.',
        author: '- Gemini',
      },
      link: 'Mehr über KI-Limitierungen erfahren →',
    },
    solution: {
      title1: 'So befähigen wir KI,',
      title2: 'Excel-Berechnungen zu meistern',
      description: 'Verwandeln Sie Ihre Tabellen in Echtzeit-APIs, die KI aufrufen kann — kein Raten, keine Halluzinationen, nur präzise Ergebnisse durch Ihre Excel-Logik. Ob einfache Berechnungen oder komplexe verschachtelte Formeln — Ihre Excel-Logik wird exakt so ausgeführt, wie Sie sie erstellt haben. Das Ergebnis: sauberes, zuverlässiges JSON, mit dem KI-Assistenten, Entwickler und Automatisierungstools sofort und sicher arbeiten können.',
    },
    feature1: {
      title1: 'KI-Vertriebsassistenten',
      title2: 'erstellen komplexe Excel-Angebote',
      description: 'Ihr KI-Vertriebsassistent erstellt jetzt präzise Angebote mit Ihren echten Excel-Preismodellen. Keine Schätzungen oder Halluzinationen mehr — nur exakte Berechnungen aus Ihren bewährten Tabellen, zugänglich über eine einfache API.',
      point1: '100% präzise Berechnungen',
      point2: 'Ihre Geschäftslogik bleibt geschützt',
      point3: 'Funktioniert mit jedem KI-Assistenten',
      chatCustomer: 'Ich brauche ein Angebot für 500 Einheiten mit Enterprise-Rabatt, Lieferung an 3 Standorte in Bayern',
      chatAI: 'Hier ist Ihr Angebot, berechnet mit unserem Excel-Preismodell:',
      basePrice: 'Grundpreis (500 × 47,99 €):',
      enterpriseDiscount: 'Enterprise-Rabatt (15%):',
      volumeDiscount: 'Mengenrabatt (500+):',
      shipping: 'Versand Bayern (3 Standorte):',
      salesTax: 'MwSt. (19%):',
      totalQuote: 'Gesamtangebot:',
      calcNote: 'Berechnet von Excel in 47ms • 100% genau',
      downloadPdf: 'PDF herunterladen',
    },
    feature2: {
      title1: 'Automatisierungstools',
      title2: 'führen Ihre Excel-Logik aus',
      description: 'Zapier, Make und n8n können jetzt Berechnungen in Ihren Excel-Modellen mit Live-Eingaben auslösen und echte Ergebnisse liefern — sofort. Keine Logik-Neuimplementierung. Kein Formel-Umschreiben. Einfach exaktes Excel-Verhalten als sichere Echtzeit-API.',
      point1: 'Plug & Play mit jedem Workflow-Tool',
      point2: 'Liefert nur sauberes JSON, zeigt nie Formeln',
      point3: 'Bewältigt jede Excel-Komplexität — WENN, XVERWEIS, ARRAY-Funktionen, MwSt.-Logik, Preiskalkulation',
    },
    feature3: {
      title1: '„Bau das Excel mal eben in Code um"',
      title2: ', hieß es.',
      description: 'Eine der häufigsten Entwickler-Anfragen — geschäftskritische Tabellen in Code umwandeln. Aber verschachtelte WENNs, Verweis-Ketten und ständig wechselnde Logik werden schnell zum Wartungsalbtraum. Mit SpreadAPI müssen Entwickler keine Tabellenlogik nachbauen — sie führen sie direkt aus, über eine sichere und versionierte API.',
      point1Title: '100% Formelgenauigkeit',
      point1Text: 'SVERWEIS, SUMMEWENNS, Finanzfunktionen — alles funktioniert exakt wie vorgesehen. Weil es echtes Excel ist, keine JavaScript-Annäherung.',
      point2Title: 'Fachabteilungen behalten die Kontrolle',
      point2Text: 'Wenn sich Formeln ändern, aktualisieren sie das Excel. Ihre API spiegelt die Änderungen sofort wider. Kein Code-Deployment nötig.',
      link: 'Lesen: Warum Excel nachzubauen immer scheitert →',
    },
    differentiators: {
      subheading: 'Was uns unterscheidet',
      title1: 'Geben Sie KI & Tools',
      title2: 'Excel-Superkräfte',
      description: 'Verwandeln Sie Ihre Tabellen in leistungsstarke APIs, die von Anwendungen und KI-Assistenten aufgerufen oder in jeden Workflow integriert werden können. Ihre Excel-Expertise wird sofort zugänglich.',
      card1: {
        title: 'Vorhersagbar. Immer.',
        text: 'KI liefert jedes Mal andere Antworten. Aber Excel? Excel rechnet. Jedes. Einzelne. Mal.',
      },
      card2: {
        title: '500+ Excel-Funktionen',
        text: 'SVERWEIS, XVERWEIS, Array-Formeln, Finanzfunktionen — 500+ Funktionen arbeiten exakt wie in Excel',
      },
      card3: {
        title: 'Echtzeit-Berechnungen',
        text: '50ms Antwortzeiten durch intelligentes Caching und vorgewärmte Excel-Engines',
      },
      card4: {
        title: 'Keine Dateien an OpenAI/Anthropic',
        text: 'Ihr Excel bleibt auf SpreadAPI-Servern. KI sieht nur die Ein- und Ausgaben, die Sie definieren',
      },
      card5: {
        title: 'KI-ready mit MCP',
        text: 'Native Model Context Protocol Unterstützung für nahtlose ChatGPT- und Claude-Integration',
      },
      card6: {
        title: 'Keine Einarbeitung nötig',
        text: 'Ihr Team arbeitet weiter mit Excel wie gewohnt. KI erhält Superkräfte. Ohne Schulung',
      },
    },
    editableAreas: {
      title1: 'Bearbeitbare Bereiche',
      title2: 'geben KI kontrollierten Zugriff',
      description: 'Definieren Sie exakt, auf welche Teile Ihrer Tabelle KI zugreifen darf. Gewähren Sie Nur-Lese-Zugriff auf Ausgaben, oder lassen Sie KI bestimmte Eingabezellen oder sogar Formeln in festgelegten Bereichen ändern. Sie behalten die Kontrolle, während KI die Arbeit erledigt.',
      feature1Title: 'Granulare Berechtigungen',
      feature1Text: 'Kontrollieren Sie genau, was KI sehen und ändern darf. Setzen Sie Berechtigungen für Werte, Formeln, Formatierung und Struktur — Ihre Kerngeschäftslogik bleibt geschützt.',
      feature2Title: 'Formel-Intelligenz',
      feature2Text: 'KI kann nicht nur Werte lesen, sondern auch Ihre Excel-Formeln verstehen und optimieren. Ermöglichen Sie Was-wäre-wenn-Szenarien und lassen Sie KI innerhalb sicherer Grenzen experimentieren.',
      legendEdit: 'KI kann Werte ändern',
      legendRead: 'KI kann nur lesen',
      legendProtected: 'Kein KI-Zugriff',
    },
    tools: {
      title1: 'Funktioniert mit',
      title2: 'jeder KI-Plattform',
      title3: 'und jedem Automatisierungstool',
      description: 'SpreadAPI funktioniert mit Claude, ChatGPT und jedem KI-Assistenten über unseren MCP-Server. Verbinden Sie sich per REST-API, Webhooks oder integrieren Sie Zapier, Make und n8n. Ihre Excel-Berechnungen werden überall zugänglich.',
      cta: 'Jetzt loslegen',
    },
    useCases: {
      subheading: 'Anwendungsfälle',
      title1: 'Was',
      title2: 'bahnbrechende Technologie',
      title3: 'ermöglicht',
      case1: {
        title: 'Finanzberater',
        text: 'Führen Sie komplexe Was-wäre-wenn-Szenarien mit echten Excel-Modellen durch. KI analysiert Optionen fehlerfrei.',
      },
      case2: {
        title: 'Business-Analysten',
        text: 'Automatisieren Sie die Berichtserstellung aus Tabellendaten. KI extrahiert Erkenntnisse aus Ihren Berechnungen.',
      },
      case3: {
        title: 'KI-Assistenten',
        text: 'Optimieren Sie Tabellenformeln automatisch. KI schlägt Verbesserungen vor und bewahrt dabei die Logik.',
      },
      case4: {
        title: 'Vertriebsteams',
        text: 'Erstellen Sie präzise Angebote in Sekunden. KI nutzt Ihre Preismodelle für perfekte Angebote.',
      },
      case5: {
        title: 'Operations',
        text: 'Komplexe Ressourcenplanung mit Excel. KI optimiert die Zuteilung nach Ihren Geschäftsregeln.',
      },
      case6: {
        title: 'Entwickler',
        text: 'Kein Nachbauen von Excel-Logik in Code. Nutzen Sie Tabellen als Berechnungs-Engine via API.',
      },
    },
    faq: {
      subheading: 'Entwickler-FAQ',
      title1: 'Technische Fragen',
      title2: 'beantwortet',
      description: 'Tauchen Sie ein in die technischen Details. Von Entwicklern gebaut, für Entwickler.',
    },
    contact: {
      subheading: 'Kontakt',
      title1: 'In Minuten',
      title2: 'loslegen',
      text: 'Fragen zu SpreadAPI? Wir helfen gerne unter',
    },
  },
} as const;

// Type for homepage translations - use a flexible type with string values
export interface HomepageTranslations {
  hero: {
    subheading: string;
    title1: string;
    title2: string;
    description: string;
    cta: string;
  };
  painPoints: {
    title1: string;
    title2: string;
    subtitle: string;
    card1: { title: string; text: string; author: string };
    card2: { title: string; text: string; author: string };
    card3: { title: string; text: string; author: string };
    card4: { title: string; text: string; author: string };
    card5: { title: string; text: string; author: string };
    card6: { title: string; text: string; author: string };
    link: string;
  };
  solution: {
    title1: string;
    title2: string;
    description: string;
  };
  feature1: {
    title1: string;
    title2: string;
    description: string;
    point1: string;
    point2: string;
    point3: string;
    chatCustomer: string;
    chatAI: string;
    basePrice: string;
    enterpriseDiscount: string;
    volumeDiscount: string;
    shipping: string;
    salesTax: string;
    totalQuote: string;
    calcNote: string;
    downloadPdf: string;
  };
  feature2: {
    title1: string;
    title2: string;
    description: string;
    point1: string;
    point2: string;
    point3: string;
  };
  feature3: {
    title1: string;
    title2: string;
    description: string;
    point1Title: string;
    point1Text: string;
    point2Title: string;
    point2Text: string;
    link: string;
  };
  differentiators: {
    subheading: string;
    title1: string;
    title2: string;
    description: string;
    card1: { title: string; text: string };
    card2: { title: string; text: string };
    card3: { title: string; text: string };
    card4: { title: string; text: string };
    card5: { title: string; text: string };
    card6: { title: string; text: string };
  };
  editableAreas: {
    title1: string;
    title2: string;
    description: string;
    feature1Title: string;
    feature1Text: string;
    feature2Title: string;
    feature2Text: string;
    legendEdit: string;
    legendRead: string;
    legendProtected: string;
  };
  tools: {
    title1: string;
    title2: string;
    title3: string;
    description: string;
    cta: string;
  };
  useCases: {
    subheading: string;
    title1: string;
    title2: string;
    title3: string;
    case1: { title: string; text: string };
    case2: { title: string; text: string };
    case3: { title: string; text: string };
    case4: { title: string; text: string };
    case5: { title: string; text: string };
    case6: { title: string; text: string };
  };
  faq: {
    subheading: string;
    title1: string;
    title2: string;
    description: string;
  };
  contact: {
    subheading: string;
    title1: string;
    title2: string;
    text: string;
  };
}

// Helper function to get homepage translations
export function getHomepageTranslations(locale: SupportedLocale): HomepageTranslations {
  if (locale === 'de') {
    return homepage.de;
  }
  // For fr, es, and en - return English (fr/es translations can be added later)
  return homepage.en;
}

export const marketing = {
  en: {
    // Navigation
    nav: {
      howItWorks: 'How it Works',
      developers: 'Developers',
      automations: 'Automations',
      ai: 'AI',
      blog: 'Blog',
      enterprise: 'Enterprise',
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
      enterprise: 'Enterprise',
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
      enterprise: 'Enterprise',
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
      enterprise: 'Enterprise',
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
    enterprise: string;
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

// =============================================================================
// HOW EXCEL API WORKS PAGE TRANSLATIONS
// =============================================================================

export const howItWorksPage = {
  en: {
    hero: {
      subheading: 'Documentation',
      title: 'How SpreadAPI Works',
      description: 'Transform your spreadsheets into powerful APIs that can be called by applications, AI assistants, or integrated into any workflow. Your Excel expertise becomes instantly accessible.',
    },
    overview: {
      title1: 'Transform Spreadsheets',
      title2: 'Into Intelligent APIs',
      description: 'SpreadAPI bridges the gap between spreadsheet expertise and modern applications. Your complex calculations, business logic, and data models become instantly accessible through clean API endpoints that any developer or AI assistant can use.',
      point1: 'No coding required - use your Excel skills',
      point2: 'Instant API generation from any spreadsheet',
      point3: 'AI-ready with MCP integration',
      imageAlt: 'Upload Your Spreadsheet',
    },
    concepts: {
      subheading: 'Core Concepts',
      title1: 'Three Simple',
      title2: 'Building Blocks',
      input: {
        title: 'Input Parameters',
        description: 'Define which cells receive values when your API is called. Like function arguments, these are the values users provide to trigger calculations.',
        example: 'Cell B2: interest_rate\nCell B3: loan_amount\nCell B4: years',
      },
      output: {
        title: 'Output Parameters',
        description: 'Specify which cells contain the results to return. These calculated values become your API response, delivered as clean JSON data.',
        example: 'Cell E2: monthly_payment\nCell E3: total_interest\nCell E4: total_paid',
      },
      editable: {
        title: 'Editable Areas (AI)',
        description: 'Enable AI assistants to interact with cell ranges directly. Perfect for data analysis, what-if scenarios, and formula generation.',
        example: 'Range A1:D10\nPermissions: Read/Write\nAI can experiment freely',
      },
    },
    workflow: {
      subheading: 'API Workflow',
      title1: 'From',
      title2: 'Spreadsheet to API',
      title3: 'in Minutes',
      step1: {
        title: 'Upload & Configure',
        description: 'Upload your Excel file and select cells for inputs and outputs. No coding needed.',
      },
      step2: {
        title: 'Test & Validate',
        description: 'Try your API with sample values. See results instantly. Refine as needed.',
      },
      step3: {
        title: 'Publish & Share',
        description: 'Get your unique API endpoint. Share with developers or connect AI assistants.',
      },
      step4: {
        title: 'Call & Calculate',
        description: 'Send inputs, receive outputs. Your spreadsheet logic runs in the cloud.',
      },
      flowTitle: 'The API Flow',
      flow1: {
        title: 'API Call Received',
        description: 'Your service receives a request with input values',
      },
      flow2: {
        title: 'Inputs Applied',
        description: 'Values placed into designated cells',
      },
      flow3: {
        title: 'Calculation',
        description: 'Formulas automatically recalculate',
      },
      flow4: {
        title: 'Response Sent',
        description: 'Results returned as JSON',
      },
    },
    example: {
      title1: 'Real Example:',
      title2: 'Loan Calculator',
      description: "See how a simple loan calculator spreadsheet becomes a powerful API. Input parameters feed into Excel's PMT function, and the calculated monthly payment is returned instantly.",
      inputCells: 'Input Cells',
      inputCellsExample: 'B2: loan_amount, B3: interest_rate, B4: years',
      excelFormula: 'Excel Formula',
      requestLabel: 'API Request',
      responseLabel: 'API Response',
    },
    aiIntegration: {
      subheading: 'AI Integration',
      title1: 'Built for',
      title2: 'AI Assistants',
      description: 'SpreadAPI supports MCP (Model Context Protocol), enabling AI assistants like Claude to discover and use your spreadsheet services automatically.',
      feature1: {
        title: 'Auto-Discovery',
        description: 'AI assistants automatically find and understand your available services',
      },
      feature2: {
        title: 'Natural Language',
        description: 'Users can request calculations in plain English - AI handles the rest',
      },
      feature3: {
        title: 'Interactive Analysis',
        description: 'AI can work with editable areas to perform complex data analysis',
      },
      feature4: {
        title: 'Workflow Automation',
        description: 'Combine multiple services into sophisticated AI-powered workflows',
      },
      exampleTitle: 'Example: AI Assistant Interaction',
      exampleUser: 'User:',
      exampleUserText: '"Calculate the monthly payment for a $300,000 loan at 4.5% for 30 years"',
      exampleAssistant: 'Claude:',
      exampleAssistantText: '"I\'ll calculate that for you using the loan calculator service..."',
      exampleCalling: 'Calling: spreadapi_calc_loan_calculator',
      exampleResult: 'Result:',
      exampleResultText: 'Your monthly payment would be $1,520.06',
    },
    bestPractices: {
      title1: 'Best Practices',
      title2: 'for Success',
      practice1: {
        label: 'Clear Naming:',
        text: 'Use descriptive names like "interest_rate" not "input1"',
      },
      practice2: {
        label: 'Validation:',
        text: 'Set min/max values to prevent calculation errors',
      },
      practice3: {
        label: 'Documentation:',
        text: 'Add descriptions to help users understand parameters',
      },
      practice4: {
        label: 'Error Handling:',
        text: 'Use IFERROR() in formulas for robustness',
      },
      practice5: {
        label: 'Test First:',
        text: 'Always test your API before publishing',
      },
      practice6: {
        label: 'AI Context:',
        text: 'Provide clear descriptions for AI understanding',
      },
    },
  },

  de: {
    hero: {
      subheading: 'Dokumentation',
      title: 'So funktioniert SpreadAPI',
      description: 'Verwandeln Sie Ihre Tabellen in leistungsstarke APIs, die von Anwendungen und KI-Assistenten aufgerufen oder in jeden Workflow integriert werden können. Ihre Excel-Expertise wird sofort zugänglich.',
    },
    overview: {
      title1: 'Tabellen werden zu',
      title2: 'intelligenten APIs',
      description: 'SpreadAPI schließt die Lücke zwischen Tabellenkalkulations-Expertise und modernen Anwendungen. Ihre komplexen Berechnungen, Geschäftslogik und Datenmodelle werden über saubere API-Endpunkte sofort zugänglich — für jeden Entwickler oder KI-Assistenten.',
      point1: 'Keine Programmierung nötig — nutzen Sie Ihre Excel-Kenntnisse',
      point2: 'Sofortige API-Generierung aus jeder Tabelle',
      point3: 'KI-bereit mit MCP-Integration',
      imageAlt: 'Laden Sie Ihre Tabelle hoch',
    },
    concepts: {
      subheading: 'Kernkonzepte',
      title1: 'Drei einfache',
      title2: 'Bausteine',
      input: {
        title: 'Eingabeparameter',
        description: 'Definieren Sie, welche Zellen beim API-Aufruf Werte erhalten. Wie Funktionsargumente sind dies die Werte, die Berechnungen auslösen.',
        example: 'Zelle B2: zinssatz\nZelle B3: darlehensbetrag\nZelle B4: laufzeit_jahre',
      },
      output: {
        title: 'Ausgabeparameter',
        description: 'Legen Sie fest, welche Zellen die Ergebnisse enthalten. Diese berechneten Werte werden als sauberes JSON zurückgegeben.',
        example: 'Zelle E2: monatliche_rate\nZelle E3: gesamtzinsen\nZelle E4: gesamtbetrag',
      },
      editable: {
        title: 'Bearbeitbare Bereiche (KI)',
        description: 'Ermöglichen Sie KI-Assistenten den direkten Zugriff auf Zellbereiche. Perfekt für Datenanalyse, Was-wäre-wenn-Szenarien und Formelgenerierung.',
        example: 'Bereich A1:D10\nBerechtigungen: Lesen/Schreiben\nKI kann frei experimentieren',
      },
    },
    workflow: {
      subheading: 'API-Workflow',
      title1: 'Von der',
      title2: 'Tabelle zur API',
      title3: 'in Minuten',
      step1: {
        title: 'Hochladen & Konfigurieren',
        description: 'Laden Sie Ihre Excel-Datei hoch und wählen Sie Ein- und Ausgabezellen. Keine Programmierung nötig.',
      },
      step2: {
        title: 'Testen & Validieren',
        description: 'Testen Sie Ihre API mit Beispielwerten. Sehen Sie Ergebnisse sofort. Verfeinern Sie nach Bedarf.',
      },
      step3: {
        title: 'Veröffentlichen & Teilen',
        description: 'Erhalten Sie Ihren API-Endpunkt. Teilen Sie ihn mit Entwicklern oder verbinden Sie KI-Assistenten.',
      },
      step4: {
        title: 'Aufrufen & Berechnen',
        description: 'Senden Sie Eingaben, erhalten Sie Ausgaben. Ihre Tabellenlogik läuft in der Cloud.',
      },
      flowTitle: 'Der API-Ablauf',
      flow1: {
        title: 'API-Aufruf empfangen',
        description: 'Ihr Service erhält eine Anfrage mit Eingabewerten',
      },
      flow2: {
        title: 'Eingaben angewendet',
        description: 'Werte werden in die vorgesehenen Zellen eingetragen',
      },
      flow3: {
        title: 'Berechnung',
        description: 'Formeln werden automatisch neu berechnet',
      },
      flow4: {
        title: 'Antwort gesendet',
        description: 'Ergebnisse werden als JSON zurückgegeben',
      },
    },
    example: {
      title1: 'Praxisbeispiel:',
      title2: 'Darlehensrechner',
      description: 'Sehen Sie, wie eine einfache Darlehensrechner-Tabelle zu einer leistungsstarken API wird. Eingabeparameter fließen in Excels RMZ-Funktion, und die berechnete Monatsrate wird sofort zurückgegeben.',
      inputCells: 'Eingabezellen',
      inputCellsExample: 'B2: darlehensbetrag, B3: zinssatz, B4: laufzeit_jahre',
      excelFormula: 'Excel-Formel',
      requestLabel: 'API-Anfrage',
      responseLabel: 'API-Antwort',
    },
    aiIntegration: {
      subheading: 'KI-Integration',
      title1: 'Entwickelt für',
      title2: 'KI-Assistenten',
      description: 'SpreadAPI unterstützt MCP (Model Context Protocol) und ermöglicht KI-Assistenten wie Claude, Ihre Tabellendienste automatisch zu erkennen und zu nutzen.',
      feature1: {
        title: 'Automatische Erkennung',
        description: 'KI-Assistenten finden und verstehen automatisch Ihre verfügbaren Dienste',
      },
      feature2: {
        title: 'Natürliche Sprache',
        description: 'Anfragen einfach in natürlicher Sprache stellen — die KI erledigt den Rest',
      },
      feature3: {
        title: 'Interaktive Analyse',
        description: 'KI kann mit bearbeitbaren Bereichen komplexe Datenanalysen durchführen',
      },
      feature4: {
        title: 'Workflow-Automatisierung',
        description: 'Kombinieren Sie mehrere Dienste zu ausgefeilten KI-gestützten Workflows',
      },
      exampleTitle: 'Beispiel: KI-Assistenten-Interaktion',
      exampleUser: 'Nutzer:',
      exampleUserText: '„Berechne die Monatsrate für ein 300.000€-Darlehen bei 4,5% Zinsen über 30 Jahre"',
      exampleAssistant: 'Claude:',
      exampleAssistantText: '„Ich berechne das für Sie mit dem Darlehensrechner-Service..."',
      exampleCalling: 'Aufruf: spreadapi_calc_darlehensrechner',
      exampleResult: 'Ergebnis:',
      exampleResultText: 'Ihre Monatsrate beträgt 1.520,06 €',
    },
    bestPractices: {
      title1: 'Best Practices',
      title2: 'für Ihren Erfolg',
      practice1: {
        label: 'Eindeutige Benennung:',
        text: 'Verwenden Sie aussagekräftige Namen wie „zinssatz" statt „eingabe1"',
      },
      practice2: {
        label: 'Validierung:',
        text: 'Setzen Sie Min/Max-Werte, um Berechnungsfehler zu vermeiden',
      },
      practice3: {
        label: 'Dokumentation:',
        text: 'Fügen Sie Beschreibungen hinzu, damit Nutzer die Parameter verstehen',
      },
      practice4: {
        label: 'Fehlerbehandlung:',
        text: 'Verwenden Sie WENNFEHLER() in Formeln für mehr Robustheit',
      },
      practice5: {
        label: 'Erst testen:',
        text: 'Testen Sie Ihre API immer vor der Veröffentlichung',
      },
      practice6: {
        label: 'KI-Kontext:',
        text: 'Geben Sie klare Beschreibungen für das KI-Verständnis an',
      },
    },
  },
} as const;

// Type for How It Works page translations
export interface HowItWorksTranslations {
  hero: {
    subheading: string;
    title: string;
    description: string;
  };
  overview: {
    title1: string;
    title2: string;
    description: string;
    point1: string;
    point2: string;
    point3: string;
    imageAlt: string;
  };
  concepts: {
    subheading: string;
    title1: string;
    title2: string;
    input: { title: string; description: string; example: string };
    output: { title: string; description: string; example: string };
    editable: { title: string; description: string; example: string };
  };
  workflow: {
    subheading: string;
    title1: string;
    title2: string;
    title3: string;
    step1: { title: string; description: string };
    step2: { title: string; description: string };
    step3: { title: string; description: string };
    step4: { title: string; description: string };
    flowTitle: string;
    flow1: { title: string; description: string };
    flow2: { title: string; description: string };
    flow3: { title: string; description: string };
    flow4: { title: string; description: string };
  };
  example: {
    title1: string;
    title2: string;
    description: string;
    inputCells: string;
    inputCellsExample: string;
    excelFormula: string;
    requestLabel: string;
    responseLabel: string;
  };
  aiIntegration: {
    subheading: string;
    title1: string;
    title2: string;
    description: string;
    feature1: { title: string; description: string };
    feature2: { title: string; description: string };
    feature3: { title: string; description: string };
    feature4: { title: string; description: string };
    exampleTitle: string;
    exampleUser: string;
    exampleUserText: string;
    exampleAssistant: string;
    exampleAssistantText: string;
    exampleCalling: string;
    exampleResult: string;
    exampleResultText: string;
  };
  bestPractices: {
    title1: string;
    title2: string;
    practice1: { label: string; text: string };
    practice2: { label: string; text: string };
    practice3: { label: string; text: string };
    practice4: { label: string; text: string };
    practice5: { label: string; text: string };
    practice6: { label: string; text: string };
  };
}

// Helper function to get How It Works translations
export function getHowItWorksTranslations(locale: SupportedLocale): HowItWorksTranslations {
  if (locale === 'de') {
    return howItWorksPage.de;
  }
  return howItWorksPage.en;
}

// =============================================================================
// STOP REWRITING EXCEL IN CODE PAGE TRANSLATIONS
// =============================================================================

export const stopRewritingPage = {
  en: {
    hero: {
      subheading: 'For Developers',
      title1: 'Stop Rewriting',
      title2: 'Excel in Code',
      description: 'Your spreadsheet already works. Turn it into an API in minutes — not months. Delete thousands of lines of formula translation code. Ship faster with 100% accuracy.',
      cta: 'Try It Free',
      ctaSecondary: 'See How It Works',
    },
    scenario: {
      title1: '"Just convert this Excel to code"',
      title2: ', they said.',
      description1: "We've all been there. Business hands you a spreadsheet — their pricing model, financial calculator, or technical configurator. Years of refined logic in those cells.",
      description2: '"Can you just put this on the website?" they ask. It sounds simple. Three months later, you\'re still debugging why your JavaScript doesn\'t match Excel.',
      pmTitle: 'Product Manager',
      pmText: '"It\'s just an Excel file with some formulas. Should be quick, right?"',
      devTitle: 'Developer (3 months later)',
      devText: '"The numbers are off by 0.3%. Finance says it\'s wrong. I\'ve been debugging VLOOKUP edge cases for two weeks..."',
    },
    complexity: {
      subheading: 'The Hidden Complexity',
      title1: 'Why Excel-to-Code Is',
      title2: 'Harder Than It Looks',
      card1: {
        title: 'Formula Translation',
        description: 'A single Excel formula becomes dozens of lines of code. VLOOKUP alone requires implementing search logic, error handling, and 1-based indexing.',
        excelLabel: 'Excel:',
        jsLabel: 'JavaScript:',
        jsCode: '// 50+ lines of code...',
      },
      card2: {
        title: 'Hidden Dependencies',
        description: 'That formula references other sheets, named ranges, and external data sources. Your code needs to recreate an entire dependency graph.',
        list: ['Cross-sheet references', 'Named ranges', 'Conditional formatting logic', 'Data validation rules'],
      },
      card3: {
        title: 'Excel-Specific Functions',
        description: 'WORKDAY, PMT, XIRR, SUMPRODUCT... Excel has 500+ functions. Each needs a perfect JavaScript implementation.',
        note: '→ Weekend logic + holiday handling + date system matching',
      },
      card4: {
        title: 'The 1000 Formulas Problem',
        description: 'Real business models have hundreds or thousands of interconnected formulas. Translating them all while maintaining the calculation order? Nightmare.',
        example: 'Real example: A pricing configurator with material costs, volume discounts, regional adjustments, shipping, tax rules, and margin calculations.',
      },
      card5: {
        title: 'Edge Cases & Rounding',
        description: "Excel handles floating point math, date boundaries, and empty cells in specific ways. Your code will be \"close\" but never exactly right.",
        warning: '"The numbers are off by 0.01% — Finance says it\'s wrong."',
      },
      card6: {
        title: 'The Sync Problem',
        description: 'Business updates the Excel file every quarter. Now your code is outdated. Re-translate? Every. Single. Time.',
        cycle: 'The cycle: Excel changes → Code breaks → Developer fixes → Repeat forever',
      },
    },
    cost: {
      subheading: 'The Real Cost',
      title1: 'What Excel-to-Code',
      title2: 'Actually Costs',
      stat1: { value: '2-6', label: 'Months', description: 'Initial implementation time' },
      stat2: { value: '70-95%', label: 'Accuracy', description: 'Edge cases always missed' },
      stat3: { value: '∞', label: 'Maintenance', description: 'Every Excel change = more work' },
    },
    solution: {
      title1: 'What If You',
      title2: "Didn't Have To?",
      description1: 'The spreadsheet already works. The formulas are tested. The business trusts the numbers.',
      description2: 'So why rewrite it?',
      description3: 'With SpreadAPI, Excel is your calculation engine. Upload your spreadsheet, define inputs and outputs, and get an API. The original formulas run — not a translation.',
      badge1: '100% Accuracy',
      badge2: 'Minutes, Not Months',
      badge3: 'Zero Maintenance',
      beforeLabel: 'BEFORE: Translation Nightmare',
      afterLabel: 'AFTER: 5 Lines, Perfect Accuracy',
    },
    separation: {
      subheading: 'Clean Architecture',
      title1: 'Everyone Does',
      title2: "What They're Best At",
      description: "The Excel expert doesn't need to learn JavaScript. The developer doesn't need to understand the financial model. Business can update rules without a deployment.",
      role1: {
        title: 'Excel Expert',
        description: 'Builds and maintains the calculation model in familiar Excel',
        note: 'Updates pricing? Just save the spreadsheet. Done.',
      },
      role2: {
        title: 'Frontend Developer',
        description: 'Consumes the API, builds the UI, focuses on user experience',
        note: 'No need to understand complex financial formulas.',
      },
      role3: {
        title: 'Business Team',
        description: 'Updates rules anytime — no tickets, no deployments, no waiting',
        note: 'Change pricing in Excel → Live instantly.',
      },
    },
    benefits: {
      subheading: 'Who Benefits',
      title1: 'Built for',
      title2: 'Everyone',
      developers: {
        title: 'For Developers',
        point1: 'Delete thousands of lines of formula translation code',
        point2: 'Stop debugging "why doesn\'t this match Excel?"',
        point3: 'Ship faster — hours instead of months',
        point4: 'Focus on the app, not formula translation',
      },
      nocode: {
        title: 'For No-Code Builders',
        point1: 'Complex calculations without writing code',
        point2: 'Connect to Webflow, Bubble, Zapier via simple API',
        point3: 'Build pricing calculators, configurators, quote tools',
        point4: 'No developer needed for the calculation logic',
      },
    },
    useCases: {
      subheading: 'Real Examples',
      title1: 'What People',
      title2: 'Build With This',
      cases: [
        { icon: '💰', title: 'Pricing Engines', description: 'Complex pricing with volume discounts, tiers, regions' },
        { icon: '🏠', title: 'Mortgage Calculators', description: 'Loan payments, amortization, what-if scenarios' },
        { icon: '⚙️', title: 'Technical Configurators', description: 'Product configs with dependencies and constraints' },
        { icon: '📊', title: 'Financial Models', description: 'NPV, IRR, cash flow projections' },
        { icon: '🚚', title: 'Shipping Calculators', description: 'Weight, zone, carrier logic combined' },
        { icon: '💼', title: 'Commission Calculators', description: 'Complex sales commission with tiers and bonuses' },
        { icon: '📐', title: 'Engineering Calcs', description: 'Material strength, load calculations, safety factors' },
        { icon: '🏷️', title: 'Quote Generators', description: 'Multi-line quotes with all business rules' },
      ],
    },
    faq: {
      title1: 'Common',
      title2: 'Questions',
      questions: [
        {
          q: '"What about performance?"',
          a: 'First call: 100-200ms. Cached calls: <20ms. Accurate results are worth the minimal latency — and it\'s still faster than waiting 3 months for a buggy reimplementation.',
        },
        {
          q: '"What if the Excel has errors?"',
          a: "Your reimplementation would have the same errors — plus translation bugs. At least with SpreadAPI, the numbers match what business expects. Fix once in Excel, fixed everywhere.",
        },
        {
          q: '"What about version control?"',
          a: 'SpreadAPI versions every upload. You can switch between versions via API parameter. Full audit trail of every change.',
        },
        {
          q: '"Can the CFO audit it?"',
          a: "Yes! They can audit the actual Excel file being used — not thousands of lines of JavaScript they don't understand. It's their spreadsheet, running live.",
        },
      ],
    },
    cta: {
      title: 'Ready to Stop Rewriting Excel?',
      description: 'Upload your spreadsheet. Get an API. Delete thousands of lines of code. It really is that simple.',
      button: 'Try It Free',
      buttonSecondary: 'See How It Works',
    },
  },

  de: {
    hero: {
      subheading: 'Für Entwickler',
      title1: 'Schluss mit Excel',
      title2: 'nachprogrammieren',
      description: 'Ihre Tabelle funktioniert bereits. Machen Sie sie zur API in Minuten — nicht Monaten. Löschen Sie tausende Zeilen Formel-Code. Schneller liefern mit 100% Genauigkeit.',
      cta: 'Kostenlos testen',
      ctaSecondary: 'So funktioniert\'s',
    },
    scenario: {
      title1: '„Bau das Excel mal eben in Code um"',
      title2: ', hieß es.',
      description1: 'Kennen wir alle. Die Fachabteilung übergibt eine Tabelle — ihr Preismodell, Finanzrechner oder technischer Konfigurator. Jahre verfeinerte Logik in diesen Zellen.',
      description2: '„Kannst du das einfach auf die Website stellen?" fragen sie. Klingt simpel. Drei Monate später debuggst du immer noch, warum dein JavaScript nicht mit Excel übereinstimmt.',
      pmTitle: 'Produktmanager',
      pmText: '„Das ist nur eine Excel-Datei mit ein paar Formeln. Sollte schnell gehen, oder?"',
      devTitle: 'Entwickler (3 Monate später)',
      devText: '„Die Zahlen weichen um 0,3% ab. Controlling sagt, das ist falsch. Ich debugge seit zwei Wochen SVERWEIS-Randfälle..."',
    },
    complexity: {
      subheading: 'Die versteckte Komplexität',
      title1: 'Warum Excel in Code umwandeln',
      title2: 'schwerer ist als gedacht',
      card1: {
        title: 'Formelübersetzung',
        description: 'Eine einzelne Excel-Formel wird zu Dutzenden Zeilen Code. SVERWEIS allein erfordert Suchlogik, Fehlerbehandlung und 1-basierte Indizierung.',
        excelLabel: 'Excel:',
        jsLabel: 'JavaScript:',
        jsCode: '// 50+ Zeilen Code...',
      },
      card2: {
        title: 'Versteckte Abhängigkeiten',
        description: 'Diese Formel referenziert andere Blätter, benannte Bereiche und externe Datenquellen. Ihr Code muss einen kompletten Abhängigkeitsgraph nachbilden.',
        list: ['Blattübergreifende Referenzen', 'Benannte Bereiche', 'Bedingte Formatierungslogik', 'Datenvalidierungsregeln'],
      },
      card3: {
        title: 'Excel-spezifische Funktionen',
        description: 'ARBEITSTAG, RMZ, XINTZINSFUSS, SUMMENPRODUKT... Excel hat über 500 Funktionen. Jede braucht eine perfekte JavaScript-Implementierung.',
        note: '→ Wochenendlogik + Feiertagsbehandlung + Datumssystemabgleich',
      },
      card4: {
        title: 'Das 1000-Formeln-Problem',
        description: 'Echte Geschäftsmodelle haben Hunderte oder Tausende verknüpfte Formeln. Alle übersetzen und dabei die Berechnungsreihenfolge wahren? Ein Albtraum.',
        example: 'Praxisbeispiel: Ein Preiskonfigurator mit Materialkosten, Mengenrabatten, regionalen Anpassungen, Versand, Steuerregeln und Margenberechnungen.',
      },
      card5: {
        title: 'Randfälle & Rundung',
        description: 'Excel behandelt Fließkomma-Mathematik, Datumsgrenzen und leere Zellen auf spezifische Weise. Ihr Code ist „nah dran", aber nie exakt richtig.',
        warning: '„Die Zahlen weichen um 0,01% ab — Controlling sagt, das ist falsch."',
      },
      card6: {
        title: 'Das Sync-Problem',
        description: 'Die Fachabteilung aktualisiert die Excel-Datei jedes Quartal. Jetzt ist Ihr Code veraltet. Neu übersetzen? Jedes. Einzelne. Mal.',
        cycle: 'Der Kreislauf: Excel ändert sich → Code bricht → Entwickler fixt → Für immer wiederholen',
      },
    },
    cost: {
      subheading: 'Die echten Kosten',
      title1: 'Was Excel nachprogrammieren',
      title2: 'wirklich kostet',
      stat1: { value: '2-6', label: 'Monate', description: 'Initiale Implementierungszeit' },
      stat2: { value: '70-95%', label: 'Genauigkeit', description: 'Randfälle werden immer übersehen' },
      stat3: { value: '∞', label: 'Wartung', description: 'Jede Excel-Änderung = mehr Arbeit' },
    },
    solution: {
      title1: 'Was wäre, wenn Sie',
      title2: 'das nicht müssten?',
      description1: 'Die Tabelle funktioniert bereits. Die Formeln sind getestet. Die Fachabteilung vertraut den Zahlen.',
      description2: 'Warum also neu schreiben?',
      description3: 'Mit SpreadAPI ist Excel Ihre Berechnungs-Engine. Tabelle hochladen, Ein- und Ausgaben definieren, API erhalten. Die Originalformeln laufen — keine Übersetzung nötig.',
      badge1: '100% Genauigkeit',
      badge2: 'Minuten statt Monate',
      badge3: 'Null Wartung',
      beforeLabel: 'VORHER: Übersetzungs-Albtraum',
      afterLabel: 'NACHHER: 5 Zeilen, perfekte Genauigkeit',
    },
    separation: {
      subheading: 'Saubere Architektur',
      title1: 'Jeder macht das,',
      title2: 'was er am besten kann',
      description: 'Der Excel-Experte muss kein JavaScript lernen. Der Entwickler muss das Finanzmodell nicht verstehen. Die Fachabteilung kann Regeln ohne Deployment ändern.',
      role1: {
        title: 'Excel-Experte',
        description: 'Erstellt und pflegt das Berechnungsmodell im vertrauten Excel',
        note: 'Preise aktualisieren? Einfach die Tabelle speichern. Fertig.',
      },
      role2: {
        title: 'Frontend-Entwickler',
        description: 'Nutzt die API, baut die UI, fokussiert auf User Experience',
        note: 'Muss keine komplexen Finanzformeln verstehen.',
      },
      role3: {
        title: 'Fachabteilung',
        description: 'Aktualisiert Regeln jederzeit — keine Tickets, kein Deployment, kein Warten',
        note: 'Preis in Excel ändern → Sofort live.',
      },
    },
    benefits: {
      subheading: 'Wer profitiert',
      title1: 'Gemacht für',
      title2: 'alle',
      developers: {
        title: 'Für Entwickler',
        point1: 'Tausende Zeilen Formel-Code löschen',
        point2: 'Schluss mit „Warum stimmt das nicht mit Excel überein?"',
        point3: 'Schneller liefern — Stunden statt Monate',
        point4: 'Fokus auf die App, nicht auf Formelübersetzung',
      },
      nocode: {
        title: 'Für No-Code-Builder',
        point1: 'Komplexe Berechnungen ohne eine Zeile Code',
        point2: 'Anbindung an Webflow, Bubble, Zapier per API',
        point3: 'Preisrechner, Konfiguratoren, Angebotstools bauen',
        point4: 'Kein Entwickler für die Berechnungslogik nötig',
      },
    },
    useCases: {
      subheading: 'Echte Beispiele',
      title1: 'Was damit',
      title2: 'gebaut wird',
      cases: [
        { icon: '💰', title: 'Preis-Engines', description: 'Komplexe Preisgestaltung mit Mengenrabatten, Staffeln, Regionen' },
        { icon: '🏠', title: 'Hypothekenrechner', description: 'Darlehensraten, Tilgungspläne, Was-wäre-wenn-Szenarien' },
        { icon: '⚙️', title: 'Technische Konfiguratoren', description: 'Produktkonfigurationen mit Abhängigkeiten und Einschränkungen' },
        { icon: '📊', title: 'Finanzmodelle', description: 'Kapitalwert, interner Zinsfuß, Cashflow-Prognosen' },
        { icon: '🚚', title: 'Versandrechner', description: 'Gewicht, Zonen, Spediteur-Logik kombiniert' },
        { icon: '💼', title: 'Provisionsrechner', description: 'Komplexe Vertriebsprovisionen mit Staffeln und Boni' },
        { icon: '📐', title: 'Ingenieurberechnungen', description: 'Materialfestigkeit, Lastberechnungen, Sicherheitsfaktoren' },
        { icon: '🏷️', title: 'Angebotsgeneratoren', description: 'Mehrzeilige Angebote mit allen Geschäftsregeln' },
      ],
    },
    faq: {
      title1: 'Häufige',
      title2: 'Fragen',
      questions: [
        {
          q: '„Was ist mit der Performance?"',
          a: 'Erster Aufruf: 100-200ms. Gecachte Aufrufe: <20ms. Korrekte Ergebnisse sind die minimale Latenz wert — und es ist immer noch schneller als 3 Monate auf eine fehlerhafte Neuimplementierung zu warten.',
        },
        {
          q: '„Was wenn die Excel Fehler hat?"',
          a: 'Ihre Neuimplementierung hätte dieselben Fehler — plus Übersetzungsfehler. Mit SpreadAPI stimmen die Zahlen wenigstens mit dem überein, was die Fachabteilung erwartet. Einmal in Excel fixen, überall gefixt.',
        },
        {
          q: '„Was ist mit Versionskontrolle?"',
          a: 'SpreadAPI versioniert jeden Upload. Sie können per API-Parameter zwischen Versionen wechseln. Vollständiger Audit-Trail aller Änderungen.',
        },
        {
          q: '„Kann der CFO das prüfen?"',
          a: 'Ja! Er kann die tatsächlich verwendete Excel-Datei prüfen — nicht tausende Zeilen JavaScript, die er nicht versteht. Es ist seine Tabelle, live im Einsatz.',
        },
      ],
    },
    cta: {
      title: 'Bereit, Schluss mit Excel nachprogrammieren zu machen?',
      description: 'Tabelle hochladen. API erhalten. Tausende Zeilen Code löschen. So einfach ist es wirklich.',
      button: 'Kostenlos testen',
      buttonSecondary: 'So funktioniert\'s',
    },
  },
} as const;

// Type for Stop Rewriting page translations
export interface StopRewritingTranslations {
  hero: {
    subheading: string;
    title1: string;
    title2: string;
    description: string;
    cta: string;
    ctaSecondary: string;
  };
  scenario: {
    title1: string;
    title2: string;
    description1: string;
    description2: string;
    pmTitle: string;
    pmText: string;
    devTitle: string;
    devText: string;
  };
  complexity: {
    subheading: string;
    title1: string;
    title2: string;
    card1: { title: string; description: string; excelLabel: string; jsLabel: string; jsCode: string };
    card2: { title: string; description: string; list: readonly string[] };
    card3: { title: string; description: string; note: string };
    card4: { title: string; description: string; example: string };
    card5: { title: string; description: string; warning: string };
    card6: { title: string; description: string; cycle: string };
  };
  cost: {
    subheading: string;
    title1: string;
    title2: string;
    stat1: { value: string; label: string; description: string };
    stat2: { value: string; label: string; description: string };
    stat3: { value: string; label: string; description: string };
  };
  solution: {
    title1: string;
    title2: string;
    description1: string;
    description2: string;
    description3: string;
    badge1: string;
    badge2: string;
    badge3: string;
    beforeLabel: string;
    afterLabel: string;
  };
  separation: {
    subheading: string;
    title1: string;
    title2: string;
    description: string;
    role1: { title: string; description: string; note: string };
    role2: { title: string; description: string; note: string };
    role3: { title: string; description: string; note: string };
  };
  benefits: {
    subheading: string;
    title1: string;
    title2: string;
    developers: { title: string; point1: string; point2: string; point3: string; point4: string };
    nocode: { title: string; point1: string; point2: string; point3: string; point4: string };
  };
  useCases: {
    subheading: string;
    title1: string;
    title2: string;
    cases: readonly { icon: string; title: string; description: string }[];
  };
  faq: {
    title1: string;
    title2: string;
    questions: readonly { q: string; a: string }[];
  };
  cta: {
    title: string;
    description: string;
    button: string;
    buttonSecondary: string;
  };
}

// Helper function to get Stop Rewriting translations
export function getStopRewritingTranslations(locale: SupportedLocale): StopRewritingTranslations {
  if (locale === 'de') {
    return stopRewritingPage.de;
  }
  return stopRewritingPage.en;
}

// =============================================================================
// EXCEL AI INTEGRATION PAGE TRANSLATIONS
// =============================================================================

export const aiIntegrationPage = {
  en: {
    hero: {
      subheading: 'Excel meets AI',
      title1: 'Give AI Assistants',
      title2: 'Excel Superpowers',
      description: "Imagine ChatGPT creating perfect quotes using your pricing spreadsheet. Or Claude analyzing scenarios with your financial models. SpreadAPI makes it happen—in minutes, not months.",
    },
    gap: {
      title1: 'The AI-Excel Gap',
      title2: 'Everyone Faces',
      description: "Your Excel files contain years of refined business logic. Complex pricing rules, financial models, resource calculations—all perfected over time. But when AI tries to help, it either:",
      point1: 'Hallucinates numbers instead of calculating correctly',
      point2: 'Requires manual copy-paste of data back and forth',
      point3: "Can't access your spreadsheet formulas at all",
      withoutLabel: 'Without SpreadAPI:',
      withoutText: '"Based on my estimates, the price would be around $4,500..."',
      withoutError: '❌ Wrong by $823',
      withLabel: 'With SpreadAPI:',
      withText: '"Using your pricing model, the exact price is $3,677.42"',
      withSuccess: '✓ 100% accurate, includes all discounts',
    },
    setup: {
      subheading: 'Simple Setup',
      title1: 'From Excel to AI-Ready in',
      title2: '3 Steps',
      step1: {
        title: 'Upload Your Excel',
        description: 'Simply drag and drop your spreadsheet. SpreadAPI automatically identifies your formulas and calculations.',
      },
      step2: {
        title: 'Define Parameters',
        description: "Point and click to select input cells and output ranges. No coding required—it's as easy as using Excel.",
      },
      step3: {
        title: 'Connect to AI',
        description: 'Add our MCP server to Claude or use our API with ChatGPT. Your AI assistant now has Excel superpowers!',
      },
    },
    possibilities: {
      subheading: 'Possibilities',
      title1: 'What Becomes',
      title2: 'Possible',
      case1: {
        title: 'Customer Support That Never Gets Prices Wrong',
        intro: 'Your support chatbot can now:',
        points: ['Generate accurate quotes using your exact pricing rules', 'Calculate shipping costs based on your logistics model', 'Apply the right discounts for each customer tier'],
        quote: '"Our AI support agent now handles 80% of quote requests—with 100% accuracy"',
      },
      case2: {
        title: 'Sales Teams Creating Perfect Proposals',
        intro: 'Empower your sales team to:',
        points: ['Generate complex multi-product quotes instantly', 'Run what-if scenarios during client calls', 'Always use the latest pricing and promotions'],
        quote: '"Sales cycles reduced by 40% with instant, accurate pricing"',
      },
      case3: {
        title: 'Developers Building Smarter Applications',
        intro: 'Let GitHub Copilot and AI coding assistants:',
        points: ['Use Excel calculations directly in code', 'Generate test cases from spreadsheet logic', 'Build UIs that match Excel workflows perfectly'],
        quote: '"No more reimplementing Excel formulas—just use the real thing"',
      },
      case4: {
        title: 'Financial Analysis at AI Speed',
        intro: 'Enable Claude or ChatGPT to:',
        points: ['Run complex financial models instantly', 'Generate investment scenarios with real calculations', 'Create reports using your exact methodologies'],
        quote: '"AI can now explain AND calculate our financial projections"',
      },
    },
    platforms: {
      subheading: 'Universal Compatibility',
      title1: 'Works With',
      title2: 'Every AI Platform',
      claude: { title: 'Claude Desktop', description: 'MCP protocol built-in' },
      chatgpt: { title: 'ChatGPT', description: 'Custom GPT ready' },
      any: { title: 'Any Platform', description: 'REST API & SDKs' },
      demo: {
        title: 'See It In Action',
        claudeTitle: 'Claude Desktop + Excel = Magic',
        featuresTitle: 'Real Excel Calculations',
        feature1: { title: '100% Accurate', description: 'Uses your actual Excel formulas' },
        feature2: { title: 'Always Current', description: 'Updates when you change Excel' },
        feature3: { title: 'Fully Secure', description: 'AI only sees results, not formulas' },
      },
    },
    quickSetup: {
      subheading: 'Quick Setup',
      title1: 'Connect Your AI Assistant in',
      title2: '3 Minutes',
      description: 'Choose your AI platform and follow the simple setup guide',
      chatgpt: {
        title: 'ChatGPT',
        description: 'Easiest setup with OAuth - no configuration files needed',
        recommended: 'RECOMMENDED',
        step1: {
          title: 'Open ChatGPT Settings',
          description: 'In ChatGPT, click your profile icon and navigate to Settings → Apps and Connectors (or "Apps und Konnektoren" in German).',
        },
        step2: {
          title: 'Add SpreadAPI as MCP Server',
          description: 'Click Create to add a new connector. In the "MCP Server URL" field, paste your service URL:',
          note: 'Select OAuth as authentication method, then click Create.',
        },
        step3: {
          title: 'Start Using Your Excel Calculations!',
          description: 'ChatGPT will initiate the OAuth flow. Once connected, your service appears in the connectors list. Try these prompts:',
          prompt1: '"What parameters does this service need?"',
          prompt2: '"Calculate the quote for 500 units with enterprise discount"',
        },
      },
      claude: {
        title: 'Claude Desktop',
        description: 'Native MCP support with automatic NPX bridge',
        step1: {
          title: 'Open Claude Desktop Settings',
          description: 'Click Claude → Settings (Mac) or File → Settings (Windows), then select the Developer tab and click Edit Config.',
        },
        step2: {
          title: 'Add the SpreadAPI Configuration',
          description: 'Add this to your claude_desktop_config.json file:',
          note: 'Replace YOUR_SERVICE_ID with your actual service ID and your_token_here with your API token from SpreadAPI.',
        },
        step3: {
          title: 'Restart and Start Using!',
          description: 'Restart Claude Desktop. The MCP bridge downloads automatically via NPX. Your service will appear in the MCP menu. Try these prompts:',
          prompt1: '"What parameters does this service need?"',
          prompt2: '"Compare 3 pricing scenarios using this calculator"',
        },
      },
      other: {
        title: 'Other AI Platforms & Custom Apps',
        description: 'REST API, SDKs, and MCP protocol for any integration',
        intro: 'SpreadAPI works with any platform that supports REST APIs or the Model Context Protocol (MCP). Perfect for:',
        items: ['Custom GPTs', 'GitHub Copilot', 'Cursor IDE', 'Zapier / Make', 'n8n Workflows', 'Your own apps'],
        seeHow: 'See How It Works →',
        getStarted: 'Get Started Free',
      },
      findUrl: {
        title: 'Where to Find Your Service URL & Token',
        steps: ['Sign up for SpreadAPI and upload your Excel file', 'Define your inputs and outputs (point-and-click, no coding)', 'Publish your service', 'Go to Agents → MCP Integration to find your service URL and generate tokens'],
      },
      help: {
        title: 'Need Help?',
        chatgptIssue: "ChatGPT connector not working? Make sure you completed the OAuth flow and your service is published",
        claudeIssue: 'Claude not finding tools? Restart Claude Desktop after adding the config',
        authIssue: 'Authentication error? Double-check your token is copied correctly',
        contact: 'Still stuck? Email us at',
      },
    },
    contact: {
      subheading: 'Questions?',
      title1: "We're Here to",
      title2: 'Help',
      text: "Whether you're exploring possibilities or ready to implement, we're here to help at",
    },
  },

  de: {
    hero: {
      subheading: 'Excel trifft KI',
      title1: 'Geben Sie KI-Assistenten',
      title2: 'Excel-Superkräfte',
      description: 'Stellen Sie sich vor: ChatGPT erstellt perfekte Angebote mit Ihrer Preistabelle. Oder Claude analysiert Szenarien mit Ihren Finanzmodellen. SpreadAPI macht es möglich — in Minuten, nicht Monaten.',
    },
    gap: {
      title1: 'Die KI-Excel-Lücke,',
      title2: 'die jeder kennt',
      description: 'Ihre Excel-Dateien enthalten jahrelang verfeinerte Geschäftslogik. Komplexe Preisregeln, Finanzmodelle, Ressourcenberechnungen — über Jahre perfektioniert. Aber wenn KI helfen soll:',
      point1: 'Halluziniert Zahlen statt korrekt zu rechnen',
      point2: 'Erfordert manuelles Kopieren von Daten hin und her',
      point3: 'Kann auf Ihre Tabellenformeln gar nicht zugreifen',
      withoutLabel: 'Ohne SpreadAPI:',
      withoutText: '„Nach meiner Schätzung liegt der Preis bei etwa 4.500 €..."',
      withoutError: '❌ Daneben um 823 €',
      withLabel: 'Mit SpreadAPI:',
      withText: '„Laut Ihrem Preismodell beträgt der exakte Preis 3.677,42 €"',
      withSuccess: '✓ 100% genau, alle Rabatte berücksichtigt',
    },
    setup: {
      subheading: 'Einfache Einrichtung',
      title1: 'Von Excel zu KI-fähig in',
      title2: '3 Schritten',
      step1: {
        title: 'Excel hochladen',
        description: 'Einfach Ihre Tabelle per Drag & Drop hochladen. SpreadAPI erkennt automatisch Ihre Formeln und Berechnungen.',
      },
      step2: {
        title: 'Parameter definieren',
        description: 'Per Mausklick Eingabezellen und Ausgabebereiche auswählen. Keine Programmierung — so einfach wie Excel bedienen.',
      },
      step3: {
        title: 'Mit KI verbinden',
        description: 'Fügen Sie unseren MCP-Server zu Claude hinzu oder nutzen Sie unsere API mit ChatGPT. Ihr KI-Assistent hat jetzt Excel-Superkräfte!',
      },
    },
    possibilities: {
      subheading: 'Möglichkeiten',
      title1: 'Was jetzt',
      title2: 'möglich wird',
      case1: {
        title: 'Kundensupport, der nie falsche Preise nennt',
        intro: 'Ihr Support-Chatbot kann jetzt:',
        points: ['Präzise Angebote mit Ihren exakten Preisregeln erstellen', 'Versandkosten basierend auf Ihrem Logistikmodell berechnen', 'Die richtigen Rabatte für jede Kundenstufe anwenden'],
        quote: '„Unser KI-Support bearbeitet jetzt 80% der Angebotsanfragen — mit 100% Genauigkeit"',
      },
      case2: {
        title: 'Vertriebsteams erstellen perfekte Angebote',
        intro: 'Befähigen Sie Ihr Vertriebsteam:',
        points: ['Komplexe Multi-Produkt-Angebote sofort zu erstellen', 'Was-wäre-wenn-Szenarien während Kundengesprächen durchzuspielen', 'Immer die aktuellsten Preise und Aktionen zu nutzen'],
        quote: '„Vertriebszyklen um 40% verkürzt durch sofortige, präzise Preisgestaltung"',
      },
      case3: {
        title: 'Entwickler bauen intelligentere Anwendungen',
        intro: 'Lassen Sie GitHub Copilot und KI-Coding-Assistenten:',
        points: ['Excel-Berechnungen direkt im Code nutzen', 'Testfälle aus Tabellenlogik generieren', 'UIs bauen, die perfekt zu Excel-Workflows passen'],
        quote: '„Nie wieder Excel-Formeln nachbauen — einfach das Original nutzen"',
      },
      case4: {
        title: 'Finanzanalyse mit KI-Geschwindigkeit',
        intro: 'Ermöglichen Sie Claude oder ChatGPT:',
        points: ['Komplexe Finanzmodelle sofort auszuführen', 'Investitionsszenarien mit echten Berechnungen zu erstellen', 'Berichte mit Ihren exakten Methoden zu generieren'],
        quote: '„KI kann jetzt unsere Finanzprognosen erklären UND berechnen"',
      },
    },
    platforms: {
      subheading: 'Universelle Kompatibilität',
      title1: 'Funktioniert mit',
      title2: 'jeder KI-Plattform',
      claude: { title: 'Claude Desktop', description: 'MCP-Protokoll integriert' },
      chatgpt: { title: 'ChatGPT', description: 'Custom GPT-fähig' },
      any: { title: 'Jede Plattform', description: 'REST-API & SDKs' },
      demo: {
        title: 'Sehen Sie es in Aktion',
        claudeTitle: 'Claude Desktop + Excel = Magie',
        featuresTitle: 'Echte Excel-Berechnungen',
        feature1: { title: '100% genau', description: 'Nutzt Ihre echten Excel-Formeln' },
        feature2: { title: 'Immer aktuell', description: 'Aktualisiert sich mit Excel-Änderungen' },
        feature3: { title: 'Vollständig sicher', description: 'KI sieht nur Ergebnisse, keine Formeln' },
      },
    },
    quickSetup: {
      subheading: 'Schnelleinrichtung',
      title1: 'Verbinden Sie Ihren KI-Assistenten in',
      title2: '3 Minuten',
      description: 'Wählen Sie Ihre KI-Plattform und folgen Sie der einfachen Anleitung',
      chatgpt: {
        title: 'ChatGPT',
        description: 'Einfachste Einrichtung mit OAuth — keine Konfigurationsdateien nötig',
        recommended: 'EMPFOHLEN',
        step1: {
          title: 'ChatGPT-Einstellungen öffnen',
          description: 'Klicken Sie in ChatGPT auf Ihr Profilbild und navigieren Sie zu Einstellungen → Apps und Konnektoren.',
        },
        step2: {
          title: 'SpreadAPI als MCP-Server hinzufügen',
          description: 'Klicken Sie auf Erstellen, um einen neuen Konnektor hinzuzufügen. Im Feld „MCP Server URL" fügen Sie Ihre Service-URL ein:',
          note: 'Wählen Sie OAuth als Authentifizierungsmethode und klicken Sie auf Erstellen.',
        },
        step3: {
          title: 'Starten Sie mit Ihren Excel-Berechnungen!',
          description: 'ChatGPT startet den OAuth-Ablauf. Nach der Verbindung erscheint Ihr Service in der Konnektorenliste. Probieren Sie diese Prompts:',
          prompt1: '„Welche Parameter braucht dieser Service?"',
          prompt2: '„Berechne das Angebot für 500 Einheiten mit Enterprise-Rabatt"',
        },
      },
      claude: {
        title: 'Claude Desktop',
        description: 'Native MCP-Unterstützung mit automatischer NPX-Bridge',
        step1: {
          title: 'Claude Desktop Einstellungen öffnen',
          description: 'Klicken Sie auf Claude → Einstellungen (Mac) oder Datei → Einstellungen (Windows), dann wählen Sie den Entwickler-Tab und klicken auf Konfiguration bearbeiten.',
        },
        step2: {
          title: 'SpreadAPI-Konfiguration hinzufügen',
          description: 'Fügen Sie dies zu Ihrer claude_desktop_config.json Datei hinzu:',
          note: 'Ersetzen Sie YOUR_SERVICE_ID mit Ihrer tatsächlichen Service-ID und your_token_here mit Ihrem API-Token von SpreadAPI.',
        },
        step3: {
          title: 'Neustarten und loslegen!',
          description: 'Starten Sie Claude Desktop neu. Die MCP-Bridge wird automatisch via NPX heruntergeladen. Ihr Service erscheint im MCP-Menü. Probieren Sie diese Prompts:',
          prompt1: '„Welche Parameter braucht dieser Service?"',
          prompt2: '„Vergleiche 3 Preisszenarien mit diesem Rechner"',
        },
      },
      other: {
        title: 'Andere KI-Plattformen & eigene Apps',
        description: 'REST-API, SDKs und MCP-Protokoll für jede Integration',
        intro: 'SpreadAPI funktioniert mit jeder Plattform, die REST-APIs oder das Model Context Protocol (MCP) unterstützt. Perfekt für:',
        items: ['Custom GPTs', 'GitHub Copilot', 'Cursor IDE', 'Zapier / Make', 'n8n Workflows', 'Ihre eigenen Apps'],
        seeHow: 'So funktioniert\'s →',
        getStarted: 'Kostenlos starten',
      },
      findUrl: {
        title: 'Wo finden Sie Ihre Service-URL & Token',
        steps: ['Bei SpreadAPI anmelden und Excel-Datei hochladen', 'Ein- und Ausgaben definieren (per Mausklick, keine Programmierung)', 'Service veröffentlichen', 'Unter Agents → MCP-Integration finden Sie Ihre Service-URL und können Tokens generieren'],
      },
      help: {
        title: 'Brauchen Sie Hilfe?',
        chatgptIssue: 'ChatGPT-Konnektor funktioniert nicht? Stellen Sie sicher, dass Sie den OAuth-Ablauf abgeschlossen haben und Ihr Service veröffentlicht ist',
        claudeIssue: 'Claude findet keine Tools? Starten Sie Claude Desktop nach dem Hinzufügen der Konfiguration neu',
        authIssue: 'Authentifizierungsfehler? Überprüfen Sie, ob Ihr Token korrekt kopiert wurde',
        contact: 'Immer noch Probleme? Schreiben Sie uns an',
      },
    },
    contact: {
      subheading: 'Fragen?',
      title1: 'Wir sind für Sie',
      title2: 'da',
      text: 'Ob Sie Möglichkeiten erkunden oder startklar sind — wir helfen gerne unter',
    },
  },
} as const;

// Helper function to get AI Integration translations
export function getAIIntegrationTranslations(locale: SupportedLocale) {
  if (locale === 'de') {
    return aiIntegrationPage.de;
  }
  return aiIntegrationPage.en;
}

// =============================================================================
// AUTOMATION CALCULATIONS PAGE TRANSLATIONS
// =============================================================================

export const automationPage = {
  en: {
    hero: {
      subheading: 'For Automation Builders',
      title1: 'When Your Automation',
      title2: 'Needs to Think',
      description: "Zapier moves data. Make triggers actions. But who does the math? Your Excel spreadsheets can now power the complex calculations your automations can't handle.",
      cta: 'Get Started Free',
      ctaSecondary: 'See How It Works',
    },
    platforms: {
      intro: 'Works with your favorite automation platforms',
    },
    gap: {
      title: 'The Calculation Gap',
      description1: 'Automation platforms are amazing at moving data and triggering actions. But when you need to calculate something complex?',
      description2: "You hit a wall. Nested IFs that break. Formula fields that can't handle your logic. Workarounds that don't scale.",
      goodAt: 'Automations are great at:',
      goodItems: ['Triggers', 'Data movement', 'Simple IF/THEN', 'API calls', 'Notifications'],
      badAt: 'Automations struggle with:',
      badItems: ['Multi-variable pricing', 'Weighted scoring', 'Complex rules', 'Financial calcs', 'Decision trees'],
    },
    scenarios: {
      subheading: 'Sound Familiar?',
      title1: 'When You Wish Your Automation',
      title2: 'Could Think',
      items: [
        { scenario: 'Calculate a quote with 47 pricing rules', icon: '💰' },
        { scenario: 'Score leads using your proven Excel model', icon: '📊' },
        { scenario: 'Determine shipping costs across 12 carriers', icon: '🚚' },
        { scenario: 'Check if an order qualifies for custom discounts', icon: '🏷️' },
        { scenario: 'Calculate commissions with accelerators and tiers', icon: '💼' },
        { scenario: 'Decide reorder quantities based on 20 factors', icon: '📦' },
      ],
      footer: "Your automation can trigger all day long — but it can't think.",
    },
    solution: {
      subheading: 'The Solution',
      title1: 'Your Spreadsheet Becomes',
      title2: 'The Brain',
      description: 'You already have an Excel model that does exactly what you need. SpreadAPI turns it into an API endpoint your automation can call.',
      flow: {
        trigger: { title: 'Trigger', description: 'New order, lead, etc.' },
        calculate: { title: 'Calculate', description: 'Excel does the math' },
        continue: { title: 'Continue', description: 'Use the result' },
      },
      flowNote: 'The automation sends inputs → SpreadAPI runs your Excel formulas → returns the calculated result',
    },
    steps: {
      subheading: 'How It Works',
      title1: 'Three Steps to',
      title2: 'Smarter Automations',
      step1: {
        title: 'Upload Your Excel',
        description: 'The spreadsheet you already use. Your pricing model, scoring matrix, or calculation engine.',
      },
      step2: {
        title: 'Define Inputs & Outputs',
        description: 'Tell SpreadAPI which cells receive data from your automation and which cells return results.',
      },
      step3: {
        title: 'Call from Any Platform',
        description: 'Use a simple HTTP/Webhook action to call your API. Works with Zapier, Make, n8n, Power Automate, and more.',
      },
    },
    platformIntegration: {
      subheading: 'Platform Integration',
      title1: 'Works With',
      title2: 'Every Platform',
      zapier: {
        title: 'Zapier',
        description: 'Use the Webhooks by Zapier action to call your SpreadAPI endpoint between any trigger and action.',
        flow: 'Trigger → Webhook (POST to SpreadAPI) → Use result in next step',
      },
      make: {
        title: 'Make (Integromat)',
        description: "Add an HTTP module to your scenario. Route based on the calculated result using Make's powerful filters.",
        flow: 'Module → HTTP Request → Router (based on result)',
      },
      n8n: {
        title: 'n8n',
        description: "Use the HTTP Request node in your workflow. Branch logic based on SpreadAPI's calculated output.",
        flow: 'Node → HTTP Request → IF node (branch on result)',
      },
      powerAutomate: {
        title: 'Power Automate',
        description: 'Add an HTTP connector action. Use the response in conditions to drive your flow logic.',
        flow: 'Trigger → HTTP → Condition → Actions',
      },
    },
    useCases: {
      subheading: 'Real Use Cases',
      title1: 'What People',
      title2: 'Actually Build',
      cases: [
        {
          icon: '💰',
          title: 'Dynamic Pricing',
          description: 'E-commerce order comes in → Calculate custom price based on quantity, customer tier, active promotions, and margins → Update order with final price.',
          example: 'Example: Shopify → Zapier → SpreadAPI (pricing engine) → Update order',
        },
        {
          icon: '📊',
          title: 'Lead Scoring & Routing',
          description: 'New lead enters CRM → Score using 50+ weighted factors from your proven model → Route to the right sales rep automatically.',
          example: 'Example: HubSpot → n8n → SpreadAPI (scoring) → Assign owner',
        },
        {
          icon: '📄',
          title: 'Instant Quotes',
          description: 'Customer fills a form → Calculate complex pricing with dependencies, configurations, and discounts → Generate and send PDF quote.',
          example: 'Example: Typeform → Make → SpreadAPI → Generate PDF → Email',
        },
        {
          icon: '💼',
          title: 'Commission Calculation',
          description: 'Deal marked as won → Calculate commission with tiers, accelerators, team splits, and bonuses → Update payroll system.',
          example: 'Example: Salesforce → Zapier → SpreadAPI → Update ADP',
        },
        {
          icon: '📦',
          title: 'Smart Reordering',
          description: 'Daily inventory check → Calculate optimal reorder quantities considering lead times, seasonality, and cash flow → Create purchase orders.',
          example: 'Example: Schedule → n8n → SpreadAPI → Create PO in NetSuite',
        },
        {
          icon: '✅',
          title: 'Smart Approvals',
          description: 'Expense submitted → Evaluate against budget, policy rules, and historical patterns → Auto-approve or route for human review.',
          example: 'Example: Expensify → Power Automate → SpreadAPI → Route',
        },
      ],
    },
    comparison: {
      subheading: 'Why SpreadAPI',
      title1: 'Better Than',
      title2: 'The Alternatives',
      native: {
        problem: { title: 'Native Platform Formulas', description: 'Limited functions, nested IFs break, hard to maintain and debug.' },
        solution: { title: 'SpreadAPI', description: 'Full Excel power. 500+ functions. Easy to update.' },
      },
      code: {
        problem: { title: 'Custom Code / Functions', description: 'Requires a developer, expensive to build, slow to change.' },
        solution: { title: 'SpreadAPI', description: 'No code needed. Business team can update anytime.' },
      },
      sheets: {
        problem: { title: 'Google Sheets Integration', description: 'Slow, rate-limited, exposes your formulas, not designed for API use.' },
        solution: { title: 'SpreadAPI', description: 'Fast (sub-100ms). Secure. Built for high-volume API calls.' },
      },
    },
    faq: {
      title1: 'Common',
      title2: 'Questions',
      questions: [
        {
          q: '"How fast is the API response?"',
          a: 'Most calls return in under 100ms. Complex spreadsheets with many formulas may take 100-200ms. Either way, fast enough for real-time automation workflows.',
        },
        {
          q: '"What if my automation runs thousands of times per day?"',
          a: "SpreadAPI is built for high-volume use. Our infrastructure handles millions of calculations. Check our pricing page for rate limits on each plan.",
        },
        {
          q: '"Can I use Google Sheets instead of Excel?"',
          a: 'Currently we focus on Excel files (.xlsx). You can export Google Sheets to Excel format and upload that. Native Google Sheets support is on our roadmap.',
        },
        {
          q: '"Is my spreadsheet data secure?"',
          a: 'Your spreadsheet and data are encrypted at rest and in transit. We never expose your formulas — only the results. Your intellectual property stays protected.',
        },
        {
          q: '"What happens if I update the Excel file?"',
          a: 'Upload the new version to SpreadAPI. Your API endpoint stays the same, but now uses the updated logic. No changes needed in your automations.',
        },
      ],
    },
    cta: {
      title: 'Give Your Automations a Brain',
      description: 'Stop building workarounds for complex calculations. Your Excel model + SpreadAPI = smarter automations in minutes.',
      button: 'Get Started Free',
      buttonSecondary: 'View Documentation',
    },
  },

  de: {
    hero: {
      subheading: 'Für Automatisierungs-Builder',
      title1: 'Wenn Ihre Automatisierung',
      title2: 'rechnen muss',
      description: 'Zapier bewegt Daten. Make löst Aktionen aus. Aber wer rechnet? Ihre Excel-Tabellen übernehmen jetzt die komplexen Berechnungen, die Ihre Automatisierungen nicht schaffen.',
      cta: 'Kostenlos starten',
      ctaSecondary: 'So funktioniert\'s',
    },
    platforms: {
      intro: 'Funktioniert mit Ihren bevorzugten Automatisierungsplattformen',
    },
    gap: {
      title: 'Die Berechnungslücke',
      description1: 'Automatisierungsplattformen sind großartig beim Datentransfer und Aktionen auslösen. Aber wenn Sie etwas Komplexes berechnen müssen?',
      description2: 'Dann ist Schluss. Verschachtelte WENNs, die brechen. Formelfelder, die Ihre Logik nicht abbilden. Workarounds, die nicht skalieren.',
      goodAt: 'Automatisierungen können gut:',
      goodItems: ['Trigger', 'Datentransfer', 'Einfache WENN/DANN', 'API-Aufrufe', 'Benachrichtigungen'],
      badAt: 'Automatisierungen scheitern bei:',
      badItems: ['Mehrstufiger Preisgestaltung', 'Gewichteten Bewertungen', 'Komplexen Regeln', 'Finanzberechnungen', 'Entscheidungsbäumen'],
    },
    scenarios: {
      subheading: 'Kommt Ihnen das bekannt vor?',
      title1: 'Wenn Sie sich wünschen, Ihre Automatisierung',
      title2: 'könnte rechnen',
      items: [
        { scenario: 'Angebot mit 47 Preisregeln berechnen', icon: '💰' },
        { scenario: 'Leads mit Ihrem bewährten Excel-Modell bewerten', icon: '📊' },
        { scenario: 'Versandkosten für 12 Spediteure ermitteln', icon: '🚚' },
        { scenario: 'Prüfen, ob eine Bestellung für Sonderrabatte qualifiziert', icon: '🏷️' },
        { scenario: 'Provisionen mit Beschleunigern und Staffeln berechnen', icon: '💼' },
        { scenario: 'Nachbestellmengen anhand von 20 Faktoren entscheiden', icon: '📦' },
      ],
      footer: 'Ihre Automatisierung kann den ganzen Tag triggern — aber sie kann nicht rechnen.',
    },
    solution: {
      subheading: 'Die Lösung',
      title1: 'Ihre Tabelle wird',
      title2: 'zur Rechenmaschine',
      description: 'Sie haben bereits ein Excel-Modell, das genau das tut, was Sie brauchen. SpreadAPI macht daraus einen API-Endpunkt, den Ihre Automatisierung aufrufen kann.',
      flow: {
        trigger: { title: 'Trigger', description: 'Neue Bestellung, Lead, etc.' },
        calculate: { title: 'Berechnung', description: 'Excel rechnet' },
        continue: { title: 'Weiter', description: 'Ergebnis verwenden' },
      },
      flowNote: 'Die Automatisierung sendet Eingaben → SpreadAPI führt Ihre Excel-Formeln aus → gibt das berechnete Ergebnis zurück',
    },
    steps: {
      subheading: 'So funktioniert\'s',
      title1: 'Drei Schritte zu',
      title2: 'intelligenteren Automatisierungen',
      step1: {
        title: 'Excel hochladen',
        description: 'Die Tabelle, die Sie bereits nutzen. Ihr Preismodell, Ihre Bewertungsmatrix oder Berechnungs-Engine.',
      },
      step2: {
        title: 'Ein- & Ausgaben definieren',
        description: 'Sagen Sie SpreadAPI, welche Zellen Daten von Ihrer Automatisierung erhalten und welche Ergebnisse zurückgeben.',
      },
      step3: {
        title: 'Von jeder Plattform aufrufen',
        description: 'Nutzen Sie eine einfache HTTP/Webhook-Aktion, um Ihre API aufzurufen. Funktioniert mit Zapier, Make, n8n, Power Automate und mehr.',
      },
    },
    platformIntegration: {
      subheading: 'Plattform-Integration',
      title1: 'Funktioniert mit',
      title2: 'jeder Plattform',
      zapier: {
        title: 'Zapier',
        description: 'Nutzen Sie die Webhooks by Zapier-Aktion, um Ihren SpreadAPI-Endpunkt zwischen Trigger und Aktion aufzurufen.',
        flow: 'Trigger → Webhook (POST an SpreadAPI) → Ergebnis im nächsten Schritt nutzen',
      },
      make: {
        title: 'Make (Integromat)',
        description: 'Fügen Sie ein HTTP-Modul zu Ihrem Szenario hinzu. Routen Sie basierend auf dem berechneten Ergebnis mit Makes leistungsstarken Filtern.',
        flow: 'Modul → HTTP-Request → Router (basierend auf Ergebnis)',
      },
      n8n: {
        title: 'n8n',
        description: 'Nutzen Sie den HTTP-Request-Node in Ihrem Workflow. Verzweigen Sie die Logik basierend auf SpreadAPIs berechnetem Output.',
        flow: 'Node → HTTP-Request → IF-Node (Verzweigung nach Ergebnis)',
      },
      powerAutomate: {
        title: 'Power Automate',
        description: 'Fügen Sie eine HTTP-Connector-Aktion hinzu. Nutzen Sie die Antwort in Bedingungen, um Ihre Flow-Logik zu steuern.',
        flow: 'Trigger → HTTP → Bedingung → Aktionen',
      },
    },
    useCases: {
      subheading: 'Echte Anwendungsfälle',
      title1: 'Was tatsächlich',
      title2: 'gebaut wird',
      cases: [
        {
          icon: '💰',
          title: 'Dynamische Preisgestaltung',
          description: 'E-Commerce-Bestellung kommt rein → Individuellen Preis basierend auf Menge, Kundenstufe, aktiven Aktionen und Margen berechnen → Bestellung mit Endpreis aktualisieren.',
          example: 'Beispiel: Shopify → Zapier → SpreadAPI (Preis-Engine) → Bestellung aktualisieren',
        },
        {
          icon: '📊',
          title: 'Lead-Scoring & Routing',
          description: 'Neuer Lead im CRM → Mit 50+ gewichteten Faktoren aus Ihrem bewährten Modell bewerten → Automatisch zum richtigen Vertriebler routen.',
          example: 'Beispiel: HubSpot → n8n → SpreadAPI (Scoring) → Besitzer zuweisen',
        },
        {
          icon: '📄',
          title: 'Sofortige Angebote',
          description: 'Kunde füllt Formular aus → Komplexe Preise mit Abhängigkeiten, Konfigurationen und Rabatten berechnen → PDF-Angebot generieren und senden.',
          example: 'Beispiel: Typeform → Make → SpreadAPI → PDF generieren → E-Mail',
        },
        {
          icon: '💼',
          title: 'Provisionsberechnung',
          description: 'Deal als gewonnen markiert → Provision mit Staffeln, Beschleunigern, Team-Aufteilungen und Boni berechnen → Lohnbuchhaltung aktualisieren.',
          example: 'Beispiel: Salesforce → Zapier → SpreadAPI → ADP aktualisieren',
        },
        {
          icon: '📦',
          title: 'Intelligente Nachbestellung',
          description: 'Tägliche Bestandsprüfung → Optimale Nachbestellmengen unter Berücksichtigung von Lieferzeiten, Saisonalität und Cashflow berechnen → Bestellungen erstellen.',
          example: 'Beispiel: Zeitplan → n8n → SpreadAPI → PO in NetSuite erstellen',
        },
        {
          icon: '✅',
          title: 'Intelligente Genehmigungen',
          description: 'Ausgabe eingereicht → Gegen Budget, Richtlinien und historische Muster prüfen → Automatisch genehmigen oder zur manuellen Prüfung weiterleiten.',
          example: 'Beispiel: Expensify → Power Automate → SpreadAPI → Weiterleiten',
        },
      ],
    },
    comparison: {
      subheading: 'Warum SpreadAPI',
      title1: 'Besser als die',
      title2: 'Alternativen',
      native: {
        problem: { title: 'Native Plattform-Formeln', description: 'Begrenzte Funktionen, verschachtelte WENNs brechen, schwer zu warten und debuggen.' },
        solution: { title: 'SpreadAPI', description: 'Volle Excel-Power. 500+ Funktionen. Einfach zu aktualisieren.' },
      },
      code: {
        problem: { title: 'Custom Code / Funktionen', description: 'Erfordert Entwickler, teuer zu bauen, langsam zu ändern.' },
        solution: { title: 'SpreadAPI', description: 'Kein Code nötig. Fachabteilung kann jederzeit aktualisieren.' },
      },
      sheets: {
        problem: { title: 'Google Sheets Integration', description: 'Langsam, Rate-limitiert, zeigt Ihre Formeln, nicht für API-Nutzung gedacht.' },
        solution: { title: 'SpreadAPI', description: 'Schnell (unter 100ms). Sicher. Für hohe API-Volumen gebaut.' },
      },
    },
    faq: {
      title1: 'Häufige',
      title2: 'Fragen',
      questions: [
        {
          q: '„Wie schnell ist die API-Antwort?"',
          a: 'Die meisten Aufrufe dauern unter 100ms. Komplexe Tabellen mit vielen Formeln brauchen 100-200ms. Beides schnell genug für Echtzeit-Automatisierungs-Workflows.',
        },
        {
          q: '„Was wenn meine Automatisierung tausende Male täglich läuft?"',
          a: 'SpreadAPI ist für hohes Volumen gebaut. Unsere Infrastruktur verarbeitet Millionen von Berechnungen. Auf der Preisseite finden Sie Rate-Limits für jeden Plan.',
        },
        {
          q: '„Kann ich Google Sheets statt Excel nutzen?"',
          a: 'Aktuell fokussieren wir uns auf Excel-Dateien (.xlsx). Sie können Google Sheets als Excel exportieren und hochladen. Native Google Sheets Unterstützung ist auf unserer Roadmap.',
        },
        {
          q: '„Sind meine Tabellendaten sicher?"',
          a: 'Ihre Tabelle und Daten sind verschlüsselt gespeichert und übertragen. Wir zeigen nie Ihre Formeln — nur die Ergebnisse. Ihr geistiges Eigentum bleibt geschützt.',
        },
        {
          q: '„Was passiert, wenn ich die Excel-Datei aktualisiere?"',
          a: 'Laden Sie die neue Version bei SpreadAPI hoch. Ihr API-Endpunkt bleibt gleich, nutzt aber die aktualisierte Logik. Keine Änderungen in Ihren Automatisierungen nötig.',
        },
      ],
    },
    cta: {
      title: 'Geben Sie Ihren Automatisierungen Rechenkraft',
      description: 'Schluss mit Workarounds für komplexe Berechnungen. Ihr Excel-Modell + SpreadAPI = intelligentere Automatisierungen in Minuten.',
      button: 'Kostenlos starten',
      buttonSecondary: 'Dokumentation ansehen',
    },
  },
} as const;

// Helper function to get Automation page translations
export function getAutomationTranslations(locale: SupportedLocale) {
  if (locale === 'de') {
    return automationPage.de;
  }
  return automationPage.en;
}

// =============================================================================
// WHY AI FAILS AT MATH PAGE TRANSLATIONS
// =============================================================================

export const whyAIFailsPage = {
  en: {
    hero: {
      subheading: 'AI Confessions',
      title: '🤖 "Why We Can\'t Do Excel"',
      description: 'An Honest Conversation with AI About Spreadsheets',
      cta: 'Try SpreadAPI Instead',
      ctaSecondary: '← Back to Product',
    },
    chat: {
      human1: '"I have a complex Excel with 1000+ formulas. Can you recalculate if I change 5 variables?"',
      ai1: '"I can try, but honestly? With 1000+ formulas, I\'d need 2-15 minutes and would probably get it wrong."',
      human2: '"Wait, you can\'t just run the Excel formulas?"',
      ai2Part1: '"No, I can\'t actually run Excel formulas. When you upload a spreadsheet, I see the formulas and saved values, but I can\'t execute them. I\'d have to recreate the logic myself.',
      ai2Part2: 'With complex dependencies (A depends on B, B on C...), I spend most time figuring out calculation order. My success rate? Maybe 20-40% for complex models.',
      ai2Part3: 'I only know about 50-100 Excel functions out of 500+. XIRR? YIELD? Array formulas? I\'m mostly guessing."',
    },
    successRate: {
      title1: "AI's Success Rate",
      title2: 'Reality Check',
      subtitle: '🎲 My Realistic Success Rates',
      simple: {
        label: 'Simple spreadsheet (50-100 formulas)',
        description: 'Basic calculations, straightforward logic',
        rate: '80-90%',
      },
      complex: {
        label: 'Complex model (1000+ formulas)',
        description: 'Dependencies, array formulas, financial functions',
        rate: '20-40%',
      },
      spreadapi: {
        label: 'SpreadAPI (any complexity)',
        description: 'Actual Excel engine, perfect accuracy',
        rate: '100%',
      },
      quote: '"I\'ll get trends right, but exact precision? Doubtful. Error propagation is my nightmare."',
      quoteAuthor: '- Every AI Model',
    },
    truthTable: {
      title1: 'The AI',
      title2: 'Truth Table',
      aiColumn: {
        title: 'When you upload Excel to me:',
        points: [
          "I see formulas but can't execute them",
          'I only know 50-100 of 500+ functions',
          'I need 2-15 minutes for complex sheets',
          '20-40% accuracy on 1000+ formulas',
          'Errors compound through dependencies',
        ],
        quote: '"I work with saved values, not live calculations"',
        quoteAuthor: '- Claude',
      },
      spreadapiColumn: {
        title: 'When SpreadAPI calculates:',
        points: [
          'Executes actual Excel formulas',
          'Supports 500+ Excel functions',
          'Returns results in milliseconds',
          '100% accuracy, any complexity',
          'Your formulas stay protected',
        ],
        quote: '"Finally, AI can use real Excel calculations"',
        quoteAuthor: '- Your Business',
      },
    },
    limitations: {
      title1: 'Real AI Limitations',
      title2: '(In Our Own Words)',
      card1: {
        title: '"I\'m Impossibly Slow"',
        text: "Give me 1000 formulas? That's 2-15 minutes of me trying to understand dependencies. Excel? 1-2 seconds.",
        author: '- Every AI Model',
      },
      card2: {
        title: '"I Can\'t Execute Formulas"',
        text: "When you upload Excel, I see your formulas and saved values, but I can't run them. I'd have to recreate everything.",
        author: '- Claude',
      },
      card3: {
        title: '"I\'m Function-Illiterate"',
        text: "I only know 50-100 Excel functions out of 500+. XIRR? YIELD? Array formulas? I'm just guessing what they do.",
        author: '- ChatGPT & Claude',
      },
    },
    solution: {
      title1: 'The SpreadAPI Solution',
      title2: '(As Explained by AI)',
      aiExplanation: "SpreadAPI lets us work together perfectly: I handle the conversation, Excel handles the calculations. You get AI's flexibility with Excel's precision.",
      aiQuote: "It's not about replacing Excel with AI. It's about letting each of us do what we do best.\"",
      aiRole: { title: 'I Talk to Humans', description: 'Natural language, context understanding, helpful explanations' },
      excelRole: { title: 'Excel Does Math', description: 'Precise calculations, complex formulas, 100% accuracy' },
    },
    bottomLine: {
      title: 'The Bottom Line',
      subtitle: 'The Truth About AI + Excel',
      text1: "AI can't run Excel formulas. Can't execute functions. Takes forever.",
      text2: 'But with SpreadAPI? AI finally gets real Excel calculations.',
      quote: '"Stop asking AI to fake math. Give it actual Excel.\n100% accuracy. Every time. In milliseconds."',
      cta: 'Start Your Free Trial',
      ctaNote: 'No credit card required • 1,000 free calculations',
    },
  },

  de: {
    hero: {
      subheading: 'KI-Geständnisse',
      title: '🤖 „Warum wir kein Excel können"',
      description: 'Ein ehrliches Gespräch mit KI über Tabellenkalkulation',
      cta: 'Stattdessen SpreadAPI testen',
      ctaSecondary: '← Zurück zum Produkt',
    },
    chat: {
      human1: '„Ich habe eine komplexe Excel mit über 1000 Formeln. Kannst du neu berechnen, wenn ich 5 Variablen ändere?"',
      ai1: '„Ich kann es versuchen, aber ehrlich? Bei über 1000 Formeln bräuchte ich 2-15 Minuten und würde es wahrscheinlich falsch machen."',
      human2: '„Moment, du kannst die Excel-Formeln nicht einfach ausführen?"',
      ai2Part1: '„Nein, ich kann Excel-Formeln nicht wirklich ausführen. Wenn Sie eine Tabelle hochladen, sehe ich die Formeln und gespeicherten Werte, aber ich kann sie nicht berechnen. Ich müsste die Logik selbst nachbauen.',
      ai2Part2: 'Bei komplexen Abhängigkeiten (A hängt von B ab, B von C...) verbringe ich die meiste Zeit damit, die Berechnungsreihenfolge herauszufinden. Meine Erfolgsquote? Vielleicht 20-40% bei komplexen Modellen.',
      ai2Part3: 'Ich kenne nur etwa 50-100 von über 500 Excel-Funktionen. XINTZINSFUSS? RENDITE? Array-Formeln? Ich rate größtenteils."',
    },
    successRate: {
      title1: 'KI-Erfolgsquote:',
      title2: 'Realitätscheck',
      subtitle: '🎲 Meine realistischen Erfolgsquoten',
      simple: {
        label: 'Einfache Tabelle (50-100 Formeln)',
        description: 'Grundlegende Berechnungen, einfache Logik',
        rate: '80-90%',
      },
      complex: {
        label: 'Komplexes Modell (über 1000 Formeln)',
        description: 'Abhängigkeiten, Array-Formeln, Finanzfunktionen',
        rate: '20-40%',
      },
      spreadapi: {
        label: 'SpreadAPI (jede Komplexität)',
        description: 'Echte Excel-Engine, perfekte Genauigkeit',
        rate: '100%',
      },
      quote: '„Trends kriege ich hin, aber exakte Präzision? Zweifelhaft. Fehlerfortpflanzung ist mein Albtraum."',
      quoteAuthor: '- Jedes KI-Modell',
    },
    truthTable: {
      title1: 'Die KI-',
      title2: 'Wahrheitstabelle',
      aiColumn: {
        title: 'Wenn Sie mir Excel hochladen:',
        points: [
          'Ich sehe Formeln, kann sie aber nicht ausführen',
          'Ich kenne nur 50-100 von über 500 Funktionen',
          'Ich brauche 2-15 Minuten für komplexe Tabellen',
          '20-40% Genauigkeit bei über 1000 Formeln',
          'Fehler potenzieren sich durch Abhängigkeiten',
        ],
        quote: '„Ich arbeite mit gespeicherten Werten, nicht mit Live-Berechnungen"',
        quoteAuthor: '- Claude',
      },
      spreadapiColumn: {
        title: 'Wenn SpreadAPI berechnet:',
        points: [
          'Führt echte Excel-Formeln aus',
          'Unterstützt über 500 Excel-Funktionen',
          'Liefert Ergebnisse in Millisekunden',
          '100% Genauigkeit, jede Komplexität',
          'Ihre Formeln bleiben geschützt',
        ],
        quote: '„Endlich kann KI echte Excel-Berechnungen nutzen"',
        quoteAuthor: '- Ihr Unternehmen',
      },
    },
    limitations: {
      title1: 'Echte KI-Limitierungen',
      title2: '(In unseren eigenen Worten)',
      card1: {
        title: '„Ich bin hoffnungslos langsam"',
        text: '1000 Formeln? Das sind 2-15 Minuten, in denen ich Abhängigkeiten zu verstehen versuche. Excel? 1-2 Sekunden.',
        author: '- Jedes KI-Modell',
      },
      card2: {
        title: '„Ich kann keine Formeln ausführen"',
        text: 'Wenn Sie Excel hochladen, sehe ich Ihre Formeln und gespeicherten Werte, aber ausführen kann ich sie nicht. Ich müsste alles nachbauen.',
        author: '- Claude',
      },
      card3: {
        title: '„Ich kenne kaum Funktionen"',
        text: 'Ich kenne nur 50-100 von über 500 Excel-Funktionen. XINTZINSFUSS? RENDITE? Array-Formeln? Ich rate nur, was sie tun.',
        author: '- ChatGPT & Claude',
      },
    },
    solution: {
      title1: 'Die SpreadAPI-Lösung',
      title2: '(Von KI erklärt)',
      aiExplanation: 'SpreadAPI lässt uns perfekt zusammenarbeiten: Ich übernehme das Gespräch, Excel die Berechnungen. Sie erhalten KI-Flexibilität mit Excel-Präzision.',
      aiQuote: '„Es geht nicht darum, Excel durch KI zu ersetzen. Es geht darum, dass jeder von uns das tut, was er am besten kann."',
      aiRole: { title: 'Ich spreche mit Menschen', description: 'Natürliche Sprache, Kontextverständnis, hilfreiche Erklärungen' },
      excelRole: { title: 'Excel rechnet', description: 'Präzise Berechnungen, komplexe Formeln, 100% Genauigkeit' },
    },
    bottomLine: {
      title: 'Das Fazit',
      subtitle: 'Die Wahrheit über KI + Excel',
      text1: 'KI kann keine Excel-Formeln ausführen. Keine Funktionen berechnen. Dauert ewig.',
      text2: 'Aber mit SpreadAPI? KI bekommt endlich echte Excel-Berechnungen.',
      quote: '„Hören Sie auf, KI um Berechnungen zu bitten. Geben Sie ihr echtes Excel.\n100% Genauigkeit. Jedes Mal. In Millisekunden."',
      cta: 'Kostenlos testen',
      ctaNote: 'Keine Kreditkarte nötig • 1.000 kostenlose Berechnungen',
    },
  },
} as const;

// Helper function to get Why AI Fails translations
export function getWhyAIFailsTranslations(locale: SupportedLocale) {
  if (locale === 'de') {
    return whyAIFailsPage.de;
  }
  return whyAIFailsPage.en;
}
