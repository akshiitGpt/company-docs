"use client";

import { useState, useEffect, useCallback } from "react";

interface FileEditorProps {
  path: string;
  content: string;
  onSave: (content: string) => Promise<void>;
  onPreviewToggle: () => void;
  isPreview: boolean;
}

export default function FileEditor({
  path,
  content: initialContent,
  onSave,
  onPreviewToggle,
  isPreview,
}: FileEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setContent(initialContent);
    setDirty(false);
  }, [initialContent, path]);

  const handleChange = (value: string) => {
    setContent(value);
    setDirty(value !== initialContent);
  };

  const handleSave = useCallback(async () => {
    if (!dirty || saving) return;
    setSaving(true);
    try {
      await onSave(content);
      setDirty(false);
    } finally {
      setSaving(false);
    }
  }, [content, dirty, saving, onSave]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave]);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface-1 border-b border-border-default">
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-secondary font-mono">
            {path}
          </span>
          {dirty && (
            <span className="w-2 h-2 rounded-full bg-accent-orange" />
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Edit / Preview toggle */}
          <div className="flex bg-surface-3 rounded-md overflow-hidden border border-border-default">
            <button
              onClick={() => isPreview && onPreviewToggle()}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                !isPreview
                  ? "bg-surface-4 text-text-primary"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => !isPreview && onPreviewToggle()}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                isPreview
                  ? "bg-surface-4 text-text-primary"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Preview
            </button>
          </div>
          <button
            onClick={handleSave}
            disabled={!dirty || saving}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              dirty && !saving
                ? "bg-accent-green text-surface-0 hover:opacity-90"
                : "bg-surface-3 text-text-muted cursor-not-allowed"
            }`}
          >
            {saving ? "Saving..." : "Save & Push"}
          </button>
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-hidden">
        <textarea
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          className="editor-textarea"
          spellCheck={false}
          placeholder="Start writing markdown..."
        />
      </div>
    </div>
  );
}
