import type { Lesson } from '../lesson-types';

export const lesson08: Lesson = {
  id: 'pii',
  number: 8,
  title: 'Protecting Client Privacy',
  subtitle: 'What you should — and should never — share with an AI.',
  kicker: 'COMPLIANCE',
  icon: '🔒',
  duration: '4 min read',
  keyTakeaways: [
    'Never paste Social Security numbers, bank account numbers, full dates of birth, or passwords into an AI chat.',
    'Use first names only, general descriptions, and anonymized data when asking about client situations.',
    'The SBDC Advisor redacts detected PII automatically, but you should still practice good data hygiene.',
  ],
  prevLessonId: 'rag',
  nextLessonId: 'templates',
  sections: [
    {
      type: 'concept',
      title: 'Why PII Matters',
      body: 'PII stands for **Personally Identifiable Information** — data that can identify a specific individual. As an SBDC advisor, you handle sensitive client information every day. When you use AI tools, you need to be thoughtful about what you share.\n\nHere\'s the core principle:\n\n> **Use AI to help with the *thinking*, not to store or process sensitive personal data.**\n\nYou can describe a client\'s situation in general terms and get great advice without ever sharing their Social Security number, EIN, or bank details.',
    },
    {
      type: 'concept',
      title: 'What NOT to Paste Into AI',
      body: 'These should **never** go into any AI chat:\n\n🚫 Social Security Numbers (SSN)\n🚫 Bank account or routing numbers\n🚫 Credit card numbers\n🚫 Full dates of birth\n🚫 Passwords or security credentials\n🚫 Tax ID numbers (EIN) — unless it\'s a publicly listed business\n🚫 Full home addresses paired with names\n🚫 Medical or health information\n🚫 Immigration status details\n\nEven though conversations aren\'t stored permanently, it\'s best practice to keep this data out of AI tools entirely.',
    },
    {
      type: 'tip',
      note: 'The SBDC Advisor has built-in PII detection that automatically flags and redacts sensitive patterns like SSNs and credit card numbers. But don\'t rely on it as your only safeguard — think before you paste.',
    },
    {
      type: 'divider',
    },
    {
      type: 'prompt',
      title: 'Unsafe: Too Much Personal Data',
      label: '🚫 DON\'T DO THIS',
      prompt: 'My client John Michael Smith (SSN: 544-23-8891, DOB: 03/15/1978) lives at 1423 Oak Street, Redding CA 96001. His business EIN is 82-4419203 and he banks at Wells Fargo (account #4521993). He needs help with his SBA loan application.',
    },
    {
      type: 'concept',
      body: 'That prompt contains **6 types of PII** that have no reason to be in an AI conversation. The AI doesn\'t need any of those details to help with loan strategy.',
    },
    {
      type: 'prompt',
      title: 'Safe: Anonymized and Relevant',
      label: '✅ DO THIS INSTEAD',
      prompt: 'You are an SBDC advisor helping a client with their SBA loan application.\n\nClient context:\n- John, mid-40s, owns a residential plumbing company in Redding, CA\n- 4 employees, $280K annual revenue, 3 years in business\n- Has a solid credit history and existing banking relationship\n- Seeking $75K for a service van and equipment\n\nWhat are the key steps to prepare his SBA loan application? What documents will the lender typically require?',
    },
    {
      type: 'output',
      label: 'USEFUL AND SAFE',
      output: "**SBA Loan Application Prep — Key Steps for John**\n\n**Step 1: Gather Core Documents (Start Now)**\n- Last 3 years of business tax returns\n- Last 3 years of personal tax returns\n- Year-to-date profit & loss statement\n- Balance sheet (current)\n- Business debt schedule (list all existing loans/credit lines)\n\n**Step 2: Prepare the Business Case**\n- Write a brief explanation of how the $75K will be used (van + equipment specifics)\n- Include quotes or estimates for the van and equipment\n- Show how the investment will generate additional revenue (e.g., more service calls per day)\n\n**Step 3: Financial Readiness**\n- Confirm his personal credit score is above 680 (ideal for SBA 7(a))\n- Ensure the business has positive cash flow trends\n- Calculate current debt-to-income ratio\n\n**Step 4: Choose the Right Loan Program**\n- At $75K, he likely qualifies for either SBA 7(a) or SBA Express\n- SBA Express has faster turnaround (36 hours for approval) but rates may be slightly higher\n- His existing banking relationship is an advantage — start with his current bank\n\n**Step 5: SBDC Support**\n- I can help him build financial projections that demonstrate repayment ability\n- We can review his application together before submission",
    },
    {
      type: 'concept',
      title: 'What We Kept vs. What We Removed',
      body: 'The safe prompt included **everything the AI needed** without any sensitive data:\n\n| Included (Relevant) | Removed (Unnecessary PII) |\n|---|---|\n| First name: John | Full legal name |\n| Age range: mid-40s | Exact date of birth |\n| City: Redding, CA | Street address |\n| Business type & size | SSN, EIN |\n| Revenue & employee count | Bank account numbers |\n| Loan amount & purpose | Banking institution details |\n\nThe AI gave equally useful advice with the anonymized version. PII adds **zero value** to AI responses.',
    },
    {
      type: 'divider',
    },
    {
      type: 'exercise',
      title: 'Your Turn: Sanitize a Prompt',
      variant: 'Take this unsafe prompt and rewrite it with only the information the AI actually needs.',
      modifiedPrompt: 'You are an SBDC advisor reviewing a client\'s financial readiness for expansion.\n\nClient: Maria, owns a catering company in Sacramento\n- 5 years in business, 8 employees\n- Revenue: $420K last year, growing 15% annually\n- Has $35K in business savings\n- Wants to open a commercial kitchen (estimated cost: $120K)\n- Current profit margin: approximately 18%\n\nAssess whether she\'s financially ready for this expansion. What metrics should I look at?',
      modifiedOutput: "The AI doesn't need Maria's last name, address, tax ID, or bank details to assess her financial readiness. It just needs the business fundamentals: industry, size, revenue, savings, and the scope of the expansion.\n\n**The rule of thumb:** Include the *situation*, not the *identity*.",
    },
    {
      type: 'concept',
      title: 'Quick PII Checklist Before You Hit Send',
      body: 'Before sending any prompt that involves client data, scan for:\n\n✅ **First name only** (no last names needed)\n✅ **General location** (city is fine, street address is not)\n✅ **Business metrics** (revenue, employees, industry) — these are fine\n✅ **Approximate age** instead of date of birth\n✅ **No government IDs** (SSN, EIN, driver\'s license)\n✅ **No financial account numbers**\n✅ **No passwords or login credentials**\n\nWhen in doubt, ask yourself: "Would I be comfortable if this prompt were printed on the wall of the office?" If not, sanitize it first.',
    },
  ],
};
