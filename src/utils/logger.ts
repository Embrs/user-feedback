/**
 * MCP Feedback Collector - 日誌工具
 */

import fs from 'fs';
import path from 'path';
import { LogLevel } from '../types/index.js';

// 日誌級別優先級
const LOG_LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  silent: 999
};

// 日誌顏色
const LOG_COLORS: Record<LogLevel, string> = {
  error: '\x1b[31m', // 紅色
  warn: '\x1b[33m',  // 黃色
  info: '\x1b[36m',  // 青色
  debug: '\x1b[37m', // 白色
  silent: ''
};

const RESET_COLOR = '\x1b[0m';

class Logger {
  private currentLevel: LogLevel = 'info';
  private logFile?: string;
  private fileLoggingEnabled = false;
  private colorsDisabled = false;

  /**
   * 設置日誌級別
   */
  setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  /**
   * 獲取當前日誌級別
   */
  getLevel(): LogLevel {
    return this.currentLevel;
  }

  /**
   * 禁用顏色輸出（用於 MCP 模式）
   */
  disableColors(): void {
    this.colorsDisabled = true;
  }

  /**
   * 啟用檔案日誌記錄
   */
  enableFileLogging(logDir: string = 'logs'): void {
    try {
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      this.logFile = path.join(logDir, `mcp-debug-${timestamp}.log`);
      this.fileLoggingEnabled = true;

      const header = `=== MCP Feedback Collector Debug Log ===\n` +
                    `Start Time: ${new Date().toISOString()}\n` +
                    `Log Level: ${this.currentLevel}\n` +
                    `==========================================\n\n`;

      fs.writeFileSync(this.logFile, header);
      console.log(`日誌檔案已建立: ${this.logFile}`);
    } catch (error) {
      console.error('無法建立日誌檔案:', error);
      this.fileLoggingEnabled = false;
    }
  }

  /**
   * 檢查是否應該輸出指定級別的日誌
   */
  private shouldLog(level: LogLevel): boolean {
    if (this.currentLevel === 'silent') {
      return false;
    }
    return LOG_LEVELS[level] <= LOG_LEVELS[this.currentLevel];
  }

  /**
   * 格式化時間戳
   */
  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * 格式化日誌訊息
   */
  private formatMessage(level: LogLevel, message: string, ...args: unknown[]): string {
    const timestamp = this.formatTimestamp();
    const levelStr = level.toUpperCase().padEnd(5);

    let formattedMessage: string;

    if (this.colorsDisabled) {
      formattedMessage = `[${timestamp}] ${levelStr} ${message}`;
    } else {
      const color = LOG_COLORS[level];
      formattedMessage = `${color}[${timestamp}] ${levelStr}${RESET_COLOR} ${message}`;
    }

    if (args.length > 0) {
      const argsStr = args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      formattedMessage += ` ${argsStr}`;
    }

    return formattedMessage;
  }

  /**
   * 輸出日誌
   */
  private log(level: LogLevel, message: string, ...args: unknown[]): void {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, ...args);

    if (level === 'error') {
      console.error(formattedMessage);
    } else if (level === 'warn') {
      console.warn(formattedMessage);
    } else {
      console.log(formattedMessage);
    }

    if (this.fileLoggingEnabled && this.logFile) {
      try {
        const cleanMessage = this.removeColorCodes(formattedMessage);
        fs.appendFileSync(this.logFile, cleanMessage + '\n');
      } catch (error) {
        console.error('寫入日誌檔案失敗:', error);
      }
    }
  }

  /**
   * 移除顏色代碼
   */
  private removeColorCodes(text: string): string {
    return text.replace(/\x1b\[[0-9;]*m/g, '');
  }

  /**
   * 錯誤日誌
   */
  error(message: string, ...args: unknown[]): void {
    this.log('error', message, ...args);
  }

  /**
   * 警告日誌
   */
  warn(message: string, ...args: unknown[]): void {
    this.log('warn', message, ...args);
  }

  /**
   * 資訊日誌
   */
  info(message: string, ...args: unknown[]): void {
    this.log('info', message, ...args);
  }

  /**
   * 除錯日誌
   */
  debug(message: string, ...args: unknown[]): void {
    this.log('debug', message, ...args);
  }

  /**
   * 記錄 HTTP 請求
   */
  request(method: string, url: string, statusCode?: number, duration?: number): void {
    const parts = [method.toUpperCase(), url];
    if (statusCode !== undefined) parts.push(`${statusCode}`);
    if (duration !== undefined) parts.push(`${duration}ms`);
    
    this.info(`HTTP ${parts.join(' ')}`);
  }

  /**
   * 記錄 WebSocket 事件
   */
  socket(event: string, sessionId?: string, data?: unknown): void {
    const parts = ['WebSocket', event];
    if (sessionId) parts.push(`session:${sessionId}`);
    
    this.debug(parts.join(' '), data);
  }

  /**
   * 記錄 MCP 工具調用
   */
  mcp(tool: string, params?: unknown, result?: unknown): void {
    this.info(`MCP Tool: ${tool}`, { params, result });
  }
}

// 建立全域日誌實例
export const logger = new Logger();

// 導出日誌級別類型
export type { LogLevel };
