import type { Lesson } from '../lesson-types';

export const lesson07: Lesson = {
  id: 'rag',
  number: 7,
  title: 'Using Your Documents (RAG)',
  subtitle: 'Upload documents so the AI can reference your actual data — not just general knowledge.',
  kicker: 'ADVANCED',
  icon: '📂',
  duration: '4 min read',
  keyTakeaways: [
    'RAG (Retrieval-Augmented Generation) lets the AI search your uploaded documents to give answers grounded in real data.',
    'Upload center policies, training guides, resource lists, and templates — the AI can reference them in responses.',
    'RAG answers are more accurate and specific than general AI knowledge because they\'re based on your actual materials.',
  ],
  prevLessonId: 'tone',
  nextLessonId: 'pii',
  sections: [
    {
      type: 'concept',
      title: 'What Is RAG?',
      body: 'RAG stands for **Retrieval-Augmented Generation**. It\'s a technical term for a simple concept:\n\n> The AI searches through **your uploaded documents** to find relevant information, then uses that information to generate a more accurate response.\n\nWithout RAG, the AI only knows what it was trained on — general knowledge about business, marketing, finance, etc. **With RAG**, it can reference your specific SBDC resources, policies, program guides, and templates.',
    },
    {
      type: 'concept',
      title: 'How It Works in This App',
      body: 'The SBDC Advisor has a document upload feature. When you upload a file:\n\n1. The system breaks it into small, searchable chunks\n2. When you ask a question, the system finds the most relevant chunks\n3. Those chunks are included as context in your prompt to the AI\n4. The AI generates a response informed by your actual documents\n\nYou don\'t need to do anything special — just upload documents and ask questions naturally. The system handles the retrieval behind the scenes.',
    },
    {
      type: 'tip',
      note: 'Good documents to upload: SBDC program guides, center policies, intake procedures, resource directories, training materials, frequently referenced templates, and local market data.',
    },
    {
      type: 'divider',
    },
    {
      type: 'prompt',
      title: 'Without RAG',
      label: 'GENERAL KNOWLEDGE ONLY',
      prompt: 'What resources does the NorCal SBDC offer for startups?',
    },
    {
      type: 'output',
      label: 'GENERIC ANSWER',
      output: "SBDCs typically offer a range of services for startups, including:\n\n- **Free one-on-one business advising** with experienced counselors\n- **Business plan development** assistance\n- **Financial projection** workshops\n- **Access to market research** databases\n- **Loan packaging** and SBA loan guidance\n- **Training workshops** on various business topics\n\nFor specific offerings at the NorCal SBDC, I'd recommend visiting their website or contacting your local center directly.",
    },
    {
      type: 'concept',
      body: 'That\'s a generic SBDC answer. The AI doesn\'t know what **your center** specifically offers. Now imagine you\'ve uploaded your center\'s resource guide.',
    },
    {
      type: 'prompt',
      title: 'With RAG (Documents Uploaded)',
      label: 'WITH YOUR DOCUMENTS',
      prompt: 'What resources does the NorCal SBDC offer for startups?\n\n(The system automatically retrieves relevant sections from your uploaded documents)',
    },
    {
      type: 'output',
      label: 'GROUNDED ANSWER',
      output: "Based on the NorCal SBDC resource guide, here's what's available for startups:\n\n**Free Advising Services**\n- One-on-one sessions with certified business advisors (in-person at 6 center locations or via Zoom)\n- Specialized advisors for: financial projections, marketing strategy, government contracting, and technology commercialization\n\n**Training Programs**\n- \"Launch Your Business\" — 6-week cohort program (next session starts March 15)\n- \"Financial Foundations\" — 4-session workshop series on bookkeeping, projections, and cash flow\n- Monthly \"First Steps\" orientation webinar (free, register on website)\n\n**Funding Resources**\n- SBA loan packaging assistance (our center has a 78% approval rate)\n- Microloan program — loans from $500 to $50,000 through our partner, Valley Small Business Development Corp\n- Grant database access: GrantWatch and Foundation Directory Online\n\n**Local Partnerships**\n- Chico State SBDC Entrepreneurship Lab (free coworking for pre-revenue startups)\n- NorCal SCORE mentoring referrals\n- CalOSBA permit assistance navigation\n\nWould you like me to go deeper on any of these?",
    },
    {
      type: 'concept',
      title: 'The Difference Is Night and Day',
      body: 'With your documents uploaded, the AI gave:\n- **Specific program names** and dates from your center\n- **Actual statistics** (78% approval rate)\n- **Partner organizations** unique to your region\n- **Actionable next steps** (registration links, next cohort dates)\n\nThis is the power of RAG: the AI combines its reasoning ability with **your data** to produce genuinely useful responses.',
    },
    {
      type: 'divider',
    },
    {
      type: 'exercise',
      title: 'What to Upload',
      variant: 'Think about which documents from your center would make the AI most useful. Here\'s a prioritized list to start with.',
      modifiedPrompt: 'Priority documents to upload to the SBDC Advisor:\n\n1. Center resource guide or services overview\n2. Program brochures (training series, workshops)\n3. Advisor directory (who specializes in what)\n4. Local lending partner information\n5. Client intake procedures and FAQ\n6. Regional market data or economic reports\n7. Templates you frequently share with clients\n8. Policy documents (confidentiality, compliance)',
      modifiedOutput: "Start with items 1-3 — they'll have the biggest immediate impact on the AI's ability to answer common questions. You can always add more documents over time.\n\nSupported file types: PDF, Word (.doc, .docx), text files, Markdown, CSV, and HTML. The system works best with text-heavy documents (not scanned images).",
    },
    {
      type: 'tip',
      note: 'RAG works best when your documents are well-organized and text-based. If you have scanned PDFs (images of text), consider converting them to searchable PDFs first using a tool like Adobe Acrobat or an online OCR service.',
    },
  ],
};
