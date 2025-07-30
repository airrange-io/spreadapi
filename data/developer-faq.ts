export const developerFAQs = [
  {
    question: "How reliable are the calculations compared to native Excel?",
    answer: "SpreadAPI uses an advanced Excel-compatible calculation engine that supports all Excel features including array functions, dynamic arrays, and complex formulas. Every calculation is fully compatible with Excel, ensuring your formulas work exactly as expected. Our engine handles even the most sophisticated Excel features with 100% accuracy."
  },
  {
    question: "What happens to my proprietary formulas and business logic?",
    answer: "Your Excel formulas and business logic stay completely private. They're never exposed through the API or shared with AI providers. The API only returns calculation results, not the underlying formulas. Your intellectual property remains protected."
  },
  {
    question: "Is my data shared with AI providers like OpenAI or Anthropic?",
    answer: "No. Your Excel files stay on SpreadAPI's secure servers. AI assistants only access what you explicitly allow - specific cells or ranges you've granted permission to. They receive calculation results, not your full spreadsheet, keeping your proprietary formulas and sensitive data separate from AI training datasets."
  },
  {
    question: "Can SpreadAPI handle real-time data and streaming calculations?",
    answer: "Yes. SpreadAPI supports webhook triggers and real-time updates. When your Excel data changes, dependent calculations update automatically. You can also stream calculation results for live dashboards and monitoring systems."
  },
  {
    question: "What about Excel features like macros, pivot tables, and charts?",
    answer: "SpreadAPI supports most Excel features including pivot tables, data tables, and complex formulas. Charts and visualizations can be generated as data endpoints for your frontend to render. Note: VBA macros and linked workbooks are not currently supported."
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
    question: "How does billing work for high-volume applications?",
    answer: "We offer transparent usage-based pricing with no hidden fees. Free tier includes 100 API calls/month. Paid plans start at $29/month for 10,000 calls. Enterprise customers get volume discounts and dedicated infrastructure."
  }
];