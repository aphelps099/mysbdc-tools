'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownContentProps {
  content: string;
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="markdown-body" style={{ overflowWrap: 'break-word', wordBreak: 'break-word', minWidth: 0 }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-[27px] font-[var(--era-text)] font-bold text-[var(--text-primary)] mt-6 mb-3 leading-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-[23px] font-[var(--era-text)] font-bold text-[var(--text-primary)] mt-5 mb-2 leading-tight">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-[20px] font-[var(--era-text)] font-bold text-[var(--text-primary)] mt-4 mb-2">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-[19px] font-[var(--era-text)] font-normal leading-[1.75] text-[var(--text-primary)] mb-3 last:mb-0">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 mb-3 space-y-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 mb-3 space-y-1">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-[19px] font-[var(--era-text)] font-normal leading-[1.75] text-[var(--text-primary)]">
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-bold">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-3 border-[var(--royal)] pl-4 my-3 py-1 bg-[var(--royal)]/[0.03] rounded-r-[var(--radius-sm)]">
              {children}
            </blockquote>
          ),
          code: ({ children, className }) => {
            const isBlock = className?.includes('language-');
            if (isBlock) {
              return (
                <code className="block bg-[var(--navy)] text-[var(--cream)] rounded-[var(--radius-md)] p-4 my-3 text-[13px] font-[var(--mono)] leading-relaxed overflow-x-auto whitespace-pre">
                  {children}
                </code>
              );
            }
            return (
              <code className="bg-[var(--cream)] text-[var(--brick)] px-1.5 py-0.5 rounded text-[13px] font-[var(--mono)]">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="my-3 overflow-x-auto max-w-full">{children}</pre>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--royal)] hover:underline"
            >
              {children}
            </a>
          ),
          hr: () => (
            <hr className="border-[var(--rule)] my-4" />
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 -mx-1 px-1">
              <table className="min-w-[420px] w-full border-collapse text-[13px] md:text-[14px] font-[var(--era-text)]">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-[var(--rule)] bg-[var(--cream)] px-2.5 py-2 md:px-3 text-left font-medium text-[var(--text-primary)] whitespace-nowrap">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-[var(--rule)] px-2.5 py-2 md:px-3 text-[var(--text-secondary)] font-light">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
