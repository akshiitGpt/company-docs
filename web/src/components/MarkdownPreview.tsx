"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownPreviewProps {
  content: string;
  path: string;
}

export default function MarkdownPreview({
  content,
  path,
}: MarkdownPreviewProps) {
  // Strip YAML front-matter for rendering
  const body = content.replace(/^---[\s\S]*?---\n*/m, "");

  // Extract front-matter for display
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  const frontMatter = fmMatch ? fmMatch[1] : null;

  return (
    <div className="h-full overflow-auto">
      {/* File header */}
      <div className="px-6 py-3 bg-surface-1 border-b border-border-default">
        <span className="text-sm text-text-secondary font-mono">{path}</span>
      </div>

      <div className="px-6 py-4 max-w-4xl">
        {/* Front-matter badge */}
        {frontMatter && (
          <details className="mb-4">
            <summary className="text-xs text-text-muted cursor-pointer hover:text-text-secondary">
              Front-matter metadata
            </summary>
            <pre className="mt-2 bg-surface-2 border border-border-default rounded-md p-3 text-xs text-text-secondary overflow-x-auto">
              {frontMatter}
            </pre>
          </details>
        )}

        {/* Markdown content */}
        <div className="prose-docs">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold text-text-primary border-b border-border-default pb-2 mb-4">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-semibold text-text-primary border-b border-border-muted pb-1 mb-3 mt-6">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-semibold text-text-primary mb-2 mt-4">
                  {children}
                </h3>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="text-accent-blue hover:underline"
                  target={
                    href?.startsWith("http") ? "_blank" : undefined
                  }
                  rel={
                    href?.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                >
                  {children}
                </a>
              ),
              code: ({ className, children }) => {
                const isBlock = className?.includes("language-");
                if (isBlock) {
                  return (
                    <code className="text-sm">{children}</code>
                  );
                }
                return (
                  <code className="bg-surface-2 text-accent-orange px-1.5 py-0.5 rounded text-sm">
                    {children}
                  </code>
                );
              },
              pre: ({ children }) => (
                <pre className="bg-surface-2 border border-border-default rounded-md p-4 overflow-x-auto my-3">
                  {children}
                </pre>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-3">
                  <table className="w-full border-collapse">
                    {children}
                  </table>
                </div>
              ),
              th: ({ children }) => (
                <th className="bg-surface-2 border border-border-default px-3 py-2 text-left text-sm font-semibold">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border border-border-default px-3 py-2 text-sm">
                  {children}
                </td>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-border-default pl-4 text-text-secondary italic my-3">
                  {children}
                </blockquote>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-6 my-2">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-6 my-2">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="mb-1 text-text-primary">{children}</li>
              ),
              hr: () => (
                <hr className="border-border-default my-6" />
              ),
              input: ({ checked, ...props }) => (
                <input
                  type="checkbox"
                  checked={checked}
                  readOnly
                  className="mr-2 accent-accent-green"
                  {...props}
                />
              ),
              p: ({ children }) => (
                <p className="my-2 text-text-primary leading-relaxed">
                  {children}
                </p>
              ),
            }}
          >
            {body}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
