export const productFAQs = [
  {
    question: "What is SpreadAPI?",
    answer: "SpreadAPI transforms your Excel spreadsheets into powerful REST APIs instantly. It allows developers to use Excel's calculation engine and business logic directly in their applications without reimplementing formulas or uploading files."
  },
  {
    question: "How does SpreadAPI work without file uploads?",
    answer: "SpreadAPI connects directly to your Excel files stored in cloud services like OneDrive, SharePoint, or Google Drive. It reads the spreadsheet structure and formulas, then exposes them as API endpoints. Your data stays secure in your cloud storage while the API provides real-time calculations."
  },
  {
    question: "Is SpreadAPI secure for sensitive business data?",
    answer: "Yes, SpreadAPI is designed with security first. Your Excel files remain in your own cloud storage, we never store your data. All connections are encrypted, and you maintain full control over access permissions. SpreadAPI only processes calculations, not your actual data."
  },
  {
    question: "Can I use SpreadAPI with ChatGPT or Claude?",
    answer: "Absolutely! SpreadAPI supports the MCP (Model Context Protocol) which allows seamless integration with AI assistants like ChatGPT and Claude. Your AI can directly access and use Excel calculations without manual data entry or file uploads."
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