"use client";

import { useState } from "react";
import type { TreeNode } from "@/lib/types";

interface FileTreeProps {
  nodes: TreeNode[];
  selectedPath: string | null;
  onSelect: (path: string) => void;
  depth?: number;
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="currentColor"
      width="16"
      height="16"
    >
      <path d="M3.75 1.5a.25.25 0 0 0-.25.25v11.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25V6H9.75A1.75 1.75 0 0 1 8 4.25V1.5H3.75zm5.75.56v2.19c0 .138.112.25.25.25h2.19L9.5 2.06zM2 1.75C2 .784 2.784 0 3.75 0h5.086c.464 0 .909.184 1.237.513l3.414 3.414c.329.328.513.773.513 1.237v8.086A1.75 1.75 0 0 1 12.25 15h-8.5A1.75 1.75 0 0 1 2 13.25V1.75z" />
    </svg>
  );
}

function FolderIcon({
  open,
  className,
}: {
  open: boolean;
  className?: string;
}) {
  if (open) {
    return (
      <svg
        className={className}
        viewBox="0 0 16 16"
        fill="currentColor"
        width="16"
        height="16"
      >
        <path d="M.513 1.513A1.75 1.75 0 0 1 1.75 1h3.5c.63 0 1.238.205 1.738.58L8.178 2.5H14.25c.966 0 1.75.784 1.75 1.75v.5H0v-.5c0-.464.184-.909.513-1.237zM0 6.25v5c0 .966.784 1.75 1.75 1.75h12.5A1.75 1.75 0 0 0 16 11.25v-5H0z" />
      </svg>
    );
  }
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="currentColor"
      width="16"
      height="16"
    >
      <path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-8.5A1.75 1.75 0 0 0 14.25 3H7.5a.25.25 0 0 1-.2-.1l-.927-1.236A1.75 1.75 0 0 0 4.974 1H1.75z" />
    </svg>
  );
}

function TreeItem({
  node,
  selectedPath,
  onSelect,
  depth = 0,
}: {
  node: TreeNode;
  selectedPath: string | null;
  onSelect: (path: string) => void;
  depth: number;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const isSelected = selectedPath === node.path;
  const isDir = node.type === "directory";

  const handleClick = () => {
    if (isDir) {
      setExpanded(!expanded);
    } else {
      onSelect(node.path);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className={`w-full flex items-center gap-1.5 px-2 py-1 text-sm text-left rounded-md transition-colors ${
          isSelected
            ? "bg-surface-3 text-text-primary"
            : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        title={node.meta?.title || node.name}
      >
        {isDir ? (
          <>
            <svg
              className={`w-3 h-3 text-text-muted transition-transform ${
                expanded ? "rotate-90" : ""
              }`}
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06z" />
            </svg>
            <FolderIcon
              open={expanded}
              className="w-4 h-4 text-accent-blue flex-shrink-0"
            />
          </>
        ) : (
          <>
            <span className="w-3" />
            <FileIcon className="w-4 h-4 text-text-muted flex-shrink-0" />
          </>
        )}
        <span className="truncate">{node.name}</span>
        {node.meta?.source &&
          node.meta.source !== "manual" && (
            <span className="ml-auto text-[10px] text-text-muted bg-surface-3 px-1 rounded flex-shrink-0">
              {node.meta.source.replace("-sync", "")}
            </span>
          )}
      </button>
      {isDir && expanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeItem
              key={child.path}
              node={child}
              selectedPath={selectedPath}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileTree({
  nodes,
  selectedPath,
  onSelect,
  depth = 0,
}: FileTreeProps) {
  if (nodes.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-text-muted text-sm">
        No documents yet
      </div>
    );
  }

  return (
    <div className="py-1">
      {nodes.map((node) => (
        <TreeItem
          key={node.path}
          node={node}
          selectedPath={selectedPath}
          onSelect={onSelect}
          depth={depth}
        />
      ))}
    </div>
  );
}
