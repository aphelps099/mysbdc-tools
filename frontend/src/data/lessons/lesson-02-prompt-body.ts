import type { Lesson } from '../lesson-types';

export const lesson02: Lesson = {
  id: 'prompt-body',
  number: 2,
  title: 'Crafting Your Prompt',
  subtitle: 'How clear instructions produce dramatically better results.',
  kicker: 'PROMPT STRUCTURE',
  icon: '✍️',
  duration: '5 min read',
  keyTakeaways: [
    'Break complex requests into numbered steps for clearer output.',
    'Tell the AI what format you want — bullets, paragraphs, tables, or emails.',
    'Include constraints: word count, audience level, or specific sections to cover.',
  ],
  prevLessonId: 'roles',
  nextLessonId: 'context',
  sections: [
    {
      type: 'concept',
      title: 'Structure Drives Quality',
      body: 'The body of your prompt is where you tell the AI **what to do**. The clearest prompts have three parts:\n\n1. **The task** — What do you want? ("Write a follow-up email," "Analyze this business plan," "Create a checklist")\n2. **The format** — How should it be structured? ("Use bullet points," "Keep it under 200 words," "Organize by section")\n3. **The constraints** — What boundaries apply? ("The client is pre-revenue," "Tone should be encouraging," "Focus on the next 90 days")\n\nVague prompts get vague answers. Specific prompts get specific, usable answers.',
    },
    {
      type: 'prompt',
      title: 'A Vague Prompt',
      label: 'BEFORE',
      prompt: 'Help me with a business plan.',
    },
    {
      type: 'output',
      label: 'GENERIC RESPONSE',
      output: "Sure! A business plan typically includes these sections:\n\n1. Executive Summary\n2. Company Description\n3. Market Analysis\n4. Organization & Management\n5. Service or Product Line\n6. Marketing & Sales\n7. Financial Projections\n\nWould you like me to help you with any specific section?",
    },
    {
      type: 'concept',
      body: 'The AI gave a textbook answer because the prompt was textbook-vague. Let\'s add structure.',
    },
    {
      type: 'prompt',
      title: 'A Structured Prompt',
      label: 'AFTER',
      prompt: 'You are a business plan reviewer at the NorCal SBDC.\n\nReview the following business plan summary for a mobile pet grooming service. The owner has 3 years of grooming experience and $15K in savings.\n\nProvide feedback in this format:\n1. **Strengths** (2-3 bullet points)\n2. **Concerns** (2-3 bullet points)\n3. **Questions to Ask the Client** (3-4 questions)\n4. **Recommended Next Steps** (prioritized list)\n\nKeep your total response under 300 words. Tone should be supportive but honest.',
    },
    {
      type: 'output',
      label: 'FOCUSED RESPONSE',
      output: "**Strengths**\n- 3 years of hands-on grooming experience reduces technical risk significantly\n- Mobile model has lower overhead than a brick-and-mortar location\n- Pet services industry has grown 7% annually — strong market tailwind\n\n**Concerns**\n- $15K may be tight for a fully equipped van ($20K–$40K typical) plus licensing, insurance, and 3 months of operating reserves\n- No mention of a marketing plan or how they'll acquire their first 20 customers\n\n**Questions to Ask the Client**\n1. Have you priced out a used grooming van vs. retrofitting a cargo van?\n2. What's your target pricing per appointment, and how many appointments per day is realistic?\n3. Do you have any existing client relationships from your grooming work?\n4. Have you researched local licensing and mobile business permits?\n\n**Recommended Next Steps**\n1. Complete a startup cost worksheet — itemize every expense before launch\n2. Draft a simple 12-month financial projection with conservative appointment counts\n3. Research SBA microloans or SBDC microlending partners for the equipment gap\n4. Build a \"soft launch\" plan using your existing network before investing in ads",
    },
    {
      type: 'concept',
      title: 'What Changed?',
      body: 'By adding structure to the prompt body, we got:\n- **Organized output** that matches our requested format\n- **Specific, actionable feedback** instead of generic advice\n- **Appropriate length** — concise enough to use in a real advising session\n- **The right tone** — supportive but direct\n\nThe AI followed our structure because we gave it one.',
    },
    {
      type: 'divider',
    },
    {
      type: 'exercise',
      title: 'Your Turn: Add Format Instructions',
      variant: 'Take this vague prompt and rewrite it with a clear task, format, and constraints. Then compare the outputs.',
      modifiedPrompt: 'You are an SBDC advisor helping a client improve their online presence.\n\nThe client runs a small accounting firm (2 employees) and has no website or social media. They have a budget of $500/month for marketing.\n\nCreate a 90-day digital marketing action plan. Format it as a table with columns: Week | Action Item | Estimated Cost | Expected Outcome.\n\nLimit to 8 action items. Prioritize free or low-cost tactics first.',
      modifiedOutput: "| Week | Action Item | Est. Cost | Expected Outcome |\n|------|------------|-----------|------------------|\n| 1-2 | Claim Google Business Profile (free) | $0 | Appear in local search results |\n| 1-2 | Set up a basic LinkedIn company page | $0 | Professional online presence |\n| 3-4 | Build a simple one-page website (Carrd or Wix) | $15/mo | Credibility + contact form |\n| 4-5 | Ask 5 existing clients for Google reviews | $0 | Social proof, improved local SEO |\n| 5-6 | Post 2x/week on LinkedIn (tax tips, business advice) | $0 | Thought leadership, reach |\n| 7-8 | Run a Google Ads campaign targeting \"accountant near me\" | $300/mo | Lead generation |\n| 9-10 | Create a simple lead magnet (\"Tax Prep Checklist\" PDF) | $50 one-time | Email list building |\n| 11-12 | Launch monthly email newsletter to prospects | $20/mo | Nurture leads, stay top-of-mind |",
    },
    {
      type: 'tip',
      note: 'When you specify a table format, the AI organizes information in a way that\'s easy to copy into a document or share with a client. Tables work great for action plans, comparisons, and timelines.',
    },
  ],
};
