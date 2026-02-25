import type { Lesson } from '../lesson-types';

export const lesson01: Lesson = {
  id: 'roles',
  number: 1,
  title: 'Assigning Roles',
  subtitle: 'The single most powerful thing you can do before typing your question.',
  kicker: 'PROMPT STRUCTURE',
  icon: '🎭',
  duration: '4 min read',
  keyTakeaways: [
    'Always start with "You are..." to set the AI\'s perspective and expertise.',
    'Different roles produce different tones, vocabulary, and focus areas.',
    'Match the role to what your client actually needs — advisor, analyst, coach, or editor.',
  ],
  prevLessonId: null,
  nextLessonId: 'prompt-body',
  sections: [
    {
      type: 'concept',
      title: 'Why Roles Matter',
      body: 'When you tell the AI **who it is** before asking your question, you fundamentally change the quality of the response. Think of it like calling a specialist instead of a general help desk — you get focused, relevant, expert-level answers.\n\nWithout a role, the AI gives a generic, one-size-fits-all response. With a role, it adopts the vocabulary, priorities, and thinking patterns of that professional.',
    },
    {
      type: 'tip',
      note: 'A role doesn\'t have to be long. Even a single sentence like "You are an experienced SBDC business advisor" dramatically improves output quality.',
    },
    {
      type: 'prompt',
      title: 'A Basic Role Assignment',
      label: 'SAMPLE PROMPT',
      prompt: 'You are an experienced SBDC business advisor who specializes in helping early-stage entrepreneurs create realistic financial projections.\n\nA client has a bakery that did $180K in revenue last year. They want to open a second location. Help them think through the financial implications.',
    },
    {
      type: 'output',
      label: 'AI RESPONSE',
      output: "Based on my experience advising early-stage food service businesses, here's how I'd help you think through a second location:\n\n**Financial Readiness Check**\n- At $180K revenue, your first location is showing traction, but we need to understand your margins. What percentage is profit after all expenses?\n- A second bakery location typically requires $80K–$150K in startup costs (lease deposit, equipment, initial inventory, permits).\n\n**Key Questions to Answer First**\n1. Is your current location consistently profitable month-over-month?\n2. Do you have 6 months of operating reserves for *both* locations?\n3. Can your supply chain and recipes scale without quality loss?\n\n**My Recommendation**\nBefore signing a lease, let's build a 12-month pro forma for the new location with conservative assumptions. I'd suggest projecting 60% of your current location's revenue for Year 1 of the new site.",
    },
    {
      type: 'concept',
      title: 'Notice What Happened',
      body: 'Because we assigned the role of an **SBDC business advisor**, the AI:\n- Asked diagnostic questions (like a real advisor would)\n- Referenced typical costs for that industry\n- Gave a conservative, practical recommendation\n- Structured the response as actionable advising, not a generic essay\n\nNow let\'s see what happens when we change the role.',
    },
    {
      type: 'divider',
    },
    {
      type: 'exercise',
      title: 'Your Turn: Change the Role',
      variant: 'Change "SBDC business advisor" to "bank loan officer evaluating a loan application" — same client scenario, completely different response.',
      modifiedPrompt: 'You are a bank loan officer evaluating a small business loan application.\n\nThe applicant owns a bakery that did $180K in revenue last year. They are requesting a loan to open a second location. Assess their readiness.',
      modifiedOutput: "**Loan Assessment — Bakery Expansion**\n\n**Applicant Profile:** Single-location bakery, $180K annual revenue\n**Request:** Financing for second location\n\n**Risk Factors:**\n- Revenue of $180K is relatively modest for supporting debt service on two locations\n- No information provided on current debt obligations or credit history\n- Food service has a high failure rate for multi-location expansion (roughly 60% in the first 2 years)\n\n**Required Documentation:**\n1. Last 3 years of tax returns\n2. Current P&L and balance sheet\n3. Personal financial statement\n4. Business plan with detailed financial projections for Location 2\n5. Lease terms for proposed location\n\n**Preliminary Assessment:** Additional information needed before a lending decision can be made. The $180K revenue alone does not demonstrate sufficient cash flow to service expansion debt.",
    },
    {
      type: 'concept',
      title: 'See the Difference?',
      body: 'The **same client situation** produced a completely different response:\n\n| SBDC Advisor | Bank Loan Officer |\n|---|---|\n| Coaching tone | Assessment tone |\n| Asks guiding questions | Lists required documents |\n| Encourages with guardrails | Identifies risk factors |\n| "Let\'s build a pro forma" | "Additional information needed" |\n\nBoth responses are useful — but for different purposes. As an SBDC advisor, you might use the **advisor role** when prepping for a client session, and the **loan officer role** when helping a client anticipate what a lender will ask.',
    },
    {
      type: 'tip',
      note: 'Try combining roles for even more power: "You are an SBDC advisor helping a client prepare for a bank loan meeting." This gives the AI both the coaching tone AND the lending perspective.',
    },
    {
      type: 'concept',
      title: 'Roles You Can Use Every Day',
      body: 'Here are roles that work well for SBDC advising:\n\n- **"You are an SBDC business advisor..."** — general client advising\n- **"You are a financial analyst..."** — number-crunching, projections, ratio analysis\n- **"You are a marketing strategist for small businesses..."** — marketing plans, social media\n- **"You are a grant writer..."** — funding narratives, applications\n- **"You are an HR consultant for small businesses..."** — employee policies, handbooks\n- **"You are a business plan reviewer..."** — critical analysis of plans\n- **"You are a devil\'s advocate..."** — stress-testing ideas, finding weaknesses',
    },
  ],
};
