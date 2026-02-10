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
      link: 'Learn more about AI Integration',
    },
    inAction: 'In Action',
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
      title1: 'Real Calculations,',
      title2: 'Zero Hallucinations',
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
    enterprise: {
      title1: 'Need Full Control',
      title2: 'Over Your Data?',
      description: 'Working in an industry where compliance and data security are non-negotiable? With SpreadAPI Runtime, you can deploy your Excel-based APIs entirely on your own infrastructure. No data ever leaves your network.',
      cta: 'Learn About On-Premises',
    },
    excelApi: {
      subheading: 'How It Works',
      title1: 'Your Excel Logic,',
      title2: 'Available Everywhere',
      description: 'Upload your spreadsheet. Define inputs and outputs. Get a REST API that runs your exact formulas in milliseconds.',
      step1: {
        title: 'Upload Excel',
        description: 'Your existing spreadsheet with all its formulas. Nothing to change.',
      },
      step2: {
        title: 'Define Parameters',
        description: 'Mark cells as inputs and outputs. Takes 2 minutes. No code needed.',
      },
      step3: {
        title: 'Call Your API',
        description: 'GET or POST request — returns clean JSON with calculated results.',
      },
      stat1: { value: '50ms', label: 'Response time' },
      stat2: { value: '500+', label: 'Excel functions' },
      stat3: { value: '100%', label: 'Accurate' },
      stat4: { value: 'Zero', label: 'Lines of code' },
      integrations: 'Zapier • Make • n8n • REST API • Python • JavaScript',
      cta: 'See How It Works',
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
      link: 'Mehr über KI-Integration erfahren',
    },
    inAction: 'In Aktion',
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
      title1: 'Echte Berechnungen,',
      title2: 'Keine Halluzinationen',
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
    enterprise: {
      title1: 'Volle Kontrolle',
      title2: 'über Ihre Daten?',
      description: 'Sie arbeiten in einer Branche, in der Compliance und Datensicherheit unverzichtbar sind? Mit SpreadAPI Runtime betreiben Sie Ihre Excel-basierten APIs vollständig auf Ihrer eigenen Infrastruktur. Keine Daten verlassen jemals Ihr Netzwerk.',
      cta: 'Mehr über On-Premises erfahren',
    },
    excelApi: {
      subheading: 'So funktioniert es',
      title1: 'Ihre Excel-Logik,',
      title2: 'überall verfügbar',
      description: 'Laden Sie Ihre Tabelle hoch. Definieren Sie Ein- und Ausgaben. Erhalten Sie eine REST-API, die Ihre exakten Formeln in Millisekunden ausführt.',
      step1: {
        title: 'Excel hochladen',
        description: 'Ihre bestehende Tabelle mit allen Formeln. Nichts zu ändern.',
      },
      step2: {
        title: 'Parameter definieren',
        description: 'Markieren Sie Zellen als Ein- und Ausgaben. Dauert 2 Minuten. Kein Code nötig.',
      },
      step3: {
        title: 'API aufrufen',
        description: 'GET- oder POST-Anfrage — liefert sauberes JSON mit berechneten Ergebnissen.',
      },
      stat1: { value: '50ms', label: 'Antwortzeit' },
      stat2: { value: '500+', label: 'Excel-Funktionen' },
      stat3: { value: '100%', label: 'Genau' },
      stat4: { value: 'Null', label: 'Zeilen Code' },
      integrations: 'Zapier • Make • n8n • REST API • Python • JavaScript',
      cta: 'So funktioniert es',
    },
  },

  fr: {
    hero: {
      subheading: 'Tableurs Headless pour IA & Automatisation',
      title1: "Transformez Excel en API Live.",
      title2: "L'IA parle désormais tableur",
      description: "Convertissez vos feuilles de calcul en services web sécurisés en temps réel. Donnez aux assistants IA, aux outils d'automatisation et aux développeurs un accès direct — sans hallucinations ni logique erronée.",
      cta: 'Créez votre première API Excel gratuite',
    },
    painPoints: {
      title1: "Pourquoi l'IA échoue avec",
      title2: 'les calculs Excel',
      subtitle: "Nous avons interrogé l'IA sur ses compétences en tableur — voici ce qu'elle nous a honnêtement répondu.",
      card1: {
        title: '"Je ne peux pas exécuter vos formules"',
        text: "Je vois vos formules et les résultats d'Excel, mais je ne peux pas les exécuter. Je travaille avec des valeurs enregistrées, pas des calculs en direct.",
        author: '- Claude, ChatGPT & Gemini',
      },
      card2: {
        title: '"Je ne connais que 50-100 fonctions"',
        text: "Les maths de base ? Bien sûr. Mais Excel en a des centaines de plus — XIRR, YIELD, formules matricielles ? Je rate les cas particuliers.",
        author: '- Claude, en toute honnêteté',
      },
      card3: {
        title: '"Mes erreurs se propagent vite"',
        text: "Une petite erreur dans la cellule A1 ? À la ligne 1000, je suis complètement à côté. La propagation d'erreurs est mon cauchemar.",
        author: '- Tous les modèles IA',
      },
      card4: {
        title: '"Je suis très lent pour calculer"',
        text: "Plus de 1000 formules ? C'est 2-15 minutes de mapping des dépendances. Excel le fait en 1-2 secondes.",
        author: '- Tous les modèles IA',
      },
      card5: {
        title: '"Modèles complexes ? 20% de précision"',
        text: "Avec plus de 1000 formules, j'ai 20-40% de chances de bien faire. SpreadAPI ? Toujours 100%.",
        author: '- Claude & ChatGPT',
      },
      card6: {
        title: '"Je ne gère pas les dépendances"',
        text: "La cellule A dépend de B, B de C... Je passe le plus clair de mon temps à déterminer l'ordre, pas à calculer.",
        author: '- Gemini',
      },
      link: "Cliquez ici pour voir plus de limitations de l'IA →",
    },
    solution: {
      title1: "Voici comment nous aidons l'IA à",
      title2: 'exceller en calcul',
      description: "Transformez vos feuilles de calcul en API temps réel que l'IA peut appeler — sans approximation, sans hallucination, juste des résultats précis alimentés par votre logique Excel. Que ce soit des calculs simples ou des chaînes complexes de formules imbriquées, votre logique Excel est exécutée exactement comme vous l'avez construite. Le résultat : un JSON propre et fiable que les assistants IA, développeurs et outils d'automatisation peuvent utiliser — instantanément et en toute sécurité.",
      link: "En savoir plus sur l'intégration IA",
    },
    inAction: 'En Action',
    feature1: {
      title1: 'Agents commerciaux IA',
      title2: 'créant des devis Excel complexes',
      description: "Votre assistant commercial IA peut désormais générer des devis précis en utilisant vos vrais modèles de tarification Excel. Plus d'approximations ni d'hallucinations — juste des calculs précis de vos feuilles de calcul de confiance, accessibles via une simple API.",
      point1: "L'IA appelle votre modèle de tarification Excel via l'API",
      point2: 'Les formules complexes (remises, taxes, frais) sont calculées par Excel',
      point3: 'Résultats précis au centime près — pas de suppositions IA',
      chatCustomer: 'Client :',
      chatAI: 'Assistant Commercial IA :',
      basePrice: 'Prix de base',
      enterpriseDiscount: 'Remise entreprise',
      volumeDiscount: 'Remise volume',
      shipping: 'Livraison',
      salesTax: 'TVA',
      totalQuote: 'Devis Total',
      calcNote: 'Calculé par votre modèle de tarification Excel',
      downloadPdf: 'Télécharger le PDF du devis',
    },
    feature2: {
      title1: 'Agents commerciaux IA',
      title2: 'avec accès direct aux données',
      description: "Donnez à vos agents IA un accès en lecture/écriture à des zones désignées de la feuille de calcul. Ils peuvent mettre à jour les prix, ajuster les paramètres et lire les résultats — tout en gardant vos formules protégées.",
      point1: "L'IA lit et écrit directement dans les zones éditables de la feuille",
      point2: 'Les formules restent protégées et invisibles pour les agents IA',
      point3: "Parfait pour la tarification dynamique et l'analyse en temps réel",
    },
    feature3: {
      title1: 'Un avenir où',
      title2: "l'IA échoue en maths",
      description: "L'IA est puissante, mais elle a des difficultés avec les calculs complexes de type tableur. SpreadAPI comble ce fossé en laissant Excel faire ce qu'il fait le mieux.",
      point1Title: 'Le problème',
      point1Text: "Les modèles IA ne peuvent pas exécuter de manière fiable les formules Excel, surtout les modèles complexes avec des dépendances.",
      point2Title: 'La solution',
      point2Text: "SpreadAPI laisse Excel gérer les calculs pendant que l'IA se concentre sur l'interprétation des résultats et l'interaction avec les utilisateurs.",
      link: 'Lire notre article : Pourquoi l\'IA échoue en maths →',
    },
    differentiators: {
      subheading: 'Pourquoi SpreadAPI',
      title1: 'Une approche',
      title2: 'fondamentalement différente',
      description: "SpreadAPI n'est pas juste un autre convertisseur de fichiers. C'est un moteur de calcul headless qui exécute votre logique Excel en temps réel.",
      card1: { title: 'Pas de téléchargement de fichier', text: "Créez et éditez directement dans le navigateur. Pas besoin de télécharger des fichiers .xlsx." },
      card2: { title: 'Exécution en temps réel', text: "Vos formules s'exécutent à chaque appel API. Pas de valeurs statiques ou de résultats mis en cache." },
      card3: { title: 'Précision 100%', text: "Le moteur Excel natif garantit que chaque formule est calculée exactement comme dans Excel." },
      card4: { title: 'Prêt pour l\'IA', text: "Compatible MCP intégré. Les assistants IA découvrent et utilisent automatiquement vos services." },
      card5: { title: 'Zones éditables', text: "Contrôlez exactement quelles cellules l'IA et les utilisateurs peuvent modifier, protégeant votre logique." },
      card6: { title: 'API REST', text: "API REST standard avec JSON. Fonctionne avec n'importe quel langage ou plateforme." },
    },
    editableAreas: {
      title1: 'Zones éditables',
      title2: "Contrôlez l'accès de l'IA",
      description: "Définissez exactement quelles cellules l'IA et les utilisateurs peuvent lire, écrire ou non — vos formules restent protégées.",
      feature1Title: 'Zones éditables',
      feature1Text: "Les agents IA peuvent écrire de nouvelles valeurs dans les zones éditables désignées, déclenchant un recalcul en temps réel.",
      feature2Title: 'Zones en lecture seule',
      feature2Text: "L'IA peut lire les résultats des zones en lecture seule, mais ne peut pas modifier les données ou formules sous-jacentes.",
      legendEdit: 'Zone éditable (Lecture/Écriture)',
      legendRead: 'Zone lecture seule',
      legendProtected: 'Zone protégée (Invisible)',
    },
    tools: {
      title1: 'Compatible avec',
      title2: 'vos',
      title3: 'outils existants',
      description: "SpreadAPI s'intègre parfaitement avec les outils que vous utilisez déjà. Des assistants IA aux plateformes d'automatisation.",
      cta: 'Commencer maintenant',
    },
    useCases: {
      subheading: "Cas d'utilisation",
      title1: 'Des possibilités',
      title2: 'infinies',
      title3: "d'automatisation",
      case1: { title: 'Tarification & Devis', text: "Calculs de tarification complexes, configurateurs de produits et génération de devis automatisés alimentés par vos modèles Excel." },
      case2: { title: 'Modélisation financière', text: "Exécutez des projections financières, analyses de scénarios et évaluations de risques via des appels API." },
      case3: { title: 'Calcul fiscal', text: "Calculs fiscaux précis utilisant vos feuilles Excel de conformité approuvées." },
      case4: { title: 'Science des données', text: "Alimentez vos pipelines de données avec les résultats des calculs Excel — parfait pour le reporting et l'analyse." },
      case5: { title: 'Opérations commerciales', text: "Automatisez les commissions, la planification des ressources et le scoring des leads avec vos feuilles de calcul existantes." },
      case6: { title: 'Intégrations IA', text: "Les assistants IA accèdent directement à vos calculs Excel — sans approximation ni hallucination." },
    },
    faq: {
      subheading: 'FAQ Développeurs',
      title1: 'Questions techniques',
      title2: 'répondues',
      description: 'Plongez dans les détails techniques. Conçu par des développeurs, pour des développeurs.',
    },
    contact: {
      subheading: 'Contact',
      title1: 'Démarrez',
      title2: 'en minutes',
      text: "Des questions sur SpreadAPI ? Nous sommes là pour vous aider à",
    },
    enterprise: {
      title1: 'Besoin d\'un contrôle total',
      title2: 'sur vos données ?',
      description: 'Vous travaillez dans un secteur où la conformité et la sécurité des données sont incontournables ? Avec SpreadAPI Runtime, déployez vos API Excel entièrement sur votre propre infrastructure. Aucune donnée ne quitte jamais votre réseau.',
      cta: 'Découvrir l\'offre On-Premises',
    },
    excelApi: {
      subheading: 'Comment ça marche',
      title1: 'Votre logique Excel,',
      title2: 'disponible partout',
      description: 'Téléchargez votre feuille de calcul. Définissez les entrées et sorties. Obtenez une API REST qui exécute vos formules exactes en millisecondes.',
      step1: {
        title: 'Télécharger Excel',
        description: 'Votre feuille de calcul existante avec toutes ses formules. Rien à modifier.',
      },
      step2: {
        title: 'Définir les paramètres',
        description: 'Marquez les cellules comme entrées et sorties. 2 minutes. Aucun code requis.',
      },
      step3: {
        title: 'Appeler votre API',
        description: 'Requête GET ou POST — renvoie du JSON propre avec les résultats calculés.',
      },
      stat1: { value: '50ms', label: 'Temps de réponse' },
      stat2: { value: '500+', label: 'Fonctions Excel' },
      stat3: { value: '100%', label: 'Précis' },
      stat4: { value: 'Zéro', label: 'Ligne de code' },
      integrations: 'Zapier • Make • n8n • REST API • Python • JavaScript',
      cta: 'Voir comment ça marche',
    },
  },

  es: {
    hero: {
      subheading: 'Hojas de cálculo headless para IA y automatización',
      title1: 'Convierte Excel en APIs en vivo.',
      title2: 'La IA ahora habla hojas de cálculo',
      description: 'Convierta sus hojas de cálculo en servicios web seguros en tiempo real. Dé a los asistentes de IA, herramientas de automatización y desarrolladores acceso directo — sin alucinaciones ni lógica errónea.',
      cta: 'Crea tu primera API Excel gratis',
    },
    painPoints: {
      title1: 'Por qué la IA falla con',
      title2: 'los cálculos de Excel',
      subtitle: 'Le preguntamos a la IA sobre sus habilidades con hojas de cálculo — esto es lo que nos respondió honestamente.',
      card1: {
        title: '"No puedo ejecutar sus fórmulas"',
        text: "Veo sus fórmulas y los resultados de Excel, pero no puedo ejecutarlas. Trabajo con valores guardados, no con cálculos en vivo.",
        author: '- Claude, ChatGPT y Gemini',
      },
      card2: {
        title: '"Solo conozco 50-100 funciones"',
        text: "¿Matemáticas básicas? Claro. Pero Excel tiene cientos más — XIRR, YIELD, fórmulas matriciales. Se me escapan los casos especiales.",
        author: '- Claude, siendo honesto',
      },
      card3: {
        title: '"Mis errores se acumulan rápido"',
        text: "¿Un pequeño error en la celda A1? Para la fila 1000, estoy completamente perdido. La propagación de errores es mi pesadilla.",
        author: '- Todos los modelos de IA',
      },
      card4: {
        title: '"Tardo una eternidad en calcular"',
        text: "¿Más de 1000 fórmulas? Son 2-15 minutos mapeando dependencias. Excel lo hace en 1-2 segundos.",
        author: '- Todos los modelos de IA',
      },
      card5: {
        title: '"¿Modelos complejos? 20% de precisión"',
        text: "Con más de 1000 fórmulas, tengo un 20-40% de probabilidad de acertar. ¿SpreadAPI? Siempre 100%.",
        author: '- Claude y ChatGPT',
      },
      card6: {
        title: '"No puedo manejar dependencias"',
        text: "La celda A depende de B, B de C... Paso la mayor parte del tiempo averiguando el orden, no calculando.",
        author: '- Gemini',
      },
      link: 'Haz clic aquí para ver más limitaciones de la IA →',
    },
    solution: {
      title1: 'Así ayudamos a la IA a',
      title2: 'dominar los cálculos Excel',
      description: 'Transforme sus hojas de cálculo en APIs en tiempo real que la IA puede llamar — sin adivinanzas, sin alucinaciones, solo resultados precisos impulsados por su lógica Excel. Ya sean cálculos simples o cadenas complejas de fórmulas anidadas, su lógica Excel se ejecuta exactamente como la construyó. El resultado: JSON limpio y confiable que asistentes IA, desarrolladores y herramientas de automatización pueden usar — al instante y de forma segura.',
      link: 'Más información sobre la integración IA',
    },
    inAction: 'En Acción',
    feature1: {
      title1: 'Agentes de ventas IA',
      title2: 'creando presupuestos Excel complejos',
      description: "Su asistente de ventas IA ahora puede generar presupuestos precisos usando sus modelos de precios Excel reales. Sin más aproximaciones ni alucinaciones — solo cálculos precisos de sus hojas de cálculo confiables, accesibles a través de una simple API.",
      point1: 'La IA llama a su modelo de precios Excel a través de la API',
      point2: 'Las fórmulas complejas (descuentos, impuestos, envío) las calcula Excel',
      point3: 'Resultados precisos al céntimo — sin suposiciones de la IA',
      chatCustomer: 'Cliente:',
      chatAI: 'Asistente de Ventas IA:',
      basePrice: 'Precio base',
      enterpriseDiscount: 'Descuento empresarial',
      volumeDiscount: 'Descuento por volumen',
      shipping: 'Envío',
      salesTax: 'IVA',
      totalQuote: 'Presupuesto Total',
      calcNote: 'Calculado por su modelo de precios Excel',
      downloadPdf: 'Descargar PDF del presupuesto',
    },
    feature2: {
      title1: 'Agentes de ventas IA',
      title2: 'con acceso directo a datos',
      description: "Dé a sus agentes IA acceso de lectura/escritura a zonas designadas de la hoja de cálculo. Pueden actualizar precios, ajustar parámetros y leer resultados — mientras sus fórmulas permanecen protegidas.",
      point1: 'La IA lee y escribe directamente en las zonas editables de la hoja',
      point2: 'Las fórmulas permanecen protegidas e invisibles para los agentes IA',
      point3: 'Perfecto para precios dinámicos y análisis en tiempo real',
    },
    feature3: {
      title1: 'Un futuro donde',
      title2: 'la IA falla en matemáticas',
      description: "La IA es poderosa, pero tiene dificultades con cálculos complejos de tipo hoja de cálculo. SpreadAPI cierra esa brecha dejando que Excel haga lo que mejor sabe hacer.",
      point1Title: 'El problema',
      point1Text: 'Los modelos de IA no pueden ejecutar fórmulas Excel de forma fiable, especialmente modelos complejos con dependencias.',
      point2Title: 'La solución',
      point2Text: 'SpreadAPI deja que Excel maneje los cálculos mientras la IA se enfoca en interpretar resultados e interactuar con los usuarios.',
      link: 'Leer nuestro artículo: Por qué la IA falla en matemáticas →',
    },
    differentiators: {
      subheading: 'Por qué SpreadAPI',
      title1: 'Un enfoque',
      title2: 'fundamentalmente diferente',
      description: 'SpreadAPI no es solo otro convertidor de archivos. Es un motor de cálculo headless que ejecuta su lógica Excel en tiempo real.',
      card1: { title: 'Sin subir archivos', text: 'Cree y edite directamente en el navegador. No necesita subir archivos .xlsx.' },
      card2: { title: 'Ejecución en tiempo real', text: 'Sus fórmulas se ejecutan en cada llamada API. Sin valores estáticos ni resultados en caché.' },
      card3: { title: '100% de precisión', text: 'El motor Excel nativo garantiza que cada fórmula se calcula exactamente como en Excel.' },
      card4: { title: 'Listo para IA', text: 'Compatibilidad MCP integrada. Los asistentes IA descubren y usan automáticamente sus servicios.' },
      card5: { title: 'Zonas editables', text: 'Controle exactamente qué celdas puede modificar la IA y los usuarios, protegiendo su lógica.' },
      card6: { title: 'API REST', text: 'API REST estándar con JSON. Funciona con cualquier lenguaje o plataforma.' },
    },
    editableAreas: {
      title1: 'Zonas editables',
      title2: 'Controle el acceso de la IA',
      description: 'Defina exactamente qué celdas la IA y los usuarios pueden leer, escribir o no — sus fórmulas permanecen protegidas.',
      feature1Title: 'Zonas editables',
      feature1Text: 'Los agentes IA pueden escribir nuevos valores en las zonas editables designadas, activando un recálculo en tiempo real.',
      feature2Title: 'Zonas de solo lectura',
      feature2Text: 'La IA puede leer resultados de las zonas de solo lectura, pero no puede modificar los datos o fórmulas subyacentes.',
      legendEdit: 'Zona editable (Lectura/Escritura)',
      legendRead: 'Zona de solo lectura',
      legendProtected: 'Zona protegida (Invisible)',
    },
    tools: {
      title1: 'Compatible con',
      title2: 'sus',
      title3: 'herramientas existentes',
      description: 'SpreadAPI se integra perfectamente con las herramientas que ya usa. Desde asistentes IA hasta plataformas de automatización.',
      cta: 'Empezar ahora',
    },
    useCases: {
      subheading: 'Casos de uso',
      title1: 'Posibilidades',
      title2: 'infinitas',
      title3: 'de automatización',
      case1: { title: 'Precios y presupuestos', text: 'Cálculos de precios complejos, configuradores de productos y generación automatizada de presupuestos impulsados por sus modelos Excel.' },
      case2: { title: 'Modelado financiero', text: 'Ejecute proyecciones financieras, análisis de escenarios y evaluaciones de riesgo mediante llamadas API.' },
      case3: { title: 'Cálculo fiscal', text: 'Cálculos fiscales precisos usando sus hojas Excel de cumplimiento aprobadas.' },
      case4: { title: 'Ciencia de datos', text: 'Alimente sus pipelines de datos con resultados de cálculos Excel — perfecto para informes y análisis.' },
      case5: { title: 'Operaciones comerciales', text: 'Automatice comisiones, planificación de recursos y puntuación de leads con sus hojas de cálculo existentes.' },
      case6: { title: 'Integraciones IA', text: 'Los asistentes IA acceden directamente a sus cálculos Excel — sin aproximaciones ni alucinaciones.' },
    },
    faq: {
      subheading: 'FAQ para desarrolladores',
      title1: 'Preguntas técnicas',
      title2: 'respondidas',
      description: 'Profundice en los detalles técnicos. Hecho por desarrolladores, para desarrolladores.',
    },
    contact: {
      subheading: 'Contacto',
      title1: 'Empiece',
      title2: 'en minutos',
      text: '¿Preguntas sobre SpreadAPI? Estamos aquí para ayudarle en',
    },
    enterprise: {
      title1: 'Necesita control total',
      title2: 'sobre sus datos?',
      description: '¿Trabaja en un sector donde el cumplimiento normativo y la seguridad de los datos son innegociables? Con SpreadAPI Runtime, despliegue sus APIs Excel completamente en su propia infraestructura. Ningún dato abandona jamás su red.',
      cta: 'Descubrir On-Premises',
    },
    excelApi: {
      subheading: 'Cómo funciona',
      title1: 'Su lógica Excel,',
      title2: 'disponible en todas partes',
      description: 'Suba su hoja de cálculo. Defina entradas y salidas. Obtenga una API REST que ejecuta sus fórmulas exactas en milisegundos.',
      step1: {
        title: 'Subir Excel',
        description: 'Su hoja de cálculo existente con todas sus fórmulas. Nada que cambiar.',
      },
      step2: {
        title: 'Definir parámetros',
        description: 'Marque celdas como entradas y salidas. 2 minutos. Sin código.',
      },
      step3: {
        title: 'Llamar a su API',
        description: 'Solicitud GET o POST — devuelve JSON limpio con resultados calculados.',
      },
      stat1: { value: '50ms', label: 'Tiempo de respuesta' },
      stat2: { value: '500+', label: 'Funciones Excel' },
      stat3: { value: '100%', label: 'Preciso' },
      stat4: { value: 'Cero', label: 'Líneas de código' },
      integrations: 'Zapier • Make • n8n • REST API • Python • JavaScript',
      cta: 'Ver cómo funciona',
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
    link: string;
  };
  inAction: string;
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
  enterprise: {
    title1: string;
    title2: string;
    description: string;
    cta: string;
  };
  excelApi: {
    subheading: string;
    title1: string;
    title2: string;
    description: string;
    step1: { title: string; description: string };
    step2: { title: string; description: string };
    step3: { title: string; description: string };
    stat1: { value: string; label: string };
    stat2: { value: string; label: string };
    stat3: { value: string; label: string };
    stat4: { value: string; label: string };
    integrations: string;
    cta: string;
  };
}

