export interface TreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: TreeNode[];
  meta?: FileMeta;
}

export interface FileMeta {
  title?: string;
  category?: string;
  tags?: string[];
  owner?: string;
  last_updated?: string;
  source?: string;
  external_url?: string;
  external_type?: string;
}

export interface FileContent {
  path: string;
  content: string;
  meta?: FileMeta;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
}
