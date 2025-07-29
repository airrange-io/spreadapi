export const developerFAQs = [
  {
    question: "How reliable are the calculations compared to native Excel?",
    answer: "SpreadAPI uses Microsoft's actual Excel calculation engine, ensuring 100% accuracy. Every formula, function, and calculation produces identical results to desktop Excel. We don't approximate or recreate Excel logic - we use the real thing."
  },
  {
    question: "What happens to my proprietary formulas and business logic?",
    answer: "Your Excel formulas and business logic stay completely private. They're never exposed through the API or shared with AI providers. The API only returns calculation results, not the underlying formulas. Your intellectual property remains protected."
  },
  {
    question: "How does SpreadAPI handle complex Excel dependencies?",
    answer: "SpreadAPI maintains Excel's full calculation graph, including circular references, volatile functions, and complex dependencies across sheets. Array formulas, dynamic arrays, and even VBA functions work exactly as they do in Excel."
  },
  {
    question: "Is my data shared with AI providers like OpenAI or Anthropic?",
    answer: "No. Your Excel files are uploaded to SpreadAPI's secure storage only. When AI assistants use your API, they receive calculation results, not your raw data or files. This keeps your sensitive business data completely separate from AI training datasets."
  },
  {
    question: "Can SpreadAPI handle real-time data and streaming calculations?",
    answer: "Yes. SpreadAPI supports webhook triggers and real-time updates. When your Excel data changes, dependent calculations update automatically. You can also stream calculation results for live dashboards and monitoring systems."
  },
  {
    question: "What about Excel features like macros, pivot tables, and charts?",
    answer: "SpreadAPI supports most Excel features including pivot tables, data tables, and complex formulas. VBA macros can be converted to API logic. Charts and visualizations can be generated as data endpoints for your frontend to render."
  },
  {
    question: "How do you prevent calculation errors and handle edge cases?",
    answer: "SpreadAPI includes comprehensive error handling that mirrors Excel's behavior. #DIV/0!, #VALUE!, #REF! and other Excel errors are properly returned through the API. We also provide detailed error messages to help debug formula issues."
  },
  {
    question: "What's the latency for complex calculations?",
    answer: "Simple calculations return in 50-100ms. Complex models with thousands of formulas typically complete in 200-500ms. We use intelligent caching and pre-warming to minimize cold start times. For comparison, uploading a file to an LLM takes 5-10 seconds."
  },
  {
    question: "Can I version control my Excel APIs?",
    answer: "Yes. SpreadAPI integrates with your existing version control. Each Excel file version can have its own API endpoint. You can deploy updates without breaking existing integrations and roll back if needed."
  },
  {
    question: "How does billing work for high-volume applications?",
    answer: "We offer transparent usage-based pricing with no hidden fees. Free tier includes 100 API calls/month. Paid plans start at $29/month for 10,000 calls. Enterprise customers get volume discounts and dedicated infrastructure."
  }
];