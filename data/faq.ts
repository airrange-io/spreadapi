export const productFAQs = [
  {
    question: "What is SpreadAPI?",
    answer: "SpreadAPI transforms your Excel spreadsheets into powerful REST APIs instantly. It allows developers to use Excel's calculation engine and business logic directly in their applications without reimplementing formulas."
  },
  {
    question: "How does SpreadAPI protect my Excel data?",
    answer: "Your Excel files are stored on enterprise-grade infrastructure (Vercel, Redis Cloud) with SOC 2 Type 2 and ISO 27001 certifications. We use TLS 1.3 encryption for all connections. You define specific input/output cells and grant granular permissions—your formulas and sensitive data remain private and are never exposed through the API."
  },
  {
    question: "Is SpreadAPI secure for sensitive business data?",
    answer: "Yes. Our infrastructure providers (Vercel, Redis Cloud) maintain SOC 2 Type 2, ISO 27001, and GDPR compliance. We store only your email address—no names, addresses, or personal details. Calculation results are cached for maximum 15 minutes, then automatically deleted. For regulated industries, we offer on-premises deployment where data never leaves your infrastructure."
  },
  {
    question: "Do you have HIPAA or SOC 2 compliance?",
    answer: "SpreadAPI runs on SOC 2 Type 2 and ISO 27001 certified infrastructure (Vercel, Redis Cloud). For HIPAA-regulated workloads, we offer two paths: Enterprise Cloud with Vercel's HIPAA-compliant infrastructure, or On-Premises deployment where you maintain full control. Our minimal data architecture—no result storage, 15-minute cache max—reduces compliance scope significantly."
  },
  {
    question: "Can I use SpreadAPI with ChatGPT or Claude?",
    answer: "Absolutely! SpreadAPI supports the MCP (Model Context Protocol) which allows seamless integration with AI assistants like ChatGPT and Claude. You control exactly what parts of your Excel the AI can access - granting permissions to specific cells or ranges while keeping the rest private."
  },
  {
    question: "What Excel features does SpreadAPI support?",
    answer: "SpreadAPI supports most Excel formulas, functions, and calculations including VLOOKUP, pivot tables, complex financial formulas, and custom business logic. It maintains Excel's calculation accuracy while providing API-level performance."
  },
  {
    question: "How fast is SpreadAPI compared to traditional approaches?",
    answer: "SpreadAPI typically responds in 50-200ms for most calculations, compared to 5-10 seconds for file upload approaches. By keeping the Excel engine warm and eliminating file transfer overhead, we achieve near-instant response times."
  },
  {
    question: "Do I need to modify my existing Excel files?",
    answer: "No modifications needed! SpreadAPI works with your existing Excel files as-is. Simply connect your cloud storage, select the spreadsheet, and SpreadAPI automatically generates API endpoints for your calculations."
  },
  {
    question: "What's the difference between SpreadAPI and Google Sheets API?",
    answer: "Google Sheets API is designed for reading and writing data to Google Sheets, which modifies your original documents. SpreadAPI is purpose-built for using Excel as a calculation engine via API without changing your files. SpreadAPI also supports Excel-specific features and formulas that Google Sheets doesn't have."
  },
  {
    question: "Can multiple users access the same SpreadAPI endpoint?",
    answer: "Yes! SpreadAPI endpoints can handle multiple concurrent requests. Each request gets its own calculation context, so multiple users can use the same Excel logic with different inputs simultaneously without interference."
  },
  {
    question: "What programming languages can I use with SpreadAPI?",
    answer: "SpreadAPI provides a standard REST API that works with any programming language. We offer official SDKs for JavaScript/TypeScript, Python, and have examples for Java, C#, Ruby, Go, and more. If it can make HTTP requests, it can use SpreadAPI."
  }
];