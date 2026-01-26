/**
 * MCP Feedback Collector - 類型定義
 */

// 基礎配置類型
export interface Config {
  apiKey?: string | undefined;
  apiBaseUrl: string;
  defaultModel: string;
  webPort: number;
  dialogTimeout: number;
  corsOrigin: string;
  maxFileSize: number;
  logLevel: string;
  serverHost?: string | undefined;
  serverBaseUrl?: string | undefined;
  forcePort?: boolean | undefined;
  useFixedUrl?: boolean | undefined;
  enableImageToText?: boolean | undefined;
  imageToTextPrompt?: string | undefined;
}

// 反饋數據類型
export interface FeedbackData {
  text?: string;
  images?: ImageData[];
  imageDescriptions?: string[];
  timestamp: number;
  sessionId: string;
}

// 圖片數據類型
export interface ImageData {
  name: string;
  data: string; // Base64 編碼
  size: number;
  type: string;
}

// 工作彙報類型
export interface WorkSummary {
  content: string;
  timestamp: number;
  sessionId: string;
}

// MCP 工具函數參數類型
export interface CollectFeedbackParams {
  work_summary: string;
  timeout_seconds?: number;
}

// MCP 內容類型 - 符合 MCP 協議標準
export interface TextContent {
  type: 'text';
  text: string;
}

export interface ImageContent {
  type: 'image';
  data: string;
  mimeType: string;
}

// MCP 內容聯合類型
export type MCPContent = TextContent | ImageContent;

// MCP 工具函數返回類型
export interface CollectFeedbackResult {
  [x: string]: unknown;
  content: MCPContent[];
  isError?: boolean;
}

// WebSocket 事件類型
export interface SocketEvents {
  connect: () => void;
  disconnect: () => void;
  start_feedback_session: (data: { sessionId: string; workSummary: string }) => void;
  submit_feedback: (data: FeedbackData) => void;
  feedback_submitted: (data: { success: boolean; message?: string }) => void;
  feedback_error: (data: { error: string }) => void;
  work_summary_data: (data: { work_summary: string }) => void;
}

// 服務器狀態類型
export interface ServerStatus {
  running: boolean;
  webPort: number;
  startTime: number;
  activeSessions: number;
}

// 會話管理類型
export interface Session {
  id: string;
  workSummary?: string;
  feedback?: FeedbackData;
  startTime: number;
  timeout: number;
  status: 'pending' | 'active' | 'completed' | 'timeout' | 'error';
  resolve?: (feedback: FeedbackData) => void;
  reject?: (error: Error) => void;
}

// 錯誤類型
export class MCPError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'MCPError';
  }
}

// 日誌級別類型
export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'silent';

// API 配置類型
export interface APIConfig {
  apiKey?: string;
  apiBaseUrl: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}
