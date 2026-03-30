"use client";

import { useState, useEffect, useCallback } from "react";
import FileTree from "@/components/FileTree";
import FileEditor from "@/components/FileEditor";
import MarkdownPreview from "@/components/MarkdownPreview";
import CreateModal from "@/components/CreateModal";
import type { TreeNode } from "@/lib/types";

type ModalType = "file" | "directory" | "link" | null;

export default function Home() {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTree = useCallback(async () => {
    try {
      const res = await fetch("/api/tree");
      const json = await res.json();
      if (json.data) setTree(json.data);
    } catch {
      showToast("Failed to load file tree");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  const handleSelectFile = async (path: string) => {
    try {
      const res = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
      const json = await res.json();
      if (json.data) {
        setSelectedPath(path);
        setFileContent(json.data.content);
        setIsEditing(false);
      } else {
        showToast(json.error || "Failed to load file");
      }
    } catch {
      showToast("Failed to load file");
    }
  };

  const handleSave = async (content: string) => {
    if (!selectedPath) return;
    const res = await fetch("/api/files", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: selectedPath, content }),
    });
    const json = await res.json();
    if (json.error) {
      showToast(`Save failed: ${json.error}`);
      throw new Error(json.error);
    }
    setFileContent(content);
    showToast("Saved and pushed to Git");
    fetchTree();
  };

  const handleCreate = async (path: string, content?: string) => {
    if (content !== undefined) {
      const res = await fetch("/api/files", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path,
          content,
          commitMessage: `docs: create ${path}`,
        }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      showToast(`Created ${path}`);
      handleSelectFile(path);
    } else {
      const res = await fetch("/api/directories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      showToast(`Created directory`);
    }
    fetchTree();
  };

  const handleDelete = async () => {
    if (!selectedPath) return;
    if (!confirm(`Delete ${selectedPath}?`)) return;
    const res = await fetch("/api/files", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: selectedPath }),
    });
    const json = await res.json();
    if (json.error) {
      showToast(`Delete failed: ${json.error}`);
      return;
    }
    setSelectedPath(null);
    setFileContent("");
    showToast("File deleted");
    fetchTree();
  };

  const handleGitPull = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/git", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "pull" }),
      });
      const json = await res.json();
      showToast(json.data?.result || "Synced");
      fetchTree();
      if (selectedPath) handleSelectFile(selectedPath);
    } catch {
      showToast("Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const getCurrentDir = (): string => {
    if (!selectedPath) return "architecture";
    const parts = selectedPath.split("/");
    return parts.length > 1 ? parts.slice(0, -1).join("/") : "architecture";
  };

  // Filter tree by search
  const filterTree = (nodes: TreeNode[], query: string): TreeNode[] => {
    if (!query) return nodes;
    const q = query.toLowerCase();
    return nodes
      .map((node) => {
        if (node.type === "directory") {
          const filtered = filterTree(node.children || [], query);
          if (
            filtered.length > 0 ||
            node.name.toLowerCase().includes(q)
          ) {
            return { ...node, children: filtered };
          }
          return null;
        }
        const nameMatch = node.name.toLowerCase().includes(q);
        const titleMatch = node.meta?.title?.toLowerCase().includes(q);
        const tagMatch = node.meta?.tags
          ?.toString()
          .toLowerCase()
          .includes(q);
        return nameMatch || titleMatch || tagMatch ? node : null;
      })
      .filter(Boolean) as TreeNode[];
  };

  const filteredTree = filterTree(tree, searchQuery);

  // Count total docs
  const countDocs = (nodes: TreeNode[]): number =>
    nodes.reduce(
      (n, node) =>
        n +
        (node.type === "file" ? 1 : 0) +
        (node.children ? countDocs(node.children) : 0),
      0
    );

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-muted text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-5 py-3 bg-surface border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-accent"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10.75 16.82A7.462 7.462 0 0 1 15 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0 0 18 15.06V3.94a.75.75 0 0 0-.546-.721A9.006 9.006 0 0 0 15 2.86a9.006 9.006 0 0 0-4.25 1.065v12.895zM9.25 4.925A9.006 9.006 0 0 0 5 3.86a9.006 9.006 0 0 0-2.454.359A.75.75 0 0 0 2 4.94v11.12a.75.75 0 0 0 .954.721A7.506 7.506 0 0 1 5 16.5a7.462 7.462 0 0 1 4.25 1.32V4.925z" />
            </svg>
          </div>
          <div>
            <h1 className="text-[15px] font-semibold text-primary leading-tight">
              Company Docs
            </h1>
            <p className="text-[11px] text-muted">
              {countDocs(tree)} documents
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setModalType("file")}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-secondary hover:text-primary hover:bg-surface-hover rounded-sm transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
              <path d="M1.75 1h8.5c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0 1 10.25 10H7.061l-2.574 2.573A1.458 1.458 0 0 1 2 11.543V10h-.25A1.75 1.75 0 0 1 0 8.25v-5.5C0 1.784.784 1 1.75 1z" />
            </svg>
            New
          </button>
          <button
            onClick={() => setModalType("link")}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-secondary hover:text-primary hover:bg-surface-hover rounded-sm transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.75 3.5a.75.75 0 0 0-.75.75v7.5c0 .414.336.75.75.75h6.5a.75.75 0 0 0 .75-.75v-3a.75.75 0 0 1 1.5 0v3A2.25 2.25 0 0 1 11.25 14h-6.5A2.25 2.25 0 0 1 2.5 11.75v-7.5A2.25 2.25 0 0 1 4.75 2h3a.75.75 0 0 1 0 1.5h-3zm4-1a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0V4.56L8.78 9.03a.75.75 0 0 1-1.06-1.06l4.47-4.47H10.5a.75.75 0 0 1-.75-.75z" />
            </svg>
            Link
          </button>
          <div className="w-px h-5 bg-border mx-1" />
          <button
            onClick={handleGitPull}
            disabled={syncing}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-secondary hover:text-primary hover:bg-surface-hover rounded-sm transition-colors"
          >
            <svg
              className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`}
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path d="M1.705 8.005a.75.75 0 0 1 .834.656 5.5 5.5 0 0 0 9.592 2.97l-1.204-1.204a.25.25 0 0 1 .177-.427h3.646a.25.25 0 0 1 .25.25v3.646a.25.25 0 0 1-.427.177l-1.38-1.38A7.002 7.002 0 0 1 1.05 8.84a.75.75 0 0 1 .656-.834zM8 2.5a5.487 5.487 0 0 0-4.131 1.869l1.204 1.204A.25.25 0 0 1 4.896 6H1.25A.25.25 0 0 1 1 5.75V2.104a.25.25 0 0 1 .427-.177l1.38 1.38A7.002 7.002 0 0 1 14.95 7.16a.75.75 0 0 1-1.49.178A5.5 5.5 0 0 0 8 2.5z" />
            </svg>
            {syncing ? "Syncing..." : "Sync"}
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── Sidebar ── */}
        <aside className="w-[260px] flex-shrink-0 bg-surface border-r border-border flex flex-col">
          {/* Search */}
          <div className="px-3 pt-3 pb-2">
            <div className="relative">
              <svg
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215l-3.04-3.04zM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter documents..."
                className="w-full bg-page border border-border-light rounded-sm pl-8 pr-3 py-1.5 text-[12px] text-primary placeholder-muted outline-none focus:border-accent/50 transition-colors"
              />
            </div>
          </div>

          {/* Tree */}
          <div className="flex-1 overflow-y-auto">
            <FileTree
              nodes={filteredTree}
              selectedPath={selectedPath}
              onSelect={handleSelectFile}
            />
          </div>

          {/* Bottom actions */}
          <div className="px-3 py-2 border-t border-border-light flex gap-1">
            <button
              onClick={() => setModalType("file")}
              className="flex-1 text-[11px] font-medium text-muted hover:text-secondary py-1.5 hover:bg-surface-hover rounded-sm transition-colors"
            >
              + Document
            </button>
            <button
              onClick={() => setModalType("directory")}
              className="flex-1 text-[11px] font-medium text-muted hover:text-secondary py-1.5 hover:bg-surface-hover rounded-sm transition-colors"
            >
              + Folder
            </button>
          </div>
        </aside>

        {/* ── Content ── */}
        <main className="flex-1 flex flex-col overflow-hidden bg-page">
          {selectedPath ? (
            <>
              {/* Content header */}
              <div className="flex items-center justify-between px-5 py-2 bg-surface border-b border-border-light flex-shrink-0">
                <div className="flex items-center gap-1.5 text-[12px] text-muted">
                  {selectedPath.split("/").map((part, i, arr) => (
                    <span key={i} className="flex items-center gap-1.5">
                      {i > 0 && (
                        <svg
                          className="w-3 h-3"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                        >
                          <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06z" />
                        </svg>
                      )}
                      <span
                        className={
                          i === arr.length - 1
                            ? "text-primary font-medium"
                            : "hover:text-secondary cursor-default"
                        }
                      >
                        {part.replace(/\.md$/, "")}
                      </span>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex bg-page rounded-sm overflow-hidden border border-border-light">
                    <button
                      onClick={() => setIsEditing(false)}
                      className={`px-3 py-1 text-[11px] font-medium transition-colors ${
                        !isEditing
                          ? "bg-surface text-primary shadow-xs"
                          : "text-muted hover:text-secondary"
                      }`}
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => setIsEditing(true)}
                      className={`px-3 py-1 text-[11px] font-medium transition-colors ${
                        isEditing
                          ? "bg-surface text-primary shadow-xs"
                          : "text-muted hover:text-secondary"
                      }`}
                    >
                      Edit
                    </button>
                  </div>
                  <button
                    onClick={handleDelete}
                    className="p-1.5 text-muted hover:text-danger rounded-sm hover:bg-danger-bg transition-colors"
                    title="Delete"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75zM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.15l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15zM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content body */}
              <div className="flex-1 overflow-hidden">
                {isEditing ? (
                  <FileEditor
                    path={selectedPath}
                    content={fileContent}
                    onSave={handleSave}
                    onPreviewToggle={() => setIsEditing(false)}
                  />
                ) : (
                  <MarkdownPreview
                    content={fileContent}
                    path={selectedPath}
                  />
                )}
              </div>
            </>
          ) : (
            /* ── Empty state ── */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-sm">
                <div className="w-16 h-16 rounded-2xl bg-surface border border-border shadow-soft flex items-center justify-center mx-auto mb-5">
                  <svg
                    className="w-8 h-8 text-accent/60"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10.75 16.82A7.462 7.462 0 0 1 15 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0 0 18 15.06V3.94a.75.75 0 0 0-.546-.721A9.006 9.006 0 0 0 15 2.86a9.006 9.006 0 0 0-4.25 1.065v12.895zM9.25 4.925A9.006 9.006 0 0 0 5 3.86a9.006 9.006 0 0 0-2.454.359A.75.75 0 0 0 2 4.94v11.12a.75.75 0 0 0 .954.721A7.506 7.506 0 0 1 5 16.5a7.462 7.462 0 0 1 4.25 1.32V4.925z" />
                  </svg>
                </div>
                <h2 className="font-serif text-2xl text-primary mb-2">
                  Knowledge Base
                </h2>
                <p className="text-[14px] text-secondary leading-relaxed mb-6">
                  Select a document from the sidebar to read, or create a new one.
                </p>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => setModalType("file")}
                    className="px-4 py-2 text-[13px] font-medium bg-accent text-white rounded-sm hover:bg-accent-hover shadow-xs transition-all"
                  >
                    New Document
                  </button>
                  <button
                    onClick={() => setModalType("link")}
                    className="px-4 py-2 text-[13px] font-medium text-secondary bg-surface border border-border rounded-sm hover:bg-surface-hover transition-colors"
                  >
                    Link External
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── Modals ── */}
      {modalType && (
        <CreateModal
          type={modalType}
          currentDir={getCurrentDir()}
          onClose={() => setModalType(null)}
          onCreate={handleCreate}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-surface border border-border rounded-lg px-4 py-2.5 text-[13px] text-primary shadow-md fade-in flex items-center gap-2">
          <svg
            className="w-4 h-4 text-success flex-shrink-0"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" />
          </svg>
          {toast}
        </div>
      )}
    </div>
  );
}
