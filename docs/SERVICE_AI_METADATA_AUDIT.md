# Service AI Metadata - Complete Audit & Analysis

## Current Editable Information

### 1. Service-Level Metadata (Settings Tab → "Service Info")
```typescript
{
  name: string;              // Service name (e.g., "Mortgage Calculator")
  description: string;       // Short description for humans
  enableCaching: boolean;    // Performance setting
  requireToken: boolean;     // Security setting
}
```

### 2. AI Assistant Information (Settings Tab → "AI Assistant Information")
```typescript
{
  aiDescription: string;           // ✅ Detailed explanation for AI
  aiUsageExamples: string[];       // ✅ Example questions/use cases
  aiTags: string[];                // ✅ Searchable tags (e.g., "finance", "mortgage")
  category: string;                // ✅ Category (finance, math, statistics, etc.)
}
```

### 3. Input Parameters (Parameters Panel → Each Input)
```typescript
{
  name: string;              // Parameter name (e.g., "interestRate")
  alias: string;             // API alias (e.g., "rate")
  title: string;             // Original Excel title
  type: string;              // 'number' | 'string' | 'boolean'
  description: string;       // ✅ "Description (for AI assistants)"
  mandatory: boolean;        // Is this required?
  min: number;              // Min value (for numbers)
  max: number;              // Max value (for numbers)
  format: string;           // 'percentage' (auto-detected from Excel)
}
```

### 4. Output Parameters (Parameters Panel → Each Output)
```typescript
{
  name: string;              // Parameter name
  alias: string;             // API alias
  title: string;             // Original Excel title
  type: string;              // 'number' | 'string' | 'boolean'
  description: string;       // ✅ "Description (for AI assistants)"
}
```

---

## What's Returned in `spreadapi_get_service_details`

### Current Response Format
```
Service: Mortgage Calculator
ID: mortgage_calc_123
Description: Calculate monthly mortgage payments

INPUTS:
• principal (alias: loanAmount) - number [REQUIRED]
  Total loan amount
  Range: * to *

• interestRate (alias: rate) - number [REQUIRED] [PERCENTAGE: Enter as decimal, e.g., 0.05 for 5%]
  Annual interest rate
  Range: * to *

OUTPUTS:
• monthlyPayment - number: Monthly payment amount
• totalInterest - number: Total interest paid over loan life

EDITABLE AREAS:
(if applicable)

Requires Token: No
Caching Enabled: Yes

USAGE EXAMPLES:
1. Calculate monthly payment for a $300k loan at 6.5% for 30 years
2. Compare 15 year vs 30 year mortgage
```

### What's Currently Included
✅ Service name and ID
✅ Description (or aiDescription)
✅ Input parameters with:
  - Name and alias
  - Type
  - Required/optional
  - Min/max range
  - Description
  - Percentage format hint (auto-detected)
✅ Output parameters with:
  - Name and alias
  - Type
  - Description
✅ Usage examples (aiUsageExamples)
✅ Token and caching info

### What's Currently Missing
❌ AI Tags (not shown)
❌ Category (not shown)
❌ Input parameter examples (no field to add them)
❌ Output presentation hints (no field to add them)
❌ Usage guidance (when to use this service)

---

## Gap Analysis: What's Missing for Perfect AI Integration

### Critical Gaps

#### 1. **Input Parameter Examples** ⭐ HIGH PRIORITY
**Problem**: AI doesn't know what valid input values look like

**Current State**:
- Parameter has description
- Parameter has min/max range
- AI has to guess appropriate values

**What's Needed**:
```typescript
{
  name: "interestRate",
  description: "Annual interest rate",
  // NEW:
  aiExamples: [
    "0.05 (5% APR)",
    "0.065 (6.5% APR)",
    "0.07 (7% APR)"
  ]
}
```

**Impact**:
- ✅ AI knows exactly what format to use
- ✅ AI can suggest realistic values to users
- ✅ Reduces errors from wrong input format

---

#### 2. **Output Presentation Hints** ⭐ HIGH PRIORITY
**Problem**: AI doesn't know how to format/present results

**Current State**:
- Output has name and type
- No guidance on formatting
- AI might display "1896.20" without context

**What's Needed**:
```typescript
{
  name: "monthlyPayment",
  description: "Monthly payment amount",
  // NEW:
  aiPresentationHint: "Format as currency with 2 decimals (e.g., $1,896.20)"
}
```

**Impact**:
- ✅ AI formats numbers correctly (currency, percentages)
- ✅ AI adds appropriate context to results
- ✅ Better user experience

---

#### 3. **Usage Guidance** ⭐ MEDIUM PRIORITY
**Problem**: AI doesn't know WHEN to use the service (even with single-service hints)

**Current State**:
- Has `aiDescription` (what the service does)
- Has `aiUsageExamples` (example questions)
- Missing explicit "when to use" guidance

**What's Needed**:
```typescript
{
  // NEW:
  aiUsageGuidance: "Use this service when the user wants to calculate monthly mortgage payments, compare different loan terms, or understand total interest costs."
}
```

**Impact**:
- ✅ AI knows when to trigger the service
- ✅ Works better in multi-service scenarios
- ✅ More natural conversations

---

### Nice-to-Have Enhancements

#### 4. **Default Values for Optional Parameters** 🟡 LOW PRIORITY
**Problem**: AI doesn't know what to do with optional parameters

**Current State**:
- Parameter marked as mandatory=false
- No guidance on default behavior

