"use client";

import { useState, useEffect, useCallback } from "react";

interface FileEditorProps {
  path: string;
  content: string;
  onSave: (content: string) => Promise<void>;
  onPreviewToggle: () => void;
}

export default function FileEditor({
  path,
  content: initialContent,
  onSave,
  onPreviewToggle,
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
    <div className="flex flex-col h-full fade-in">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-surface border-b border-border-light">
        <div className="flex items-center gap-2.5">
          <span className="text-[13px] text-secondary font-mono">
            {path}
          </span>
          {dirty && (
            <span className="inline-flex items-center gap-1 text-[11px] text-warn bg-warn-bg px-1.5 py-0.5 rounded-sm font-medium">
              Unsaved
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onPreviewToggle}
            className="px-3 py-1.5 text-[12px] font-medium text-secondary hover:text-primary bg-surface-subtle hover:bg-surface-active rounded-sm transition-colors"
          >
            Preview
          </button>
          <button
            onClick={handleSave}
            disabled={!dirty || saving}
            className={`px-3.5 py-1.5 text-[12px] font-medium rounded-sm transition-all ${
              dirty && !saving
                ? "bg-accent text-white hover:bg-accent-hover shadow-xs"
                : "bg-surface-subtle text-muted cursor-not-allowed"
            }`}
          >
            {saving ? "Saving..." : "Save & Push"}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden bg-surface">
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
