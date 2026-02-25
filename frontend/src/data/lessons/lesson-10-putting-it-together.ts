import type { Lesson } from '../lesson-types';

export const lesson10: Lesson = {
  id: 'putting-it-together',
  number: 10,
  title: 'Putting It All Together',
  subtitle: 'Combine everything you\'ve learned in a real advising scenario.',
  kicker: 'MASTERY',
  icon: '🏆',
  duration: '5 min read',
  keyTakeaways: [
    'Great prompts combine role + context + specificity + format. You now know how to do all four.',
    'The AI is a tool that amplifies your expertise — it doesn\'t replace your judgment.',
    'Practice makes permanent: the more you use these techniques, the faster and more natural they become.',
  ],
  prevLessonId: 'templates',
  nextLessonId: null,
  sections: [
    {
      type: 'concept',
      title: 'The Full Toolkit',
      body: 'Over the past 9 lessons, you\'ve built a complete AI prompting toolkit:\n\n| Lesson | Skill | One-Liner |\n|--------|-------|----------|\n| 1. Roles | Assign a persona | "You are a..." |\n| 2. Prompt Body | Structure your request | Task + format + constraints |\n| 3. Context | Provide background | Client details, situation, history |\n| 4. Specificity | Be precise | Quantify, name formats, set boundaries |\n| 5. Follow-Up | Iterate and refine | "Make it shorter / Change the tone" |\n| 6. Tone | Sound human | Ban buzzwords, set voice direction |\n| 7. RAG | Use your documents | Upload and reference real data |\n| 8. PII | Protect privacy | Anonymize, sanitize, first names only |\n| 9. Templates | Use pre-built tools | Fill-in-the-blank prompt generators |\n\nNow let\'s put them all together.',
    },
    {
      type: 'divider',
    },
    {
      type: 'concept',
      title: 'The Scenario',
      body: 'You\'re an SBDC advisor in Redding, CA. You just finished a session with a client — here\'s the situation:\n\n**Client:** Ana, owns a small graphic design studio (2 employees)\n**Revenue:** $195K last year, flat growth\n**Challenge:** Ana wants to pivot from one-off logo projects ($500-$1,500 each) to monthly retainer packages ($2,000-$5,000/month) for local businesses. She has 3 potential retainer clients interested but doesn\'t know how to price, structure, or pitch retainer packages.\n\nLet\'s walk through how you\'d use AI at each stage of this advising engagement.',
    },
    {
      type: 'concept',
      title: 'Step 1: Session Prep (Before the Meeting)',
      body: 'Before your meeting with Ana, you need to understand the retainer model for creative services and prepare informed questions.',
    },
    {
      type: 'prompt',
      title: 'Session Prep Prompt',
      label: 'COMBINING: ROLE + CONTEXT + SPECIFICITY',
      prompt: 'You are an SBDC business advisor who specializes in helping creative services businesses grow.\n\nI have a session tomorrow with Ana, who owns a 2-person graphic design studio ($195K revenue, flat growth). She wants to transition from project-based work to monthly retainer packages. She has 3 interested prospects.\n\nHelp me prepare:\n1. What are industry-standard retainer pricing tiers for a small design studio?\n2. Give me 4 key questions to ask Ana about her current capacity and pipeline\n3. What are the top 3 risks of transitioning to retainers, and how should she mitigate each?\n\nKeep the total response under 250 words.',
    },
    {
      type: 'output',
      label: 'PREP NOTES',
      output: "**1. Industry-Standard Retainer Tiers**\n- **Basic** ($1,500-$2,500/mo): 10-15 hours of design work, email support, 1 revision round\n- **Growth** ($3,000-$4,500/mo): 20-25 hours, priority turnaround, social media graphics included\n- **Premium** ($5,000+/mo): Dedicated designer, brand strategy sessions, unlimited revisions\n\n**2. Key Questions for Ana**\n1. How many hours/week are you and your employee currently billable? (Assess capacity before adding retainer commitments)\n2. What's your average hourly effective rate on project work? (So retainer pricing doesn't undervalue her time)\n3. What services would retainer clients expect monthly? (Define scope to prevent scope creep)\n4. Can you afford to say no to project work while ramping up retainers? (Cash flow bridge)\n\n**3. Top 3 Risks**\n1. **Scope creep** — Retainer clients request more than the package covers → Mitigate with a detailed service agreement and monthly hour tracking\n2. **Cash flow gap** — Retainer revenue is slower to ramp than project income → Keep accepting projects during the transition; don't go all-in at once\n3. **Underpricing** — Setting retainer fees too low to win clients → Calculate her hourly cost (salary + overhead) first, then price retainers at 2.5-3x that rate",
    },
    {
      type: 'concept',
      title: 'Step 2: During the Session (Live Assist)',
      body: 'During the meeting, Ana mentions she currently charges $75/hour effective rate on project work but isn\'t tracking hours consistently. You want to quickly show her the math on retainer pricing.',
    },
    {
      type: 'prompt',
      title: 'Quick Calculation',
      label: 'FOLLOW-UP IN THE SAME CONVERSATION',
      prompt: 'Ana says her effective hourly rate is about $75/hour on project work. She and her designer can each dedicate about 15 hours/month to retainer work without sacrificing existing projects.\n\nDo the math: What should her mid-tier retainer be priced at, and what would 3 retainer clients at that rate mean for her annual revenue? Show the calculation clearly so I can walk her through it.',
    },
    {
      type: 'output',
      label: 'LIVE CALCULATION',
      output: "**Retainer Pricing Math for Ana**\n\n**Current effective rate:** $75/hr\n**Target retainer multiplier:** 2.5x (standard for guaranteed monthly work)\n**Retainer hourly rate:** $75 × 2.5 = **$187.50/hr**\n\n**Mid-Tier Package (20 hours/month):**\n20 hours × $187.50 = **$3,750/month**\n\n**Revenue Impact of 3 Retainer Clients:**\n3 clients × $3,750/month = $11,250/month\n$11,250 × 12 months = **$135,000/year in retainer revenue**\n\n**Combined with existing project work:**\nCurrent revenue: $195,000\nRetainer addition: $135,000\n**Potential total: $330,000/year** (a 69% increase)\n\n**Important caveat:** The 30 retainer hours/month (15 each for Ana + designer) means less capacity for project work. She might lose $40K-$60K in project revenue. Net gain is still $75K-$95K — significant.\n\n**Bottom line for Ana:** Even a conservative estimate shows retainers nearly doubling her take-home if she lands all 3 clients.",
    },
    {
      type: 'concept',
      title: 'Step 3: After the Session (Follow-Up Email)',
      body: 'The meeting went well. Now you need to send Ana a follow-up email. Let\'s combine tone control with the session context.',
    },
    {
      type: 'prompt',
      title: 'Follow-Up Email',
      label: 'COMBINING: ITERATION + TONE + PII-SAFE',
      prompt: 'Draft a follow-up email from me to Ana after our session today.\n\nKey takeaways from the session:\n- Discussed retainer pricing: her mid-tier should be around $3,750/month\n- She\'ll draft a one-page retainer service agreement this week\n- She\'ll reach out to 2 of her 3 interested prospects with a retainer pitch by Friday\n- Next session: January 22\n\nTone: Warm and encouraging. Short paragraphs. No corporate jargon. Under 100 words. Sound like a supportive colleague, not a form letter.',
    },
    {
      type: 'output',
      label: 'READY-TO-SEND EMAIL',
      output: "Hi Ana,\n\nReally enjoyed our session today — you're onto something exciting with the retainer model.\n\nQuick recap of your game plan:\n- Draft a one-page retainer service agreement (this week)\n- Reach out to at least 2 of your 3 interested prospects with a pitch (by Friday)\n- Target: $3,750/month mid-tier package\n\nYou've already done the hard part — identifying the opportunity and doing the math. Now it's about execution. Rooting for you.\n\nLet's check in on progress on **January 22**.\n\nBest,\n[Your name]",
    },
    {
      type: 'divider',
    },
    {
      type: 'concept',
      title: 'What You Just Did',
      body: 'In this scenario, you used **every skill from the 10 lessons:**\n\n1. ✅ **Role** — "SBDC advisor specializing in creative services"\n2. ✅ **Prompt body** — clear structure with numbered deliverables\n3. ✅ **Context** — Ana\'s specific business details and situation\n4. ✅ **Specificity** — "under 250 words," "3 retainer tiers," exact numbers\n5. ✅ **Follow-up** — built on the previous response with new information\n6. ✅ **Tone** — "warm and encouraging, no corporate jargon"\n7. ✅ **RAG** — (in practice, your uploaded SBDC resources would inform the advice)\n8. ✅ **PII** — first name only, no sensitive personal data\n9. ✅ **Templates** — structured like the Session Prep and Follow-Up Email tools\n\nThis is what proficient AI use looks like: **natural, fast, and genuinely helpful** for your advising work.',
    },
    {
      type: 'tip',
      note: 'You don\'t need to use every technique in every prompt. Start with Role + Context, and layer in more as needed. The goal is better outcomes for your clients, not perfect prompts.',
    },
    {
      type: 'concept',
      title: 'Keep Practicing',
      body: 'The best way to improve is to **use AI in your daily work** and pay attention to what works:\n\n- Before your next client session, try the **Session Prep** template\n- After a meeting, draft the follow-up email with AI and edit it in your own voice\n- When a client asks a question you\'re unsure about, use AI as a thought partner\n- Experiment with different roles to see how they change the output\n\nYou now have the skills. The rest is practice.\n\n**Head back to the chat** and try what you\'ve learned. We\'re here to help.',
    },
  ],
};
