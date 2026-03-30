"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownPreviewProps {
  content: string;
  path: string;
}

export default function MarkdownPreview({
  content,
}: MarkdownPreviewProps) {
  const body = content.replace(/^---[\s\S]*?---\n*/m, "");
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  const frontMatter = fmMatch ? fmMatch[1] : null;

  // Parse front-matter into key-value pairs
  const meta: Record<string, string> = {};
  if (frontMatter) {
    frontMatter.split("\n").forEach((line) => {
      const match = line.match(/^(\w[\w_]*)\s*:\s*(.+)/);
      if (match) {
        meta[match[1]] = match[2].replace(/^["']|["']$/g, "");
      }
    });
  }

  return (
    <div className="h-full overflow-auto bg-surface fade-in">
      <div className="max-w-3xl mx-auto px-8 py-8">
        {/* Metadata card */}
        {Object.keys(meta).length > 0 && (
          <div className="mb-8 flex flex-wrap gap-x-5 gap-y-1.5 text-[12px] text-muted">
            {meta.category && (
              <span className="inline-flex items-center gap-1">
                <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-8.5A1.75 1.75 0 0 0 14.25 3H7.5a.25.25 0 0 1-.2-.1l-.927-1.236A1.75 1.75 0 0 0 4.974 1H1.75z" />
                </svg>
                {meta.category}
              </span>
            )}
            {meta.owner && (
              <span className="inline-flex items-center gap-1">
                <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M10.561 8.073a6.005 6.005 0 0 1 3.432 5.142.75.75 0 1 1-1.498.07 4.5 4.5 0 0 0-8.99 0 .75.75 0 0 1-1.498-.07 6.004 6.004 0 0 1 3.431-5.142 3.999 3.999 0 1 1 5.123 0zM10.5 5a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0z" />
                </svg>
                {meta.owner}
              </span>
            )}
            {meta.last_updated && (
              <span className="inline-flex items-center gap-1">
                <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0zm7-3.25v2.992l2.028.812a.75.75 0 0 1-.557 1.392l-2.5-1A.751.751 0 0 1 7 8.25v-3.5a.75.75 0 0 1 1.5 0z" />
                </svg>
                {meta.last_updated}
              </span>
            )}
            {meta.source && meta.source !== "manual" && (
              <span className="inline-flex items-center gap-1 text-info bg-info-bg px-1.5 rounded-sm">
                {meta.source}
              </span>
            )}
            {meta.tags && (
              <div className="w-full flex flex-wrap gap-1 mt-1">
                {meta.tags
                  .replace(/[\[\]]/g, "")
                  .split(",")
                  .map((tag: string) => tag.trim())
                  .filter(Boolean)
                  .map((tag: string) => (
                    <span
                      key={tag}
                      className="bg-surface-subtle text-secondary px-2 py-0.5 rounded-sm text-[11px] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Markdown content */}
        <article>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="font-serif text-4xl text-primary mb-4 mt-0 leading-tight tracking-[-0.02em]">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="font-serif text-2xl text-primary border-b border-border-light pb-2 mb-4 mt-10 leading-snug">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="font-sans text-base font-semibold text-primary mb-2 mt-6">
                  {children}
                </h3>
              ),
              h4: ({ children }) => (
                <h4 className="font-sans text-sm font-semibold text-primary mb-2 mt-4">
                  {children}
                </h4>
              ),
              p: ({ children }) => (
                <p className="text-[15px] text-primary leading-[1.75] mb-4">
                  {children}
                </p>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="text-accent hover:text-accent-hover underline underline-offset-2 decoration-accent/30 hover:decoration-accent transition-colors"
                  target={href?.startsWith("http") ? "_blank" : undefined}
                  rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
                >
                  {children}
                </a>
              ),
              code: ({ className, children }) => {
                const isBlock = className?.includes("language-");
                if (isBlock) {
                  return (
                    <code className="text-[13px] leading-relaxed">
                      {children}
                    </code>
                  );
                }
                return (
                  <code className="bg-surface-subtle text-accent-text px-1.5 py-0.5 rounded-sm text-[13px] font-mono font-medium">
                    {children}
                  </code>
                );
              },
              pre: ({ children }) => (
                <pre className="bg-page border border-border-light rounded-lg p-5 overflow-x-auto my-5 text-[13px]">
                  {children}
                </pre>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-[3px] border-accent/40 pl-4 my-4 text-secondary italic">
                  {children}
                </blockquote>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-5 rounded-lg border border-border">
                  <table className="w-full border-collapse text-[14px]">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-surface-subtle">{children}</thead>
              ),
              th: ({ children }) => (
                <th className="border-b border-border px-4 py-2.5 text-left text-[12px] font-semibold text-secondary uppercase tracking-wider">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border-b border-border-light px-4 py-2.5 text-[14px]">
                  {children}
                </td>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-6 my-3 space-y-1 text-[15px]">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-6 my-3 space-y-1 text-[15px]">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-primary leading-relaxed">{children}</li>
              ),
              hr: () => <hr className="border-border my-8" />,
              input: ({ checked, ...props }) => (
                <input
                  type="checkbox"
                  checked={checked}
                  readOnly
                  className="mr-2 accent-accent rounded"
                  {...props}
                />
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-primary">
                  {children}
                </strong>
              ),
              em: ({ children }) => (
                <em className="italic text-secondary">{children}</em>
              ),
            }}
          >
            {body}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  );
}