**What Could Help**:
```typescript
{
  name: "downPayment",
  mandatory: false,
  // NEW:
  defaultValue: 0,
  aiDefaultGuidance: "If user doesn't mention down payment, use 0"
}
```

---

#### 5. **Parameter Relationships** 🟡 LOW PRIORITY
**Problem**: Some parameters depend on each other

**Example**:
- If `loanType` is "fixed", show different parameters than "variable"
- If `hasDownPayment` is true, ask for `downPaymentAmount`

**What Could Help**:
```typescript
{
  name: "downPaymentAmount",
  // NEW:
  aiCondition: "Only ask if user mentions down payment"
}
```

**Reality**: This is complex and probably not needed for MVP. Most services are simple.

---

#### 6. **Output Interpretation** 🟡 LOW PRIORITY
**Problem**: AI might not understand what outputs mean in context

**Current State**:
- Output has description
- No interpretation guidance

**What Could Help**:
```typescript
{
  name: "totalInterest",
  description: "Total interest paid over loan life",
  // NEW:
  aiInterpretation: "Compare this to the principal to show how much extra the user will pay. If it's higher than principal, emphasize this."
}
```

**Reality**: This is nice but `aiPresentationHint` + good description probably covers 95% of cases.

---

## Recommendations

### Phase 1: Essential Additions (Do Now) ⭐

These 3 fields would cover 95% of AI integration needs:

#### 1. Add to Input Parameters: `aiExamples`
```tsx
// In ParameterModal.tsx
<Collapse ghost size="small" items={[{
  key: 'ai-examples',
  label: '🤖 AI Examples (Optional)',
  children: (
    <Select
      mode="tags"
      placeholder="Add example values (press Enter)"
      value={input.aiExamples || []}
      onChange={(values) => updateInput('aiExamples', values)}
    />
  )
}]} />
```

**Storage**: Already part of input JSON, just add the field
**Shown in**: `spreadapi_get_service_details` response

---

#### 2. Add to Output Parameters: `aiPresentationHint`
```tsx
// In ParameterModal.tsx
<Collapse ghost size="small" items={[{
  key: 'ai-hint',
  label: '🤖 AI Presentation Hint (Optional)',
  children: (
    <Input
      placeholder="E.g., 'Format as currency', 'Show as percentage'"
      value={output.aiPresentationHint || ''}
      onChange={(e) => updateOutput('aiPresentationHint', e.target.value)}
    />
  )
}]} />
```

**Storage**: Already part of output JSON, just add the field
**Shown in**: `spreadapi_get_service_details` response

---

#### 3. Add to Settings: `aiUsageGuidance`
```tsx
// In SettingsSection.tsx → AI Assistant Information
<div>
  <div style={{ marginBottom: '4px', fontSize: '12px', color: '#666' }}>
    Usage Guidance
  </div>
  <Input.TextArea
    placeholder="When should AI use this service? E.g., 'Use when user wants to calculate mortgage payments'"
    value={aiUsageGuidance}
    onChange={(e) => onAiUsageGuidanceChange(e.target.value)}
    rows={2}
  />
</div>
```

**Storage**: Add to service config
**Shown in**: `spreadapi_get_service_details` response (at the top)

---

### Phase 2: Polish (Later) 🟡

#### 1. Show Tags and Category in `get_service_details`
Currently stored but not displayed. Easy addition:
```
Category: Finance
Tags: mortgage, loan, interest, payment
```

#### 2. Smart Defaults
Add `defaultValue` to optional parameters

---

## Implementation Impact

### Minimal UI Changes
- 2 collapsible sections in ParameterModal (collapsed by default)
- 1 textarea in Settings

### Minimal Backend Changes
- Fields already stored in JSON
- Just add to `spreadapi_get_service_details` response

### Maximum AI Benefit
With these 3 fields, AI will:
- ✅ Know what valid inputs look like
- ✅ Format outputs correctly
- ✅ Understand when to use the service
- ✅ Provide better user experience
- ✅ Make fewer mistakes

---

## Current vs Enhanced Response

### Current Response
```
INPUTS:
• interestRate - number [REQUIRED]
  Annual interest rate
  Range: * to *
```

### Enhanced Response (with new fields)
```
WHEN TO USE:
Use when user wants to calculate mortgage payments or compare loan terms

INPUTS:
• interestRate - number [REQUIRED]
  Annual interest rate
  Examples: 0.05 (5% APR), 0.065 (6.5% APR), 0.07 (7% APR)
  Range: * to *

OUTPUTS:
• monthlyPayment - number: Monthly payment amount
  Present as: Format as currency with 2 decimals (e.g., $1,896.20)
```

---

## Conclusion

### What We Have Today
✅ Solid foundation with descriptions
✅ Usage examples at service level
✅ Input constraints (min/max, required)
✅ Type information

### What We Need for Perfect AI Integration
⭐ **Input examples** - Show AI what valid values look like
⭐ **Output presentation hints** - Tell AI how to format results
⭐ **Usage guidance** - Explain when to use the service

### What We Can Skip (For Now)
🟡 Parameter relationships (too complex)
🟡 Default value strategies (nice-to-have)
🟡 Deep output interpretation (covered by hints)

---

## Next Steps

1. ✅ Implement single-service hints (DONE)
2. ⭐ Add 3 essential fields (input examples, output hints, usage guidance)
3. ✅ Update `spreadapi_get_service_details` to show new fields
4. 🧪 Test with real services
5. 📊 Gather feedback from AI interactions

**Estimated effort**: 2-3 hours for all Phase 1 changes
**Expected impact**: 10x better AI understanding and user experience
