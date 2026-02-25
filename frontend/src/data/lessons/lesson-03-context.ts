import type { Lesson } from '../lesson-types';

export const lesson03: Lesson = {
  id: 'context',
  number: 3,
  title: 'Context is Everything',
  subtitle: 'The more relevant detail you provide, the more useful the response.',
  kicker: 'PROMPT STRUCTURE',
  icon: '📋',
  duration: '5 min read',
  keyTakeaways: [
    'Context is the background information that helps the AI give a relevant, specific answer.',
    'More context usually means better output — but only if it\'s relevant context.',
    'Think of context like briefing a colleague: what do they need to know to help you?',
  ],
  prevLessonId: 'prompt-body',
  nextLessonId: 'specificity',
  sections: [
    {
      type: 'concept',
      title: 'What Is Context?',
      body: 'Context is the **background information** you include in your prompt. It\'s the difference between asking a stranger for directions vs. asking someone who knows where you\'re starting from, where you\'re going, and how you\'re traveling.\n\nFor SBDC advisors, context usually means:\n- **Client details** — industry, stage, revenue, employees, location\n- **The situation** — what happened, what they\'re trying to do, what they\'ve already tried\n- **Your goal** — are you prepping for a session? Writing a follow-up? Analyzing data?',
    },
    {
      type: 'prompt',
      title: 'Without Context',
      label: 'LOW CONTEXT',
      prompt: 'You are a business advisor. How should my client grow their business?',
    },
    {
      type: 'output',
      label: 'GENERIC RESPONSE',
      output: "Here are some general strategies for business growth:\n\n1. **Increase marketing efforts** — invest in digital marketing, social media, and local advertising\n2. **Improve customer retention** — loyalty programs, follow-ups, excellent service\n3. **Expand product/service offerings** — add complementary products or services\n4. **Enter new markets** — geographic expansion or new customer segments\n5. **Optimize operations** — reduce costs, improve efficiency\n6. **Build partnerships** — strategic alliances with complementary businesses\n\nWould you like me to go deeper into any of these strategies?",
    },
    {
      type: 'concept',
      body: 'That response could apply to literally any business on earth. Now watch what happens when we add context.',
    },
    {
      type: 'divider',
    },
    {
      type: 'prompt',
      title: 'With Rich Context',
      label: 'HIGH CONTEXT',
      prompt: 'You are an SBDC business advisor specializing in food service businesses.\n\nClient context:\n- Maria owns a taco truck in Sacramento, CA (2 years in operation)\n- Revenue: $145K last year (up from $98K the year before — 48% growth)\n- Operates 5 days/week at a fixed location near a business park\n- 2 part-time employees + Maria\n- Has been approached by 3 local offices about catering\n- Has $22K in savings, no business debt\n- Goal: grow to $250K revenue in the next 12 months\n\nGiven this context, what are the top 3 growth strategies you\'d recommend? For each, explain the opportunity, estimated investment, and potential revenue impact.',
    },
    {
      type: 'output',
      label: 'TAILORED RESPONSE',
      output: "Based on Maria's strong growth trajectory and the specific opportunities in front of her, here are my top 3 recommendations:\n\n**1. Launch a Corporate Catering Program**\n- **Opportunity:** Three offices have already expressed interest — this is demand waiting to be captured. Corporate catering typically has higher margins (40-50%) than walk-up service because of larger order sizes and advance ordering.\n- **Investment:** ~$2K for catering-specific supplies (chafing dishes, serving trays, insulated bags), plus a simple online ordering form.\n- **Revenue Impact:** If she lands just 2 weekly catering orders averaging $350 each, that's ~$36K/year in new revenue. With all 3 offices plus referrals, $50K+ is realistic.\n\n**2. Add a 6th Day (Saturday) at a Farmers Market or Event Venue**\n- **Opportunity:** Sacramento has 8+ active farmers markets. Weekend foot traffic at these events is strong for food trucks, and it diversifies her customer base beyond the business park.\n- **Investment:** Market booth fees ($50-$150/week) plus one additional part-time employee shift.\n- **Revenue Impact:** Typical Saturday farmers market revenue for an established food truck is $800-$1,500. Conservatively, $40K-$60K annualized.\n\n**3. Expand the Fixed Location Schedule to Evening Hours (2-3 nights/week)**\n- **Opportunity:** The business park location likely has low dinner traffic, but if there are residential areas nearby or evening events, extending hours could capture a new customer segment.\n- **Investment:** Extended employee hours (~$8K/year) plus minor lighting/signage for evening visibility.\n- **Revenue Impact:** $15K-$25K if evening traffic is moderate.\n\n**Prioritization:** Start with #1 (catering) — it's the lowest risk because demand already exists. Use catering profits to fund #2 by month 3. Reassess #3 after 6 months based on data.",
    },
    {
      type: 'concept',
      title: 'The Difference Context Makes',
      body: 'With context, the AI:\n- Referenced **Maria\'s specific numbers** ($145K, 48% growth, $22K savings)\n- Addressed the **actual opportunity** (the 3 offices asking about catering)\n- Gave **dollar estimates** calibrated to her business size\n- **Prioritized** recommendations based on her situation\n- Suggested a **phased approach** that matches her cash position\n\nThis is the kind of output you can actually use in a client session.',
    },
    {
      type: 'divider',
    },
    {
      type: 'exercise',
      title: 'Your Turn: Add Context to a Weak Prompt',
      variant: 'Start with the weak prompt "Help my client with their marketing" and add 4-5 lines of client context. See how the output transforms.',
      modifiedPrompt: 'You are an SBDC marketing advisor.\n\nClient context:\n- James runs a residential cleaning service in Chico, CA (1 year old)\n- Revenue: $48K last year, mostly from word-of-mouth referrals\n- Solo operator, considering hiring first employee\n- No website, no social media presence\n- Average job: $150, serves about 6 clients/week\n- Goal: double revenue to $96K this year\n\nWhat are the 3 most impactful marketing moves James should make in the next 60 days? Be specific about tactics, costs, and expected outcomes.',
      modifiedOutput: "**1. Claim & Optimize Google Business Profile (Week 1 — Free)**\nThis is James's single highest-impact move. 87% of consumers search online for local services. He should:\n- Create a Google Business Profile with his service area, hours, and photos\n- Ask his 5 best clients to leave Google reviews this week\n- Add before/after cleaning photos (these perform extremely well for cleaning services)\n- **Expected impact:** Within 30 days, he should see 2-3 new inquiries per week from Google searches for \"house cleaning Chico CA.\"\n\n**2. Launch a Simple Referral Program (Week 2 — ~$200/month)**\nJames already grows through word-of-mouth. Let's formalize it:\n- Offer existing clients $25 off their next cleaning for each referral that books\n- Give the referred customer $25 off their first cleaning\n- Print simple referral cards to leave after each job\n- **Expected impact:** If even 2 of his 6 weekly clients refer someone per month, that's 8 new clients/month. At $150/job, potentially $1,200+/month in new revenue.\n\n**3. Set Up a One-Page Website With Online Booking (Week 3-4 — $30/month)**\nWhen potential clients Google him after a referral, they need somewhere to land:\n- Use a tool like Square or Housecall Pro ($30/mo) that includes scheduling\n- Include: services, pricing, service area, reviews, and a \"Book Now\" button\n- **Expected impact:** Converts Google and referral traffic into booked jobs. Reduces back-and-forth texting for scheduling.",
    },
    {
      type: 'tip',
      note: 'You don\'t need to share real client names or identifying information with the AI. Use first names only or pseudonyms. We\'ll cover PII protection in detail in Lesson 8.',
    },
  ],
};
