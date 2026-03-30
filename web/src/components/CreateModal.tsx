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
        const content =
          generateFrontMatter(
            title || name.replace(/\.md$/, ""),
            category,
            tags || externalType,
            "external-link",
            { external_url: externalUrl, external_type: externalType }
          ) +
          `External document linked from ${externalType}.\n\n[Open in ${externalType}](${externalUrl})\n`;
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
      setError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setLoading(false);
    }
  };

  const heading =
    type === "directory"
      ? "New Directory"
      : type === "link"
      ? "Link External Resource"
      : "New Document";

  const description =
    type === "directory"
      ? "Create a new folder in the knowledge base"
      : type === "link"
      ? "Add a reference to an external document"
      : "Create a new markdown document with front-matter";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary/20 backdrop-blur-[2px]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface border border-border rounded-lg w-full max-w-md shadow-lg slide-up">
        {/* Header */}
        <div className="px-5 pt-5 pb-1">
          <h2 className="text-base font-semibold text-primary">{heading}</h2>
          <p className="text-[13px] text-muted mt-0.5">{description}</p>
        </div>

        <form onSubmit={handleSubmit} className="px-5 pb-5 pt-3 space-y-3.5">
          {/* Location */}
          <div>
            <label className="block text-[12px] font-medium text-secondary mb-1.5">
              Location
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-page border border-border rounded-sm px-3 py-2 text-[13px] text-primary outline-none focus:border-accent transition-colors"
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
            <label className="block text-[12px] font-medium text-secondary mb-1.5">
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
              placeholder={type === "directory" ? "my-directory" : "my-document.md"}
              className="w-full bg-page border border-border rounded-sm px-3 py-2 text-[13px] text-primary font-mono outline-none focus:border-accent transition-colors"
              required
              autoFocus
            />
          </div>

          {/* Title */}
          {type !== "directory" && (
            <div>
              <label className="block text-[12px] font-medium text-secondary mb-1.5">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Human-readable title"
                className="w-full bg-page border border-border rounded-sm px-3 py-2 text-[13px] text-primary outline-none focus:border-accent transition-colors"
              />
            </div>
          )}

          {/* Tags */}
          {type !== "directory" && (
            <div>
              <label className="block text-[12px] font-medium text-secondary mb-1.5">
                Tags
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="api, backend, auth"
                className="w-full bg-page border border-border rounded-sm px-3 py-2 text-[13px] text-primary outline-none focus:border-accent transition-colors"
              />
            </div>
          )}

          {/* External link fields */}
          {type === "link" && (
            <>
              <div>
                <label className="block text-[12px] font-medium text-secondary mb-1.5">
                  URL
                </label>
                <input
                  type="url"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://linear.app/team/issue/ENG-123"
                  className="w-full bg-page border border-border rounded-sm px-3 py-2 text-[13px] text-primary outline-none focus:border-accent transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-secondary mb-1.5">
                  Source type
                </label>
                <select
                  value={externalType}
                  onChange={(e) => setExternalType(e.target.value)}
                  className="w-full bg-page border border-border rounded-sm px-3 py-2 text-[13px] text-primary outline-none focus:border-accent transition-colors"
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
            <div className="text-[13px] text-danger bg-danger-bg px-3 py-2 rounded-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-[13px] font-medium text-secondary hover:text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name || loading}
              className={`px-4 py-1.5 text-[13px] font-medium rounded-sm transition-all ${
                name && !loading
                  ? "bg-accent text-white hover:bg-accent-hover shadow-xs"
                  : "bg-surface-subtle text-muted cursor-not-allowed"
              }`}
            >
              {loading
                ? "Creating..."
                : type === "directory"
                ? "Create Folder"
                : type === "link"
                ? "Add Link"
                : "Create Document"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
