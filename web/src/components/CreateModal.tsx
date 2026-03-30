"use client";

import { useState } from "react";

interface CreateModalProps {
  type: "file" | "directory" | "link";
  currentDir: string;
  onClose: () => void;
  onCreate: (path: string, content?: string) => Promise<void>;
}

const CATEGORIES = [
  "architecture",
  "architecture/adr",
  "repos",
  "runbooks",
  "team",
  "linear",
];

function generateFrontMatter(
  title: string,
  category: string,
  tags: string,
  source: string = "manual",
  extra: Record<string, string> = {}
): string {
  const today = new Date().toISOString().split("T")[0];
  const tagList = tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const extraLines = Object.entries(extra)
    .map(([k, v]) => `${k}: "${v}"`)
    .join("\n");

  return `---
title: "${title}"
category: ${category.split("/")[0]}
tags: [${tagList.join(", ")}]
owner: "@username"
last_updated: "${today}"
source: ${source}${extraLines ? "\n" + extraLines : ""}
---

# ${title}

`;
}

export default function CreateModal({
  type,
  currentDir,
  onClose,
  onCreate,
}: CreateModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(currentDir || "architecture");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [externalType, setExternalType] = useState("linear");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (type === "directory") {
        const dirPath = `${category}/${name}`.replace(/\/+/g, "/");
        await onCreate(dirPath);
      } else if (type === "link") {
        const fileName = name.endsWith(".md") ? name : `${name}.md`;
        const filePath = `${category}/${fileName}`.replace(/\/+/g, "/");
        const content = generateFrontMatter(
          title || name.replace(/\.md$/, ""),
          category,
          tags || externalType,
          "external-link",
          {
            external_url: externalUrl,
            external_type: externalType,
          }
        ) + `External document linked from ${externalType}.\n\n[Open in ${externalType}](${externalUrl})\n`;
        await onCreate(filePath, content);
      } else {
        const fileName = name.endsWith(".md") ? name : `${name}.md`;
        const filePath = `${category}/${fileName}`.replace(/\/+/g, "/");
        const content = generateFrontMatter(
          title || name.replace(/\.md$/, ""),
          category,
          tags
        );
        await onCreate(filePath, content);
      }
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-surface-1 border border-border-default rounded-lg w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-default">
          <h2 className="text-sm font-semibold text-text-primary">
            {type === "directory"
              ? "New Directory"
              : type === "link"
              ? "Link External Resource"
              : "New Document"}
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06z" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {/* Category / parent directory */}
          <div>
            <label className="block text-xs text-text-secondary mb-1">
              Location
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-surface-2 border border-border-default rounded-md px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-blue"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  knowledge-base/{c}/
                </option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs text-text-secondary mb-1">
              {type === "directory" ? "Directory name" : "File name"}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9\-_.]/g, "")
                )
              }
              placeholder={
                type === "directory"
                  ? "my-directory"
                  : "my-document.md"
              }
              className="w-full bg-surface-2 border border-border-default rounded-md px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-blue font-mono"
              required
              autoFocus
            />
          </div>

          {/* Title (for files and links) */}
          {type !== "directory" && (
            <div>
              <label className="block text-xs text-text-secondary mb-1">
                Document title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Human-readable title"
                className="w-full bg-surface-2 border border-border-default rounded-md px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-blue"
              />
            </div>
          )}

          {/* Tags */}
          {type !== "directory" && (
            <div>
              <label className="block text-xs text-text-secondary mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="api, backend, auth"
                className="w-full bg-surface-2 border border-border-default rounded-md px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-blue"
              />
            </div>
          )}

          {/* External link fields */}
          {type === "link" && (
            <>
              <div>
                <label className="block text-xs text-text-secondary mb-1">
                  URL
                </label>
                <input
                  type="url"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://linear.app/team/issue/ENG-123"
                  className="w-full bg-surface-2 border border-border-default rounded-md px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-blue"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">
                  Source type
                </label>
                <select
                  value={externalType}
                  onChange={(e) => setExternalType(e.target.value)}
                  className="w-full bg-surface-2 border border-border-default rounded-md px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-blue"
                >
                  <option value="linear">Linear</option>
                  <option value="github">GitHub</option>
                  <option value="notion">Notion</option>
                  <option value="confluence">Confluence</option>
                  <option value="google-docs">Google Docs</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </>
          )}

          {error && (
            <p className="text-sm text-accent-red">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name || loading}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                name && !loading
                  ? "bg-accent-green text-surface-0 hover:opacity-90"
                  : "bg-surface-3 text-text-muted cursor-not-allowed"
              }`}
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
