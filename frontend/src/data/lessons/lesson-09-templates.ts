import type { Lesson } from '../lesson-types';

export const lesson09: Lesson = {
  id: 'templates',
  number: 9,
  title: 'Power of Templates',
  subtitle: 'Use structured tools to get consistent, high-quality results every time.',
  kicker: 'EFFICIENCY',
  icon: '📐',
  duration: '4 min read',
  keyTakeaways: [
    'Templates combine roles, context, and format instructions into reusable packages — so you don\'t start from scratch each time.',
    'The SBDC Advisor\'s Tools section has pre-built templates for common advising tasks.',
    'You can customize template outputs by filling in the blanks with client-specific details.',
  ],
  prevLessonId: 'pii',
  nextLessonId: 'putting-it-together',
  sections: [
    {
      type: 'concept',
      title: 'Why Templates?',
      body: 'By now you know the formula for a great prompt: **Role + Context + Specific Instructions + Format**. But typing all of that every time you need to prep for a session, review a plan, or draft an email is tedious.\n\nThat\'s where templates come in. A template is a **pre-built prompt with blanks** you fill in. It encodes best practices so you get consistent results without having to remember every detail.\n\nThink of it like a well-designed form: the structure is already there. You just provide the specifics.',
    },
    {
      type: 'concept',
      title: 'The Tools Section',
      body: 'The SBDC Advisor app includes a **Tools** section on the home screen. Each tool is a template designed for a common advising task:\n\n- **Business Plan Review** — paste in a plan summary, get structured feedback\n- **Funding Readiness Assessment** — input client financials, get a readiness score\n- **SWOT Analysis** — fill in business details, get a four-quadrant analysis\n- **Session Prep** — enter client info and past notes, get meeting preparation\n- **Client Follow-Up Email** — provide session highlights, get a professional email draft\n- **Getting Started with AI** — an intro walkthrough for AI-curious advisors\n\nEach tool guides you through filling in the relevant details, then generates a carefully structured prompt behind the scenes.',
    },
    {
      type: 'divider',
    },
    {
      type: 'prompt',
      title: 'Manual Prompt (From Scratch)',
      label: 'WITHOUT TEMPLATE',
      prompt: 'You are an SBDC business advisor. I have a client meeting tomorrow with someone who runs a food truck. They want to know if they\'re ready for a brick-and-mortar location. Help me prepare for the session. Give me key questions to ask, financial benchmarks to review, and some talking points about the transition from mobile to fixed location.',
    },
    {
      type: 'output',
      label: 'DECENT BUT GENERIC',
      output: "**Session Prep: Food Truck → Brick-and-Mortar**\n\n**Key Questions:**\n1. What's your current monthly revenue and profit margin?\n2. How consistent is your revenue month-over-month?\n3. Have you identified a specific location?\n4. What's your timeline and budget for the transition?\n\n**Financial Benchmarks:**\n- Should have 6+ months of operating reserves for the new location\n- Revenue should be consistently above $15K/month from the truck\n- Target a location where rent is no more than 8-10% of projected revenue\n\n**Talking Points:**\n- A brick-and-mortar requires significantly more upfront capital (build-out, equipment, permits)\n- Fixed costs are much higher (rent, utilities, insurance) compared to a food truck\n- The advantage: more seating, longer hours, larger menu, beer/wine license potential\n- Consider keeping the truck running during transition for cash flow",
    },
    {
      type: 'concept',
      body: 'That\'s useful, but you had to think of what to ask for. A template does that thinking for you.',
    },
    {
      type: 'prompt',
      title: 'Template-Generated Prompt',
      label: 'WITH TEMPLATE',
      prompt: 'You are a senior SBDC business advisor preparing for a client advising session.\n\nClient: Rosa\nBusiness: "Rosa\'s Kitchen" — food truck in Chico, CA\nIndustry: Food service / mobile food\nYears in business: 3\nEmployees: 2 (plus Rosa)\nAnnual revenue: $165,000\nCurrent challenges: Wants to transition to a brick-and-mortar restaurant location\n\nPrevious session notes:\nLast session (Nov 12): Discussed initial interest in a permanent location. Rosa mentioned a vacant storefront on Main Street (2,200 sq ft, $2,800/mo rent). She has $40K saved. We reviewed her food truck P&L — margins are around 32%.\n\nPlease provide a comprehensive session preparation guide:\n1. Session agenda (3-4 agenda items with time estimates for a 60-minute session)\n2. Key questions to ask (5-6 questions based on where we left off)\n3. Financial analysis talking points (using her actual numbers)\n4. Resources or referrals to mention\n5. Suggested homework for the client after this session',
    },
    {
      type: 'output',
      label: 'COMPREHENSIVE PREP',
      output: "**Session Prep — Rosa, Rosa's Kitchen (Food Truck → Brick-and-Mortar)**\n\n**1. Suggested Agenda (60 min)**\n| Time | Topic |\n|------|-------|\n| 0-10 min | Check-in: Progress since November, any new developments on the Main Street location |\n| 10-30 min | Financial deep-dive: Can the numbers support a brick-and-mortar at $2,800/mo? |\n| 30-45 min | Transition planning: timeline, permits, build-out, and keep-the-truck strategy |\n| 45-60 min | Action items, referrals, and next steps |\n\n**2. Key Questions**\n1. \"Rosa, has the Main Street storefront status changed since we last spoke? Is it still available?\"\n2. \"Have you gotten any estimates on build-out costs for the kitchen and dining area?\"\n3. \"Your food truck margins are 32% — have you estimated how that changes with rent, utilities, and additional staff for a restaurant?\"\n4. \"If the restaurant takes 3-4 months to build out, can you sustain yourself on food truck income during that period?\"\n5. \"Are you planning to keep the food truck running alongside the restaurant, at least initially?\"\n6. \"Have you talked to a commercial real estate broker or landlord about lease terms and tenant improvements?\"\n\n**3. Financial Talking Points**\n- At $165K revenue and 32% margin, Rosa is netting ~$52,800/year from the truck\n- The Main Street location at $2,800/mo = $33,600/year in rent alone — that's 64% of her current net income\n- To maintain her current income level, she'd need to generate roughly $270K+ in restaurant revenue (assuming restaurant margins of 15-20%)\n- Her $40K savings covers maybe 3-4 months of operating expenses for the restaurant — she'll likely need financing\n- Recommend building a 12-month pro forma before signing any lease\n\n**4. Resources to Mention**\n- SBA 504 loan program for real estate/equipment (long-term, fixed rate)\n- SCORE mentor with restaurant industry experience (I'll check availability)\n- Health department pre-consultation for commercial kitchen requirements\n- NorCal SBDC financial projection template\n\n**5. Homework for Rosa**\n- Get 2-3 contractor quotes for kitchen build-out at the Main Street space\n- Draft a simple menu and pricing plan for the restaurant (will differ from truck menu)\n- Review lease terms and bring a copy to our next session\n- Complete the SBDC startup cost worksheet for the restaurant concept",
    },
    {
      type: 'concept',
      title: 'Template Advantage',
      body: 'The template-generated prompt produced:\n- A **structured agenda** you can follow in the actual meeting\n- Questions that reference **specific details** from the previous session\n- **Math based on her actual numbers** ($165K revenue, 32% margins, $2,800 rent)\n- **Concrete referrals** relevant to her situation\n- **Clear homework** that moves the conversation forward\n\nAll because the template guided you to include the right information. You didn\'t have to think about prompt structure — you just filled in the blanks.',
    },
    {
      type: 'divider',
    },
    {
      type: 'exercise',
      title: 'Try the Templates',
      variant: 'Head back to the main chat and try the Session Prep or Business Plan Review tool from the home screen. Fill in the blanks with a real or hypothetical client.',
      modifiedPrompt: 'From the chat home screen, look for these tools:\n\n• Review a Business Plan — paste a summary, get structured feedback\n• Funding Readiness — input financials, get a readiness assessment\n• SWOT Analysis — fill in business details, get a 4-quadrant analysis\n• Prep for a Session — enter client info, get meeting preparation\n• Draft a Client Email — describe the session, get a follow-up email\n\nEach one will walk you through what to fill in. Click the "Copy" button to use the generated prompt in the chat.',
      modifiedOutput: "Templates save 5-10 minutes per session because you don't have to construct the prompt from scratch. And they produce consistently structured output that's easy to review and share.",
    },
    {
      type: 'tip',
      note: 'Think of templates as training wheels that also happen to work great for experts. Even experienced prompt writers use templates because they enforce consistency and prevent forgetting key elements.',
    },
  ],
};
