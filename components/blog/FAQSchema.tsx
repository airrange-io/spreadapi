export function FAQSchema({ faqs }: { faqs: Array<{ question: string; answer: string }> }) {
  if (!faqs || faqs.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Extract FAQ from blog content
export function extractFAQFromContent(content: string): Array<{ question: string; answer: string }> {
  const faqs: Array<{ question: string; answer: string }> = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Look for question patterns (lines ending with ?)
    if (line.trim().endsWith('?') && line.startsWith('##')) {
      const question = line.replace(/^#+\s*/, '').trim();
      let answer = '';
      
      // Collect answer until next heading or question
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].startsWith('#')) break;
        answer += lines[j] + ' ';
      }
      
      if (answer.trim()) {
        faqs.push({ 
          question: question.replace(/\?$/, '?'), 
          answer: answer.trim() 
        });
      }
    }
  }
  
  return faqs;
}