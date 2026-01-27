/**
 * Template workbook definitions for the sample picker.
 * Workbook files are stored in Vercel Blob.
 *
 * Cell addresses are passed to the auto-detection logic at runtime.
 * The system analyzes each cell in the loaded SpreadJS workbook to determine:
 * - Parameter name (from adjacent labels)
 * - Data type (number, boolean, string)
 * - Input vs Output (value → input, formula/range → output)
 * - Format (percentage, currency, date)
 * - Dropdown options (data validation lists)
 */

export interface Template {
  id: string;
  name: { en: string; de: string };
  description: { en: string; de: string };
  fileUrl: string;        // Vercel Blob URL for the workbook (.xlsx)
  cells: string[];        // Cell addresses for auto-detection, e.g. ["Sheet1!B2", "Sheet1!C5:C10"]
}

export const templates: Template[] = [
  {
    id: 'sample-compound-1',
    name: { en: 'Compound Interest Calculator', de: 'Zinseszins Berechnung' },
    description: { en: 'This Excel file is a Compound Interest Calculator. It calculates the future value of regular monthly savings with compound interest. Users can input: Interest rate, Monthly deposit amount, Number of months, Starting amount.', de: 'Diese Excel-Datei ist ein Zinseszinsrechner. Sie berechnet den zukünftigen Wert regelmäßiger monatlicher Spareinlagen mit Zinseszins. Benutzer können eingeben: Zinssatz (jährlich), Monatlicher Sparbetrag, Anzahl der Monate, Startbetrag.' },
    fileUrl: 'https://ug526ez8nuob7cr7.public.blob.vercel-storage.com/samples/Compound%20Interest.xlsx',
    cells: ["Savings!C4","Savings!C5","Savings!C6","Savings!C7","Savings!C10","Savings!C11","Savings!C12"],
  },
  {
    id: 'sample-email-quality-1',
    name: { en: 'Email Quality Checker', de: 'Email-Qualitätsprüfer' },
    description: { en: "This Excel file is an intelligent email validation tool that analyzes email addresses for quality issues. It detects disposable, fake, and potentially invalid email addresses that shouldn't be used in marketing campaigns or CRM systems.", de: "Diese Excel-Datei ist ein intelligentes Tool zur E-Mail-Validierung, das E-Mail-Adressen auf Qualitätsprobleme analysiert. Es erkennt Wegwerf-, Fake- und potenziell ungültige E-Mail-Adressen, die nicht in Marketing-Kampagnen oder CRM-Systemen verwendet werden sollten." },
    fileUrl: 'https://ug526ez8nuob7cr7.public.blob.vercel-storage.com/samples/Email%20Quality%20Checker.xlsx',
    cells: ["EmailChecker!C3","EmailChecker!C25","EmailChecker!C26","EmailChecker!C27","EmailChecker!B13:C22"],
  },
  {
    id: 'sample-quotation-1',
    name: { en: 'Software License Quotation Calculator', de: 'Software-Lizenz-Angebotsrechner' },
    description: { en: 'This Excel file is a professional quotation tool for software licensing. It generates customized price quotes for a fictional "Contoso Software" product with multiple license tiers and optional add-ons.', de: 'Diese Excel-Datei ist ein professionelles Angebots-Tool für Software-Lizenzierung. Sie erstellt individuelle Preisangebote für ein fiktives „Contoso Software"-Produkt mit verschiedenen Lizenzstufen und optionalen Zusatzleistungen.' },
    fileUrl: 'https://ug526ez8nuob7cr7.public.blob.vercel-storage.com/samples/Sample%20Quotation.xlsx',
    cells: ["Calculation!C4","Calculation!C5","Calculation!C7","Calculation!C8","Calculation!C28","Calculation!C29","Calculation!C30"],
  },
  {
    id: 'sample-valuation-1',
    name: { en: 'VC Reverse Valuation Model', de: 'VC Reverse-Bewertungsmodell' },
    description: { en: 'This Excel file is a venture capital valuation model designed to "backsolve" pre-money and post-money valuations for SaaS companies at Series A stage and beyond. Instead of setting a valuation directly, it calculates what the implied valuation should be based on key operating metrics.', de: 'Diese Excel-Datei ist ein Venture-Capital-Bewertungsmodell, das Pre-Money- und Post-Money-Bewertungen für SaaS-Unternehmen in der Series-A-Phase und darüber hinaus „rückrechnet". Anstatt eine Bewertung direkt festzulegen, berechnet es die implizite Bewertung basierend auf wichtigen operativen Kennzahlen.' },
    fileUrl: 'https://ug526ez8nuob7cr7.public.blob.vercel-storage.com/samples/Sample%20Valuation%20Reverse.xlsx',
    cells: ["model!C4","model!C5","model!C6","model!c7","model!F4","model!F5","model!F6","model!J41:O50"],
  },
];
