import type { Lesson } from '../lesson-types';

export const lesson06: Lesson = {
  id: 'tone',
  number: 6,
  title: 'Humanizing AI Language',
  subtitle: 'Make AI output sound like you wrote it, not a robot.',
  kicker: 'WRITING',
  icon: '🗣️',
  duration: '4 min read',
  keyTakeaways: [
    'AI defaults to a formal, corporate tone. You have to actively direct it toward natural language.',
    'Use phrases like "Write as if you\'re speaking to a colleague" or "Avoid buzzwords and jargon."',
    'Always review and edit AI output before sending to clients — your voice matters.',
  ],
  prevLessonId: 'iteration',
  nextLessonId: 'rag',
  sections: [
    {
      type: 'concept',
      title: 'The Robot Problem',
      body: 'Out of the box, AI tends to write in a style that\'s polished but **impersonal** — full of phrases like "leverage synergies," "drive engagement," and "in today\'s fast-paced world." This is the AI equivalent of corporate speak.\n\nYour clients and colleagues will notice. If every email you send suddenly reads like a LinkedIn post, people lose trust. The goal is to use AI for the **thinking and structure**, then make the output sound like **you**.',
    },
    {
      type: 'prompt',
      title: 'Default AI Tone',
      label: 'WITHOUT TONE DIRECTION',
      prompt: 'Write a congratulations message to a client who just got approved for an SBA loan.',
    },
    {
      type: 'output',
      label: 'ROBOTIC OUTPUT',
      output: "Dear [Client Name],\n\nI am delighted to extend my heartfelt congratulations on the successful approval of your SBA loan application. This significant milestone represents a testament to your unwavering dedication and entrepreneurial vision.\n\nThe journey to securing funding is a rigorous one, and your perseverance through the application process speaks volumes about your commitment to your business's growth trajectory. This capital infusion will undoubtedly serve as a catalyst for the next phase of your enterprise's development.\n\nAs your SBDC advisor, I remain committed to supporting you as you leverage this funding to achieve your strategic objectives. Please do not hesitate to reach out should you require any further assistance.\n\nWarm regards,\n[Your Name]",
    },
    {
      type: 'concept',
      body: 'Nobody talks like that. Let\'s fix it with explicit tone instructions.',
    },
    {
      type: 'divider',
    },
    {
      type: 'prompt',
      title: 'With Tone Direction',
      label: 'WITH TONE GUIDANCE',
      prompt: 'Write a congratulations message to a client who just got approved for an SBA loan.\n\nTone guidelines:\n- Write like a friendly colleague, not a corporate executive\n- Use short sentences. No buzzwords.\n- Sound genuinely happy for them — this is a big deal\n- Keep it under 80 words\n- No "leverage," "catalyst," "trajectory," or "endeavor"',
    },
    {
      type: 'output',
      label: 'HUMAN OUTPUT',
      output: "Hey Sarah!\n\nJust heard the news — your SBA loan got approved! That is huge. You put in the work on that application and it paid off.\n\nI know the last few months of paperwork weren't fun, but now you've got the funding to make the expansion happen. Really proud of how far you've come.\n\nLet's set up a call next week to map out your next steps. Exciting times ahead.\n\nTalk soon,\nMike",
    },
    {
      type: 'concept',
      title: 'What Changed?',
      body: 'Same message, completely different feel:\n\n| Robotic Version | Human Version |\n|---|---|\n| "Heartfelt congratulations" | "That is huge" |\n| "Unwavering dedication" | "You put in the work" |\n| "Capital infusion" | "The funding" |\n| "Strategic objectives" | "Next steps" |\n| 130 words | 70 words |\n\nThe human version is shorter, warmer, and sounds like something a real person would actually send.',
    },
    {
      type: 'tip',
      note: 'The banned-words trick is very effective. Tell the AI which words or phrases to avoid: "No jargon," "Don\'t use the word leverage," "Avoid starting sentences with \'It is important to note that.\'"',
    },
    {
      type: 'divider',
    },
    {
      type: 'exercise',
      title: 'Your Turn: Humanize a Summary',
      variant: 'Add tone instructions to this prompt and compare the outputs.',
      modifiedPrompt: 'You are an SBDC advisor writing a brief session summary for your own notes after a client meeting.\n\nClient: Tom, restaurant owner, struggling with food costs (up 22% since last year)\nWhat we discussed: Reviewed his menu pricing, identified 5 items with margins below 20%, talked about portion control and supplier negotiation\n\nTone: Write like you\'re jotting quick notes for yourself. Casual, abbreviations are fine, no complete sentences needed. Think of it like a text message to your future self. Under 60 words.',
      modifiedOutput: "Tom — restaurant, food costs up 22% YoY crushing his margins. Went through the menu together. 5 items under 20% margin (pasta dishes mostly). Game plan: reprice those 5 by next Tues, try portion control on the steak entrée, and I gave him the supplier negotiation script. Follow up in 2 weeks. He seemed motivated.",
    },
    {
      type: 'concept',
      title: 'Tone Shortcuts That Work',
      body: 'Add any of these phrases to your prompts to control tone:\n\n- **Casual:** "Write as if you\'re texting a colleague"\n- **Professional but warm:** "Friendly and professional — like a trusted advisor"\n- **Direct:** "Be concise and direct. No filler."\n- **Encouraging:** "The client needs encouragement right now. Be their cheerleader."\n- **Analytical:** "Just the facts and numbers. No emotional language."\n- **Simple:** "Explain this like the client has never heard these terms before"\n\nThe more specific your tone direction, the more the AI sounds like a real person — and less like a robot.',
    },
  ],
};