// Helper function to get homepage translations
export function getHomepageTranslations(locale: SupportedLocale): HomepageTranslations {
  if (locale === 'de') {
    return homepage.de;
  }
  if (locale === 'fr') {
    return homepage.fr;
  }
  if (locale === 'es') {
    return homepage.es;
  }
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
      pricing: 'Pricing',
      login: 'Login',
    },
    // Footer
    footer: {
      product: 'Product',
      excelToApi: 'Excel to API',
      howItWorks: 'How it Works',
      forDevelopers: 'For Developers',
      forAutomations: 'For Automations',
      aiIntegration: 'AI Integration',
      enterprise: 'Enterprise',
      documentation: 'Documentation',
      pricing: 'Pricing',
      security: 'Security',
      resources: 'Resources',
      company: 'Company',
      about: 'About',
      blog: 'Blog',
      status: 'Status',
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
      pricing: 'Preise',
      login: 'Login',
    },
    footer: {
      product: 'Produkt',
      excelToApi: 'Excel zu API',
      howItWorks: 'So funktioniert\'s',
      forDevelopers: 'Für Entwickler',
      forAutomations: 'Für Automation',
      aiIntegration: 'KI-Integration',
      enterprise: 'Enterprise',
      documentation: 'Dokumentation',
      pricing: 'Preise',
      security: 'Sicherheit',
      resources: 'Ressourcen',
      company: 'Unternehmen',
      about: 'Über uns',
      blog: 'Blog',
      status: 'Status',
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
      pricing: 'Tarifs',
      login: 'Connexion',
    },
    footer: {
      product: 'Produit',
      excelToApi: 'Excel vers API',
      howItWorks: 'Comment ça marche',
      forDevelopers: 'Pour Développeurs',
      forAutomations: 'Pour Automations',
      aiIntegration: 'Intégration IA',
      enterprise: 'Enterprise',
      documentation: 'Documentation',
      pricing: 'Tarifs',
      security: 'Sécurité',
      resources: 'Ressources',
      company: 'Entreprise',
      about: 'À propos',
      blog: 'Blog',
      status: 'Statut',
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
      pricing: 'Precios',
      login: 'Iniciar sesión',
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
      security: 'Seguridad',
      resources: 'Recursos',
      company: 'Empresa',
      about: 'Nosotros',
      blog: 'Blog',
      status: 'Estado',
      contact: 'Contacto',
      description: 'SpreadAPI conecta Excel con IA, convirtiendo su lógica de negocio en APIs seguras e instantáneas. Sus hojas de cálculo se convierten en motores de cálculo que la IA puede acceder sin ver sus fórmulas.',
      copyright: '© {year} Airrange.io. Todos los derechos reservados.',
      privacyPolicy: 'Privacidad',
      termsOfService: 'Términos',
      enterprise: 'Enterprise',
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
    pricing?: string;
    login?: string;
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
    status?: string;
    contact: string;
    description: string;
    copyright: string;
    privacyPolicy: string;
    termsOfService: string;
    enterprise?: string;
    security?: string;
    resources?: string;
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

  fr: {
    hero: {
      subheading: 'Documentation',
      title: 'Comment fonctionne SpreadAPI',
      description: 'Transformez vos feuilles de calcul en APIs puissantes, appelables par des applications, des assistants IA, ou intégrées dans n\'importe quel workflow. Votre expertise Excel devient instantanément accessible.',
    },
    overview: {
      title1: 'Transformez vos feuilles de calcul',
      title2: 'en APIs intelligentes',
      description: 'SpreadAPI comble le fossé entre l\'expertise en tableurs et les applications modernes. Vos calculs complexes, votre logique métier et vos modèles de données deviennent instantanément accessibles via des endpoints API propres, utilisables par tout développeur ou assistant IA.',
      point1: 'Aucune programmation requise — utilisez vos compétences Excel',
      point2: 'Génération instantanée d\'API à partir de n\'importe quel tableur',
      point3: 'Prêt pour l\'IA avec intégration MCP',
      imageAlt: 'Importez votre feuille de calcul',
    },
    concepts: {
      subheading: 'Concepts clés',
      title1: 'Trois composants',
      title2: 'fondamentaux',
      input: {
        title: 'Paramètres d\'entrée',
        description: 'Définissez les cellules qui reçoivent des valeurs lors de l\'appel de votre API. Comme des arguments de fonction, ce sont les valeurs fournies pour déclencher les calculs.',
        example: 'Cellule B2 : taux_interet\nCellule B3 : montant_pret\nCellule B4 : duree_annees',
      },
      output: {
        title: 'Paramètres de sortie',
        description: 'Spécifiez les cellules contenant les résultats à renvoyer. Ces valeurs calculées constituent la réponse de votre API, livrée sous forme de données JSON.',
        example: 'Cellule E2 : mensualite\nCellule E3 : total_interets\nCellule E4 : total_paye',
      },
      editable: {
        title: 'Zones modifiables (IA)',
        description: 'Permettez aux assistants IA d\'interagir directement avec des plages de cellules. Idéal pour l\'analyse de données, les scénarios hypothétiques et la génération de formules.',
        example: 'Plage A1:D10\nPermissions : Lecture/Écriture\nL\'IA peut expérimenter librement',
      },
    },
    workflow: {
      subheading: 'Workflow API',
      title1: 'Du',
      title2: 'tableur à l\'API',
      title3: 'en quelques minutes',
      step1: {
        title: 'Importer et configurer',
        description: 'Importez votre fichier Excel et sélectionnez les cellules d\'entrée et de sortie. Aucune programmation nécessaire.',
      },
      step2: {
        title: 'Tester et valider',
        description: 'Testez votre API avec des valeurs d\'exemple. Consultez les résultats instantanément. Affinez selon vos besoins.',
      },
      step3: {
        title: 'Publier et partager',
        description: 'Obtenez votre endpoint API unique. Partagez-le avec des développeurs ou connectez des assistants IA.',
      },
      step4: {
        title: 'Appeler et calculer',
        description: 'Envoyez des entrées, recevez des résultats. Votre logique de tableur s\'exécute dans le cloud.',
      },
      flowTitle: 'Le flux API',
      flow1: {
        title: 'Appel API reçu',
        description: 'Votre service reçoit une requête avec les valeurs d\'entrée',
      },
      flow2: {
        title: 'Entrées appliquées',
        description: 'Les valeurs sont insérées dans les cellules désignées',
      },
      flow3: {
        title: 'Calcul',
        description: 'Les formules sont automatiquement recalculées',
      },
      flow4: {
        title: 'Réponse envoyée',
        description: 'Les résultats sont renvoyés au format JSON',
      },
    },
    example: {
      title1: 'Exemple concret :',
      title2: 'Calculateur de prêt',
      description: 'Découvrez comment une simple feuille de calcul de prêt devient une API puissante. Les paramètres d\'entrée alimentent la fonction VPM d\'Excel, et la mensualité calculée est renvoyée instantanément.',
      inputCells: 'Cellules d\'entrée',
      inputCellsExample: 'B2 : montant_pret, B3 : taux_interet, B4 : duree_annees',
      excelFormula: 'Formule Excel',
      requestLabel: 'Requête API',
      responseLabel: 'Réponse API',
    },
    aiIntegration: {
      subheading: 'Intégration IA',
      title1: 'Conçu pour les',
      title2: 'assistants IA',
      description: 'SpreadAPI prend en charge le protocole MCP (Model Context Protocol), permettant aux assistants IA comme Claude de découvrir et d\'utiliser automatiquement vos services de tableur.',
      feature1: {
        title: 'Découverte automatique',
        description: 'Les assistants IA trouvent et comprennent automatiquement vos services disponibles',
      },
      feature2: {
        title: 'Langage naturel',
        description: 'Les utilisateurs peuvent demander des calculs en langage courant — l\'IA s\'occupe du reste',
      },
      feature3: {
        title: 'Analyse interactive',
        description: 'L\'IA peut exploiter les zones modifiables pour effectuer des analyses de données complexes',
      },
      feature4: {
        title: 'Automatisation des workflows',
        description: 'Combinez plusieurs services pour créer des workflows sophistiqués pilotés par l\'IA',
      },
      exampleTitle: 'Exemple : Interaction avec un assistant IA',
      exampleUser: 'Utilisateur :',
      exampleUserText: '« Calculez la mensualité pour un prêt de 300 000 € à 4,5 % sur 30 ans »',
      exampleAssistant: 'Claude :',
      exampleAssistantText: '« Je vais calculer cela pour vous à l\'aide du service de calcul de prêt... »',
      exampleCalling: 'Appel : spreadapi_calc_calculateur_pret',
      exampleResult: 'Résultat :',
      exampleResultText: 'Votre mensualité serait de 1 520,06 €',
    },
    bestPractices: {
      title1: 'Bonnes pratiques',
      title2: 'pour réussir',
      practice1: {
        label: 'Nommage clair :',
        text: 'Utilisez des noms explicites comme « taux_interet » plutôt que « entree1 »',
      },
      practice2: {
        label: 'Validation :',
        text: 'Définissez des valeurs min/max pour éviter les erreurs de calcul',
      },
      practice3: {
        label: 'Documentation :',
        text: 'Ajoutez des descriptions pour aider les utilisateurs à comprendre les paramètres',
      },
      practice4: {
        label: 'Gestion des erreurs :',
        text: 'Utilisez SIERREUR() dans vos formules pour plus de robustesse',
      },
      practice5: {
        label: 'Tester d\'abord :',
        text: 'Testez toujours votre API avant de la publier',
      },
      practice6: {
        label: 'Contexte IA :',
        text: 'Fournissez des descriptions claires pour faciliter la compréhension par l\'IA',
      },
    },
  },

  es: {
    hero: {
      subheading: 'Documentación',
      title: 'Cómo funciona SpreadAPI',
      description: 'Transforme sus hojas de cálculo en APIs potentes que pueden ser invocadas por aplicaciones, asistentes de IA o integradas en cualquier flujo de trabajo. Su experiencia en Excel se vuelve accesible al instante.',
    },
    overview: {
      title1: 'Transforme hojas de cálculo',
      title2: 'en APIs inteligentes',
      description: 'SpreadAPI conecta la experiencia en hojas de cálculo con las aplicaciones modernas. Sus cálculos complejos, lógica de negocio y modelos de datos se vuelven accesibles al instante a través de endpoints API limpios que cualquier desarrollador o asistente de IA puede utilizar.',
      point1: 'Sin programación — utilice sus conocimientos de Excel',
      point2: 'Generación instantánea de API desde cualquier hoja de cálculo',
      point3: 'Preparado para IA con integración MCP',
      imageAlt: 'Cargue su hoja de cálculo',
    },
    concepts: {
      subheading: 'Conceptos clave',
      title1: 'Tres componentes',
      title2: 'fundamentales',
      input: {
        title: 'Parámetros de entrada',
        description: 'Defina qué celdas reciben valores cuando se llama a su API. Como argumentos de función, son los valores que los usuarios proporcionan para activar los cálculos.',
        example: 'Celda B2: tasa_interes\nCelda B3: monto_prestamo\nCelda B4: plazo_anios',
      },
      output: {
        title: 'Parámetros de salida',
        description: 'Especifique qué celdas contienen los resultados a devolver. Estos valores calculados conforman la respuesta de su API, entregada como datos JSON.',
        example: 'Celda E2: cuota_mensual\nCelda E3: total_intereses\nCelda E4: total_pagado',
      },
      editable: {
        title: 'Áreas editables (IA)',
        description: 'Permita que los asistentes de IA interactúen directamente con rangos de celdas. Ideal para análisis de datos, escenarios hipotéticos y generación de fórmulas.',
        example: 'Rango A1:D10\nPermisos: Lectura/Escritura\nLa IA puede experimentar libremente',
      },
    },
    workflow: {
      subheading: 'Flujo de trabajo API',
      title1: 'De la',
      title2: 'hoja de cálculo a la API',
      title3: 'en minutos',
      step1: {
        title: 'Cargar y configurar',
        description: 'Cargue su archivo Excel y seleccione las celdas de entrada y salida. Sin necesidad de programar.',
      },
      step2: {
        title: 'Probar y validar',
        description: 'Pruebe su API con valores de ejemplo. Vea los resultados al instante. Ajuste según sea necesario.',
      },
      step3: {
        title: 'Publicar y compartir',
        description: 'Obtenga su endpoint API único. Compártalo con desarrolladores o conecte asistentes de IA.',
      },
      step4: {
        title: 'Llamar y calcular',
        description: 'Envíe entradas, reciba resultados. Su lógica de hoja de cálculo se ejecuta en la nube.',
      },
      flowTitle: 'El flujo API',
      flow1: {
        title: 'Llamada API recibida',
        description: 'Su servicio recibe una solicitud con los valores de entrada',
      },
      flow2: {
        title: 'Entradas aplicadas',
        description: 'Los valores se insertan en las celdas designadas',
      },
      flow3: {
        title: 'Cálculo',
        description: 'Las fórmulas se recalculan automáticamente',
      },
      flow4: {
        title: 'Respuesta enviada',
        description: 'Los resultados se devuelven en formato JSON',
      },
    },
    example: {
      title1: 'Ejemplo práctico:',
      title2: 'Calculadora de préstamos',
      description: 'Vea cómo una simple hoja de cálculo de préstamos se convierte en una API potente. Los parámetros de entrada alimentan la función PAGO de Excel, y la cuota mensual calculada se devuelve al instante.',
      inputCells: 'Celdas de entrada',
      inputCellsExample: 'B2: monto_prestamo, B3: tasa_interes, B4: plazo_anios',
      excelFormula: 'Fórmula Excel',
      requestLabel: 'Solicitud API',
      responseLabel: 'Respuesta API',
    },
    aiIntegration: {
      subheading: 'Integración IA',
      title1: 'Diseñado para',
      title2: 'asistentes de IA',
      description: 'SpreadAPI es compatible con MCP (Model Context Protocol), lo que permite a asistentes de IA como Claude descubrir y utilizar automáticamente sus servicios de hojas de cálculo.',
      feature1: {
        title: 'Descubrimiento automático',
        description: 'Los asistentes de IA encuentran y comprenden automáticamente sus servicios disponibles',
      },
      feature2: {
        title: 'Lenguaje natural',
        description: 'Los usuarios pueden solicitar cálculos en lenguaje cotidiano — la IA se encarga del resto',
      },
      feature3: {
        title: 'Análisis interactivo',
        description: 'La IA puede trabajar con áreas editables para realizar análisis de datos complejos',
      },
      feature4: {
        title: 'Automatización de flujos',
        description: 'Combine múltiples servicios en flujos de trabajo sofisticados impulsados por IA',
      },
      exampleTitle: 'Ejemplo: Interacción con un asistente de IA',
      exampleUser: 'Usuario:',
      exampleUserText: '«Calcule la cuota mensual de un préstamo de 300.000 € al 4,5 % a 30 años»',
      exampleAssistant: 'Claude:',
      exampleAssistantText: '«Voy a calcularlo usando el servicio de calculadora de préstamos...»',
      exampleCalling: 'Llamada: spreadapi_calc_calculadora_prestamos',
      exampleResult: 'Resultado:',
      exampleResultText: 'Su cuota mensual sería de 1.520,06 €',
    },
    bestPractices: {
      title1: 'Buenas prácticas',
      title2: 'para el éxito',
      practice1: {
        label: 'Nombres claros:',
        text: 'Utilice nombres descriptivos como «tasa_interes» en lugar de «entrada1»',
      },
      practice2: {
        label: 'Validación:',
        text: 'Establezca valores mínimos y máximos para evitar errores de cálculo',
      },
      practice3: {
        label: 'Documentación:',
        text: 'Agregue descripciones para ayudar a los usuarios a comprender los parámetros',
      },
      practice4: {
        label: 'Gestión de errores:',
        text: 'Utilice SI.ERROR() en las fórmulas para mayor robustez',
      },
      practice5: {
        label: 'Probar primero:',
        text: 'Siempre pruebe su API antes de publicarla',
      },
      practice6: {
        label: 'Contexto IA:',
        text: 'Proporcione descripciones claras para facilitar la comprensión de la IA',
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
  if (locale === 'fr') {
    return howItWorksPage.fr;
  }
  if (locale === 'es') {
    return howItWorksPage.es;
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

  fr: {
    hero: {
      subheading: 'Pour les développeurs',
      title1: 'Arrêtez de réécrire',
      title2: 'Excel en code',
      description: 'Votre tableur fonctionne déjà. Transformez-le en API en quelques minutes — pas en mois. Supprimez des milliers de lignes de code de traduction de formules. Livrez plus vite avec une précision de 100%.',
      cta: 'Essai gratuit',
      ctaSecondary: 'Voir comment ça marche',
    },
    scenario: {
      title1: '« Convertis juste cet Excel en code »',
      title2: ', qu\'ils disaient.',
      description1: 'On est tous passés par là. Le métier vous remet un tableur — son modèle tarifaire, calculateur financier ou configurateur technique. Des années de logique affinée dans ces cellules.',
      description2: '« Tu peux juste mettre ça sur le site ? » demandent-ils. Ça paraît simple. Trois mois plus tard, vous déboguez encore pourquoi votre JavaScript ne correspond pas à Excel.',
      pmTitle: 'Chef de produit',
      pmText: '« C\'est juste un fichier Excel avec quelques formules. Ça devrait aller vite, non ? »',
      devTitle: 'Développeur (3 mois plus tard)',
      devText: '« Les chiffres sont décalés de 0,3%. La finance dit que c\'est faux. Je débogue des cas limites RECHERCHEV depuis deux semaines... »',
    },
    complexity: {
      subheading: 'La complexité cachée',
      title1: 'Pourquoi convertir Excel en code est',
      title2: 'plus difficile qu\'il n\'y paraît',
      card1: {
        title: 'Traduction de formules',
        description: 'Une seule formule Excel devient des dizaines de lignes de code. RECHERCHEV à elle seule nécessite une logique de recherche, la gestion des erreurs et l\'indexation commençant à 1.',
        excelLabel: 'Excel :',
        jsLabel: 'JavaScript :',
        jsCode: '// 50+ lignes de code...',
      },
      card2: {
        title: 'Dépendances cachées',
        description: 'Cette formule référence d\'autres feuilles, des plages nommées et des sources de données externes. Votre code doit recréer un graphe de dépendances complet.',
        list: ['Références inter-feuilles', 'Plages nommées', 'Logique de mise en forme conditionnelle', 'Règles de validation des données'],
      },
      card3: {
        title: 'Fonctions spécifiques à Excel',
        description: 'JOURSEM, VPM, TRI.PAIEMENTS, SOMMEPROD... Excel dispose de plus de 500 fonctions. Chacune nécessite une implémentation JavaScript parfaite.',
        note: '→ Logique des week-ends + gestion des jours fériés + correspondance du système de dates',
      },
      card4: {
        title: 'Le problème des 1000 formules',
        description: 'Les vrais modèles métier contiennent des centaines ou milliers de formules interconnectées. Les traduire toutes en respectant l\'ordre de calcul ? Un cauchemar.',
        example: 'Exemple concret : un configurateur de prix avec coûts matériaux, remises volumes, ajustements régionaux, frais de livraison, règles fiscales et calculs de marge.',
      },
      card5: {
        title: 'Cas limites et arrondis',
        description: 'Excel gère l\'arithmétique en virgule flottante, les limites de dates et les cellules vides de manière spécifique. Votre code sera « proche » mais jamais exactement juste.',
        warning: '« Les chiffres sont décalés de 0,01% — la finance dit que c\'est faux. »',
      },
      card6: {
        title: 'Le problème de synchronisation',
        description: 'Le métier met à jour le fichier Excel chaque trimestre. Votre code est désormais obsolète. Tout retraduire ? À. Chaque. Fois.',
        cycle: 'Le cycle : Excel change → Le code casse → Le développeur corrige → Répéter indéfiniment',
      },
    },
    cost: {
      subheading: 'Le coût réel',
      title1: 'Ce que la conversion Excel en code',
      title2: 'coûte vraiment',
      stat1: { value: '2-6', label: 'Mois', description: 'Temps d\'implémentation initiale' },
      stat2: { value: '70-95%', label: 'Précision', description: 'Des cas limites toujours manqués' },
      stat3: { value: '∞', label: 'Maintenance', description: 'Chaque modification Excel = plus de travail' },
    },
    solution: {
      title1: 'Et si vous n\'aviez',
      title2: 'pas à le faire ?',
      description1: 'Le tableur fonctionne déjà. Les formules sont testées. Le métier fait confiance aux chiffres.',
      description2: 'Alors pourquoi tout réécrire ?',
      description3: 'Avec SpreadAPI, Excel est votre moteur de calcul. Importez votre tableur, définissez les entrées et sorties, et obtenez une API. Les formules originales s\'exécutent — pas une traduction.',
      badge1: 'Précision à 100%',
      badge2: 'Minutes, pas mois',
      badge3: 'Zéro maintenance',
      beforeLabel: 'AVANT : Cauchemar de traduction',
      afterLabel: 'APRÈS : 5 lignes, précision parfaite',
    },
    separation: {
      subheading: 'Architecture propre',
      title1: 'Chacun fait',
      title2: 'ce qu\'il fait de mieux',
      description: 'L\'expert Excel n\'a pas besoin d\'apprendre JavaScript. Le développeur n\'a pas besoin de comprendre le modèle financier. Le métier peut modifier les règles sans déploiement.',
      role1: {
        title: 'Expert Excel',
        description: 'Construit et maintient le modèle de calcul dans l\'environnement familier d\'Excel',
        note: 'Mettre à jour les tarifs ? Enregistrez le tableur. C\'est fait.',
      },
      role2: {
        title: 'Développeur frontend',
        description: 'Consomme l\'API, construit l\'interface, se concentre sur l\'expérience utilisateur',
        note: 'Pas besoin de comprendre des formules financières complexes.',
      },
      role3: {
        title: 'Équipe métier',
        description: 'Met à jour les règles à tout moment — pas de tickets, pas de déploiement, pas d\'attente',
        note: 'Modifier les prix dans Excel → En ligne instantanément.',
      },
    },
    benefits: {
      subheading: 'Qui en bénéficie',
      title1: 'Conçu pour',
      title2: 'tout le monde',
      developers: {
        title: 'Pour les développeurs',
        point1: 'Supprimez des milliers de lignes de code de traduction de formules',
        point2: 'Arrêtez de déboguer « pourquoi ça ne correspond pas à Excel ? »',
        point3: 'Livrez plus vite — en heures plutôt qu\'en mois',
        point4: 'Concentrez-vous sur l\'application, pas sur la traduction de formules',
      },
      nocode: {
        title: 'Pour les créateurs no-code',
        point1: 'Des calculs complexes sans écrire de code',
        point2: 'Connexion à Webflow, Bubble, Zapier via une API simple',
        point3: 'Créez des calculateurs de prix, configurateurs, outils de devis',
        point4: 'Pas besoin de développeur pour la logique de calcul',
      },
    },
    useCases: {
      subheading: 'Exemples concrets',
      title1: 'Ce que les utilisateurs',
      title2: 'construisent avec',
      cases: [
        { icon: '💰', title: 'Moteurs de tarification', description: 'Tarification complexe avec remises volumes, paliers, régions' },
        { icon: '🏠', title: 'Calculateurs hypothécaires', description: 'Mensualités, amortissement, scénarios hypothétiques' },
        { icon: '⚙️', title: 'Configurateurs techniques', description: 'Configurations produit avec dépendances et contraintes' },
        { icon: '📊', title: 'Modèles financiers', description: 'VAN, TRI, projections de flux de trésorerie' },
        { icon: '🚚', title: 'Calculateurs de livraison', description: 'Poids, zones, logique transporteur combinés' },
        { icon: '💼', title: 'Calculateurs de commissions', description: 'Commissions de vente complexes avec paliers et bonus' },
        { icon: '📐', title: 'Calculs d\'ingénierie', description: 'Résistance des matériaux, calculs de charge, facteurs de sécurité' },
        { icon: '🏷️', title: 'Générateurs de devis', description: 'Devis multi-lignes avec toutes les règles métier' },
      ],
    },
    faq: {
      title1: 'Questions',
      title2: 'fréquentes',
      questions: [
        {
          q: '« Qu\'en est-il des performances ? »',
          a: 'Premier appel : 100-200 ms. Appels en cache : <20 ms. Des résultats précis valent bien cette latence minimale — et c\'est toujours plus rapide qu\'attendre 3 mois pour une réimplémentation boguée.',
        },
        {
          q: '« Et si l\'Excel contient des erreurs ? »',
          a: 'Votre réimplémentation aurait les mêmes erreurs — plus les bugs de traduction. Au moins avec SpreadAPI, les chiffres correspondent à ce que le métier attend. Corrigez une fois dans Excel, corrigé partout.',
        },
        {
          q: '« Qu\'en est-il du contrôle de version ? »',
          a: 'SpreadAPI versionne chaque import. Vous pouvez basculer entre les versions via un paramètre API. Traçabilité complète de chaque modification.',
        },
        {
          q: '« Le DAF peut-il l\'auditer ? »',
          a: 'Oui ! Il peut auditer le fichier Excel réellement utilisé — pas des milliers de lignes de JavaScript qu\'il ne comprend pas. C\'est son tableur, en production.',
        },
      ],
    },
    cta: {
      title: 'Prêt à arrêter de réécrire Excel ?',
      description: 'Importez votre tableur. Obtenez une API. Supprimez des milliers de lignes de code. C\'est vraiment aussi simple que ça.',
      button: 'Essai gratuit',
      buttonSecondary: 'Voir comment ça marche',
    },
  },

  es: {
    hero: {
      subheading: 'Para desarrolladores',
      title1: 'Deje de reescribir',
      title2: 'Excel en código',
      description: 'Su hoja de cálculo ya funciona. Conviértala en una API en minutos — no en meses. Elimine miles de líneas de código de traducción de fórmulas. Entregue más rápido con una precisión del 100%.',
      cta: 'Prueba gratuita',
      ctaSecondary: 'Vea cómo funciona',
    },
    scenario: {
      title1: '«Solo convierte este Excel a código»',
      title2: ', dijeron.',
      description1: 'Todos hemos pasado por eso. El negocio le entrega una hoja de cálculo — su modelo de precios, calculadora financiera o configurador técnico. Años de lógica refinada en esas celdas.',
      description2: '«¿Puedes simplemente ponerlo en la web?» preguntan. Parece sencillo. Tres meses después, sigue depurando por qué su JavaScript no coincide con Excel.',
      pmTitle: 'Director de producto',
      pmText: '«Es solo un archivo Excel con algunas fórmulas. Debería ser rápido, ¿no?»',
      devTitle: 'Desarrollador (3 meses después)',
      devText: '«Los números difieren en un 0,3%. Finanzas dice que está mal. Llevo dos semanas depurando casos límite de BUSCARV...»',
    },
    complexity: {
      subheading: 'La complejidad oculta',
      title1: 'Por qué convertir Excel a código es',
      title2: 'más difícil de lo que parece',
      card1: {
        title: 'Traducción de fórmulas',
        description: 'Una sola fórmula de Excel se convierte en decenas de líneas de código. Solo BUSCARV requiere implementar lógica de búsqueda, manejo de errores e indexación basada en 1.',
        excelLabel: 'Excel:',
        jsLabel: 'JavaScript:',
        jsCode: '// 50+ líneas de código...',
      },
      card2: {
        title: 'Dependencias ocultas',
        description: 'Esa fórmula referencia otras hojas, rangos con nombre y fuentes de datos externas. Su código necesita recrear un grafo de dependencias completo.',
        list: ['Referencias entre hojas', 'Rangos con nombre', 'Lógica de formato condicional', 'Reglas de validación de datos'],
      },
      card3: {
        title: 'Funciones específicas de Excel',
        description: 'DIA.LAB, PAGO, TIR.NO.PER, SUMAPRODUCTO... Excel tiene más de 500 funciones. Cada una necesita una implementación perfecta en JavaScript.',
        note: '→ Lógica de fines de semana + gestión de festivos + correspondencia del sistema de fechas',
      },
      card4: {
        title: 'El problema de las 1000 fórmulas',
        description: 'Los modelos de negocio reales tienen cientos o miles de fórmulas interconectadas. ¿Traducirlas todas manteniendo el orden de cálculo? Una pesadilla.',
        example: 'Ejemplo real: un configurador de precios con costes de materiales, descuentos por volumen, ajustes regionales, envío, reglas fiscales y cálculos de margen.',
      },
      card5: {
        title: 'Casos límite y redondeo',
        description: 'Excel maneja la aritmética de punto flotante, los límites de fechas y las celdas vacías de formas específicas. Su código estará «cerca» pero nunca será exacto.',
        warning: '«Los números difieren en un 0,01% — Finanzas dice que está mal.»',
      },
      card6: {
        title: 'El problema de sincronización',
        description: 'El negocio actualiza el archivo Excel cada trimestre. Ahora su código está desactualizado. ¿Retraducir? Cada. Vez.',
        cycle: 'El ciclo: Excel cambia → El código falla → El desarrollador corrige → Repetir indefinidamente',
      },
    },
    cost: {
      subheading: 'El coste real',
      title1: 'Lo que realmente cuesta',
      title2: 'convertir Excel a código',
      stat1: { value: '2-6', label: 'Meses', description: 'Tiempo de implementación inicial' },
      stat2: { value: '70-95%', label: 'Precisión', description: 'Siempre se escapan casos límite' },
      stat3: { value: '∞', label: 'Mantenimiento', description: 'Cada cambio en Excel = más trabajo' },
    },
    solution: {
      title1: '¿Y si no tuviera',
      title2: 'que hacerlo?',
      description1: 'La hoja de cálculo ya funciona. Las fórmulas están probadas. El negocio confía en los números.',
      description2: 'Entonces, ¿por qué reescribirlo?',
      description3: 'Con SpreadAPI, Excel es su motor de cálculo. Suba su hoja de cálculo, defina entradas y salidas, y obtenga una API. Las fórmulas originales se ejecutan — no una traducción.',
      badge1: 'Precisión del 100%',
      badge2: 'Minutos, no meses',
      badge3: 'Cero mantenimiento',
      beforeLabel: 'ANTES: Pesadilla de traducción',
      afterLabel: 'DESPUÉS: 5 líneas, precisión perfecta',
    },
    separation: {
      subheading: 'Arquitectura limpia',
      title1: 'Cada uno hace',
      title2: 'lo que mejor sabe',
      description: 'El experto en Excel no necesita aprender JavaScript. El desarrollador no necesita entender el modelo financiero. El negocio puede actualizar reglas sin necesidad de despliegue.',
      role1: {
        title: 'Experto en Excel',
        description: 'Construye y mantiene el modelo de cálculo en el entorno familiar de Excel',
        note: '¿Actualizar precios? Solo guarde la hoja de cálculo. Listo.',
      },
      role2: {
        title: 'Desarrollador frontend',
        description: 'Consume la API, construye la interfaz, se enfoca en la experiencia de usuario',
        note: 'No necesita entender fórmulas financieras complejas.',
      },
      role3: {
        title: 'Equipo de negocio',
        description: 'Actualiza reglas en cualquier momento — sin tickets, sin despliegues, sin esperas',
        note: 'Cambiar precios en Excel → En línea al instante.',
      },
    },
    benefits: {
      subheading: 'Quién se beneficia',
      title1: 'Diseñado para',
      title2: 'todos',
      developers: {
        title: 'Para desarrolladores',
        point1: 'Elimine miles de líneas de código de traducción de fórmulas',
        point2: 'Deje de depurar «¿por qué no coincide con Excel?»',
        point3: 'Entregue más rápido — horas en lugar de meses',
        point4: 'Concéntrese en la aplicación, no en traducir fórmulas',
      },
      nocode: {
        title: 'Para creadores no-code',
        point1: 'Cálculos complejos sin escribir código',
        point2: 'Conexión con Webflow, Bubble, Zapier mediante una API sencilla',
        point3: 'Cree calculadoras de precios, configuradores, herramientas de presupuesto',
        point4: 'Sin necesidad de desarrollador para la lógica de cálculo',
      },
    },
    useCases: {
      subheading: 'Ejemplos reales',
      title1: 'Lo que los usuarios',
      title2: 'construyen con esto',
      cases: [
        { icon: '💰', title: 'Motores de precios', description: 'Precios complejos con descuentos por volumen, niveles, regiones' },
        { icon: '🏠', title: 'Calculadoras hipotecarias', description: 'Cuotas, amortización, escenarios hipotéticos' },
        { icon: '⚙️', title: 'Configuradores técnicos', description: 'Configuraciones de producto con dependencias y restricciones' },
        { icon: '📊', title: 'Modelos financieros', description: 'VAN, TIR, proyecciones de flujo de caja' },
        { icon: '🚚', title: 'Calculadoras de envío', description: 'Peso, zonas, lógica de transportista combinados' },
        { icon: '💼', title: 'Calculadoras de comisiones', description: 'Comisiones de ventas complejas con niveles y bonificaciones' },
        { icon: '📐', title: 'Cálculos de ingeniería', description: 'Resistencia de materiales, cálculos de carga, factores de seguridad' },
        { icon: '🏷️', title: 'Generadores de presupuestos', description: 'Presupuestos multilínea con todas las reglas de negocio' },
      ],
    },
    faq: {
      title1: 'Preguntas',
      title2: 'frecuentes',
      questions: [
        {
          q: '«¿Qué hay del rendimiento?»',
          a: 'Primera llamada: 100-200 ms. Llamadas en caché: <20 ms. Los resultados precisos valen la mínima latencia — y sigue siendo más rápido que esperar 3 meses por una reimplementación con errores.',
        },
        {
          q: '«¿Y si el Excel tiene errores?»',
          a: 'Su reimplementación tendría los mismos errores — más los errores de traducción. Al menos con SpreadAPI, los números coinciden con lo que el negocio espera. Corrija una vez en Excel, corregido en todas partes.',
        },
        {
          q: '«¿Qué hay del control de versiones?»',
          a: 'SpreadAPI versiona cada carga. Puede cambiar entre versiones mediante un parámetro API. Trazabilidad completa de cada cambio.',
        },
        {
          q: '«¿Puede el director financiero auditarlo?»',
          a: 'Sí. Puede auditar el archivo Excel que se está utilizando realmente — no miles de líneas de JavaScript que no entiende. Es su hoja de cálculo, en producción.',
        },
      ],
    },
    cta: {
      title: '¿Listo para dejar de reescribir Excel?',
      description: 'Suba su hoja de cálculo. Obtenga una API. Elimine miles de líneas de código. Es realmente así de sencillo.',
      button: 'Prueba gratuita',
      buttonSecondary: 'Vea cómo funciona',
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
  if (locale === 'fr') {
    return stopRewritingPage.fr;
  }
  if (locale === 'es') {
    return stopRewritingPage.es;
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

  fr: {
    hero: {
      subheading: 'Excel rencontre l\'IA',
      title1: 'Donnez aux assistants IA',
      title2: 'des superpouvoirs Excel',
      description: 'Imaginez ChatGPT créant des devis parfaits grâce à votre feuille de calcul tarifaire. Ou Claude analysant des scénarios avec vos modèles financiers. SpreadAPI rend cela possible — en quelques minutes, pas en plusieurs mois.',
    },
    gap: {
      title1: 'Le fossé IA-Excel',
      title2: 'auquel tout le monde fait face',
      description: 'Vos fichiers Excel contiennent des années de logique métier affinée. Règles de tarification complexes, modèles financiers, calculs de ressources — le tout perfectionné au fil du temps. Mais quand l\'IA essaie d\'aider, elle :',
      point1: 'Invente des chiffres au lieu de calculer correctement',
      point2: 'Nécessite des copier-coller manuels de données',
      point3: 'Ne peut tout simplement pas accéder à vos formules',
      withoutLabel: 'Sans SpreadAPI :',
      withoutText: '« D\'après mes estimations, le prix serait d\'environ 4 500 €... »',
      withoutError: '❌ Erreur de 823 €',
      withLabel: 'Avec SpreadAPI :',
      withText: '« Selon votre modèle tarifaire, le prix exact est de 3 677,42 € »',
      withSuccess: '✓ 100 % précis, toutes remises incluses',
    },
    setup: {
      subheading: 'Configuration simple',
      title1: 'D\'Excel à prêt pour l\'IA en',
      title2: '3 étapes',
      step1: {
        title: 'Importez votre Excel',
        description: 'Glissez-déposez simplement votre feuille de calcul. SpreadAPI identifie automatiquement vos formules et calculs.',
      },
      step2: {
        title: 'Définissez les paramètres',
        description: 'Sélectionnez les cellules d\'entrée et les plages de sortie en quelques clics. Aucun codage requis — c\'est aussi simple qu\'utiliser Excel.',
      },
      step3: {
        title: 'Connectez à l\'IA',
        description: 'Ajoutez notre serveur MCP à Claude ou utilisez notre API avec ChatGPT. Votre assistant IA dispose désormais de superpouvoirs Excel !',
      },
    },
    possibilities: {
      subheading: 'Possibilités',
      title1: 'Ce qui devient',
      title2: 'possible',
      case1: {
        title: 'Un support client qui ne se trompe jamais sur les prix',
        intro: 'Votre chatbot de support peut désormais :',
        points: ['Générer des devis précis en utilisant vos règles tarifaires exactes', 'Calculer les frais de livraison selon votre modèle logistique', 'Appliquer les bonnes remises pour chaque catégorie de client'],
        quote: '« Notre agent IA traite désormais 80 % des demandes de devis — avec 100 % de précision »',
      },
      case2: {
        title: 'Des équipes commerciales créant des propositions parfaites',
        intro: 'Donnez à votre équipe commerciale les moyens de :',
        points: ['Générer instantanément des devis multi-produits complexes', 'Exécuter des scénarios hypothétiques lors des appels clients', 'Toujours utiliser les tarifs et promotions les plus récents'],
        quote: '« Cycles de vente réduits de 40 % grâce à une tarification instantanée et précise »',
      },
      case3: {
        title: 'Des développeurs créant des applications plus intelligentes',
        intro: 'Permettez à GitHub Copilot et aux assistants de codage IA de :',
        points: ['Utiliser les calculs Excel directement dans le code', 'Générer des cas de test à partir de la logique des feuilles de calcul', 'Créer des interfaces qui correspondent parfaitement aux workflows Excel'],
        quote: '« Plus besoin de recoder les formules Excel — utilisez directement l\'original »',
      },
      case4: {
        title: 'L\'analyse financière à la vitesse de l\'IA',
        intro: 'Permettez à Claude ou ChatGPT de :',
        points: ['Exécuter instantanément des modèles financiers complexes', 'Générer des scénarios d\'investissement avec de vrais calculs', 'Créer des rapports utilisant vos méthodologies exactes'],
        quote: '« L\'IA peut désormais expliquer ET calculer nos projections financières »',
      },
    },
    platforms: {
      subheading: 'Compatibilité universelle',
      title1: 'Fonctionne avec',
      title2: 'toutes les plateformes IA',
      claude: { title: 'Claude Desktop', description: 'Protocole MCP intégré' },
      chatgpt: { title: 'ChatGPT', description: 'Compatible Custom GPT' },
      any: { title: 'Toute plateforme', description: 'API REST & SDKs' },
      demo: {
        title: 'Voyez-le en action',
        claudeTitle: 'Claude Desktop + Excel = Magie',
        featuresTitle: 'De vrais calculs Excel',
        feature1: { title: '100 % précis', description: 'Utilise vos vraies formules Excel' },
        feature2: { title: 'Toujours à jour', description: 'Se met à jour quand vous modifiez Excel' },
        feature3: { title: 'Entièrement sécurisé', description: 'L\'IA ne voit que les résultats, pas les formules' },
      },
    },
    quickSetup: {
      subheading: 'Configuration rapide',
      title1: 'Connectez votre assistant IA en',
      title2: '3 minutes',
      description: 'Choisissez votre plateforme IA et suivez le guide de configuration simple',
      chatgpt: {
        title: 'ChatGPT',
        description: 'Configuration la plus simple avec OAuth — aucun fichier de configuration nécessaire',
        recommended: 'RECOMMANDÉ',
        step1: {
          title: 'Ouvrir les paramètres ChatGPT',
          description: 'Dans ChatGPT, cliquez sur votre icône de profil et accédez à Paramètres → Apps et Connecteurs.',
        },
        step2: {
          title: 'Ajouter SpreadAPI comme serveur MCP',
          description: 'Cliquez sur Créer pour ajouter un nouveau connecteur. Dans le champ « MCP Server URL », collez l\'URL de votre service :',
          note: 'Sélectionnez OAuth comme méthode d\'authentification, puis cliquez sur Créer.',
        },
        step3: {
          title: 'Commencez à utiliser vos calculs Excel !',
          description: 'ChatGPT lancera le flux OAuth. Une fois connecté, votre service apparaît dans la liste des connecteurs. Essayez ces prompts :',
          prompt1: '« Quels paramètres ce service nécessite-t-il ? »',
          prompt2: '« Calcule le devis pour 500 unités avec la remise entreprise »',
        },
      },
      claude: {
        title: 'Claude Desktop',
        description: 'Support MCP natif avec pont NPX automatique',
        step1: {
          title: 'Ouvrir les paramètres de Claude Desktop',
          description: 'Cliquez sur Claude → Paramètres (Mac) ou Fichier → Paramètres (Windows), puis sélectionnez l\'onglet Développeur et cliquez sur Modifier la configuration.',
        },
        step2: {
          title: 'Ajouter la configuration SpreadAPI',
          description: 'Ajoutez ceci à votre fichier claude_desktop_config.json :',
          note: 'Remplacez YOUR_SERVICE_ID par votre identifiant de service réel et your_token_here par votre jeton API de SpreadAPI.',
        },
        step3: {
          title: 'Redémarrez et commencez !',
          description: 'Redémarrez Claude Desktop. Le pont MCP se télécharge automatiquement via NPX. Votre service apparaîtra dans le menu MCP. Essayez ces prompts :',
          prompt1: '« Quels paramètres ce service nécessite-t-il ? »',
          prompt2: '« Compare 3 scénarios de tarification avec ce calculateur »',
        },
      },
      other: {
        title: 'Autres plateformes IA et applications personnalisées',
        description: 'API REST, SDKs et protocole MCP pour toute intégration',
        intro: 'SpreadAPI fonctionne avec toute plateforme prenant en charge les API REST ou le Model Context Protocol (MCP). Idéal pour :',
        items: ['Custom GPTs', 'GitHub Copilot', 'Cursor IDE', 'Zapier / Make', 'n8n Workflows', 'Vos propres applications'],
        seeHow: 'Découvrez comment ça marche →',
        getStarted: 'Commencer gratuitement',
      },
      findUrl: {
        title: 'Où trouver l\'URL de votre service et votre jeton',
        steps: ['Inscrivez-vous sur SpreadAPI et importez votre fichier Excel', 'Définissez vos entrées et sorties (pointer-cliquer, sans codage)', 'Publiez votre service', 'Accédez à Agents → Intégration MCP pour trouver l\'URL de votre service et générer des jetons'],
      },
      help: {
        title: 'Besoin d\'aide ?',
        chatgptIssue: 'Le connecteur ChatGPT ne fonctionne pas ? Assurez-vous d\'avoir terminé le flux OAuth et que votre service est publié',
        claudeIssue: 'Claude ne trouve pas les outils ? Redémarrez Claude Desktop après avoir ajouté la configuration',
        authIssue: 'Erreur d\'authentification ? Vérifiez que votre jeton a été copié correctement',
        contact: 'Toujours bloqué ? Écrivez-nous à',
      },
    },
    contact: {
      subheading: 'Des questions ?',
      title1: 'Nous sommes là pour',
      title2: 'vous aider',
      text: 'Que vous exploriez les possibilités ou que vous soyez prêt à passer à l\'action, nous sommes là pour vous aider à',
    },
  },

  es: {
    hero: {
      subheading: 'Excel se une a la IA',
      title1: 'Dé a los asistentes de IA',
      title2: 'superpoderes de Excel',
      description: 'Imagine a ChatGPT creando presupuestos perfectos con su hoja de cálculo de precios. O a Claude analizando escenarios con sus modelos financieros. SpreadAPI lo hace posible — en minutos, no en meses.',
    },
    gap: {
      title1: 'La brecha entre IA y Excel',
      title2: 'que todos enfrentan',
      description: 'Sus archivos Excel contienen años de lógica de negocio perfeccionada. Reglas de precios complejas, modelos financieros, cálculos de recursos — todo perfeccionado con el tiempo. Pero cuando la IA intenta ayudar:',
      point1: 'Inventa números en lugar de calcular correctamente',
      point2: 'Requiere copiar y pegar datos manualmente',
      point3: 'No puede acceder a las fórmulas de su hoja de cálculo',
      withoutLabel: 'Sin SpreadAPI:',
      withoutText: '« Según mis estimaciones, el precio sería de aproximadamente 4.500 €... »',
      withoutError: '❌ Error de 823 €',
      withLabel: 'Con SpreadAPI:',
      withText: '« Según su modelo de precios, el precio exacto es 3.677,42 € »',
      withSuccess: '✓ 100 % preciso, incluidos todos los descuentos',
    },
    setup: {
      subheading: 'Configuración sencilla',
      title1: 'De Excel a listo para IA en',
      title2: '3 pasos',
      step1: {
        title: 'Suba su archivo Excel',
        description: 'Simplemente arrastre y suelte su hoja de cálculo. SpreadAPI identifica automáticamente sus fórmulas y cálculos.',
      },
      step2: {
        title: 'Defina los parámetros',
        description: 'Seleccione las celdas de entrada y los rangos de salida con unos clics. Sin necesidad de programar — es tan fácil como usar Excel.',
      },
      step3: {
        title: 'Conecte con la IA',
        description: 'Añada nuestro servidor MCP a Claude o utilice nuestra API con ChatGPT. ¡Su asistente de IA ahora tiene superpoderes de Excel!',
      },
    },
    possibilities: {
      subheading: 'Posibilidades',
      title1: 'Lo que se vuelve',
      title2: 'posible',
      case1: {
        title: 'Atención al cliente que nunca se equivoca en los precios',
        intro: 'Su chatbot de soporte ahora puede:',
        points: ['Generar presupuestos precisos usando sus reglas de precios exactas', 'Calcular costes de envío basándose en su modelo logístico', 'Aplicar los descuentos correctos para cada categoría de cliente'],
        quote: '« Nuestro agente IA ahora gestiona el 80 % de las solicitudes de presupuesto — con un 100 % de precisión »',
      },
      case2: {
        title: 'Equipos de ventas creando propuestas perfectas',
        intro: 'Capacite a su equipo de ventas para:',
        points: ['Generar instantáneamente presupuestos complejos de múltiples productos', 'Ejecutar escenarios hipotéticos durante las llamadas con clientes', 'Usar siempre los precios y promociones más actualizados'],
        quote: '« Ciclos de venta reducidos en un 40 % con precios instantáneos y precisos »',
      },
      case3: {
        title: 'Desarrolladores creando aplicaciones más inteligentes',
        intro: 'Permita que GitHub Copilot y los asistentes de codificación con IA:',
        points: ['Utilicen cálculos de Excel directamente en el código', 'Generen casos de prueba a partir de la lógica de las hojas de cálculo', 'Creen interfaces que se ajusten perfectamente a los flujos de trabajo de Excel'],
        quote: '« Ya no es necesario reimplementar fórmulas de Excel — simplemente use el original »',
      },
      case4: {
        title: 'Análisis financiero a la velocidad de la IA',
        intro: 'Permita que Claude o ChatGPT:',
        points: ['Ejecuten modelos financieros complejos al instante', 'Generen escenarios de inversión con cálculos reales', 'Creen informes utilizando sus metodologías exactas'],
        quote: '« La IA ahora puede explicar Y calcular nuestras proyecciones financieras »',
      },
    },
    platforms: {
      subheading: 'Compatibilidad universal',
      title1: 'Funciona con',
      title2: 'todas las plataformas de IA',
      claude: { title: 'Claude Desktop', description: 'Protocolo MCP integrado' },
      chatgpt: { title: 'ChatGPT', description: 'Compatible con Custom GPT' },
      any: { title: 'Cualquier plataforma', description: 'API REST y SDKs' },
      demo: {
        title: 'Véalo en acción',
        claudeTitle: 'Claude Desktop + Excel = Magia',
        featuresTitle: 'Cálculos reales de Excel',
        feature1: { title: '100 % preciso', description: 'Usa sus fórmulas reales de Excel' },
        feature2: { title: 'Siempre actualizado', description: 'Se actualiza cuando modifica Excel' },
        feature3: { title: 'Totalmente seguro', description: 'La IA solo ve resultados, no fórmulas' },
      },
    },
    quickSetup: {
      subheading: 'Configuración rápida',
      title1: 'Conecte su asistente de IA en',
      title2: '3 minutos',
      description: 'Elija su plataforma de IA y siga la guía de configuración sencilla',
      chatgpt: {
        title: 'ChatGPT',
        description: 'La configuración más fácil con OAuth — sin necesidad de archivos de configuración',
        recommended: 'RECOMENDADO',
        step1: {
          title: 'Abrir los ajustes de ChatGPT',
          description: 'En ChatGPT, haga clic en su icono de perfil y navegue a Configuración → Apps y Conectores.',
        },
        step2: {
          title: 'Añadir SpreadAPI como servidor MCP',
          description: 'Haga clic en Crear para añadir un nuevo conector. En el campo « MCP Server URL », pegue la URL de su servicio:',
          note: 'Seleccione OAuth como método de autenticación y haga clic en Crear.',
        },
        step3: {
          title: '¡Empiece a usar sus cálculos de Excel!',
          description: 'ChatGPT iniciará el flujo OAuth. Una vez conectado, su servicio aparecerá en la lista de conectores. Pruebe estos prompts:',
          prompt1: '« ¿Qué parámetros necesita este servicio? »',
          prompt2: '« Calcula el presupuesto para 500 unidades con descuento empresarial »',
        },
      },
      claude: {
        title: 'Claude Desktop',
        description: 'Soporte MCP nativo con puente NPX automático',
        step1: {
          title: 'Abrir los ajustes de Claude Desktop',
          description: 'Haga clic en Claude → Ajustes (Mac) o Archivo → Ajustes (Windows), luego seleccione la pestaña Desarrollador y haga clic en Editar configuración.',
        },
        step2: {
          title: 'Añadir la configuración de SpreadAPI',
          description: 'Añada esto a su archivo claude_desktop_config.json:',
          note: 'Reemplace YOUR_SERVICE_ID con su identificador de servicio real y your_token_here con su token API de SpreadAPI.',
        },
        step3: {
          title: '¡Reinicie y comience!',
          description: 'Reinicie Claude Desktop. El puente MCP se descarga automáticamente vía NPX. Su servicio aparecerá en el menú MCP. Pruebe estos prompts:',
          prompt1: '« ¿Qué parámetros necesita este servicio? »',
          prompt2: '« Compara 3 escenarios de precios con esta calculadora »',
        },
      },
      other: {
        title: 'Otras plataformas de IA y aplicaciones personalizadas',
        description: 'API REST, SDKs y protocolo MCP para cualquier integración',
        intro: 'SpreadAPI funciona con cualquier plataforma que soporte API REST o el Model Context Protocol (MCP). Ideal para:',
        items: ['Custom GPTs', 'GitHub Copilot', 'Cursor IDE', 'Zapier / Make', 'n8n Workflows', 'Sus propias aplicaciones'],
        seeHow: 'Descubra cómo funciona →',
        getStarted: 'Comenzar gratis',
      },
      findUrl: {
        title: 'Dónde encontrar la URL de su servicio y su token',
        steps: ['Regístrese en SpreadAPI y suba su archivo Excel', 'Defina sus entradas y salidas (apuntar y hacer clic, sin programar)', 'Publique su servicio', 'Vaya a Agents → Integración MCP para encontrar la URL de su servicio y generar tokens'],
      },
      help: {
        title: '¿Necesita ayuda?',
        chatgptIssue: '¿El conector de ChatGPT no funciona? Asegúrese de haber completado el flujo OAuth y de que su servicio esté publicado',
        claudeIssue: '¿Claude no encuentra las herramientas? Reinicie Claude Desktop después de añadir la configuración',
        authIssue: '¿Error de autenticación? Verifique que su token se haya copiado correctamente',
        contact: '¿Sigue atascado? Escríbanos a',
      },
    },
    contact: {
      subheading: '¿Preguntas?',
      title1: 'Estamos aquí para',
      title2: 'ayudarle',
      text: 'Ya sea que esté explorando posibilidades o listo para implementar, estamos aquí para ayudarle en',
    },
  },
} as const;

// Helper function to get AI Integration translations
export function getAIIntegrationTranslations(locale: SupportedLocale) {
  if (locale === 'de') {
    return aiIntegrationPage.de;
  }
  if (locale === 'fr') {
    return aiIntegrationPage.fr;
  }
  if (locale === 'es') {
    return aiIntegrationPage.es;
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

  fr: {
    hero: {
      subheading: 'Pour les builders d\'automatisation',
      title1: 'Quand votre automatisation',
      title2: 'doit réfléchir',
      description: 'Zapier déplace les données. Make déclenche des actions. Mais qui fait les calculs ? Vos feuilles Excel peuvent désormais alimenter les calculs complexes que vos automatisations ne maîtrisent pas.',
      cta: 'Commencer gratuitement',
      ctaSecondary: 'Voir comment ça marche',
    },
    platforms: {
      intro: 'Compatible avec vos plateformes d\'automatisation préférées',
    },
    gap: {
      title: 'Le fossé de calcul',
      description1: 'Les plateformes d\'automatisation sont excellentes pour déplacer des données et déclencher des actions. Mais quand vous devez calculer quelque chose de complexe ?',
      description2: 'Vous êtes bloqué. Des SI imbriqués qui cassent. Des champs de formule qui ne gèrent pas votre logique. Des contournements qui ne passent pas à l\'échelle.',
      goodAt: 'Les automatisations excellent dans :',
      goodItems: ['Déclencheurs', 'Transfert de données', 'SI/ALORS simples', 'Appels API', 'Notifications'],
      badAt: 'Les automatisations échouent sur :',
      badItems: ['Tarification multi-variables', 'Scoring pondéré', 'Règles complexes', 'Calculs financiers', 'Arbres de décision'],
    },
    scenarios: {
      subheading: 'Ça vous dit quelque chose ?',
      title1: 'Quand vous aimeriez que votre automatisation',
      title2: 'puisse réfléchir',
      items: [
        { scenario: 'Calculer un devis avec 47 règles tarifaires', icon: '💰' },
        { scenario: 'Scorer des leads avec votre modèle Excel éprouvé', icon: '📊' },
        { scenario: 'Déterminer les frais de livraison pour 12 transporteurs', icon: '🚚' },
        { scenario: 'Vérifier si une commande est éligible aux remises personnalisées', icon: '🏷️' },
        { scenario: 'Calculer les commissions avec accélérateurs et paliers', icon: '💼' },
        { scenario: 'Décider des quantités de réapprovisionnement selon 20 facteurs', icon: '📦' },
      ],
      footer: 'Votre automatisation peut déclencher toute la journée — mais elle ne sait pas calculer.',
    },
    solution: {
      subheading: 'La solution',
      title1: 'Votre feuille de calcul devient',
      title2: 'le cerveau',
      description: 'Vous avez déjà un modèle Excel qui fait exactement ce qu\'il vous faut. SpreadAPI le transforme en endpoint API que votre automatisation peut appeler.',
      flow: {
        trigger: { title: 'Déclencheur', description: 'Nouvelle commande, lead, etc.' },
        calculate: { title: 'Calcul', description: 'Excel fait le calcul' },
        continue: { title: 'Suite', description: 'Utiliser le résultat' },
      },
      flowNote: 'L\'automatisation envoie les données → SpreadAPI exécute vos formules Excel → renvoie le résultat calculé',
    },
    steps: {
      subheading: 'Comment ça marche',
      title1: 'Trois étapes vers des',
      title2: 'automatisations plus intelligentes',
      step1: {
        title: 'Téléversez votre Excel',
        description: 'La feuille de calcul que vous utilisez déjà. Votre modèle tarifaire, matrice de scoring ou moteur de calcul.',
      },
      step2: {
        title: 'Définissez les entrées et sorties',
        description: 'Indiquez à SpreadAPI quelles cellules reçoivent les données de votre automatisation et quelles cellules renvoient les résultats.',
      },
      step3: {
        title: 'Appelez depuis n\'importe quelle plateforme',
        description: 'Utilisez une simple action HTTP/Webhook pour appeler votre API. Compatible avec Zapier, Make, n8n, Power Automate et bien d\'autres.',
      },
    },
    platformIntegration: {
      subheading: 'Intégration plateforme',
      title1: 'Compatible avec',
      title2: 'toutes les plateformes',
      zapier: {
        title: 'Zapier',
        description: 'Utilisez l\'action Webhooks by Zapier pour appeler votre endpoint SpreadAPI entre n\'importe quel déclencheur et action.',
        flow: 'Déclencheur → Webhook (POST vers SpreadAPI) → Utiliser le résultat à l\'étape suivante',
      },
      make: {
        title: 'Make (Integromat)',
        description: 'Ajoutez un module HTTP à votre scénario. Routez en fonction du résultat calculé grâce aux filtres puissants de Make.',
        flow: 'Module → Requête HTTP → Routeur (basé sur le résultat)',
      },
      n8n: {
        title: 'n8n',
        description: 'Utilisez le node HTTP Request dans votre workflow. Branchez la logique en fonction du résultat calculé par SpreadAPI.',
        flow: 'Node → Requête HTTP → Node IF (branchement selon le résultat)',
      },
      powerAutomate: {
        title: 'Power Automate',
        description: 'Ajoutez une action de connecteur HTTP. Utilisez la réponse dans des conditions pour piloter la logique de votre flux.',
        flow: 'Déclencheur → HTTP → Condition → Actions',
      },
    },
    useCases: {
      subheading: 'Cas d\'usage réels',
      title1: 'Ce que les utilisateurs',
      title2: 'construisent réellement',
      cases: [
        {
          icon: '💰',
          title: 'Tarification dynamique',
          description: 'Une commande e-commerce arrive → Calcul du prix personnalisé selon la quantité, le niveau client, les promotions actives et les marges → Mise à jour de la commande avec le prix final.',
          example: 'Exemple : Shopify → Zapier → SpreadAPI (moteur tarifaire) → Mise à jour de la commande',
        },
        {
          icon: '📊',
          title: 'Scoring et routage de leads',
          description: 'Un nouveau lead entre dans le CRM → Scoring avec plus de 50 facteurs pondérés issus de votre modèle éprouvé → Affectation automatique au bon commercial.',
          example: 'Exemple : HubSpot → n8n → SpreadAPI (scoring) → Attribuer le propriétaire',
        },
        {
          icon: '📄',
          title: 'Devis instantanés',
          description: 'Le client remplit un formulaire → Calcul de la tarification complexe avec dépendances, configurations et remises → Génération et envoi du devis PDF.',
          example: 'Exemple : Typeform → Make → SpreadAPI → Générer PDF → E-mail',
        },
        {
          icon: '💼',
          title: 'Calcul de commissions',
          description: 'Affaire marquée comme gagnée → Calcul de la commission avec paliers, accélérateurs, répartition d\'équipe et bonus → Mise à jour du système de paie.',
          example: 'Exemple : Salesforce → Zapier → SpreadAPI → Mettre à jour ADP',
        },
        {
          icon: '📦',
          title: 'Réapprovisionnement intelligent',
          description: 'Vérification quotidienne des stocks → Calcul des quantités optimales de réapprovisionnement en tenant compte des délais, de la saisonnalité et de la trésorerie → Création des bons de commande.',
          example: 'Exemple : Planification → n8n → SpreadAPI → Créer BC dans NetSuite',
        },
        {
          icon: '✅',
          title: 'Approbations intelligentes',
          description: 'Dépense soumise → Évaluation par rapport au budget, aux règles internes et aux historiques → Approbation automatique ou transmission pour examen humain.',
          example: 'Exemple : Expensify → Power Automate → SpreadAPI → Router',
        },
      ],
    },
    comparison: {
      subheading: 'Pourquoi SpreadAPI',
      title1: 'Mieux que les',
      title2: 'alternatives',
      native: {
        problem: { title: 'Formules natives de la plateforme', description: 'Fonctions limitées, SI imbriqués qui cassent, difficiles à maintenir et déboguer.' },
        solution: { title: 'SpreadAPI', description: 'Toute la puissance d\'Excel. Plus de 500 fonctions. Facile à mettre à jour.' },
      },
      code: {
        problem: { title: 'Code personnalisé / fonctions', description: 'Nécessite un développeur, coûteux à construire, lent à modifier.' },
        solution: { title: 'SpreadAPI', description: 'Aucun code requis. L\'équipe métier peut mettre à jour à tout moment.' },
      },
      sheets: {
        problem: { title: 'Intégration Google Sheets', description: 'Lent, limité en débit, expose vos formules, non conçu pour un usage API.' },
        solution: { title: 'SpreadAPI', description: 'Rapide (moins de 100 ms). Sécurisé. Conçu pour les appels API à haut volume.' },
      },
    },
    faq: {
      title1: 'Questions',
      title2: 'fréquentes',
      questions: [
        {
          q: '« Quelle est la rapidité de la réponse API ? »',
          a: 'La plupart des appels répondent en moins de 100 ms. Les feuilles de calcul complexes avec de nombreuses formules prennent 100 à 200 ms. Dans tous les cas, suffisamment rapide pour les workflows d\'automatisation en temps réel.',
        },
        {
          q: '« Et si mon automatisation s\'exécute des milliers de fois par jour ? »',
          a: 'SpreadAPI est conçu pour les volumes élevés. Notre infrastructure gère des millions de calculs. Consultez notre page tarifaire pour les limites de débit de chaque plan.',
        },
        {
          q: '« Puis-je utiliser Google Sheets au lieu d\'Excel ? »',
          a: 'Actuellement, nous nous concentrons sur les fichiers Excel (.xlsx). Vous pouvez exporter Google Sheets au format Excel et téléverser ce fichier. La prise en charge native de Google Sheets est dans notre feuille de route.',
        },
        {
          q: '« Mes données de feuille de calcul sont-elles sécurisées ? »',
          a: 'Votre feuille de calcul et vos données sont chiffrées au repos et en transit. Nous n\'exposons jamais vos formules — uniquement les résultats. Votre propriété intellectuelle reste protégée.',
        },
        {
          q: '« Que se passe-t-il si je mets à jour le fichier Excel ? »',
          a: 'Téléversez la nouvelle version sur SpreadAPI. Votre endpoint API reste le même, mais utilise désormais la logique mise à jour. Aucune modification nécessaire dans vos automatisations.',
        },
      ],
    },
    cta: {
      title: 'Donnez un cerveau à vos automatisations',
      description: 'Arrêtez de créer des contournements pour les calculs complexes. Votre modèle Excel + SpreadAPI = des automatisations plus intelligentes en quelques minutes.',
      button: 'Commencer gratuitement',
      buttonSecondary: 'Voir la documentation',
    },
  },

  es: {
    hero: {
      subheading: 'Para creadores de automatizaciones',
      title1: 'Cuando su automatización',
      title2: 'necesita pensar',
      description: 'Zapier mueve datos. Make activa acciones. Pero, ¿quién hace los cálculos? Sus hojas de Excel ahora pueden impulsar los cálculos complejos que sus automatizaciones no logran resolver.',
      cta: 'Comenzar gratis',
      ctaSecondary: 'Ver cómo funciona',
    },
    platforms: {
      intro: 'Compatible con sus plataformas de automatización favoritas',
    },
    gap: {
      title: 'La brecha de cálculo',
      description1: 'Las plataformas de automatización son excelentes para mover datos y activar acciones. Pero, ¿cuando necesita calcular algo complejo?',
      description2: 'Se queda bloqueado. SI anidados que fallan. Campos de fórmula que no soportan su lógica. Soluciones provisionales que no escalan.',
      goodAt: 'Las automatizaciones son buenas en:',
      goodItems: ['Disparadores', 'Movimiento de datos', 'SI/ENTONCES simples', 'Llamadas API', 'Notificaciones'],
      badAt: 'Las automatizaciones fallan en:',
      badItems: ['Precios multivariable', 'Puntuación ponderada', 'Reglas complejas', 'Cálculos financieros', 'Árboles de decisión'],
    },
    scenarios: {
      subheading: '¿Le resulta familiar?',
      title1: 'Cuando desearía que su automatización',
      title2: 'pudiera pensar',
      items: [
        { scenario: 'Calcular un presupuesto con 47 reglas de precios', icon: '💰' },
        { scenario: 'Puntuar leads con su modelo Excel probado', icon: '📊' },
        { scenario: 'Determinar costos de envío entre 12 transportistas', icon: '🚚' },
        { scenario: 'Verificar si un pedido califica para descuentos personalizados', icon: '🏷️' },
        { scenario: 'Calcular comisiones con aceleradores y niveles', icon: '💼' },
        { scenario: 'Decidir cantidades de reabastecimiento según 20 factores', icon: '📦' },
      ],
      footer: 'Su automatización puede dispararse todo el día — pero no sabe calcular.',
    },
    solution: {
      subheading: 'La solución',
      title1: 'Su hoja de cálculo se convierte en',
      title2: 'el cerebro',
      description: 'Ya tiene un modelo Excel que hace exactamente lo que necesita. SpreadAPI lo convierte en un endpoint API que su automatización puede llamar.',
      flow: {
        trigger: { title: 'Disparador', description: 'Nuevo pedido, lead, etc.' },
        calculate: { title: 'Cálculo', description: 'Excel hace las cuentas' },
        continue: { title: 'Continuar', description: 'Usar el resultado' },
      },
      flowNote: 'La automatización envía datos → SpreadAPI ejecuta sus fórmulas Excel → devuelve el resultado calculado',
    },
    steps: {
      subheading: 'Cómo funciona',
      title1: 'Tres pasos hacia',
      title2: 'automatizaciones más inteligentes',
      step1: {
        title: 'Suba su archivo Excel',
        description: 'La hoja de cálculo que ya utiliza. Su modelo de precios, matriz de puntuación o motor de cálculo.',
      },
      step2: {
        title: 'Defina entradas y salidas',
        description: 'Indique a SpreadAPI qué celdas reciben datos de su automatización y cuáles devuelven resultados.',
      },
      step3: {
        title: 'Llame desde cualquier plataforma',
        description: 'Use una simple acción HTTP/Webhook para llamar a su API. Compatible con Zapier, Make, n8n, Power Automate y más.',
      },
    },
    platformIntegration: {
      subheading: 'Integración de plataformas',
      title1: 'Compatible con',
      title2: 'todas las plataformas',
      zapier: {
        title: 'Zapier',
        description: 'Use la acción Webhooks by Zapier para llamar a su endpoint SpreadAPI entre cualquier disparador y acción.',
        flow: 'Disparador → Webhook (POST a SpreadAPI) → Usar resultado en el siguiente paso',
      },
      make: {
        title: 'Make (Integromat)',
        description: 'Añada un módulo HTTP a su escenario. Enrute según el resultado calculado usando los potentes filtros de Make.',
        flow: 'Módulo → Solicitud HTTP → Router (basado en resultado)',
      },
      n8n: {
        title: 'n8n',
        description: 'Use el nodo HTTP Request en su workflow. Bifurque la lógica según el resultado calculado de SpreadAPI.',
        flow: 'Nodo → Solicitud HTTP → Nodo IF (bifurcación según resultado)',
      },
      powerAutomate: {
        title: 'Power Automate',
        description: 'Añada una acción de conector HTTP. Use la respuesta en condiciones para dirigir la lógica de su flujo.',
        flow: 'Disparador → HTTP → Condición → Acciones',
      },
    },
    useCases: {
      subheading: 'Casos de uso reales',
      title1: 'Lo que la gente',
      title2: 'realmente construye',
      cases: [
        {
          icon: '💰',
          title: 'Precios dinámicos',
          description: 'Llega un pedido de e-commerce → Calcular precio personalizado según cantidad, nivel de cliente, promociones activas y márgenes → Actualizar pedido con el precio final.',
          example: 'Ejemplo: Shopify → Zapier → SpreadAPI (motor de precios) → Actualizar pedido',
        },
        {
          icon: '📊',
          title: 'Scoring y enrutamiento de leads',
          description: 'Un nuevo lead entra en el CRM → Puntuar con más de 50 factores ponderados de su modelo probado → Asignar automáticamente al representante de ventas adecuado.',
          example: 'Ejemplo: HubSpot → n8n → SpreadAPI (scoring) → Asignar propietario',
        },
        {
          icon: '📄',
          title: 'Presupuestos instantáneos',
          description: 'El cliente completa un formulario → Calcular precios complejos con dependencias, configuraciones y descuentos → Generar y enviar presupuesto en PDF.',
          example: 'Ejemplo: Typeform → Make → SpreadAPI → Generar PDF → Correo electrónico',
        },
        {
          icon: '💼',
          title: 'Cálculo de comisiones',
          description: 'Negocio marcado como ganado → Calcular comisión con niveles, aceleradores, reparto de equipo y bonificaciones → Actualizar sistema de nómina.',
          example: 'Ejemplo: Salesforce → Zapier → SpreadAPI → Actualizar ADP',
        },
        {
          icon: '📦',
          title: 'Reabastecimiento inteligente',
          description: 'Revisión diaria de inventario → Calcular cantidades óptimas de reabastecimiento considerando tiempos de entrega, estacionalidad y flujo de caja → Crear órdenes de compra.',
          example: 'Ejemplo: Programación → n8n → SpreadAPI → Crear OC en NetSuite',
        },
        {
          icon: '✅',
          title: 'Aprobaciones inteligentes',
          description: 'Gasto enviado → Evaluar contra presupuesto, reglas de políticas y patrones históricos → Aprobar automáticamente o enviar a revisión humana.',
          example: 'Ejemplo: Expensify → Power Automate → SpreadAPI → Enrutar',
        },
      ],
    },
    comparison: {
      subheading: 'Por qué SpreadAPI',
      title1: 'Mejor que las',
      title2: 'alternativas',
      native: {
        problem: { title: 'Fórmulas nativas de la plataforma', description: 'Funciones limitadas, SI anidados que fallan, difíciles de mantener y depurar.' },
        solution: { title: 'SpreadAPI', description: 'Toda la potencia de Excel. Más de 500 funciones. Fácil de actualizar.' },
      },
      code: {
        problem: { title: 'Código personalizado / funciones', description: 'Requiere un desarrollador, costoso de construir, lento de modificar.' },
        solution: { title: 'SpreadAPI', description: 'Sin código necesario. El equipo de negocio puede actualizar en cualquier momento.' },
      },
      sheets: {
        problem: { title: 'Integración con Google Sheets', description: 'Lento, con límites de tasa, expone sus fórmulas, no diseñado para uso API.' },
        solution: { title: 'SpreadAPI', description: 'Rápido (menos de 100 ms). Seguro. Diseñado para llamadas API de alto volumen.' },
      },
    },
    faq: {
      title1: 'Preguntas',
      title2: 'frecuentes',
      questions: [
        {
          q: '"¿Qué tan rápida es la respuesta de la API?"',
          a: 'La mayoría de las llamadas responden en menos de 100 ms. Las hojas de cálculo complejas con muchas fórmulas tardan entre 100 y 200 ms. En cualquier caso, lo suficientemente rápido para workflows de automatización en tiempo real.',
        },
        {
          q: '"¿Qué pasa si mi automatización se ejecuta miles de veces al día?"',
          a: 'SpreadAPI está diseñado para alto volumen. Nuestra infraestructura maneja millones de cálculos. Consulte nuestra página de precios para conocer los límites de tasa de cada plan.',
        },
        {
          q: '"¿Puedo usar Google Sheets en lugar de Excel?"',
          a: 'Actualmente nos enfocamos en archivos Excel (.xlsx). Puede exportar Google Sheets a formato Excel y subir ese archivo. La compatibilidad nativa con Google Sheets está en nuestra hoja de ruta.',
        },
        {
          q: '"¿Están seguros mis datos de la hoja de cálculo?"',
          a: 'Su hoja de cálculo y sus datos están cifrados en reposo y en tránsito. Nunca exponemos sus fórmulas — solo los resultados. Su propiedad intelectual permanece protegida.',
        },
        {
          q: '"¿Qué sucede si actualizo el archivo Excel?"',
          a: 'Suba la nueva versión a SpreadAPI. Su endpoint API sigue siendo el mismo, pero ahora utiliza la lógica actualizada. No se necesitan cambios en sus automatizaciones.',
        },
      ],
    },
    cta: {
      title: 'Dele un cerebro a sus automatizaciones',
      description: 'Deje de crear soluciones provisionales para cálculos complejos. Su modelo Excel + SpreadAPI = automatizaciones más inteligentes en minutos.',
      button: 'Comenzar gratis',
      buttonSecondary: 'Ver documentación',
    },
  },
} as const;

// Helper function to get Automation page translations
export function getAutomationTranslations(locale: SupportedLocale) {
  if (locale === 'de') {
    return automationPage.de;
  }
  if (locale === 'fr') {
    return automationPage.fr;
  }
  if (locale === 'es') {
    return automationPage.es;
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

// ============================================================================
// On-Premises Page Translations
// ============================================================================

export const onPremisesPage = {
  en: {
    hero: {
      subheading: 'Enterprise & Compliance Ready',
      title1: 'Your Data.',
      title2: 'Your Servers.',
      description: 'Run Excel calculations on your own infrastructure. Perfect for financial services, consulting firms, and any organization where data must never leave the building.',
      ctaPrimary: 'Contact Sales',
      ctaSecondary: 'See How It Works',
    },
    trustBadges: {
      dataSovereignty: 'Full Data Sovereignty',
      zeroDependencies: 'Zero External Dependencies',
      noCloud: 'No Cloud Storage',
      airGapped: 'Air-Gap Compatible Runtime',
    },
    challenge: {
      subheading: 'The Challenge',
      title1: 'Excel Powers Your Business.',
      title2: 'But It Doesn\'t Scale.',
      description: 'Your tax models, pricing engines, and compliance calculations live in Excel. They\'re trusted, audited, and battle-tested. But they\'re stuck on individual desktops.',
      complianceRisk: 'Compliance Risk',
      complianceRiskDesc: 'Cloud solutions mean your sensitive data leaves your network',
      monthsDev: 'Months of Development',
      monthsDevDesc: 'Rewriting Excel logic in code takes forever and introduces bugs',
      noScalability: 'No Scalability',
      noScalabilityDesc: 'One spreadsheet, one user. Can\'t integrate with systems or automation',
    },
    solution: {
      subheading: 'The Solution',
      title1: 'SpreadAPI Runtime:',
      title2: '100% On-Premises',
      description: 'Build your Excel services in the browser. Deploy them on your servers. No data ever touches our cloud.',
      step1Title: 'Build in Your Browser',
      step1Desc: 'Import your Excel file. Define inputs and outputs. Test calculations.',
      step1Highlight: ' Everything stays in your browser memory.',
      step1Notice: 'No data sent to any server during development',
      step2Title: 'Export Service Package',
      step2Desc: 'Click "Export for Runtime" to download a JSON file containing your service configuration.',
      step2Highlight: ' The file downloads directly to your computer.',
      step3Title: 'Deploy to Your Infrastructure',
      step3Desc: 'Run SpreadAPI Runtime on your servers using Docker. Upload the service package.',
      step3Highlight: ' Your calculation API is now live—internally.',
      deployComment: '# Deploy in minutes',
      apiReadyComment: '# Your API is ready at',
    },
    dataFlow: {
      subheading: 'Data Flow',
      title1: 'Zero Data Leaves',
      title2: 'Your Network',
      badge: 'YOUR SECURE NETWORK BOUNDARY',
      yourApps: 'Your Applications',
      yourAppsDesc: 'Web apps, ERP, CRM, internal tools',
      restApi: 'REST API',
      runtime: 'SpreadAPI Runtime',
      runtimeDesc: 'Your server, Docker container',
      noExtDb: 'No external database',
      noOutbound: 'No outbound connections',
      worksOffline: 'Works fully offline',
    },
    enterpriseMode: {
      title1: 'Enterprise Mode:',
      title2: 'Disabled Cloud Save',
      desc1: 'For organizations that need absolute assurance, we offer <strong>Enterprise Mode</strong> where the "Save to Cloud" functionality is completely disabled.',
      desc2: 'Even if an employee tries to save data externally, it\'s architecturally impossible. The button simply doesn\'t exist.',
      badge1: 'Zero trust architecture',
      badge2: 'Prevents accidental leaks',
      badge3: 'Full audit compliance',
      mockTitle: 'Enterprise Mode',
      importExcel: 'Import Excel',
      browserMemory: 'Browser memory only',
      configureTest: 'Configure & Test',
      exportRuntime: 'Export for Runtime',
      downloadsDisk: 'Downloads to your disk',
      saveToCloud: 'Save to Cloud',
      disabledLabel: 'DISABLED in Enterprise Mode',
    },
    techSpecs: {
      subheading: 'Technical Specifications',
      title1: 'Built for',
      title2: 'Enterprise IT',
      deployment: 'Deployment Options',
      deploymentItems: ['Docker container', 'Kubernetes / AKS / EKS / GKE', 'Bare metal / VM', 'Air-gapped environments'],
      performance: 'Performance',
      performanceItems: ['10-50ms typical response time', 'Horizontal scaling supported', 'In-memory workbook caching', 'Handles 1000s of concurrent requests'],
      excelCompat: 'Excel Compatibility',
      excelCompatItems: ['500+ Excel functions', 'XLOOKUP, FILTER, SORT, UNIQUE', 'LET, LAMBDA functions', 'Full array formula support'],
      security: 'Security',
      securityItems: ['No outbound connections required', 'Local file-based storage', 'Optional API authentication', 'Request logging & audit trail'],
      requirements: 'Requirements',
      requirementsItems: ['Node.js 18+ or Docker', '256MB RAM minimum', 'No external database', 'No internet required'],
      restApi: 'REST API',
      restApiItems: ['Standard JSON request/response', 'GET and POST supported', 'OpenAPI documentation', 'Health check endpoint'],
    },
    useCases: {
      subheading: 'Use Cases',
      title1: 'Built for',
      title2: 'Regulated Industries',
      financial: 'Financial Services',
      financialDesc: 'Loan calculations, risk scoring, portfolio valuations',
      consulting: 'Consulting Firms',
      consultingDesc: 'Fee calculations, engagement pricing, resource models',
      healthcare: 'Healthcare',
      healthcareDesc: 'Billing calculations, insurance processing, compliance',
      insurance: 'Insurance',
      insuranceDesc: 'Premium calculations, actuarial models, claims processing',
      manufacturing: 'Manufacturing',
      manufacturingDesc: 'Bill of materials, cost rollups, margin calculations',
      tax: 'Tax & Compliance',
      taxDesc: 'VAT calculations, transfer pricing, regulatory rules',
    },
    whitepaper: {
      title: 'Technical Whitepaper',
      description: 'Get the detailed technical documentation covering architecture, security model, deployment options, and compliance checklist.',
      cta: 'Read Technical Whitepaper',
    },
    finalCta: {
      title: 'Ready for Enterprise Excel APIs?',
      description: 'Let\'s discuss how SpreadAPI can help you scale your Excel-based business logic while meeting your compliance requirements.',
      ctaPrimary: 'Contact Sales',
      ctaSecondary: 'Try Free Version',
    },
  },
  de: {
    hero: {
      subheading: 'Enterprise & Compliance Ready',
      title1: 'Ihre Daten.',
      title2: 'Ihre Server.',
      description: 'Führen Sie Excel-Berechnungen auf Ihrer eigenen Infrastruktur aus. Perfekt für Finanzdienstleister, Beratungsfirmen und jede Organisation, bei der Daten das Gebäude nie verlassen dürfen.',
      ctaPrimary: 'Vertrieb kontaktieren',
      ctaSecondary: 'So funktioniert es',
    },
    trustBadges: {
      dataSovereignty: 'Volle Datensouveränität',
      zeroDependencies: 'Keine externen Abhängigkeiten',
      noCloud: 'Kein Cloud-Speicher',
      airGapped: 'Air-Gap-kompatibles Runtime',
    },
    challenge: {
      subheading: 'Die Herausforderung',
      title1: 'Excel treibt Ihr Business an.',
      title2: 'Aber es skaliert nicht.',
      description: 'Ihre Steuermodelle, Preisberechnungen und Compliance-Kalkulationen leben in Excel. Sie sind bewährt, geprüft und praxiserprobt. Aber sie stecken auf einzelnen Desktops fest.',
      complianceRisk: 'Compliance-Risiko',
      complianceRiskDesc: 'Cloud-Lösungen bedeuten, dass Ihre sensiblen Daten Ihr Netzwerk verlassen',
      monthsDev: 'Monate an Entwicklung',
      monthsDevDesc: 'Excel-Logik in Code umzuschreiben dauert ewig und führt zu Fehlern',
      noScalability: 'Keine Skalierbarkeit',
      noScalabilityDesc: 'Eine Tabelle, ein Benutzer. Keine Integration mit Systemen oder Automatisierung möglich',
    },
    solution: {
      subheading: 'Die Lösung',
      title1: 'SpreadAPI Runtime:',
      title2: '100% On-Premises',
      description: 'Erstellen Sie Ihre Excel-Services im Browser. Deployen Sie sie auf Ihren Servern. Keine Daten berühren jemals unsere Cloud.',
      step1Title: 'Im Browser erstellen',
      step1Desc: 'Importieren Sie Ihre Excel-Datei. Definieren Sie Ein- und Ausgaben. Testen Sie Berechnungen.',
      step1Highlight: ' Alles bleibt in Ihrem Browser-Speicher.',
      step1Notice: 'Keine Daten werden während der Entwicklung an einen Server gesendet',
      step2Title: 'Service-Paket exportieren',
      step2Desc: 'Klicken Sie auf „Für Runtime exportieren", um eine JSON-Datei mit Ihrer Service-Konfiguration herunterzuladen.',
      step2Highlight: ' Die Datei wird direkt auf Ihren Computer heruntergeladen.',
      step3Title: 'Auf Ihrer Infrastruktur deployen',
      step3Desc: 'Starten Sie SpreadAPI Runtime auf Ihren Servern mit Docker. Laden Sie das Service-Paket hoch.',
      step3Highlight: ' Ihre Berechnungs-API ist jetzt live — intern.',
      deployComment: '# In Minuten deployen',
      apiReadyComment: '# Ihre API ist erreichbar unter',
    },
    dataFlow: {
      subheading: 'Datenfluss',
      title1: 'Keine Daten verlassen',
      title2: 'Ihr Netzwerk',
      badge: 'IHRE SICHERE NETZWERKGRENZE',
      yourApps: 'Ihre Anwendungen',
      yourAppsDesc: 'Web-Apps, ERP, CRM, interne Tools',
      restApi: 'REST API',
      runtime: 'SpreadAPI Runtime',
      runtimeDesc: 'Ihr Server, Docker-Container',
      noExtDb: 'Keine externe Datenbank',
      noOutbound: 'Keine ausgehenden Verbindungen',
      worksOffline: 'Funktioniert komplett offline',
    },
    enterpriseMode: {
      title1: 'Enterprise-Modus:',
      title2: 'Cloud-Speichern deaktiviert',
      desc1: 'Für Organisationen, die absolute Sicherheit benötigen, bieten wir den <strong>Enterprise-Modus</strong>, bei dem die „In der Cloud speichern"-Funktion vollständig deaktiviert ist.',
      desc2: 'Selbst wenn ein Mitarbeiter versucht, Daten extern zu speichern, ist es architektonisch unmöglich. Der Button existiert schlicht nicht.',
      badge1: 'Zero-Trust-Architektur',
      badge2: 'Verhindert versehentliche Datenlecks',
      badge3: 'Vollständige Audit-Compliance',
      mockTitle: 'Enterprise-Modus',
      importExcel: 'Excel importieren',
      browserMemory: 'Nur Browser-Speicher',
      configureTest: 'Konfigurieren & Testen',
      exportRuntime: 'Für Runtime exportieren',
      downloadsDisk: 'Download auf Ihre Festplatte',
      saveToCloud: 'In Cloud speichern',
      disabledLabel: 'DEAKTIVIERT im Enterprise-Modus',
    },
    techSpecs: {
      subheading: 'Technische Spezifikationen',
      title1: 'Gebaut für',
      title2: 'Enterprise-IT',
      deployment: 'Deployment-Optionen',
      deploymentItems: ['Docker-Container', 'Kubernetes / AKS / EKS / GKE', 'Bare Metal / VM', 'Air-Gap-Umgebungen'],
      performance: 'Performance',
      performanceItems: ['10-50ms typische Antwortzeit', 'Horizontale Skalierung unterstützt', 'In-Memory-Workbook-Caching', 'Verarbeitet 1000e gleichzeitige Anfragen'],
      excelCompat: 'Excel-Kompatibilität',
      excelCompatItems: ['500+ Excel-Funktionen', 'XLOOKUP, FILTER, SORT, UNIQUE', 'LET, LAMBDA Funktionen', 'Vollständige Array-Formel-Unterstützung'],
      security: 'Sicherheit',
      securityItems: ['Keine ausgehenden Verbindungen erforderlich', 'Lokaler dateibasierter Speicher', 'Optionale API-Authentifizierung', 'Request-Logging & Audit-Trail'],
      requirements: 'Voraussetzungen',
      requirementsItems: ['Node.js 18+ oder Docker', '256MB RAM Minimum', 'Keine externe Datenbank', 'Kein Internet erforderlich'],
      restApi: 'REST API',
      restApiItems: ['Standard JSON Request/Response', 'GET und POST unterstützt', 'OpenAPI-Dokumentation', 'Health-Check-Endpunkt'],
    },
    useCases: {
      subheading: 'Anwendungsfälle',
      title1: 'Gebaut für',
      title2: 'regulierte Branchen',
      financial: 'Finanzdienstleistungen',
      financialDesc: 'Kreditberechnungen, Risikobewertung, Portfolio-Bewertungen',
      consulting: 'Beratungsunternehmen',
      consultingDesc: 'Honorarberechnungen, Engagement-Preisgestaltung, Ressourcenmodelle',
      healthcare: 'Gesundheitswesen',
      healthcareDesc: 'Abrechnungen, Versicherungsabwicklung, Compliance',
      insurance: 'Versicherungen',
      insuranceDesc: 'Prämienberechnungen, versicherungsmathematische Modelle, Schadenbearbeitung',
      manufacturing: 'Fertigung',
      manufacturingDesc: 'Stücklisten, Kostenaufstellungen, Margenberechnungen',
      tax: 'Steuern & Compliance',
      taxDesc: 'Umsatzsteuerberechnungen, Verrechnungspreise, regulatorische Vorschriften',
    },
    whitepaper: {
      title: 'Technisches Whitepaper',
      description: 'Erhalten Sie die detaillierte technische Dokumentation zu Architektur, Sicherheitsmodell, Deployment-Optionen und Compliance-Checkliste.',
      cta: 'Technisches Whitepaper lesen',
    },
    finalCta: {
      title: 'Bereit für Enterprise Excel-APIs?',
      description: 'Lassen Sie uns besprechen, wie SpreadAPI Ihnen helfen kann, Ihre Excel-basierte Geschäftslogik zu skalieren und gleichzeitig Ihre Compliance-Anforderungen zu erfüllen.',
      ctaPrimary: 'Vertrieb kontaktieren',
      ctaSecondary: 'Kostenlose Version testen',
    },
  },
} as const;

// Helper function to get On-Premises translations
export function getOnPremisesTranslations(locale: SupportedLocale) {
  if (locale === 'de') {
    return onPremisesPage.de;
  }
  return onPremisesPage.en;
}

// Pricing page translations
export const pricingPage = {
  en: {
    header: {
      subheading: 'Simple, Transparent Pricing',
      title: 'Choose the Plan That',
      titleHighlight: 'Fits Your Needs',
      description: 'Start free and scale as you grow. No hidden fees, no surprises. Cancel anytime.',
    },
    perMonth: '/month',
    perMo: '/mo',
    free: {
      name: 'FREE',
      price: '€0',
      description: 'Perfect for testing and personal projects',
      features: [
        '1 Excel API',
        '100 API calls/month',
        'Max file size: 1 MB',
        'Basic support',
      ],
      cta: 'Start Building Now',
    },
    pro: {
      name: 'PRO',
      badge: 'Most Popular',
      price: '€99',
      description: 'For teams and growing projects',
      features: [
        '3 Excel APIs',
        '1,000 API calls/month included',
        'Max file size: 3 MB',
        'Priority support',
        'AI Integration (MCP)',
      ],
      cta: 'Get Started',
    },
    premium: {
      name: 'PREMIUM',
      price: '€299',
      description: 'For businesses with advanced needs',
      features: [
        'Unlimited Excel APIs',
        '10,000 API calls/month included',
        'Max file size: 25 MB',
        'Priority support',
        'AI Integration (MCP)',
        'Advanced analytics',
      ],
      cta: 'Get Started',
    },
    addons: {
      title: 'Add-ons',
      extra10k: {
        title: 'Extra 10K calls/month',
        description: 'Add more API calls to any paid plan',
        price: '€79',
      },
      million: {
        title: '1M calls/month',
        description: 'High-volume package for heavy usage',
      },
      onPremises: {
        title: 'On-Premises Service Runtime',
        description: 'Host on your own infrastructure.',
        learnMore: 'Learn more',
      },
      contactSales: 'Contact Sales',
    },
    enterprise: {
      title: "Need more? Let\u2019s talk Enterprise",
      description: 'Custom pricing for large organizations with specific requirements, dedicated support, and unlimited usage.',
      cta: 'Contact Sales',
    },
  },
  de: {
    header: {
      subheading: 'Einfache, transparente Preise',
      title: 'Wählen Sie den Plan, der',
      titleHighlight: 'zu Ihnen passt',
      description: 'Starten Sie kostenlos und skalieren Sie nach Bedarf. Keine versteckten Gebühren, keine Überraschungen. Jederzeit kündbar.',
    },
    perMonth: '/Monat',
    perMo: '/Mo.',
    free: {
      name: 'FREE',
      price: '€0',
      description: 'Perfekt zum Testen und für persönliche Projekte',
      features: [
        '1 Excel-API',
        '100 API-Aufrufe/Monat',
        'Max. Dateigröße: 1 MB',
        'Basis-Support',
      ],
      cta: 'Jetzt loslegen',
    },
    pro: {
      name: 'PRO',
      badge: 'Am beliebtesten',
      price: '€99',
      description: 'Für Teams und wachsende Projekte',
      features: [
        '3 Excel-APIs',
        '1.000 API-Aufrufe/Monat inklusive',
        'Max. Dateigröße: 3 MB',
        'Prioritäts-Support',
        'KI-Integration (MCP)',
      ],
      cta: 'Jetzt starten',
    },
    premium: {
      name: 'PREMIUM',
      price: '€299',
      description: 'Für Unternehmen mit erweiterten Anforderungen',
      features: [
        'Unbegrenzte Excel-APIs',
        '10.000 API-Aufrufe/Monat inklusive',
        'Max. Dateigröße: 25 MB',
        'Prioritäts-Support',
        'KI-Integration (MCP)',
        'Erweiterte Analysen',
      ],
      cta: 'Jetzt starten',
    },
    addons: {
      title: 'Zusatzoptionen',
      extra10k: {
        title: 'Extra 10K Aufrufe/Monat',
        description: 'Mehr API-Aufrufe für jeden bezahlten Plan',
        price: '€79',
      },
      million: {
        title: '1M Aufrufe/Monat',
        description: 'Hochvolumen-Paket für intensive Nutzung',
      },
      onPremises: {
        title: 'On-Premises Service Runtime',
        description: 'Betrieb auf Ihrer eigenen Infrastruktur.',
        learnMore: 'Mehr erfahren',
      },
      contactSales: 'Vertrieb kontaktieren',
    },
    enterprise: {
      title: 'Mehr benötigt? Sprechen wir über Enterprise',
      description: 'Individuelle Preise für große Organisationen mit spezifischen Anforderungen, dediziertem Support und unbegrenzter Nutzung.',
      cta: 'Vertrieb kontaktieren',
    },
  },
} as const;

// Helper function to get Pricing translations
export function getPricingTranslations(locale: SupportedLocale) {
  if (locale === 'de') {
    return pricingPage.de;
  }
  return pricingPage.en;
}
