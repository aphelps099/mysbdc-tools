import type { Lesson } from '../lesson-types';

export const lesson04: Lesson = {
  id: 'specificity',
  number: 4,
  title: 'Be Specific, Get Specific',
  subtitle: 'Vague questions get vague answers. Precise prompts unlock precise value.',
  kicker: 'TECHNIQUE',
  icon: '🎯',
  duration: '4 min read',
  keyTakeaways: [
    'Replace generic words ("help," "improve," "analyze") with specific actions ("list 5 risks," "draft 3 subject lines," "compare these two options").',
    'Specify your audience — who is reading this output? A client, a lender, a colleague?',
    'Quantify whenever possible: "3 bullet points" beats "a few ideas."',
  ],
  prevLessonId: 'context',
  nextLessonId: 'iteration',
  sections: [
    {
      type: 'concept',
      title: 'The Specificity Principle',
      body: 'AI models do exactly what you ask them to do. The problem is that humans often ask vague questions and expect specific answers.\n\nConsider the difference:\n- ❌ "Analyze this business" → The AI doesn\'t know what kind of analysis, how deep, or what format\n- ✅ "Identify the top 3 financial risks for this business and rate each as high/medium/low" → Clear, actionable, measurable\n\nSpecificity isn\'t about writing longer prompts. It\'s about writing **clearer** ones.',
    },
    {
      type: 'prompt',
      title: 'Vague Request',
      label: 'VAGUE',
      prompt: 'You are a business advisor. Help me prepare for my client meeting tomorrow.',
    },
    {
      type: 'output',
      label: 'UNFOCUSED RESPONSE',
      output: "Here's how to prepare for your client meeting:\n\n1. **Review client history** — Look at previous notes and action items\n2. **Set an agenda** — Define 2-3 key topics to cover\n3. **Prepare materials** — Gather any reports, data, or resources you'll reference\n4. **Set goals** — What outcomes do you want from this meeting?\n5. **Anticipate questions** — Think about what the client might ask\n\nWould you like help with any of these steps?",
    },
    {
      type: 'concept',
      body: 'That\'s a generic checklist anyone could find on Google. Now watch how specificity transforms the output.',
    },
    {
      type: 'divider',
    },
    {
      type: 'prompt',
      title: 'Specific Request',
      label: 'SPECIFIC',
      prompt: 'You are an SBDC business advisor preparing for a 45-minute client session tomorrow.\n\nClient: Sarah, owns a yoga studio (2 years old, 4 instructors, $120K revenue, downtown Redding, CA)\nLast session: We discussed her goal of adding a retail component (yoga mats, apparel, supplements)\nAction items from last time: She was going to research wholesale suppliers and visit 2 competitor studios\n\nGenerate:\n1. Three opening questions to check on her progress since our last session\n2. A quick SWOT analysis of the retail expansion idea (2 bullets per category)\n3. Two specific financial questions I should ask her\n4. A suggested homework assignment for her before our next meeting',
    },
    {
      type: 'output',
      label: 'PRECISE RESPONSE',
      output: "**1. Opening Questions (Check-In)**\n- \"Sarah, last time we talked about researching wholesale suppliers for retail. Were you able to identify any that felt like a good fit?\"\n- \"You mentioned visiting a couple of competitor studios — what stood out to you about how they handle retail?\"\n- \"Have you had any more conversations with your instructors about how retail would work alongside classes?\"\n\n**2. Quick SWOT — Retail Expansion**\n\n| | |\n|---|---|\n| **Strengths** | Captive audience (existing students), built-in trust with your community |\n| | Low-risk test: start with a small display near checkout before committing to full inventory |\n| **Weaknesses** | No retail experience — inventory management, pricing, and margins are new skills |\n| | Additional cash tied up in inventory ($3K-$8K initial stock) |\n| **Opportunities** | Online sales channel via your website could extend reach beyond studio |\n| | Branded merchandise creates marketing touchpoints outside the studio |\n| **Threats** | Amazon and online yoga retailers offer lower prices and wider selection |\n| | Retail could distract from the core service (teaching) if not well-managed |\n\n**3. Financial Questions to Ask**\n- \"What's your current average transaction per student visit? If we added a $15-$25 retail purchase to even 20% of visits, what would that mean for your monthly revenue?\"\n- \"How much cash can you set aside for initial inventory without impacting your ability to cover 2 months of fixed expenses?\"\n\n**4. Homework Assignment**\nBefore our next meeting: Create a simple spreadsheet listing 10 products you'd want to carry, their wholesale cost, your retail price, and the margin per item. This will tell us whether the economics work before you invest in inventory.",
    },
    {
      type: 'concept',
      title: 'What Made This Work?',
      body: 'The specific prompt produced output that is:\n- **Ready to use** in tomorrow\'s actual meeting\n- **Personalized** to Sarah\'s yoga studio and retail idea\n- **Actionable** — real questions, real analysis, real homework\n- **Properly scoped** — a 45-minute session\'s worth of content, not a novel\n\nThe key differences: we specified the **client**, the **situation**, the **format**, and **exactly what we needed**.',
    },
    {
      type: 'divider',
    },
    {
      type: 'exercise',
      title: 'Your Turn: From Vague to Specific',
      variant: 'Rewrite "Help me write a follow-up email to my client" with specifics about who, what, and why.',
      modifiedPrompt: 'You are an SBDC advisor writing a follow-up email after a client session.\n\nClient: David, owns a landscaping company (5 employees, $310K revenue)\nSession topic: We reviewed his pricing strategy — he\'s been undercharging by 15-20% compared to competitors\nKey takeaways: He agreed to raise prices for new clients starting next month and will test premium packages for commercial accounts\n\nWrite a follow-up email that:\n- Recaps what we discussed (3 bullet points max)\n- Lists his action items with specific deadlines\n- Is warm but professional, under 150 words\n- Ends with the date of our next session: March 15',
      modifiedOutput: "Subject: Great session today, David — action items inside\n\nHi David,\n\nGreat meeting today! Here's a quick recap:\n\n- Your current pricing is 15-20% below market — there's real margin to capture\n- We agreed to raise rates for all new clients starting February 1\n- You'll pilot a \"Premium Commercial\" package at 25% above your current rate for 3 commercial prospects\n\n**Your action items:**\n1. Update your new-client price sheet by January 28\n2. Draft the Premium Commercial package details and send to me for review by February 5\n3. Identify 3 commercial accounts to test the premium pricing\n\nI'm confident these changes will have a meaningful impact on your bottom line this year. Let's check in on progress at our next session on **March 15**.\n\nBest,\n[Your name]\nNorCal SBDC",
    },
    {
      type: 'tip',
      note: 'A good test of specificity: Could someone else use your prompt and get a useful answer without any additional context? If yes, your prompt is specific enough.',
    },
  ],
};
