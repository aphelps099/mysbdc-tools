import type { Lesson } from '../lesson-types';

export const lesson05: Lesson = {
  id: 'iteration',
  number: 5,
  title: 'The Art of Follow-Up',
  subtitle: 'Great results come from conversation, not one-shot prompts.',
  kicker: 'TECHNIQUE',
  icon: '🔄',
  duration: '4 min read',
  keyTakeaways: [
    'Don\'t expect perfection on the first try — use follow-up messages to refine the output.',
    'Common follow-ups: "Make it shorter," "Add more detail on X," "Change the tone," "Now apply this to a different scenario."',
    'Each follow-up builds on the AI\'s memory of the conversation — you don\'t need to repeat yourself.',
  ],
  prevLessonId: 'specificity',
  nextLessonId: 'tone',
  sections: [
    {
      type: 'concept',
      title: 'Prompting Is a Conversation',
      body: 'One of the biggest mistakes new users make is treating AI like a search engine — type one query, get one result, start over. But AI chat is a **conversation**. Each message builds on the last.\n\nThe most effective advisors:\n1. Start with a solid first prompt (using roles, context, and specificity)\n2. Review the output with a critical eye\n3. Follow up to refine, redirect, or go deeper\n\nThink of it like coaching a smart intern: they\'ll do great work, but you might need to say "Good start — now make it more concise" or "Can you focus more on the financial angle?"',
    },
    {
      type: 'prompt',
      title: 'The Initial Prompt',
      label: 'FIRST MESSAGE',
      prompt: 'You are an SBDC advisor. Draft a brief executive summary for a business plan. The business is a mobile dog grooming service in Eureka, CA, started by a former veterinary technician with 8 years of experience.',
    },
    {
      type: 'output',
      label: 'FIRST DRAFT',
      output: "**Executive Summary**\n\nPaws & Wheels Mobile Grooming is a professional mobile dog grooming service serving Eureka, CA and surrounding Humboldt County communities. Founded by [Name], a certified veterinary technician with 8 years of clinical experience, the company brings salon-quality grooming directly to pet owners' homes.\n\nThe mobile grooming industry has grown 12% annually as pet owners increasingly value convenience and low-stress grooming experiences for their animals. With no dedicated mobile grooming service currently operating in Humboldt County, Paws & Wheels will fill a significant market gap.\n\nOur competitive advantages include the founder's veterinary background (enabling safe handling of anxious or elderly pets), a fully equipped grooming van, and the convenience of at-home service. Initial projections estimate Year 1 revenue of $85,000 based on an average of 5 appointments per day at $45-$75 per session.\n\nThe company is seeking $35,000 in startup financing to cover vehicle retrofitting, equipment, and initial marketing. The founder is investing $10,000 in personal funds. Profitability is projected by Month 8.",
    },
    {
      type: 'concept',
      title: 'Good Start — Now Refine',
      body: 'That\'s a solid first draft. But maybe it\'s too long, or the tone is too formal, or you want to emphasize something different. This is where **follow-up prompts** shine.\n\nHere are the kinds of follow-ups that work:',
    },
    {
      type: 'prompt',
      title: 'Follow-Up: Adjust Length',
      label: 'REFINE #1',
      prompt: 'Good, but cut it to 100 words max. Keep the key financial figures.',
    },
    {
      type: 'output',
      label: 'SHORTER VERSION',
      output: "**Executive Summary**\n\nPaws & Wheels Mobile Grooming brings professional grooming directly to pet owners' homes in Eureka and Humboldt County. Founded by a veterinary technician with 8 years of experience, the company fills a gap — no mobile groomer currently serves this market.\n\nYear 1 projected revenue: $85,000 (5 daily appointments, $45-$75/session). Startup costs: $35,000 for van retrofitting and equipment, with $10,000 founder investment. Profitability expected by Month 8.",
    },
    {
      type: 'prompt',
      title: 'Follow-Up: Change Emphasis',
      label: 'REFINE #2',
      prompt: 'Now rewrite it with the lender as the audience. Emphasize low risk and repayment ability.',
    },
    {
      type: 'output',
      label: 'LENDER-FOCUSED VERSION',
      output: "**Executive Summary**\n\nPaws & Wheels Mobile Grooming is a low-overhead, service-based business with strong repayment fundamentals. The founder brings 8 years as a certified veterinary technician — reducing the learning curve and client acquisition risk.\n\nThe $35,000 loan request covers vehicle retrofitting and equipment, backed by $10,000 in founder equity (22% skin in the game). With no brick-and-mortar lease, monthly fixed costs are minimal. At projected revenue of $85,000/year and operating margins of 45%, the business generates sufficient cash flow for loan repayment within 24 months while maintaining healthy reserves.\n\nHumboldt County has no competing mobile grooming service, providing a clear first-mover advantage in a market where pet spending grows 5-7% annually.",
    },
    {
      type: 'concept',
      title: 'The Power of Iteration',
      body: 'Notice how each follow-up built on the AI\'s existing knowledge of the business:\n\n1. **First prompt** → Full draft with all details\n2. **"Cut to 100 words"** → Condensed version, key numbers preserved\n3. **"Rewrite for a lender"** → Same facts, completely different framing\n\nYou didn\'t need to re-explain the business each time. The AI remembered everything from the conversation.',
    },
    {
      type: 'divider',
    },
    {
      type: 'exercise',
      title: 'Follow-Up Phrases to Remember',
      variant: 'Try these follow-up patterns after any AI response. Copy the ones you like and test them in the chat.',
      modifiedPrompt: '• "Make it shorter / longer"\n• "Change the tone to be more [casual / formal / encouraging / direct]"\n• "Now write this as a [email / bullet list / one-pager / social media post]"\n• "Focus more on [financial details / action items / risks / opportunities]"\n• "What questions should I ask to pressure-test this?"\n• "Give me the counter-argument to everything you just said"\n• "Simplify this for a client who has never written a business plan"\n• "Good — now apply this same approach to [a different client scenario]"',
      modifiedOutput: "You don't need a new prompt for each of these — just type them as your next message in the conversation. The AI will refine its previous response based on your direction.\n\nThis is the biggest time-saver in AI advising: **start broad, then sculpt the output with follow-ups.**",
    },
    {
      type: 'tip',
      note: 'If the conversation gets long and the AI seems to lose track of earlier details, just start a new chat and paste in a brief summary of what you need. Fresh context beats a cluttered conversation.',
    },
  ],
};
