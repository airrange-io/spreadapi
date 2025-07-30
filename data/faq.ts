export const productFAQs = [
  {
    question: "What is SpreadAPI?",
    answer: "SpreadAPI transforms your Excel spreadsheets into powerful REST APIs instantly. It allows developers to use Excel's calculation engine and business logic directly in their applications without reimplementing formulas."
  },
  {
    question: "How does SpreadAPI protect my Excel data?",
    answer: "SpreadAPI stores your Excel files on secure servers but gives you complete control over what AI and applications can access. You define specific input/output cells and can grant granular permissions to different areas. Your formulas and sensitive data remain private."
  },
  {
    question: "Is SpreadAPI secure for sensitive business data?",
    answer: "Yes, SpreadAPI is designed with security first. All connections are encrypted, and you maintain full control over access permissions. You decide exactly which cells AI and applications can access, keeping your proprietary formulas and sensitive data private."
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