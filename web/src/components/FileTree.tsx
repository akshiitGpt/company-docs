"use client";

import { useState } from "react";
import type { TreeNode } from "@/lib/types";

interface FileTreeProps {
  nodes: TreeNode[];
  selectedPath: string | null;
  onSelect: (path: string) => void;
  depth?: number;
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

  return (
    <div>
      <button
        onClick={() => (isDir ? setExpanded(!expanded) : onSelect(node.path))}
        className={`group w-full flex items-center gap-2 px-2 py-[5px] text-[13px] rounded-sm transition-all duration-150 ${
          isSelected
            ? "bg-accent/[0.07] text-accent-text font-medium"
            : "text-secondary hover:bg-surface-hover hover:text-primary"
        }`}
        style={{ paddingLeft: `${depth * 18 + 8}px` }}
      >
        {isDir ? (
          <svg
            className={`w-3.5 h-3.5 text-muted transition-transform duration-150 flex-shrink-0 ${
              expanded ? "rotate-90" : ""
            }`}
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06z" />
          </svg>
        ) : (
          <span className="w-3.5" />
        )}

        {isDir ? (
          <svg
            className="w-4 h-4 flex-shrink-0 text-warn"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M3.75 3A1.75 1.75 0 0 0 2 4.75v3.26a3.235 3.235 0 0 1 1.75-.51h12.5c.644 0 1.245.188 1.75.51V6.75A1.75 1.75 0 0 0 16.25 5h-4.836a.25.25 0 0 1-.177-.073L9.823 3.513A1.75 1.75 0 0 0 8.586 3H3.75zM3.75 9A1.75 1.75 0 0 0 2 10.75v4.5c0 .966.784 1.75 1.75 1.75h12.5A1.75 1.75 0 0 0 18 15.25v-4.5A1.75 1.75 0 0 0 16.25 9H3.75z" />
          </svg>
        ) : (
          <svg
            className={`w-4 h-4 flex-shrink-0 ${
              isSelected ? "text-accent" : "text-muted"
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5z"
              clipRule="evenodd"
            />
          </svg>
        )}

        <span className="truncate">{node.name.replace(/\.md$/, "")}</span>

        {!isDir &&
          node.meta?.source &&
          node.meta.source !== "manual" && (
            <span className="ml-auto text-[10px] text-muted opacity-0 group-hover:opacity-100 transition-opacity">
              {node.meta.source.replace("-sync", "")}
            </span>
          )}
      </button>

      {isDir && expanded && node.children && (
        <div className={depth > 0 ? "tree-indent" : ""}>
          {node.children.map((child) => (
            <TreeItem
              key={child.path}
              node={child}
              selectedPath={selectedPath}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
          {node.children.length === 0 && (
            <div
              className="text-[11px] text-muted italic py-1"
              style={{ paddingLeft: `${(depth + 1) * 18 + 30}px` }}
            >
              Empty
            </div>
          )}
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
      <div className="px-4 py-12 text-center">
        <p className="text-muted text-sm">No documents yet</p>
      </div>
    );
  }

  return (
    <div className="py-1 px-1">
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
