"use client";

import { useState, useEffect, useCallback } from "react";
import FileTree from "@/components/FileTree";
import FileEditor from "@/components/FileEditor";
import MarkdownPreview from "@/components/MarkdownPreview";
import ChatPanel from "@/components/ChatPanel";
import CreateModal from "@/components/CreateModal";
import type { TreeNode } from "@/lib/types";

type ModalType = "file" | "directory" | "link" | null;

export default function Home() {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [isPreview, setIsPreview] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

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
        setIsPreview(true);
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
    showToast(json.data?.gitResult || "Saved");
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
    } else {
      const res = await fetch("/api/directories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      showToast(`Created directory ${path}`);
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
    showToast(`Deleted ${selectedPath}`);
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
      showToast(json.data?.result || json.error || "Pull complete");
      fetchTree();
    } catch {
      showToast("Pull failed");
    } finally {
      setSyncing(false);
    }
  };

  const getCurrentDir = (): string => {
    if (!selectedPath) return "architecture";
    const parts = selectedPath.split("/");
    return parts.length > 1
      ? parts.slice(0, -1).join("/")
      : "architecture";
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-surface-0">
        <div className="text-text-muted text-sm">Loading knowledge base...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-surface-0">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-surface-1 border-b border-border-default flex-shrink-0">
        <div className="flex items-center gap-3">
          <svg
            className="w-5 h-5 text-accent-blue"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M0 1.75A.75.75 0 0 1 .75 1h4.253c1.227 0 2.317.59 3 1.501A3.743 3.743 0 0 1 11.006 1h4.245a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75h-4.507a2.25 2.25 0 0 0-1.591.659l-.622.621a.75.75 0 0 1-1.06 0l-.622-.621A2.25 2.25 0 0 0 5.258 13H.75a.75.75 0 0 1-.75-.75V1.75zm7.251 10.324.004-5.073-.002-2.253A2.25 2.25 0 0 0 5.003 2.5H1.5v9h3.757a3.75 3.75 0 0 1 1.994.574zM8.755 4.75l-.004 7.322a3.752 3.752 0 0 1 1.992-.572H14.5v-9h-3.495a2.25 2.25 0 0 0-2.25 2.25z" />
          </svg>
          <h1 className="text-sm font-semibold text-text-primary">
            Company Docs
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGitPull}
            disabled={syncing}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-text-secondary hover:text-text-primary bg-surface-2 hover:bg-surface-3 border border-border-default rounded-md transition-colors"
          >
            <svg
              className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`}
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path d="M8 2.1a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6zm0 5.2a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6zm0 5.2a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6z" />
            </svg>
            {syncing ? "Syncing..." : "Git Pull"}
          </button>

          <button
            onClick={() => setChatOpen(!chatOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border transition-colors ${
              chatOpen
                ? "bg-accent-purple/20 text-accent-purple border-accent-purple/50"
                : "text-text-secondary hover:text-text-primary bg-surface-2 hover:bg-surface-3 border-border-default"
            }`}
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path d="M0 2.75C0 1.784.784 1 1.75 1h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 14.25 13H8.06l-2.573 2.573A1.458 1.458 0 0 1 3 14.543V13H1.75A1.75 1.75 0 0 1 0 11.25v-8.5z" />
            </svg>
            Chat
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar — File tree */}
        <aside className="w-64 flex-shrink-0 bg-surface-1 border-r border-border-default flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border-default">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Knowledge Base
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setModalType("file")}
                title="New document"
                className="p-1 text-text-muted hover:text-text-primary hover:bg-surface-2 rounded transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M1.75 1h8.5c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0 1 10.25 10H7.061l-2.574 2.573A1.458 1.458 0 0 1 2 11.543V10h-.25A1.75 1.75 0 0 1 0 8.25v-5.5C0 1.784.784 1 1.75 1zM1.5 2.75v5.5c0 .138.112.25.25.25h1a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h3.5a.25.25 0 0 0 .25-.25v-5.5a.25.25 0 0 0-.25-.25h-8.5a.25.25 0 0 0-.25.25zm13 2a.25.25 0 0 0-.25-.25h-.5a.75.75 0 0 1 0-1.5h.5c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0 1 14.25 12H14v1.543a1.458 1.458 0 0 1-2.487 1.03L9.22 12.28a.749.749 0 0 1 .326-1.275.749.749 0 0 1 .734.215l2.22 2.22v-2.19a.75.75 0 0 1 .75-.75h.5a.25.25 0 0 0 .25-.25v-5.5z" />
                </svg>
              </button>
              <button
                onClick={() => setModalType("directory")}
                title="New directory"
                className="p-1 text-text-muted hover:text-text-primary hover:bg-surface-2 rounded transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-8.5A1.75 1.75 0 0 0 14.25 3H7.5a.25.25 0 0 1-.2-.1l-.927-1.236A1.75 1.75 0 0 0 4.974 1H1.75zM8.75 8a.75.75 0 0 1 .75.75v1.75h1.75a.75.75 0 0 1 0 1.5H9.5v1.75a.75.75 0 0 1-1.5 0V12H6.25a.75.75 0 0 1 0-1.5H8V8.75A.75.75 0 0 1 8.75 8z" />
                </svg>
              </button>
              <button
                onClick={() => setModalType("link")}
                title="Link external resource"
                className="p-1 text-text-muted hover:text-text-primary hover:bg-surface-2 rounded transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M4.75 3.5a.75.75 0 0 0-.75.75v7.5c0 .414.336.75.75.75h6.5a.75.75 0 0 0 .75-.75v-3a.75.75 0 0 1 1.5 0v3A2.25 2.25 0 0 1 11.25 14h-6.5A2.25 2.25 0 0 1 2.5 11.75v-7.5A2.25 2.25 0 0 1 4.75 2h3a.75.75 0 0 1 0 1.5h-3zm4-1a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0V4.56L8.78 9.03a.75.75 0 0 1-1.06-1.06l4.47-4.47H10.5a.75.75 0 0 1-.75-.75z" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <FileTree
              nodes={tree}
              selectedPath={selectedPath}
              onSelect={handleSelectFile}
            />
          </div>
        </aside>

        {/* Editor / Preview area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {selectedPath ? (
            isPreview ? (
              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-4 py-2 bg-surface-1 border-b border-border-default">
                  <span className="text-sm text-text-secondary font-mono">
                    {selectedPath}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex bg-surface-3 rounded-md overflow-hidden border border-border-default">
                      <button
                        onClick={() => setIsPreview(false)}
                        className="px-3 py-1 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
                      >
                        Edit
                      </button>
                      <button className="px-3 py-1 text-xs font-medium bg-surface-4 text-text-primary">
                        Preview
                      </button>
                    </div>
                    <button
                      onClick={handleDelete}
                      className="p-1 text-text-muted hover:text-accent-red rounded transition-colors"
                      title="Delete file"
                    >
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                      >
                        <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75zM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.15l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15zM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto">
                  <MarkdownPreview
                    content={fileContent}
                    path={selectedPath}
                  />
                </div>
              </div>
            ) : (
              <FileEditor
                path={selectedPath}
                content={fileContent}
                onSave={handleSave}
                onPreviewToggle={() => setIsPreview(true)}
                isPreview={false}
              />
            )
          ) : (
            /* Empty state */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md">
                <svg
                  className="w-12 h-12 text-text-muted mx-auto mb-4"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M0 1.75A.75.75 0 0 1 .75 1h4.253c1.227 0 2.317.59 3 1.501A3.743 3.743 0 0 1 11.006 1h4.245a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75h-4.507a2.25 2.25 0 0 0-1.591.659l-.622.621a.75.75 0 0 1-1.06 0l-.622-.621A2.25 2.25 0 0 0 5.258 13H.75a.75.75 0 0 1-.75-.75V1.75z" />
                </svg>
                <h2 className="text-lg font-semibold text-text-primary mb-2">
                  Company Knowledge Base
                </h2>
                <p className="text-sm text-text-secondary mb-4">
                  Select a document from the sidebar to view or edit.
                </p>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => setModalType("file")}
                    className="px-3 py-1.5 text-xs font-medium bg-accent-green text-surface-0 rounded-md hover:opacity-90 transition-opacity"
                  >
                    New Document
                  </button>
                  <button
                    onClick={() => setModalType("link")}
                    className="px-3 py-1.5 text-xs font-medium bg-surface-3 text-text-primary border border-border-default rounded-md hover:bg-surface-4 transition-colors"
                  >
                    Link External Resource
                  </button>
                  <button
                    onClick={() => setChatOpen(true)}
                    className="px-3 py-1.5 text-xs font-medium bg-accent-purple/20 text-accent-purple border border-accent-purple/30 rounded-md hover:bg-accent-purple/30 transition-colors"
                  >
                    Ask Agent
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Chat panel */}
        {chatOpen && (
          <aside className="w-80 flex-shrink-0 border-l border-border-default">
            <ChatPanel onClose={() => setChatOpen(false)} />
          </aside>
        )}
      </div>

      {/* Modals */}
      {modalType && (
        <CreateModal
          type={modalType}
          currentDir={getCurrentDir()}
          onClose={() => setModalType(null)}
          onCreate={handleCreate}
        />
      )}

      {/* Toast notifications */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-surface-2 border border-border-default rounded-lg px-4 py-2 text-sm text-text-primary shadow-lg animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}
