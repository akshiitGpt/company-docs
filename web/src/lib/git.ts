import simpleGit, { SimpleGit } from "simple-git";
import path from "path";
import fs from "fs/promises";
import matter from "gray-matter";
import type { TreeNode, FileMeta, FileContent } from "./types";

const REPO_PATH =
  process.env.COMPANY_DOCS_HOME ||
  path.resolve(process.cwd(), "..");
const KB_PATH = path.join(REPO_PATH, "knowledge-base");

function getGit(): SimpleGit {
  return simpleGit(REPO_PATH);
}

export function getKBPath(): string {
  return KB_PATH;
}

export function sanitizePath(p: string): string {
  const normalized = path.normalize(p).replace(/^(\.\.(\/|\\|$))+/, "");
  if (normalized.includes("..")) {
    throw new Error("Invalid path: directory traversal not allowed");
  }
  return normalized;
}

export async function pullLatest(): Promise<string> {
  const git = getGit();
  try {
    const result = await git.pull("origin", "master", {
      "--ff-only": null,
    });
    return `Pulled: ${result.summary.changes} changes, ${result.summary.insertions} insertions, ${result.summary.deletions} deletions`;
  } catch {
    return "Pull skipped (no remote or not tracking)";
  }
}

export async function commitAndPush(message: string): Promise<string> {
  const git = getGit();
  await git.add("knowledge-base/");
  const status = await git.status();

  if (
    status.staged.length === 0 &&
    status.modified.length === 0 &&
    status.created.length === 0
  ) {
    return "No changes to commit";
  }

  await git.commit(message);

  try {
    await git.push("origin", "master");
    return "Committed and pushed";
  } catch {
    return "Committed locally (push failed — check remote config)";
  }
}

export async function getGitStatus(): Promise<{
  branch: string;
  modified: number;
  staged: number;
  ahead: number;
}> {
  const git = getGit();
  try {
    const status = await git.status();
    return {
      branch: status.current || "unknown",
      modified: status.modified.length + status.not_added.length,
      staged: status.staged.length,
      ahead: status.ahead,
    };
  } catch {
    return { branch: "unknown", modified: 0, staged: 0, ahead: 0 };
  }
}

export async function getFileTree(
  dir: string = KB_PATH,
  basePath: string = ""
): Promise<TreeNode[]> {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const nodes: TreeNode[] = [];

  const sorted = entries.sort((a, b) => {
    if (a.isDirectory() && !b.isDirectory()) return -1;
    if (!a.isDirectory() && b.isDirectory()) return 1;
    return a.name.localeCompare(b.name);
  });

  for (const entry of sorted) {
    if (entry.name.startsWith(".")) continue;

    const relativePath = basePath
      ? `${basePath}/${entry.name}`
      : entry.name;

    if (entry.isDirectory()) {
      const children = await getFileTree(
        path.join(dir, entry.name),
        relativePath
      );
      nodes.push({
        name: entry.name,
        path: relativePath,
        type: "directory",
        children,
      });
    } else if (entry.name.endsWith(".md")) {
      let meta: FileMeta | undefined;
      try {
        const content = await fs.readFile(
          path.join(dir, entry.name),
          "utf-8"
        );
        const { data } = matter(content);
        meta = data as FileMeta;
      } catch {
        // skip meta if parse fails
      }
      nodes.push({
        name: entry.name,
        path: relativePath,
        type: "file",
        meta,
      });
    }
  }

  return nodes;
}

export async function readFile(relativePath: string): Promise<FileContent> {
  const safe = sanitizePath(relativePath);
  const fullPath = path.join(KB_PATH, safe);
  const content = await fs.readFile(fullPath, "utf-8");
  const { data } = matter(content);
  return {
    path: safe,
    content,
    meta: data as FileMeta,
  };
}

export async function writeFile(
  relativePath: string,
  content: string
): Promise<void> {
  const safe = sanitizePath(relativePath);
  const fullPath = path.join(KB_PATH, safe);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, content, "utf-8");
}

export async function deleteFile(relativePath: string): Promise<void> {
  const safe = sanitizePath(relativePath);
  const fullPath = path.join(KB_PATH, safe);
  await fs.unlink(fullPath);
}

export async function createDirectory(
  relativePath: string
): Promise<void> {
  const safe = sanitizePath(relativePath);
  const fullPath = path.join(KB_PATH, safe);
  await fs.mkdir(fullPath, { recursive: true });
  await fs.writeFile(path.join(fullPath, ".gitkeep"), "", "utf-8");
}

export async function fileExists(relativePath: string): Promise<boolean> {
  const safe = sanitizePath(relativePath);
  const fullPath = path.join(KB_PATH, safe);
  try {
    await fs.access(fullPath);
    return true;
  } catch {
    return false;
  }
}
