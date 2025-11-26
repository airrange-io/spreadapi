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
      subheading: 'Headless Spreadsheets für KI & Automation',
      title1: 'Excel wird zur Live-API.',
      title2: 'KI spricht jetzt Tabellenkalkulation',
      description: 'Verwandeln Sie Ihre Tabellen in sichere Echtzeit-Webservices. Geben Sie KI-Assistenten, Automatisierungstools und Entwicklern direkten Zugriff — ohne Halluzinationen oder fehlerhafte Logik.',
      cta: 'Erste Excel-API kostenlos erstellen',
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
        text: 'Grundrechenarten? Klar. Aber Excel hat hunderte mehr — XIRR, YIELD, Array-Formeln? Da übersehe ich Randfälle.',
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
      description: 'Transformieren Sie Ihre Tabellen in Echtzeit-APIs, die KI aufrufen kann — kein Raten, keine Halluzinationen, nur präzise Ergebnisse durch Ihre Excel-Logik. Ob einfache Berechnungen oder komplexe verschachtelte Formeln — Ihre Excel-Logik wird exakt so ausgeführt, wie Sie sie erstellt haben. Das Ergebnis: sauberes, zuverlässiges JSON, mit dem KI-Assistenten, Entwickler und Automatisierungstools sofort und sicher arbeiten können.',
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
      description: 'Tools wie Zapier, Make und n8n können jetzt Berechnungen in Ihren Excel-Modellen mit Live-Eingaben auslösen und echte Ergebnisse liefern — sofort. Keine Logik-Neuimplementierung. Kein Formel-Umschreiben. Einfach exaktes Excel-Verhalten als sichere Echtzeit-API.',
      point1: 'Plug & Play mit jedem Workflow-Tool',
      point2: 'Liefert nur sauberes JSON, zeigt nie Formeln',
      point3: 'Bewältigt jede Excel-Komplexität — WENN, XVERWEIS, ARRAY-Funktionen, MwSt.-Logik, Preiskalkulationen',
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
      description: 'Transformieren Sie Ihre Tabellen in leistungsstarke APIs, die von Anwendungen, KI-Assistenten aufgerufen oder in jeden Workflow integriert werden können. Ihre Excel-Expertise wird sofort zugänglich.',
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
        text: 'Ihr Team arbeitet weiter mit Excel wie gewohnt. KI bekommt Superkräfte. Ohne Schulung',
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
        text: 'Optimieren Sie Tabellenformeln automatisch. KI schlägt Verbesserungen vor und bewahrt die Logik.',
      },
      case4: {
        title: 'Vertriebsteams',
        text: 'Erstellen Sie präzise Angebote sofort. KI nutzt Ihre Preismodelle für perfekte Proposals.',
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
